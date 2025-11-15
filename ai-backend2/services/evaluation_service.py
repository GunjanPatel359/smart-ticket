from datetime import datetime
from typing import Dict, List, Any, Union
from pydantic import BaseModel
import requests


class SkillEvaluation(BaseModel):
    skill_id: int
    skill_level: float  # 0-100 scale
    confidence_score: float


class SkillMetric(BaseModel):
    score: float
    reasoning: str


class SentimentResult(BaseModel):
    score: float
    reasoning: str


class MetricsResult(BaseModel):
    resolution_time: int  # in minutes
    sla_adherence: bool
    skill_metrics: Dict[str, SkillMetric]  # Format: {"skill_id": {"score": float, "reasoning": str}}
    feedback_sentiment: SentimentResult  # Format: {"score": float, "reasoning": str}

    class Config:
        arbitrary_types_allowed = True


class EvaluationService:
    def __init__(self, llm, technician_api_url="http://localhost:3000/api"):
        self.llm = llm
        self.technician_api_url = technician_api_url

    def calculate_metrics(self, ticket_data: Dict) -> MetricsResult:
        """Calculate all metrics for a resolved ticket"""
        resolution_time = self._calculate_resolution_time(ticket_data)
        sla_target = self._get_sla_target(ticket_data.get('priority', 'medium'))
        sla_adherence = resolution_time <= sla_target if resolution_time else True

        skill_metrics_raw = self._analyze_skill_performance(ticket_data)
        feedback_sentiment_dict = self._analyze_feedback_sentiment(ticket_data)

        feedback_sentiment = SentimentResult(
            score=float(feedback_sentiment_dict["score"]),
            reasoning=str(feedback_sentiment_dict["reasoning"])
        )

        # Convert dict values to SkillMetric objects
        skill_metrics = {
            skill_id: SkillMetric(score=float(metric['score']), reasoning=str(metric['reasoning']))
            for skill_id, metric in skill_metrics_raw.items()
        }

        return MetricsResult(
            resolution_time=resolution_time,
            sla_adherence=sla_adherence,
            skill_metrics=skill_metrics,
            feedback_sentiment=feedback_sentiment
        )

    def _calculate_resolution_time(self, ticket_data: Dict) -> int:
        """Calculate resolution time in minutes"""
        try:
            created_at = ticket_data.get('created_at') or ticket_data.get('createdAt')
            resolved_at = ticket_data.get('resolved_at') or ticket_data.get('resolvedAt')
            
            if created_at and resolved_at:
                # Handle both string and datetime objects
                if isinstance(created_at, str):
                    start_time = datetime.fromisoformat(created_at.replace('Z', '+00:00'))
                else:
                    start_time = created_at
                    
                if isinstance(resolved_at, str):
                    end_time = datetime.fromisoformat(resolved_at.replace('Z', '+00:00'))
                else:
                    end_time = resolved_at
                    
                return int((end_time - start_time).total_seconds() / 60)
            return 0
        except (ValueError, KeyError, AttributeError) as e:
            print(f"Error calculating resolution time: {e}")
            return 0

    def _get_sla_target(self, priority: str) -> int:
        """Get SLA target time in minutes based on priority"""
        sla_targets = {
            'critical': 60,    # 1 hour
            'high': 240,       # 4 hours
            'normal': 480,     # 8 hours
            'medium': 480,     # 8 hours
            'low': 1440        # 24 hours
        }
        return sla_targets.get(priority.lower(), 480)

    def _analyze_feedback_sentiment(self, ticket_data: Dict) -> Dict[str, Union[float, str]]:
        """Analyze user feedback sentiment using LLM
        Returns dict with score (-100 to 100) and reasoning"""
        feedback = ticket_data.get('feedback')
        if not feedback:
            return {"score": 0.0, "reasoning": "No feedback provided"}

        prompt = f"""Analyze the sentiment of this user feedback and provide:
1. A score from -100 to 100:
   -100: Extremely negative
   -50: Moderately negative
   0: Neutral
   50: Moderately positive
   100: Extremely positive

2. A brief explanation for the score (max 50 words)

User Feedback: {feedback}

Format your response as:
SCORE: <number>
REASON: <explanation>"""

        try:
            response = self.llm.predict(prompt)
            lines = [line.strip() for line in response.split('\n') if line.strip()]
            
            score_line = None
            reason_line = None
            
            for line in lines:
                if line.startswith('SCORE:'):
                    score_line = line
                elif line.startswith('REASON:'):
                    reason_line = line
            
            if not score_line or not reason_line:
                return {"score": 0.0, "reasoning": "Unable to parse LLM response"}
            
            sentiment_score = float(score_line.replace('SCORE:', '').strip())
            reasoning = reason_line.replace('REASON:', '').strip()
            
            return {
                "score": max(-100, min(100, sentiment_score)),
                "reasoning": reasoning
            }
        except (ValueError, TypeError, IndexError, AttributeError) as e:
            print(f"Error analyzing feedback sentiment: {e}")
            return {"score": 0.0, "reasoning": "Error analyzing feedback"}

    def _analyze_skill_performance(self, ticket_data: Dict) -> Dict[str, Dict[str, Union[float, str]]]:
        """Analyze skill performance using LLM"""
        required_skills = ticket_data.get('required_skills', [])
        if not required_skills:
            return {}

        # Format skills for prompt
        skills_list = ', '.join([str(skill.get('name', skill.get('id', skill))) for skill in required_skills])
        
        work_logs = ticket_data.get('work_logs', [])
        work_logs_text = '\n'.join([f"- {log.get('description', '')}" for log in work_logs]) if work_logs else "No work logs"

        prompt = f"""Analyze this ticket resolution and rate the demonstrated skill levels:

Ticket Subject: {ticket_data.get('subject', '')}
Description: {ticket_data.get('description', '')}
Work Logs: 
{work_logs_text}

For each required skill [{skills_list}], provide:
1. Skill proficiency score (0-100)
2. Brief justification (max 50 words)

Format each skill as:
SKILL: <skill_name>
SCORE: <number>
REASON: <justification>
"""

        try:
            analysis = self.llm.predict(prompt)
            skill_evaluations = {}
            current_skill = None
            current_data = {}

            for line in analysis.split('\n'):
                line = line.strip()
                if not line:
                    continue

                if line.startswith('SKILL:'):
                    if current_skill and current_data:
                        skill_evaluations[current_skill] = current_data
                    current_skill = line.replace('SKILL:', '').strip()
                    current_data = {}
                elif line.startswith('SCORE:'):
                    try:
                        current_data['score'] = float(line.replace('SCORE:', '').strip())
                    except ValueError:
                        current_data['score'] = 50.0
                elif line.startswith('REASON:'):
                    current_data['reasoning'] = line.replace('REASON:', '').strip()

            # Add the last skill if exists
            if current_skill and current_data:
                skill_evaluations[current_skill] = current_data

            return skill_evaluations
        except Exception as e:
            print(f"Error analyzing skill performance: {e}")
            return {}

    def update_technician_skills(self, technician_id: int,
                                 current_skills: List[Dict],
                                 ticket_metrics: MetricsResult) -> Dict:
        """Update technician skills based on ticket performance"""
        # Convert current skills to dictionary for easier lookup
        skill_map = {skill['id']: skill.get('score', skill.get('percentage', 50)) 
                     for skill in current_skills}

        # Calculate performance multiplier based on SLA adherence
        performance_multiplier = 1.0
        if not ticket_metrics.sla_adherence:
            performance_multiplier = 0.8  # Reduce skill gain for missed SLA

        # Update skills based on ticket metrics
        for skill_id, skill_metric in ticket_metrics.skill_metrics.items():
            skill_score = skill_metric.score  # Access the score from SkillMetric object
            
            # Try to convert skill_id to int if it's a string
            try:
                skill_id_int = int(skill_id)
            except (ValueError, TypeError):
                continue
            
            if skill_id_int in skill_map:
                # Weighted average with more weight to existing skill level
                current_level = skill_map[skill_id_int]
                skill_map[skill_id_int] = min(100, (current_level * 0.7 + skill_score * 0.3 * performance_multiplier))
            else:
                # New skill starts at demonstrated level * performance multiplier
                skill_map[skill_id_int] = min(100, skill_score * performance_multiplier)

        # Convert back to list format
        updated_skills = [
            {"id": skill_id, "score": level}
            for skill_id, level in skill_map.items()
        ]

        return {
            "technician_id": technician_id,
            "skills": updated_skills,
            "updated_at": datetime.utcnow().isoformat()
        }
