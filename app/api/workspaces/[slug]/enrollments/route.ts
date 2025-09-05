import { NextRequest, NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import { createClient } from "@/lib/supabase/server"

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

    // Verify user belongs to workspace
    const dbUser = await prisma.user.findUnique({
      where: { id: userId },
      include: {
        workspace: {
          select: { slug: true }
        }
      }
    })

    if (dbUser?.workspace?.slug !== slug) {
      return NextResponse.json({ error: "Not in workspace" }, { status: 403 })
    }

    // Check if already enrolled
    const existingEnrollment = await prisma.enrollment.findFirst({
      where: {
        userId,
        challengeId
      }
    })

    if (existingEnrollment) {
      return NextResponse.json({ error: "Already enrolled" }, { status: 400 })
    }

    // Create enrollment
    const enrollment = await prisma.enrollment.create({
      data: {
        userId,
        challengeId,
        status: "active"
      }
    })

    return NextResponse.json(enrollment)
  } catch (error) {
    console.error("Error creating enrollment:", error)
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

    // Get workspace
    const workspace = await prisma.workspace.findUnique({
      where: { slug }
    })

    if (!workspace) {
      return NextResponse.json({ error: "Workspace not found" }, { status: 404 })
    }

    // Get enrollments
    const enrollments = await prisma.enrollment.findMany({
      where: {
        ...(userId && { userId }),
        challenge: {
          workspaceId: workspace.id
        }
      },
      include: {
        challenge: true,
        user: {
          select: {
            id: true,
            email: true
          }
        }
      }
    })

    return NextResponse.json(enrollments)
  } catch (error) {
    console.error("Error fetching enrollments:", error)
    return NextResponse.json(
      { error: "Failed to fetch enrollments" },
      { status: 500 }
    )
  }
}