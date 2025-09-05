import { type NextRequest, NextResponse } from 'next/server'
import { createServerClient } from '@supabase/ssr'

function extractWorkspaceSlug(pathname: string): string | null {
  const workspaceMatch = pathname.match(/^\/w\/([^\/]+)/)
  return workspaceMatch ? workspaceMatch[1] : null
}

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl
  const response = NextResponse.next()
  
  // Create Supabase client
  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll()
        },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value, options }) => {
            response.cookies.set(name, value, options)
          })
        },
      },
    }
  )

  const { data: { session } } = await supabase.auth.getSession()
  
  // Public routes that don't require auth
  if (pathname.startsWith('/auth/')) {
    return response
  }

  // Require auth for workspace routes
  const workspaceSlug = extractWorkspaceSlug(pathname)
  if (workspaceSlug) {
    if (!session) {
      return NextResponse.redirect(new URL('/auth/login', request.url))
    }

    // Check admin routes require admin role
    if (pathname.includes('/admin/')) {
      // Note: Role checking would require DB query - simplified for middleware
      // Full role checking happens in route handlers
    }
  }

  return response
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
