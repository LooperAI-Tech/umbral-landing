"""
Pydantic schemas for Project model
"""

from typing import Optional, List
from datetime import datetime
from pydantic import BaseModel, Field

from app.models.project import AIBranch, ProjectStatus, Priority


class ProjectCreate(BaseModel):
    name: str = Field(..., min_length=1, max_length=255)
    description: Optional[str] = None
    team_name: Optional[str] = None
    ai_branch: AIBranch
    sub_domain: Optional[str] = None
    problem_statement: str = Field(..., min_length=1)
    target_user: str = Field(..., min_length=1)
    target_user_persona: Optional[dict] = None
    technologies: List[str] = []
    tech_stack: Optional[dict] = None
    priority: Priority = Priority.MEDIUM
    start_date: Optional[datetime] = None
    target_date: Optional[datetime] = None
    tags: List[str] = []
    external_links: Optional[dict] = None


class ProjectUpdate(BaseModel):
    name: Optional[str] = Field(None, min_length=1, max_length=255)
    description: Optional[str] = None
    team_name: Optional[str] = None
    ai_branch: Optional[AIBranch] = None
    sub_domain: Optional[str] = None
    problem_statement: Optional[str] = None
    target_user: Optional[str] = None
    target_user_persona: Optional[dict] = None
    technologies: Optional[List[str]] = None
    tech_stack: Optional[dict] = None
    status: Optional[ProjectStatus] = None
    priority: Optional[Priority] = None
    start_date: Optional[datetime] = None
    target_date: Optional[datetime] = None
    completed_date: Optional[datetime] = None
    tags: Optional[List[str]] = None
    external_links: Optional[dict] = None


class ProjectResponse(BaseModel):
    id: str
    display_id: str
    user_id: str
    name: str
    description: Optional[str] = None
    team_name: Optional[str] = None
    ai_branch: AIBranch
    sub_domain: Optional[str] = None
    problem_statement: str
    target_user: str
    target_user_persona: Optional[dict] = None
    technologies: List[str] = []
    tech_stack: Optional[dict] = None
    status: ProjectStatus
    priority: Priority
    progress: float
    start_date: Optional[datetime] = None
    target_date: Optional[datetime] = None
    completed_date: Optional[datetime] = None
    tags: List[str] = []
    external_links: Optional[dict] = None
    created_at: datetime
    updated_at: datetime

    class Config:
        from_attributes = True


class ProjectListResponse(BaseModel):
    projects: List[ProjectResponse]
    total: int
