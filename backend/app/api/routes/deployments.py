"""
Deployments API routes
"""

from typing import List
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.ext.asyncio import AsyncSession

from app.api.deps import get_db, get_current_user_id
from app.services.deployment_service import DeploymentService
from app.services.activity_service import ActivityService
from app.schemas.deployment import (
    DeploymentCreate, DeploymentUpdate, DeploymentResponse, DeploymentMetricsCreate,
)

router = APIRouter()


@router.get("/projects/{project_id}/deployments", response_model=List[DeploymentResponse])
async def list_deployments(
    project_id: str,
    user_id: str = Depends(get_current_user_id),
    db: AsyncSession = Depends(get_db),
):
    deployments = await DeploymentService.list(db, project_id, user_id)
    if deployments is None:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Project not found")
    return deployments


@router.post("/projects/{project_id}/deployments", response_model=DeploymentResponse, status_code=status.HTTP_201_CREATED)
async def create_deployment(
    project_id: str,
    data: DeploymentCreate,
    user_id: str = Depends(get_current_user_id),
    db: AsyncSession = Depends(get_db),
):
    deployment = await DeploymentService.create(db, project_id, user_id, data)
    if not deployment:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Project not found")
    await ActivityService.log(db, user_id, "created", "deployment", deployment.id,
                              new_value={"version": deployment.version})
    await db.commit()
    return deployment


@router.get("/deployments/{deployment_id}", response_model=DeploymentResponse)
async def get_deployment(
    deployment_id: str,
    user_id: str = Depends(get_current_user_id),
    db: AsyncSession = Depends(get_db),
):
    deployment = await DeploymentService.get(db, deployment_id, user_id)
    if not deployment:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Deployment not found")
    return deployment


@router.patch("/deployments/{deployment_id}", response_model=DeploymentResponse)
async def update_deployment(
    deployment_id: str,
    data: DeploymentUpdate,
    user_id: str = Depends(get_current_user_id),
    db: AsyncSession = Depends(get_db),
):
    deployment = await DeploymentService.update(db, deployment_id, user_id, data)
    if not deployment:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Deployment not found")
    await ActivityService.log(db, user_id, "updated", "deployment", deployment_id)
    await db.commit()
    return deployment
