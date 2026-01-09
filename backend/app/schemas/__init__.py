"""
Pydantic schemas package
"""

from app.schemas.user import (
    UserBase,
    UserCreate,
    UserUpdate,
    UserResponse,
)

from app.schemas.chat import (
    TeachingMethod,
    AIModel,
    MessageRole,
    ChatMessageBase,
    ChatSessionBase,
    ChatSessionCreate,
    ChatMessageCreate,
    SendMessageRequest,
    ChatSessionUpdate,
    ChatMessageResponse,
    ChatSessionResponse,
    ChatSessionWithMessagesResponse,
    StreamChunk,
    OpenFreeExport,
)

from app.schemas.concept import (
    ConceptTierEnum,
    RelationshipTypeEnum,
    ConceptBase,
    ConceptRelationshipBase,
    ConceptCreate,
    ConceptRelationshipCreate,
    ConceptUpdate,
    ConceptResponse,
    ConceptRelationshipResponse,
    ConceptWithChildren,
    GraphNode,
    GraphEdge,
    GraphNodeData,
    ConceptGraphResponse,
    ConceptSearchParams,
)

__all__ = [
    # User schemas
    "UserBase",
    "UserCreate",
    "UserUpdate",
    "UserResponse",
    # Chat schemas
    "TeachingMethod",
    "AIModel",
    "MessageRole",
    "ChatMessageBase",
    "ChatSessionBase",
    "ChatSessionCreate",
    "ChatMessageCreate",
    "SendMessageRequest",
    "ChatSessionUpdate",
    "ChatMessageResponse",
    "ChatSessionResponse",
    "ChatSessionWithMessagesResponse",
    "StreamChunk",
    "OpenFreeExport",
    # Concept schemas
    "ConceptTierEnum",
    "RelationshipTypeEnum",
    "ConceptBase",
    "ConceptRelationshipBase",
    "ConceptCreate",
    "ConceptRelationshipCreate",
    "ConceptUpdate",
    "ConceptResponse",
    "ConceptRelationshipResponse",
    "ConceptWithChildren",
    "GraphNode",
    "GraphEdge",
    "GraphNodeData",
    "ConceptGraphResponse",
    "ConceptSearchParams",
]
