"""
Clerk webhook handler for user synchronization
"""

from fastapi import APIRouter, Request, HTTPException, Depends, Header
from sqlalchemy.ext.asyncio import AsyncSession
from app.core.database import get_db
from app.services.user_service import UserService
from app.schemas.user import UserCreate, UserUpdate
import hmac
import hashlib
import json

router = APIRouter()


async def verify_clerk_webhook(
    request: Request,
    svix_id: str = Header(None),
    svix_timestamp: str = Header(None),
    svix_signature: str = Header(None),
) -> dict:
    """
    Verify Clerk webhook signature

    Args:
        request: FastAPI request object
        svix_id: Svix message ID header
        svix_timestamp: Svix timestamp header
        svix_signature: Svix signature header

    Returns:
        Parsed webhook payload

    Raises:
        HTTPException: If verification fails
    """
    if not all([svix_id, svix_timestamp, svix_signature]):
        raise HTTPException(status_code=400, detail="Missing Svix headers")

    # Get raw body
    body = await request.body()
    body_str = body.decode()

    # TODO: Implement actual signature verification with Clerk webhook secret
    # For now, just parse the payload
    # In production, verify using: svix library or manual HMAC verification

    try:
        payload = json.loads(body_str)
        return payload
    except json.JSONDecodeError:
        raise HTTPException(status_code=400, detail="Invalid JSON payload")


@router.post("/clerk")
async def handle_clerk_webhook(
    payload: dict = Depends(verify_clerk_webhook),
    db: AsyncSession = Depends(get_db),
):
    """
    Handle Clerk webhook events for user synchronization

    Supported events:
    - user.created: Create new user in database
    - user.updated: Update existing user
    - user.deleted: Delete user from database

    Args:
        payload: Webhook payload
        db: Database session

    Returns:
        Success response
    """
    event_type = payload.get("type")
    data = payload.get("data", {})

    if event_type == "user.created":
        # Extract user data from Clerk payload
        user_id = data.get("id")
        email_addresses = data.get("email_addresses", [])
        primary_email = next(
            (e["email_address"] for e in email_addresses if e.get("id") == data.get("primary_email_address_id")),
            None
        )

        if not user_id or not primary_email:
            raise HTTPException(status_code=400, detail="Missing required user data")

        # Check if user already exists
        existing_user = await UserService.get_user_by_id(db, user_id)
        if existing_user:
            return {"message": "User already exists", "user_id": user_id}

        # Create new user
        user_create = UserCreate(
            id=user_id,
            email=primary_email,
            first_name=data.get("first_name"),
            last_name=data.get("last_name"),
            username=data.get("username"),
            profile_image_url=data.get("image_url"),
            email_verified=any(e.get("verification", {}).get("status") == "verified" for e in email_addresses),
        )

        await UserService.create_user(db, user_create)
        return {"message": "User created successfully", "user_id": user_id}

    elif event_type == "user.updated":
        user_id = data.get("id")
        if not user_id:
            raise HTTPException(status_code=400, detail="Missing user ID")

        # Extract updated fields
        email_addresses = data.get("email_addresses", [])
        primary_email = next(
            (e["email_address"] for e in email_addresses if e.get("id") == data.get("primary_email_address_id")),
            None
        )

        user_update = UserUpdate(
            first_name=data.get("first_name"),
            last_name=data.get("last_name"),
            username=data.get("username"),
            profile_image_url=data.get("image_url"),
            email_verified=any(e.get("verification", {}).get("status") == "verified" for e in email_addresses),
        )

        updated_user = await UserService.update_user(db, user_id, user_update)
        if not updated_user:
            raise HTTPException(status_code=404, detail="User not found")

        return {"message": "User updated successfully", "user_id": user_id}

    elif event_type == "user.deleted":
        user_id = data.get("id")
        if not user_id:
            raise HTTPException(status_code=400, detail="Missing user ID")

        deleted = await UserService.delete_user(db, user_id)
        if not deleted:
            raise HTTPException(status_code=404, detail="User not found")

        return {"message": "User deleted successfully", "user_id": user_id}

    else:
        # Unknown event type, log and ignore
        return {"message": f"Event type '{event_type}' not handled"}
