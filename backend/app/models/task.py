"""
Task model for tracking individual work items within milestones
"""

import enum
import uuid
from datetime import datetime

from sqlalchemy import (
    Column, String, Text, DateTime, Float, Integer,
    ForeignKey, Enum
)
from sqlalchemy.orm import relationship

from app.core.database import Base


class TaskType(str, enum.Enum):
    DEVELOPMENT = "DEVELOPMENT"
    PROMPT_ENGINEERING = "PROMPT_ENGINEERING"
    FRONTEND = "FRONTEND"
    BACKEND = "BACKEND"
    DEPLOYMENT = "DEPLOYMENT"
    RESEARCH = "RESEARCH"
    TESTING = "TESTING"
    DOCUMENTATION = "DOCUMENTATION"
    DESIGN = "DESIGN"
    DATA_WORK = "DATA_WORK"
    INTEGRATION = "INTEGRATION"
    OTHER = "OTHER"


class Complexity(str, enum.Enum):
    TRIVIAL = "TRIVIAL"
    EASY = "EASY"
    MEDIUM = "MEDIUM"
    HARD = "HARD"
    COMPLEX = "COMPLEX"


class TaskStatus(str, enum.Enum):
    PLANNED = "PLANNED"
    IN_PROGRESS = "IN_PROGRESS"
    IN_REVIEW = "IN_REVIEW"
    BLOCKED = "BLOCKED"
    COMPLETED = "COMPLETED"
    CANCELLED = "CANCELLED"
    DELETED = "DELETED"


class Task(Base):
    __tablename__ = "tasks"

    id = Column(String, primary_key=True, default=lambda: str(uuid.uuid4()))
    milestone_id = Column(String, ForeignKey("milestones.id", ondelete="CASCADE"), nullable=False, index=True)

    order_index = Column(Integer, nullable=False)
    task_number = Column(String(20), nullable=False)

    title = Column(String(255), nullable=False)
    description = Column(Text, nullable=True)

    task_type = Column(Enum(TaskType), nullable=False)
    tech_component = Column(String(255), nullable=False)
    complexity = Column(Enum(Complexity), default=Complexity.MEDIUM, nullable=False)

    estimated_hours = Column(Float, nullable=True)
    actual_hours = Column(Float, nullable=True)

    status = Column(Enum(TaskStatus), default=TaskStatus.PLANNED, nullable=False, index=True)

    blockers = Column(Text, nullable=True)
    notes = Column(Text, nullable=True)

    started_at = Column(DateTime, nullable=True)
    completed_at = Column(DateTime, nullable=True)
    due_date = Column(DateTime, nullable=True)

    created_at = Column(DateTime, default=datetime.utcnow, nullable=False)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow, nullable=False)

    # Relationships
    milestone = relationship("Milestone", back_populates="tasks")

    def __repr__(self):
        return f"<Task(id={self.id}, title={self.title}, status={self.status})>"
