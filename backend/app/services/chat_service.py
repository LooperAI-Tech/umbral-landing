"""
Chat Service for managing chat sessions and messages
"""

import re
import uuid
import json
import logging
from typing import List, Optional, Dict, Tuple
from datetime import datetime
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select, and_, desc
from sqlalchemy.orm import selectinload

from app.models import ChatSession, ChatMessage, Project, Learning
from app.models.milestone import Milestone
from app.models.task import Task
from app.schemas.chat import ChatSessionCreate, ChatSessionUpdate
from app.schemas.project import ProjectCreate
from app.schemas.milestone import MilestoneCreate
from app.services.ai_service import AIService

logger = logging.getLogger(__name__)


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
            milestone_id=getattr(session_data, "milestone_id", None),
            session_type=getattr(session_data, "session_type", "general") or "general",
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
        db: AsyncSession, user_id: str, project_id: Optional[str] = None,
        milestone_id: Optional[str] = None
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

        # Current milestone context (for task generation)
        if milestone_id:
            from app.models.milestone import Milestone as MilestoneModel
            result = await db.execute(
                select(Milestone)
                .options(selectinload(Milestone.tasks))
                .where(Milestone.id == milestone_id)
            )
            milestone = result.scalar_one_or_none()
            if milestone:
                context["current_milestone"] = {
                    "name": milestone.name,
                    "deliverable": milestone.deliverable,
                    "deliverable_type": milestone.deliverable_type.value if milestone.deliverable_type else "",
                    "success_criteria": milestone.success_criteria,
                    "description": milestone.description or "",
                    "milestone_number": milestone.milestone_number,
                    "tasks": [
                        {
                            "task_number": t.task_number,
                            "title": t.title,
                            "status": t.status.value if t.status else "",
                        }
                        for t in (milestone.tasks or [])
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
    async def _detect_and_execute_action(
        db: AsyncSession, user_id: str, session: ChatSession, response_content: str
    ) -> Optional[Dict]:
        """Check AI response for action markers and execute them."""

        # --- Project creation action ---
        if session.session_type == "project_creation" and "[PROJECT_READY]" in response_content:
            try:
                marker_idx = response_content.index("[PROJECT_READY]")
                after_marker = response_content[marker_idx + len("[PROJECT_READY]"):]

                json_match = re.search(r'\{[^{}]*(?:\{[^{}]*\}[^{}]*)*\}', after_marker, re.DOTALL)
                if not json_match:
                    return None

                project_data = json.loads(json_match.group())
                project_create = ProjectCreate(**project_data)

                from app.services.project_service import ProjectService
                project = await ProjectService.create(db, user_id, project_create)

                session.project_id = project.id
                await db.flush()

                return {
                    "action": "project_created",
                    "action_data": {
                        "project_id": project.id,
                        "display_id": project.display_id,
                        "project_name": project.name,
                    },
                }
            except (json.JSONDecodeError, ValueError, Exception) as e:
                logger.warning(f"Failed to parse project from AI response: {e}")
                return None

        # --- Milestone generation action ---
        if session.session_type == "milestone_generation" and "[MILESTONES_READY]" in response_content:
            try:
                marker_idx = response_content.index("[MILESTONES_READY]")
                after_marker = response_content[marker_idx + len("[MILESTONES_READY]"):]

                # Extract JSON array (may be wrapped in ```json ... ```)
                json_match = re.search(r'\[.*\]', after_marker, re.DOTALL)
                if not json_match:
                    return None

                json_text = json_match.group()
                # Strip markdown code fences if wrapping the array
                json_text = json_text.strip()
                milestones_data = json.loads(json_text)

                if not isinstance(milestones_data, list) or not milestones_data:
                    return None

                project_id = session.project_id
                if not project_id:
                    logger.warning("Milestone generation session has no project_id")
                    return None

                from app.services.milestone_service import MilestoneService

                created_milestones = []
                for m_data in milestones_data:
                    # Set default deliverable_type if missing
                    if "deliverable_type" not in m_data or not m_data["deliverable_type"]:
                        m_data["deliverable_type"] = "FEATURE"

                    milestone_create = MilestoneCreate(
                        name=m_data["name"],
                        deliverable=m_data["deliverable"],
                        deliverable_type=m_data["deliverable_type"],
                        success_criteria=m_data["success_criteria"],
                        description=m_data.get("description"),
                        target_date=m_data.get("target_date"),
                    )
                    milestone = await MilestoneService.create(
                        db, project_id, user_id, milestone_create
                    )
                    if milestone:
                        created_milestones.append({
                            "id": milestone.id,
                            "name": milestone.name,
                            "milestone_number": milestone.milestone_number,
                        })

                if not created_milestones:
                    return None

                return {
                    "action": "milestones_created",
                    "action_data": {
                        "project_id": project_id,
                        "milestones": created_milestones,
                        "count": len(created_milestones),
                    },
                }
            except (json.JSONDecodeError, ValueError, Exception) as e:
                logger.warning(f"Failed to parse milestones from AI response: {e}")
                return None

        # --- Task generation action ---
        if session.session_type == "task_generation" and "[TASKS_READY]" in response_content:
            try:
                marker_idx = response_content.index("[TASKS_READY]")
                after_marker = response_content[marker_idx + len("[TASKS_READY]"):]

                json_match = re.search(r'\[.*\]', after_marker, re.DOTALL)
                if not json_match:
                    return None

                json_text = json_match.group().strip()
                tasks_data = json.loads(json_text)

                if not isinstance(tasks_data, list) or not tasks_data:
                    return None

                milestone_id = session.milestone_id
                if not milestone_id:
                    logger.warning("Task generation session has no milestone_id")
                    return None

                from app.services.task_service import TaskService
                from app.schemas.task import TaskCreate as TaskCreateSchema

                created_tasks = []
                for t_data in tasks_data:
                    if "task_type" not in t_data or not t_data["task_type"]:
                        t_data["task_type"] = "DEVELOPMENT"
                    if "complexity" not in t_data or not t_data["complexity"]:
                        t_data["complexity"] = "MEDIUM"

                    task_create = TaskCreateSchema(
                        title=t_data["title"],
                        description=t_data.get("description"),
                        task_type=t_data["task_type"],
                        tech_component=t_data.get("tech_component", "General"),
                        complexity=t_data.get("complexity", "MEDIUM"),
                        estimated_hours=t_data.get("estimated_hours"),
                    )
                    task = await TaskService.create(
                        db, milestone_id, user_id, task_create
                    )
                    if task:
                        created_tasks.append({
                            "id": task.id,
                            "title": task.title,
                            "task_number": task.task_number,
                        })

                if not created_tasks:
                    return None

                return {
                    "action": "tasks_created",
                    "action_data": {
                        "milestone_id": milestone_id,
                        "tasks": created_tasks,
                        "count": len(created_tasks),
                    },
                }
            except (json.JSONDecodeError, ValueError, Exception) as e:
                logger.warning(f"Failed to parse tasks from AI response: {e}")
                return None

        return None

    @staticmethod
    async def process_user_message(
        db: AsyncSession, session_id: str, user_id: str, content: str
    ) -> Tuple[ChatMessage, Optional[Dict]]:
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
        user_context = await ChatService._build_user_context(
            db, user_id, session.project_id,
            milestone_id=getattr(session, "milestone_id", None)
        )

        # Use session-type-aware system prompt
        system_prompt = AIService.build_system_prompt_for_session_type(
            session.session_type, user_context
        )

        # Generate AI response via Gemini
        from app.core.config import settings
        response_content, tokens_used = await AIService.generate_response(
            messages=message_history,
            user_context=user_context,
            system_prompt_override=system_prompt,
        )

        ai_message = await ChatService.add_message(
            db, session_id, "assistant", response_content,
            model_used=settings.GEMINI_MODEL, tokens_used=tokens_used,
        )

        # Detect and execute any actions from the AI response
        action_info = await ChatService._detect_and_execute_action(
            db, user_id, session, response_content
        )

        # Strip DB-action markers and their JSON payloads from message content
        if action_info:
            action_name = action_info.get("action", "")
            marker_map = {
                "project_created": "[PROJECT_READY]",
                "milestones_created": "[MILESTONES_READY]",
                "tasks_created": "[TASKS_READY]",
            }
            marker = marker_map.get(action_name)
            if marker and marker in ai_message.content:
                marker_idx = ai_message.content.index(marker)
                clean_text = ai_message.content[:marker_idx].strip()
                if not clean_text:
                    # If no text before marker, use a friendly fallback
                    clean_text = ai_message.content[marker_idx + len(marker):]
                    # Strip JSON block (```json ... ``` or raw { ... })
                    clean_text = re.sub(r'```(?:json)?\s*\{.*?\}\s*```', '', clean_text, flags=re.DOTALL)
                    clean_text = re.sub(r'```(?:json)?\s*\[.*?\]\s*```', '', clean_text, flags=re.DOTALL)
                    clean_text = clean_text.strip()
                ai_message.content = clean_text or "Listo."

        # Detect UI action markers (non-DB actions, just frontend hints)
        # Only emit if the user hasn't already responded with one of the options
        BRANCH_LABELS = {
            "IA Generativa / LLMs", "Machine Learning", "Visión por Computadora",
            "Procesamiento de Lenguaje", "Aprendizaje por Refuerzo",
            "MLOps / Infraestructura", "Ingeniería de Datos", "Otra área",
        }
        PRIORITY_LABELS = {"Baja", "Media", "Alta", "Crítica"}
        LEVEL_LABELS = {"Introductorio", "Intermedio", "Avanzado"}

        def _user_already_selected(labels: set) -> bool:
            return any(
                msg["content"].strip() in labels
                for msg in message_history if msg["role"] == "user"
            )

        # Strip ALL known markers from content regardless of which one triggered
        def _strip_markers(text: str) -> str:
            for marker in ("[SELECT_AI_BRANCH]", "[SELECT_PRIORITY]", "[SELECT_LEVEL]", "[PROJECT_SUMMARY]"):
                text = text.replace(marker, "")
            return text.strip()

        if not action_info:
            # --- Project summary card ---
            if "[PROJECT_SUMMARY]" in response_content:
                try:
                    marker_idx = response_content.index("[PROJECT_SUMMARY]")
                    after_marker = response_content[marker_idx + len("[PROJECT_SUMMARY]"):]
                    json_match = re.search(r'\{[^{}]*(?:\{[^{}]*\}[^{}]*)*\}', after_marker, re.DOTALL)
                    if json_match:
                        summary_data = json.loads(json_match.group())
                        # Text before the marker becomes the message content
                        text_before = response_content[:marker_idx].strip()
                        # Text after the JSON block (e.g. confirmation question)
                        json_end = marker_idx + len("[PROJECT_SUMMARY]") + json_match.end()
                        text_after = response_content[json_end:].strip()
                        # Strip markdown code fences from text_after
                        text_after = re.sub(r'```(?:json)?\s*', '', text_after).strip()
                        combined = f"{text_before}\n\n{text_after}".strip() if text_after else text_before
                        ai_message.content = combined
                        action_info = {
                            "action": "project_summary",
                            "action_data": summary_data,
                        }
                except (json.JSONDecodeError, ValueError) as e:
                    logger.warning("Failed to parse project summary: %s", e)
                    ai_message.content = _strip_markers(response_content)

            # --- Selection buttons ---
            elif "[SELECT_AI_BRANCH]" in response_content:
                ai_message.content = _strip_markers(response_content)
                if not _user_already_selected(BRANCH_LABELS):
                    action_info = {
                        "action": "select_ai_branch",
                        "action_data": {
                            "options": [
                                {"value": "GENAI_LLM", "label": "IA Generativa / LLMs"},
                                {"value": "ML_TRADITIONAL", "label": "Machine Learning"},
                                {"value": "COMPUTER_VISION", "label": "Visión por Computadora"},
                                {"value": "NLP", "label": "Procesamiento de Lenguaje"},
                                {"value": "REINFORCEMENT_LEARNING", "label": "Aprendizaje por Refuerzo"},
                                {"value": "MLOPS", "label": "MLOps / Infraestructura"},
                                {"value": "DATA_ENGINEERING", "label": "Ingeniería de Datos"},
                                {"value": "OTHER", "label": "Otra área"},
                            ],
                        },
                    }

            elif "[SELECT_LEVEL]" in response_content:
                ai_message.content = _strip_markers(response_content)
                if not _user_already_selected(LEVEL_LABELS):
                    action_info = {
                        "action": "select_level",
                        "action_data": {
                            "options": [
                                {"value": "INTRODUCTORIO", "label": "Introductorio"},
                                {"value": "INTERMEDIO", "label": "Intermedio"},
                                {"value": "AVANZADO", "label": "Avanzado"},
                            ],
                        },
                    }

            elif "[SELECT_PRIORITY]" in response_content:
                ai_message.content = _strip_markers(response_content)
                if not _user_already_selected(PRIORITY_LABELS):
                    action_info = {
                        "action": "select_priority",
                        "action_data": {
                            "options": [
                                {"value": "LOW", "label": "Baja"},
                                {"value": "MEDIUM", "label": "Media"},
                                {"value": "HIGH", "label": "Alta"},
                                {"value": "CRITICAL", "label": "Crítica"},
                            ],
                        },
                    }

        await db.commit()
        return ai_message, action_info

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
