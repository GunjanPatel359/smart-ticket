"""
Skill model aligned with the Prisma database schema
"""
from typing import Optional, List, Dict, Any
from pydantic import BaseModel, Field


# =====================
# MAIN SKILL MODEL
# =====================

class Skill(BaseModel):
    """Skill model matching the database schema"""
    id: Optional[int] = Field(None, description="Skill unique identifier")
    category: Optional[str] = Field(None, max_length=100, description="Category of the skill")
    name: str = Field(..., min_length=2, max_length=255, description="Unique name of the skill")
    description: Optional[str] = Field(None, description="Detailed description of the skill")
    is_active: bool = Field(default=True, description="Whether the skill is currently active")

# =====================
# CRUD SCHEMAS
# =====================

class SkillCreate(BaseModel):
    """Schema for creating a new skill"""
    name: str = Field(..., min_length=2, max_length=255, description="Skill name")
    description: Optional[str] = Field(None, description="Skill description")
    is_active: bool = Field(default=True, description="Whether the skill is active")


class SkillUpdate(BaseModel):
    """Schema for updating an existing skill"""
    name: Optional[str] = Field(None, min_length=2, max_length=255, description="Skill name")
    description: Optional[str] = Field(None, description="Skill description")
    is_active: Optional[bool] = Field(None, description="Whether the skill is active")


class SkillResponse(BaseModel):
    """API response model for a single skill"""
    id: int = Field(..., description="Skill unique identifier")
    name: str = Field(..., description="Skill name")
    description: Optional[str] = Field(None, description="Skill description")
    is_active: bool = Field(..., description="Whether the skill is active")


class SkillWithRelations(BaseModel):
    """Skill model with related data (technicians, tickets, etc.)"""
    skill: SkillResponse
    technicians: Optional[List[Dict[str, Any]]] = Field(default_factory=list, description="Technicians that have this skill")
