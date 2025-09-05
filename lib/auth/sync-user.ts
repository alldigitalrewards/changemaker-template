import { prisma } from '@/lib/prisma'
import { type User } from '@supabase/supabase-js'
import { type Role } from '@prisma/client'

export async function syncSupabaseUser(supabaseUser: User): Promise<void> {
  try {
    const role = (supabaseUser.user_metadata?.role as Role) || 'PARTICIPANT'
    
    await prisma.user.upsert({
      where: { supabaseUserId: supabaseUser.id },
      update: {
        email: supabaseUser.email!,
      },
      create: {
        supabaseUserId: supabaseUser.id,
        email: supabaseUser.email!,
        role,
      }
    })
  } catch (error) {
    console.error('Failed to sync Supabase user to Prisma:', error)
    throw new Error('User sync failed')
  }
}

export async function ensureUserExists(supabaseUserId: string): Promise<boolean> {
  try {
    const user = await prisma.user.findUnique({
      where: { supabaseUserId }
    })
    
    return user !== null
  } catch (error) {
    console.error('Failed to check user existence:', error)
    return false
  }
}