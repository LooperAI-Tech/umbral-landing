"""
Learning service for CRUD operations and search
"""

import uuid
from typing import List, Optional, Tuple
from datetime import datetime, timedelta

from sqlalchemy import select, func, and_, or_, desc
from sqlalchemy.ext.asyncio import AsyncSession

from app.models.learning import Learning, LearningCategory, ConfidenceLevel
from app.schemas.learning import LearningCreate, LearningUpdate, LearningSearchParams


# Spaced repetition intervals by confidence level (days)
REVIEW_INTERVALS = {
    ConfidenceLevel.EXPLORING: 1,
    ConfidenceLevel.LEARNING: 3,
    ConfidenceLevel.PRACTICING: 7,
    ConfidenceLevel.CONFIDENT: 21,
    ConfidenceLevel.EXPERT: 60,
}


class LearningService:

    @staticmethod
    def _calculate_next_review(confidence: ConfidenceLevel) -> datetime:
        days = REVIEW_INTERVALS.get(confidence, 7)
        return datetime.utcnow() + timedelta(days=days)

    @staticmethod
    async def create(
        db: AsyncSession, user_id: str, data: LearningCreate
    ) -> Learning:
        learning = Learning(
            id=str(uuid.uuid4()),
            user_id=user_id,
            next_review_date=LearningService._calculate_next_review(data.confidence_level),
            **data.model_dump(),
        )
        db.add(learning)
        await db.flush()
        await db.refresh(learning)
        return learning

    @staticmethod
    async def get(
        db: AsyncSession, learning_id: str, user_id: str
    ) -> Optional[Learning]:
        result = await db.execute(
            select(Learning).where(
                and_(Learning.id == learning_id, Learning.user_id == user_id)
            )
        )
        return result.scalar_one_or_none()

    @staticmethod
    async def update(
        db: AsyncSession, learning_id: str, user_id: str, data: LearningUpdate
    ) -> Optional[Learning]:
        learning = await LearningService.get(db, learning_id, user_id)
        if not learning:
            return None

        update_data = data.model_dump(exclude_unset=True)
        for field, value in update_data.items():
            setattr(learning, field, value)

        # Recalculate next review if confidence changed
        if data.confidence_level:
            learning.next_review_date = LearningService._calculate_next_review(
                data.confidence_level
            )

        learning.updated_at = datetime.utcnow()
        await db.flush()
        await db.refresh(learning)
        return learning

    @staticmethod
    async def delete(
        db: AsyncSession, learning_id: str, user_id: str
    ) -> bool:
        learning = await LearningService.get(db, learning_id, user_id)
        if not learning:
            return False

        await db.delete(learning)
        await db.flush()
        return True

    @staticmethod
    async def search(
        db: AsyncSession, user_id: str, params: LearningSearchParams
    ) -> Tuple[List[Learning], int]:
        conditions = [Learning.user_id == user_id]

        if params.category:
            conditions.append(Learning.category == params.category)
        if params.project_id:
            conditions.append(Learning.project_id == params.project_id)
        if params.confidence_level:
            conditions.append(Learning.confidence_level == params.confidence_level)
        if params.query:
            search = f"%{params.query}%"
            conditions.append(
                or_(
                    Learning.concept.ilike(search),
                    Learning.what_learned.ilike(search),
                    Learning.when_to_use.ilike(search),
                    Learning.when_not_to_use.ilike(search),
                )
            )

        # Count
        count_result = await db.execute(
            select(func.count(Learning.id)).where(*conditions)
        )
        total = count_result.scalar() or 0

        # Query
        result = await db.execute(
            select(Learning)
            .where(*conditions)
            .order_by(desc(Learning.created_at))
            .limit(params.limit)
            .offset(params.offset)
        )
        learnings = list(result.scalars().all())
        return learnings, total
