import { type NextRequest, NextResponse } from 'next/server'
import { createServerClient } from '@supabase/ssr'

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl
  let response = NextResponse.next()
  
  // Create Supabase client
  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() { return request.cookies.getAll() },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value, options }) => {
            response.cookies.set(name, value, options)
          })
        },
      },
    }
  )

  try {
    const { data: { session }, error } = await supabase.auth.getSession()
    
    // Handle auth errors
    if (error) {
      console.error('Auth error in middleware:', error)
    }
    
    // Public routes that don't require auth
    if (pathname === '/' || pathname.startsWith('/auth/') || pathname.startsWith('/how-it-works') || pathname.startsWith('/about')) {
      // If authenticated and visiting auth pages, redirect to workspaces
      if (session && (pathname === '/auth/login' || pathname === '/auth/signup')) {
        return NextResponse.redirect(new URL('/workspaces', request.url))
      }
      return response
    }

    // Require authentication for protected routes
    if (!session) {
      return NextResponse.redirect(new URL('/auth/login', request.url))
    }

    // Get user role from session metadata (basic role check)
    const userRole = session.user?.user_metadata?.role
    
    // Workspace slug extraction
    const slugMatch = pathname.match(/^\/w\/([^\/]+)/)
    const slug = slugMatch?.[1]

    if (slug) {
      // Role-based route protection within workspaces
      if (pathname.includes('/admin/') && userRole !== 'ADMIN') {
        return NextResponse.redirect(new URL(`/w/${slug}/participant/dashboard`, request.url))
      }
      
      if (pathname.includes('/participant/') && !userRole) {
        return NextResponse.redirect(new URL('/auth/login', request.url))
      }
    }

    return response
  } catch (error) {
    console.error('Middleware error:', error)
    return NextResponse.redirect(new URL('/auth/login', request.url))
  }
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
