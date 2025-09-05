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
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-coral-50 to-terracotta-50">
      <div className="container mx-auto py-8 px-4">
        <div className="mb-8 text-center">
          <h1 className="text-3xl font-bold mb-2 text-navy-900">Browse Challenges</h1>
          <p className="text-navy-600">{workspace.name}</p>
          <p className="text-sm text-gray-600 mt-2">Join challenges to make a positive impact and connect with your community</p>
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
                <Card key={challenge.id} className={`hover:shadow-lg transition-shadow border-l-4 ${isEnrolled ? 'border-l-coral-500 ring-1 ring-coral-200' : 'border-l-gray-200'}`}>
                  <CardHeader>
                    <div className="flex justify-between items-start">
                      <div>
                        <CardTitle className="text-xl text-navy-900">{challenge.title}</CardTitle>
                        <CardDescription className="line-clamp-2 text-gray-600">
                          {challenge.description}
                        </CardDescription>
                      </div>
                      {isEnrolled && (
                        <div className="px-2 py-1 bg-coral-100 text-coral-800 rounded-full text-xs font-medium">
                          Enrolled
                        </div>
                      )}
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      <div className="flex items-center justify-between text-sm">
                        <span className="text-gray-600">{challenge._count.enrollments} participants</span>
                        <div className="w-24 h-2 bg-gray-200 rounded-full">
                          <div 
                            className="h-2 bg-gradient-to-r from-coral-400 to-terracotta-500 rounded-full"
                            style={{width: `${Math.min((challenge._count.enrollments / 50) * 100, 100)}%`}}
                          />
                        </div>
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
    </div>
  )
}