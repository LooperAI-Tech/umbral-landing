"""
Umbral EdTech Platform - FastAPI Backend
Main application entry point
"""

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from app.core.config import settings

app = FastAPI(
    title="Umbral EdTech API",
    description="AI-powered educational platform with personalized learning",
    version="0.1.0",
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
    """Root endpoint"""
    return {
        "message": "Welcome to Umbral EdTech API",
        "version": "0.1.0",
        "status": "operational"
    }


@app.get("/health")
async def health_check():
    """Health check endpoint"""
    return {"status": "healthy"}


# Include routers
from app.api.webhooks import clerk as clerk_webhooks
from app.api.routes import chat, concepts

# Webhooks
app.include_router(clerk_webhooks.router, prefix="/webhooks", tags=["webhooks"])

# API routes
app.include_router(chat.router, prefix="/api/chat", tags=["chat"])
app.include_router(concepts.router, prefix="/api/concepts", tags=["concepts"])

# Future routes (will be added as we create them)
# from app.api.routes import progress, export, learning_paths, assessments
# app.include_router(progress.router, prefix="/api/progress", tags=["progress"])
# app.include_router(export.router, prefix="/api/export", tags=["export"])
# app.include_router(learning_paths.router, prefix="/api/learning-paths", tags=["learning-paths"])
# app.include_router(assessments.router, prefix="/api/assessments", tags=["assessments"])

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(
        "main:app",
        host="0.0.0.0",
        port=8000,
        reload=True,
        log_level="info"
    )
