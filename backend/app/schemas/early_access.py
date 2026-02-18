"""
Pydantic schemas for Early Access submissions
"""

from typing import Optional, List, Dict
from datetime import datetime
from pydantic import BaseModel, Field, EmailStr

from app.models.early_access import EarlyAccessStatus


class EarlyAccessCreate(BaseModel):
    # Section 1: Sobre ti
    name: str = Field(..., min_length=1, max_length=255)
    email: EmailStr
    country: str = Field(..., min_length=1, max_length=255)
    age_range: str = Field(..., min_length=1, max_length=50)
    professional_profiles: List[str] = Field(..., min_length=1)
    professional_profiles_other: Optional[str] = None
    current_situation: str = Field(..., min_length=1, max_length=255)
    current_situation_other: Optional[str] = None
    programming_experience: str = Field(..., min_length=1, max_length=255)

    # Section 2: Tu experiencia aprendiendo
    platforms_used: List[str] = Field(..., min_length=1)
    platforms_used_other: Optional[str] = None
    biggest_frustrations: List[str] = Field(..., min_length=1)
    biggest_frustrations_other: Optional[str] = None
    abandoned_courses: str = Field(..., min_length=1, max_length=255)

    # Section 3: Qué quieres construir
    project_types: List[str] = Field(..., min_length=1)
    project_types_other: Optional[str] = None
    deployment_importance: str = Field(..., min_length=1, max_length=255)

    # Section 4: Qué esperas de Umbral
    feature_ranking: List[str] = Field(..., min_length=1)
    weekly_time: str = Field(..., min_length=1, max_length=50)
    suggestions: Optional[str] = None

    # Section 5: Inversión y confirmaciones
    monthly_payment: str = Field(..., min_length=1, max_length=100)
    confirmations: Dict[str, bool] = Field(...)


class EarlyAccessResponse(BaseModel):
    id: str
    email: str
    name: str
    status: EarlyAccessStatus
    created_at: datetime

    class Config:
        from_attributes = True
