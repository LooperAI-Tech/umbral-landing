# Docker Configuration

This directory contains all Docker-related files for the Umbral EdTech platform.

## Directory Structure

```
docker/
├── backend/
│   ├── Dockerfile          # Production build for FastAPI backend
│   └── Dockerfile.dev      # Development build with hot-reload
├── frontend/
│   ├── Dockerfile          # Production build for Next.js frontend
│   └── Dockerfile.dev      # Development build with hot-reload
├── postgres/
│   └── init.sql            # PostgreSQL initialization script
├── docker-compose.yml      # Orchestration for all services
├── .env.docker             # Environment variable template
└── README.md               # This file
```

## Quick Start

### 1. Set up environment variables

```bash
cd docker
cp .env.docker .env
# Edit .env and add your actual keys (Clerk, OpenAI, Anthropic)
```

### 2. Start all services

```bash
docker compose up -d
```

This will start:
- **PostgreSQL** on port 5432
- **Backend API** on port 8000
- **Frontend** on port 3000

### 3. Run database migrations

```bash
docker compose exec backend alembic upgrade head
```

### 4. Access the application

- Frontend: http://localhost:3000
- Backend API: http://localhost:8000
- API Docs: http://localhost:8000/docs

## Common Commands

### View logs

```bash
# All services
docker compose logs -f

# Specific service
docker compose logs -f backend
docker compose logs -f frontend
docker compose logs -f postgres
```

### Rebuild services

```bash
# Rebuild all
docker compose build

# Rebuild specific service
docker compose build backend
docker compose build frontend
```

### Stop services

```bash
# Stop (keeps data)
docker compose stop

# Stop and remove containers (keeps volumes)
docker compose down

# Stop, remove containers and volumes (clean slate)
docker compose down -v
```

### Execute commands in containers

```bash
# Backend shell
docker compose exec backend bash

# Frontend shell
docker compose exec frontend sh

# PostgreSQL shell
docker compose exec postgres psql -U umbral -d umbral_db

# Run migrations
docker compose exec backend alembic upgrade head

# Create new migration
docker compose exec backend alembic revision --autogenerate -m "description"
```

### Restart a service

```bash
docker compose restart backend
docker compose restart frontend
```

## Services

### PostgreSQL

- **Image**: postgres:16-alpine
- **Port**: 5432
- **Database**: umbral_db
- **User**: umbral (configurable in .env)
- **Data**: Persisted in `umbral-postgres-data` volume

### Backend (FastAPI)

- **Build Context**: ../backend
- **Dockerfile**: ./backend/Dockerfile.dev (development)
- **Port**: 8000
- **Hot-reload**: Enabled via uvicorn --reload
- **Volume Mount**: ../backend:/app (source code)
- **Data**: ChromaDB persisted in `umbral-backend-chroma` volume

### Frontend (Next.js)

- **Build Context**: ../frontend
- **Dockerfile**: ./frontend/Dockerfile.dev (development)
- **Port**: 3000
- **Hot-reload**: Enabled via npm run dev
- **Volume Mount**: ../frontend:/app (source code)
- **Note**: node_modules preserved in anonymous volume for performance

## Development Workflow

### Making code changes

Both backend and frontend are configured with hot-reload:

1. **Backend**: Edit files in `../backend/` - uvicorn will auto-reload
2. **Frontend**: Edit files in `../frontend/` - Next.js will hot-reload in browser

### Adding dependencies

**Backend**:
```bash
# Option 1: Edit requirements.txt and rebuild
docker compose build backend
docker compose up -d backend

# Option 2: Install directly (temporary)
docker compose exec backend pip install package-name
```

**Frontend**:
```bash
# Option 1: Edit package.json and rebuild
docker compose build frontend
docker compose up -d frontend

# Option 2: Install directly (temporary)
docker compose exec frontend npm install package-name
```

### Database migrations

```bash
# Create new migration
docker compose exec backend alembic revision --autogenerate -m "add new table"

# Apply migrations
docker compose exec backend alembic upgrade head

# Rollback one migration
docker compose exec backend alembic downgrade -1
```

## Production Builds

To use production Dockerfiles:

```yaml
# Modify docker-compose.yml
backend:
  build:
    dockerfile: ../docker/backend/Dockerfile  # Remove .dev

frontend:
  build:
    dockerfile: ../docker/frontend/Dockerfile  # Remove .dev
```

Or create a separate `docker-compose.prod.yml` file.

## Troubleshooting

### Port already in use

```bash
# Check what's using the port
netstat -ano | findstr :3000
netstat -ano | findstr :8000
netstat -ano | findstr :5432

# Kill the process or change ports in docker-compose.yml
```

### Permission errors (Linux/Mac)

```bash
# If you get permission errors with volumes
sudo chown -R $USER:$USER ../backend
sudo chown -R $USER:$USER ../frontend
```

### Hot-reload not working

**Windows**: Add to frontend service environment:
```yaml
WATCHPACK_POLLING: "true"
```

### Database connection errors

```bash
# Check if postgres is healthy
docker compose ps

# View postgres logs
docker compose logs postgres

# Verify connection string in backend
docker compose exec backend env | grep DATABASE_URL
```

### Clean slate restart

```bash
# Remove everything and start fresh
docker compose down -v
docker compose build --no-cache
docker compose up -d
docker compose exec backend alembic upgrade head
```

## Network Configuration

All services communicate via the `umbral-network` bridge network:

- Services can reach each other using service names (e.g., `postgres:5432`, `backend:8000`)
- External access via mapped ports on localhost
- Frontend browser requests use `localhost:8000` (not `backend:8000`)

## Environment Variables

Key variables in `.env`:

| Variable | Description | Required |
|----------|-------------|----------|
| POSTGRES_USER | Database user | Yes |
| POSTGRES_PASSWORD | Database password | Yes |
| POSTGRES_DB | Database name | Yes |
| CLERK_SECRET_KEY | Clerk authentication | Yes |
| CLERK_PUBLISHABLE_KEY | Clerk authentication | Yes |
| OPENAI_API_KEY | OpenAI API access | Optional |
| ANTHROPIC_API_KEY | Anthropic API access | Optional |

See `.env.docker` for the complete list.
