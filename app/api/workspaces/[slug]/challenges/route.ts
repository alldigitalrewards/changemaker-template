import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { 
  WorkspaceApiProps, 
  ChallengeCreateRequest, 
  ChallengeListResponse,
  ChallengeCreateResponse,
  validateChallengeData,
  ApiError
} from '@/lib/types';

export async function GET(
  request: NextRequest,
  context: { params: Promise<{ slug: string }> }
): Promise<NextResponse<ChallengeListResponse | ApiError>> {
  try {
    const { slug } = await context.params;
    const workspace = await prisma.workspace.findUnique({
      where: { slug },
      include: {
        challenges: {
          orderBy: { id: 'desc' }
        }
      }
    });

    if (!workspace) {
      return NextResponse.json(
        { error: 'Workspace not found' },
        { status: 404 }
      );
    }

    return NextResponse.json({ challenges: workspace.challenges });
  } catch (error) {
    console.error('Error fetching challenges:', error);
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

    // Find workspace
    const workspace = await prisma.workspace.findUnique({
      where: { slug }
    });

    if (!workspace) {
      return NextResponse.json(
        { error: 'Workspace not found' },
        { status: 404 }
      );
    }

    // Create challenge
    const challenge = await prisma.challenge.create({
      data: {
        title,
        description,
        workspaceId: workspace.id
      }
    });

    return NextResponse.json({ challenge }, { status: 201 });
  } catch (error) {
    console.error('Error creating challenge:', error);
    return NextResponse.json(
      { error: 'Failed to create challenge' },
      { status: 500 }
    );
  }
}