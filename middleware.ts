import { type NextRequest, NextResponse } from 'next/server';

function extractWorkspaceSlug(pathname: string): string | null {
  // Extract workspace slug from /w/[slug] path pattern
  const workspaceMatch = pathname.match(/^\/w\/([^\/]+)/);
  return workspaceMatch ? workspaceMatch[1] : null;
}

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;
  const workspaceSlug = extractWorkspaceSlug(pathname);

  // Handle workspace routes /w/[slug]/*
  if (workspaceSlug) {
    // TODO: Add workspace validation and user authentication
    // TODO: Add role-based access control for admin routes
    
    // For now, allow all workspace routes to pass through
    return NextResponse.next();
  }

  // Handle root domain routes
  return NextResponse.next();
}

export const config = {
  matcher: [
    /*
     * Match all paths except for:
     * 1. /api routes
     * 2. /_next (Next.js internals)
     * 3. all root files inside /public (e.g. /favicon.ico)
     */
    '/((?!api|_next|[\\w-]+\\.\\w+).*)'
  ]
};
