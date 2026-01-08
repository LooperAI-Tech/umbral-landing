# Umbral EdTech Platform

An AI-powered educational platform that revolutionizes learning through personalized, visual, and open access to knowledge.

## Overview

Umbral enables students to learn through **interactive concept graphs**, **multiple teaching methodologies**, and **AI-driven explanations** while maintaining **full ownership** and **portability** of their learning data through the **OpenFree** context and memory export system.

## Project Structure

```
umbral-edtech/
├── frontend/              # Next.js frontend application
│   ├── app/              # Next.js App Router pages
│   ├── components/       # React components
│   ├── lib/              # Utilities and helpers
│   └── public/           # Static assets
├── backend/              # FastAPI backend application
│   ├── app/
│   │   ├── api/         # API routes and webhooks
│   │   ├── core/        # Core configuration and utilities
│   │   ├── models/      # SQLAlchemy database models
│   │   ├── schemas/     # Pydantic schemas
│   │   ├── services/    # Business logic
│   │   └── scripts/     # Utility scripts
│   ├── alembic/         # Database migrations
│   └── main.py          # Application entry point
├── shared/               # Shared types and schemas
└── docs/                 # Documentation
```

## Tech Stack

### Frontend
- **Framework**: Next.js 14+ with TypeScript
- **Styling**: Tailwind CSS + shadcn/ui
- **Visualization**: @xyflow/react (for concept graphs)
- **State Management**: Zustand
- **Authentication**: Clerk
- **Real-time**: Socket.io Client

### Backend
- **Framework**: Python 3.11+ with FastAPI
- **Database**: PostgreSQL with SQLAlchemy (async)
- **Vector DB**: ChromaDB
- **AI Models**: OpenAI (GPT-4), Anthropic (Claude) via LiteLLM
- **Real-time**: Socket.io
- **Authentication**: Clerk JWT verification
- **Migrations**: Alembic

### Infrastructure
- **Cloud Platform**: Microsoft Azure
- **Frontend Hosting**: Azure Static Web Apps
- **Backend Hosting**: Azure App Service
- **Database**: Azure Database for PostgreSQL (Flexible Server)
- **CI/CD**: GitHub Actions

## Getting Started

### Prerequisites

- Node.js 18+ and npm
- Python 3.11+
- PostgreSQL 14+
- Git

### Frontend Setup

1. Navigate to the frontend directory:
```bash
cd frontend
```

2. Install dependencies:
```bash
npm install
```

3. Copy the environment template:
```bash
cp .env.local.example .env.local
```

4. Update `.env.local` with your configuration:
   - Clerk API keys
   - API URL (default: http://localhost:8000)

5. Run the development server:
```bash
npm run dev
```

The frontend will be available at http://localhost:3000

### Backend Setup

1. Navigate to the backend directory:
```bash
cd backend
```

2. Create a virtual environment:
```bash
python -m venv venv
```

3. Activate the virtual environment:
   - Windows: `venv\Scripts\activate`
   - macOS/Linux: `source venv/bin/activate`

4. Install dependencies:
```bash
pip install -r requirements.txt
```

5. Copy the environment template:
```bash
cp .env.example .env
```

6. Update `.env` with your configuration:
   - Database URL
   - Clerk API keys
   - OpenAI API key
   - Anthropic API key

7. Initialize the database:
```bash
alembic upgrade head
```

8. Run the development server:
```bash
python main.py
```

Or with uvicorn directly:
```bash
uvicorn main:app --reload --host 0.0.0.0 --port 8000
```

The API will be available at http://localhost:8000

API documentation available at:
- Swagger UI: http://localhost:8000/docs
- ReDoc: http://localhost:8000/redoc

## Core Features (MVP)

### Phase 1 - Must Have (P0)
- ✅ User authentication (Clerk)
- 🚧 AI chat with multiple models (GPT-4, Claude)
- 🚧 Teaching method selection
- 🚧 Interactive concept graph visualization
- 🚧 Basic progress tracking
- 🚧 OpenFree export (chat transcripts)

### Phase 2 - Should Have (P1)
- ⏳ Real-time WebSocket chat
- ⏳ Learning path generation
- ⏳ Concept search and filtering
- ⏳ User profile settings
- ⏳ Basic assessments

## Development Workflow

### Running Both Servers

Terminal 1 (Backend):
```bash
cd backend
python main.py
```

Terminal 2 (Frontend):
```bash
cd frontend
npm run dev
```

### Database Migrations

Create a new migration:
```bash
cd backend
alembic revision --autogenerate -m "description"
```

Apply migrations:
```bash
alembic upgrade head
```

### Adding shadcn/ui Components

```bash
cd frontend
npx shadcn@latest add button
```

## Environment Variables

### Frontend (.env.local)
- `NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY` - Clerk public key
- `CLERK_SECRET_KEY` - Clerk secret key
- `NEXT_PUBLIC_API_URL` - Backend API URL
- `NEXT_PUBLIC_WS_URL` - WebSocket URL

### Backend (.env)
- `DATABASE_URL` - PostgreSQL connection string
- `CLERK_SECRET_KEY` - Clerk secret key for JWT verification
- `OPENAI_API_KEY` - OpenAI API key
- `ANTHROPIC_API_KEY` - Anthropic API key
- `CHROMA_PERSIST_DIRECTORY` - ChromaDB storage path

## Deployment

### Microsoft Azure (Recommended)

This project is configured for deployment to Microsoft Azure using:
- **Azure Static Web Apps** for Next.js frontend
- **Azure App Service** for FastAPI backend
- **Azure Database for PostgreSQL** for the database

#### Quick Deploy with Azure CLI

```bash
# Deploy everything
cd scripts/azure
./setup-azure.sh

# Or deploy individually
./deploy-backend.sh   # Deploy backend + database
./deploy-frontend.sh  # Deploy frontend
```

#### Manual Deployment

See the comprehensive [Azure Deployment Guide](./docs/AZURE_DEPLOYMENT.md) for detailed step-by-step instructions.

**Estimated Azure Cost (Development):** ~$25-30/month

### Local Development Deployment

For local testing without cloud deployment:

```bash
# Terminal 1: Run backend locally
cd backend
python -m venv venv
source venv/bin/activate  # On Windows: venv\Scripts\activate
pip install -r requirements.txt
python main.py

# Terminal 2: Run frontend locally
cd frontend
npm install
npm run dev
```

## Documentation

- [Full Project Requirements](./docs/PROJECT_REQUIREMENTS.md)
- [Prototype Requirements](./docs/PROTOTYPE_REQUIREMENTS.md)
- [Azure Deployment Guide](./docs/AZURE_DEPLOYMENT.md)

## License

MIT License - Copyright (c) 2026 Looper AI

## Contributing

This is a prototype project. For questions or contributions, please contact the development team.
