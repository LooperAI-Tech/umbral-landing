# Umbral - Errors & Fixes Log

Detailed documentation of bugs encountered during development, their root causes, and the fixes applied. Use this as a reference when debugging similar issues.

---

## Table of Contents

1. [Dashboard Not Showing Projects on Login](#1-dashboard-not-showing-projects-on-login)
2. [Milestone Detail Page Infinite Loading (Skeletons Forever)](#2-milestone-detail-page-infinite-loading-skeletons-forever)
3. [Milestone API Returning 405 Method Not Allowed](#3-milestone-api-returning-405-method-not-allowed)

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
