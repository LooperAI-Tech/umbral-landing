"""
Learnings API routes
"""

from typing import Optional, List as TypingList
from fastapi import APIRouter, Depends, HTTPException, Query, status
from sqlalchemy.ext.asyncio import AsyncSession

from app.api.deps import get_db, get_current_user_id
from app.services.learning_service import LearningService
from app.services.activity_service import ActivityService
from app.models.learning import LearningCategory, ConfidenceLevel
from app.schemas.learning import (
    LearningCreate, LearningUpdate, LearningResponse, LearningSearchParams,
)

router = APIRouter()


@router.get("", response_model=dict)
async def list_learnings(
    query: Optional[str] = Query(None, alias="q"),
    category: Optional[LearningCategory] = None,
    project_id: Optional[str] = None,
    confidence_level: Optional[ConfidenceLevel] = None,
    limit: int = Query(50, ge=1, le=200),
    offset: int = Query(0, ge=0),
    user_id: str = Depends(get_current_user_id),
    db: AsyncSession = Depends(get_db),
):
    params = LearningSearchParams(
        query=query, category=category, project_id=project_id,
        confidence_level=confidence_level, limit=limit, offset=offset,
    )
    learnings, total = await LearningService.search(db, user_id, params)
    return {"learnings": learnings, "total": total}


@router.post("", response_model=LearningResponse, status_code=status.HTTP_201_CREATED)
async def create_learning(
    data: LearningCreate,
    user_id: str = Depends(get_current_user_id),
    db: AsyncSession = Depends(get_db),
):
    learning = await LearningService.create(db, user_id, data)
    await ActivityService.log(db, user_id, "created", "learning", learning.id,
                              new_value={"concept": learning.concept})
    await db.commit()
    return learning


@router.get("/{learning_id}", response_model=LearningResponse)
async def get_learning(
    learning_id: str,
    user_id: str = Depends(get_current_user_id),
    db: AsyncSession = Depends(get_db),
):
    learning = await LearningService.get(db, learning_id, user_id)
    if not learning:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Learning not found")
    return learning


@router.patch("/{learning_id}", response_model=LearningResponse)
async def update_learning(
    learning_id: str,
    data: LearningUpdate,
    user_id: str = Depends(get_current_user_id),
    db: AsyncSession = Depends(get_db),
):
    learning = await LearningService.update(db, learning_id, user_id, data)
    if not learning:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Learning not found")
    await ActivityService.log(db, user_id, "updated", "learning", learning_id)
    await db.commit()
    return learning


@router.delete("/{learning_id}", status_code=status.HTTP_204_NO_CONTENT)
async def delete_learning(
    learning_id: str,
    user_id: str = Depends(get_current_user_id),
    db: AsyncSession = Depends(get_db),
):
    deleted = await LearningService.delete(db, learning_id, user_id)
    if not deleted:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Learning not found")
    await ActivityService.log(db, user_id, "deleted", "learning", learning_id)
    await db.commit()
    return None
