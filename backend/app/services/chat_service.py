"""
Chat Service for managing chat sessions and messages
"""

import uuid
import json
from typing import List, Optional, Dict
from datetime import datetime
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select, and_, desc
from sqlalchemy.orm import selectinload

from app.models import ChatSession, ChatMessage, Project, Learning
from app.schemas.chat import ChatSessionCreate, ChatSessionUpdate
from app.services.ai_service import AIService


class ChatService:

    @staticmethod
    async def create_session(
        db: AsyncSession, user_id: str, session_data: ChatSessionCreate
    ) -> ChatSession:
        session = ChatSession(
            id=str(uuid.uuid4()),
            user_id=user_id,
            title=session_data.title,
            project_id=session_data.project_id,
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
        db: AsyncSession, session_id: str, user_id: str
    ) -> Optional[ChatSession]:
        result = await db.execute(
            select(ChatSession).where(
                and_(ChatSession.id == session_id, ChatSession.user_id == user_id)
            )
        )
        return result.scalar_one_or_none()

    @staticmethod
    async def list_sessions(
        db: AsyncSession, user_id: str, status: str = "active",
        limit: int = 20, offset: int = 0
    ) -> List[ChatSession]:
        result = await db.execute(
            select(ChatSession)
            .where(and_(ChatSession.user_id == user_id, ChatSession.status == status))
            .order_by(desc(ChatSession.updated_at))
            .limit(limit)
            .offset(offset)
        )
        return list(result.scalars().all())

    @staticmethod
    async def update_session(
        db: AsyncSession, session_id: str, user_id: str, update_data: ChatSessionUpdate
    ) -> Optional[ChatSession]:
        session = await ChatService.get_session(db, session_id, user_id)
        if not session:
            return None

        if update_data.title is not None:
            session.title = update_data.title
        if update_data.project_id is not None:
            session.project_id = update_data.project_id
        if update_data.status is not None:
            session.status = update_data.status

        session.updated_at = datetime.utcnow()
        await db.flush()
        await db.refresh(session)
        return session

    @staticmethod
    async def delete_session(
        db: AsyncSession, session_id: str, user_id: str
    ) -> bool:
        session = await ChatService.get_session(db, session_id, user_id)
        if not session:
            return False

        session.status = "deleted"
        session.updated_at = datetime.utcnow()
        await db.flush()
        return True

    @staticmethod
    async def get_session_messages(
        db: AsyncSession, session_id: str, limit: int = 50,
        before_sequence: Optional[int] = None
    ) -> List[ChatMessage]:
        query = select(ChatMessage).where(ChatMessage.session_id == session_id)
        if before_sequence is not None:
            query = query.where(ChatMessage.sequence_number < before_sequence)
        query = query.order_by(ChatMessage.sequence_number).limit(limit)

        result = await db.execute(query)
        return list(result.scalars().all())

    @staticmethod
    async def add_message(
        db: AsyncSession, session_id: str, role: str, content: str,
        model_used: Optional[str] = None, tokens_used: int = 0
    ) -> ChatMessage:
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
            sequence_number=session.total_messages,
        )
        db.add(message)

        session.total_messages += 1
        session.total_tokens += tokens_used
        session.last_message_at = datetime.utcnow()
        session.updated_at = datetime.utcnow()

        if session.total_messages == 1 and role == "user" and not session.title:
            session.title = content[:50] + ("..." if len(content) > 50 else "")

        await db.flush()
        await db.refresh(message)
        return message

    @staticmethod
    async def _build_user_context(
        db: AsyncSession, user_id: str, project_id: Optional[str] = None
    ) -> Dict:
        """Build context for the AI from user's projects and learnings."""
        from app.services.user_service import UserService

        user = await UserService.get_user_by_id(db, user_id)
        context = {"user_name": user.full_name if user else "User"}

        # Get active projects
        result = await db.execute(
            select(Project)
            .where(and_(Project.user_id == user_id, Project.status.in_(["IN_PROGRESS", "PLANNED"])))
            .limit(5)
        )
        projects = result.scalars().all()
        context["projects"] = [
            {
                "display_id": p.display_id,
                "name": p.name,
                "ai_branch": p.ai_branch.value if p.ai_branch else "",
                "progress": p.progress,
                "technologies": p.technologies or [],
            }
            for p in projects
        ]

        # Current project context
        if project_id:
            result = await db.execute(
                select(Project)
                .options(selectinload(Project.milestones))
                .where(and_(Project.id == project_id, Project.user_id == user_id))
            )
            current = result.scalar_one_or_none()
            if current:
                context["current_project"] = {
                    "name": current.name,
                    "problem_statement": current.problem_statement,
                    "target_user": current.target_user,
                    "milestones": [
                        {
                            "milestone_number": m.milestone_number,
                            "name": m.name,
                            "status": m.status.value if m.status else "",
                            "deliverable": m.deliverable,
                        }
                        for m in (current.milestones or [])
                    ],
                }

        # Recent learnings
        result = await db.execute(
            select(Learning)
            .where(Learning.user_id == user_id)
            .order_by(desc(Learning.created_at))
            .limit(10)
        )
        learnings = result.scalars().all()
        context["recent_learnings"] = [
            {"concept": l.concept, "category": l.category.value if l.category else ""}
            for l in learnings
        ]

        return context

    @staticmethod
    async def process_user_message(
        db: AsyncSession, session_id: str, user_id: str, content: str
    ) -> ChatMessage:
        session = await ChatService.get_session(db, session_id, user_id)
        if not session:
            raise ValueError("Session not found")

        # Save user message
        await ChatService.add_message(db, session_id, "user", content)

        # Get conversation history
        messages = await ChatService.get_session_messages(db, session_id, limit=50)
        message_history = [
            {"role": msg.role, "content": msg.content}
            for msg in messages if msg.role in ["user", "assistant"]
        ]

        # Build user context for AI
        user_context = await ChatService._build_user_context(db, user_id, session.project_id)

        # Generate AI response via Gemini
        from app.core.config import settings
        response_content, tokens_used = await AIService.generate_response(
            messages=message_history,
            user_context=user_context,
        )

        ai_message = await ChatService.add_message(
            db, session_id, "assistant", response_content,
            model_used=settings.GEMINI_MODEL, tokens_used=tokens_used,
        )

        await db.commit()
        return ai_message

    @staticmethod
    async def export_session(
        db: AsyncSession, session_id: str, user_id: str, format: str = "openfree"
    ) -> Dict:
        session = await ChatService.get_session(db, session_id, user_id)
        if not session:
            raise ValueError("Session not found")

        messages = await ChatService.get_session_messages(db, session_id, limit=10000)

        if format == "openfree":
            return {
                "version": "1.0",
                "format": "openfree",
                "session_id": session.id,
                "title": session.title,
                "created_at": session.created_at.isoformat(),
                "updated_at": session.updated_at.isoformat(),
                "total_messages": session.total_messages,
                "total_tokens": session.total_tokens,
                "messages": [
                    {
                        "id": msg.id, "role": msg.role, "content": msg.content,
                        "model_used": msg.model_used, "tokens_used": msg.tokens_used,
                        "sequence_number": msg.sequence_number,
                        "created_at": msg.created_at.isoformat(),
                    }
                    for msg in messages
                ],
                "metadata": {
                    "platform": "Umbral",
                    "project_id": session.project_id,
                    "status": session.status,
                },
            }
        elif format == "json":
            return {
                "session": {
                    "id": session.id, "title": session.title,
                    "created_at": session.created_at.isoformat(),
                },
                "messages": [
                    {"role": msg.role, "content": msg.content, "timestamp": msg.created_at.isoformat()}
                    for msg in messages
                ],
            }
        elif format == "markdown":
            lines = [
                f"# {session.title or 'Chat Session'}", "",
                f"**Session ID:** {session.id}",
                f"**Created:** {session.created_at.strftime('%Y-%m-%d %H:%M:%S')}", "",
                "---", "",
            ]
            for msg in messages:
                role_label = "**User**" if msg.role == "user" else "**Assistant**"
                lines.extend([f"## {role_label}", "", msg.content, ""])
            return {"markdown": "\n".join(lines)}
        else:
            raise ValueError(f"Unsupported export format: {format}")
