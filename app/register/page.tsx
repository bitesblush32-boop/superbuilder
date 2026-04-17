import { redirect } from 'next/navigation'
import { auth } from '@clerk/nextjs/server'
import { db } from '@/lib/db'
import { students } from '@/lib/db/schema'
import { eq } from 'drizzle-orm'
import { getStage2Checkpoint } from '@/lib/auth/getStudentOrRedirect'

export const dynamic = 'force-dynamic'

export default async function RegisterPage() {
  const { userId } = await auth()

  if (!userId) {
    redirect('/sign-in')
  }

  const [student] = await db
    .select()
    .from(students)
    .where(eq(students.clerkId, userId))
    .limit(1)

  if (!student) {
    redirect('/register/stage-1')
  }

  const stage = student.currentStage

  // Stage 2 — check each sub-step in order using shared helper
  if (stage === '2') {
    if (!student.orientationComplete) redirect('/register/stage-2/orientation')
    if (!student.hackathonDomain)     redirect('/register/stage-2/domain')

    const { quizPassed, ideaSubmitted } = await getStage2Checkpoint(student.id)

    if (!quizPassed)    redirect('/register/stage-2/quiz')
    if (!ideaSubmitted) redirect('/register/stage-2/idea')

    // All stage 2 sub-steps complete
    redirect('/register/stage-3/engage')
  }

  const STAGE_ROUTES: Record<string, string> = {
    '1': '/register/stage-1',
    '3': '/register/stage-3/engage',
    '4': '/dashboard',
    '5': '/dashboard',
  }

  redirect(STAGE_ROUTES[stage] ?? '/register/stage-1')
}
