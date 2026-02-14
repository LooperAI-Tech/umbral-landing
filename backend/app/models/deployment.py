"""
Deployment model for tracking project deployments and releases
"""

import enum
import uuid
from datetime import datetime

from sqlalchemy import (
    Column, String, Text, DateTime, Integer,
    ForeignKey, Enum, ARRAY, JSON
)
from sqlalchemy.orm import relationship

from app.core.database import Base


class Environment(str, enum.Enum):
    DEVELOPMENT = "DEVELOPMENT"
    STAGING = "STAGING"
    PRODUCTION = "PRODUCTION"


class DeploymentStatus(str, enum.Enum):
    PREPARING = "PREPARING"
    DEPLOYING = "DEPLOYING"
    ACTIVE = "ACTIVE"
    DEPRECATED = "DEPRECATED"
    ROLLED_BACK = "ROLLED_BACK"
    FAILED = "FAILED"


class Deployment(Base):
    __tablename__ = "deployments"

    id = Column(String, primary_key=True, default=lambda: str(uuid.uuid4()))
    project_id = Column(String, ForeignKey("projects.id", ondelete="CASCADE"), nullable=False, index=True)

    version = Column(String(50), nullable=False)
    version_major = Column(Integer, nullable=False)
    version_minor = Column(Integer, nullable=False)
    version_patch = Column(Integer, default=0, nullable=False)
    release_notes = Column(Text, nullable=True)

    deploy_date = Column(DateTime, nullable=False)
    environment = Column(Enum(Environment), default=Environment.STAGING, nullable=False)
    access_url = Column(String(500), nullable=True)
    github_repo = Column(String(500), nullable=True)
    commit_hash = Column(String(40), nullable=True)

    testers_count = Column(Integer, default=0, nullable=False)
    tester_emails = Column(ARRAY(String), default=list)
    feedback_summary = Column(Text, nullable=True)
    feedback_items = Column(JSON, nullable=True)

    critical_bugs = Column(Text, nullable=True)
    bug_items = Column(JSON, nullable=True)

    next_improvements = Column(Text, nullable=True)
    improvements = Column(JSON, nullable=True)

    status = Column(Enum(DeploymentStatus), default=DeploymentStatus.ACTIVE, nullable=False, index=True)

    created_at = Column(DateTime, default=datetime.utcnow, nullable=False)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow, nullable=False)
    deprecated_at = Column(DateTime, nullable=True)

    # Relationships
    project = relationship("Project", back_populates="deployments")
    metrics = relationship("DeploymentMetrics", back_populates="deployment", uselist=False, cascade="all, delete-orphan")

    def __repr__(self):
        return f"<Deployment(id={self.id}, version={self.version}, status={self.status})>"
