# Supabase Configuration & Usage

> Umbral EdTech uses **Supabase** (hosted PostgreSQL 17) as its database backend, connected via the **Supabase Session Pooler** with **SQLAlchemy async + asyncpg**.

---

## Table of Contents

- [Connection Overview](#connection-overview)
- [Environment Setup](#environment-setup)
- [Connection Architecture](#connection-architecture)
- [SSL & Pooler Configuration](#ssl--pooler-configuration)
- [Database Schema](#database-schema)
- [Migrations with Alembic](#migrations-with-alembic)
- [Startup Health Check](#startup-health-check)
- [Troubleshooting](#troubleshooting)
- [Supabase Dashboard Reference](#supabase-dashboard-reference)

---

## Connection Overview

| Setting            | Value                                                        |
| ------------------ | ------------------------------------------------------------ |
| **Provider**       | Supabase (PostgreSQL 17.6)                                   |
| **Connection Mode**| Session Pooler (Supavisor)                                   |
| **Driver**         | `asyncpg` via `SQLAlchemy[asyncio]`                          |
| **Pooler Host**    | `aws-1-us-east-1.pooler.supabase.com`                       |
| **Port**           | `5432` (Session mode)                                        |
| **Database**       | `postgres`                                                   |
| **Username Format**| `postgres.[PROJECT-REF]`                                     |

### Why Session Pooler (not Transaction or Direct)?

- **Transaction Pooler (port 6543)**: Doesn't support prepared statements — works with `statement_cache_size=0` but has more restrictions.
- **Session Pooler (port 5432)**: Full PostgreSQL feature support, compatible with migrations and all SQLAlchemy features.
- **Direct Connection (`db.[ref].supabase.co`)**: Resolves to IPv6 only — doesn't work on networks without IPv6 support.

---

## Environment Setup

### 1. Get your connection string

1. Go to **Supabase Dashboard** > **Settings** > **Database**
2. Under **Connection string**, select **URI** format
3. Copy the **Session Pooler** connection string (port 5432)

It will look like:

```
postgresql://postgres.[PROJECT-REF]:[YOUR-PASSWORD]@aws-[N]-[REGION].pooler.supabase.com:5432/postgres
```

### 2. Configure `.env`

In `backend/.env`, set the `DATABASE_URL` with the `+asyncpg` driver prefix:

```bash
# Database Configuration (Supabase)
DATABASE_URL=postgresql+asyncpg://postgres.[PROJECT-REF]:[PASSWORD]@aws-[N]-[REGION].pooler.supabase.com:5432/postgres
```

**Example** (with actual project ref):

```bash
DATABASE_URL=postgresql+asyncpg://postgres.uzhujvcmdgkpdpnxccdb:MyPassword@aws-1-us-east-1.pooler.supabase.com:5432/postgres
```

### 3. Important notes

- Always use `postgresql+asyncpg://` as the scheme (not `postgresql://`)
- The username **must** include the project ref after a dot: `postgres.[ref]`
- The pooler hostname varies per project — **always copy from dashboard** (e.g., `aws-0-...` vs `aws-1-...`)
- The password is your **database password** from Supabase Settings > Database

---

## Connection Architecture

### How the engine is built (`backend/app/core/database.py`)

The engine factory detects Supabase URLs and applies special handling:

```python
def _build_engine():
    from urllib.parse import urlparse

    url = settings.DATABASE_URL
    parsed = urlparse(url)

    # Supabase: pass connection params explicitly
    # (asyncpg has issues parsing dot-notation usernames from URLs)
    if parsed.hostname and "supabase" in parsed.hostname:
        return create_async_engine(
            "postgresql+asyncpg://",
            connect_args={
                "host": parsed.hostname,
                "port": parsed.port or 5432,
                "user": parsed.username,       # e.g. "postgres.uzhujvcm..."
                "password": parsed.password,
                "database": parsed.path.lstrip("/") or "postgres",
                "ssl": _make_ssl_context(),
                "statement_cache_size": 0,
            },
            pool_size=5,
            max_overflow=10,
            pool_pre_ping=True,
        )

    # Local PostgreSQL: use URL directly
    return create_async_engine(url, pool_size=10, max_overflow=20)
```

**Why explicit params?** asyncpg's URL parser mishandles the `.` in `postgres.[ref]`, causing "Tenant or user not found" errors. Passing `user`, `host`, `password` as separate `connect_args` bypasses this.

### Pool settings for Supabase

| Setting               | Value  | Reason                                                   |
| --------------------- | ------ | -------------------------------------------------------- |
| `pool_size`           | 5      | Supabase free tier limits connections                    |
| `max_overflow`        | 10     | Allow brief bursts without exhausting pooler             |
| `pool_pre_ping`       | True   | Detect stale connections before use                      |
| `statement_cache_size`| 0      | Supabase pooler doesn't support prepared statements      |

---

## SSL & Pooler Configuration

Supabase requires SSL for all connections. The pooler uses a certificate that asyncpg can't verify with default settings, so we create a custom SSL context:

```python
import ssl

def _make_ssl_context():
    ctx = ssl.create_default_context()
    ctx.check_hostname = False
    ctx.verify_mode = ssl.CERT_NONE
    return ctx
```

This is applied in both:

- **`backend/app/core/database.py`** — for the application engine
- **`backend/alembic/env.py`** — for migration connections

> **Note**: `CERT_NONE` is acceptable here because Supabase's pooler endpoint is a known, trusted service. The connection is still encrypted via TLS.

---

## Database Schema

The database contains **11 tables** and **12 custom enum types**, created by the initial migration `000_initial_schema.py`.

### Tables

| Table                | Description                                    | Key Relationships                |
| -------------------- | ---------------------------------------------- | -------------------------------- |
| `users`              | User accounts (synced from Clerk)              | Has many projects, learnings, etc |
| `user_stats`         | Aggregated user statistics                     | Belongs to user (1:1)            |
| `projects`           | AI/ML learning projects                        | Belongs to user, has milestones  |
| `milestones`         | Project milestones with deliverables           | Belongs to project, has tasks    |
| `tasks`              | Individual work items                          | Belongs to milestone             |
| `deployments`        | Project deployment versions                    | Belongs to project               |
| `deployment_metrics` | Performance metrics per deployment             | Belongs to deployment (1:1)      |
| `learnings`          | Documented knowledge & concepts                | Belongs to user, optionally project |
| `chat_sessions`      | AI chat conversation sessions                  | Belongs to user, optionally project |
| `chat_messages`      | Individual messages in sessions                | Belongs to chat_session          |
| `activity_logs`      | Audit trail of user actions                    | Belongs to user                  |

### Enum Types

| Enum               | Values                                                                         |
| ------------------- | ------------------------------------------------------------------------------ |
| `aibranch`          | GENAI_LLM, ML_TRADITIONAL, COMPUTER_VISION, NLP, REINFORCEMENT_LEARNING, MLOPS, DATA_ENGINEERING, OTHER |
| `projectstatus`     | PLANNED, IN_PROGRESS, ON_HOLD, COMPLETED, ARCHIVED                            |
| `priority`          | LOW, MEDIUM, HIGH, CRITICAL                                                   |
| `deliverabletype`   | MVP, FEATURE, INTEGRATION, DEPLOYMENT, DOCUMENTATION, RESEARCH, OTHER         |
| `milestonestatus`   | PLANNED, IN_PROGRESS, BLOCKED, COMPLETED, SKIPPED                             |
| `tasktype`          | DEVELOPMENT, PROMPT_ENGINEERING, FRONTEND, BACKEND, DEPLOYMENT, RESEARCH, TESTING, DOCUMENTATION, DESIGN, DATA_WORK, INTEGRATION, OTHER |
| `complexity`        | TRIVIAL, EASY, MEDIUM, HARD, COMPLEX                                          |
| `taskstatus`        | PLANNED, IN_PROGRESS, IN_REVIEW, BLOCKED, COMPLETED, CANCELLED                |
| `environment`       | DEVELOPMENT, STAGING, PRODUCTION                                              |
| `deploymentstatus`  | PREPARING, DEPLOYING, ACTIVE, DEPRECATED, ROLLED_BACK, FAILED                 |
| `learningcategory`  | PROMPT_ENGINEERING, RAG_RETRIEVAL, FINE_TUNING, MODEL_SELECTION, EMBEDDINGS, AGENTS, EVALUATION, DATA_PROCESSING, MLOPS, DEPLOYMENT, UX_PATTERNS, ARCHITECTURE, PERFORMANCE, SECURITY, COST_OPTIMIZATION, OTHER |
| `confidencelevel`   | EXPLORING, LEARNING, PRACTICING, CONFIDENT, EXPERT                            |

### Entity Relationship Diagram

```
users
 ├── 1:1  user_stats
 ├── 1:N  projects
 │         ├── 1:N  milestones
 │         │         └── 1:N  tasks
 │         ├── 1:N  deployments
 │         │         └── 1:1  deployment_metrics
 │         ├── 1:N  learnings
 │         └── 1:N  chat_sessions
 │                   └── 1:N  chat_messages
 ├── 1:N  learnings
 ├── 1:N  chat_sessions
 └── 1:N  activity_logs
```

---

## Migrations with Alembic

### Running migrations

```bash
cd backend

# Apply all pending migrations
alembic upgrade head

# Check current migration status
alembic current

# View migration history
alembic history
```

### Creating new migrations

```bash
# Auto-generate from model changes
alembic revision --autogenerate -m "description of changes"

# Create empty migration
alembic revision -m "description"
```

### Rolling back

```bash
# Rollback one step
alembic downgrade -1

# Rollback to specific revision
alembic downgrade 000_initial

# Rollback everything
alembic downgrade base
```

### How Alembic connects to Supabase

The `alembic/env.py` file uses the same Supabase-aware connection logic as the app:

1. Reads `DATABASE_URL` from `backend/.env` via `app.core.config.settings`
2. Detects Supabase hostname and applies explicit `connect_args`
3. Uses `NullPool` (no connection pooling needed for one-off migrations)
4. Creates SSL context with `CERT_NONE` for Supabase compatibility

### Migration files

| File                      | Revision      | Description                |
| ------------------------- | ------------- | -------------------------- |
| `000_initial_schema.py`   | `000_initial` | Creates all 11 tables + enums |

---

## Startup Health Check

On application startup, `backend/main.py` tests the database connection:

```python
@asynccontextmanager
async def lifespan(app: FastAPI):
    connected = await check_db_connection()  # Runs SELECT 1
    if not connected:
        logger.warning("Could not connect to database...")
    yield
    await close_db()
```

- **Success**: Logs `"Database connected successfully"`
- **Failure**: Logs a warning with the error — the API still starts but DB routes will fail
- **Shutdown**: Properly disposes the engine and closes all connections

---

## Troubleshooting

### "Tenant or user not found"

**Cause**: Wrong pooler hostname. Supabase assigns different pooler servers per project.

**Fix**: Copy the exact connection string from **Supabase Dashboard > Settings > Database > Connection string**. Pay attention to the `aws-N` prefix (e.g., `aws-0` vs `aws-1`).

### "SSL: CERTIFICATE_VERIFY_FAILED"

**Cause**: asyncpg tries to verify the pooler's SSL certificate, which fails.

**Fix**: Already handled — the code creates an SSL context with `verify_mode = ssl.CERT_NONE`. If you see this error, make sure you're using the Supabase-aware engine builder in `database.py`.

### "getaddrinfo failed" (DNS resolution error)

**Cause**: The direct connection hostname (`db.[ref].supabase.co`) only resolves to IPv6. Your network may not support IPv6.

**Fix**: Use the **Session Pooler** connection (port 5432) instead of the direct connection. The pooler resolves to IPv4.

### asyncpg URL parsing issues with dot-usernames

**Cause**: asyncpg doesn't correctly parse `postgres.[ref]` from a connection URL.

**Fix**: Already handled — the code parses the URL manually and passes `user`, `host`, `password` as explicit `connect_args`.

### Connection pool exhausted

**Cause**: Supabase free tier limits concurrent connections.

**Fix**: Pool is already configured conservatively (`pool_size=5`, `max_overflow=10`). If still hitting limits:
- Check for connection leaks (sessions not being closed)
- Reduce `pool_size` further
- Upgrade Supabase plan for more connections

### Alembic migration hangs or times out

**Cause**: Pooler or network issue.

**Fix**:
1. Verify the connection works: `python -c "from app.core.database import check_db_connection; import asyncio; asyncio.run(check_db_connection())"`
2. Check that no other migration is holding a lock in Supabase
3. In Supabase Dashboard > Database > Roles, verify the `postgres` role has full permissions

---

## Supabase Dashboard Reference

### Key settings locations

| What                    | Where in Dashboard                              |
| ----------------------- | ----------------------------------------------- |
| Connection strings      | Settings > Database > Connection string         |
| Database password       | Settings > Database > Database password         |
| Project reference ID    | Settings > General > Reference ID               |
| Connection limits       | Settings > Database > Connection pooling        |
| Table editor            | Table Editor (left sidebar)                     |
| SQL editor              | SQL Editor (left sidebar)                       |
| Database logs           | Logs > Postgres                                 |
| API keys                | Settings > API                                  |

### Useful SQL queries (run in Supabase SQL Editor)

```sql
-- Check all tables
SELECT table_name FROM information_schema.tables
WHERE table_schema = 'public' ORDER BY table_name;

-- Check migration status
SELECT * FROM alembic_version;

-- Count rows per table
SELECT schemaname, relname, n_live_tup
FROM pg_stat_user_tables ORDER BY n_live_tup DESC;

-- Check active connections
SELECT count(*) FROM pg_stat_activity;

-- List enum types and values
SELECT t.typname, e.enumlabel
FROM pg_type t JOIN pg_enum e ON t.oid = e.enumtypid
ORDER BY t.typname, e.enumsortorder;
```
