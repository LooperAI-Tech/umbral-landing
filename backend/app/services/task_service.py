"""
Task service for CRUD operations
"""

import uuid
from typing import List, Optional
from datetime import datetime

from sqlalchemy import select, func, and_
from sqlalchemy.ext.asyncio import AsyncSession

from app.models.task import Task, TaskStatus
from app.models.milestone import Milestone
from app.models.project import Project
from app.schemas.task import TaskCreate, TaskUpdate


class TaskService:

    @staticmethod
    async def _verify_milestone_ownership(
        db: AsyncSession, milestone_id: str, user_id: str
    ) -> Optional[Milestone]:
        result = await db.execute(
            select(Milestone)
            .join(Project)
            .where(and_(Milestone.id == milestone_id, Project.user_id == user_id))
        )
        return result.scalar_one_or_none()

    @staticmethod
    async def _generate_task_number(
        db: AsyncSession, milestone_id: str
    ) -> str:
        # Get milestone number
        result = await db.execute(
            select(Milestone.milestone_number).where(Milestone.id == milestone_id)
        )
        milestone_num = result.scalar() or 0

        # Count existing tasks
        result = await db.execute(
            select(func.count(Task.id)).where(Task.milestone_id == milestone_id)
        )
        task_count = (result.scalar() or 0) + 1

        return f"T-{milestone_num}.{task_count}"

    @staticmethod
    async def _next_order_index(db: AsyncSession, milestone_id: str) -> int:
        result = await db.execute(
            select(func.coalesce(func.max(Task.order_index), -1)).where(
                Task.milestone_id == milestone_id
            )
        )
        return (result.scalar() or -1) + 1

    @staticmethod
    async def create(
        db: AsyncSession, milestone_id: str, user_id: str, data: TaskCreate
    ) -> Optional[Task]:
        milestone = await TaskService._verify_milestone_ownership(db, milestone_id, user_id)
        if not milestone:
            return None

        task_number = await TaskService._generate_task_number(db, milestone_id)
        order_index = await TaskService._next_order_index(db, milestone_id)

        task = Task(
            id=str(uuid.uuid4()),
            milestone_id=milestone_id,
            task_number=task_number,
            order_index=order_index,
            **data.model_dump(),
        )
        db.add(task)
        await db.flush()
        await db.refresh(task)
        return task

    @staticmethod
    async def list(
        db: AsyncSession, milestone_id: str, user_id: str
    ) -> Optional[List[Task]]:
        milestone = await TaskService._verify_milestone_ownership(db, milestone_id, user_id)
        if not milestone:
            return None

        result = await db.execute(
            select(Task)
            .where(and_(Task.milestone_id == milestone_id, Task.status != TaskStatus.DELETED))
            .order_by(Task.order_index)
        )
        return list(result.scalars().all())

    @staticmethod
    async def get(
        db: AsyncSession, task_id: str, user_id: str
    ) -> Optional[Task]:
        result = await db.execute(
            select(Task)
            .join(Milestone)
            .join(Project)
            .where(and_(Task.id == task_id, Project.user_id == user_id))
        )
        return result.scalar_one_or_none()

    @staticmethod
    async def update(
        db: AsyncSession, task_id: str, user_id: str, data: TaskUpdate
    ) -> Optional[Task]:
        task = await TaskService.get(db, task_id, user_id)
        if not task:
            return None

        update_data = data.model_dump(exclude_unset=True)
        for field, value in update_data.items():
            setattr(task, field, value)

        # Auto-set started_at when transitioning to IN_PROGRESS
        if data.status and data.status.value == "IN_PROGRESS" and not task.started_at:
            task.started_at = datetime.utcnow()
        # Auto-set completed_at when transitioning to COMPLETED
        if data.status and data.status.value == "COMPLETED" and not task.completed_at:
            task.completed_at = datetime.utcnow()

        task.updated_at = datetime.utcnow()
        await db.flush()
        await db.refresh(task)
        return task

    @staticmethod
    async def delete(
        db: AsyncSession, task_id: str, user_id: str
    ) -> bool:
        task = await TaskService.get(db, task_id, user_id)
        if not task:
            return False

        task.status = TaskStatus.DELETED
        task.updated_at = datetime.utcnow()
        await db.flush()
        return True
