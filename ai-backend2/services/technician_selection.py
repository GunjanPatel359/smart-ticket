"""
Technician selection service - Select the best technician for a ticket based on skills and availability
"""
import json
import logging
from typing import List, Dict, Any, Optional, Tuple
from langchain.prompts import PromptTemplate
from langchain_google_genai import ChatGoogleGenerativeAI
from langchain_core.output_parsers import JsonOutputParser
from models.ticket import Ticket
from models.skill import Skill
from models.technician import Technician

logger = logging.getLogger(__name__)


def select_best_technician_for_ticket(
    ticket: Ticket,
    available_technicians: List[Technician],
    required_skills: List[Skill],
    llm: ChatGoogleGenerativeAI
) -> Tuple[Optional[Technician], str]:
    """
    Single-function implementation of the technician selection process using an LLM.
    This replaces the TechnicianSelectionService class entirely.
    """

    try:
        logger.info(f"Selecting technician for ticket: {ticket.subject}")

        # --- Step 1: Setup prompt and parser ---
        json_parser = JsonOutputParser()
        technician_selection_prompt = PromptTemplate(
            template="""
                LLM Prompt: The Intelligent Ticket Assignment System

                Your Role: You are an advanced AI-powered Ticket Assignment System. Your primary function is to analyze an incoming support ticket and a list of available technicians to determine the single best technician for the job. You must follow a strict set of rules to ensure efficiency, proper skill utilization, and timely resolution of issues.

                Input Data Structure:  
                You will be given two JSON objects: `technicians` and `ticket`.

                - `technicians`: An array of objects, where each object represents a technician with the following structure.
                - `ticket`: An object representing the ticket to be assigned.

                Assignment Rules & Logic:  
                You must follow these rules in order. The first rule that matches the ticket's priority dictates the assignment logic.

                **Rule 1: Critical Priority Tickets**  
                If `ticket.priority` is `"critical"`:
                - **Identify Specialists**: Immediately filter the technician list to find those whose specialization matches the core issue described in the ticket's `name` and `description`.
                - **Select the Expert**: From that filtered list, assign the ticket to a technician with a `skill_level` of `"experienced"`.
                - **Override Other Factors**: For critical tickets, ignore both `workload` and `availability_status`. The urgency of the ticket is the only thing that matters. If multiple experienced specialists exist, select the one with the lower workload.

                **Rule 2: High & Medium Priority Tickets**  
                If `ticket.priority` is `"high"` or `"medium"`:
                - **Filter by Availability**: First, filter the list to exclude all the technicians with `availability_status` of `"unavailable"`.
                - **Calculate Suitability Score**: For each available technician, calculate a Suitability Score using the following weighted formula:  
                `Score = (0.6 * Skill_Match_Score) + (0.4 * Workload_Score)`

                - *Skill_Match_Score* (0 to 1 scale):  
                    Count how many of the `ticket.required_skills` the technician possesses.  
                    Calculate the average percentage of those matching skills.  
                    Final `Skill_Match_Score` = (count_of_matching_skills / total_required_skills) * (average_percentage / 100).  
                    A technician who has most of the required skills with a high percentage will score the highest.

                - *Workload_Score* (0 to 1 scale):  
                    This score is inversely related to the technician's workload. A lower workload is better.  
                    Calculate it as: `1 - workload`.  
                    A technician with a workload of 0.2 gets a score of 0.8.

                - **Assign to Highest Score**: Assign the ticket to the technician with the highest final Suitability Score.

                **Rule 3: Low Priority Tickets**  
                If `ticket.priority` is `"low"`:
                - **Training Opportunity**: These tickets are ideal for skill development. You should primarily consider technicians with a `skill_level` of `"junior"` or `"mid"`.
                - **Apply Standard Scoring**: Use the same Suitability Score formula from Rule 2 to find the best fit among junior and mid-level technicians who are `"available"`. This ensures they are still qualified, but gives them the opportunity before it goes to an experienced technician.
                - **Fallback**: If no junior or mid-level technicians are available or qualified, then evaluate experienced technicians using the same scoring logic.

                Output Format Requirements:

                Your final output must be a single JSON object containing the ID of the chosen technician and a clear, detailed, and pointwise justification for your choice.

                CRITICAL INSTRUCTIONS FOR JUSTIFICATION:

                **STRICTLY PROHIBITED ELEMENTS - NEVER INCLUDE THESE:**
                - NO SKILL IDs (e.g., "Skill ID 42", "Skill ID 26") - Always use actual skill names
                - NO TECHNICIAN IDs in justification text (only in the selected_technician_id field)
                - NO TICKET IDs or internal reference numbers
                - NO RULE NUMBERS (e.g., "Rule 2", "High & Medium Priority Rule")
                - NO TECHNICAL METADATA or system-generated codes
                - NO PERCENTAGE VALUES IN PARENTHESES after skill names (e.g., "Access Control (92%)")
                - NO NUMERICAL SCORES or calculations in the justification text

                **REQUIRED JUSTIFICATION FORMAT:**
                - Each point must start on a new line with a bullet point or number
                - Use only human-readable skill names (e.g., "Network Security", "Database Management", "Active Directory")
                - Reference availability status in plain English (e.g., "currently available", "busy")
                - Mention skill level in descriptive terms (e.g., "experienced specialist", "mid-level technician")
                - Describe workload in general terms (e.g., "low current workload", "moderate workload")
                - Keep language professional and presentable to end-users
                - Focus on business rationale rather than technical calculations
                - Keep the justification detailed and pointwise considering every scenarios.

                Example Output:
                {{
                    "selected_technician_id": 10,
                    "justification": "• Assigned to handle this critical network security incident\\n• Technician is an experienced specialist in Network Security with proven expertise\\n• Possesses all required skills including Firewall Management and Intrusion Detection\\n• Currently available and has low workload to ensure immediate response\\n• Strong track record in resolving similar high-impact security issues"
                }}

                **Input:**

                Ticket Data  
                Name: {ticket_name}  
                Description: {ticket_description}  
                Priority: {ticket_priority}  

                Skills required for the ticket:  
                {required_skills}

                Technicians:  
                {available_technicians}
            """,
            input_variables=["ticket_name", "ticket_description", "ticket_priority", "available_technicians", "required_skills"]
        )

        # --- Step 2: Helper formatters ---
        def _format_skills(skills: List[Skill]) -> str:
            return "\n".join(f"- {skill.name}" for skill in skills)

        def _format_technicians_for_prompt(technicians: List[Technician]) -> str:
            lines = []
            for tech in technicians:
                # Format skills properly
                skills_str = ", ".join([f"{ts.skill.name} ({ts.score}%)" for ts in tech.technicianSkills]) if tech.technicianSkills else "No skills"
                
                info = [
                    f"- ID: {tech.id}, Name: {tech.name}",
                    f"Workload: {tech.workload}%",
                    f"Skills: {skills_str}",
                    f"Skill Level: {tech.technicianLevel.value}",
                    f"Availability: {tech.availabilityStatus.value}"
                ]
                lines.append(", ".join(info))
            return "\n".join(lines)

        def _find_technician_by_id(technicians: List[Technician], technician_id: int) -> Optional[Technician]:
            return next((t for t in technicians if t.id == technician_id), None)

        def _parse_llm_response(content: str) -> Dict[str, Any]:
            try:
                return json_parser.parse(str(content))
            except Exception:
                try:
                    return json.loads(str(content))
                except json.JSONDecodeError as je:
                    logger.error(f"Invalid JSON from LLM: {content}")
                    raise ValueError(f"Invalid JSON response from LLM: {str(je)}")

        # --- Step 3: Prepare data ---
        required_skills_text = _format_skills(required_skills)
        technicians_text = _format_technicians_for_prompt(available_technicians)

        prompt = technician_selection_prompt.format(
            ticket_name=ticket.subject,
            ticket_description=ticket.description,
            ticket_priority=ticket.priority,
            available_technicians=technicians_text,
            required_skills=required_skills_text
        )

        # --- Step 4: Send to LLM ---
        logger.info("Sending technician selection prompt to LLM")
        response = llm.invoke(prompt)

        # --- Step 5: Parse response ---
        result_data = _parse_llm_response(str(response.content))
        selected_technician_id = result_data["selected_technician_id"]
        justification = result_data["justification"]

        selected_technician = _find_technician_by_id(available_technicians, selected_technician_id)

        if selected_technician:
            logger.info(
                f"Technician selected: {selected_technician.name} (ID: {selected_technician.id}) "
                f"with justification: {justification}"
            )
        else:
            logger.warning(f"LLM selected technician ID {selected_technician_id} not found in available technicians")

        return selected_technician, justification

    except Exception as e:
        logger.error(f"Error during technician selection: {str(e)}")
        return None, f"Error during technician selection: {str(e)}"
