"""
Deployment service for CRUD operations
"""

import uuid
from typing import List, Optional
from datetime import datetime

from sqlalchemy import select, and_, desc
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.orm import selectinload

from app.models.deployment import Deployment
from app.models.deployment_metrics import DeploymentMetrics
from app.models.project import Project
from app.schemas.deployment import DeploymentCreate, DeploymentUpdate, DeploymentMetricsCreate


class DeploymentService:

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
    async def create(
        db: AsyncSession, project_id: str, user_id: str, data: DeploymentCreate
    ) -> Optional[Deployment]:
        project = await DeploymentService._verify_project_ownership(db, project_id, user_id)
        if not project:
            return None

        deployment = Deployment(
            id=str(uuid.uuid4()),
            project_id=project_id,
            **data.model_dump(),
        )
        db.add(deployment)
        await db.flush()
        await db.refresh(deployment)
        return deployment

    @staticmethod
    async def list(
        db: AsyncSession, project_id: str, user_id: str
    ) -> Optional[List[Deployment]]:
        project = await DeploymentService._verify_project_ownership(db, project_id, user_id)
        if not project:
            return None

        result = await db.execute(
            select(Deployment)
            .options(selectinload(Deployment.metrics))
            .where(Deployment.project_id == project_id)
            .order_by(desc(Deployment.deploy_date))
        )
        return list(result.scalars().all())

    @staticmethod
    async def get(
        db: AsyncSession, deployment_id: str, user_id: str
    ) -> Optional[Deployment]:
        result = await db.execute(
            select(Deployment)
            .join(Project)
            .options(selectinload(Deployment.metrics))
            .where(and_(Deployment.id == deployment_id, Project.user_id == user_id))
        )
        return result.scalar_one_or_none()

    @staticmethod
    async def update(
        db: AsyncSession, deployment_id: str, user_id: str, data: DeploymentUpdate
    ) -> Optional[Deployment]:
        deployment = await DeploymentService.get(db, deployment_id, user_id)
        if not deployment:
            return None

        update_data = data.model_dump(exclude_unset=True)
        for field, value in update_data.items():
            setattr(deployment, field, value)

        deployment.updated_at = datetime.utcnow()
        await db.flush()
        await db.refresh(deployment)
        return deployment

    @staticmethod
    async def update_metrics(
        db: AsyncSession, deployment_id: str, user_id: str, data: DeploymentMetricsCreate
    ) -> Optional[DeploymentMetrics]:
        deployment = await DeploymentService.get(db, deployment_id, user_id)
        if not deployment:
            return None

        if deployment.metrics:
            for field, value in data.model_dump(exclude_unset=True).items():
                setattr(deployment.metrics, field, value)
            await db.flush()
            await db.refresh(deployment.metrics)
            return deployment.metrics
        else:
            metrics = DeploymentMetrics(
                id=str(uuid.uuid4()),
                deployment_id=deployment_id,
                **data.model_dump(),
            )
            db.add(metrics)
            await db.flush()
            await db.refresh(metrics)
            return metrics
