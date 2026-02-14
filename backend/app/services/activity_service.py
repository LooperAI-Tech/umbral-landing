"""
Activity logging service
"""

import uuid
from typing import Optional, Dict
from sqlalchemy.ext.asyncio import AsyncSession

from app.models.activity_log import ActivityLog


class ActivityService:

    @staticmethod
    async def log(
        db: AsyncSession,
        user_id: str,
        action: str,
        entity_type: str,
        entity_id: Optional[str] = None,
        previous_value: Optional[Dict] = None,
        new_value: Optional[Dict] = None,
        metadata: Optional[Dict] = None,
    ) -> ActivityLog:
        entry = ActivityLog(
            id=str(uuid.uuid4()),
            user_id=user_id,
            action=action,
            entity_type=entity_type,
            entity_id=entity_id,
            previous_value=previous_value,
            new_value=new_value,
            metadata_=metadata,
        )
        db.add(entry)
        await db.flush()
        return entry
