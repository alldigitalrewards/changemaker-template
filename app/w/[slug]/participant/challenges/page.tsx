import { redirect } from "next/navigation"
import { createClient } from "@/lib/supabase/server"
import { prisma } from "@/lib/prisma"
import { getCurrentWorkspace, getUserWorkspaceRole } from "@/lib/workspace-context"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import EnrollButton from "./enroll-button"

export default async function ParticipantChallengesPage({ 
  params,
  searchParams 
}: { 
  params: Promise<{ slug: string }>
  searchParams: Promise<{ search?: string }>
}) {
  const { slug } = await params
  const { search } = await searchParams
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    redirect("/auth/login")
  }

  const role = await getUserWorkspaceRole(slug)
  if (!role || role !== "PARTICIPANT") {
    redirect("/workspaces")
  }

  const workspace = await getCurrentWorkspace(slug)
  if (!workspace) {
    redirect("/workspaces")
  }

  // Get user and their enrollments
  const dbUser = await prisma.user.findUnique({
    where: { supabaseUserId: user.id },
    include: {
      enrollments: {
        select: { challengeId: true }
      }
    }
  })

  const enrolledChallengeIds = dbUser?.enrollments.map(e => e.challengeId) || []

  // Get all challenges in workspace with optional search
  const challenges = await prisma.challenge.findMany({
    where: {
      workspaceId: workspace.id,
      ...(search && {
        OR: [
          { title: { contains: search, mode: "insensitive" } },
          { description: { contains: search, mode: "insensitive" } }
        ]
      })
    },
    include: {
      _count: {
        select: { enrollments: true }
      }
    }
  })

  return (
    <div className="container mx-auto py-8 px-4">
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-2">Browse Challenges</h1>
        <p className="text-gray-600">{workspace.name}</p>
      </div>

      {/* Search */}
      <Card className="mb-6">
        <CardContent className="pt-6">
          <form className="flex gap-4">
            <Input
              name="search"
              placeholder="Search challenges..."
              defaultValue={search}
              className="flex-1"
            />
            <Button type="submit">Search</Button>
            {search && (
              <Button variant="outline" asChild>
                <a href={`/w/${slug}/participant/challenges`}>Clear</a>
              </Button>
            )}
          </form>
        </CardContent>
      </Card>

      {/* Challenges Grid */}
      <div className="grid gap-6">
        {challenges.length > 0 ? (
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {challenges.map((challenge) => {
              const isEnrolled = enrolledChallengeIds.includes(challenge.id)
              
              return (
                <Card key={challenge.id} className="hover:shadow-lg transition-shadow">
                  <CardHeader>
                    <CardTitle className="text-xl">{challenge.title}</CardTitle>
                    <CardDescription className="line-clamp-2">
                      {challenge.description}
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      <div className="text-sm text-gray-600">
                        <p>{challenge._count.enrollments} participants enrolled</p>
                      </div>
                      <EnrollButton
                        challengeId={challenge.id}
                        challengeTitle={challenge.title}
                        userId={dbUser?.id || ""}
                        workspaceSlug={slug}
                        isEnrolled={isEnrolled}
                      />
                    </div>
                  </CardContent>
                </Card>
              )
            })}
          </div>
        ) : (
          <Card>
            <CardContent className="text-center py-12">
              <p className="text-gray-500">
                {search 
                  ? `No challenges found matching "${search}"`
                  : "No challenges available yet"}
              </p>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  )
}