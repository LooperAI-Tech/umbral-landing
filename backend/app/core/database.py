"""
Database connection and session management
"""

import logging
import ssl
from sqlalchemy.ext.asyncio import AsyncSession, create_async_engine, async_sessionmaker
from sqlalchemy.orm import declarative_base
from sqlalchemy import text
from app.core.config import settings

logger = logging.getLogger(__name__)

# Parse Supabase URL and build engine with explicit connect args
# This avoids asyncpg URL-parsing issues with dot-notation usernames
def _make_ssl_context():
    ctx = ssl.create_default_context()
    ctx.check_hostname = False
    ctx.verify_mode = ssl.CERT_NONE
    return ctx


def _build_engine():
    from urllib.parse import urlparse

    url = settings.DATABASE_URL
    parsed = urlparse(url)

    # If using Supabase pooler (dot in username), pass params explicitly
    if parsed.hostname and "supabase" in parsed.hostname:
        return create_async_engine(
            "postgresql+asyncpg://",
            echo=settings.DEBUG,
            future=True,
            pool_pre_ping=True,
            pool_size=5,
            max_overflow=10,
            connect_args={
                "host": parsed.hostname,
                "port": parsed.port or 6543,
                "user": parsed.username,
                "password": parsed.password,
                "database": parsed.path.lstrip("/") or "postgres",
                "ssl": _make_ssl_context(),
                "statement_cache_size": 0,
            },
        )

    # Local/standard PostgreSQL — use URL directly
    return create_async_engine(
        url,
        echo=settings.DEBUG,
        future=True,
        pool_pre_ping=True,
        pool_size=10,
        max_overflow=20,
    )


engine = _build_engine()

# Create async session factory
AsyncSessionLocal = async_sessionmaker(
    engine,
    class_=AsyncSession,
    expire_on_commit=False,
    autocommit=False,
    autoflush=False,
)

# Base class for models
Base = declarative_base()


async def get_db() -> AsyncSession:
    """
    Dependency for getting async database sessions
    """
    async with AsyncSessionLocal() as session:
        try:
            yield session
            await session.commit()
        except Exception:
            await session.rollback()
            raise
        finally:
            await session.close()


async def init_db():
    """
    Initialize database tables
    """
    async with engine.begin() as conn:
        await conn.run_sync(Base.metadata.create_all)


async def check_db_connection() -> bool:
    """
    Test database connectivity. Returns True if connected, False otherwise.
    """
    try:
        async with engine.connect() as conn:
            await conn.execute(text("SELECT 1"))
        logger.info("Database connected successfully")
        return True
    except Exception as e:
        logger.error(f"Database connection failed: {e}")
        return False


async def close_db():
    """
    Close database connections
    """
    await engine.dispose()
