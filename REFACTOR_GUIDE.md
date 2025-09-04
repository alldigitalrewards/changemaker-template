# Adapting Vercel Platforms Template for Changemaker Core

This guide details how to refactor the Vercel Platforms template ([github.com/vercel/platforms](https://github.com/vercel/platforms)) into a minimal, functional Changemaker app. We focus on core business logic (multi-tenant workspaces, user auth/enrollment, challenges/initiatives, basic dashboards) while stripping bloat from the original Changemaker repo. Super admin and subdomains are nixed – use path-based routing (/w/[slug]) and simplified roles (ADMIN, PARTICIPANT).

**Best Path Forward**: Start with template's multi-tenancy base, swap Redis for Supabase/Prisma, integrate original pages/theme, simplify for DRY/type-safe code. Use pnpm for all [[memory:3933555]]. Implement strategically like a top SF dev: Clean, performant, human-reviewable [[memory:3146097]].

## Overview & Goals

- **Template Base**: Handles tenant admin, dynamic routing – adapt for paths instead of subdomains.
- **Core Kept from Original**: Auth (Supabase), DB (Prisma), challenges/enrollment, basic admin/participant UIs, Changemaker theme (coral/terracotta).
- **Stripped Bloat**: Tests, emails, jobs, monitoring, AI/queues, advanced analytics, unused deps/components.
- **Conflicts Resolved**: No super admin (old schema conflict); path-based only (nix subdomain middleware).
- **End Result**: Minimal repo (~300-400 src files) with functional app: Create workspace, add challenge, enroll user, view dashboards.
- **Stack**: Next.js 15 (App Router), React 19, TypeScript 5.8+, Prisma, Supabase Auth/DB, Tailwind/shadcn/ui.

## Step 1: Setup New Repo from Template

Run in original dir's shell (cwd: /Users/jack/Projects/changemaker-project/changemaker-1):

```bash
# Create and clone template
mkdir ../changemaker-fresh
cd ../changemaker-fresh
git clone https://github.com/vercel/platforms.git .
git remote remove origin  # For new repo
pnpm install
```

## Step 2: Strip & Copy Essentials from Original

Target: Copy ~200-300 files from original src/ (original has ~1200). Prune non-core.

- **What to Strip (Non-Core from Original src/)**:

  - Remove: emails/, jobs/, workers/, monitoring/, design-system/, docs/, tests/.
  - Prune app/: Keep only (admin)/dashboard, (participant)/dashboard/onboarding, api/{auth,challenges,initiatives,enrollments,users,workspaces}.
  - Prune lib/: Remove email/, monitoring/, queue/, storage/, advanced services (e.g., activityService if not core). Keep auth/, prisma/, utils/, permissions/.
  - Prune components/: Remove charts/, examples/, showcase/. Keep common/, admin/, participant/, navigation/, layout/.
  - Dependencies: In package.json, remove langchain, bullmq, framer-motion, recharts, resend, upstash, ai-sdk (add back if needed later).
- **Copy Commands** (Run in new repo):

  ```bash
  # Core app/ routes
  cp -r ../../changemaker-1/src/app/{layout.tsx,page.tsx,middleware.ts} app/
  cp -r ../../changemaker-1/src/app/(admin)/dashboard app/(admin)/
  cp -r ../../changemaker-1/src/app/(participant)/{dashboard,onboarding} app/(participant)/
  cp -r ../../changemaker-1/src/app/api/{auth,challenges,initiatives,enrollments,users,workspaces} app/api/

  # Lib essentials
  mkdir -p lib/{auth,prisma,utils,permissions,services}
  cp -r ../../changemaker-1/src/lib/{auth,prisma,utils,permissions} lib/
  cp -r ../../changemaker-1/src/lib/services/{challengeService,userSyncService} lib/services/  # Core services

  # Components & types
  mkdir -p components/{common,admin,participant,navigation,layout}
  cp -r ../../changemaker-1/src/components/{common,admin,participant,navigation,layout} components/
  cp -r ../../changemaker-1/src/types/* types/

  # Prisma & env
  mkdir prisma
  cp ../../changemaker-1/prisma/schema.prisma prisma/
  cp ../../changemaker-1/.env.local .

  # Theme
  cp ../../changemaker-1/tailwind.config.js .
  cp ../../changemaker-1/src/app/globals.css app/globals.css
  ```
- **Post-Copy Pruning** (In new repo):

  ```bash
  rm -rf app/api/{analytics,audit,feature-flags,rewards,reports}  # Non-core APIs
  rm -rf components/{charts,examples,showcase}  # UI bloat
  rm -rf lib/{email,monitoring,queue,storage}  # Non-core libs
  ```

## Step 3: Adapt Template for Path-Based Workspaces

- **Update Schema** (prisma/schema.prisma – extend template if needed; use the simplified version from previous response):

  - Add Workspace, User, Role enum, Challenge, Enrollment as before.
- **Middleware for Paths** (middleware.ts – merge template's + path logic):

  ```ts
  // See previous response for full code – handles /w/[slug], auth, role checks.
  ```
- **Routes Integration**:

  - Move copied pages under dynamic folders: e.g., mv app/(admin)/dashboard app/w/[slug]/admin/dashboard
  - Update links: Use `/w/${slug}/admin/dashboard` for navigation.
- **RBAC** (lib/auth/rbac.ts – from previous):

  - Simple enum checks; integrate in middleware/routes.

## Step 4: Minimize Dependencies & Config

- **package.json** (Merge template + minimal core):
  ```json
  "dependencies": {
    "next": "15.3.0",
    "react": "latest",
    "react-dom": "latest",
    "@supabase/ssr": "^0.6.1",
    "@supabase/supabase-js": "^2.49.5",
    "@prisma/client": "^6.11.1",
    "tailwindcss": "^3.4.17",
    // shadcn/ui essentials (e.g., @radix-ui/*)
    "zod": "^3.25.62"  // For validation
  },
  "devDependencies": {
    "prisma": "^6.11.1",
    "typescript": "5.8.3"
  }
  ```
- `pnpm install && pnpm prisma generate`

## Step 5: Theme & UI Integration

- Extend tailwind.config.js with Changemaker colors (coral/terracotta gradients, navy).
- Update components to use shadcn/ui + your styles.

## Step 6: Test & Functional Flows

- Seed DB: Create script for workspaces/users/challenges.
- Test: `pnpm dev`; Create workspace (/admin), add challenge (/w/slug/admin/challenges), enroll (/w/slug/participant/dashboard).
- Build: `pnpm build` – Monitor for hangs.

## Self-Improvement Notes

- Agents: Use task-orchestrator to hand off (e.g., to TypeScript specialist for types).
- Optimize: If inefficiencies, update .claude/ (e.g., add dir-specific agents in src/app/).

This turns the template functional quickly – test and iterate!
