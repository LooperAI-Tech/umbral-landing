"""
Dashboard service for aggregating stats and activity feed
"""

from typing import List, Optional
from datetime import datetime

from sqlalchemy import select, func, and_, desc
from sqlalchemy.ext.asyncio import AsyncSession

from app.models.user_stats import UserStats
from app.models.project import Project, ProjectStatus
from app.models.milestone import Milestone, MilestoneStatus
from app.models.task import Task, TaskStatus
from app.models.deployment import Deployment
from app.models.learning import Learning
from app.models.activity_log import ActivityLog
from app.schemas.dashboard import DashboardStats, ActivityFeedItem

import uuid


class DashboardService:

    @staticmethod
    async def get_stats(db: AsyncSession, user_id: str) -> DashboardStats:
        """Calculate live dashboard stats from actual data."""

        # Projects
        total_projects = await db.scalar(
            select(func.count(Project.id)).where(Project.user_id == user_id)
        ) or 0
        active_projects = await db.scalar(
            select(func.count(Project.id)).where(
                and_(Project.user_id == user_id, Project.status == ProjectStatus.IN_PROGRESS)
            )
        ) or 0
        completed_projects = await db.scalar(
            select(func.count(Project.id)).where(
                and_(Project.user_id == user_id, Project.status == ProjectStatus.COMPLETED)
            )
        ) or 0

        # Milestones (across all user projects)
        user_project_ids = select(Project.id).where(Project.user_id == user_id).scalar_subquery()

        total_milestones = await db.scalar(
            select(func.count(Milestone.id)).where(
                Milestone.project_id.in_(select(Project.id).where(Project.user_id == user_id))
            )
        ) or 0
        completed_milestones = await db.scalar(
            select(func.count(Milestone.id)).where(
                and_(
                    Milestone.project_id.in_(select(Project.id).where(Project.user_id == user_id)),
                    Milestone.status == MilestoneStatus.COMPLETED,
                )
            )
        ) or 0

        # Tasks
        total_tasks = await db.scalar(
            select(func.count(Task.id)).where(
                Task.milestone_id.in_(
                    select(Milestone.id).where(
                        Milestone.project_id.in_(select(Project.id).where(Project.user_id == user_id))
                    )
                )
            )
        ) or 0
        completed_tasks = await db.scalar(
            select(func.count(Task.id)).where(
                and_(
                    Task.milestone_id.in_(
                        select(Milestone.id).where(
                            Milestone.project_id.in_(select(Project.id).where(Project.user_id == user_id))
                        )
                    ),
                    Task.status == TaskStatus.COMPLETED,
                )
            )
        ) or 0

        # Deployments
        total_deployments = await db.scalar(
            select(func.count(Deployment.id)).where(
                Deployment.project_id.in_(select(Project.id).where(Project.user_id == user_id))
            )
        ) or 0

        # Learnings
        total_learnings = await db.scalar(
            select(func.count(Learning.id)).where(Learning.user_id == user_id)
        ) or 0

        # Streak from user_stats (if exists)
        stats_row = await db.scalar(
            select(UserStats).where(UserStats.user_id == user_id)
        )

        return DashboardStats(
            total_projects=total_projects,
            active_projects=active_projects,
            completed_projects=completed_projects,
            total_milestones=total_milestones,
            completed_milestones=completed_milestones,
            total_tasks=total_tasks,
            completed_tasks=completed_tasks,
            total_deployments=total_deployments,
            total_learnings=total_learnings,
            current_streak=stats_row.current_streak if stats_row else 0,
            longest_streak=stats_row.longest_streak if stats_row else 0,
        )

    @staticmethod
    async def get_activity_feed(
        db: AsyncSession, user_id: str, limit: int = 20, offset: int = 0
    ) -> tuple[List[ActivityLog], int]:
        total = await db.scalar(
            select(func.count(ActivityLog.id)).where(ActivityLog.user_id == user_id)
        ) or 0

        result = await db.execute(
            select(ActivityLog)
            .where(ActivityLog.user_id == user_id)
            .order_by(desc(ActivityLog.created_at))
            .limit(limit)
            .offset(offset)
        )
        activities = list(result.scalars().all())
        return activities, total
