import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { prisma } from '@/lib/prisma';
import { 
  ChallengeCreateRequest, 
  ChallengeCreateResponse,
  validateChallengeData,
  ApiError
} from '@/lib/types';
import { 
  getWorkspaceBySlug,
  getUserBySupabaseId,
  verifyWorkspaceAdmin,
  DatabaseError,
  WorkspaceAccessError
} from '@/lib/db/queries';

export async function PUT(
  request: NextRequest,
  context: { params: Promise<{ slug: string; id: string }> }
): Promise<NextResponse<ChallengeCreateResponse | ApiError>> {
  try {
    const { slug, id } = await context.params;
    const body = await request.json();

    // Verify authentication
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();
    
    if (!user) {
      return NextResponse.json({ error: 'Authentication required' }, { status: 401 });
    }

    // Validate input with type safety
    if (!validateChallengeData(body)) {
      return NextResponse.json(
        { error: 'Title and description are required and must be non-empty strings' },
        { status: 400 }
      );
    }

    const { title, description } = body;

    // Find workspace with validation
    const workspace = await getWorkspaceBySlug(slug);
    if (!workspace) {
      return NextResponse.json(
        { error: 'Workspace not found' },
        { status: 404 }
      );
    }

    // Verify user is admin of this workspace
    const dbUser = await getUserBySupabaseId(user.id);
    if (!dbUser || dbUser.workspaceId !== workspace.id) {
      return NextResponse.json(
        { error: 'Access denied to workspace' },
        { status: 403 }
      );
    }

    const isAdmin = await verifyWorkspaceAdmin(dbUser.id, workspace.id);
    if (!isAdmin) {
      return NextResponse.json(
        { error: 'Admin privileges required to update challenges' },
        { status: 403 }
      );
    }

    // Check if challenge exists and belongs to this workspace
    const existingChallenge = await prisma.challenge.findFirst({
      where: {
        id,
        workspaceId: workspace.id
      }
    });

    if (!existingChallenge) {
      return NextResponse.json(
        { error: 'Challenge not found' },
        { status: 404 }
      );
    }

    // Update challenge
    const challenge = await prisma.challenge.update({
      where: { id },
      data: {
        title,
        description
      },
      include: {
        enrollments: true,
        _count: {
          select: {
            enrollments: true
          }
        }
      }
    });

    return NextResponse.json({ challenge }, { status: 200 });
  } catch (error) {
    console.error('Error updating challenge:', error);
    
    if (error instanceof DatabaseError) {
      return NextResponse.json(
        { error: error.message },
        { status: 500 }
      );
    }
    
    if (error instanceof WorkspaceAccessError) {
      return NextResponse.json(
        { error: 'Access denied' },
        { status: 403 }
      );
    }
    
    return NextResponse.json(
      { error: 'Failed to update challenge' },
      { status: 500 }
    );
  }
}

export async function DELETE(
  request: NextRequest,
  context: { params: Promise<{ slug: string; id: string }> }
): Promise<NextResponse<{ message: string } | ApiError>> {
  try {
    const { slug, id } = await context.params;

    // Verify authentication
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();
    
    if (!user) {
      return NextResponse.json({ error: 'Authentication required' }, { status: 401 });
    }

    // Find workspace with validation
    const workspace = await getWorkspaceBySlug(slug);
    if (!workspace) {
      return NextResponse.json(
        { error: 'Workspace not found' },
        { status: 404 }
      );
    }

    // Verify user is admin of this workspace
    const dbUser = await getUserBySupabaseId(user.id);
    if (!dbUser || dbUser.workspaceId !== workspace.id) {
      return NextResponse.json(
        { error: 'Access denied to workspace' },
        { status: 403 }
      );
    }

    const isAdmin = await verifyWorkspaceAdmin(dbUser.id, workspace.id);
    if (!isAdmin) {
      return NextResponse.json(
        { error: 'Admin privileges required to delete challenges' },
        { status: 403 }
      );
    }

    // Check if challenge exists and belongs to this workspace
    const existingChallenge = await prisma.challenge.findFirst({
      where: {
        id,
        workspaceId: workspace.id
      },
      include: {
        enrollments: true
      }
    });

    if (!existingChallenge) {
      return NextResponse.json(
        { error: 'Challenge not found' },
        { status: 404 }
      );
    }

    // Delete enrollments first (cascading delete)
    if (existingChallenge.enrollments.length > 0) {
      await prisma.enrollment.deleteMany({
        where: {
          challengeId: id
        }
      });
    }

    // Delete the challenge
    await prisma.challenge.delete({
      where: { id }
    });

    return NextResponse.json({ message: 'Challenge deleted successfully' }, { status: 200 });
  } catch (error) {
    console.error('Error deleting challenge:', error);
    
    if (error instanceof DatabaseError) {
      return NextResponse.json(
        { error: error.message },
        { status: 500 }
      );
    }
    
    if (error instanceof WorkspaceAccessError) {
      return NextResponse.json(
        { error: 'Access denied' },
        { status: 403 }
      );
    }
    
    return NextResponse.json(
      { error: 'Failed to delete challenge' },
      { status: 500 }
    );
  }
}