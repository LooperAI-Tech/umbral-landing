# Vercel - Complete Reference

> The Umbral EdTech **frontend** (Next.js 16) is deployed on **Vercel**. This document covers everything about the Vercel setup: CLI installation, project linking, environment variables, deployments, configuration, and troubleshooting.

---

## Table of Contents

- [Project Overview](#project-overview)
- [Installation](#installation)
  - [Vercel CLI](#vercel-cli)
  - [Authentication](#authentication)
- [Project Setup](#project-setup)
  - [Linking a Project](#linking-a-project)
  - [Project Structure](#project-structure)
- [Environment Variables](#environment-variables)
  - [Required Variables](#required-variables)
  - [Managing Variables via CLI](#managing-variables-via-cli)
  - [Managing Variables via Dashboard](#managing-variables-via-dashboard)
  - [Environment Scopes](#environment-scopes)
  - [Current Variable Configuration](#current-variable-configuration)
  - [Pulling Variables Locally](#pulling-variables-locally)
- [Next.js Configuration](#nextjs-configuration)
  - [next.config.ts](#nextconfigts)
  - [Middleware](#middleware)
  - [Build Output](#build-output)
- [Deployment](#deployment)
  - [Deploy to Production](#deploy-to-production)
  - [Deploy to Preview](#deploy-to-preview)
  - [Deploy from Git](#deploy-from-git)
  - [Deployment Workflow](#deployment-workflow)
- [CLI Reference](#cli-reference)
  - [Common Commands](#common-commands)
  - [Environment Commands](#environment-commands)
  - [Deployment Commands](#deployment-commands)
  - [Inspection Commands](#inspection-commands)
- [Project Configuration Files](#project-configuration-files)
  - [vercel.json (optional)](#verceljson-optional)
  - [.vercelignore](#vercelignore)
- [Vercel Dashboard Reference](#vercel-dashboard-reference)
- [Errors & Fixes](#errors--fixes)

---

## Project Overview

| Setting            | Value                                              |
| ------------------ | -------------------------------------------------- |
| **Platform**       | Vercel                                             |
| **Project Name**   | `umbral-front`                                     |
| **Team/Scope**     | `mrmorgans-projects`                               |
| **Framework**      | Next.js 16.1.1 (auto-detected)                    |
| **Node Version**   | 24.x                                               |
| **Production URL** | https://umbral-front.vercel.app                    |
| **Root Directory** | `frontend/` (within the monorepo)                  |
| **Build Command**  | `next build` (via `npm run build`)                 |
| **Output Mode**    | `standalone` (configured in `next.config.ts`)      |
| **CLI Version**    | 50.17.1                                            |

---

## Installation

### Vercel CLI

The Vercel CLI is the primary tool for deploying and managing your project from the terminal.

**Install globally:**

```bash
npm install -g vercel
```

**Verify installation:**

```bash
vercel --version
# Output: Vercel CLI 50.17.1
```

**Update to latest:**

```bash
npm update -g vercel
```

### Authentication

Before using the CLI, you must authenticate:

```bash
vercel login
```

This opens a browser window to log in with your Vercel account (GitHub, GitLab, email, etc.). After login, the CLI stores your token locally and you won't need to log in again on this machine.

**Verify authentication:**

```bash
vercel whoami
# Output: mrmorgans-projects
```

**Logout:**

```bash
vercel logout
```

---

## Project Setup

### Linking a Project

Before deploying, the local directory must be linked to a Vercel project. This is typically done once per machine.

```bash
cd frontend
vercel link
```

The CLI will ask:
1. **Set up and deploy?** → Yes
2. **Which scope?** → Select your team (e.g., `mrmorgans-projects`)
3. **Link to existing project?** → Yes (if project already exists on Vercel)
4. **Project name?** → `umbral-front`

This creates a `.vercel/` directory inside `frontend/` with a `project.json` containing:
```json
{
  "projectId": "prj_...",
  "orgId": "team_..."
}
```

**Important:** `.vercel/` is in `.gitignore` — it's local to each machine.

### Project Structure

The Vercel project deploys from the `frontend/` directory, not the repository root. This is because Umbral is a monorepo:

```
umbral-edtech/              ← Git repository root
├── backend/                 ← Python backend (not deployed to Vercel)
├── frontend/                ← Next.js app (deployed to Vercel)
│   ├── .vercel/             ← Vercel project link (gitignored)
│   ├── app/                 ← Next.js App Router pages
│   ├── components/          ← React components
│   ├── lib/                 ← Utilities, API clients, Supabase client
│   ├── types/               ← TypeScript types
│   ├── public/              ← Static assets
│   ├── middleware.ts        ← Clerk auth middleware
│   ├── next.config.ts       ← Next.js configuration
│   ├── package.json         ← Dependencies & scripts
│   ├── .env.local           ← Local env vars (gitignored)
│   └── .env.example         ← Template for env vars
├── infrastructure/          ← Terraform/IaC (not deployed to Vercel)
└── docs/                    ← Documentation
```

When running `vercel` or `vercel --prod`, you must be in the `frontend/` directory.

---

## Environment Variables

### Required Variables

The frontend requires three groups of environment variables:

**Clerk Authentication:**

| Variable | Example | Scope | Description |
|----------|---------|-------|-------------|
| `NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY` | `pk_test_...` | Production, Preview | Clerk public key (safe for client) |
| `CLERK_SECRET_KEY` | `sk_test_...` | Production, Preview | Clerk secret key (server-side only) |
| `NEXT_PUBLIC_CLERK_SIGN_IN_URL` | `/sign-in` | Production, Preview | Sign-in page path |
| `NEXT_PUBLIC_CLERK_SIGN_UP_URL` | `/sign-up` | Production, Preview | Sign-up page path |
| `NEXT_PUBLIC_CLERK_AFTER_SIGN_IN_URL` | `/dashboard` | Production, Preview | Redirect after sign-in |
| `NEXT_PUBLIC_CLERK_AFTER_SIGN_UP_URL` | `/dashboard` | Production, Preview | Redirect after sign-up |

**API Configuration:**

| Variable | Example | Scope | Description |
|----------|---------|-------|-------------|
| `NEXT_PUBLIC_API_URL` | `https://api.learn.loopertech.net` | Production | Backend API base URL |

**Supabase:**

| Variable | Example | Scope | Description |
|----------|---------|-------|-------------|
| `NEXT_PUBLIC_SUPABASE_URL` | `https://uzhujvcmdgkpdpnxccdb.supabase.co` | Production, Preview | Supabase project URL |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | `eyJhbGci...` | Production, Preview | Supabase anon (public) key |

**Security notes on `NEXT_PUBLIC_` variables:**
- Variables prefixed with `NEXT_PUBLIC_` are bundled into the client-side JavaScript — they are **visible to anyone** who inspects your site
- This is correct for Clerk publishable keys, Supabase anon keys, and URLs
- `CLERK_SECRET_KEY` does NOT have the `NEXT_PUBLIC_` prefix — it's only available server-side (API routes, middleware)
- Never put database passwords, service role keys, or API secrets in `NEXT_PUBLIC_` variables

### Managing Variables via CLI

**Add a variable:**

```bash
# Interactive (prompts for value)
vercel env add VARIABLE_NAME production

# Pipe value (non-interactive)
echo "the-value" | vercel env add VARIABLE_NAME production

# Add to multiple environments at once
echo "the-value" | vercel env add VARIABLE_NAME production preview
```

**List all variables:**

```bash
vercel env ls
```

**Remove a variable:**

```bash
vercel env rm VARIABLE_NAME production
```

**Pull variables to `.env.local`:**

```bash
vercel env pull
# Creates/overwrites .env.local with all variables for the Development environment
```

### Managing Variables via Dashboard

1. Go to https://vercel.com → Select `umbral-front` project
2. Go to **Settings** > **Environment Variables**
3. Add/edit/delete variables with their scopes

### Environment Scopes

Vercel has three environment scopes:

| Scope | When Used | Notes |
|-------|-----------|-------|
| **Production** | `vercel --prod` deployments | The live site |
| **Preview** | `vercel` (without `--prod`) deployments, PR previews | For testing before production |
| **Development** | `vercel dev` (local development) | Mirrors Vercel environment locally |

Each variable can be assigned to one or more scopes. A variable in **Production** is NOT automatically in **Preview** — you must add it to both if needed.

### Current Variable Configuration

As of the latest deployment:

| Variable | Production | Preview | Notes |
|----------|:----------:|:-------:|-------|
| `NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY` | yes | — | Needs to be added to Preview |
| `CLERK_SECRET_KEY` | yes | — | Needs to be added to Preview |
| `NEXT_PUBLIC_CLERK_SIGN_IN_URL` | yes | — | Needs to be added to Preview |
| `NEXT_PUBLIC_CLERK_SIGN_UP_URL` | yes | — | Needs to be added to Preview |
| `NEXT_PUBLIC_CLERK_AFTER_SIGN_IN_URL` | yes | — | Needs to be added to Preview |
| `NEXT_PUBLIC_CLERK_AFTER_SIGN_UP_URL` | yes | — | Needs to be added to Preview |
| `NEXT_PUBLIC_API_URL` | yes | — | Different URL for Preview vs Production |
| `NEXT_PUBLIC_SUPABASE_URL` | yes | yes | Same value for both |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | yes | yes | Same value for both |

**Action needed:** Clerk variables are missing from the Preview scope. Preview deployments will fail to authenticate. To fix:

```bash
cd frontend

# Add Clerk vars to preview (repeat for each variable)
echo "pk_test_..." | vercel env add NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY preview
echo "sk_test_..." | vercel env add CLERK_SECRET_KEY preview
echo "/sign-in" | vercel env add NEXT_PUBLIC_CLERK_SIGN_IN_URL preview
echo "/sign-up" | vercel env add NEXT_PUBLIC_CLERK_SIGN_UP_URL preview
echo "/dashboard" | vercel env add NEXT_PUBLIC_CLERK_AFTER_SIGN_IN_URL preview
echo "/dashboard" | vercel env add NEXT_PUBLIC_CLERK_AFTER_SIGN_UP_URL preview
```

### Pulling Variables Locally

Instead of manually maintaining `.env.local`, you can pull from Vercel:

```bash
cd frontend
vercel env pull
```

This creates `.env.local` with all Development-scoped variables. Since our variables are only in Production/Preview scopes, you may need to pull from a specific environment:

```bash
vercel env pull --environment=production
```

---

## Next.js Configuration

### next.config.ts

**File:** `frontend/next.config.ts`

```typescript
import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  output: 'standalone',  // Required for production Docker builds
};

export default nextConfig;
```

- `output: 'standalone'` creates a self-contained build that includes only the necessary files. Vercel handles this automatically, but this setting is also useful for Docker deployments.
- No `vercel.json` file is needed — Vercel auto-detects Next.js and applies optimal settings.

### Middleware

**File:** `frontend/middleware.ts`

```typescript
import { clerkMiddleware, createRouteMatcher } from "@clerk/nextjs/server";

const isProtectedRoute = createRouteMatcher([
  "/dashboard(.*)",
  "/api(.*)",
]);

export default clerkMiddleware(async (auth, req) => {
  if (isProtectedRoute(req)) {
    await auth.protect();
  }
});
```

**What this does on Vercel:**
- Runs as a Vercel Edge Function (automatic for Next.js middleware)
- Protects `/dashboard/*` and `/api/*` routes — unauthenticated users are redirected to Clerk's sign-in
- **Does NOT protect** `/early-access`, `/`, or any other public page
- The `matcher` config excludes static assets from middleware processing

**Deprecation warning:** Next.js 16.1.1 shows: `The "middleware" file convention is deprecated. Please use "proxy" instead.` This is a non-blocking warning — middleware still works. Migration to the `proxy` convention can be done in a future update.

### Build Output

When `npm run build` runs, Next.js generates:

```
Route (app)
┌ ƒ /                                      ← Dynamic (SSR)
├ ○ /_not-found                             ← Static
├ ○ /dashboard                              ← Static shell
├ ○ /dashboard/assistant                    ← Static shell
├ ○ /dashboard/learnings                    ← Static shell
├ ○ /dashboard/projects                     ← Static shell
├ ƒ /dashboard/projects/[id]               ← Dynamic (SSR)
├ ƒ /dashboard/projects/[id]/milestones/[milestoneId]  ← Dynamic (SSR)
├ ○ /dashboard/projects/new                 ← Static shell
├ ○ /dashboard/settings                     ← Static shell
├ ○ /early-access                           ← Static (client-side form)
├ ƒ /sign-in/[[...sign-in]]               ← Dynamic (Clerk)
└ ƒ /sign-up/[[...sign-up]]               ← Dynamic (Clerk)
```

- `○` Static — prerendered at build time, served from CDN
- `ƒ` Dynamic — server-rendered on demand via Vercel Serverless/Edge Functions

---

## Deployment

### Deploy to Production

```bash
cd frontend
vercel --prod
```

This:
1. Uploads source files to Vercel
2. Runs `npm install` + `npm run build` on Vercel's build machines
3. Deploys the output to the production URL (https://umbral-front.vercel.app)
4. Uses **Production** environment variables

Output looks like:
```
Vercel CLI 50.17.1
Deploying mrmorgans-projects/umbral-front
Uploading [====================] (406.9KB/406.9KB)
Inspect: https://vercel.com/mrmorgans-projects/umbral-front/...
Production: https://umbral-front-xxxx-mrmorgans-projects.vercel.app
Aliased: https://umbral-front.vercel.app
```

### Deploy to Preview

```bash
cd frontend
vercel
```

Without `--prod`, the deployment goes to a preview URL. Each preview deployment gets a unique URL. Uses **Preview** environment variables.

### Deploy from Git

If the Vercel project is connected to a Git repository:
- **Push to `main`** → triggers a Production deployment automatically
- **Push to any other branch** → triggers a Preview deployment
- **Open a PR** → creates a Preview deployment with a comment on the PR

To set this up:
1. Go to Vercel Dashboard > `umbral-front` > Settings > Git
2. Connect your GitHub repository
3. Set the production branch to `main`
4. Set the root directory to `frontend`

**Current status:** The project is deployed via CLI (`vercel --prod`), not auto-deploy from Git. This is a manual workflow.

### Deployment Workflow

The typical deploy flow:

```bash
# 1. Verify build passes locally
cd frontend
npm run build

# 2. Deploy to preview for testing
vercel
# → Test at the preview URL

# 3. Deploy to production
vercel --prod

# 4. Verify production
# Visit https://umbral-front.vercel.app
```

---

## CLI Reference

### Common Commands

| Command | Description |
|---------|-------------|
| `vercel` | Deploy to preview |
| `vercel --prod` | Deploy to production |
| `vercel dev` | Run development server with Vercel environment |
| `vercel link` | Link local directory to a Vercel project |
| `vercel login` | Authenticate with Vercel |
| `vercel logout` | Remove authentication |
| `vercel whoami` | Show current authenticated user/team |
| `vercel --version` | Show CLI version |

### Environment Commands

| Command | Description |
|---------|-------------|
| `vercel env ls` | List all environment variables |
| `vercel env add NAME scope` | Add a variable (prompts for value) |
| `echo "val" \| vercel env add NAME scope` | Add a variable non-interactively |
| `vercel env rm NAME scope` | Remove a variable |
| `vercel env pull` | Pull variables to `.env.local` |
| `vercel env pull --environment=production` | Pull production variables |

Valid scopes: `production`, `preview`, `development`

### Deployment Commands

| Command | Description |
|---------|-------------|
| `vercel --prod` | Deploy to production |
| `vercel` | Deploy to preview |
| `vercel --force` | Force a new deployment (skip cache) |
| `vercel redeploy URL` | Redeploy a specific deployment |
| `vercel rollback` | Roll back production to previous deployment |
| `vercel ls` | List recent deployments |

### Inspection Commands

| Command | Description |
|---------|-------------|
| `vercel inspect URL` | Show deployment details |
| `vercel inspect URL --logs` | Show deployment build logs |
| `vercel logs URL` | Stream runtime logs |
| `vercel project ls` | List projects in the team |

---

## Project Configuration Files

### vercel.json (optional)

The project currently does **not** use a `vercel.json` file. Vercel auto-detects Next.js and applies sensible defaults. If you need custom configuration, create `frontend/vercel.json`:

```json
{
  "framework": "nextjs",
  "buildCommand": "npm run build",
  "outputDirectory": ".next",
  "installCommand": "npm install",
  "regions": ["iad1"],
  "headers": [
    {
      "source": "/(.*)",
      "headers": [
        { "key": "X-Frame-Options", "value": "DENY" },
        { "key": "X-Content-Type-Options", "value": "nosniff" }
      ]
    }
  ],
  "rewrites": [
    {
      "source": "/api/:path*",
      "destination": "https://your-backend-api.com/api/:path*"
    }
  ]
}
```

**When you might need it:**
- Custom headers (security, CORS, caching)
- Rewrites/redirects (e.g., proxying `/api/*` to a backend)
- Region selection (default is `iad1` = Washington D.C.)
- Custom build/install commands

### .vercelignore

If you want to exclude files from being uploaded to Vercel, create `frontend/.vercelignore`:

```
# Example (not currently used)
docs/
*.test.ts
*.test.tsx
__tests__/
```

The project currently does **not** use `.vercelignore`. Vercel already ignores `node_modules/`, `.git/`, and files in `.gitignore`.

---

## Vercel Dashboard Reference

### Key Locations

| What | Where in Dashboard |
|------|-------------------|
| Deployments list | Project > Deployments |
| Deployment logs | Project > Deployments > Click a deployment > Logs |
| Environment variables | Project > Settings > Environment Variables |
| Git integration | Project > Settings > Git |
| Custom domains | Project > Settings > Domains |
| Build & output settings | Project > Settings > General |
| Function logs (runtime) | Project > Logs |
| Analytics | Project > Analytics (requires plan) |
| Speed Insights | Project > Speed Insights |
| Usage/billing | Team Settings > Usage |

### Production URL

The current production URL is: **https://umbral-front.vercel.app**

To add a custom domain (e.g., `learn.loopertech.net`):
1. Go to Project > Settings > Domains
2. Add `learn.loopertech.net`
3. Configure DNS: Add a CNAME record pointing `learn` to `cname.vercel-dns.com`
4. Vercel auto-provisions an SSL certificate

---

## Errors & Fixes

### 1. "Your codebase isn't linked to a project on Vercel"

**When:** Running any `vercel` command from the wrong directory.

**Cause:** The `.vercel/` project link directory exists in `frontend/`, not the repository root. Running `vercel` from `umbral-edtech/` instead of `umbral-edtech/frontend/` triggers this error.

**Fix:** Always run Vercel commands from the `frontend/` directory:
```bash
cd frontend
vercel --prod
```

Or run `vercel link` from the current directory if you want to link from a different location.

---

### 2. `console.error` causing build failures on Vercel

**When:** Vercel build fails with an ESLint error pointing to `console.error(...)` in the code.

**Cause:** The project's ESLint configuration has the `no-console` rule enabled. ESLint runs during `next build`, and any `console.log()`, `console.error()`, `console.warn()` etc. is treated as an error, failing the build.

**Example error:**
```
127 | console.error('Email check error:', rpcError);
    | ^
```

**Fix:** Remove all `console.*` calls from the frontend code. Use React state (`setError(...)`) to communicate errors to the user instead. Three `console.error` calls were removed from `frontend/app/early-access/page.tsx`:
- `console.error("Email check error:", rpcError)` — in `checkEmailExists()`
- `console.error("Supabase insert error:", dbError)` — in `handleSubmit()`
- `console.error("Early access submit error:", err)` — in `handleSubmit()` catch block

**Prevention:** Before deploying, always run `npm run build` locally to catch ESLint errors:
```bash
cd frontend
npm run build
```

---

### 3. Environment variables missing in Preview deployments

**When:** Preview deployments (PRs, `vercel` without `--prod`) fail or behave unexpectedly — auth doesn't work, API calls fail, Supabase operations fail.

**Cause:** Variables were only added to the **Production** scope, not **Preview**. Each scope is independent — a variable in Production is NOT automatically available in Preview.

**Fix:** Add the same variables to both scopes:
```bash
echo "value" | vercel env add VARIABLE_NAME production
echo "value" | vercel env add VARIABLE_NAME preview
```

Or use the Vercel Dashboard to check all scopes at once when adding a variable.

**Current gap:** The Clerk variables are only in Production. See [Current Variable Configuration](#current-variable-configuration) for details.

---

### 4. Middleware deprecation warning

**When:** Every build shows:
```
⚠ The "middleware" file convention is deprecated. Please use "proxy" instead.
```

**Cause:** Next.js 16 deprecated the `middleware.ts` convention in favor of a new `proxy` convention.

**Impact:** Non-blocking — the middleware still works correctly. This is a warning, not an error.

**Fix (future):** Migrate `frontend/middleware.ts` to the new `proxy` convention when Clerk releases support for it. For now, the warning can be safely ignored.

---

### 5. Build cache causing stale deployments

**When:** You deployed a code change but the live site still shows old behavior.

**Cause:** Vercel caches build output and node_modules between deployments. Sometimes the cache becomes stale.

**Fix:** Force a fresh deployment:
```bash
vercel --prod --force
```

Or from the dashboard: go to Deployments > click the three dots menu > Redeploy > check "Redeploy with no cache".

---

### 6. `output: 'standalone'` and Vercel

**When:** Confusion about whether `standalone` mode is needed for Vercel.

**Cause:** The `next.config.ts` has `output: 'standalone'`, which is designed for Docker/self-hosted deployments. Vercel doesn't need this — it has native Next.js support.

**Impact:** No negative impact. Vercel ignores this setting and uses its own optimized build process. The setting is kept for compatibility with Docker deployments (if the project ever deploys to AWS ECS, for example).

**Fix:** No action needed. If you want to clean it up, you can remove the `output` config:
```typescript
const nextConfig: NextConfig = {};
```

---

### 7. Deployment from wrong branch

**When:** Deploying to production but the deployed code doesn't include recent changes.

**Cause:** When using CLI deployment (`vercel --prod`), Vercel uploads the **local files on disk**, not the latest Git commit. If you have uncommitted changes or are on the wrong branch, the deployment won't match expectations.

**Fix:** Always verify your local state before deploying:
```bash
# Check which branch you're on
git branch --show-current

# Check for uncommitted changes
git status

# Build locally to verify
npm run build

# Then deploy
vercel --prod
```

---

### General Deployment Checklist

Before every production deployment:

1. **Verify branch:** `git branch --show-current` — should be `dev` or `main`
2. **Check for changes:** `git status` — commit or stash pending changes
3. **Build locally:** `cd frontend && npm run build` — verify no TypeScript or ESLint errors
4. **Test locally:** `npm run dev` — quick manual test of critical flows
5. **Check env vars:** `vercel env ls` — verify all required variables exist for Production
6. **Deploy:** `vercel --prod`
7. **Verify:** Visit https://umbral-front.vercel.app and test key pages:
   - Landing page (`/`) loads correctly
   - `/early-access` form works (submit test)
   - `/dashboard` redirects to sign-in (auth working)
