"""
API dependencies for route handlers
"""

import logging
from typing import AsyncGenerator
from fastapi import Depends, HTTPException, status
from sqlalchemy.ext.asyncio import AsyncSession
from app.core.database import get_db
from app.core.security import verify_clerk_token, get_user_id_from_token

logger = logging.getLogger(__name__)


async def _fetch_clerk_user(user_id: str) -> dict:
    """Fetch user details from Clerk Backend API."""
    import httpx
    from app.core.config import settings

    async with httpx.AsyncClient() as client:
        resp = await client.get(
            f"https://api.clerk.com/v1/users/{user_id}",
            headers={"Authorization": f"Bearer {settings.CLERK_SECRET_KEY}"},
        )
        resp.raise_for_status()
        return resp.json()


async def _ensure_user_exists(db: AsyncSession, user_id: str) -> None:
    """
    Ensure the authenticated Clerk user exists in the local database.
    If not, fetch their profile from Clerk and create the record.
    This handles fresh databases and cases where the webhook didn't fire.
    """
    from app.services.user_service import UserService
    from app.schemas.user import UserCreate

    user = await UserService.get_user_by_id(db, user_id)
    if user:
        return

    # User doesn't exist locally — fetch from Clerk and create
    try:
        clerk_data = await _fetch_clerk_user(user_id)

        email_addresses = clerk_data.get("email_addresses", [])
        primary_email_id = clerk_data.get("primary_email_address_id")
        primary_email = next(
            (e["email_address"] for e in email_addresses if e.get("id") == primary_email_id),
            None,
        )
        if not primary_email and email_addresses:
            primary_email = email_addresses[0].get("email_address")

        if not primary_email:
            logger.error("Clerk user %s has no email address", user_id)
            raise HTTPException(
                status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
                detail="User has no email address in Clerk",
            )

        user_create = UserCreate(
            id=user_id,
            email=primary_email,
            first_name=clerk_data.get("first_name"),
            last_name=clerk_data.get("last_name"),
            username=clerk_data.get("username"),
            profile_image_url=clerk_data.get("image_url"),
            email_verified=any(
                e.get("verification", {}).get("status") == "verified"
                for e in email_addresses
            ),
        )

        await UserService.create_user(db, user_create)
        logger.info("Auto-created user %s (%s) from Clerk", user_id, primary_email)

    except HTTPException:
        raise
    except Exception as e:
        logger.error("Failed to auto-create user %s: %s", user_id, e)
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Failed to sync user from authentication provider",
        )


async def get_current_user_id(
    token_payload: dict = Depends(verify_clerk_token),
    db: AsyncSession = Depends(get_db),
) -> str:
    """
    Get current authenticated user ID from token.
    Automatically creates the user in the database if they don't exist yet.
    """
    user_id = get_user_id_from_token(token_payload)
    if not user_id:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Could not validate user credentials",
        )

    # Ensure user record exists in DB (auto-sync from Clerk on first request)
    await _ensure_user_exists(db, user_id)

    return user_id


async def get_current_user(
    user_id: str = Depends(get_current_user_id),
    db: AsyncSession = Depends(get_db)
):
    """
    Get current authenticated user from database.
    The user is guaranteed to exist because get_current_user_id auto-creates them.
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
