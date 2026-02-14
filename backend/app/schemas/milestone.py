"""
Pydantic schemas for Milestone model
"""

from typing import Optional, List
from datetime import datetime
from pydantic import BaseModel, Field

from app.models.milestone import DeliverableType, MilestoneStatus


class MilestoneCreate(BaseModel):
    name: str = Field(..., min_length=1, max_length=255)
    description: Optional[str] = None
    deliverable: str = Field(..., min_length=1)
    deliverable_type: DeliverableType
    success_criteria: str = Field(..., min_length=1)
    metrics: Optional[dict] = None
    target_date: Optional[datetime] = None
    depends_on: List[str] = []


class MilestoneUpdate(BaseModel):
    name: Optional[str] = Field(None, min_length=1, max_length=255)
    description: Optional[str] = None
    deliverable: Optional[str] = None
    deliverable_type: Optional[DeliverableType] = None
    success_criteria: Optional[str] = None
    metrics: Optional[dict] = None
    status: Optional[MilestoneStatus] = None
    start_date: Optional[datetime] = None
    target_date: Optional[datetime] = None
    completed_date: Optional[datetime] = None
    depends_on: Optional[List[str]] = None


class MilestoneResponse(BaseModel):
    id: str
    project_id: str
    order_index: int
    milestone_number: int
    name: str
    description: Optional[str] = None
    deliverable: str
    deliverable_type: DeliverableType
    success_criteria: str
    metrics: Optional[dict] = None
    status: MilestoneStatus
    progress: float
    start_date: Optional[datetime] = None
    target_date: Optional[datetime] = None
    completed_date: Optional[datetime] = None
    depends_on: List[str] = []
    created_at: datetime
    updated_at: datetime

    class Config:
        from_attributes = True
