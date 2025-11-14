"""
NeuroDesk LLM Wrapper API
Main Flask application for ticket assignment workflow - Step 1
"""
from dotenv import load_dotenv
from flask import Flask, request, jsonify
from flask_cors import CORS
from langchain_google_genai import ChatGoogleGenerativeAI
import logging
import os
from models.ticket import Ticket
from models.skill import Skill
from models.technician import Technician
from services.skill_extraction import extract_skills_from_ticket as extract_skills_from_ticket_single
from services.technician_selection import select_best_technician_for_ticket
import requests
import json

load_dotenv()

logging.basicConfig(
    level=getattr(logging, os.environ.get("LOG_LEVEL", "INFO")),
    format='%(asctime)s - %(name)s - %(levelname)s - %(message)s'
)
logger = logging.getLogger(__name__)

# Initialize Flask app
app = Flask(__name__)

CORS(app, resources={
    r"/*": {
        "origins": "*",
        "methods": ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
        "allow_headers": ["Content-Type", "Authorization", "X-Requested-With"]
    }
})

# Initialize Gemini model
llm = ChatGoogleGenerativeAI(
    model=os.environ.get("GOOGLE_MODEL", "gemini-2.5-flash"),
    temperature=float(os.environ.get("GOOGLE_TEMPERATURE", 0.1)),
    google_api_key=os.environ.get("GOOGLE_API_KEY") # type: ignore
)
backend_url = os.environ.get("BACKEND_SERVER_URL")

@app.route("/", methods=["GET"])
def home():
    """Home endpoint with API information"""
    return jsonify({
        "message": "NeuroDesk LLM Wrapper API",
        "version": "1.0.0",
        "status": "active",
        "endpoints": {
            "health": "/health",
            "ticket_assignment": "/api/ticket-assignment",
            "service_status": "/api/service-status"
        },
        "required_request_fields": ["ticket", "skills"]
    })

@app.route("/health", methods=["GET"])
def health_check():
    """Health check endpoint"""
    return jsonify({
        "status": "healthy",
        "llm_available": os.environ.get("GOOGLE_API_KEY") is not None,
        "service": "NeuroDesk LLM Wrapper"
    })

@app.route("/api/ticket-assignment", methods=["POST"])
def ticket_assignment():
    """
    Handles incoming ticket assignment requests.
    Steps:
    1. Validate input JSON
    2. Fetch available skills from backend
    3. Extract required skills using LLM
    4. Select best technician using LLM
    5. Return structured response
    """
    print("Received ticket assignment request")

    try:
        if not request.is_json:
            return jsonify({"error": "Content-Type must be application/json"}), 400

        request_data = request.get_json()
        logger.info(f"Processing ticket assignment for: {request_data}")

        # ✅ Step 1: Validate ticket
        raw_ticket = request_data.get("ticket")
        if not raw_ticket:
            return jsonify({"error": "Missing 'ticket' field in request"}), 400

        ticket = Ticket.model_validate(raw_ticket)

        # ✅ Step 2: Fetch skills from backend
        backend_url = os.environ.get("BACKEND_SERVER_URL")
        skills_url = f"{backend_url}/api/v1/skills/all"

        skills_response = requests.get(skills_url, timeout=10)
        skills_response.raise_for_status()
        skills_data = skills_response.json().get("data", {}).get("skills", [])

        if not skills_data:
            return jsonify({"error": "Failed to fetch skills from backend"}), 500

        available_skills = [s.get("name") for s in skills_data if "name" in s]

        # ✅ Step 3: Extract skills using your single-function version
        skill_extraction_result = extract_skills_from_ticket_single(
            ticket=ticket,
            available_skills=available_skills,
            llm=llm
        )

        existing_skills = skill_extraction_result.existing_skills
        new_skills = [ns.dict() for ns in skill_extraction_result.new_skills]

        print(json.dumps(existing_skills), json.dumps(new_skills))
        # ✅ Step 4: Fetch technicians
        technicians_url = f"{backend_url}/api/v1/technicians/all"
        technicians_response = requests.get(technicians_url, timeout=10)
        technicians_response.raise_for_status()
        technicians_data = technicians_response.json().get("data", {}).get("technicians", [])

        if not technicians_data:
            return jsonify({"error": "Failed to fetch technicians from backend"}), 500
        
        print("Technicians data:", json.dumps(technicians_data))
        available_technicians = [Technician.model_validate(t) for t in technicians_data]

        # ✅ Step 5: Select best technician
        selected_technician, justification = select_best_technician_for_ticket(
            ticket=ticket,
            available_technicians=available_technicians,
            required_skills=[Skill(id=None, name=s, category=None, description=None) for s in existing_skills],
            llm=llm
        )

        if not selected_technician:
            return jsonify({"error": "No suitable technician found"}), 404

        # ✅ Step 6: Build and return response
        response = {
            "ticket_subject": ticket.subject,
            "existing_skills": existing_skills,
            "new_skills": new_skills,
            "assigned_technician_id": selected_technician.id,
            "selected_technician_id": selected_technician.id,  # Alternative field name
            "technician_name": selected_technician.name,
            "justification": justification
        }

        return jsonify(response), 200

    except Exception as e:
        logger.error(f"Error in ticket assignment: {str(e)}", exc_info=True)
        return jsonify({"error": str(e)}), 500



if __name__ == "__main__":
    logger.info("Starting NeuroDesk LLM Wrapper API")
    app.run(
        use_reloader=True,
        host='0.0.0.0',
        port=int(os.environ.get("PORT", 5000)),
        debug=os.environ.get("DEBUG", "False").lower() == "true"
    )