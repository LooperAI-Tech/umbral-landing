#!/bin/bash
# Azure App Service startup script for FastAPI backend

echo "Starting Umbral EdTech Backend..."

# Run database migrations
echo "Running database migrations..."
alembic upgrade head

# Start the FastAPI application with uvicorn
echo "Starting uvicorn server..."
uvicorn main:app --host 0.0.0.0 --port 8000 --workers 4
