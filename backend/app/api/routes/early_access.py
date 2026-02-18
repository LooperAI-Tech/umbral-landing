"""
Early Access API route (public — no authentication required)
"""

from fastapi import APIRouter, Depends, HTTPException, Request, status
from sqlalchemy.ext.asyncio import AsyncSession

from app.core.database import get_db
from app.services.early_access_service import EarlyAccessService
from app.schemas.early_access import EarlyAccessCreate, EarlyAccessResponse

router = APIRouter()


@router.post("", response_model=EarlyAccessResponse, status_code=status.HTTP_201_CREATED)
async def submit_early_access(
    data: EarlyAccessCreate,
    request: Request,
    db: AsyncSession = Depends(get_db),
):
    # Check for duplicate email
    existing = await EarlyAccessService.get_by_email(db, data.email)
    if existing:
        raise HTTPException(
            status_code=status.HTTP_409_CONFLICT,
            detail="Ya existe una solicitud con este correo electrónico.",
        )

    ip_address = request.headers.get("x-forwarded-for", request.client.host if request.client else None)
    user_agent = request.headers.get("user-agent")

    submission = await EarlyAccessService.create(
        db, data, ip_address=ip_address, user_agent=user_agent
    )
    await db.commit()
    return submission
