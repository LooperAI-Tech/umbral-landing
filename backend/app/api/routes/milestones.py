"""
Milestones API routes
"""

from typing import List
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.ext.asyncio import AsyncSession

from app.api.deps import get_db, get_current_user_id
from app.services.milestone_service import MilestoneService
from app.services.project_service import ProjectService
from app.services.activity_service import ActivityService
from app.schemas.milestone import MilestoneCreate, MilestoneUpdate, MilestoneResponse

router = APIRouter()


@router.get("/projects/{project_id}/milestones", response_model=List[MilestoneResponse])
async def list_milestones(
    project_id: str,
    user_id: str = Depends(get_current_user_id),
    db: AsyncSession = Depends(get_db),
):
    milestones = await MilestoneService.list(db, project_id, user_id)
    if milestones is None:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Project not found")
    return milestones


@router.post("/projects/{project_id}/milestones", response_model=MilestoneResponse, status_code=status.HTTP_201_CREATED)
async def create_milestone(
    project_id: str,
    data: MilestoneCreate,
    user_id: str = Depends(get_current_user_id),
    db: AsyncSession = Depends(get_db),
):
    milestone = await MilestoneService.create(db, project_id, user_id, data)
    if not milestone:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Project not found")
    await ActivityService.log(db, user_id, "created", "milestone", milestone.id,
                              new_value={"name": milestone.name})
    await db.commit()
    return milestone


@router.get("/milestones/{milestone_id}", response_model=MilestoneResponse)
async def get_milestone(
    milestone_id: str,
    user_id: str = Depends(get_current_user_id),
    db: AsyncSession = Depends(get_db),
):
    milestone = await MilestoneService.get(db, milestone_id, user_id)
    if not milestone:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Milestone not found")
    return milestone


@router.patch("/milestones/{milestone_id}", response_model=MilestoneResponse)
async def update_milestone(
    milestone_id: str,
    data: MilestoneUpdate,
    user_id: str = Depends(get_current_user_id),
    db: AsyncSession = Depends(get_db),
):
    milestone = await MilestoneService.update(db, milestone_id, user_id, data)
    if not milestone:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Milestone not found")

    # Recalculate project progress if status changed
    if data.status:
        await ProjectService.recalculate_progress(db, milestone.project_id)

    await ActivityService.log(db, user_id, "updated", "milestone", milestone_id)
    await db.commit()
    return milestone


@router.delete("/milestones/{milestone_id}", status_code=status.HTTP_204_NO_CONTENT)
async def delete_milestone(
    milestone_id: str,
    user_id: str = Depends(get_current_user_id),
    db: AsyncSession = Depends(get_db),
):
    deleted = await MilestoneService.delete(db, milestone_id, user_id)
    if not deleted:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Milestone not found")
    await ActivityService.log(db, user_id, "deleted", "milestone", milestone_id)
    await db.commit()
    return None
