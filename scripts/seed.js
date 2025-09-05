const { PrismaClient } = require('@prisma/client');
const { execSync } = require('child_process');

const prisma = new PrismaClient();

// Check if Docker is running
function checkDockerRunning() {
  try {
    execSync('docker info', { stdio: 'ignore' });
    return true;
  } catch (error) {
    return false;
  }
}

// Check if Supabase is running
function checkSupabaseStatus() {
  try {
    const result = execSync('supabase status', { encoding: 'utf-8' });
    return !result.includes('supabase is not running') && !result.includes('Cannot connect to the Docker daemon');
  } catch (error) {
    return false;
  }
}

// Start Supabase if not running
async function ensureSupabaseRunning() {
  console.log('Checking Docker status...');
  
  if (!checkDockerRunning()) {
    console.error('Docker is not running. Please start Docker Desktop and try again.');
    console.log('On macOS: open -a Docker');
    process.exit(1);
  }
  
  console.log('Checking Supabase status...');
  
  if (!checkSupabaseStatus()) {
    console.log('Starting Supabase...');
    try {
      execSync('supabase start', { stdio: 'inherit' });
      console.log('Supabase started successfully');
    } catch (error) {
      console.error('Failed to start Supabase:', error.message);
      console.error('Please run "supabase start" manually and try again.');
      process.exit(1);
    }
  } else {
    console.log('Supabase is already running');
  }
}

async function main() {
  // Ensure Supabase is running before seeding
  await ensureSupabaseRunning();
  
  // Check if demo workspace already exists
  const existingWorkspace = await prisma.workspace.findUnique({
    where: { slug: 'demo-workspace' }
  });
  
  if (existingWorkspace) {
    console.log('Demo workspace already exists. Skipping seed.');
    console.log('To reseed, delete the existing data first.');
    return;
  }
  
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

  console.log('Seed data created successfully');
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