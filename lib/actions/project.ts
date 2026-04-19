'use server'

import { auth }            from '@clerk/nextjs/server'
import { eq }              from 'drizzle-orm'
import { db }              from '@/lib/db'
import { students, projects } from '@/lib/db/schema'
import { addBadgeToStudent }  from '@/lib/db/queries/students'
import { BADGES }             from '@/lib/gamification/badges'
import { HACKATHON_START, HACKATHON_END } from '@/lib/content/programme'

export interface ProjectFormData {
  title:            string
  problemStatement: string
  solutionDesc:     string
  aiTools:          string[]
  techStack:        string
  demoVideoUrl:     string
  githubUrl?:       string
  biggestChallenge?:string
  nextSteps?:       string
}

export interface SubmitProjectResult {
  success:     boolean
  error?:      string
  badgeEarned: boolean
  projectId?:  string
}

export async function submitProjectAction(
  data: ProjectFormData,
): Promise<SubmitProjectResult> {
  const { userId } = await auth()
  if (!userId) return { success: false, error: 'Not authenticated.', badgeEarned: false }

  const now = new Date()
  if (now < HACKATHON_START || now > HACKATHON_END) {
    return { success: false, error: 'Submission window is closed.', badgeEarned: false }
  }

  // Validate required fields
  if (!data.title.trim())            return { success: false, error: 'Title is required.', badgeEarned: false }
  if (!data.problemStatement.trim()) return { success: false, error: 'Problem statement is required.', badgeEarned: false }
  if (!data.solutionDesc.trim())     return { success: false, error: 'Solution description is required.', badgeEarned: false }
  if (!data.demoVideoUrl.trim())     return { success: false, error: 'Demo video URL is required.', badgeEarned: false }

  const [student] = await db
    .select({ id: students.id, hackathonDomain: students.hackathonDomain, badges: students.badges })
    .from(students)
    .where(eq(students.clerkId, userId))
    .limit(1)

  if (!student) return { success: false, error: 'Student record not found.', badgeEarned: false }

  const domain = student.hackathonDomain ?? 'other'

  // Check for existing project
  const [existing] = await db
    .select({ id: projects.id })
    .from(projects)
    .where(eq(projects.studentId, student.id))
    .limit(1)

  let projectId: string
  const isFirstSubmission = !existing

  if (existing) {
    // Update existing
    await db
      .update(projects)
      .set({
        title:            data.title.trim(),
        problemStatement: data.problemStatement.trim(),
        solutionDesc:     data.solutionDesc.trim(),
        aiTools:          data.aiTools,
        techStack:        data.techStack.trim() || null,
        domain,
        demoVideoUrl:     data.demoVideoUrl.trim(),
        githubUrl:        data.githubUrl?.trim() || null,
        biggestChallenge: data.biggestChallenge?.trim() || null,
        nextSteps:        data.nextSteps?.trim() || null,
        submittedAt:      now,
      })
      .where(eq(projects.id, existing.id))
    projectId = existing.id
  } else {
    const [inserted] = await db
      .insert(projects)
      .values({
        studentId:        student.id,
        title:            data.title.trim(),
        problemStatement: data.problemStatement.trim(),
        solutionDesc:     data.solutionDesc.trim(),
        aiTools:          data.aiTools,
        techStack:        data.techStack.trim() || null,
        domain,
        demoVideoUrl:     data.demoVideoUrl.trim(),
        githubUrl:        data.githubUrl?.trim() || null,
        biggestChallenge: data.biggestChallenge?.trim() || null,
        nextSteps:        data.nextSteps?.trim() || null,
        submittedAt:      now,
      })
      .returning({ id: projects.id })
    projectId = inserted.id
  }

  // Award HACKER badge on first-ever submission
  let badgeEarned = false
  const existingBadges = (student.badges as string[]) ?? []
  if (isFirstSubmission && !existingBadges.includes(BADGES.HACKER.id)) {
    await addBadgeToStudent(student.id, BADGES.HACKER.id, BADGES.HACKER.xp)
    badgeEarned = true
  }

  return { success: true, badgeEarned, projectId }
}
