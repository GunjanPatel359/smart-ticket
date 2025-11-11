"""
Skill extraction service - Step 1: Extract skills from ticket using provided skills list
"""
import json
import re
import logging
from typing import List
from langchain.prompts import PromptTemplate
from langchain_google_genai import ChatGoogleGenerativeAI
from models.ticket import Ticket
from pydantic import BaseModel, ValidationError

logger = logging.getLogger(__name__)


class NewSkill(BaseModel):
    name: str
    description: str


class SkillExtractionResponse(BaseModel):
    existing_skills: List[str]
    new_skills: List[NewSkill]


def extract_skills_from_ticket(ticket: Ticket, available_skills: List[str], llm: ChatGoogleGenerativeAI) -> SkillExtractionResponse:
    """
    Single-function version of skill extraction.
    Uses an LLM to identify existing and new skills needed for a given support ticket.
    """

    # --- Step 1: Prepare the skill extraction prompt (unchanged) ---
    skill_extraction_prompt = PromptTemplate(
        template="""You are a service desk assistant designed to analyze incoming support tickets and identify the relevant **technical skills** needed to resolve them.

        You will be provided:
        1. A support ticket with subject, description, and tags
        2. A list of available skills (from which you must choose)

        ---

        **Ticket Details**
        - **Subject**: {subject}
        - **Description**: {description}
        - **Tags**: {tags}

        ---

        **Available Skills**:  
        {available_skills}

        ---

        **Instructions**:
        - Analyze the subject and description to identify which skills are needed.
        - Output the result as a valid JSON object that matches exactly the schema below.
        - Do NOT include explanations, markdown code fences, or extra text.
        - If no new skills are needed, return an empty list for `new_skills`.
        - Each skill listed in `all_skills` must have the field `is_new` set correctly.

        ---

        **Output Format**:
        {{
            "existing_skills": [
                "<existing_skill_name_1>",
                "<existing_skill_name_2>"
            ],
            "new_skills": [
                {{
                    "name": "<new_skill_name>",
                    "description": "<short_description_of_the_new_skill>"
                }}
            ]
        }}
        """,
        input_variables=["subject", "description", "tags", "available_skills"]
    )

    try:
        logger.info(f"Extracting skills from ticket: {ticket.subject}")

        # --- Step 2: Format input values ---
        tags_text = ", ".join(ticket.tags) if ticket.tags else "None"
        available_skills_text = "\n".join([f"- {skill}" for skill in available_skills])

        prompt = skill_extraction_prompt.format(
            subject=ticket.subject,
            description=ticket.description,
            tags=tags_text,
            available_skills=available_skills_text
        )

        # --- Step 3: Call LLM ---
        logger.debug("Sending prompt to LLM for skill extraction")
        response = llm.invoke(prompt)
        raw_content = str(response.content).strip()

        # --- Step 4: Clean and parse JSON ---
        cleaned_json = re.sub(r"^```(?:json)?|```$", "", raw_content, flags=re.MULTILINE).strip()

        try:
            data = json.loads(cleaned_json)
        except json.JSONDecodeError as je:
            logger.error(f"Invalid JSON returned by LLM: {je}")
            logger.debug(f"Raw LLM response: {raw_content}")
            raise ValueError("LLM returned invalid JSON format.") from je

        # --- Step 5: Normalize schema (handle alternate structure) ---
        if "skills" in data and "existing_skills" not in data:
            skills = data.get("skills", [])
            existing_skills = [s["name"] for s in skills if not s.get("is_new", False)]
            new_skills = [NewSkill(name=s["name"], description=s["description"]) for s in skills if s.get("is_new", False)]
            data = {
                "existing_skills": existing_skills,
                "new_skills": [ns.dict() for ns in new_skills],
            }

        # --- Step 6: Validate with Pydantic ---
        result_data = SkillExtractionResponse.model_validate(data)

        logger.info(
            f"Successfully extracted {len(result_data.existing_skills)} existing and "
            f"{len(result_data.new_skills)} new skills from ticket."
        )

        return result_data

    except ValidationError as ve:
        logger.error(f"Validation failed for SkillExtractionResponse: {ve}")
        raise

    except Exception as e:
        logger.error(f"Error extracting skills from ticket: {e}")
        raise
