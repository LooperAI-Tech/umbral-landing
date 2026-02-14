"""
DeploymentMetrics model for tracking deployment performance metrics
"""

import uuid
from datetime import datetime

from sqlalchemy import Column, String, Float, Integer, DateTime, ForeignKey, JSON
from sqlalchemy.orm import relationship

from app.core.database import Base


class DeploymentMetrics(Base):
    __tablename__ = "deployment_metrics"

    id = Column(String, primary_key=True, default=lambda: str(uuid.uuid4()))
    deployment_id = Column(String, ForeignKey("deployments.id", ondelete="CASCADE"), unique=True, nullable=False)

    avg_response_time = Column(Float, nullable=True)
    p95_response_time = Column(Float, nullable=True)
    uptime_percentage = Column(Float, nullable=True)
    accuracy_rate = Column(Float, nullable=True)
    error_rate = Column(Float, nullable=True)
    total_requests = Column(Integer, nullable=True)
    unique_users = Column(Integer, nullable=True)
    user_satisfaction = Column(Float, nullable=True)
    nps_score = Column(Integer, nullable=True)
    custom_metrics = Column(JSON, nullable=True)

    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow, nullable=False)

    # Relationships
    deployment = relationship("Deployment", back_populates="metrics")

    def __repr__(self):
        return f"<DeploymentMetrics(id={self.id}, deployment_id={self.deployment_id})>"
