import { NextRequest, NextResponse } from "next/server"
import { createClient } from "@/lib/supabase/server"
import {
  getWorkspaceBySlug,
  getUserBySupabaseId,
  createEnrollment,
  getUserEnrollments,
  getAllWorkspaceEnrollments,
  verifyWorkspaceAdmin,
  DatabaseError,
  WorkspaceAccessError,
  ResourceNotFoundError
} from "@/lib/db/queries"

export async function POST(
  request: NextRequest,
  context: { params: Promise<{ slug: string }> }
) {
  try {
    const { slug } = await context.params
    const { challengeId, userId } = await request.json()

    // Verify user is authenticated
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()
    
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    // Get workspace with validation
    const workspace = await getWorkspaceBySlug(slug)
    if (!workspace) {
      return NextResponse.json({ error: "Workspace not found" }, { status: 404 })
    }

    // Verify user belongs to workspace using standardized query
    const dbUser = await getUserBySupabaseId(user.id)
    if (!dbUser || dbUser.workspaceId !== workspace.id) {
      return NextResponse.json({ error: "Not in workspace" }, { status: 403 })
    }

    // Create enrollment using standardized query (includes validation)
    const enrollment = await createEnrollment(userId, challengeId, workspace.id)

    return NextResponse.json(enrollment)
  } catch (error) {
    console.error("Error creating enrollment:", error)
    
    if (error instanceof DatabaseError) {
      if (error.message.includes('already enrolled')) {
        return NextResponse.json({ error: "Already enrolled" }, { status: 400 })
      }
      return NextResponse.json({ error: error.message }, { status: 500 })
    }
    
    if (error instanceof WorkspaceAccessError) {
      return NextResponse.json({ error: "Access denied" }, { status: 403 })
    }
    
    if (error instanceof ResourceNotFoundError) {
      return NextResponse.json({ error: error.message }, { status: 404 })
    }
    
    return NextResponse.json(
      { error: "Failed to create enrollment" },
      { status: 500 }
    )
  }
}

export async function GET(
  request: NextRequest,
  context: { params: Promise<{ slug: string }> }
) {
  try {
    const { slug } = await context.params
    const { searchParams } = new URL(request.url)
    const userId = searchParams.get("userId")

    // Verify user is authenticated
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()
    
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    // Get workspace with validation
    const workspace = await getWorkspaceBySlug(slug)
    if (!workspace) {
      return NextResponse.json({ error: "Workspace not found" }, { status: 404 })
    }

    // Get current user to determine permissions
    const currentUser = await getUserBySupabaseId(user.id)
    if (!currentUser || currentUser.workspaceId !== workspace.id) {
      return NextResponse.json({ error: "Access denied" }, { status: 403 })
    }

    // Get enrollments using standardized query
    let enrollments
    if (userId) {
      // Get specific user's enrollments (workspace-scoped)
      enrollments = await getUserEnrollments(userId, workspace.id)
    } else {
      // Only admin users can get all workspace enrollments
      const isAdmin = await verifyWorkspaceAdmin(currentUser.id, workspace.id)
      if (!isAdmin) {
        return NextResponse.json(
          { error: "Admin access required to view all enrollments" },
          { status: 403 }
        )
      }
      enrollments = await getAllWorkspaceEnrollments(workspace.id)
    }

    return NextResponse.json(enrollments)
  } catch (error) {
    console.error("Error fetching enrollments:", error)
    
    if (error instanceof DatabaseError) {
      return NextResponse.json({ error: error.message }, { status: 500 })
    }
    
    return NextResponse.json(
      { error: "Failed to fetch enrollments" },
      { status: 500 }
    )
  }
}