"""
Security utilities for authentication and authorization
"""

from typing import Optional
from fastapi import HTTPException, Security, status
from fastapi.security import HTTPAuthorizationCredentials, HTTPBearer
from jose import JWTError, jwt
from app.core.config import settings

security = HTTPBearer()


async def verify_clerk_token(
    credentials: HTTPAuthorizationCredentials = Security(security)
) -> dict:
    """
    Verify Clerk JWT token and extract user information

    Args:
        credentials: HTTP Authorization header with Bearer token

    Returns:
        dict: Decoded token payload with user information

    Raises:
        HTTPException: If token is invalid or expired
    """
    token = credentials.credentials

    try:
        # Decode and verify the JWT token
        # Note: Clerk uses RS256 algorithm, need to fetch JWKS from Clerk
        # For now, this is a placeholder implementation
        payload = jwt.decode(
            token,
            settings.CLERK_SECRET_KEY,
            algorithms=["RS256"],
            options={"verify_signature": True}
        )
        return payload
    except JWTError as e:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid authentication credentials",
            headers={"WWW-Authenticate": "Bearer"},
        )


def get_user_id_from_token(payload: dict) -> Optional[str]:
    """
    Extract user ID from decoded token payload

    Args:
        payload: Decoded JWT payload

    Returns:
        str: User ID if present, None otherwise
    """
    return payload.get("sub")
