"""
Early Access submission model
"""

import enum
import uuid
from datetime import datetime

from sqlalchemy import Column, String, Text, DateTime, Enum, JSON

from app.core.database import Base


class EarlyAccessStatus(str, enum.Enum):
    PENDING = "PENDING"
    CONTACTED = "CONTACTED"
    APPROVED = "APPROVED"
    REJECTED = "REJECTED"


class EarlyAccess(Base):
    __tablename__ = "early_access"

    id = Column(String, primary_key=True, default=lambda: str(uuid.uuid4()))

    # Section 1: Sobre ti
    name = Column(String(255), nullable=False)
    email = Column(String(255), nullable=False, unique=True, index=True)
    country = Column(String(255), nullable=False)
    age_range = Column(String(50), nullable=False)
    professional_profiles = Column(JSON, nullable=False)  # list of selected options
    professional_profiles_other = Column(Text, nullable=True)
    current_situation = Column(String(255), nullable=False)
    current_situation_other = Column(Text, nullable=True)
    programming_experience = Column(String(255), nullable=False)

    # Section 2: Tu experiencia aprendiendo
    platforms_used = Column(JSON, nullable=False)  # list of selected options
    platforms_used_other = Column(Text, nullable=True)
    biggest_frustrations = Column(JSON, nullable=False)  # list of selected options
    biggest_frustrations_other = Column(Text, nullable=True)
    abandoned_courses = Column(String(255), nullable=False)

    # Section 3: Qué quieres construir
    project_types = Column(JSON, nullable=False)  # list of selected options
    project_types_other = Column(Text, nullable=True)
    deployment_importance = Column(String(255), nullable=False)

    # Section 4: Qué esperas de Umbral
    feature_ranking = Column(JSON, nullable=False)  # ordered list of features
    weekly_time = Column(String(50), nullable=False)
    suggestions = Column(Text, nullable=True)

    # Section 5: Inversión y confirmaciones
    monthly_payment = Column(String(100), nullable=False)
    confirmations = Column(JSON, nullable=False)  # dict of confirmation booleans

    # Meta
    status = Column(Enum(EarlyAccessStatus), default=EarlyAccessStatus.PENDING, nullable=False)
    ip_address = Column(String(45), nullable=True)
    user_agent = Column(Text, nullable=True)

    created_at = Column(DateTime, default=datetime.utcnow, nullable=False)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow, nullable=False)

    def __repr__(self):
        return f"<EarlyAccess(id={self.id}, email={self.email}, status={self.status})>"
