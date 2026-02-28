"""
Pydantic schemas for chat functionality
"""

from enum import Enum
from typing import Optional, List
from datetime import datetime
from pydantic import BaseModel, Field


class MessageRole(str, Enum):
    USER = "user"
    ASSISTANT = "assistant"
    SYSTEM = "system"


# Base schemas
class ChatMessageBase(BaseModel):
    content: str = Field(..., min_length=1, max_length=50000)
    role: MessageRole = MessageRole.USER


class ChatSessionBase(BaseModel):
    title: Optional[str] = Field(None, max_length=255)
    project_id: Optional[str] = None
    milestone_id: Optional[str] = None
    task_id: Optional[str] = None


# Create schemas
class ChatSessionCreate(ChatSessionBase):
    session_type: Optional[str] = "general"


class ChatMessageCreate(ChatMessageBase):
    session_id: str


class SendMessageRequest(BaseModel):
    content: str = Field(..., min_length=1, max_length=50000)


# Update schemas
class ChatSessionUpdate(BaseModel):
    title: Optional[str] = Field(None, max_length=255)
    project_id: Optional[str] = None
    status: Optional[str] = Field(None, pattern="^(active|archived|deleted)$")


# Response schemas
class ChatMessageResponse(ChatMessageBase):
    id: str
    session_id: str
    model_used: Optional[str] = None
    tokens_used: int
    sequence_number: int
    created_at: datetime

    class Config:
        from_attributes = True


class ChatSessionResponse(ChatSessionBase):
    id: str
    user_id: str
    milestone_id: Optional[str] = None
    task_id: Optional[str] = None
    status: str
    session_type: str = "general"
    total_messages: int
    total_tokens: int
    created_at: datetime
    updated_at: datetime
    last_message_at: Optional[datetime] = None

    class Config:
        from_attributes = True


class ChatMessageWithActionResponse(ChatMessageResponse):
    action: Optional[str] = None
    action_data: Optional[dict] = None


class ChatSessionWithMessagesResponse(ChatSessionResponse):
    messages: List[ChatMessageResponse] = []


# Extract learning from chat
class ExtractLearningRequest(BaseModel):
    session_id: str


class ExtractedLearning(BaseModel):
    concept: str
    category: str
    what_learned: str
    when_to_use: str
    when_not_to_use: str
    confidence_level: str = "LEARNING"


class ExtractLearningResponse(BaseModel):
    learnings: List[ExtractedLearning]
    session_id: str


# Stream response for SSE
class StreamChunk(BaseModel):
    type: str  # "content", "done", "error"
    content: Optional[str] = None
    message_id: Optional[str] = None
    tokens_used: Optional[int] = None


# Export schemas
class OpenFreeExport(BaseModel):
    version: str = "1.0"
    session_id: str
    title: Optional[str] = None
    created_at: datetime
    messages: List[dict]
    metadata: dict
