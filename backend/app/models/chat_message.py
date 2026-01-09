"""
ChatMessage model for individual messages in chat sessions
"""

from datetime import datetime
from sqlalchemy import Column, String, DateTime, Integer, Text, ForeignKey
from sqlalchemy.orm import relationship
from app.core.database import Base


class ChatMessage(Base):
    """
    ChatMessage model representing a single message in a chat session
    """
    __tablename__ = "chat_messages"

    # Primary key
    id = Column(String, primary_key=True, index=True)  # UUID string

    # Foreign key
    session_id = Column(String, ForeignKey("chat_sessions.id", ondelete="CASCADE"), nullable=False, index=True)

    # Message content
    role = Column(String(20), nullable=False)  # user, assistant, system
    content = Column(Text, nullable=False)

    # AI metadata (only for assistant messages)
    model_used = Column(String(50), nullable=True)  # Model used for this response
    tokens_used = Column(Integer, default=0, nullable=False)
    teaching_method = Column(String(50), nullable=True)  # Method used for this response

    # Message metadata
    sequence_number = Column(Integer, nullable=False)  # Order in conversation
    parent_message_id = Column(String, nullable=True)  # For threading if needed

    # Timestamps
    created_at = Column(DateTime, default=datetime.utcnow, nullable=False)

    # Relationships
    session = relationship("ChatSession", back_populates="messages")

    def __repr__(self):
        return f"<ChatMessage(id={self.id}, session_id={self.session_id}, role={self.role}, seq={self.sequence_number})>"

    @property
    def is_user_message(self) -> bool:
        """Check if message is from user"""
        return self.role == "user"

    @property
    def is_assistant_message(self) -> bool:
        """Check if message is from assistant"""
        return self.role == "assistant"
