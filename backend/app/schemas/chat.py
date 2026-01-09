"""
Pydantic schemas for chat functionality
"""

from enum import Enum
from typing import Optional, List
from datetime import datetime
from pydantic import BaseModel, Field


# Enums
class TeachingMethod(str, Enum):
    """Teaching methodologies for AI responses"""
    PRACTICAL = "practical"
    CONCEPTUAL = "conceptual"
    ANALOGICAL = "analogical"
    STEP_BY_STEP = "step-by-step"


class AIModel(str, Enum):
    """Available AI models through OpenRouter"""
    GPT4_TURBO = "openai/gpt-4-turbo"
    GPT4 = "openai/gpt-4"
    CLAUDE_3_SONNET = "anthropic/claude-3-sonnet"
    CLAUDE_3_OPUS = "anthropic/claude-3-opus"
    LLAMA_3_70B = "meta-llama/llama-3-70b-instruct"


class MessageRole(str, Enum):
    """Message roles in chat"""
    USER = "user"
    ASSISTANT = "assistant"
    SYSTEM = "system"


# Base schemas
class ChatMessageBase(BaseModel):
    """Base schema for chat messages"""
    content: str = Field(..., min_length=1, max_length=50000)
    role: MessageRole = MessageRole.USER


class ChatSessionBase(BaseModel):
    """Base schema for chat sessions"""
    title: Optional[str] = Field(None, max_length=255)
    ai_model: AIModel = AIModel.GPT4_TURBO
    teaching_method: TeachingMethod = TeachingMethod.CONCEPTUAL
    concept_id: Optional[str] = None


# Create schemas
class ChatSessionCreate(ChatSessionBase):
    """Schema for creating a chat session"""
    pass


class ChatMessageCreate(ChatMessageBase):
    """Schema for creating a chat message"""
    session_id: str


class SendMessageRequest(BaseModel):
    """Request schema for sending a message"""
    content: str = Field(..., min_length=1, max_length=50000)
    ai_model: Optional[AIModel] = None  # Override session default
    teaching_method: Optional[TeachingMethod] = None  # Override session default


# Update schemas
class ChatSessionUpdate(BaseModel):
    """Schema for updating a chat session"""
    title: Optional[str] = Field(None, max_length=255)
    ai_model: Optional[AIModel] = None
    teaching_method: Optional[TeachingMethod] = None
    status: Optional[str] = Field(None, pattern="^(active|archived|deleted)$")


# Response schemas
class ChatMessageResponse(ChatMessageBase):
    """Response schema for chat messages"""
    id: str
    session_id: str
    model_used: Optional[str] = None
    tokens_used: int
    teaching_method: Optional[str] = None
    sequence_number: int
    created_at: datetime

    class Config:
        from_attributes = True


class ChatSessionResponse(ChatSessionBase):
    """Response schema for chat sessions"""
    id: str
    user_id: str
    status: str
    total_messages: int
    total_tokens: int
    created_at: datetime
    updated_at: datetime
    last_message_at: Optional[datetime] = None

    class Config:
        from_attributes = True


class ChatSessionWithMessagesResponse(ChatSessionResponse):
    """Response schema for chat session with messages"""
    messages: List[ChatMessageResponse] = []


# Stream response for SSE (future use)
class StreamChunk(BaseModel):
    """Schema for streaming chunks"""
    type: str  # "content", "done", "error"
    content: Optional[str] = None
    message_id: Optional[str] = None
    tokens_used: Optional[int] = None


# Export schemas
class OpenFreeExport(BaseModel):
    """OpenFree format export schema"""
    version: str = "1.0"
    session_id: str
    title: Optional[str] = None
    ai_model: str
    teaching_method: str
    created_at: datetime
    messages: List[dict]
    metadata: dict
