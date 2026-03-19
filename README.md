# Umbral - Your AI Learning Vault

An AI-powered learning vault platform built by the **AI PlayGrounds** community (LooperTech). Umbral helps users learn AI/ML concepts through hands-on project building, with AI-assisted planning, milestone tracking, and contextual task assistance.

## Overview

Umbral enables learners to manage their AI/ML learning journey through personal "vaults" containing project ideas, milestones, tasks, deployments, and documented learnings. The platform features conversational AI assistants that help at every stage — from project creation to task completion.

## Project Structure

```
umbral-edtech/
├── frontend/                      # Next.js 14 Application
│   ├── app/
│   │   ├── (landing)/            # Public landing page + early access
│   │   └── dashboard/            # Authenticated dashboard
│   │       ├── projects/         # Project CRUD + detail views
│   │       │   └── [id]/
│   │       │       └── milestones/[milestoneId]/  # Milestone detail + tasks
│   │       ├── assistant/        # General AI chat interface
│   │       ├── learnings/        # Knowledge repository
│   │       └── settings/         # User preferences
│   ├── components/
│   │   ├── ui/                   # Base UI components (terminal-style)
│   │   ├── layout/               # Sidebar, header, mobile nav
│   │   ├── dashboard/            # Stats grid, project cards
│   │   ├── projects/             # Milestone list, task board
│   │   └── chat/                 # All AI chat components
│   ├── lib/                      # API clients, utilities
│   ├── stores/                   # Zustand state management
│   └── types/                    # TypeScript interfaces
├── backend/                       # FastAPI Backend
│   ├── app/
│   │   ├── api/routes/           # REST API endpoints
│   │   ├── core/                 # Config, database, security
│   │   ├── models/               # SQLAlchemy models
│   │   ├── schemas/              # Pydantic schemas
│   │   └── services/             # Business logic + AI integration
│   ├── alembic/                  # Database migrations
│   └── main.py                   # Application entry point
└── infrastructure/                # Terraform IaC + deploy scripts
    └── terraform/                # AWS infrastructure definitions
```

## Tech Stack

### Frontend
- **Framework**: Next.js 14 with TypeScript (App Router)
- **Styling**: Tailwind CSS with custom terminal-futuristic theme
- **UI Components**: Radix UI primitives (Dialog, Dropdown, etc.)
- **State Management**: Zustand
- **Authentication**: Clerk
- **Markdown**: react-markdown + remark-gfm (GFM tables, code blocks)

### Backend
- **Framework**: Python 3.12 with FastAPI
- **Database**: PostgreSQL 17.6 (Supabase) with SQLAlchemy async + asyncpg
- **AI Model**: Google Gemini (gemini-2.5-flash)
- **Authentication**: Clerk JWT verification
- **Migrations**: Alembic

### Infrastructure
- **Cloud**: AWS (Lambda, API Gateway, S3, CloudFront)
- **Database**: Supabase (hosted PostgreSQL)
- **Frontend Hosting**: Vercel
- **DNS**: Cloudflare
- **IaC**: Terraform

## Core Features

### Project Management
- Create and manage AI/ML learning projects with full metadata (AI branch, technologies, priority, target user)
- Track project status: Planned, In Progress, On Hold, Completed, Archived
- Soft-delete support for projects

### AI Chat Assistants
Umbral features multiple specialized AI assistants, each with contextual awareness:

| Assistant | Session Type | Purpose |
|-----------|-------------|---------|
| **Project Creator** | `project_creation` | Guides users through defining a new project via conversation |
| **Milestone Planner** | `milestone_generation` | Suggests milestones based on project context; outputs markdown tables |
| **Task Generator** | `task_generation` | Proposes tasks for a milestone; outputs markdown tables |
| **Task Builder** | `task_builder` | Contextual copilot for completing a specific task |
| **General Assistant** | `general` | Free-form AI chat with project/learning context |

#### Task Builder (Contextual Assistant)
Each task has an AI builder button that opens a scoped assistant. The assistant receives:
- Full project context (name, AI branch, technologies, priority)
- Current milestone details (deliverable, success criteria)
- The specific task being worked on (title, description, type, complexity)
- All sibling tasks with their statuses (for dependency awareness)

This means the AI knows what's already been completed, what's in progress, and can warn about dependencies without the user having to explain context.

### Milestone Tracking
- AI-generated milestones with deliverable types (MVP, Feature, Integration, etc.)
- Progress tracking with visual progress bars
- Sequential milestone planning with dependency awareness

### Task Management
- **Status options**: Planned, In Progress, Completed, Cancelled
- **Soft-delete**: Deleted tasks are marked as `DELETED` in the database (not removed)
- **Optimistic UI updates**: Status changes reflect instantly without full page refresh
- **Delete confirmation**: Popup dialog before deletion
- **AI Builder**: Per-task contextual assistant button

