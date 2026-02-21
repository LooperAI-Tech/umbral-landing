"""
Project service for CRUD operations
"""

import uuid
from typing import List, Optional, Tuple
from datetime import datetime

from sqlalchemy import select, func, and_, desc
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.orm import selectinload

from app.models.project import Project, ProjectStatus
from app.schemas.project import ProjectCreate, ProjectUpdate


class ProjectService:

    @staticmethod
    async def _generate_display_id(db: AsyncSession, user_id: str) -> str:
        result = await db.execute(
            select(func.count(Project.id)).where(Project.user_id == user_id)
        )
        count = result.scalar() or 0
        return f"PRJ-{count + 1:03d}"

    @staticmethod
    async def create(
        db: AsyncSession, user_id: str, data: ProjectCreate
    ) -> Project:
        display_id = await ProjectService._generate_display_id(db, user_id)

        project = Project(
            id=str(uuid.uuid4()),
            display_id=display_id,
            user_id=user_id,
            **data.model_dump(),
        )
        db.add(project)
        await db.flush()
        await db.refresh(project)
        return project

    @staticmethod
    async def get(
        db: AsyncSession, project_id: str, user_id: str
    ) -> Optional[Project]:
        result = await db.execute(
            select(Project)
            .options(selectinload(Project.milestones))
            .where(and_(Project.id == project_id, Project.user_id == user_id))
        )
        return result.scalar_one_or_none()

    @staticmethod
    async def list(
        db: AsyncSession,
        user_id: str,
        status: Optional[ProjectStatus] = None,
        limit: int = 50,
        offset: int = 0,
    ) -> Tuple[List[Project], int]:
        conditions = [Project.user_id == user_id, Project.status != ProjectStatus.DELETED]
        if status:
            conditions.append(Project.status == status)

        # Count
        count_result = await db.execute(
            select(func.count(Project.id)).where(*conditions)
        )
        total = count_result.scalar() or 0

        # Query
        result = await db.execute(
            select(Project)
            .where(*conditions)
            .order_by(desc(Project.updated_at))
            .limit(limit)
            .offset(offset)
        )
        projects = list(result.scalars().all())
        return projects, total

    @staticmethod
    async def update(
        db: AsyncSession, project_id: str, user_id: str, data: ProjectUpdate
    ) -> Optional[Project]:
        project = await ProjectService.get(db, project_id, user_id)
        if not project:
            return None

        update_data = data.model_dump(exclude_unset=True)
        for field, value in update_data.items():
            setattr(project, field, value)

        project.updated_at = datetime.utcnow()
        await db.flush()
        await db.refresh(project)
        return project

    @staticmethod
    async def delete(
        db: AsyncSession, project_id: str, user_id: str
    ) -> bool:
        project = await ProjectService.get(db, project_id, user_id)
        if not project:
            return False

        project.status = ProjectStatus.DELETED
        project.updated_at = datetime.utcnow()
        await db.flush()
        return True

    @staticmethod
    async def recalculate_progress(db: AsyncSession, project_id: str):
        """Recalculate project progress based on milestone completion."""
        result = await db.execute(
            select(Project)
            .options(selectinload(Project.milestones))
            .where(Project.id == project_id)
        )
        project = result.scalar_one_or_none()
        if not project or not project.milestones:
            return

        completed = sum(1 for m in project.milestones if m.status.value == "COMPLETED")
        project.progress = completed / len(project.milestones)
        await db.flush()
