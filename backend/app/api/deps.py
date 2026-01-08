"""
API dependencies for route handlers
"""

from typing import AsyncGenerator
from fastapi import Depends, HTTPException, status
from sqlalchemy.ext.asyncio import AsyncSession
from app.core.database import get_db
from app.core.security import verify_clerk_token, get_user_id_from_token


async def get_current_user_id(
    token_payload: dict = Depends(verify_clerk_token)
) -> str:
    """
    Get current authenticated user ID from token

    Args:
        token_payload: Decoded JWT token payload

    Returns:
        str: User ID

    Raises:
        HTTPException: If user ID is not found in token
    """
    user_id = get_user_id_from_token(token_payload)
    if not user_id:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Could not validate user credentials",
        )
    return user_id


async def get_current_user(
    user_id: str = Depends(get_current_user_id),
    db: AsyncSession = Depends(get_db)
):
    """
    Get current authenticated user from database

    Args:
        user_id: User ID from token
        db: Database session

    Returns:
        User model instance

    Raises:
        HTTPException: If user is not found
    """
    from app.services.user_service import UserService

    user = await UserService.get_user_by_id(db, user_id)
    if not user:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="User not found. Please ensure your account is properly synced."
        )

    # Update last login timestamp
    await UserService.update_last_login(db, user_id)

    return user
