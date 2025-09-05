import { NextRequest, NextResponse } from 'next/server'
import { syncSupabaseUser } from '@/lib/auth/sync-user'
import { createClient } from '@/lib/supabase/server'

export async function POST(request: NextRequest) {
  try {
    const supabase = await createClient()
    const { data: { session } } = await supabase.auth.getSession()
    
    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    await syncSupabaseUser(session.user)
    
    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('User sync error:', error)
    return NextResponse.json({ error: 'Sync failed' }, { status: 500 })
  }
}