### Learnings Repository
- Document what you learned, when to use it, when NOT to use it
- Categorized by AI/ML domain (Prompt Engineering, RAG, Fine-tuning, etc.)
- Confidence tracking (Exploring → Learning → Practicing → Confident → Expert)

### Deployments
- Log deployment versions with release notes
- Track environments (Development, Staging, Production)
- Capture feedback and metrics per deployment

## Data Model

### Key Entities
- **User** — Authenticated via Clerk, owns all data
- **Project** — AI/ML learning project with metadata
- **Milestone** — Deliverable-focused phase of a project
- **Task** — Concrete work item within a milestone
- **Deployment** — Versioned release with metrics
- **Learning** — Documented knowledge nugget
- **ChatSession** — AI conversation scoped to project/milestone/task
- **ActivityLog** — Audit trail of all user actions

### Task Statuses
```
PLANNED → IN_PROGRESS → COMPLETED
                      → CANCELLED
                      → DELETED (soft-delete, hidden from UI)
```

### Chat Session Types
```
general | project_creation | milestone_generation | task_generation | task_builder
```

## Getting Started

### Prerequisites
- Node.js 18+ and npm
- Python 3.12+
- PostgreSQL 14+ (or Supabase account)
- Clerk account (authentication)
- Google Gemini API key

### Frontend Setup

```bash
cd frontend
npm install
cp .env.local.example .env.local
# Configure: NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY, CLERK_SECRET_KEY, NEXT_PUBLIC_API_URL
npm run dev
```

The frontend runs at http://localhost:3000

### Backend Setup

```bash
cd backend
python -m venv .venv
# Windows: .venv\Scripts\activate | macOS/Linux: source .venv/bin/activate
pip install -r requirements.txt
cp .env.example .env
# Configure: DATABASE_URL, CLERK_SECRET_KEY, GEMINI_API_KEY
alembic upgrade head
uvicorn main:app --reload --host 0.0.0.0 --port 8000
```

The API runs at http://localhost:8000
- Swagger UI: http://localhost:8000/docs
- ReDoc: http://localhost:8000/redoc

### Database Migrations

```bash
cd backend
# Create a new migration
alembic revision --autogenerate -m "description"
# Apply all migrations
alembic upgrade head
```

## API Endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/api/auth/webhook` | Clerk webhook for user sync |
| GET | `/api/auth/me` | Current user profile |
| GET/POST | `/api/projects` | List/create projects |
| GET/PATCH/DELETE | `/api/projects/:id` | Get/update/delete project |
| GET/POST | `/api/milestones/:projectId/milestones` | List/create milestones |
| PATCH/DELETE | `/api/milestones/:id` | Update/delete milestone |
| GET/POST | `/api/milestones/:milestoneId/tasks` | List/create tasks |
| PATCH/DELETE | `/api/tasks/:id` | Update/delete task |
| GET/POST | `/api/chat/sessions` | List/create chat sessions |
| POST | `/api/chat/sessions/:id/messages` | Send message to AI |
| GET/POST | `/api/learnings` | List/create learnings |
| GET/POST | `/api/deployments` | List/create deployments |
| GET | `/api/dashboard/stats` | Dashboard statistics |
| POST | `/api/early-access` | Early access signup |

## Environment Variables

### Frontend (.env.local)
| Variable | Description |
|----------|-------------|
| `NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY` | Clerk public key |
| `CLERK_SECRET_KEY` | Clerk secret key |
| `NEXT_PUBLIC_API_URL` | Backend API URL |
| `NEXT_PUBLIC_PRODUCT_NAME` | Product name (default: Umbral) |

### Backend (.env)
| Variable | Description |
|----------|-------------|
| `DATABASE_URL` | PostgreSQL connection string |
| `CLERK_SECRET_KEY` | Clerk secret key for JWT verification |
| `GEMINI_API_KEY` | Google Gemini API key |
| `GEMINI_MODEL` | Model name (default: gemini-2.5-flash) |

## Brand & Theme

Umbral uses a **terminal-futuristic dark theme**:
- **Primary**: Sky Blue `#0EA5E9`
- **Accent**: Soft Yellow `#FCD34D`
- **Background**: Deep dark blue-black `#0A0F1A`
- **Typography**: JetBrains Mono (code), Space Grotesk (headings), Inter (body)

## Deployment

### Production
- **Frontend**: Deployed to Vercel via `vercel deploy`
- **Backend**: AWS Lambda behind API Gateway (Terraform managed)
- **Database**: Supabase (connection via pooler on port 5432)
- **Domain**: `learn.loopertech.net` (Cloudflare DNS)

### Infrastructure as Code
```bash
cd infrastructure/terraform
terraform init
terraform plan -var-file=environments/prod.tfvars
terraform apply -var-file=environments/prod.tfvars
```

## License

MIT License - Copyright (c) 2026 LooperAI Tech

## Contributing

This project is maintained by the AI PlayGrounds community. For questions or contributions, open an issue at the repository.
