"""
Security utilities for authentication and authorization
"""

import time
from typing import Optional

import httpx
from fastapi import HTTPException, Security, status
from fastapi.security import HTTPAuthorizationCredentials, HTTPBearer
from jose import JWTError, jwt

from app.core.config import settings

security = HTTPBearer()

# Cache for Clerk JWKS keys
_jwks_cache: dict = {"keys": [], "fetched_at": 0}
_JWKS_CACHE_TTL = 3600  # 1 hour


async def _get_clerk_jwks() -> list[dict]:
    """
    Fetch and cache Clerk's JWKS (JSON Web Key Set) for RS256 verification.
    """
    now = time.time()
    if _jwks_cache["keys"] and (now - _jwks_cache["fetched_at"]) < _JWKS_CACHE_TTL:
        return _jwks_cache["keys"]

    # Clerk JWKS endpoint is derived from the frontend API
    # Format: https://api.clerk.com/v1/jwks or from the Clerk instance
    clerk_secret = settings.CLERK_SECRET_KEY
    if not clerk_secret:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Clerk secret key not configured",
        )

    # Extract the Clerk instance ID from the secret key to build the JWKS URL
    # Clerk secret keys start with "sk_test_" or "sk_live_"
    try:
        async with httpx.AsyncClient() as client:
            response = await client.get(
                "https://api.clerk.com/v1/jwks",
                headers={"Authorization": f"Bearer {clerk_secret}"},
            )
            response.raise_for_status()
            jwks_data = response.json()
            _jwks_cache["keys"] = jwks_data.get("keys", [])
            _jwks_cache["fetched_at"] = now
            return _jwks_cache["keys"]
    except httpx.HTTPError:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Failed to fetch Clerk JWKS",
        )


async def verify_clerk_token(
    credentials: HTTPAuthorizationCredentials = Security(security),
) -> dict:
    """
    Verify Clerk JWT token using JWKS (RS256) and extract user information.
    """
    token = credentials.credentials

    try:
        # Get the signing keys from Clerk
        jwks_keys = await _get_clerk_jwks()
        if not jwks_keys:
            raise HTTPException(
                status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
                detail="No signing keys available",
            )

        # Get the key ID from the token header
        unverified_header = jwt.get_unverified_header(token)
        kid = unverified_header.get("kid")

        # Find the matching key
        signing_key = None
        for key in jwks_keys:
            if key.get("kid") == kid:
                signing_key = key
                break

        if not signing_key:
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail="Unable to find matching signing key",
                headers={"WWW-Authenticate": "Bearer"},
            )

        # Decode and verify the token
        payload = jwt.decode(
            token,
            signing_key,
            algorithms=["RS256"],
            options={"verify_aud": False},
        )
        return payload

    except JWTError:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid authentication credentials",
            headers={"WWW-Authenticate": "Bearer"},
        )


def get_user_id_from_token(payload: dict) -> Optional[str]:
    """
    Extract user ID from decoded token payload.
    """
    return payload.get("sub")
