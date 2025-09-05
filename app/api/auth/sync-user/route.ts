import { NextRequest, NextResponse } from 'next/server'
import { syncSupabaseUser } from '@/lib/auth/sync-user'
import { createClient } from '@/lib/supabase/server'

export async function POST(request: NextRequest) {
  try {
    const supabase = await createClient()
    const { data: { session }, error: authError } = await supabase.auth.getSession()
    
    if (authError) {
      console.error('Auth error during sync:', authError)
      return NextResponse.json({ error: 'Authentication error' }, { status: 401 })
    }
    
    if (!session?.user) {
      return NextResponse.json({ error: 'No authenticated user' }, { status: 401 })
    }

    // Validate user has required fields
    if (!session.user.id || !session.user.email) {
      return NextResponse.json({ error: 'Invalid user session data' }, { status: 400 })
    }

    await syncSupabaseUser(session.user)
    
    return NextResponse.json({ 
      success: true, 
      user: {
        id: session.user.id,
        email: session.user.email,
        role: session.user.user_metadata?.role || 'PARTICIPANT'
      }
    })
  } catch (error) {
    console.error('User sync error:', error)
    
    // Return specific error messages for different failure types
    if (error instanceof Error) {
      if (error.message.includes('duplicate user')) {
        return NextResponse.json({ error: 'User already exists' }, { status: 409 })
      }
      if (error.message.includes('invalid workspace')) {
        return NextResponse.json({ error: 'Invalid workspace reference' }, { status: 400 })
      }
      if (error.message.includes('missing id or email')) {
        return NextResponse.json({ error: 'Invalid user data' }, { status: 400 })
      }
    }
    
    return NextResponse.json({ error: 'User synchronization failed' }, { status: 500 })
  }
}