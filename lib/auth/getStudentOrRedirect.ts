import { auth } from '@clerk/nextjs/server'
import { redirect } from 'next/navigation'
import { db } from '@/lib/db'
import { students, quizAttempts, ideaSubmissions } from '@/lib/db/schema'
import { eq, and } from 'drizzle-orm'

export type Student = typeof students.$inferSelect

// Maps pipeline_stage enum values to where a student lands after completing each stage.
// Dashboard is now the central hub from stage 2 onward — registration sub-pages are
// reached by clicking the stage items in the sidebar, not by automatic routing.
const STAGE_ROUTES: Record<string, string> = {
  '1': '/dashboard/apply',
  '2': '/dashboard',
  '3': '/dashboard',
  '4': '/dashboard',
  '5': '/dashboard',
}

/**
 * Returns where in Stage 2 the student currently is based on sub-step completion.
 * Does NOT check quiz attempts (requires a separate DB query — handled in register/page.tsx).
 */
export function getStage2SubRoute(student: Student): string {
  if (!student.orientationComplete) return '/register/stage-2/orientation'
  if (!student.hackathonDomain)     return '/register/stage-2/domain'
  // quiz + idea sub-steps require extra queries — caller handles these
  return '/register/stage-2/quiz'
}

/**
 * Returns the Stage 2 sub-step completion state for a student.
 * Runs quiz + idea queries in parallel.
 */
export async function getStage2Checkpoint(studentId: string): Promise<{
  orientationComplete: boolean
  domainSelected:      boolean
  quizPassed:          boolean
  ideaSubmitted:       boolean
}> {
  const [student] = await db
    .select({
      orientationComplete: students.orientationComplete,
      hackathonDomain:     students.hackathonDomain,
    })
    .from(students)
    .where(eq(students.id, studentId))
    .limit(1)

  if (!student) {
    return { orientationComplete: false, domainSelected: false, quizPassed: false, ideaSubmitted: false }
  }

  const [quizRow, ideaRow] = await Promise.all([
    db.select({ passed: quizAttempts.passed })
      .from(quizAttempts)
      .where(and(eq(quizAttempts.studentId, studentId), eq(quizAttempts.passed, true)))
      .limit(1),
    db.select({ id: ideaSubmissions.id })
      .from(ideaSubmissions)
      .where(eq(ideaSubmissions.studentId, studentId))
      .limit(1),
  ])

  return {
    orientationComplete: student.orientationComplete,
    domainSelected:      !!student.hackathonDomain,
    quizPassed:          quizRow.length > 0,
    ideaSubmitted:       ideaRow.length > 0,
  }
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
    redirect('/dashboard/apply')
  }

  if (studentStageNum < requiredStage) {
    // For stage 2, route to the correct sub-step
    if (student.currentStage === '2') {
      redirect(getStage2SubRoute(student))
    }
    redirect(STAGE_ROUTES[student.currentStage] ?? '/dashboard/apply')
  }

  return { student, userId }
}
