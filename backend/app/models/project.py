"""
Project model for tracking AI/ML learning projects
"""

import enum
import uuid
from datetime import datetime

from sqlalchemy import (
    Column, String, Text, DateTime, Float, Integer,
    ForeignKey, Enum, ARRAY, JSON
)
from sqlalchemy.orm import relationship

from app.core.database import Base


class AIBranch(str, enum.Enum):
    GENAI_LLM = "GENAI_LLM"
    ML_TRADITIONAL = "ML_TRADITIONAL"
    COMPUTER_VISION = "COMPUTER_VISION"
    NLP = "NLP"
    REINFORCEMENT_LEARNING = "REINFORCEMENT_LEARNING"
    MLOPS = "MLOPS"
    DATA_ENGINEERING = "DATA_ENGINEERING"
    OTHER = "OTHER"


class ProjectStatus(str, enum.Enum):
    PLANNED = "PLANNED"
    IN_PROGRESS = "IN_PROGRESS"
    ON_HOLD = "ON_HOLD"
    COMPLETED = "COMPLETED"
    ARCHIVED = "ARCHIVED"


class Priority(str, enum.Enum):
    LOW = "LOW"
    MEDIUM = "MEDIUM"
    HIGH = "HIGH"
    CRITICAL = "CRITICAL"


class Project(Base):
    __tablename__ = "projects"

    id = Column(String, primary_key=True, default=lambda: str(uuid.uuid4()))
    display_id = Column(String, nullable=False)
    user_id = Column(String, ForeignKey("users.id", ondelete="CASCADE"), nullable=False, index=True)

    name = Column(String(255), nullable=False)
    description = Column(Text, nullable=True)
    team_name = Column(String(255), nullable=True)

    ai_branch = Column(Enum(AIBranch), nullable=False)
    sub_domain = Column(String(255), nullable=True)

    problem_statement = Column(Text, nullable=False)
    target_user = Column(Text, nullable=False)
    target_user_persona = Column(JSON, nullable=True)
    technologies = Column(ARRAY(String), default=list)
    tech_stack = Column(JSON, nullable=True)

    status = Column(Enum(ProjectStatus), default=ProjectStatus.PLANNED, nullable=False, index=True)
    priority = Column(Enum(Priority), default=Priority.MEDIUM, nullable=False)
    progress = Column(Float, default=0.0, nullable=False)

    start_date = Column(DateTime, nullable=True)
    target_date = Column(DateTime, nullable=True)
    completed_date = Column(DateTime, nullable=True)

    tags = Column(ARRAY(String), default=list)
    external_links = Column(JSON, nullable=True)

    created_at = Column(DateTime, default=datetime.utcnow, nullable=False)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow, nullable=False)

    # Relationships
    user = relationship("User", back_populates="projects")
    milestones = relationship("Milestone", back_populates="project", cascade="all, delete-orphan", order_by="Milestone.order_index")
    deployments = relationship("Deployment", back_populates="project", cascade="all, delete-orphan")
    learnings = relationship("Learning", back_populates="project")
    chat_sessions = relationship("ChatSession", back_populates="project")

    def __repr__(self):
        return f"<Project(id={self.id}, name={self.name}, status={self.status})>"
