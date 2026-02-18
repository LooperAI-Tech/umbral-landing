# Umbral - Errors & Fixes Log

Detailed documentation of bugs encountered during development, their root causes, and the fixes applied. Use this as a reference when debugging similar issues.

---

## Table of Contents

1. [Dashboard Not Showing Projects on Login](#1-dashboard-not-showing-projects-on-login)
2. [Milestone Detail Page Infinite Loading (Skeletons Forever)](#2-milestone-detail-page-infinite-loading-skeletons-forever)
3. [Milestone API Returning 405 Method Not Allowed](#3-milestone-api-returning-405-method-not-allowed)
4. [AI Assistant Stops Randomly Mid-Conversation](#4-ai-assistant-stops-randomly-mid-conversation)

---

## 1. Dashboard Not Showing Projects on Login

**Date:** 2026-02-14
**Severity:** High
**Affected Area:** Frontend Dashboard (`/dashboard`)

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

## Environment Notes

- **Backend**: FastAPI + uvicorn, Python 3.12, SQLAlchemy async + asyncpg
- **Frontend**: Next.js 16 + TypeScript, Zustand stores, Axios API client
- **Auth**: Clerk (frontend) → JWT token → FastAPI dependency injection (backend)
- **DB**: Supabase PostgreSQL via pooler connection
- **Platform**: Windows 10, development via WSL/Git Bash
