"""
Milestone model for tracking project milestones
"""

import enum
import uuid
from datetime import datetime

from sqlalchemy import (
    Column, String, Text, DateTime, Float, Integer,
    ForeignKey, Enum, ARRAY, JSON, UniqueConstraint
)
from sqlalchemy.orm import relationship

from app.core.database import Base


class DeliverableType(str, enum.Enum):
    MVP = "MVP"
    FEATURE = "FEATURE"
    INTEGRATION = "INTEGRATION"
    DEPLOYMENT = "DEPLOYMENT"
    DOCUMENTATION = "DOCUMENTATION"
    RESEARCH = "RESEARCH"
    OTHER = "OTHER"


class MilestoneStatus(str, enum.Enum):
    PLANNED = "PLANNED"
    IN_PROGRESS = "IN_PROGRESS"
    BLOCKED = "BLOCKED"
    COMPLETED = "COMPLETED"
    SKIPPED = "SKIPPED"


class Milestone(Base):
    __tablename__ = "milestones"
    __table_args__ = (
        UniqueConstraint("project_id", "milestone_number", name="uq_project_milestone_number"),
    )

    id = Column(String, primary_key=True, default=lambda: str(uuid.uuid4()))
    project_id = Column(String, ForeignKey("projects.id", ondelete="CASCADE"), nullable=False, index=True)

    order_index = Column(Integer, nullable=False)
    milestone_number = Column(Integer, nullable=False)

    name = Column(String(255), nullable=False)
    description = Column(Text, nullable=True)

    deliverable = Column(Text, nullable=False)
    deliverable_type = Column(Enum(DeliverableType), nullable=False)

    success_criteria = Column(Text, nullable=False)
    metrics = Column(JSON, nullable=True)

    status = Column(Enum(MilestoneStatus), default=MilestoneStatus.PLANNED, nullable=False)
    progress = Column(Float, default=0.0, nullable=False)

    start_date = Column(DateTime, nullable=True)
    target_date = Column(DateTime, nullable=True)
    completed_date = Column(DateTime, nullable=True)

    depends_on = Column(ARRAY(String), default=list)

    created_at = Column(DateTime, default=datetime.utcnow, nullable=False)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow, nullable=False)

    # Relationships
    project = relationship("Project", back_populates="milestones")
    tasks = relationship("Task", back_populates="milestone", cascade="all, delete-orphan", order_by="Task.order_index")

    def __repr__(self):
        return f"<Milestone(id={self.id}, name={self.name}, status={self.status})>"
