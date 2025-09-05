/**
 * Database Seed Script
 * Populates the database with default workspaces, users, and mock data
 */

import { PrismaClient, Role } from '@prisma/client'
import { createClient } from '@supabase/supabase-js'
import * as dotenv from 'dotenv'

// Load environment variables
dotenv.config({ path: '.env.local' })

const prisma = new PrismaClient()

// Initialize Supabase Admin client for user creation
const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!, // You'll need to add this to .env.local
  {
    auth: {
      autoRefreshToken: false,
      persistSession: false
    }
  }
)

const DEFAULT_PASSWORD = 'Changemaker2025!'

// Workspace data
const workspaces = [
  { 
    slug: 'acme', 
    name: 'ACME Corporation'
  },
  { 
    slug: 'alldigitalrewards', 
    name: 'AllDigitalRewards'
  },
  { 
    slug: 'sharecare', 
    name: 'Sharecare'
  }
]

// Admin users (all from AllDigitalRewards)
const adminUsers = [
  { email: 'krobinson@alldigitalrewards.com', name: 'Kim Robinson' },
  { email: 'kfelke@alldigitalrewards.com', name: 'Kathryn Felke' },
  { email: 'jfelke@alldigitalrewards.com', name: 'Jack Felke' },
  { email: 'jhoughtelin@alldigitalrewards.com', name: 'Josh Houghtelin' }
]

// Participant users (domain-specific)
const participantUsers = [
  // ACME participants
  { email: 'john.doe@acme.com', name: 'John Doe', workspace: 'acme' },
  { email: 'jane.smith@acme.com', name: 'Jane Smith', workspace: 'acme' },
  { email: 'bob.wilson@acme.com', name: 'Bob Wilson', workspace: 'acme' },
  
  // AllDigitalRewards participants
  { email: 'sarah.jones@alldigitalrewards.com', name: 'Sarah Jones', workspace: 'alldigitalrewards' },
  { email: 'mike.chen@alldigitalrewards.com', name: 'Mike Chen', workspace: 'alldigitalrewards' },
  { email: 'lisa.taylor@alldigitalrewards.com', name: 'Lisa Taylor', workspace: 'alldigitalrewards' },
  
  // Sharecare participants
  { email: 'david.brown@sharecare.com', name: 'David Brown', workspace: 'sharecare' },
  { email: 'emma.davis@sharecare.com', name: 'Emma Davis', workspace: 'sharecare' },
  { email: 'alex.johnson@sharecare.com', name: 'Alex Johnson', workspace: 'sharecare' }
]

// Sample challenges
const challengeTemplates = [
  {
    title: 'Innovation Sprint 2025',
    description: 'Propose and develop innovative solutions to improve our customer experience using AI and automation.'
  },
  {
    title: 'Sustainability Challenge',
    description: 'Create initiatives to reduce our carbon footprint and promote environmental responsibility.'
  },
  {
    title: 'Wellness & Wellbeing',
    description: 'Design programs that enhance employee wellness and work-life balance.'
  },
  {
    title: 'Digital Transformation',
    description: 'Identify opportunities to digitize and streamline our business processes.'
  },
  {
    title: 'Community Outreach',
    description: 'Develop partnerships and programs that give back to our local communities.'
  }
]

async function createSupabaseUser(email: string, password: string, metadata: any = {}) {
  try {
    const { data, error } = await supabaseAdmin.auth.admin.createUser({
      email,
      password,
      email_confirm: true,
      user_metadata: metadata
    })
    
    if (error) {
      console.error(`Error creating Supabase user ${email}:`, error.message)
      return null
    }
    
    console.log(`✓ Created Supabase user: ${email}`)
    return data.user
  } catch (error) {
    console.error(`Failed to create Supabase user ${email}:`, error)
    return null
  }
}

