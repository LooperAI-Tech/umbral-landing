"""
ConceptRelationship model for edges in the knowledge graph
"""

import enum
from datetime import datetime
from sqlalchemy import Column, String, DateTime, Float, Enum, ForeignKey, UniqueConstraint
from sqlalchemy.orm import relationship
from app.core.database import Base


class RelationshipType(enum.Enum):
    """Types of relationships between concepts"""
    PREREQUISITE = "prerequisite"     # Source is prerequisite for target
    RELATED = "related"               # Concepts are related
    INCLUDES = "includes"             # Source includes target
    EXPANDS = "expands"               # Target expands on source


class ConceptRelationship(Base):
    """
    ConceptRelationship model representing edges between concepts
    """
    __tablename__ = "concept_relationships"

    # Primary key
    id = Column(String, primary_key=True, index=True)  # UUID string

    # Foreign keys
    source_id = Column(String, ForeignKey("concepts.id", ondelete="CASCADE"), nullable=False, index=True)
    target_id = Column(String, ForeignKey("concepts.id", ondelete="CASCADE"), nullable=False, index=True)

    # Relationship properties
    relationship_type = Column(Enum(RelationshipType), nullable=False)
    strength = Column(Float, default=1.0, nullable=False)  # 0.0 to 1.0 relationship strength
    label = Column(String(100), nullable=True)  # Edge label for display

    # Timestamps
    created_at = Column(DateTime, default=datetime.utcnow, nullable=False)

    # Relationships
    source = relationship("Concept", foreign_keys=[source_id], back_populates="relationships_from")
    target = relationship("Concept", foreign_keys=[target_id], back_populates="relationships_to")

    # Unique constraint to prevent duplicate relationships
    __table_args__ = (
        UniqueConstraint('source_id', 'target_id', 'relationship_type', name='unique_relationship'),
    )

    def __repr__(self):
        return f"<ConceptRelationship(id={self.id}, {self.source_id} -> {self.target_id}, type={self.relationship_type.value})>"

    @property
    def relationship_type_value(self) -> str:
        """Get relationship type as string"""
        return self.relationship_type.value if self.relationship_type else None
