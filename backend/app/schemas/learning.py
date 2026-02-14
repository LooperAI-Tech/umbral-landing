"""
Pydantic schemas for Learning model
"""

from typing import Optional, List
from datetime import datetime
from pydantic import BaseModel, Field

from app.models.learning import LearningCategory, ConfidenceLevel


class LearningCreate(BaseModel):
    project_id: Optional[str] = None
    milestone_number: Optional[int] = None
    concept: str = Field(..., min_length=1, max_length=255)
    category: LearningCategory
    subcategory: Optional[str] = None
    what_learned: str = Field(..., min_length=1)
    when_to_use: str = Field(..., min_length=1)
    when_not_to_use: str = Field(..., min_length=1)
    implemented_in: str = Field(..., min_length=1, max_length=255)
    code_snippets: Optional[dict] = None
    resources: Optional[dict] = None
    related_concepts: List[str] = []
    tags: List[str] = []
    confidence_level: ConfidenceLevel = ConfidenceLevel.LEARNING


class LearningUpdate(BaseModel):
    project_id: Optional[str] = None
    milestone_number: Optional[int] = None
    concept: Optional[str] = Field(None, min_length=1, max_length=255)
    category: Optional[LearningCategory] = None
    subcategory: Optional[str] = None
    what_learned: Optional[str] = None
    when_to_use: Optional[str] = None
    when_not_to_use: Optional[str] = None
    implemented_in: Optional[str] = None
    code_snippets: Optional[dict] = None
    resources: Optional[dict] = None
    related_concepts: Optional[List[str]] = None
    tags: Optional[List[str]] = None
    confidence_level: Optional[ConfidenceLevel] = None


class LearningResponse(BaseModel):
    id: str
    user_id: str
    project_id: Optional[str] = None
    milestone_number: Optional[int] = None
    concept: str
    category: LearningCategory
    subcategory: Optional[str] = None
    what_learned: str
    when_to_use: str
    when_not_to_use: str
    implemented_in: str
    code_snippets: Optional[dict] = None
    resources: Optional[dict] = None
    related_concepts: List[str] = []
    tags: List[str] = []
    confidence_level: ConfidenceLevel
    date_learned: datetime
    last_reviewed: Optional[datetime] = None
    next_review_date: Optional[datetime] = None
    created_at: datetime
    updated_at: datetime

    class Config:
        from_attributes = True


class LearningSearchParams(BaseModel):
    query: Optional[str] = None
    category: Optional[LearningCategory] = None
    project_id: Optional[str] = None
    confidence_level: Optional[ConfidenceLevel] = None
    tags: Optional[List[str]] = None
    limit: int = Field(50, ge=1, le=200)
    offset: int = Field(0, ge=0)
