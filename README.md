# Next.js Multi-Tenant Example

A production-ready example of a multi-tenant application built with Next.js 15, featuring custom subdomains for each tenant.

### Prerequisites

- Node.js 18.17.0 or later
- pnpm (recommended) or npm/yarn
- Upstash Redis account (for production)

### Installation

1. Clone the repository:

   ```bash
   git clone https://github.com/vercel/platforms.git
   cd platforms
   ```
2. Install dependencies:

   ```bash
   pnpm install
   ```
3. run build and seeder

   ```
   pnpm build && pnpm run seed
   ```
4. Start the development server:

   ```bash
   pnpm dev
   ```
5. Access the application:

   - Main site: http://localhost:3000
   - Admin panel: http://localhost:3000/admin
   - Tenants WIP:
     - localhost:3000/[workspace]/[org]/[role]/[resource]

## Multi-Tenant 

This application demonstrates a path-based multi-tenant architecture where:

- Each tenant gets their own workspace path:
  - `(changemaker.im/{workspace.slug}/{org.slug}) `
- The middleware handles routing requests to the correct tenant
- Data isolation
- The main domain hosts the landing pages and login interface
- Subdomains are dynamically mapped to tenant-specific content

The middleware (`middleware.ts`) intelligently detects subdomains across various environments (local development, production, and Vercel preview deployments).

### Starting Fresh with Vercel Platforms Template + Changemaker Pages/Theme

I understand your goal: Start over with a clean, bloat-free repo focused on core business logic (e.g., multi-tenant challenges, auth, user enrollment, basic dashboards), using the Vercel Platforms template as the base for multi-tenancy (subdomains, tenant isolation). We'll integrate your existing pages (routes from src/app/) and theme (Changemaker brand: coral/terracotta colors, gradients, Tailwind config) while stripping non-core elements (e.g., advanced analytics, emails, jobs, monitoring, unused deps).

This aligns with your project's rules: Unified Next.js 15 app, Supabase Auth/Prisma for DB (we'll swap the template's Redis for this), Vercel deployment. The result will be a minimal, functional multi-tenant app where organizations act as tenants (with subdomains like org1.yourdomain.com).

**Key Changes**:

- **Core Kept**: Auth (Supabase), DB (Prisma), challenges/initiatives, basic admin/participant dashboards, essential components/navigation.
- **Bloat Stripped**: Tests, emails, workers, AI integrations, advanced services (e.g., rate-limiting, audits unless critical), showcase pages.
- **Template Integration**: Use its multi-tenant middleware, admin interface, and subdomain routing. Adapt to Supabase (store tenant data in DB instead of Redis).
- **Theme/Pages**: Copy your globals.css, tailwind.config.js, and key routes/components for seamless look/feel.

This will reduce your src/ from ~1200 files to ~300-400. Let's do this step-by-step with commands (run in your shell; cwd is already set). If you want me to execute any via tool, confirm.

#### Step 1: Clone the Template and Set Up New Repo

```
# Create new dir and clone template
mkdir ../changemaker-fresh
cd ../changemaker-fresh
git clone https://github.com/vercel/platforms.git .
git remote remove origin  # Remove template remote (add your own later)
pnpm install  # Install template deps (uses pnpm, like your project)
```

#### Step 2: Copy and Integrate Core Pages/Routes from Your Repo

Focus on essentials: Auth routes, challenge/initiative pages, basic dashboards. We'll place them in the template's src/app/ structure.

```
# Copy core app/ routes (adapt paths as needed)
cp -r ../changemaker-1/src/app/{layout.tsx,page.tsx,middleware.ts} app/
cp -r ../changemaker-1/src/app/(admin) app/  # Admin core
cp -r ../changemaker-1/src/app/(participant) app/  # Participant core
cp -r ../changemaker-1/src/app/api/{auth,challenges,initiatives,enrollments,users,workspaces} app/api/  # Core APIs
```

- Manually prune bloat inside these (e.g., in app/(admin)/, remove advanced analytics routes; keep challenge creation/enrollment).

#### Step 3: Copy and Adapt Theme/Components

- **Theme**: Copy Tailwind config and CSS for Changemaker brand (coral/terracotta gradients, navy structure).
  ```
  cp ../changemaker-1/tailwind.config.js .
  cp ../changemaker-1/src/app/globals.css app/globals.css  # Or merge with template's
  ```
