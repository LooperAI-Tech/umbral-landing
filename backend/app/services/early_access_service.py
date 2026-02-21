"""
Early Access service for submission operations
"""

import uuid
from typing import Optional

from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from app.models.early_access import EarlyAccess
from app.schemas.early_access import EarlyAccessCreate


class EarlyAccessService:

    @staticmethod
    async def get_by_email(db: AsyncSession, email: str) -> Optional[EarlyAccess]:
        result = await db.execute(
            select(EarlyAccess).where(EarlyAccess.email == email)
        )
        return result.scalar_one_or_none()

    @staticmethod
    async def create(
        db: AsyncSession,
        data: EarlyAccessCreate,
        ip_address: Optional[str] = None,
        user_agent: Optional[str] = None,
    ) -> EarlyAccess:
        submission = EarlyAccess(
            id=str(uuid.uuid4()),
            ip_address=ip_address,
            user_agent=user_agent,
            **data.model_dump(),
        )
        db.add(submission)
        await db.flush()
        await db.refresh(submission)
        return submission
