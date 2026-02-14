"""
UserStats model for aggregated user statistics
"""

import uuid
from datetime import datetime

from sqlalchemy import Column, String, Integer, DateTime, ForeignKey
from sqlalchemy.orm import relationship

from app.core.database import Base


class UserStats(Base):
    __tablename__ = "user_stats"

    id = Column(String, primary_key=True, default=lambda: str(uuid.uuid4()))
    user_id = Column(String, ForeignKey("users.id", ondelete="CASCADE"), unique=True, nullable=False)

    total_projects = Column(Integer, default=0, nullable=False)
    active_projects = Column(Integer, default=0, nullable=False)
    completed_projects = Column(Integer, default=0, nullable=False)
    total_milestones = Column(Integer, default=0, nullable=False)
    completed_milestones = Column(Integer, default=0, nullable=False)
    total_tasks = Column(Integer, default=0, nullable=False)
    completed_tasks = Column(Integer, default=0, nullable=False)
    total_deployments = Column(Integer, default=0, nullable=False)
    total_learnings = Column(Integer, default=0, nullable=False)

    current_streak = Column(Integer, default=0, nullable=False)
    longest_streak = Column(Integer, default=0, nullable=False)
    last_activity_date = Column(DateTime, nullable=True)

    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow, nullable=False)

    # Relationships
    user = relationship("User", back_populates="stats")

    def __repr__(self):
        return f"<UserStats(user_id={self.user_id}, projects={self.total_projects})>"
