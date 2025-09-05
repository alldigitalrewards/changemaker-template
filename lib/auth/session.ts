import { createClient } from '@/lib/supabase/server'
import { prisma } from '@/lib/prisma'
import { type User } from '@prisma/client'

export async function getSession() {
  try {
    const supabase = await createClient()
    const { data: { session }, error } = await supabase.auth.getSession()
    
    if (error || !session) {
      return null
    }
    
    return session
  } catch (error) {
    console.error('Failed to get session:', error)
    return null
  }
}

export async function getCurrentUser(): Promise<User | null> {
  try {
    const session = await getSession()
    if (!session?.user) return null

    const user = await prisma.user.findUnique({
      where: { supabaseUserId: session.user.id }
    })

    return user
  } catch (error) {
    console.error('Failed to get current user:', error)
    return null
  }
}

export async function requireAuth() {
  const user = await getCurrentUser()
  if (!user) {
    throw new Error('Authentication required')
  }
  return user
}

export async function requireWorkspaceAccess(workspaceSlug: string) {
  const user = await requireAuth()
  
  if (!user.workspaceId) {
    throw new Error('User not assigned to workspace')
  }
  
  const workspace = await prisma.workspace.findUnique({
    where: { id: user.workspaceId }
  })
  
  if (!workspace || workspace.slug !== workspaceSlug) {
    throw new Error('Workspace access denied')
  }
  
  return { user, workspace }
}