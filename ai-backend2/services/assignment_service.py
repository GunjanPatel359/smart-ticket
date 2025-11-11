"""
Main assignment service - Step 1: Extract skills from ticket using provided skills list
"""
from datetime import datetime
import logging
import requests
import os
from typing import Dict, Any
from langchain_google_genai import ChatGoogleGenerativeAI
from models.ticket import Ticket, TicketAssignmentResponse
from models.skill import Skill
from services.skill_extraction import extract_skills_from_ticket  # ✅ using the single-function version above

logger = logging.getLogger(__name__)


def process_ticket_assignment(request_data: Dict[str, Any], llm: ChatGoogleGenerativeAI) -> TicketAssignmentResponse:
    """
    Single-function implementation of the ticket assignment process (Step 1 only):
    Extract skills from the ticket using the provided skills list and LLM.
    """

    try:
        logger.info("Starting ticket assignment process - Step 1")

        # --- STEP 1: Extract and validate ticket ---
        ticket_data = request_data.get("ticket", request_data)
        required_fields = ["subject", "description", "id"]
        missing_fields = [f for f in required_fields if f not in ticket_data]
        if missing_fields:
            raise ValueError(f"Missing required ticket fields: {missing_fields}")

        subject = ticket_data.get("subject", "")
        description = ticket_data.get("description", "")
        requester_id = ticket_data.get("requesterId")

        ticket = Ticket(
            id=ticket_data["id"],
            subject=subject,
            description=description,
            requester_id=requester_id,
            priority=ticket_data.get("priority", "normal"),
            impact=ticket_data.get("impact", "medium"),
            urgency=ticket_data.get("urgency", "normal"),
            tags=ticket_data.get("tags", []),
            resolution_due=ticket_data.get("resolution_due"),
            first_response_time=ticket_data.get("first_response_time"),
            resolution_time=ticket_data.get("resolution_time"),
            assigned_technician_id=ticket_data.get("assigned_technician_id"),
            resolved_at=ticket_data.get("resolved_at"),
            closed_at=ticket_data.get("closed_at"),
            satisfaction_rating=ticket_data.get("satisfaction_rating"),
            feedback=ticket_data.get("feedback")
        )

        logger.info(f"Validated ticket: {ticket.subject}")

        # --- STEP 2: Fetch available skills from backend ---
        backend_url = os.environ.get("BACKEND_SERVER_URL", "http://localhost:5001")
        logger.info(f"Fetching available skills from {backend_url}/api/v1/skills/all")

        response = requests.get(f"{backend_url}/api/v1/skills/all", timeout=10)
        response.raise_for_status()
        skills_data = response.json()

        available_skills = []
        for skill_item in skills_data["data"]["skills"]:
            try:
                available_skills.append(Skill(**skill_item))
            except Exception as e:
                logger.warning(f"Skipping invalid skill record: {skill_item}, error: {str(e)}")

        available_skill_names = [s.name for s in available_skills]
        logger.info(f"Fetched {len(available_skills)} skills from backend")

        # --- STEP 3: Extract skills using LLM ---
        extracted_skills = extract_skills_from_ticket(ticket, available_skill_names, llm)
        logger.info(f"Extracted skills from ticket: {extracted_skills}")

        # --- STEP 4: Convert extracted skill names to Skill objects ---
        existing_skill_objs = [
            s for s in available_skills if s.name.lower() in [x.lower() for x in extracted_skills.existing_skills]
        ]

        # --- STEP 5: Notify backend of extracted skills ---
        notify_data = [
            {"id": s.id, "name": s.name, "description": s.description} for s in existing_skill_objs
        ]
        for s in extracted_skills.new_skills:
            notify_data.append({"name": s.name, "description": s.description})

        try:
            notify_resp = requests.post(
                f"{backend_url}/api/v1/tickets/process-skills",
                json={"ticket_id": ticket.id, "skills": notify_data},
                timeout=10
            )
            notify_resp.raise_for_status()
            if not notify_resp.json().get("success", False):
                logger.warning("Backend did not acknowledge skill processing successfully.")
        except Exception as e:
            logger.error(f"Failed to notify backend of extracted skills: {str(e)}")

        # --- STEP 6: Return response ---
        return TicketAssignmentResponse(
            success=True,
            selected_technician_id=None,  # technician selection happens in next steps
            justification="Skills successfully extracted and sent to backend.",
            error_message=None
        )

    except Exception as e:
        logger.error(f"Error in ticket assignment step 1: {str(e)}")
        return TicketAssignmentResponse(
            success=False,
            selected_technician_id=None,
            justification=None,
            error_message=str(e)
        )
