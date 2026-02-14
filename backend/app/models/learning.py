"""
Learning model for tracking documented learnings and knowledge
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


class LearningCategory(str, enum.Enum):
    PROMPT_ENGINEERING = "PROMPT_ENGINEERING"
    RAG_RETRIEVAL = "RAG_RETRIEVAL"
    FINE_TUNING = "FINE_TUNING"
    MODEL_SELECTION = "MODEL_SELECTION"
    EMBEDDINGS = "EMBEDDINGS"
    AGENTS = "AGENTS"
    EVALUATION = "EVALUATION"
    DATA_PROCESSING = "DATA_PROCESSING"
    MLOPS = "MLOPS"
    DEPLOYMENT = "DEPLOYMENT"
    UX_PATTERNS = "UX_PATTERNS"
    ARCHITECTURE = "ARCHITECTURE"
    PERFORMANCE = "PERFORMANCE"
    SECURITY = "SECURITY"
    COST_OPTIMIZATION = "COST_OPTIMIZATION"
    OTHER = "OTHER"


class ConfidenceLevel(str, enum.Enum):
    EXPLORING = "EXPLORING"
    LEARNING = "LEARNING"
    PRACTICING = "PRACTICING"
    CONFIDENT = "CONFIDENT"
    EXPERT = "EXPERT"


class Learning(Base):
    __tablename__ = "learnings"

    id = Column(String, primary_key=True, default=lambda: str(uuid.uuid4()))
    user_id = Column(String, ForeignKey("users.id", ondelete="CASCADE"), nullable=False, index=True)
    project_id = Column(String, ForeignKey("projects.id", ondelete="SET NULL"), nullable=True, index=True)
    milestone_number = Column(Integer, nullable=True)

    concept = Column(String(255), nullable=False)
    category = Column(Enum(LearningCategory), nullable=False, index=True)
    subcategory = Column(String(255), nullable=True)

    what_learned = Column(Text, nullable=False)
    when_to_use = Column(Text, nullable=False)
    when_not_to_use = Column(Text, nullable=False)

    implemented_in = Column(String(255), nullable=False)
    code_snippets = Column(JSON, nullable=True)
    resources = Column(JSON, nullable=True)

    related_concepts = Column(ARRAY(String), default=list)
    tags = Column(ARRAY(String), default=list)

    confidence_level = Column(Enum(ConfidenceLevel), default=ConfidenceLevel.LEARNING, nullable=False)

    date_learned = Column(DateTime, default=datetime.utcnow, nullable=False)
    last_reviewed = Column(DateTime, nullable=True)
    next_review_date = Column(DateTime, nullable=True)

    created_at = Column(DateTime, default=datetime.utcnow, nullable=False)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow, nullable=False)

    # Relationships
    user = relationship("User", back_populates="learnings")
    project = relationship("Project", back_populates="learnings")

    def __repr__(self):
        return f"<Learning(id={self.id}, concept={self.concept}, category={self.category})>"
