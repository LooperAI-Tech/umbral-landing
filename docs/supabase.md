# Supabase - Complete Reference

> Umbral EdTech uses **Supabase** (hosted PostgreSQL 17.6) in two distinct ways:
> 1. **Backend (Python)**: SQLAlchemy async + asyncpg via the **Session Pooler** for all CRUD operations
> 2. **Frontend (Next.js)**: `@supabase/supabase-js` client with the **anon key** for public-facing features (early access form)

---

## Table of Contents

- [Project Overview](#project-overview)
- [Installation](#installation)
- [Connection Modes](#connection-modes)
- [Backend: SQLAlchemy + asyncpg](#backend-sqlalchemy--asyncpg)
  - [Environment Setup](#backend-environment-setup)
  - [Connection Architecture](#connection-architecture)
  - [SSL Configuration](#ssl-configuration)
  - [Pool Settings](#pool-settings)
  - [Startup Health Check](#startup-health-check)
- [Frontend: Supabase JS Client](#frontend-supabase-js-client)
  - [Installation](#frontend-installation)
  - [Environment Setup](#frontend-environment-setup)
  - [Client Initialization](#client-initialization)
  - [Direct Inserts](#direct-inserts)
  - [RPC Functions](#rpc-functions)
- [Row Level Security (RLS)](#row-level-security-rls)
  - [What Is RLS](#what-is-rls)
  - [Policies Used](#policies-used)
  - [Creating Policies](#creating-policies)
- [Database Schema](#database-schema)
  - [Tables](#tables)
  - [Enum Types](#enum-types)
  - [Entity Relationship Diagram](#entity-relationship-diagram)
  - [Early Access Table](#early-access-table)
- [Migrations with Alembic](#migrations-with-alembic)
  - [Running Migrations](#running-migrations)
  - [Creating New Migrations](#creating-new-migrations)
  - [How Alembic Connects to Supabase](#how-alembic-connects-to-supabase)
  - [Migration Files](#migration-files)
- [SQL Functions & Triggers](#sql-functions--triggers)
  - [check_email_exists RPC](#check_email_exists-rpc)
  - [set_request_meta Trigger](#set_request_meta-trigger)
- [Supabase Dashboard Reference](#supabase-dashboard-reference)
- [Errors & Fixes](#errors--fixes)

---

## Project Overview

| Setting            | Value                                                        |
| ------------------ | ------------------------------------------------------------ |
| **Provider**       | Supabase (PostgreSQL 17.6)                                   |
| **Project Ref**    | `uzhujvcmdgkpdpnxccdb`                                      |
| **Region**         | `us-east-1` (AWS)                                            |
| **Pooler Host**    | `aws-1-us-east-1.pooler.supabase.com`                       |
| **Session Port**   | `5432`                                                       |
| **Transaction Port** | `6543`                                                     |
| **Database**       | `postgres`                                                   |
| **Username Format**| `postgres.uzhujvcmdgkpdpnxccdb`                             |
| **Project URL**    | `https://uzhujvcmdgkpdpnxccdb.supabase.co`                  |

---

## Installation

### Backend (Python)

The backend uses SQLAlchemy with the asyncpg driver. These are already in `backend/requirements.txt`:

```bash
cd backend
pip install sqlalchemy[asyncio] asyncpg alembic
```

Key packages:
- `sqlalchemy[asyncio]` — ORM with async support
- `asyncpg` — PostgreSQL async driver for Python
- `alembic` — Database migration tool

### Frontend (Next.js)

The frontend uses the official Supabase JavaScript client:

```bash
cd frontend
npm install @supabase/supabase-js
```

Current version: `^2.95.3` (check `frontend/package.json`)

---

## Connection Modes

Supabase offers three ways to connect. Understanding when to use each is critical:

| Mode | Host | Port | Use Case | Limitations |
|------|------|------|----------|-------------|
| **Session Pooler** | `aws-1-us-east-1.pooler.supabase.com` | `5432` | Backend app, migrations | None — full PG feature support |
| **Transaction Pooler** | `aws-1-us-east-1.pooler.supabase.com` | `6543` | Serverless/short-lived connections | No prepared statements, no advisory locks |
| **Direct** | `db.uzhujvcmdgkpdpnxccdb.supabase.co` | `5432` | Not usable on this project | IPv6 only — fails on networks without IPv6 |

### Why Session Pooler (port 5432)?

- **Transaction Pooler (port 6543)** doesn't support prepared statements. asyncpg uses prepared statements by default, requiring `statement_cache_size=0` and introducing other restrictions.
- **Session Pooler (port 5432)** provides full PostgreSQL feature support including prepared statements, advisory locks, and LISTEN/NOTIFY.
- **Direct Connection** resolves to IPv6 only (`db.[ref].supabase.co`). Our development machine (Windows 10) doesn't have reliable IPv6 connectivity, so it fails with DNS resolution errors.

### How to Get Your Connection String

1. Go to **Supabase Dashboard** > **Settings** > **Database**
2. Under **Connection string**, select **URI** format
3. Copy the **Session Pooler** connection string (port 5432)

It looks like:
```
postgresql://postgres.[PROJECT-REF]:[YOUR-PASSWORD]@aws-[N]-[REGION].pooler.supabase.com:5432/postgres
```

**Important**: The `aws-N` prefix varies per project (e.g., `aws-0` vs `aws-1`). Always copy from dashboard.

---

## Backend: SQLAlchemy + asyncpg

### Backend Environment Setup

In `backend/.env`, set `DATABASE_URL` with the `+asyncpg` driver prefix:

```bash
# Database Configuration (Supabase)
DATABASE_URL=postgresql+asyncpg://postgres.uzhujvcmdgkpdpnxccdb:[PASSWORD]@aws-1-us-east-1.pooler.supabase.com:5432/postgres
```

Rules:
- Always use `postgresql+asyncpg://` as the scheme (not `postgresql://` or `postgres://`)
- The username **must** include the project ref after a dot: `postgres.[ref]`
- The password is your **database password** from Supabase Settings > Database
- The pooler hostname varies per project — **always copy from dashboard**

### Connection Architecture

**File:** `backend/app/core/database.py`

The engine factory detects Supabase URLs and applies special handling because **asyncpg can't parse dot-notation usernames** from URLs:

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

**Why explicit params?** asyncpg's URL parser sees `postgres.uzhujvcmdgkpdpnxccdb` and misinterprets the `.` in the username, causing "Tenant or user not found" errors. Passing `user`, `host`, `password` as separate `connect_args` bypasses this parser entirely.

### SSL Configuration

Supabase requires SSL for all connections. The pooler's SSL certificate can't be verified with asyncpg's default settings, so we create a custom SSL context:

```python
import ssl

def _make_ssl_context():
    ctx = ssl.create_default_context()
    ctx.check_hostname = False
    ctx.verify_mode = ssl.CERT_NONE
    return ctx
```

This is applied in both:
- `backend/app/core/database.py` — for the application engine
- `backend/alembic/env.py` — for migration connections

> `CERT_NONE` is acceptable here because Supabase's pooler is a known, trusted endpoint. The connection is still encrypted via TLS — we're just skipping certificate chain verification.

### Pool Settings

| Setting               | Value  | Reason                                                   |
| --------------------- | ------ | -------------------------------------------------------- |
| `pool_size`           | 5      | Supabase free tier limits concurrent connections         |
| `max_overflow`        | 10     | Allow brief bursts without exhausting pooler             |
| `pool_pre_ping`       | True   | Detect stale connections before use                      |
| `statement_cache_size`| 0      | Supabase pooler doesn't support prepared statement caching |

### Startup Health Check

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
- **Shutdown**: Disposes the engine and closes all connections

---

## Frontend: Supabase JS Client

The frontend connects directly to Supabase using the JavaScript client library. This is used for the **early access form** — public submissions that don't require authentication.

### Frontend Installation

```bash
cd frontend
npm install @supabase/supabase-js
```

### Frontend Environment Setup

Two environment variables are required in `frontend/.env.local`:

```bash
# Supabase (public/anon - safe for client-side)
NEXT_PUBLIC_SUPABASE_URL=https://uzhujvcmdgkpdpnxccdb.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6...
```

**Where to find these values:**
1. **Project URL**: Supabase Dashboard > Settings > General > Project URL
2. **Anon Key**: Supabase Dashboard > Settings > API > Project API keys > `anon` `public`

**Security notes:**
- The `NEXT_PUBLIC_` prefix makes these visible in the browser — this is by design
- The **anon key** is NOT a secret. It's designed for client-side use
- Security is enforced by **Row Level Security (RLS)** policies, not by hiding the key
- The anon key only grants permissions that your RLS policies explicitly allow
- Never use the `service_role` key in the frontend — that bypasses all RLS

### Client Initialization

**File:** `frontend/lib/supabase.ts`

```typescript
import { createClient } from "@supabase/supabase-js";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;

export const supabase = createClient(supabaseUrl, supabaseAnonKey);
```

Import and use anywhere in the frontend:
```typescript
import { supabase } from "@/lib/supabase";
```

### Direct Inserts

The early access form inserts directly into the `early_access` table:

```typescript
const now = new Date().toISOString();
const { error: dbError } = await supabase.from("early_access").insert({
  id: crypto.randomUUID(),    // Must be generated client-side
  name: data.name,
  email: data.email,
  country: data.country,
  // ... all other fields
  status: "PENDING",
  created_at: now,             // Must be supplied client-side
  updated_at: now,             // Must be supplied client-side
});
```

**Why `id`, `created_at`, `updated_at` must be supplied:**
The SQLAlchemy model defines these with Python-side defaults (`default=uuid.uuid4`, `default=func.now()`). These defaults only execute when inserting through SQLAlchemy — they don't exist as PostgreSQL-level `DEFAULT` constraints. When inserting directly via Supabase JS, you must supply these values yourself.

**Error handling:**
```typescript
if (dbError) {
  if (dbError.code === "23505") {
    // Unique constraint violation — duplicate email
    setError("Ya existe una solicitud con este correo.");
    return;
  }
  throw dbError;
}
```

### RPC Functions

The frontend calls a custom PostgreSQL function to check email uniqueness before form submission:

```typescript
const { data: exists, error: rpcError } = await supabase.rpc(
  "check_email_exists",
  { check_email: email }
);
```

See [check_email_exists RPC](#check_email_exists-rpc) for the function definition.

---

## Row Level Security (RLS)

### What Is RLS

Row Level Security is PostgreSQL's built-in authorization mechanism. When enabled on a table, **every query** must satisfy at least one policy to access rows. Without any policies, all access is denied.

Supabase uses RLS to control what the `anon` (public) and `authenticated` roles can do. The anon key maps to the `anon` role.

### Policies Used

The `early_access` table has the following RLS configuration:

| Policy Name | Operation | Role | Rule | Purpose |
|-------------|-----------|------|------|---------|
| `Allow anonymous inserts` | INSERT | `anon` | `WITH CHECK (true)` | Let anyone submit the form |
| *(no SELECT policy)* | — | — | — | Submissions can't be read back from client |
| *(no UPDATE policy)* | — | — | — | Submissions can't be modified from client |
| *(no DELETE policy)* | — | — | — | Submissions can't be deleted from client |

This means:
- Anyone can INSERT a new row (submit the form)
- Nobody can SELECT, UPDATE, or DELETE via the anon key
- Only the `service_role` or direct DB access can read/modify submissions

### Creating Policies

**Via Supabase Dashboard:**
1. Go to **Authentication** > **Policies**
2. Select the `early_access` table
3. Click **New Policy**
4. Set:
   - Name: `Allow anonymous inserts`
   - Operation: `INSERT`
   - Target Roles: `anon`
   - WITH CHECK expression: `true`
5. Save

**Via SQL Editor:**
```sql
-- Enable RLS on the table
ALTER TABLE early_access ENABLE ROW LEVEL SECURITY;

-- Allow anonymous inserts
CREATE POLICY "Allow anonymous inserts"
ON early_access
FOR INSERT
TO anon
WITH CHECK (true);
```

**Verify RLS is enabled:**
```sql
SELECT tablename, rowsecurity
FROM pg_tables
WHERE schemaname = 'public' AND tablename = 'early_access';
```

---

## Database Schema

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
| `early_access`       | Early access form submissions                  | Standalone (public)              |

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
| `earlyaccessstatus` | PENDING, CONTACTED, APPROVED, REJECTED                                        |

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

early_access (standalone, no FK relationships)
```

### Early Access Table

This table stores form submissions from the `/early-access` page. It's the only table accessed directly from the frontend via `@supabase/supabase-js`.

**Schema:**

| Column | Type | Nullable | Description |
|--------|------|----------|-------------|
| `id` | UUID | NOT NULL (PK) | Generated client-side via `crypto.randomUUID()` |
| `name` | VARCHAR | NOT NULL | Full name |
| `email` | VARCHAR | NOT NULL (UNIQUE) | Email address, unique constraint prevents duplicates |
| `country` | VARCHAR | NOT NULL | Country of residence |
| `age_range` | VARCHAR | NOT NULL | Age bracket |
| `professional_profiles` | JSON | NOT NULL | Array of selected profiles |
| `professional_profiles_other` | VARCHAR | NULL | Custom profile text |
| `current_situation` | VARCHAR | NOT NULL | Current professional situation |
| `current_situation_other` | VARCHAR | NULL | Custom situation text |
| `programming_experience` | VARCHAR | NOT NULL | Experience level |
| `platforms_used` | JSON | NOT NULL | Array of learning platforms |
| `platforms_used_other` | VARCHAR | NULL | Custom platforms text |
| `biggest_frustrations` | JSON | NOT NULL | Array of frustrations |
| `biggest_frustrations_other` | VARCHAR | NULL | Custom frustrations text |
| `abandoned_courses` | VARCHAR | NOT NULL | Whether they've abandoned courses |
| `project_types` | JSON | NOT NULL | Array of desired project types |
| `project_types_other` | VARCHAR | NULL | Custom project type text |
| `deployment_importance` | VARCHAR | NOT NULL | How important deployment is |
| `feature_ranking` | JSON | NOT NULL | Ordered array of features by importance |
| `weekly_time` | VARCHAR | NOT NULL | Weekly time commitment |
| `suggestions` | TEXT | NULL | Open text suggestions |
| `monthly_payment` | VARCHAR | NOT NULL | Willingness to pay |
| `confirmations` | JSON | NOT NULL | `{terms, privacy, beta, communications}` booleans |
| `status` | earlyaccessstatus | NOT NULL | Default: `PENDING` |
| `ip_address` | VARCHAR | NULL | Captured via DB trigger (if configured) |
| `user_agent` | VARCHAR | NULL | Captured via DB trigger (if configured) |
| `created_at` | TIMESTAMP WITH TZ | NOT NULL | Supplied client-side |
| `updated_at` | TIMESTAMP WITH TZ | NOT NULL | Supplied client-side |

**Indexes:**
- Primary key on `id`
- Unique index on `email` (enforces one submission per email)

---

## Migrations with Alembic

### Running Migrations

```bash
cd backend

# Apply all pending migrations
alembic upgrade head

# Check current migration status
alembic current

# View migration history
alembic history
```

### Creating New Migrations

```bash
# Auto-generate from model changes
alembic revision --autogenerate -m "description of changes"

# Create empty migration (manual SQL)
alembic revision -m "description"
```

### Rolling Back

```bash
# Rollback one step
alembic downgrade -1

# Rollback to specific revision
alembic downgrade 000_initial

# Rollback everything
alembic downgrade base
```

### How Alembic Connects to Supabase

The `alembic/env.py` file uses the same Supabase-aware connection logic as the app:

1. Reads `DATABASE_URL` from `backend/.env` via `app.core.config.settings`
2. Detects Supabase hostname and applies explicit `connect_args`
3. Uses `NullPool` (no connection pooling needed for one-off migrations)
4. Creates SSL context with `CERT_NONE` for Supabase compatibility

### Migration Files

| File                                           | Revision      | Description                |
| ---------------------------------------------- | ------------- | -------------------------- |
| `000_initial_schema.py`                        | `000_initial` | Creates all 11 tables + enums |
| `20260216_1450_6fee2c7e3774_add_early_access_table.py` | `6fee2c7e3774` | Creates `early_access` table |

---

## SQL Functions & Triggers

### check_email_exists RPC

A PostgreSQL function that checks if an email already exists in `early_access`. Used by the frontend to validate email uniqueness before allowing the user to proceed past step 1.

**Why an RPC instead of a SELECT?** The `anon` role has no SELECT policy on `early_access` (by design — we don't want to expose submission data). The function uses `SECURITY DEFINER` to run with the function owner's permissions, bypassing RLS.

**SQL to create:**
```sql
CREATE OR REPLACE FUNCTION check_email_exists(check_email TEXT)
RETURNS BOOLEAN
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  RETURN EXISTS (
    SELECT 1 FROM early_access WHERE email = check_email
  );
END;
$$;
```

**Frontend usage:**
```typescript
const { data: exists, error } = await supabase.rpc("check_email_exists", {
  check_email: email,
});
// exists === true  → email already submitted
// exists === false → email is new
```

**Run this SQL in:** Supabase Dashboard > SQL Editor

### set_request_meta Trigger

An optional PostgreSQL trigger that automatically captures the client's IP address and User-Agent header on every INSERT. PostgREST (Supabase's API layer) stores request headers in the `request.headers` configuration variable.

**SQL to create:**
```sql
CREATE OR REPLACE FUNCTION set_request_meta()
RETURNS TRIGGER
LANGUAGE plpgsql
AS $$
DECLARE
  headers json;
BEGIN
  BEGIN
    headers := current_setting('request.headers', true)::json;
  EXCEPTION WHEN OTHERS THEN
    headers := '{}'::json;
  END;

  NEW.ip_address := COALESCE(
    headers->>'x-forwarded-for',
    headers->>'x-real-ip',
    'unknown'
  );
  NEW.user_agent := COALESCE(
    headers->>'user-agent',
    'unknown'
  );

  RETURN NEW;
END;
$$;

CREATE TRIGGER trg_set_request_meta
  BEFORE INSERT ON early_access
  FOR EACH ROW
  EXECUTE FUNCTION set_request_meta();
```

**Run this SQL in:** Supabase Dashboard > SQL Editor

---

## Supabase Dashboard Reference

### Key Settings Locations

| What                    | Where in Dashboard                              |
| ----------------------- | ----------------------------------------------- |
| Connection strings      | Settings > Database > Connection string         |
| Database password       | Settings > Database > Database password         |
| Project reference ID    | Settings > General > Reference ID               |
| Project URL             | Settings > General > Project URL                |
| API keys (anon/service) | Settings > API > Project API keys               |
| Connection limits       | Settings > Database > Connection pooling        |
| Table editor            | Table Editor (left sidebar)                     |
| SQL editor              | SQL Editor (left sidebar)                       |
| RLS policies            | Authentication > Policies                       |
| Database logs           | Logs > Postgres                                 |
| Edge functions          | Edge Functions (left sidebar)                   |

### Useful SQL Queries

Run these in **Supabase Dashboard > SQL Editor**:

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

-- Check if RLS is enabled on a table
SELECT tablename, rowsecurity
FROM pg_tables
WHERE schemaname = 'public';

-- List RLS policies for a table
SELECT policyname, permissive, roles, cmd, qual, with_check
FROM pg_policies
WHERE tablename = 'early_access';

-- List enum types and values
SELECT t.typname, e.enumlabel
FROM pg_type t JOIN pg_enum e ON t.oid = e.enumtypid
ORDER BY t.typname, e.enumsortorder;

-- Check all RPC functions
SELECT routine_name, routine_type
FROM information_schema.routines
WHERE routine_schema = 'public';

-- View early access submissions
SELECT id, name, email, country, status, created_at
FROM early_access ORDER BY created_at DESC;

-- Check for duplicate emails
SELECT email, COUNT(*) FROM early_access
GROUP BY email HAVING COUNT(*) > 1;
```

---

## Errors & Fixes

### 1. "Tenant or user not found"

**When:** Connecting from the backend (asyncpg) to Supabase.

**Cause:** Wrong pooler hostname. The `aws-N` prefix varies per project. Using `aws-0-us-east-1.pooler.supabase.com` when the project is on `aws-1-us-east-1.pooler.supabase.com` causes this error.

**Fix:** Copy the exact connection string from **Supabase Dashboard > Settings > Database > Connection string**. For this project, the correct pooler host is `aws-1-us-east-1.pooler.supabase.com`.

---

### 2. "SSL: CERTIFICATE_VERIFY_FAILED"

**When:** asyncpg tries to connect to Supabase with default SSL settings.

**Cause:** asyncpg attempts to verify the pooler's SSL certificate against system CA certificates. The Supabase pooler's cert chain isn't recognized.

**Fix:** Create an SSL context with `verify_mode = ssl.CERT_NONE`:
```python
ctx = ssl.create_default_context()
ctx.check_hostname = False
ctx.verify_mode = ssl.CERT_NONE
```
This is already handled in `backend/app/core/database.py` and `backend/alembic/env.py`.

---

### 3. "getaddrinfo failed" (DNS resolution error)

**When:** Trying to connect via the direct connection hostname.

**Cause:** `db.uzhujvcmdgkpdpnxccdb.supabase.co` resolves to an IPv6 address only. The development machine (Windows 10) doesn't have IPv6 connectivity.

**Fix:** Use the **Session Pooler** connection (port 5432) instead of the direct connection. The pooler resolves to IPv4.

---

### 4. asyncpg URL parsing fails with dot-notation usernames

**When:** Passing the full connection URL to `create_async_engine()`.

**Cause:** asyncpg's internal URL parser can't handle the `.` in usernames like `postgres.uzhujvcmdgkpdpnxccdb`. It misinterprets the dot as a host/port separator.

**Fix:** Parse the URL manually with Python's `urlparse` and pass `user`, `host`, `password`, `database` as explicit `connect_args`. This is implemented in `database.py`'s `_build_engine()` function. See [Connection Architecture](#connection-architecture).

---

### 5. Supabase insert error: missing id, created_at, updated_at

**When:** Submitting the early access form from the frontend. The insert fails silently or throws an error because `id`, `created_at`, and `updated_at` are NULL.

**Cause:** The SQLAlchemy model defines these columns with Python-side defaults:
```python
id = Column(String, primary_key=True, default=lambda: str(uuid.uuid4()))
created_at = Column(DateTime(timezone=True), default=func.now())
updated_at = Column(DateTime(timezone=True), default=func.now(), onupdate=func.now())
```
These defaults **only execute when inserting through SQLAlchemy**. They don't create PostgreSQL-level `DEFAULT` constraints. When inserting via `@supabase/supabase-js`, the database sees NULL for these required columns and rejects the insert.

**Fix:** Supply these values explicitly in the frontend insert:
```typescript
const now = new Date().toISOString();
const { error } = await supabase.from("early_access").insert({
  id: crypto.randomUUID(),
  // ... other fields
  created_at: now,
  updated_at: now,
});
```

**Alternative fix** (for future tables): Define database-level defaults in the migration:
```sql
ALTER TABLE early_access
  ALTER COLUMN id SET DEFAULT gen_random_uuid(),
  ALTER COLUMN created_at SET DEFAULT now(),
  ALTER COLUMN updated_at SET DEFAULT now();
```

---

### 6. Email uniqueness check not working (RPC not created)

**When:** The form allowed a user to submit with an already-existing email, even though `checkEmailExists()` was called.

**Cause:** The `check_email_exists` PostgreSQL function hadn't been created in Supabase yet. The `supabase.rpc()` call returned an error, which the `catch` block silently swallowed (returning `false` = "email doesn't exist"), allowing the user to proceed.

**Fix:**
1. Run the SQL function creation in Supabase Dashboard > SQL Editor (see [check_email_exists RPC](#check_email_exists-rpc))
2. The function was already defined with `SECURITY DEFINER` so it can bypass RLS and check the `early_access` table

---

### 7. `console.error` causing ESLint build failures

**When:** Running `npm run build` after adding error logging.

**Cause:** The project's ESLint configuration has `no-console` rule enabled. Any `console.error()`, `console.log()`, etc. causes a build failure.

**Fix:** Removed all `console.error()` calls from `frontend/app/early-access/page.tsx`. Error state is communicated to users via the `setError()` React state instead. If you need logging in the future, either:
- Disable the rule for specific lines: `// eslint-disable-next-line no-console`
- Use a proper logging library
- Configure ESLint to allow `console.error` but not `console.log`

---

### 8. Country dropdown not registering selections

**When:** Clicking a country option in the dropdown — nothing happened, dropdown stayed open.

**Cause:** Two bugs compounding:

1. **Event propagation**: The dropdown's close-on-outside-click handler (`document.addEventListener("mousedown", ...)`) was firing before the option's `onClick` could execute, closing the dropdown and canceling the click.

2. **Double state update**: Both `onChange` and `onOtherChange` pointed to the same state key (`data.country`). When clicking an option:
   - `onChange(opt)` set `country = "Colombia"`
   - Then `onOtherChange?.("")` immediately set `country = ""` — overwriting the selection

**Fix:**
1. Added `onMouseDown={(e) => e.stopPropagation()}` on the dropdown panel to prevent the outside-click handler from firing
2. Removed `onOtherChange` from the country question's component usage — country only has `onChange`, no "other" field
3. Removed the `onOtherChange?.("")` call from the dropdown option click handler

---

### 9. Connection pool exhausted

**When:** Under load or after many requests.

**Cause:** Supabase free tier limits concurrent connections.

**Fix:** Pool is configured conservatively (`pool_size=5`, `max_overflow=10`). If still hitting limits:
- Check for connection leaks (sessions not being closed)
- Reduce `pool_size` further
- Upgrade Supabase plan for more connections

---

### 10. Alembic migration hangs or times out

**When:** Running `alembic upgrade head`.

**Cause:** Pooler or network issue, or a lock held by another process.

**Fix:**
1. Verify the connection works: `python -c "from app.core.database import check_db_connection; import asyncio; asyncio.run(check_db_connection())"`
2. Check that no other migration is holding a lock in Supabase
3. In Supabase Dashboard > Database > Roles, verify the `postgres` role has full permissions
