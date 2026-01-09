"""
ChatSession model for managing AI chat conversations
"""

from datetime import datetime
from sqlalchemy import Column, String, DateTime, Integer, ForeignKey
from sqlalchemy.orm import relationship
from app.core.database import Base


class ChatSession(Base):
    """
    ChatSession model representing a conversation between user and AI
    """
    __tablename__ = "chat_sessions"

    # Primary key
    id = Column(String, primary_key=True, index=True)  # UUID string

    # Foreign keys
    user_id = Column(String, ForeignKey("users.id", ondelete="CASCADE"), nullable=False, index=True)
    concept_id = Column(String, ForeignKey("concepts.id", ondelete="SET NULL"), nullable=True, index=True)

    # Session configuration
    title = Column(String(255), nullable=True)  # Auto-generated or user-set title
    ai_model = Column(String(50), default="openai/gpt-4-turbo", nullable=False)  # OpenRouter model identifier
    teaching_method = Column(String(50), default="conceptual", nullable=False)  # practical, conceptual, analogical, step-by-step

    # Session state
    status = Column(String(20), default="active", nullable=False)  # active, archived, deleted
    total_messages = Column(Integer, default=0, nullable=False)
    total_tokens = Column(Integer, default=0, nullable=False)

    # Timestamps
    created_at = Column(DateTime, default=datetime.utcnow, nullable=False)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow, nullable=False)
    last_message_at = Column(DateTime, nullable=True)

    # Relationships
    user = relationship("User", back_populates="chat_sessions")
    messages = relationship("ChatMessage", back_populates="session", cascade="all, delete-orphan", order_by="ChatMessage.sequence_number")
    concept = relationship("Concept", back_populates="chat_sessions")

    def __repr__(self):
        return f"<ChatSession(id={self.id}, user_id={self.user_id}, model={self.ai_model}, messages={self.total_messages})>"
