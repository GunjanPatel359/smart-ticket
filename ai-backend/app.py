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

# Import our custom modules
from services.assignment_service import AssignmentService
from services.evaluation_service import EvaluationService

load_dotenv()
# Configure logging
logging.basicConfig(
    level=getattr(logging, os.environ.get("LOG_LEVEL", "INFO")),
    format='%(asctime)s - %(name)s - %(levelname)s - %(message)s'
)
logger = logging.getLogger(__name__)

# Initialize Flask app
app = Flask(__name__)

# Configure CORS to allow all origins
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
    google_api_key=os.environ.get("GOOGLE_API_KEY")
)

# Initialize assignment service
assignment_service = AssignmentService(llm)

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

@app.route("/api/service-status", methods=["GET"])
def service_status():
    """Get assignment service status"""
    status = assignment_service.get_assignment_status()
    return jsonify(status)

@app.route("/api/ticket-assignment", methods=["POST"])
def ticket_assignment():
    print("Received ticket assignment request")
    try:
        if not request.is_json:
            return jsonify({"error": "Content-Type must be application/json"}), 400

        request_data = request.get_json()
        logger.info(f"Processing ticket assignment for: {request_data.get('subject', 'Unknown')}")

        result = assignment_service.process_ticket_assignment(request_data)
        response_dict = result.model_dump()

        return jsonify(response_dict)

    except Exception as e:
        logger.error(f"Error processing ticket assignment: {str(e)}")
        return jsonify({
            "success": False,
            "error": "Internal server error",
            "message": str(e)
        }), 500

@app.route("/api/validate-request", methods=["POST"])
def validate_request():
    try:
        if not request.is_json:
            return jsonify({"error": "Content-Type must be application/json"}), 400

        request_data = request.get_json()
        validation_result = assignment_service.validate_request_data(request_data)
        return jsonify(validation_result)

    except Exception as e:
        logger.error(f"Error validating request: {str(e)}")
        return jsonify({
            "valid": False,
            "errors": [f"Validation error: {str(e)}"],
            "warnings": []
        }), 500

@app.route("/api/evaluate-skills", methods=["POST"])
def evaluate_skills():
    try:
        if not request.is_json:
            return jsonify({"error": "Content-Type must be application/json"}), 400

        data = request.get_json()
        if 'ticket' not in data:
            return jsonify({"error": "Request must include ticket data"}), 400

        ticket = data['ticket']

        required_fields = ['subject', 'description', 'assigned_technician_id', 'required_skills']
        missing_fields = [field for field in required_fields if field not in ticket]
        if missing_fields:
            return jsonify({"error": "Missing required fields", "missing": missing_fields}), 400

        evaluation_service = EvaluationService(llm)

        try:
            technicians = evaluation_service.get_technicians()
            technician = next(
                (t for t in technicians if t['id'] == ticket['assigned_technician_id']),
                None
            )
            if not technician:
                return jsonify({"error": f"Technician {ticket['assigned_technician_id']} not found"}), 404
        except Exception as e:
            return jsonify({"error": "Error fetching technician data", "message": str(e)}), 500

        metrics = evaluation_service.calculate_metrics(ticket)

        result = evaluation_service.update_technician_skills(
            technician_id=ticket['assigned_technician_id'],
            current_skills=technician.get('skills', []),
            ticket_metrics=metrics
        )

        return jsonify({
            "success": True,
            "message": "Skills evaluated successfully",
            "data": {
                "technician": result,
                "metrics": metrics.model_dump()
            }
        })

    except Exception as e:
        logger.error(f"Error evaluating skills: {str(e)}")
        return jsonify({"error": "Internal server error", "message": str(e)}), 500


if __name__ == "__main__":
    logger.info("Starting NeuroDesk LLM Wrapper API")
    app.run(
        use_reloader=True,
        host='0.0.0.0',
        port=int(os.environ.get("PORT", 5000)),
        debug=os.environ.get("DEBUG", "False").lower() == "true"
    )