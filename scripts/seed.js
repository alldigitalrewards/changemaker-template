const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

async function main() {
  // Create a test workspace
  const workspace = await prisma.workspace.create({
    data: {
      slug: 'demo-workspace',
      name: 'Demo Workspace',
    },
  });

  // Create test users
  const adminUser = await prisma.user.create({
    data: {
      email: 'admin@demo.com',
      role: 'ADMIN',
      workspaceId: workspace.id,
    },
  });

  const participantUser = await prisma.user.create({
    data: {
      email: 'participant@demo.com',
      role: 'PARTICIPANT',
      workspaceId: workspace.id,
    },
  });

  // Create test challenges
  const challenge1 = await prisma.challenge.create({
    data: {
      title: 'Climate Action Challenge',
      description: 'Develop solutions for climate change mitigation',
      workspaceId: workspace.id,
    },
  });

  const challenge2 = await prisma.challenge.create({
    data: {
      title: 'Innovation Lab',
      description: 'Create innovative tech solutions',
      workspaceId: workspace.id,
    },
  });

  // Create enrollments
  await prisma.enrollment.create({
    data: {
      userId: participantUser.id,
      challengeId: challenge1.id,
      status: 'ACTIVE',
    },
  });

  console.log('✅ Seed data created successfully');
  console.log('Workspace:', workspace.slug);
  console.log('Users:', { adminUser: adminUser.email, participantUser: participantUser.email });
  console.log('Challenges:', [challenge1.title, challenge2.title]);
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });