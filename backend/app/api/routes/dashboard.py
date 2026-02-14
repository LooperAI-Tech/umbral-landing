"""
Dashboard API routes
"""

from fastapi import APIRouter, Depends, Query
from sqlalchemy.ext.asyncio import AsyncSession

from app.api.deps import get_db, get_current_user_id
from app.services.dashboard_service import DashboardService
from app.schemas.dashboard import DashboardStats, ActivityFeedResponse, ActivityFeedItem

router = APIRouter()


@router.get("/stats", response_model=DashboardStats)
async def get_dashboard_stats(
    user_id: str = Depends(get_current_user_id),
    db: AsyncSession = Depends(get_db),
):
    return await DashboardService.get_stats(db, user_id)


@router.get("/activity", response_model=ActivityFeedResponse)
async def get_activity_feed(
    limit: int = Query(20, ge=1, le=100),
    offset: int = Query(0, ge=0),
    user_id: str = Depends(get_current_user_id),
    db: AsyncSession = Depends(get_db),
):
    activities, total = await DashboardService.get_activity_feed(db, user_id, limit, offset)
    return ActivityFeedResponse(
        activities=[ActivityFeedItem.model_validate(a) for a in activities],
        total=total,
    )
