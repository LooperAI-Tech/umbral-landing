"""
Umbral - AI Learning Vault Platform
FastAPI Backend Entry Point
"""

import logging
from contextlib import asynccontextmanager

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from app.core.config import settings
from app.core.database import check_db_connection, close_db

logging.basicConfig(level=logging.INFO, format="%(asctime)s %(levelname)s %(name)s: %(message)s")
logger = logging.getLogger(__name__)


@asynccontextmanager
async def lifespan(app: FastAPI):
    # Startup
    logger.info("Starting Umbral API...")
    connected = await check_db_connection()
    if not connected:
        logger.warning(
            "Could not connect to database. Check DATABASE_URL in .env. "
            "API will start but database-dependent routes will fail."
        )
    # Yield control to the application
    yield
    # Shutdown
    await close_db()
    logger.info("Umbral API shut down.")


app = FastAPI(
    title="Umbral API",
    description="AI Learning Vault - Your AI PlayGrounds project tracker",
    version="0.2.0",
    lifespan=lifespan,
)

# Configure CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.CORS_ORIGINS,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


@app.get("/")
async def root():
    return {
        "message": "Welcome to Umbral API",
        "version": "0.2.0",
        "status": "operational",
    }


@app.get("/health")
async def health_check():
    return {"status": "healthy"}


# Webhooks
from app.api.webhooks import clerk as clerk_webhooks

app.include_router(clerk_webhooks.router, prefix="/webhooks", tags=["webhooks"])

# API routes
from app.api.routes import auth, chat, projects, milestones, tasks, deployments, learnings, dashboard, early_access

app.include_router(auth.router, prefix="/api/auth", tags=["auth"])
app.include_router(chat.router, prefix="/api/chat", tags=["chat"])
app.include_router(projects.router, prefix="/api/projects", tags=["projects"])
app.include_router(milestones.router, prefix="/api", tags=["milestones"])
app.include_router(tasks.router, prefix="/api", tags=["tasks"])
app.include_router(deployments.router, prefix="/api", tags=["deployments"])
app.include_router(learnings.router, prefix="/api/learnings", tags=["learnings"])
app.include_router(dashboard.router, prefix="/api/dashboard", tags=["dashboard"])
app.include_router(early_access.router, prefix="/api/early-access", tags=["early-access"])

if __name__ == "__main__":
    import uvicorn

    uvicorn.run(
        "main:app",
        host="0.0.0.0",
        port=8000,
        reload=True,
        log_level="info",
    )
