-- Initialize the database for Umbral EdTech
-- This script runs automatically when the PostgreSQL container is first created

-- Create UUID extension for generating UUIDs
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- The database is already created by POSTGRES_DB env var
-- Alembic migrations will handle schema creation
