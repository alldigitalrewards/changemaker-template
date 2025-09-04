# Refactor in Platforms Template 

This CLAUDE.md serves as the meta prompt and warm-up context for Claude Code (claude.ai/code) in this fresh repo (/Users/jack/Projects/platforms). We're refactoring the Vercel Platforms template into a minimal Changemaker app: Multi-tenant via path-based workspaces (/w/[slug]), Supabase/Prisma for auth/DB, core logic (challenges, enrollment, dashboards), and your original theme/pages. Follow REFACTOR_GUIDE.md (/Users/jack/Projects/platforms/REFACTOR_GUIDE.md) for steps – begin implementing it now.

**Instructions to Begin**: As Claude Code, start the refactor autonomously. Use agents (e.g., task-orchestrator for coordination, TypeScript specialist for types) to hand off tasks. Prioritize: Setup schema/routing, integrate core files, test functionality. Self-improve: If inefficient, update this file or .claude/ agents/commands.

## 🎯 Mission & Best Path

Democratize innovation with a bloat-free platform for challenges. Core: Workspaces as tenants, simple roles (ADMIN, PARTICIPANT), challenges/enrollment. Nix super admin/subdomains. Best impl: DRY, type-safe, human-readable code; YAGNI principles.

- **Stack**: Next.js 15 (App Router), React 19, TypeScript 5.8+, Prisma, Supabase Auth/DB, Tailwind/shadcn/ui (Changemaker theme).
- **Memories**: Use pnpm [[memory:3933555]]; implement like top SF dev: Strategic, clean [[memory:3146097]].

## 🏗️ Refactor Instructions (From REFACTOR_GUIDE.md)

Follow this sequence – execute via agents or direct code changes. Commit/push after each major step.

1. **Setup Basics** (If not done):

   - pnpm install
   - Setup .env.local with Supabase/DB vars.
   - pnpm prisma generate
2. **Prisma Schema** (prisma/schema.prisma – Use optimized version):

   ```prisma
   // From REFACTOR_GUIDE.md – Minimal with workspaces, roles, challenges.
   generator client { provider = "prisma-client-js" }
   datasource db { provider = "postgresql" url = env("DATABASE_URL") }

   enum Role { ADMIN PARTICIPANT }

   model Workspace { id String @id @default(uuid()) @db.Uuid slug String @unique name String users User[] challenges Challenge[] }

   model User { id String @id @default(uuid()) @db.Uuid email String @unique supabaseUserId String? @unique @db.Uuid role Role workspaceId String? @db.Uuid workspace Workspace? @relation(fields: [workspaceId], references: [id]) enrollments Enrollment[] }

   model Challenge { id String @id @default(uuid()) @db.Uuid title String description String workspaceId String @db.Uuid workspace Workspace @relation(fields: [workspaceId], references: [id]) enrollments Enrollment[] }

   model Enrollment { id String @id @default(uuid()) @db.Uuid userId String @db.Uuid challengeId String @db.Uuid status String user User @relation(fields: [userId], references: [id]) challenge Challenge @relation(fields: [challengeId], references: [id]) }
   ```

   - Run: pnpm prisma db push
3. **Middleware & Routing** (middleware.ts – Path-based):

   - Implement path extraction, auth, role checks (from guide).
   - Create dynamic routes: e.g., app/w/[slug]/admin/dashboard/page.tsx (copy simplified originals).
4. **RBAC** (lib/auth/rbac.ts):

   - Enum checks; integrate in middleware/routes.
5. **Integrate Original Pages/Theme**:

   - Copy/prune as per guide (core app/, lib/, components/).
   - Apply theme: Update tailwind.config.js/globals.css with coral/terracotta.
6. **Core Flows**:

   - Auth: Supabase login/signup.
   - Workspace: Create/manage via admin.
   - Challenges: CRUD in /w/[slug]/admin/challenges.
   - Enrollment: Join/view in /w/[slug]/participant/dashboard.
7. **Test & Minimize**:

   - pnpm dev; Test flows.
   - pnpm build; Fix hangs (focus on async/types).
   - Strip more if needed (e.g., template's Redis code).

## Self-Improvement Workflow

- **Agents**: Orchestrate with task-orchestrator; hand off to specialists (e.g., TypeScript for types, security for RBAC).
- **Optimize**: If slow, add dir-specific .claude/ (e.g., src/app/CLAUDE.md for routes). Update this file for better context.
- **Quality**: Ensure DRY/YAGNI; 90% test coverage later; human-readable code.

Begin now: Implement Step 2 (schema), then 3 (middleware). Commit with messages like "feat: Add path-based workspace routing".
