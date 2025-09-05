import { type NextRequest, NextResponse } from 'next/server'
import { createServerClient } from '@supabase/ssr'

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl
  
  // List of public routes that don't need auth processing
  const publicRoutes = [
    '/',
    '/about',
    '/how-it-works',
    '/help',
    '/contact',
    '/faq',
    '/challenges',
    '/privacy',
    '/terms',
    '/auth/login',
    '/auth/signup'
  ]
  
  // Skip middleware for public routes and static assets
  if (
    publicRoutes.includes(pathname) ||
    pathname.startsWith('/_next') ||
    pathname.startsWith('/api/') ||
    pathname.includes('.') // static files
  ) {
    return NextResponse.next()
  }
  
  // Only process auth for protected routes
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
