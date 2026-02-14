"""
Application configuration and settings.
All values are loaded from backend/.env via pydantic-settings.
"""

from typing import List
from pydantic_settings import BaseSettings, SettingsConfigDict


class Settings(BaseSettings):
    """Application settings — loaded from .env file"""

    # Application
    APP_NAME: str = "Umbral EdTech API"
    APP_VERSION: str = "0.1.0"
    DEBUG: bool = False

    # CORS
    CORS_ORIGINS: List[str] = [
        "http://localhost:3000",
        "http://127.0.0.1:3000",
    ]

    # Database (required — no default, must be set in .env)
    DATABASE_URL: str

    # Authentication — Clerk (required)
    CLERK_SECRET_KEY: str
    CLERK_PUBLISHABLE_KEY: str

    # AI — Google Gemini (required)
    GEMINI_API_KEY: str
    GEMINI_MODEL: str = "gemini-2.5-flash"
    MAX_TOKENS_PER_REQUEST: int = 4000
    AI_TEMPERATURE: float = 0.7

    # Security (required)
    SECRET_KEY: str
    ALGORITHM: str = "HS256"
    ACCESS_TOKEN_EXPIRE_MINUTES: int = 30

    # API Rate Limiting
    RATE_LIMIT_PER_MINUTE: int = 60

    # AWS
    AWS_REGION: str = "us-east-1"

    model_config = SettingsConfigDict(
        env_file=".env",
        env_file_encoding="utf-8",
        case_sensitive=True,
        extra="ignore",
    )


settings = Settings()
