import { auth } from '@clerk/nextjs/server'
import { redirect } from 'next/navigation'
import { db } from '@/lib/db'
import { students } from '@/lib/db/schema'
import { eq } from 'drizzle-orm'

export type Student = typeof students.$inferSelect

// Maps pipeline_stage enum values to the first page of that stage
const STAGE_ROUTES: Record<string, string> = {
  '1': '/register/stage-1',
  '2': '/register/stage-2/quiz',
  '3': '/register/stage-3/engage',
  '4': '/dashboard',
  '5': '/dashboard',
}

/**
 * Server-side stage gate.
 *
 * - Requires Clerk auth (redirects to /sign-in if unauthenticated).
 * - If requiredStage === 1: returns student (may be null for first-time visitors).
 * - If requiredStage > 1: redirects to the student's current stage if they
 *   haven't reached requiredStage yet.
 *
 * Usage (in a Server Component or Server Action):
 *   const { student, userId } = await getStudentOrRedirect(2)
 */
export async function getStudentOrRedirect(requiredStage: number): Promise<{
  student: Student | null
  userId: string
}> {
  const { userId } = await auth()

  if (!userId) {
    redirect('/sign-in')
  }

  const [student] = await db
    .select()
    .from(students)
    .where(eq(students.clerkId, userId))
    .limit(1)

  const studentStageNum = student ? parseInt(student.currentStage, 10) : 0

  // Stage 1 — student may not exist yet (pre-registration)
  if (requiredStage === 1) {
    // If already past stage 1, send them to their current stage
    if (student && studentStageNum > 1) {
      redirect(STAGE_ROUTES[student.currentStage] ?? '/register')
    }
    return { student: student ?? null, userId }
  }

  // Stage 2+ — student must exist and be at or past requiredStage
  if (!student) {
    redirect('/register/stage-1')
  }

  if (studentStageNum < requiredStage) {
    redirect(STAGE_ROUTES[student.currentStage] ?? '/register/stage-1')
  }

  return { student, userId }
}
