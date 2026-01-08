"""
User service for CRUD operations
"""

from datetime import datetime
from typing import Optional
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession
from app.models.user import User
from app.schemas.user import UserCreate, UserUpdate


class UserService:
    """Service for managing user operations"""

    @staticmethod
    async def get_user_by_id(db: AsyncSession, user_id: str) -> Optional[User]:
        """
        Get user by ID

        Args:
            db: Database session
            user_id: User ID (Clerk ID)

        Returns:
            User object or None if not found
        """
        result = await db.execute(select(User).where(User.id == user_id))
        return result.scalar_one_or_none()

    @staticmethod
    async def get_user_by_email(db: AsyncSession, email: str) -> Optional[User]:
        """
        Get user by email address

        Args:
            db: Database session
            email: User email

        Returns:
            User object or None if not found
        """
        result = await db.execute(select(User).where(User.email == email))
        return result.scalar_one_or_none()

    @staticmethod
    async def create_user(db: AsyncSession, user_data: UserCreate) -> User:
        """
        Create a new user

        Args:
            db: Database session
            user_data: User creation data

        Returns:
            Created user object
        """
        user = User(
            id=user_data.id,
            email=user_data.email,
            first_name=user_data.first_name,
            last_name=user_data.last_name,
            username=user_data.username,
            profile_image_url=user_data.profile_image_url,
            email_verified=user_data.email_verified,
            is_active=True,
            created_at=datetime.utcnow(),
            updated_at=datetime.utcnow(),
        )
        db.add(user)
        await db.commit()
        await db.refresh(user)
        return user

    @staticmethod
    async def update_user(
        db: AsyncSession, user_id: str, user_data: UserUpdate
    ) -> Optional[User]:
        """
        Update user information

        Args:
            db: Database session
            user_id: User ID
            user_data: User update data

        Returns:
            Updated user object or None if not found
        """
        user = await UserService.get_user_by_id(db, user_id)
        if not user:
            return None

        # Update only provided fields
        update_data = user_data.model_dump(exclude_unset=True)
        for field, value in update_data.items():
            setattr(user, field, value)

        user.updated_at = datetime.utcnow()
        await db.commit()
        await db.refresh(user)
        return user

    @staticmethod
    async def delete_user(db: AsyncSession, user_id: str) -> bool:
        """
        Delete a user

        Args:
            db: Database session
            user_id: User ID

        Returns:
            True if deleted, False if not found
        """
        user = await UserService.get_user_by_id(db, user_id)
        if not user:
            return False

        await db.delete(user)
        await db.commit()
        return True

    @staticmethod
    async def update_last_login(db: AsyncSession, user_id: str) -> Optional[User]:
        """
        Update user's last login timestamp

        Args:
            db: Database session
            user_id: User ID

        Returns:
            Updated user object or None if not found
        """
        user = await UserService.get_user_by_id(db, user_id)
        if not user:
            return None

        user.last_login_at = datetime.utcnow()
        user.updated_at = datetime.utcnow()
        await db.commit()
        await db.refresh(user)
        return user
