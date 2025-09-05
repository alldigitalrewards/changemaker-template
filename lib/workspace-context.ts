import { cookies } from "next/headers"
import { prisma } from "@/lib/prisma"
import { createClient } from "@/lib/supabase/server"

export async function getCurrentWorkspace(slug: string) {
  const workspace = await prisma.workspace.findUnique({
    where: { slug },
    include: {
      _count: {
        select: {
          users: true,
          challenges: true
        }
      }
    }
  })

  return workspace
}

export async function getUserWorkspaceRole(slug: string) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) return null

  const dbUser = await prisma.user.findUnique({
    where: { supabaseUserId: user.id },
    include: {
      workspace: {
        select: { slug: true }
      }
    }
  })

  // Check if user belongs to this workspace
  if (dbUser?.workspace?.slug !== slug) {
    return null
  }

  return dbUser.role
}

export async function setWorkspaceContext(slug: string) {
  const cookieStore = await cookies()
  cookieStore.set("current-workspace", slug, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/"
  })
}

export async function getWorkspaceContext() {
  const cookieStore = await cookies()
  return cookieStore.get("current-workspace")?.value
}

export async function clearWorkspaceContext() {
  const cookieStore = await cookies()
  cookieStore.delete("current-workspace")
}