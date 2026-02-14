"""
Pydantic schemas for Deployment and DeploymentMetrics models
"""

from typing import Optional, List
from datetime import datetime
from pydantic import BaseModel, Field

from app.models.deployment import Environment, DeploymentStatus


class DeploymentMetricsCreate(BaseModel):
    avg_response_time: Optional[float] = None
    p95_response_time: Optional[float] = None
    uptime_percentage: Optional[float] = None
    accuracy_rate: Optional[float] = None
    error_rate: Optional[float] = None
    total_requests: Optional[int] = None
    unique_users: Optional[int] = None
    user_satisfaction: Optional[float] = None
    nps_score: Optional[int] = None
    custom_metrics: Optional[dict] = None


class DeploymentMetricsResponse(DeploymentMetricsCreate):
    id: str
    deployment_id: str
    updated_at: datetime

    class Config:
        from_attributes = True


class DeploymentCreate(BaseModel):
    version: str = Field(..., min_length=1, max_length=50)
    version_major: int
    version_minor: int
    version_patch: int = 0
    release_notes: Optional[str] = None
    deploy_date: datetime
    environment: Environment = Environment.STAGING
    access_url: Optional[str] = None
    github_repo: Optional[str] = None
    commit_hash: Optional[str] = Field(None, max_length=40)
    tester_emails: List[str] = []


class DeploymentUpdate(BaseModel):
    release_notes: Optional[str] = None
    environment: Optional[Environment] = None
    access_url: Optional[str] = None
    github_repo: Optional[str] = None
    commit_hash: Optional[str] = None
    testers_count: Optional[int] = None
    tester_emails: Optional[List[str]] = None
    feedback_summary: Optional[str] = None
    feedback_items: Optional[dict] = None
    critical_bugs: Optional[str] = None
    bug_items: Optional[dict] = None
    next_improvements: Optional[str] = None
    improvements: Optional[dict] = None
    status: Optional[DeploymentStatus] = None


class DeploymentResponse(BaseModel):
    id: str
    project_id: str
    version: str
    version_major: int
    version_minor: int
    version_patch: int
    release_notes: Optional[str] = None
    deploy_date: datetime
    environment: Environment
    access_url: Optional[str] = None
    github_repo: Optional[str] = None
    commit_hash: Optional[str] = None
    testers_count: int
    tester_emails: List[str] = []
    feedback_summary: Optional[str] = None
    feedback_items: Optional[dict] = None
    critical_bugs: Optional[str] = None
    bug_items: Optional[dict] = None
    next_improvements: Optional[str] = None
    improvements: Optional[dict] = None
    status: DeploymentStatus
    metrics: Optional[DeploymentMetricsResponse] = None
    created_at: datetime
    updated_at: datetime
    deprecated_at: Optional[datetime] = None

    class Config:
        from_attributes = True
