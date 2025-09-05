import { NextRequest, NextResponse } from 'next/server';
import { 
  WorkspaceApiProps, 
  ChallengeCreateRequest, 
  ChallengeListResponse,
  ChallengeCreateResponse,
  validateChallengeData,
  ApiError
} from '@/lib/types';
import { 
  getWorkspaceBySlug,
  getWorkspaceChallenges, 
  createChallenge,
  DatabaseError,
  ResourceNotFoundError 
} from '@/lib/db/queries';

export async function GET(
  request: NextRequest,
  context: { params: Promise<{ slug: string }> }
): Promise<NextResponse<ChallengeListResponse | ApiError>> {
  try {
    const { slug } = await context.params;
    
    // Get workspace with validation
    const workspace = await getWorkspaceBySlug(slug);
    if (!workspace) {
      return NextResponse.json(
        { error: 'Workspace not found' },
        { status: 404 }
      );
    }

    // Get challenges using standardized query
    const challenges = await getWorkspaceChallenges(workspace.id);

    return NextResponse.json({ challenges });
  } catch (error) {
    console.error('Error fetching challenges:', error);
    
    if (error instanceof DatabaseError) {
      return NextResponse.json(
        { error: error.message },
        { status: 500 }
      );
    }
    
    return NextResponse.json(
      { error: 'Failed to fetch challenges' },
      { status: 500 }
    );
  }
}

export async function POST(
  request: NextRequest,
  context: { params: Promise<{ slug: string }> }
): Promise<NextResponse<ChallengeCreateResponse | ApiError>> {
  try {
    const { slug } = await context.params;
    const body = await request.json();

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

    // Create challenge using standardized query
    const challenge = await createChallenge(
      { title, description },
      workspace.id
    );

    return NextResponse.json({ challenge }, { status: 201 });
  } catch (error) {
    console.error('Error creating challenge:', error);
    
    if (error instanceof DatabaseError) {
      return NextResponse.json(
        { error: error.message },
        { status: 500 }
      );
    }
    
    return NextResponse.json(
      { error: 'Failed to create challenge' },
      { status: 500 }
    );
  }
}