- **Components**: Copy essentials (e.g., navigation, cards) to template's components/ dir. Template uses shadcn/ui, which matches your rules.
  ```
  mkdir -p components/{common,admin,participant,navigation,layout}
  cp -r ../changemaker-1/src/components/{common,admin,participant,navigation,layout} components/
  ```
- Prune: Remove non-core (e.g., charts, examples). Update imports in pages to use these.

#### Step 4: Adapt Business Logic (Supabase/Prisma Instead of Redis)

- **DB Setup**: Copy Prisma schema and generate client.

  ```
  mkdir prisma
  cp -r ../changemaker-1/prisma/schema.prisma prisma/
  pnpm add @prisma/client prisma --save-dev
  pnpm prisma generate
  ```
- **Auth**: Template uses simple auth; replace with Supabase SSR.

  ```
  pnpm add @supabase/ssr @supabase/supabase-js
  cp -r ../changemaker-1/src/lib/auth lib/  # Your auth lib
  ```

  - Update middleware.ts: Merge template's subdomain logic with your Supabase auth (e.g., check tenant via Supabase query).
- **Core Logic Services**: Copy minimal services for challenges/users.

  ```
  mkdir lib/services
  cp -r ../changemaker-1/src/lib/services/{challengeService,userSyncService} lib/services/  # Add more as needed
  ```
- **Replace Redis**: In template's lib/ (e.g., tenant data), swap Redis calls for Supabase/Prisma queries (e.g., store tenants in a 'organizations' table).

#### Step 5: Minimize package.json and Install

- Edit package.json: Combine template's minimal deps with your core ones.
  ```json
  "dependencies": {
    "next": "15.3.0",
    "react": "latest",
    "react-dom": "latest",
    "@supabase/ssr": "^0.6.1",
    "@supabase/supabase-js": "^2.49.5",
    "@prisma/client": "^6.11.1",
    "tailwindcss": "^3.4.17",  // For theme
    "@radix-ui/react-*": "^latest",  // shadcn/ui
    // Add any other core (e.g., zod for validation)
  },
  "devDependencies": {
    "prisma": "^6.11.1",
    "typescript": "5.8.3"
    // eslint, etc. from template
  }
  ```
- Run: `pnpm install`

#### Step 6: Configure and Test

- Copy .env.local for Supabase/Prisma URLs.
- Adapt next.config.js: Merge any custom settings (e.g., for images or rewrites).
- Run: `pnpm prisma db push` (for local DB setup), `pnpm dev`.
- Test build: `pnpm build` – if it works, you've stripped the bloat successfully!

#### Final Touches

- **Multi-Tenancy**: Template handles subdomains; map your organizations to tenants (e.g., query Supabase for org by subdomain in middleware).
- **Theme Integration**: Update template's components/ui/ with your brand colors (e.g., extend Tailwind theme with coral/terracotta).
- **Core Logic Check**: Ensure pages like challenge creation work – add seed data via Prisma if needed.

This gives you a fresh start without bloat, leveraging the template's multi-tenancy while keeping your UI/theme. If you need me to run commands or read specific files for tweaks, let me know!

## Project Evolution Log (Discussion Summaries)
- **Refactor Goals**: Stripping bloat from original repo, adapting Vercel template to path-based multi-tenancy (/w/[slug]), focusing on minimal MVP (Supabase auth, workspaces, challenges/enrollment, 4-model schema). No extras like analytics or Redis.
- **Agent Overhaul**: Consolidated from 13 bloated agents to 5 essentials, with anti-creep rules. Considered full deletion; proposed fresh set of 4 (refactor-guardian, db-minimalist, auth-simplifier, type-enforcer) to prevent overengineering. Agents now tools, not systems.
- **Public Pages Strategy**: Integrate landing pages (home, about, etc.) as static honeypots for lead gen/waitlist. Preserve UI/UX look, strip dynamic bloat, hardcode data, add comments for originals. Execution via refactor-guardian (analysis/refactor) and task-executor (integration).
- **Key Decisions**: Prioritize static public facade for POC/showcase; keep MVP minimal behind login. Use tools like edit_file for precise changes; enforce CLAUDE.md rules to avoid scope creep.

This log tracks discussions for team alignment—update as needed.