async function seed() {
  console.log('🌱 Starting database seed...\n')

  try {
    // Clear existing data (in reverse order of dependencies)
    console.log('🧹 Cleaning existing data...')
    await prisma.enrollment.deleteMany()
    await prisma.challenge.deleteMany()
    await prisma.user.deleteMany()
    await prisma.workspace.deleteMany()
    console.log('✓ Existing data cleared\n')

    // Create workspaces
    console.log('🏢 Creating workspaces...')
    const createdWorkspaces = await Promise.all(
      workspaces.map(workspace =>
        prisma.workspace.create({
          data: workspace
        })
      )
    )
    console.log(`✓ Created ${createdWorkspaces.length} workspaces\n`)

    // Create admin users
    console.log('👤 Creating admin users...')
    for (const admin of adminUsers) {
      // Create Supabase auth user
      const supabaseUser = await createSupabaseUser(
        admin.email,
        DEFAULT_PASSWORD,
        { role: 'ADMIN', name: admin.name }
      )

      if (supabaseUser) {
        // Create Prisma user linked to AllDigitalRewards workspace
        const workspace = createdWorkspaces.find(w => w.slug === 'alldigitalrewards')
        await prisma.user.create({
          data: {
            email: admin.email,
            supabaseUserId: supabaseUser.id,
            role: Role.ADMIN,
            workspaceId: workspace?.id
          }
        })
        console.log(`✓ Created admin: ${admin.email}`)
      }
    }

    // Create participant users
    console.log('\n👥 Creating participant users...')
    for (const participant of participantUsers) {
      // Create Supabase auth user
      const supabaseUser = await createSupabaseUser(
        participant.email,
        DEFAULT_PASSWORD,
        { role: 'PARTICIPANT', name: participant.name }
      )

      if (supabaseUser) {
        // Create Prisma user linked to respective workspace
        const workspace = createdWorkspaces.find(w => w.slug === participant.workspace)
        await prisma.user.create({
          data: {
            email: participant.email,
            supabaseUserId: supabaseUser.id,
            role: Role.PARTICIPANT,
            workspaceId: workspace?.id
          }
        })
        console.log(`✓ Created participant: ${participant.email}`)
      }
    }

    // Create challenges for each workspace
    console.log('\n🎯 Creating challenges...')
    const allChallenges = []
    for (const workspace of createdWorkspaces) {
      // Create 3-5 challenges per workspace
      const numChallenges = Math.floor(Math.random() * 3) + 3
      for (let i = 0; i < numChallenges; i++) {
        const template = challengeTemplates[i % challengeTemplates.length]
        const challenge = await prisma.challenge.create({
          data: {
            title: `${template.title} - ${workspace.name}`,
            description: template.description,
            workspaceId: workspace.id
          }
        })
        allChallenges.push(challenge)
        console.log(`✓ Created challenge: ${challenge.title}`)
      }
    }

    // Create enrollments (participants in challenges)
    console.log('\n📝 Creating enrollments...')
    const participants = await prisma.user.findMany({
      where: { role: Role.PARTICIPANT }
    })

    for (const participant of participants) {
      // Enroll each participant in 1-3 challenges from their workspace
      const workspaceChallenges = allChallenges.filter(
        c => c.workspaceId === participant.workspaceId
      )
      
      const numEnrollments = Math.min(
        Math.floor(Math.random() * 3) + 1,
        workspaceChallenges.length
      )
      
      const selectedChallenges = workspaceChallenges
        .sort(() => Math.random() - 0.5)
        .slice(0, numEnrollments)

      for (const challenge of selectedChallenges) {
        await prisma.enrollment.create({
          data: {
            userId: participant.id,
            challengeId: challenge.id,
            status: ['active', 'pending', 'completed'][Math.floor(Math.random() * 3)]
          }
        })
        console.log(`✓ Enrolled ${participant.email} in challenge`)
      }
    }

    // Print summary
    console.log('\n✨ Seed completed successfully!\n')
    console.log('📊 Summary:')
    const finalWorkspaceCount = await prisma.workspace.count()
    const finalUserCount = await prisma.user.count()
    const finalChallengeCount = await prisma.challenge.count()
    const finalEnrollmentCount = await prisma.enrollment.count()
    
    console.log(`  - Workspaces: ${finalWorkspaceCount}`)
    console.log(`  - Users: ${finalUserCount} (${adminUsers.length} admins, ${participantUsers.length} participants)`)
    console.log(`  - Challenges: ${finalChallengeCount}`)
    console.log(`  - Enrollments: ${finalEnrollmentCount}`)
    
    console.log('\n🔑 Login Credentials:')
    console.log(`  Password for all users: ${DEFAULT_PASSWORD}`)
    console.log('\n  Admin accounts:')
    adminUsers.forEach(admin => {
      console.log(`    - ${admin.email}`)
    })
    console.log('\n  Sample participant accounts:')
    console.log(`    - john.doe@acme.com (ACME)`)
    console.log(`    - sarah.jones@alldigitalrewards.com (AllDigitalRewards)`)
    console.log(`    - david.brown@sharecare.com (Sharecare)`)

  } catch (error) {
    console.error('❌ Seed failed:', error)
    throw error
  } finally {
    await prisma.$disconnect()
  }
}

// Run the seed
seed()
  .catch((error) => {
    console.error('Fatal error during seeding:', error)
    process.exit(1)
  })