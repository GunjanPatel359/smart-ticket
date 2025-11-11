"""
Data models for ticket assignment workflow
Updated to match the actual Prisma database schema
"""
from typing import List, Optional
from pydantic import BaseModel, Field
from datetime import datetime
from enum import Enum
from .skill import Skill


# =========================
# ENUM DEFINITIONS
# =========================

class TicketStatus(str, Enum):
    new = "new"
    assigned = "assigned"
    in_progress = "in_progress"
    on_hold = "on_hold"
    resolved = "resolved"
    closed = "closed"
    cancelled = "cancelled"


class PriorityLevel(str, Enum):
    low = "low"
    normal = "normal"
    high = "high"
    critical = "critical"


class ImpactLevel(str, Enum):
    low = "low"
    medium = "medium"
    high = "high"
    critical = "critical"


class UrgencyLevel(str, Enum):
    low = "low"
    normal = "normal"
    high = "high"
    critical = "critical"


# =========================
# RELATIONAL ENTITIES
# =========================

class Task(BaseModel):
    """Represents a discrete unit of work related to a Ticket"""
    id: Optional[int] = Field(None)
    title: str
    description: Optional[str] = None
    status: str = Field(default="pending")
    assigned_to: Optional[int] = Field(None, description="Technician ID if assigned")
    due_date: Optional[datetime] = None
    completed_at: Optional[datetime] = None
    created_at: Optional[datetime] = Field(default_factory=datetime.now)
    ticket_id: int


class WorkLog(BaseModel):
    """Tracks technician activity or time spent on a ticket"""
    id: Optional[int] = Field(None)
    technician_id: int
    description: str
    time_spent_minutes: int = Field(..., ge=0)
    created_at: Optional[datetime] = Field(default_factory=datetime.now)
    ticket_id: int


class AuditTrail(BaseModel):
    """Audit log of ticket lifecycle changes"""
    id: Optional[int] = Field(None)
    action: str
    old_value: Optional[str] = None
    new_value: Optional[str] = None
    comment: Optional[str] = None
    performed_by: str
    timestamp: Optional[datetime] = Field(default_factory=datetime.now)
    ticket_id: int


# =========================
# MAIN TICKET MODEL
# =========================

class Ticket(BaseModel):
    """Ticket model matching the Prisma schema"""
    id: Optional[int] = Field(None)
    subject: str = Field(..., min_length=5, max_length=500)
    description: str

    status: TicketStatus = Field(default=TicketStatus.new)
    priority: PriorityLevel = Field(default=PriorityLevel.normal)
    impact: ImpactLevel = Field(default=ImpactLevel.medium)
    urgency: UrgencyLevel = Field(default=UrgencyLevel.normal)

    tags: Optional[List[str]] = Field(default_factory=list)
    sla_violated: bool = Field(default=False)
    escalation_count: int = Field(default=0, ge=0)
    reopened_count: int = Field(default=0, ge=0)
    justification: Optional[str] = Field(default="Severity: Medium")

    requester_id: Optional[int] = None
    assigned_technician_id: Optional[int] = None

    required_skills: Optional[List[Skill]] = Field(default_factory=list)

    tasks: Optional[List[Task]] = Field(default_factory=list)
    work_logs: Optional[List[WorkLog]] = Field(default_factory=list)
    audit_trail: Optional[List[AuditTrail]] = Field(default_factory=list)

    satisfaction_rating: Optional[int] = Field(default=None, ge=1, le=5)
    score: Optional[float] = None
    feedback: Optional[str] = None

    first_response_time: Optional[datetime] = None
    resolution_time: Optional[datetime] = None
    resolution_due: Optional[datetime] = None
    resolved_at: Optional[datetime] = None
    closed_at: Optional[datetime] = None

    created_at: Optional[datetime] = Field(default_factory=datetime.now)
    updated_at: Optional[datetime] = Field(default_factory=datetime.now)

# =========================
# SUPPORTING MODELS
# =========================

class SkillScore(BaseModel):
    """Skill with relevance score"""
    skill: Skill
    score: float = Field(..., ge=0.0, le=1.0)


class SkillScoreSimple(BaseModel):
    skill_name: str
    skill_id: Optional[int] = None
    score: float = Field(..., ge=0.0, le=1.0)


class Technician(BaseModel):
    """Technician representation"""
    id: int
    name: str
    skills: List[str]
    availability: str
    rating: float = Field(..., ge=0.0, le=5.0)
    experience_years: Optional[int] = None
    current_workload: Optional[int] = Field(None, ge=0)


class TicketAssignmentRequest(BaseModel):
    """Request for assigning a ticket"""
    ticket: Ticket


class TicketAssignmentResponse(BaseModel):
    """Response after attempting assignment"""
    success: bool
    selected_technician_id: Optional[int] = None
    justification: Optional[str] = None
    error_message: Optional[str] = None


class TicketSummary(BaseModel):
    """Simplified representation of a ticket"""
    subject: str
    description: str
    priority: PriorityLevel = Field(default=PriorityLevel.normal)
    impact: ImpactLevel = Field(default=ImpactLevel.medium)
    urgency: UrgencyLevel = Field(default=UrgencyLevel.normal)
    tags: Optional[List[str]] = Field(default_factory=list)
    requester_id: int
