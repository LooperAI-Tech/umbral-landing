"""
Chat Service for managing chat sessions and messages
"""

import uuid
import json
from typing import List, Optional, Dict, AsyncGenerator
from datetime import datetime
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select, and_, desc
from app.models import ChatSession, ChatMessage, Concept
from app.schemas.chat import ChatSessionCreate, ChatSessionUpdate, OpenFreeExport
from app.services.ai_service import AIService


class ChatService:
    """Service for managing chat sessions and messages"""

    @staticmethod
    async def create_session(
        db: AsyncSession,
        user_id: str,
        session_data: ChatSessionCreate
    ) -> ChatSession:
        """
        Create a new chat session

        Args:
            db: Database session
            user_id: User ID
            session_data: Session creation data

        Returns:
            Created ChatSession
        """
        session = ChatSession(
            id=str(uuid.uuid4()),
            user_id=user_id,
            title=session_data.title,
            ai_model=session_data.ai_model.value,
            teaching_method=session_data.teaching_method.value,
            concept_id=session_data.concept_id,
            status="active",
            total_messages=0,
            total_tokens=0,
        )

        db.add(session)
        await db.flush()
        await db.refresh(session)

        return session

    @staticmethod
    async def get_session(
        db: AsyncSession,
        session_id: str,
        user_id: str
    ) -> Optional[ChatSession]:
        """
        Get a chat session by ID

        Args:
            db: Database session
            session_id: Session ID
            user_id: User ID (for ownership check)

        Returns:
            ChatSession or None
        """
        result = await db.execute(
            select(ChatSession).where(
                and_(
                    ChatSession.id == session_id,
                    ChatSession.user_id == user_id
                )
            )
        )
        return result.scalar_one_or_none()

    @staticmethod
    async def list_sessions(
        db: AsyncSession,
        user_id: str,
        status: str = "active",
        limit: int = 20,
        offset: int = 0
    ) -> List[ChatSession]:
        """
        List user's chat sessions

        Args:
            db: Database session
            user_id: User ID
            status: Session status filter
            limit: Maximum number of sessions
            offset: Offset for pagination

        Returns:
            List of ChatSessions
        """
        query = select(ChatSession).where(
            and_(
                ChatSession.user_id == user_id,
                ChatSession.status == status
            )
        ).order_by(desc(ChatSession.updated_at)).limit(limit).offset(offset)

        result = await db.execute(query)
        return list(result.scalars().all())

    @staticmethod
    async def update_session(
        db: AsyncSession,
        session_id: str,
        user_id: str,
        update_data: ChatSessionUpdate
    ) -> Optional[ChatSession]:
        """
        Update a chat session

        Args:
            db: Database session
            session_id: Session ID
            user_id: User ID (for ownership check)
            update_data: Update data

        Returns:
            Updated ChatSession or None
        """
        session = await ChatService.get_session(db, session_id, user_id)
        if not session:
            return None

        # Update fields
        if update_data.title is not None:
            session.title = update_data.title
        if update_data.ai_model is not None:
            session.ai_model = update_data.ai_model.value
        if update_data.teaching_method is not None:
            session.teaching_method = update_data.teaching_method.value
        if update_data.status is not None:
            session.status = update_data.status

        session.updated_at = datetime.utcnow()

        await db.flush()
        await db.refresh(session)

        return session

    @staticmethod
    async def delete_session(
        db: AsyncSession,
        session_id: str,
        user_id: str
    ) -> bool:
        """
        Delete (soft delete) a chat session

        Args:
            db: Database session
            session_id: Session ID
            user_id: User ID (for ownership check)

        Returns:
            True if deleted, False if not found
        """
        session = await ChatService.get_session(db, session_id, user_id)
        if not session:
            return False

        session.status = "deleted"
        session.updated_at = datetime.utcnow()

        await db.flush()
        return True

    @staticmethod
    async def get_session_messages(
        db: AsyncSession,
        session_id: str,
        limit: int = 50,
        before_sequence: Optional[int] = None
    ) -> List[ChatMessage]:
        """
        Get messages for a chat session

        Args:
            db: Database session
            session_id: Session ID
            limit: Maximum number of messages
            before_sequence: Get messages before this sequence number

        Returns:
            List of ChatMessages
        """
        query = select(ChatMessage).where(ChatMessage.session_id == session_id)

        if before_sequence is not None:
            query = query.where(ChatMessage.sequence_number < before_sequence)

        query = query.order_by(ChatMessage.sequence_number).limit(limit)

        result = await db.execute(query)
        return list(result.scalars().all())

    @staticmethod
    async def add_message(
        db: AsyncSession,
        session_id: str,
        role: str,
        content: str,
        model_used: Optional[str] = None,
        tokens_used: int = 0,
        teaching_method: Optional[str] = None
    ) -> ChatMessage:
        """
        Add a message to a chat session

        Args:
            db: Database session
            session_id: Session ID
            role: Message role (user/assistant/system)
            content: Message content
            model_used: AI model used (for assistant messages)
            tokens_used: Tokens consumed
            teaching_method: Teaching method used

        Returns:
            Created ChatMessage
        """
        # Get current message count for sequence number
        result = await db.execute(
            select(ChatSession).where(ChatSession.id == session_id)
        )
        session = result.scalar_one()

        message = ChatMessage(
            id=str(uuid.uuid4()),
            session_id=session_id,
            role=role,
            content=content,
            model_used=model_used,
            tokens_used=tokens_used,
            teaching_method=teaching_method,
            sequence_number=session.total_messages,
        )

        db.add(message)

        # Update session stats
        session.total_messages += 1
        session.total_tokens += tokens_used
        session.last_message_at = datetime.utcnow()
        session.updated_at = datetime.utcnow()

        # Auto-generate title from first user message
        if session.total_messages == 1 and role == "user" and not session.title:
            # Use first 50 chars of first message as title
            session.title = content[:50] + ("..." if len(content) > 50 else "")

        await db.flush()
        await db.refresh(message)

        return message

    @staticmethod
    async def process_user_message(
        db: AsyncSession,
        session_id: str,
        user_id: str,
        content: str,
        model_override: Optional[str] = None,
        teaching_method_override: Optional[str] = None
    ) -> ChatMessage:
        """
        Process a user message and generate AI response

        Args:
            db: Database session
            session_id: Session ID
            user_id: User ID
            content: User message content
            model_override: Override session's AI model
            teaching_method_override: Override session's teaching method

        Returns:
            AI response message
        """
        # Verify session ownership
        session = await ChatService.get_session(db, session_id, user_id)
        if not session:
            raise ValueError("Session not found")

        # Save user message
        await ChatService.add_message(
            db=db,
            session_id=session_id,
            role="user",
            content=content,
        )

        # Get conversation history
        messages = await ChatService.get_session_messages(db, session_id, limit=50)

        # Build message history for AI (exclude system messages)
        message_history = [
            {"role": msg.role, "content": msg.content}
            for msg in messages
            if msg.role in ["user", "assistant"]
        ]

        # Get concept context if session is linked to a concept
        concept_context = None
        if session.concept_id:
            result = await db.execute(
                select(Concept).where(Concept.id == session.concept_id)
            )
            concept = result.scalar_one_or_none()
            if concept:
                concept_context = {
                    "name": concept.name,
                    "description": concept.description,
                }

        # Determine model and teaching method to use
        ai_model = model_override if model_override else session.ai_model
        teaching_method = teaching_method_override if teaching_method_override else session.teaching_method

        # Generate AI response
        try:
            response_content, tokens_used = await AIService.generate_response(
                messages=message_history,
                model=ai_model,
                teaching_method=teaching_method,
                concept_context=concept_context,
            )

            # Save AI response
            ai_message = await ChatService.add_message(
                db=db,
                session_id=session_id,
                role="assistant",
                content=response_content,
                model_used=ai_model,
                tokens_used=tokens_used,
                teaching_method=teaching_method,
            )

            await db.commit()
            return ai_message

        except Exception as e:
            await db.rollback()
            raise Exception(f"Failed to generate AI response: {str(e)}")

    @staticmethod
    async def export_session(
        db: AsyncSession,
        session_id: str,
        user_id: str,
        format: str = "openfree"
    ) -> Dict:
        """
        Export chat session in specified format

        Args:
            db: Database session
            session_id: Session ID
            user_id: User ID
            format: Export format (openfree, json, markdown)

        Returns:
            Export data as dict
        """
        # Get session
        session = await ChatService.get_session(db, session_id, user_id)
        if not session:
            raise ValueError("Session not found")

        # Get all messages
        messages = await ChatService.get_session_messages(db, session_id, limit=10000)

        if format == "openfree":
            return ChatService.format_openfree_export(session, messages)
        elif format == "json":
            return ChatService.format_json_export(session, messages)
        elif format == "markdown":
            return ChatService.format_markdown_export(session, messages)
        else:
            raise ValueError(f"Unsupported export format: {format}")

    @staticmethod
    def format_openfree_export(
        session: ChatSession,
        messages: List[ChatMessage]
    ) -> Dict:
        """Format session as OpenFree JSON specification"""
        return {
            "version": "1.0",
            "format": "openfree",
            "session_id": session.id,
            "title": session.title,
            "ai_model": session.ai_model,
            "teaching_method": session.teaching_method,
            "created_at": session.created_at.isoformat(),
            "updated_at": session.updated_at.isoformat(),
            "total_messages": session.total_messages,
            "total_tokens": session.total_tokens,
            "messages": [
                {
                    "id": msg.id,
                    "role": msg.role,
                    "content": msg.content,
                    "model_used": msg.model_used,
                    "tokens_used": msg.tokens_used,
                    "teaching_method": msg.teaching_method,
                    "sequence_number": msg.sequence_number,
                    "created_at": msg.created_at.isoformat(),
                }
                for msg in messages
            ],
            "metadata": {
                "platform": "Umbral EdTech",
                "concept_id": session.concept_id,
                "status": session.status,
            }
        }

    @staticmethod
    def format_json_export(
        session: ChatSession,
        messages: List[ChatMessage]
    ) -> Dict:
        """Format session as simple JSON"""
        return {
            "session": {
                "id": session.id,
                "title": session.title,
                "created_at": session.created_at.isoformat(),
            },
            "messages": [
                {
                    "role": msg.role,
                    "content": msg.content,
                    "timestamp": msg.created_at.isoformat(),
                }
                for msg in messages
            ]
        }

    @staticmethod
    def format_markdown_export(
        session: ChatSession,
        messages: List[ChatMessage]
    ) -> str:
        """Format session as Markdown"""
        lines = [
            f"# {session.title or 'Chat Session'}",
            f"",
            f"**Session ID:** {session.id}",
            f"**Created:** {session.created_at.strftime('%Y-%m-%d %H:%M:%S')}",
            f"**Model:** {session.ai_model}",
            f"**Teaching Method:** {session.teaching_method}",
            f"",
            "---",
            f""
        ]

        for msg in messages:
            role_label = "🙋 **User**" if msg.role == "user" else "🤖 **Assistant**"
            lines.append(f"## {role_label}")
            lines.append(f"")
            lines.append(msg.content)
            lines.append(f"")

        return "\n".join(lines)
