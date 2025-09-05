# Auth Flow Test Guide

## Prerequisites
1. Supabase local instance running: `pnpm supabase start`
2. Database migrated: `pnpm prisma db push` 
3. Development server running: `pnpm dev`

## Test Flow

### 1. Sign Up Flow
- Navigate to `/auth/signup`
- Enter email: `test@example.com`
- Enter password: `password123`
- Select role: `PARTICIPANT` or `ADMIN`
- Click "Create account"
- Should redirect to `/auth/login` with success message

### 2. Login Flow  
- Navigate to `/auth/login` (or should be redirected)
- Enter email: `test@example.com`
- Enter password: `password123`
- Click "Sign in" 
- Should redirect to `/workspaces`

### 3. Workspace Access
- Should see workspaces page with user email and logout button
- Create or join a workspace
- Navigate to appropriate dashboard based on role:
  - Admin: `/w/{slug}/admin/dashboard` 
  - Participant: `/w/{slug}/participant/dashboard`

### 4. Role Protection
- Try accessing admin routes as participant - should redirect
- Try accessing routes without auth - should redirect to login

### 5. Logout Flow
- Click logout button on any protected page
- Should redirect to `/auth/login`
- Try accessing protected routes - should redirect to login

## Expected Results
- [x] Signup creates Supabase user with role metadata
- [x] Login syncs user to Prisma database  
- [x] Middleware protects routes based on authentication
- [x] Role-based access control works
- [x] Path-based workspace routing functions
- [x] Session management handles login/logout correctly