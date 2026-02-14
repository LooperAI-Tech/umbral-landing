"""
Milestone service for CRUD operations
"""

import uuid
from typing import List, Optional
from datetime import datetime

from sqlalchemy import select, func, and_
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.orm import selectinload

from app.models.milestone import Milestone
from app.models.project import Project
from app.schemas.milestone import MilestoneCreate, MilestoneUpdate


class MilestoneService:

    @staticmethod
    async def _verify_project_ownership(
        db: AsyncSession, project_id: str, user_id: str
    ) -> Optional[Project]:
        result = await db.execute(
            select(Project).where(
                and_(Project.id == project_id, Project.user_id == user_id)
            )
        )
        return result.scalar_one_or_none()

    @staticmethod
    async def _next_milestone_number(db: AsyncSession, project_id: str) -> int:
        result = await db.execute(
            select(func.coalesce(func.max(Milestone.milestone_number), 0)).where(
                Milestone.project_id == project_id
            )
        )
        return (result.scalar() or 0) + 1

    @staticmethod
    async def _next_order_index(db: AsyncSession, project_id: str) -> int:
        result = await db.execute(
            select(func.coalesce(func.max(Milestone.order_index), -1)).where(
                Milestone.project_id == project_id
            )
        )
        return (result.scalar() or -1) + 1

    @staticmethod
    async def create(
        db: AsyncSession, project_id: str, user_id: str, data: MilestoneCreate
    ) -> Optional[Milestone]:
        project = await MilestoneService._verify_project_ownership(db, project_id, user_id)
        if not project:
            return None

        milestone_number = await MilestoneService._next_milestone_number(db, project_id)
        order_index = await MilestoneService._next_order_index(db, project_id)

        milestone = Milestone(
            id=str(uuid.uuid4()),
            project_id=project_id,
            milestone_number=milestone_number,
            order_index=order_index,
            **data.model_dump(),
        )
        db.add(milestone)
        await db.flush()
        await db.refresh(milestone)
        return milestone

    @staticmethod
    async def list(
        db: AsyncSession, project_id: str, user_id: str
    ) -> Optional[List[Milestone]]:
        project = await MilestoneService._verify_project_ownership(db, project_id, user_id)
        if not project:
            return None

        result = await db.execute(
            select(Milestone)
            .where(Milestone.project_id == project_id)
            .order_by(Milestone.order_index)
        )
        return list(result.scalars().all())

    @staticmethod
    async def get(
        db: AsyncSession, milestone_id: str, user_id: str
    ) -> Optional[Milestone]:
        result = await db.execute(
            select(Milestone)
            .join(Project)
            .options(selectinload(Milestone.tasks))
            .where(and_(Milestone.id == milestone_id, Project.user_id == user_id))
        )
        return result.scalar_one_or_none()

    @staticmethod
    async def update(
        db: AsyncSession, milestone_id: str, user_id: str, data: MilestoneUpdate
    ) -> Optional[Milestone]:
        milestone = await MilestoneService.get(db, milestone_id, user_id)
        if not milestone:
            return None

        update_data = data.model_dump(exclude_unset=True)
        for field, value in update_data.items():
            setattr(milestone, field, value)

        milestone.updated_at = datetime.utcnow()
        await db.flush()
        await db.refresh(milestone)
        return milestone

    @staticmethod
    async def delete(
        db: AsyncSession, milestone_id: str, user_id: str
    ) -> bool:
        milestone = await MilestoneService.get(db, milestone_id, user_id)
        if not milestone:
            return False

        await db.delete(milestone)
        await db.flush()
        return True
