"""
Pydantic schemas for concept and knowledge graph functionality
"""

from enum import Enum
from typing import Optional, List, Dict, Any
from datetime import datetime
from pydantic import BaseModel, Field


# Enums
class ConceptTierEnum(str, Enum):
    """Concept tier levels"""
    CORE = "core"
    PILLAR = "pillar"
    SUBTOPIC = "subtopic"


class RelationshipTypeEnum(str, Enum):
    """Types of concept relationships"""
    PREREQUISITE = "prerequisite"
    RELATED = "related"
    INCLUDES = "includes"
    EXPANDS = "expands"


# Base schemas
class ConceptBase(BaseModel):
    """Base schema for concepts"""
    name: str = Field(..., min_length=1, max_length=255)
    description: Optional[str] = None
    tier: ConceptTierEnum
    parent_id: Optional[str] = None
    color: Optional[str] = Field(None, pattern="^#[0-9A-Fa-f]{6}$")  # Hex color
    icon: Optional[str] = Field(None, max_length=50)


class ConceptRelationshipBase(BaseModel):
    """Base schema for concept relationships"""
    source_id: str
    target_id: str
    relationship_type: RelationshipTypeEnum
    strength: float = Field(1.0, ge=0.0, le=1.0)
    label: Optional[str] = Field(None, max_length=100)


# Create schemas
class ConceptCreate(ConceptBase):
    """Schema for creating a concept"""
    keywords: List[str] = []


class ConceptRelationshipCreate(ConceptRelationshipBase):
    """Schema for creating a concept relationship"""
    pass


# Update schemas
class ConceptUpdate(BaseModel):
    """Schema for updating a concept"""
    name: Optional[str] = Field(None, min_length=1, max_length=255)
    description: Optional[str] = None
    summary: Optional[str] = None
    keywords: Optional[List[str]] = None
    color: Optional[str] = Field(None, pattern="^#[0-9A-Fa-f]{6}$")
    icon: Optional[str] = Field(None, max_length=50)
    is_public: Optional[bool] = None


# Response schemas
class ConceptResponse(ConceptBase):
    """Response schema for concepts"""
    id: str
    slug: str
    summary: Optional[str] = None
    keywords: List[str] = []
    is_public: bool
    created_at: datetime
    updated_at: datetime

    class Config:
        from_attributes = True


class ConceptRelationshipResponse(ConceptRelationshipBase):
    """Response schema for concept relationships"""
    id: str
    created_at: datetime

    class Config:
        from_attributes = True


# Nested response for hierarchy
class ConceptWithChildren(ConceptResponse):
    """Response schema for concept with its children"""
    children: List["ConceptWithChildren"] = []


# React Flow graph schemas
class GraphNodeData(BaseModel):
    """Data payload for a React Flow node"""
    label: str
    description: Optional[str] = None
    tier: str
    color: Optional[str] = None
    icon: Optional[str] = None
    hasChildren: bool = False
    isExpanded: bool = False


class GraphNode(BaseModel):
    """React Flow node format"""
    id: str
    type: str  # "core", "pillar", "subtopic", or "default"
    position: Dict[str, float]  # {x: float, y: float}
    data: GraphNodeData


class GraphEdge(BaseModel):
    """React Flow edge format"""
    id: str
    source: str
    target: str
    type: str = "default"  # "default", "smoothstep", "step", "straight"
    label: Optional[str] = None
    animated: bool = False
    style: Optional[Dict[str, Any]] = None


class ConceptGraphResponse(BaseModel):
    """Response schema for concept graph"""
    nodes: List[GraphNode]
    edges: List[GraphEdge]
    rootConceptId: Optional[str] = None


# Search schemas
class ConceptSearchParams(BaseModel):
    """Parameters for concept search"""
    query: Optional[str] = None
    tier: Optional[ConceptTierEnum] = None
    parent_id: Optional[str] = None
    limit: int = Field(50, ge=1, le=200)
    offset: int = Field(0, ge=0)


# Update forward references
ConceptWithChildren.model_rebuild()
