"""
Pydantic schemas for dashboard stats and activity feed
"""

from typing import Optional, List
from datetime import datetime
from pydantic import BaseModel


class DashboardStats(BaseModel):
    total_projects: int = 0
    active_projects: int = 0
    completed_projects: int = 0
    total_milestones: int = 0
    completed_milestones: int = 0
    total_tasks: int = 0
    completed_tasks: int = 0
    total_deployments: int = 0
    total_learnings: int = 0
    current_streak: int = 0
    longest_streak: int = 0


class ActivityFeedItem(BaseModel):
    id: str
    action: str
    entity_type: str
    entity_id: Optional[str] = None
    metadata: Optional[dict] = None
    created_at: datetime

    class Config:
        from_attributes = True


class ActivityFeedResponse(BaseModel):
    activities: List[ActivityFeedItem]
    total: int
