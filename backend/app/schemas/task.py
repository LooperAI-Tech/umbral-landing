"""
Pydantic schemas for Task model
"""

from typing import Optional
from datetime import datetime
from pydantic import BaseModel, Field

from app.models.task import TaskType, Complexity, TaskStatus


class TaskCreate(BaseModel):
    title: str = Field(..., min_length=1, max_length=255)
    description: Optional[str] = None
    task_type: TaskType
    tech_component: str = Field(..., min_length=1, max_length=255)
    complexity: Complexity = Complexity.MEDIUM
    estimated_hours: Optional[float] = None
    due_date: Optional[datetime] = None
    blockers: Optional[str] = None
    notes: Optional[str] = None


class TaskUpdate(BaseModel):
    title: Optional[str] = Field(None, min_length=1, max_length=255)
    description: Optional[str] = None
    task_type: Optional[TaskType] = None
    tech_component: Optional[str] = None
    complexity: Optional[Complexity] = None
    estimated_hours: Optional[float] = None
    actual_hours: Optional[float] = None
    status: Optional[TaskStatus] = None
    blockers: Optional[str] = None
    notes: Optional[str] = None
    due_date: Optional[datetime] = None


class TaskResponse(BaseModel):
    id: str
    milestone_id: str
    order_index: int
    task_number: str
    title: str
    description: Optional[str] = None
    task_type: TaskType
    tech_component: str
    complexity: Complexity
    estimated_hours: Optional[float] = None
    actual_hours: Optional[float] = None
    status: TaskStatus
    blockers: Optional[str] = None
    notes: Optional[str] = None
    started_at: Optional[datetime] = None
    completed_at: Optional[datetime] = None
    due_date: Optional[datetime] = None
    created_at: datetime
    updated_at: datetime

    class Config:
        from_attributes = True
