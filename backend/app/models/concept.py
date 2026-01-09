"""
Concept model for the knowledge graph
"""

import enum
from datetime import datetime
from sqlalchemy import Column, String, DateTime, Boolean, Text, Enum, ForeignKey, ARRAY
from sqlalchemy.orm import relationship
from app.core.database import Base


class ConceptTier(enum.Enum):
    """Tier levels for concept hierarchy"""
    CORE = "core"              # Top-level concept (e.g., "Computer Science")
    PILLAR = "pillar"          # Fundamental pillar (e.g., "Algorithms")
    SUBTOPIC = "subtopic"      # Specific subtopic (e.g., "Sorting Algorithms")


class Concept(Base):
    """
    Concept model representing a node in the knowledge graph
    Supports three-tier hierarchy: Core → Pillar → Subtopic
    """
    __tablename__ = "concepts"

    # Primary key
    id = Column(String, primary_key=True, index=True)  # UUID string

    # Core fields
    name = Column(String(255), nullable=False)
    slug = Column(String(255), unique=True, nullable=False, index=True)
    description = Column(Text, nullable=True)
    tier = Column(Enum(ConceptTier), nullable=False)

    # Hierarchy
    parent_id = Column(String, ForeignKey("concepts.id"), nullable=True, index=True)

    # Content
    summary = Column(Text, nullable=True)  # Brief AI-generated summary
    keywords = Column(ARRAY(String), default=list)  # For search

    # Visual properties (for graph rendering)
    color = Column(String(7), nullable=True)  # Hex color
    icon = Column(String(50), nullable=True)  # Icon identifier

    # Metadata
    is_public = Column(Boolean, default=True, nullable=False)
    created_by = Column(String, ForeignKey("users.id"), nullable=True)

    # Vector embedding ID (for ChromaDB)
    embedding_id = Column(String, nullable=True)

    # Timestamps
    created_at = Column(DateTime, default=datetime.utcnow, nullable=False)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow, nullable=False)

    # Relationships
    parent = relationship("Concept", remote_side=[id], backref="children")
    chat_sessions = relationship("ChatSession", back_populates="concept")
    relationships_from = relationship(
        "ConceptRelationship",
        foreign_keys="ConceptRelationship.source_id",
        back_populates="source"
    )
    relationships_to = relationship(
        "ConceptRelationship",
        foreign_keys="ConceptRelationship.target_id",
        back_populates="target"
    )

    def __repr__(self):
        return f"<Concept(id={self.id}, name={self.name}, tier={self.tier.value})>"

    @property
    def tier_value(self) -> str:
        """Get tier as string"""
        return self.tier.value if self.tier else None
