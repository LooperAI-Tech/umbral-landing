# Umbral - Errors & Fixes Log
Detailed documentation of bugs encountered during development, their root causes, and the fixes applied. Use this as a reference when debugging similar issues.

---

## Table of Contents
1. [Dashboard Not Showing Projects on Login](#1-dashboard-not-showing-projects-on-login)
2. [Milestone Detail Page Infinite Loading (Skeletons Forever)](#2-milestone-detail-page-infinite-loading-skeletons-forever)
3. [Milestone API Returning 405 Method Not Allowed](#3-milestone-api-returning-405-method-not-allowed)
4. [AI Assistant Stops Randomly Mid-Conversation](#4-ai-assistant-stops-randomly-mid-conversation)
5. [Supabase Connection Fails with asyncpg URL Parsing](#5-supabase-connection-fails-with-asyncpg-url-parsing)
6. [Clerk Auth Token Stale / 401 Race Condition](#6-clerk-auth-token-stale--401-race-condition)
7. [User Not Found in DB After Clerk Authentication](#7-user-not-found-in-db-after-clerk-authentication)
8. [Gemini API Calls Blocking FastAPI Event Loop](#8-gemini-api-calls-blocking-fastapi-event-loop)
9. [API Response Type Mismatches Across All Stores](#9-api-response-type-mismatches-across-all-stores)
10. [Project Deletion Permanently Removes Records (No Soft Delete)](#10-project-deletion-permanently-removes-records-no-soft-delete)
11. [Task Deletion Permanently Removes Records (No Soft Delete)](#11-task-deletion-permanently-removes-records-no-soft-delete)
12. [Deleted Projects Still Appearing in Lists](#12-deleted-projects-still-appearing-in-lists)
13. [Dashboard Showing All Projects Instead of Active Only](#13-dashboard-showing-all-projects-instead-of-active-only)
14. [AI Selection Buttons Not Rendering in Chat](#14-ai-selection-buttons-not-rendering-in-chat)
15. [Project Summary Card Not Displaying After AI Generation](#15-project-summary-card-not-displaying-after-ai-generation)
16. [Markdown Tables Not Styled in Chat Messages](#16-markdown-tables-not-styled-in-chat-messages)
17. [Lambda Function Out of Memory in Dev Environment](#17-lambda-function-out-of-memory-in-dev-environment)
18. [Chat Input Not Restored After Send Failure](#18-chat-input-not-restored-after-send-failure)
19. [Empty Gemini Response With No Fallback](#19-empty-gemini-response-with-no-fallback)
20. [Delete Button With No Confirmation Dialog](#20-delete-button-with-no-confirmation-dialog)
21. [Chat Sessions Not Linked to Tasks](#21-chat-sessions-not-linked-to-tasks)
22. [Task Board Not Reflecting Status Changes Immediately](#22-task-board-not-reflecting-status-changes-immediately)
23. [Company Name Inconsistency in AI Prompts](#23-company-name-inconsistency-in-ai-prompts)

---

## 1. Dashboard Not Showing Projects on Login

**Date:** 2026-02-14
**Severity:** High
**Affected Area:** Frontend Dashboard (`/dashboard`)
**Commit:** `2a38fb0`

### Symptom

After logging in, the dashboard page showed "Aun no hay proyectos!" even though the user had created projects. Stats (deployments, learnings, streak) appeared to load correctly, but the projects section was always empty.

### Root Cause

**Backend/Frontend API contract mismatch.**

The backend endpoint `GET /api/projects` returns a **wrapped response** using the `ProjectListResponse` schema:

```python
# backend/app/schemas/project.py
class ProjectListResponse(BaseModel):
    projects: List[ProjectResponse]
    total: int
```

So the actual HTTP response body looks like:
```json
{
  "projects": [{ "id": "...", "name": "..." }, ...],
  "total": 5
}
```

But the frontend API client was returning `response.data` directly, which is the **full wrapper object** (not the array):

```typescript
// frontend/lib/api/projects.ts (BEFORE fix)
async list(): Promise<Project[]> {
    const response = await apiClient.get("/api/projects");
    return response.data;  // Returns { projects: [...], total: N } — NOT an array!
}
```

In the Zustand store (`projectStore.ts`), the code does:
```typescript
const projects = await projectsApi.list();
set({ projects: Array.isArray(projects) ? projects : [] });
```

Since `projects` was an object `{ projects: [...], total: N }`, `Array.isArray()` returned `false`, and the store set projects to `[]`.

### Fix

**File:** `frontend/lib/api/projects.ts`

```typescript
async list(): Promise<Project[]> {
    const response = await apiClient.get("/api/projects");
    const data = response.data;
    // Backend returns { projects: [...], total: N }
    return Array.isArray(data) ? data : (data?.projects ?? []);
}
```

The fix extracts `.projects` from the wrapped response. The `Array.isArray(data)` check provides backward compatibility in case the API format ever changes.

### Lesson Learned

Always verify what the backend actually returns vs. what the frontend expects. When a backend endpoint uses a paginated/wrapped response model like `{ items: [...], total: N }`, the frontend API client must unwrap it before passing to the store. A good practice is to log `response.data` during development to catch these mismatches early.

---

## 2. Milestone Detail Page Infinite Loading (Skeletons Forever)

**Date:** 2026-02-14
**Severity:** High
**Affected Area:** Frontend Milestone Detail Page (`/dashboard/projects/[id]/milestones/[milestoneId]`)
**Commit:** `0eb7e4c`

### Symptom

When clicking on a milestone from the project detail page, the milestone detail page loaded (Next.js returned 200), but the content area showed skeleton loading placeholders forever. The page never rendered actual milestone data.

### Root Cause

**Two compounding issues:**

#### Issue A: Silent error swallowing with inadequate guard condition

The page had a single combined loading/error guard:

```tsx
// BEFORE fix
if (isLoading || !milestone || !project) {
    return (
        <div className="space-y-6">
            <Skeleton className="h-8 w-64" />
            <Skeleton className="h-4 w-96" />
            <Skeleton className="h-48 rounded-lg" />
        </div>
    );
}
```

The `loadData` function caught errors silently:

```tsx
const loadData = async () => {
    setIsLoading(true);
    try {
        const [milestoneData, projectData] = await Promise.all([
            milestonesApi.get(milestoneId),
            projectsApi.get(projectId),
        ]);
        setMilestone(milestoneData);
        setProject(projectData);
    } catch {
        /* handled — but NOT actually handled */
    }
    setIsLoading(false);
};
```

**What happened step by step:**
1. Page mounts, `isLoading = true` → skeletons shown
2. `loadData()` fires, API calls fail (see Issue B below)
3. `catch {}` swallows the error, `milestone` stays `null`, `project` stays `null`
4. `isLoading` set to `false`
5. Guard `if (isLoading || !milestone || !project)` — `isLoading` is false but `!milestone` is still `true`
6. Skeletons shown forever with no indication of error

#### Issue B: Backend not restarted (see Error #3 below)

The `GET /api/milestones/{milestone_id}` endpoint was newly added but the backend was running without `--reload`, so the endpoint returned `405 Method Not Allowed`.

### Fix

**File:** `frontend/app/dashboard/projects/[id]/milestones/[milestoneId]/page.tsx`

Separated the guard into three distinct states:

```tsx
const [error, setError] = useState<string | null>(null);

const loadData = async () => {
    setIsLoading(true);
    setError(null);
    try {
        const [milestoneData, projectData] = await Promise.all([
            milestonesApi.get(milestoneId),
            projectsApi.get(projectId),
        ]);
        setMilestone(milestoneData);
        setProject(projectData);
    } catch (err) {
        console.error("Error loading milestone:", err);
        setError("No se pudo cargar el hito. Verifica que el backend esté corriendo.");
    }
    setIsLoading(false);
};

// Three distinct states:
// 1. Loading
if (isLoading) {
    return <Skeletons />;
}

// 2. Error or missing data
if (error || !milestone || !project) {
    return (
        <ErrorView
            error={error}
            onRetry={loadData}
            backLink={`/dashboard/projects/${projectId}`}
        />
    );
}

// 3. Success — render milestone
return <MilestoneDetail />;
```

### Lesson Learned

Never combine loading and error states in a single guard. When an async operation can fail, always track the error state separately and show a meaningful message to the user. Silent `catch {}` blocks are dangerous — at minimum, log the error to the console. Additionally, always provide a "Retry" button when showing error states.

**Pattern to follow across all pages:**
```tsx
if (isLoading) return <Loading />;
if (error || !data) return <Error onRetry={reload} />;
return <Content data={data} />;
```

---

## 3. Milestone API Returning 405 Method Not Allowed

**Date:** 2026-02-14
**Severity:** Critical
**Affected Area:** Backend API (`GET /api/milestones/{milestone_id}`)
**Commit:** `0eb7e4c`

### Symptom

The frontend milestone detail page made a request to `GET /api/milestones/{milestone_id}` and received a `405 Method Not Allowed` response. This caused the milestone page to fail loading (see Error #2).

### Root Cause

**The backend uvicorn server was running without `--reload` flag, so code changes were not picked up.**

We added a new `GET` endpoint to the milestones router:

```python
# backend/app/api/routes/milestones.py
@router.get("/milestones/{milestone_id}", response_model=MilestoneResponse)
async def get_milestone(
    milestone_id: str,
    user_id: str = Depends(get_current_user_id),
    db: AsyncSession = Depends(get_db),
):
    milestone = await MilestoneService.get(db, milestone_id, user_id)
    if not milestone:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Milestone not found")
    return milestone
```

However, the backend was started with:
```bash
python -m uvicorn main:app --host 0.0.0.0 --port 8000
```

**Without `--reload`**, uvicorn loads the application once at startup and never re-reads the source files. So even though the code on disk had the new GET endpoint, the running server only knew about the old `PATCH` and `DELETE` methods.

### How We Diagnosed It

1. **Checked the OpenAPI spec** of the running server:
   ```bash
   curl -s "http://localhost:8000/openapi.json" | python -c "
       import sys,json
       data = json.load(sys.stdin)
       print(list(data['paths']['/api/milestones/{milestone_id}'].keys()))
   "
   # Output: ['patch', 'delete']  ← No 'get'!
   ```

2. **Direct curl test** confirmed the 405:
   ```bash
   curl -s -o /dev/null -w "%{http_code}" "http://localhost:8000/api/milestones/some-id"
   # Output: 405
   ```

3. **Verified the code was correct** by importing the router in Python:
   ```bash
   python -c "
       from app.api.routes.milestones import router
       [print(r.methods, r.path) for r in router.routes]
   "
   # Output included: {'GET'} /milestones/{milestone_id}
   ```
   This proved the code was correct but the running server hadn't loaded it.

### Fix

Killed the old uvicorn process and restarted it:

```bash
# Find the process
WMIC PROCESS WHERE "CommandLine LIKE '%uvicorn%'" GET ProcessId,CommandLine

# Kill it
taskkill /PID <pid> /F

# Restart
cd backend
.venv/Scripts/python.exe -m uvicorn main:app --host 0.0.0.0 --port 8000
```

After restart, the endpoint returned `401 Unauthorized` (expected without auth token) instead of `405`, confirming the GET route was now registered.

### Lesson Learned

**Always run the backend with `--reload` during development:**

```bash
python -m uvicorn main:app --host 0.0.0.0 --port 8000 --reload
```

The `--reload` flag watches for file changes and automatically restarts the server. Without it, any code change (new endpoints, bug fixes, model changes) requires a manual server restart.

**Debugging tip:** When an endpoint returns `405 Method Not Allowed`, it means the URL path exists but the HTTP method (GET, POST, etc.) is not registered for that path. Check:
1. Is the route defined in the router file? (`@router.get(...)`)
2. Is the router included in the main app? (`app.include_router(...)`)
3. Has the server been restarted since the change? (Check OpenAPI: `curl localhost:8000/openapi.json`)

**Quick diagnostic command for checking registered routes:**
```bash
curl -s "http://localhost:8000/openapi.json" | python -c "
    import sys, json
    paths = json.load(sys.stdin)['paths']
    for path, methods in sorted(paths.items()):
        print(f'{path}: {list(methods.keys())}')
"
```

---

## 4. AI Assistant Stops Randomly Mid-Conversation

**Date:** 2026-02-17
**Severity:** High
**Affected Area:** AI Assistant (`/dashboard/assistant`), all chat types (general, project creation, milestone generation, task generation)
**Commit:** `05fc243`

### Symptom

After a few messages in the AI assistant, the model appears to "stop" randomly. The chat freezes: the typing indicator stays visible, the Send button stays disabled, and the user has to send several messages or refresh the page to restart the conversation. Sometimes the user's message disappears entirely after appearing briefly.

### Root Cause

**Three compounding issues:**

#### Issue A: No HTTP timeout on the Axios client

**File:** `frontend/lib/api.ts`

The `apiClient` was created without a `timeout` value:

```typescript
// BEFORE fix
export const apiClient = axios.create({
  baseURL: API_BASE_URL,
  headers: { "Content-Type": "application/json" },
});
```

The chat message flow is: **Frontend → Backend → Gemini API → Backend → Frontend**. Gemini (`gemini-2.5-flash`) can take 10-30+ seconds to respond, especially with long conversation history (the backend sends up to 50 messages as context). If Gemini is slow, overloaded, or the connection drops mid-request:

1. The HTTP request **hangs indefinitely** (no timeout = infinite wait)
2. `isSending` stays `true` permanently in the Zustand store
3. The Send button stays disabled, the `<TypingIndicator>` stays visible
4. The chat appears "frozen" — the only way out is refreshing the page

**Why Gemini can be slow:**
- `gemini-2.5-flash` processes up to 50 messages of context (from `ChatService.get_session_messages(db, session_id, limit=50)` in `chat_service.py:427`)
- Each message includes the full system prompt with user context (projects, milestones, learnings)
- Long conversations accumulate tokens, increasing response time
- Google's API can have latency spikes during high-traffic periods

#### Issue B: Failed messages disappear silently from the UI

**File:** `frontend/stores/chatStore.ts`

When `sendMessage` failed (timeout, network error, 503 from Gemini), the catch block **removed the user's message** from the UI:

```typescript
// BEFORE fix
catch (error: unknown) {
  set((state) => ({
    messages: state.messages.filter((msg) => msg.id !== userMessage.id),  // ← message vanishes!
    error: error instanceof Error ? error.message : "No se pudo enviar el mensaje",
    isSending: false,
  }));
}
```

**What happened step by step:**
1. User types a message → it appears in the chat immediately (optimistic update)
2. The API call to Gemini fails (timeout, network error, safety filter)
3. The catch block runs: the user's message is **filtered out** of the messages array
4. The error banner appears at the top, but it's easy to miss
5. The user sees their message disappear and thinks the chat is "broken"
6. They type the same message again, sometimes repeatedly

#### Issue C: Gemini safety filters silently block responses

**File:** `backend/app/services/ai_service.py`

Gemini has built-in safety filters that can block responses when content triggers a safety threshold. The default threshold (`BLOCK_MEDIUM_AND_ABOVE`) is quite aggressive and can be triggered by legitimate technical conversations (e.g., discussing security vulnerabilities, error messages, or deployment failures).

When a response is blocked:
1. `response.text` returns `None` or empty string
2. The backend returns a generic fallback: `"Lo siento, no pude generar una respuesta..."`
3. No details about **why** the response was blocked are logged
4. The user doesn't know what happened — the model appears to "stop thinking"

The original code had no safety settings configured (using Gemini defaults) and no logging of the block reason:

```python
# BEFORE fix
config=types.GenerateContentConfig(
    system_instruction=system_prompt,
    max_output_tokens=max_tokens,
    temperature=temperature,
    # No safety_settings → uses default BLOCK_MEDIUM_AND_ABOVE
),
```

### Fix

**Three changes applied:**

#### Fix A: Add 60-second timeout to Axios client

**File:** `frontend/lib/api.ts`

```typescript
// AFTER fix
export const apiClient = axios.create({
  baseURL: API_BASE_URL,
  timeout: 60_000,  // 60 seconds — enough for Gemini but prevents infinite hang
  headers: { "Content-Type": "application/json" },
});
```

Why 60 seconds: Gemini typically responds in 5-20 seconds. 60 seconds gives enough headroom for slow responses while preventing the infinite-hang scenario. If the request takes longer than 60s, Axios throws a timeout error that the frontend can handle gracefully.

#### Fix B: Keep user messages on failure, mark them as failed

**File:** `frontend/stores/chatStore.ts`

```typescript
// AFTER fix
catch (error: unknown) {
  const isTimeout = error instanceof Error && error.message.includes("timeout");
  set((state) => ({
    messages: state.messages.map((msg) =>
      msg.id === userMessage.id
        ? { ...msg, id: `failed-${Date.now()}`, model_used: "failed" }
        : msg
    ),
    error: isTimeout
      ? "La respuesta tardó demasiado. Intenta enviar el mensaje de nuevo."
      : error instanceof Error ? error.message : "No se pudo enviar el mensaje",
    isSending: false,
  }));
}
```

Changes:
- Instead of `filter()` (removing the message), uses `map()` to **keep the message** but mark it with `model_used: "failed"` so the UI can style it differently
- Detects timeout errors specifically and shows a more helpful message: "La respuesta tardó demasiado..."
- The user can see their message is still there and try sending again

#### Fix C: Relax Gemini safety filters and log block reasons

**File:** `backend/app/services/ai_service.py`

```python
# AFTER fix
safety_settings = [
    types.SafetySetting(
        category="HARM_CATEGORY_HARASSMENT",
        threshold="BLOCK_ONLY_HIGH",
    ),
    types.SafetySetting(
        category="HARM_CATEGORY_HATE_SPEECH",
        threshold="BLOCK_ONLY_HIGH",
    ),
    types.SafetySetting(
        category="HARM_CATEGORY_SEXUALLY_EXPLICIT",
        threshold="BLOCK_ONLY_HIGH",
    ),
    types.SafetySetting(
        category="HARM_CATEGORY_DANGEROUS_CONTENT",
        threshold="BLOCK_ONLY_HIGH",
    ),
]

response = await client.aio.models.generate_content(
    model=settings.GEMINI_MODEL,
    contents=contents,
    config=types.GenerateContentConfig(
        system_instruction=system_prompt,
        max_output_tokens=max_tokens,
        temperature=temperature,
        safety_settings=safety_settings,
    ),
)
```

Changes:
- Changed threshold from default `BLOCK_MEDIUM_AND_ABOVE` to `BLOCK_ONLY_HIGH` — only blocks genuinely harmful content, not false positives from technical discussions
- Added logging of the `finish_reason` when a response is empty, so we can see **why** Gemini blocked it (e.g., `SAFETY`, `RECITATION`, `MAX_TOKENS`)
- This is safe because Umbral is an educational platform — conversations are about AI/ML concepts, project planning, and code, not about harmful topics

### Lesson Learned

**Timeout is mandatory for any API call that depends on a third-party service.** When your backend calls an external API (Gemini, OpenAI, etc.), the total round-trip time is unpredictable. Without a timeout, a single slow response can make your entire frontend appear broken.

**Never silently remove UI elements on error.** When an optimistic update fails, keep the element visible and mark it as failed. Removing it confuses the user — they don't know if their action was processed or not.

**Configure safety filters explicitly for your use case.** Default safety filters are designed for general consumer use. Educational platforms, coding assistants, and developer tools often trigger false positives because they discuss technical topics (errors, vulnerabilities, failures) that the default filters flag as potentially harmful.

**Pattern to follow for all AI-backed API calls:**
```typescript
// Frontend: always set a timeout
const response = await apiClient.post("/api/chat/...", data);
// If this hangs, the 60s timeout will trigger a clean error

// Backend: always configure safety and log block reasons
config=types.GenerateContentConfig(
    safety_settings=[...],  // Explicit, not default
)
if not response.text:
    logger.warning("Blocked: %s", candidate.finish_reason)  // Log WHY
```

---

## 5. Supabase Connection Fails with asyncpg URL Parsing

**Date:** 2026-02-15
**Severity:** Critical
**Affected Area:** Backend database connection (`backend/app/core/database.py`)
**Commit:** `be00b2e`

### Symptom

Backend fails to start with connection errors when using Supabase PostgreSQL. The `DATABASE_URL` in the format `postgresql+asyncpg://postgres.[project-ref]:password@aws-0-us-east-1.pooler.supabase.com:5432/postgres` causes `asyncpg` to crash during URL parsing.

### Root Cause

**Three compounding issues with Supabase + asyncpg:**

1. **Dot-notation usernames break asyncpg URL parsing.** Supabase uses usernames like `postgres.uzhujvcmdgkpdpnxccdb` (with a dot). asyncpg's internal URL parser chokes on the dot, interpreting it as a hostname separator.

2. **Direct connection resolves to IPv6 only.** The direct host `db.uzhujvcmdgkpdpnxccdb.supabase.co` only resolves to an IPv6 address. This Windows 10 machine doesn't support IPv6 routing, so direct connections always fail with `OSError: [Errno 101] Network is unreachable`.

3. **Pooler host was wrong.** Initial config used `aws-0-us-east-1.pooler.supabase.com` but the correct pooler for this project is `aws-1-us-east-1.pooler.supabase.com` (note: `aws-1`, not `aws-0`).

### Fix

**File:** `backend/app/core/database.py`

Instead of passing the URL directly to SQLAlchemy, manually parse it and pass connection parameters explicitly when "supabase" is in the hostname:

```python
from urllib.parse import urlparse, unquote
import ssl

def _get_engine():
    url = settings.DATABASE_URL
    parsed = urlparse(url)

    if "supabase" in (parsed.hostname or ""):
        # Manual parsing to avoid asyncpg URL issues
        ssl_ctx = ssl.create_default_context()
        ssl_ctx.check_hostname = False
        ssl_ctx.verify_mode = ssl.CERT_NONE

        connect_args = {
            "host": parsed.hostname,
            "port": parsed.port or 5432,
            "user": unquote(parsed.username or ""),
            "password": unquote(parsed.password or ""),
            "database": parsed.path.lstrip("/"),
            "ssl": ssl_ctx,
            "statement_cache_size": 0,  # Required for Supabase pooler
        }

        return create_async_engine(
            "postgresql+asyncpg://",  # Dummy URL — actual params in connect_args
            connect_args=connect_args,
            pool_size=5,
            max_overflow=10,
        )
    else:
        return create_async_engine(url, pool_size=5, max_overflow=10)
```

Key details:
- `statement_cache_size=0` is required because Supabase's connection pooler (PgBouncer in transaction mode) doesn't support prepared statements
- SSL context with `CERT_NONE` is needed because the pooler uses a wildcard certificate
- The dummy URL `postgresql+asyncpg://` tells SQLAlchemy to use asyncpg without actually parsing connection params from it

### Lesson Learned

**Supabase + asyncpg requires special handling.** The standard `DATABASE_URL` format doesn't work directly. Always:
1. Use the **pooler** host (`aws-X-us-east-1.pooler.supabase.com`), not the direct host
2. Parse the URL manually if using asyncpg (the dot in usernames breaks it)
3. Set `statement_cache_size=0` for pooled connections
4. Verify the correct pooler host in Supabase dashboard (aws-0 vs aws-1 matters)

---

## 6. Clerk Auth Token Stale / 401 Race Condition

**Date:** 2026-02-15
**Severity:** High
**Affected Area:** Frontend auth provider, all API calls
**Commit:** `be00b2e`, `c4f1550`

### Symptom

Intermittent `401 Unauthorized` errors on API calls. The user is logged in (Clerk shows them authenticated), but some API requests randomly fail. Happens most often after the page has been open for a while or after switching tabs.

### Root Cause

**Periodic token sync creates race conditions.**

The original auth provider used `setInterval` to periodically sync the Clerk token:

```typescript
// BEFORE fix — auth-provider.tsx
useEffect(() => {
  const syncToken = async () => {
    const token = await getToken();
    if (token) {
      apiClient.defaults.headers.common["Authorization"] = `Bearer ${token}`;
    }
  };

  syncToken();
  const interval = setInterval(syncToken, 30000); // Sync every 30 seconds
  return () => clearInterval(interval);
}, [getToken]);
```

**Problems:**
1. If the token expires between sync intervals (e.g., at second 29), API calls during that window get `401`
2. Multiple rapid API calls could hit a stale token before the next sync
3. The `setInterval` approach doesn't account for token refresh timing — Clerk's tokens have a 60-second lifespan by default

### Fix

**File:** `frontend/components/providers/auth-provider.tsx`

Changed from periodic sync to a **token getter pattern** using Axios request interceptors:

```typescript
// AFTER fix
useEffect(() => {
  const interceptor = apiClient.interceptors.request.use(async (config) => {
    const token = await getToken();
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  });

  return () => {
    apiClient.interceptors.request.eject(interceptor);
  };
}, [getToken]);
```

**Why this works:**
- `getToken()` is called fresh **on every request**, not on a timer
- Clerk's `getToken()` internally handles caching — if the token is still valid, it returns instantly; if expired, it refreshes first
- No race condition possible: the request always gets a valid token before it's sent
- Eliminates the 30-second window where a stale token could be used

### Lesson Learned

**Never cache auth tokens on a timer.** Use a per-request token getter pattern instead. Auth SDKs like Clerk, Auth0, and Firebase all provide `getToken()` methods that handle caching and refresh internally. Let them do their job — wrapping them in `setInterval` creates exactly the problems they're designed to prevent.

---

## 7. User Not Found in DB After Clerk Authentication

**Date:** 2026-02-16
**Severity:** High
**Affected Area:** Backend API, all authenticated endpoints
**Commit:** `c4f1550`

### Symptom

User authenticates successfully with Clerk, but the first API call fails with `404 User not found` or an internal error. This happens on fresh databases or when the Clerk webhook hasn't fired yet.

### Root Cause

**Clerk webhook delay or missing webhook configuration.**

The original `get_current_user_id` dependency expected the user to already exist in the local database:

```python
# BEFORE fix
async def get_current_user_id(token: str = Depends(oauth2_scheme), db: AsyncSession = Depends(get_db)):
    payload = verify_clerk_token(token)
    clerk_id = payload["sub"]

    user = await db.execute(select(User).where(User.clerk_id == clerk_id))
    user = user.scalar_one_or_none()

    if not user:
        raise HTTPException(status_code=404, detail="User not found")

    return str(user.id)
```

The user record was supposed to be created by a Clerk webhook (`user.created` event), but:
1. Webhooks can be delayed by seconds or even minutes
2. On fresh databases, no webhook history exists
3. If the webhook endpoint is misconfigured, user records never get created

### Fix

**File:** `backend/app/api/dependencies.py`

Added **auto-sync** that creates the user record on first API call if it doesn't exist:

```python
# AFTER fix
async def get_current_user_id(token: str = Depends(oauth2_scheme), db: AsyncSession = Depends(get_db)):
    payload = verify_clerk_token(token)
    clerk_id = payload["sub"]

    user = await db.execute(select(User).where(User.clerk_id == clerk_id))
    user = user.scalar_one_or_none()

    if not user:
        # Auto-create user from Clerk token claims
        logger.info(f"Auto-creating user for clerk_id: {clerk_id}")
        user = User(
            clerk_id=clerk_id,
            email=payload.get("email", f"{clerk_id}@unknown.com"),
            name=payload.get("name", "Usuario"),
        )
        db.add(user)
        await db.commit()
        await db.refresh(user)

    return str(user.id)
```

**Why this works:**
- The JWT token from Clerk contains `sub` (clerk_id), `email`, and `name` claims
- On first request, if the user doesn't exist, we create them from the token claims
- Subsequent requests find the existing record (no overhead)
- This eliminates dependency on webhook timing entirely

### Lesson Learned

**Don't depend solely on webhooks for critical user creation.** Webhooks are unreliable (delays, retries, configuration errors). Use a **just-in-time (JIT) provisioning** pattern: check if the user exists on every authenticated request, and create them if not. The auth token already contains the necessary claims (email, name, ID) to create a basic user record.

---

## 8. Gemini API Calls Blocking FastAPI Event Loop

**Date:** 2026-02-16
**Severity:** High
**Affected Area:** Backend AI service, all chat endpoints
**Commit:** `c4f1550`

### Symptom

The entire backend becomes unresponsive while processing an AI chat request. Other API calls (dashboard stats, project listing) hang until the AI response completes. Affects all users, not just the one chatting.

### Root Cause

**Synchronous Gemini API call in an async FastAPI context.**

```python
# BEFORE fix — ai_service.py
response = client.models.generate_content(  # ← BLOCKING call!
    model=settings.GEMINI_MODEL,
    contents=contents,
    config=config,
)
```

`client.models.generate_content()` is a **synchronous** method. When called inside an `async def` endpoint in FastAPI, it blocks the entire event loop. Since FastAPI uses a single event loop for all async endpoints, one slow AI call (10-30 seconds) blocks **every other request** in the application.

### Fix

**File:** `backend/app/services/ai_service.py`

Changed to the async version of the Gemini client:

```python
# AFTER fix
response = await client.aio.models.generate_content(  # ← NON-BLOCKING
    model=settings.GEMINI_MODEL,
    contents=contents,
    config=config,
)
```

The `client.aio` namespace provides async versions of all Gemini methods. Using `await` properly yields control back to the event loop while waiting for Gemini's response, allowing other requests to be processed concurrently.

Also added proper error handling:

```python
try:
    response = await client.aio.models.generate_content(...)
except Exception as e:
    logger.error(f"Gemini API error: {e}")
    raise RuntimeError("AI service unavailable") from e
```

The `RuntimeError` is caught by the chat endpoint and returned as `503 SERVICE_UNAVAILABLE`.

### Lesson Learned

**Never use synchronous I/O in async FastAPI endpoints.** If a library only offers sync methods, either:
1. Use the async version if available (`client.aio.*` for Gemini, `AsyncOpenAI` for OpenAI)
2. Wrap the sync call in `asyncio.to_thread()` or `run_in_executor()` to prevent blocking
3. Use `def` (not `async def`) for the endpoint — FastAPI runs sync endpoints in a thread pool automatically

**Quick check:** If you see `client.something()` without `await` inside an `async def`, it's probably blocking the event loop.

---

## 9. API Response Type Mismatches Across All Stores

**Date:** 2026-02-16
**Severity:** Medium
**Affected Area:** All Zustand stores (projects, learnings, milestones, tasks, deployments, chat)
**Commit:** `c4f1550`, `be00b2e`

### Symptom

Various frontend features fail silently: lists show as empty, counts show as 0, "no data" messages appear despite data existing in the database. No JavaScript errors in the console — the data just doesn't render.

### Root Cause

**Inconsistent API response handling across stores.**

The backend returns different shapes for different endpoints:
- `GET /api/projects` → `{ projects: [...], total: N }`
- `GET /api/learnings` → `{ learnings: [...], total: N }`
- `GET /api/milestones?project_id=X` → `[...]` (direct array)
- `GET /api/tasks?milestone_id=X` → `[...]` (direct array)
- `GET /api/chat/sessions` → `{ sessions: [...] }` or `[...]` depending on version

Stores were written assuming a consistent format, so some worked and others didn't:

```typescript
// Some stores expected arrays:
const data = response.data; // Could be { items: [...] } or [...]
set({ items: data }); // If data is an object, the list breaks
```

### Fix

**Applied across all API client methods and stores:**

```typescript
// Defensive pattern applied everywhere
async list(): Promise<Learning[]> {
    const response = await apiClient.get("/api/learnings");
    const data = response.data;
    return Array.isArray(data) ? data : (Array.isArray(data?.learnings) ? data.learnings : []);
}

async listByProject(projectId: string): Promise<Milestone[]> {
    const response = await apiClient.get(`/api/milestones?project_id=${projectId}`);
    const data = response.data;
    return Array.isArray(data) ? data : (Array.isArray(data?.milestones) ? data.milestones : []);
}
```

**Files changed:**
- `frontend/lib/api/projects.ts`
- `frontend/lib/api/learnings.ts`
- `frontend/lib/api/milestones.ts`
- `frontend/lib/api/tasks.ts`
- `frontend/lib/api/deployments.ts`
- `frontend/stores/chatStore.ts`

### Lesson Learned

**Always validate the shape of API responses before using them.** Don't assume the response is an array — check with `Array.isArray()` and unwrap wrapped responses. This is especially important when:
- The backend uses paginated/wrapped response models
- Multiple developers work on frontend and backend independently
- The API format might change between versions

**Standard defensive pattern:**
```typescript
const data = response.data;
return Array.isArray(data) ? data : (data?.items ?? []);
```

---

## 10. Project Deletion Permanently Removes Records (No Soft Delete)

**Date:** 2026-02-18
**Severity:** High
**Affected Area:** Backend project service, frontend project store
**Commit:** `8c4ca0e`

### Symptom

When a user deletes a project, all associated data (milestones, tasks, deployments, learnings) is permanently removed from the database via CASCADE. There is no way to recover deleted projects. Users who accidentally click delete lose all their work.

### Root Cause

**Hard delete implementation with CASCADE foreign keys.**

```python
# BEFORE fix — project_service.py
@staticmethod
async def delete(db: AsyncSession, project_id: str, user_id: str):
    project = await ProjectService.get(db, project_id, user_id)
    if project:
        await db.delete(project)  # ← CASCADE deletes everything
        await db.commit()
```

The `Project` model had `CASCADE` on all relationships:
```python
milestones = relationship("Milestone", cascade="all, delete-orphan")
deployments = relationship("Deployment", cascade="all, delete-orphan")
learnings = relationship("Learning", cascade="all, delete-orphan")
```

### Fix

**Two changes:**

1. **Added `DELETED` status to `ProjectStatus` enum:**

```python
# backend/app/models/project.py
class ProjectStatus(str, enum.Enum):
    PLANNED = "PLANNED"
    IN_PROGRESS = "IN_PROGRESS"
    ON_HOLD = "ON_HOLD"
    COMPLETED = "COMPLETED"
    ARCHIVED = "ARCHIVED"
    DELETED = "DELETED"  # ← NEW
```

**Migration:** `20260218_0138_cc50bca6d646_add_deleted_status_to_project.py`

2. **Changed delete to soft delete:**

```python
# AFTER fix — project_service.py
@staticmethod
async def delete(db: AsyncSession, project_id: str, user_id: str):
    project = await ProjectService.get(db, project_id, user_id)
    if project:
        project.status = ProjectStatus.DELETED  # ← Soft delete
        await db.commit()
```

The frontend was updated to show a dropdown with status options including "Eliminar" (delete), and a confirmation dialog.

### Lesson Learned

**Always implement soft deletes for user-created content.** Use a status field (`DELETED`, `ARCHIVED`) instead of `DELETE FROM`. This allows:
- Recovery of accidentally deleted data
- Audit trails
- Grace periods before permanent deletion
- No CASCADE data loss

---

## 11. Task Deletion Permanently Removes Records (No Soft Delete)

**Date:** 2026-02-19
**Severity:** Medium
**Affected Area:** Backend task service, task API
**Commit:** `8571bca`

### Symptom

Same as Error #10, but for tasks. Deleting a task permanently removes it, losing any notes, time tracking, and history.

### Root Cause

**Hard delete implementation for tasks:**

```python
# BEFORE fix
@staticmethod
async def delete(db: AsyncSession, task_id: str, user_id: str):
    task = await TaskService.get(db, task_id, user_id)
    if task:
        await db.delete(task)
        await db.commit()
```

### Fix

1. **Added `DELETED` status to `TaskStatus` enum:**

```python
class TaskStatus(str, enum.Enum):
    PLANNED = "PLANNED"
    IN_PROGRESS = "IN_PROGRESS"
    IN_REVIEW = "IN_REVIEW"
    BLOCKED = "BLOCKED"
    COMPLETED = "COMPLETED"
    CANCELLED = "CANCELLED"
    DELETED = "DELETED"  # ← NEW
```

**Migration:** `20260218_1500_add_task_deleted_status_and_chat_task_id.py`

2. **Changed to soft delete:**

```python
# AFTER fix
@staticmethod
async def delete(db: AsyncSession, task_id: str, user_id: str):
    task = await TaskService.get(db, task_id, user_id)
    if task:
        task.status = TaskStatus.DELETED
        await db.commit()
```

3. **Filter deleted tasks from queries:**

```python
# All list queries now exclude DELETED
query = select(Task).where(
    Task.milestone_id == milestone_id,
    Task.status != TaskStatus.DELETED,
)
```

### Lesson Learned

Apply the same soft-delete pattern to all user content entities. Create a migration checklist when adding `DELETED` status:
1. Add enum value to model
2. Create Alembic migration
3. Change service delete method to set status
4. Add filter `!= DELETED` to all list/search queries
5. Update frontend to handle the new status

---

## 12. Deleted Projects Still Appearing in Lists

**Date:** 2026-02-18
**Severity:** Medium
**Affected Area:** Frontend project list, dashboard
**Commit:** `8c4ca0e`

### Symptom

After implementing soft delete for projects (Error #10), projects marked as `DELETED` still appeared in the project list and dashboard. Users could see and click on "deleted" projects.

### Root Cause

**The project listing query didn't filter out deleted projects.**

```python
# BEFORE fix — project_service.py
@staticmethod
async def list(db: AsyncSession, user_id: str):
    result = await db.execute(
        select(Project).where(Project.user_id == user_id)
        .order_by(Project.updated_at.desc())
    )
    return result.scalars().all()  # ← Returns ALL projects, including DELETED
```

### Fix

**File:** `backend/app/services/project_service.py`

```python
# AFTER fix
@staticmethod
async def list(db: AsyncSession, user_id: str):
    result = await db.execute(
        select(Project).where(
            Project.user_id == user_id,
            Project.status != ProjectStatus.DELETED,  # ← Filter deleted
        )
        .order_by(Project.updated_at.desc())
    )
    return result.scalars().all()
```

### Lesson Learned

When implementing soft deletes, **always audit every query** that touches the entity. It's not enough to change the delete method — you must also add `status != DELETED` filters to:
- List queries
- Search queries
- Count/stats queries
- Dashboard aggregations
- Related entity queries (e.g., "milestones for project X" should check if project is deleted)

---

## 13. Dashboard Showing All Projects Instead of Active Only

**Date:** 2026-02-19
**Severity:** Low
**Affected Area:** Dashboard page (`/dashboard`)
**Commit:** `8571bca`

### Symptom

The dashboard "Recent Projects" section showed all projects regardless of status, including `PLANNED`, `ON_HOLD`, `COMPLETED`, and `ARCHIVED` projects. This cluttered the dashboard with inactive projects.

### Root Cause

**No status filter in the dashboard query.**

The dashboard fetched all projects and displayed them, without considering which ones the user is actively working on.

### Fix

**File:** `frontend/app/dashboard/page.tsx`

```typescript
// AFTER fix — Filter to only IN_PROGRESS, show last 3
const activeProjects = projects
    .filter(p => p.status === "IN_PROGRESS")
    .slice(0, 3);
```

The dashboard now shows only the 3 most recent `IN_PROGRESS` projects, with a link to see all projects.

### Lesson Learned

Dashboard views should be curated, not comprehensive. Show only actionable items — active projects, pending tasks, recent activity. Provide a "View all" link for comprehensive lists.

---

## 14. AI Selection Buttons Not Rendering in Chat

**Date:** 2026-02-18
**Severity:** Medium
**Affected Area:** Project creation chat, milestone generation chat
**Commit:** `8c4ca0e`

### Symptom

During AI-guided project creation, the assistant asks "What AI branch is this project?" and lists options in text. But the UI should show clickable buttons for options like "GenAI/LLM", "Computer Vision", etc. Instead, the options appear as plain text that the user has to type manually.

### Root Cause

**No mechanism to detect and render action buttons from AI responses.**

The AI was trained to output markers like `[SELECT_AI_BRANCH]` in its responses, but the frontend had no code to detect these markers and render interactive buttons.

### Fix

**Two-part fix:**

1. **Backend: Parse AI response for action markers**

**File:** `backend/app/services/chat_service.py`

```python
# Detect action markers in AI response
action_info = None
if "[SELECT_AI_BRANCH]" in ai_response:
    action_info = {
        "action": "select_ai_branch",
        "options": ["GenAI/LLM", "ML Tradicional", "Computer Vision", "NLP",
                     "Reinforcement Learning", "MLOps", "Data Engineering", "Otro"]
    }
elif "[SELECT_PRIORITY]" in ai_response:
    action_info = {
        "action": "select_priority",
        "options": ["Baja", "Media", "Alta", "Crítica"]
    }
# ... more markers

# Include in response
return {
    "message": ai_response,
    "action": action_info,
}
```

2. **Frontend: Render action buttons in message bubble**

**File:** `frontend/components/chat/message-bubble.tsx`

```tsx
{message.action && (
  <div className="flex flex-wrap gap-2 mt-3">
    {message.action.options.map((option) => (
      <Button
        key={option}
        variant="secondary"
        size="sm"
        onClick={() => onActionClick?.(option)}
      >
        {option}
      </Button>
    ))}
  </div>
)}
```

**File:** `frontend/components/chat/project-creation-chat.tsx`

```tsx
const handleActionClick = (value: string) => {
  // Send the selected value as a user message
  sendMessage(value);
};
```

### Lesson Learned

When building conversational AI interfaces, plan the **interaction model** upfront:
- Define clear markers for structured actions (selection, confirmation, input)
- Parse these markers in the backend before sending to the frontend
- Render appropriate UI widgets (buttons, dropdowns, forms) based on the action type
- Let the user's button click send the value as a regular message

---

## 15. Project Summary Card Not Displaying After AI Generation

**Date:** 2026-02-18
**Severity:** Medium
**Affected Area:** Project creation chat
**Commit:** `8c4ca0e`

### Symptom

After the AI finishes gathering project information and generates a project summary, the summary should appear as a formatted card with fields (AI Branch, Problem, Target User, Technologies, etc.). Instead, the summary appeared as raw text, making it hard to review before confirming.

### Root Cause

**No project summary card component existed.** The AI generated a summary in plain text/markdown, but there was no specialized rendering for project data.

### Fix

**File:** `frontend/components/chat/message-bubble.tsx`

Added a `ProjectSummaryCard` component that detects when a message contains structured project data and renders it as a card:

```tsx
// Rendered inside assistant messages when project_summary is present
<div className="mt-3 rounded-lg border border-brand-skyblue/30 bg-[var(--bg-terminal)]">
  <div className="px-4 py-3 border-b border-brand-skyblue/20 bg-brand-skyblue/5">
    <span className="font-mono text-sm font-semibold text-brand-skyblue">
      Resumen del Proyecto
    </span>
  </div>
  <div className="p-4 space-y-3">
    {fields.map(({ icon, label, value }) => (
      <div key={label} className="flex items-start gap-3">
        <Icon className="w-4 h-4 text-brand-skyblue mt-0.5" />
        <span className="w-28 text-xs text-muted-foreground font-mono">{label}</span>
        <span className="text-sm text-foreground">{value}</span>
      </div>
    ))}
    {/* Technology pills */}
    <div className="flex flex-wrap gap-1.5">
      {technologies.map(tech => (
        <span className="px-2 py-0.5 text-xs font-mono rounded-md
          bg-brand-skyblue/10 text-brand-skyblue border border-brand-skyblue/20">
          {tech}
        </span>
      ))}
    </div>
  </div>
</div>
```

### Lesson Learned

AI chat interfaces benefit from **rich message types** beyond plain text. When the AI generates structured data (project summaries, task lists, deployment info), render it as a specialized card component rather than raw text. This improves readability and gives users a clear "review before confirm" experience.

---

## 16. Markdown Tables Not Styled in Chat Messages

**Date:** 2026-02-19
**Severity:** Low
**Affected Area:** Chat message rendering
**Commit:** `8571bca`

### Symptom

When the AI responds with a markdown table (e.g., comparing technologies, listing task estimates), the table renders with no borders, no padding, and no visual structure. The cells run together and are unreadable.

### Root Cause

**The markdown renderer (react-markdown) outputs raw HTML `<table>` elements, but Tailwind's CSS reset strips all default table styling.**

```tsx
// The markdown content renders <table>, <th>, <td> elements
// But Tailwind's preflight removes all browser default styles
// Result: unstyled, collapsed table
```

### Fix

**File:** `frontend/components/chat/message-bubble.tsx`

Added Tailwind prose overrides for table elements in the markdown container:

```tsx
<div className="prose prose-invert prose-sm max-w-none
  [&_table]:w-full [&_table]:border-collapse [&_table]:border [&_table]:border-border
  [&_th]:border [&_th]:border-border [&_th]:px-3 [&_th]:py-2 [&_th]:bg-secondary [&_th]:text-left [&_th]:font-mono [&_th]:text-xs
  [&_td]:border [&_td]:border-border [&_td]:px-3 [&_td]:py-2 [&_td]:text-sm
  [&_tr:hover]:bg-accent/50
">
  <ReactMarkdown>{message.content}</ReactMarkdown>
</div>
```

### Lesson Learned

When using Tailwind CSS with markdown rendering, always add explicit prose styles for elements that Tailwind's preflight resets. Tables, blockquotes, and nested lists are the most commonly affected. Use Tailwind's arbitrary child selectors `[&_element]` to style them within the prose container.

---

## 17. Lambda Function Out of Memory in Dev Environment

**Date:** 2026-02-17
**Severity:** Medium
**Affected Area:** AWS Lambda (dev environment), chat endpoints
**Commit:** `23a38c8`

### Symptom

Chat API calls in the dev environment fail intermittently with timeout errors. Lambda CloudWatch logs show `Runtime.ExitError` or `Task timed out after 10 seconds`. The function never returns a response.

### Root Cause

**Lambda memory set too low (128MB) for AI processing.**

```hcl
# BEFORE fix — infrastructure/terraform/environments/dev.tfvars
lambda_memory = 128  # Only 128MB!
```

The chat endpoint loads:
- FastAPI framework
- SQLAlchemy + asyncpg
- Google Gemini SDK
- Full conversation context (up to 50 messages)

128MB is barely enough to load the dependencies, leaving no room for actual processing. The Lambda was being killed by the OOM (Out of Memory) killer before it could respond.

### Fix

**File:** `infrastructure/terraform/environments/dev.tfvars`

```hcl
# AFTER fix
lambda_memory = 512  # 512MB — enough for AI processing
```

### Lesson Learned

**AI-backed Lambda functions need at least 512MB of memory.** The SDK alone (Google Gemini, OpenAI, etc.) plus the web framework and DB client consume 200-300MB. For AI processing with context windows, 512MB is the minimum. For production, consider 1024MB for faster cold starts and more headroom.

**Lambda memory also affects CPU allocation** — AWS gives proportionally more CPU with more memory. 128MB gets 1/6th of a vCPU, while 512MB gets 1/3rd. This significantly impacts execution speed.

---

## 18. Chat Input Not Restored After Send Failure

**Date:** 2026-02-17
**Severity:** Medium
**Affected Area:** Chat interface, all chat types
**Commit:** `05fc243`

### Symptom

When a chat message fails to send (network error, timeout, server error), the input field is empty. The user's typed message is lost and they have to type it again from memory.

### Root Cause

**The input is cleared immediately on send, before the API call completes:**

```typescript
// BEFORE fix
const handleSend = async () => {
  const content = input.trim();
  setInput("");  // ← Cleared immediately
  await sendMessage(content);  // ← If this fails, message is lost
};
```

### Fix

**File:** Chat component (varies by chat type)

```typescript
// AFTER fix
const handleSend = async () => {
  const content = input.trim();
  setInput("");  // Clear for optimistic UX

  try {
    await sendMessage(content);
  } catch {
    setInput(content);  // ← Restore input on failure
  }
};
```

### Lesson Learned

When implementing optimistic UI patterns, always have a **rollback** for the UI state. If the action fails:
- Restore the input field content
- Keep the optimistic message visible (but marked as failed)
- Show a clear error message

The user should never have to re-type or re-create anything that was lost due to an error.

---

## 19. Empty Gemini Response With No Fallback

**Date:** 2026-02-16
**Severity:** Medium
**Affected Area:** Backend AI service, chat responses
**Commit:** `c4f1550`

### Symptom

The AI assistant responds with a completely blank message. The message bubble appears in the chat but contains no text. No error is shown — it just looks like the AI "said nothing."

### Root Cause

**Gemini sometimes returns an empty `response.text` without throwing an error.** This can happen when:
- The response is blocked by safety filters (but not fully rejected)
- The model hits `MAX_TOKENS` with no content generated
- A `RECITATION` filter triggers
- The model decides the response should be empty

```python
# BEFORE fix
content = response.text  # Could be None or ""
# ... stored directly in DB as the AI message
```

### Fix

**File:** `backend/app/services/ai_service.py`

```python
# AFTER fix
content = response.text or "Lo siento, no pude generar una respuesta. ¿Podrías reformular tu pregunta?"

# Also log the reason
if not response.text:
    if response.candidates:
        candidate = response.candidates[0]
        logger.warning(f"Empty response. Finish reason: {candidate.finish_reason}")
    else:
        logger.warning("Empty response with no candidates")
```

### Lesson Learned

**Always provide a fallback for empty AI responses.** The fallback should:
1. Be clearly worded so the user knows what happened
2. Suggest a next action ("reformulate your question")
3. Log the reason server-side for debugging

---

## 20. Delete Button With No Confirmation Dialog

**Date:** 2026-02-18
**Severity:** Medium
**Affected Area:** Project detail page, task management
**Commit:** `8c4ca0e`

### Symptom

Clicking the trash/delete icon on a project immediately deletes it with no confirmation. Users accidentally delete projects and lose access to their data (before soft delete was implemented, this was permanent).

### Root Cause

**Direct action with no confirmation step:**

```tsx
// BEFORE fix
<Button variant="ghost" onClick={() => deleteProject(project.id)}>
  <Trash2 className="w-4 h-4 text-destructive" />
</Button>
```

### Fix

**File:** `frontend/app/dashboard/projects/[id]/page.tsx`

Replaced the direct delete button with a dropdown menu that includes status options, and added a confirmation dialog for deletion:

```tsx
// AFTER fix — Dropdown with status options
<DropdownMenu>
  <DropdownMenuTrigger asChild>
    <Button variant="ghost" size="icon-sm">
      <MoreVertical className="w-4 h-4" />
    </Button>
  </DropdownMenuTrigger>
  <DropdownMenuContent>
    <DropdownMenuItem onClick={() => setShowDeleteDialog(true)}>
      <Trash2 className="w-4 h-4 text-destructive" />
      Eliminar proyecto
    </DropdownMenuItem>
  </DropdownMenuContent>
</DropdownMenu>

{/* Confirmation dialog */}
<Dialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
  <DialogContent>
    <DialogHeader>
      <DialogTitle>Eliminar proyecto</DialogTitle>
      <DialogDescription>
        Esta acción marcará el proyecto como eliminado.
        Los datos asociados (hitos, tareas, despliegues) se conservarán pero no serán visibles.
      </DialogDescription>
    </DialogHeader>
    <DialogFooter>
      <Button variant="ghost" onClick={() => setShowDeleteDialog(false)}>Cancelar</Button>
      <Button variant="destructive" onClick={handleDelete}>Eliminar</Button>
    </DialogFooter>
  </DialogContent>
</Dialog>
```

### Lesson Learned

**All destructive actions must require explicit confirmation.** Follow this pattern:
1. Hide destructive options in a dropdown or secondary menu (not a primary button)
2. Show a confirmation dialog with:
   - Clear description of what will happen
   - What data will be affected
   - A "Cancel" option that's easy to click
   - A clearly labeled destructive button (red)
3. Use soft delete so data can be recovered even after confirmation

---

## 21. Chat Sessions Not Linked to Tasks

**Date:** 2026-02-19
**Severity:** Low
**Affected Area:** Chat system, task context
**Commit:** `8571bca`

### Symptom

When asking the AI for help with a specific task, the AI has no awareness of which task the user is working on. The conversation lacks task-specific context (task description, blockers, related tasks, tech component).

### Root Cause

**The `ChatSession` model had no `task_id` field.** Sessions could only be linked to projects and milestones:

```python
# BEFORE fix
class ChatSession(Base):
    project_id = Column(String, ForeignKey("projects.id"), nullable=True)
    milestone_id = Column(String, ForeignKey("milestones.id"), nullable=True)
    # No task_id!
```

### Fix

**Migration:** `20260218_1500_add_task_deleted_status_and_chat_task_id.py`

```python
# AFTER fix — ChatSession model
class ChatSession(Base):
    project_id = Column(String, ForeignKey("projects.id"), nullable=True)
    milestone_id = Column(String, ForeignKey("milestones.id"), nullable=True)
    task_id = Column(String, ForeignKey("tasks.id"), nullable=True)  # ← NEW
```

The task builder chat now creates sessions linked to specific tasks, and the AI context builder includes:
- Task title, description, and status
- Tech component and complexity
- Blockers and notes
- Sibling tasks with their statuses (for dependency awareness)

### Lesson Learned

When building context-aware AI chat, link sessions to the **most specific entity** the user is working on. A task-level session should include task context, milestone context, AND project context — building a full context hierarchy.

---

## 22. Task Board Not Reflecting Status Changes Immediately

**Date:** 2026-02-19
**Severity:** Low
**Affected Area:** Task board UI, milestone detail page
**Commit:** `8571bca`

### Symptom

When changing a task's status (e.g., from "Planned" to "In Progress") via the task board dropdown, the task card doesn't update immediately. The user has to refresh the page to see the change.

### Root Cause

**No optimistic update pattern.** The task status update was fire-and-forget:

```typescript
// BEFORE fix
const handleStatusChange = async (taskId: string, newStatus: string) => {
  await tasksApi.update(taskId, { status: newStatus });
  // No local state update — waits for next page load
};
```

### Fix

**File:** `frontend/components/projects/task-board.tsx`

Implemented optimistic update with rollback:

```typescript
// AFTER fix
const handleStatusChange = async (taskId: string, newStatus: string) => {
  const previousTasks = [...tasks]; // Save previous state for rollback

  // Optimistic update — change immediately in UI
  setTasks(tasks.map(t =>
    t.id === taskId ? { ...t, status: newStatus } : t
  ));

  try {
    await tasksApi.update(taskId, { status: newStatus });
  } catch {
    // Rollback on failure
    setTasks(previousTasks);
    toast("Error al actualizar el estado", "error");
  }
};
```

### Lesson Learned

**Use optimistic updates for all quick status changes.** The pattern:
1. Save current state (for rollback)
2. Update UI immediately
3. Send API request
4. On failure: rollback to saved state + show error
5. On success: do nothing (UI already shows correct state)

This makes the app feel instant while still being resilient to failures.

---

## 23. Company Name Inconsistency in AI Prompts

**Date:** 2026-02-18
**Severity:** Low
**Affected Area:** AI system prompts
**Commit:** `8c4ca0e`

### Symptom

The AI assistant sometimes refers to the company as "LooperTech" and sometimes as "LooperAI". This inconsistency confuses users about the actual company name.

### Root Cause

**Hardcoded company names in system prompts from different development phases.** Early prompts used "LooperTech" (the original name), but the company rebranded to "LooperAI".

```python
# BEFORE fix — scattered across prompts
"built by the AI PlayGrounds community (part of LooperTech)"
"LooperTech's learning platform"
```

### Fix

**File:** `backend/app/services/ai_service.py` (system prompts)

Changed all references to "LooperAI":

```python
# AFTER fix
PRODUCT_CONTEXT = """
You are the AI assistant for Umbral, an AI Learning Vault platform
built by the AI PlayGrounds community (part of LooperAI).
"""
```

### Lesson Learned

**Never hardcode company/product names in prompts.** Use constants or environment variables:

```python
COMPANY_NAME = os.getenv("COMPANY_NAME", "LooperAI")
PRODUCT_NAME = os.getenv("PRODUCT_NAME", "Umbral")

SYSTEM_PROMPT = f"You are the AI assistant for {PRODUCT_NAME}, built by {COMPANY_NAME}."
```

This makes rebranding a config change instead of a code search.

---

## General Debugging Checklist

When a page shows loading forever or an error:

1. **Check browser DevTools Network tab** — look for failed API requests (4xx, 5xx, CORS errors)
2. **Check browser Console** — look for JavaScript errors or logged error messages
3. **Test the API directly** with curl: `curl -v http://localhost:8000/api/endpoint`
4. **Check if backend is running**: `curl http://localhost:8000/docs`
5. **Check if backend has latest code**: `curl http://localhost:8000/openapi.json`
6. **Check backend terminal logs** for Python tracebacks
7. **Verify the database migration ran**: `alembic current` should show the latest revision

---

## Pattern Catalog

### Recurring Root Causes

| Pattern | Occurrences | Errors |
|---|---|---|
| Missing error handling / silent catch | 4 | #2, #4, #18, #19 |
| API response shape mismatch | 3 | #1, #9, #12 |
| Async/blocking issues | 2 | #8, #4 |
| No soft delete | 2 | #10, #11 |
| Stale state / no optimistic update | 2 | #6, #22 |
| Missing confirmation dialog | 1 | #20 |
| External service timeout | 1 | #4 |
| Supabase-specific issues | 1 | #5 |
| Webhook dependency | 1 | #7 |

### Standard Fixes Applied

| Fix Pattern | Description | Applied In |
|---|---|---|
| **Defensive response parsing** | `Array.isArray(data) ? data : (data?.items ?? [])` | #1, #9 |
| **Three-state guard** | `if (loading)` / `if (error)` / render | #2 |
| **HTTP timeout** | `timeout: 60_000` on Axios | #4 |
| **Optimistic update + rollback** | Save → Update UI → API call → Rollback on error | #4, #22 |
| **Soft delete** | Status = DELETED instead of DELETE FROM | #10, #11 |
| **JIT user provisioning** | Auto-create user on first request | #7 |
| **Token getter pattern** | Axios interceptor with `getToken()` per request | #6 |
| **Async I/O** | `await client.aio.*` instead of `client.*` | #8 |
| **Safety filter config** | `BLOCK_ONLY_HIGH` for educational content | #4 |
| **Confirmation dialog** | Dialog before destructive actions | #20 |

---

## Environment Notes

- **Backend**: FastAPI + uvicorn, Python 3.12, SQLAlchemy async + asyncpg
- **Frontend**: Next.js 14 + TypeScript, Zustand stores, Axios API client
- **Auth**: Clerk (frontend) → JWT token → FastAPI dependency injection (backend)
- **AI**: Google Gemini (`gemini-2.5-flash`)
- **DB**: Supabase PostgreSQL via pooler connection
- **Platform**: Windows 10, development via Git Bash
- **Infrastructure**: AWS Lambda + Terraform (dev), Vercel (frontend)
