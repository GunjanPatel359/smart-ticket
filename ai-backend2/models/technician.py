"""
Technician model matching the actual Prisma database schema
"""
from typing import Optional, List, Dict, Any
from pydantic import BaseModel, Field
from enum import Enum


# =====================
# ENUMS
# =====================

class AvailabilityStatus(str, Enum):
    """Technician availability status"""
    AVAILABLE = "available"
    BUSY = "busy"
    IN_MEETING = "in_meeting"
    ON_BREAK = "on_break"
    END_OF_SHIFT = "end_of_shift"
    FOCUS_MODE = "focus_mode"


class SkillLevel(str, Enum):
    """Technician skill level"""
    JUNIOR = "junior"
    MID = "mid"
    SENIOR = "senior"
    EXPERT = "expert"


# =====================
# SUPPORTING MODELS
# =====================

class SkillRef(BaseModel):
    """Represents a skill linked to a technician via TechnicianSkill"""
    skill_id: int = Field(..., description="ID of the related skill")
    name: Optional[str] = Field(None, description="Skill name (if available)")
    score: int = Field(..., ge=0, le=100, description="Skill score (0-100)")


# =====================
# MAIN TECHNICIAN MODEL
# =====================

class Technician(BaseModel):
    """Technician model aligned with Prisma schema"""
    id: Optional[int] = Field(None, description="Technician unique identifier")
    name: str = Field(..., min_length=2, max_length=255, description="Technician full name")
    email: str = Field(..., description="Technician email address")
    contact_no: Optional[str] = Field(None, max_length=20, description="Technician contact number")
    department: Optional[str] = Field(None, max_length=100, description="Technician department")

    # Ticket statistics
    current_tickets: int = Field(default=0, ge=0, description="Number of tickets currently assigned")
    resolved_tickets: int = Field(default=0, ge=0, description="Total number of tickets resolved")
    total_tickets: int = Field(default=0, ge=0, description="Total number of tickets handled")

    workload: int = Field(default=0, ge=0, description="Workload score based on ticket assignments")
    technician_level: SkillLevel = Field(default=SkillLevel.JUNIOR, description="Technician level")
    availability_status: AvailabilityStatus = Field(default=AvailabilityStatus.AVAILABLE, description="Current availability status")
    is_active: bool = Field(default=True, description="Whether technician is active")
    experience: float = Field(default=0.0, ge=0.0)

    # Relations
    technician_skills: Optional[List[SkillRef]] = Field(default_factory=list, description="List of skill mappings")
    assigned_ticket_ids: Optional[List[int]] = Field(default_factory=list, description="List of assigned ticket IDs")

class TechnicianResponse(BaseModel):
    """Response model for API responses"""
    id: int
    name: str
    email: str
    contact_no: Optional[str]
    department: Optional[str]
    technician_level: SkillLevel
    availability_status: AvailabilityStatus
    workload: int
    current_tickets: int
    resolved_tickets: int
    total_tickets: int
    experience: float
    is_active: bool
    skills: Optional[List[SkillRef]] = Field(default_factory=list)
    assigned_ticket_ids: Optional[List[int]] = Field(default_factory=list)


class TechnicianWithRelations(BaseModel):
    """Technician with related data for complex queries"""
    technician: TechnicianResponse
    tickets: Optional[List[Dict[str, Any]]] = Field(default_factory=list, description="Tickets assigned to the technician")
    skills: Optional[List[Dict[str, Any]]] = Field(default_factory=list, description="Related skill details")
