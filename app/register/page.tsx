import { redirect } from 'next/navigation'
import { auth } from '@clerk/nextjs/server'
import { db } from '@/lib/db'
import { students } from '@/lib/db/schema'
import { eq } from 'drizzle-orm'
import { getStage2Checkpoint } from '@/lib/auth/getStudentOrRedirect'
import { getOpenStages } from '@/lib/db/queries/teams'

export const dynamic = 'force-dynamic'

export default async function RegisterPage() {
  const { userId } = await auth()

  if (!userId) {
    redirect('/sign-in')
  }

  const [[student], openStages] = await Promise.all([
    db.select().from(students).where(eq(students.clerkId, userId)).limit(1),
    getOpenStages(),
  ])

  if (!student) {
    // New student — gate stage 1
    if (!openStages[1]) redirect('/stage-locked?stage=1')
    redirect('/dashboard/apply')
  }

  const stage = student.currentStage

  // Stage 2 — check each sub-step in order using shared helper
  if (stage === '2') {
    if (!openStages[2]) redirect('/stage-locked?stage=2')

    if (!student.orientationComplete) redirect('/register/stage-2/orientation')
    if (!student.hackathonDomain)     redirect('/register/stage-2/domain')

    const { quizPassed, ideaSubmitted } = await getStage2Checkpoint(student.id)

    if (!quizPassed)    redirect('/register/stage-2/quiz')
    if (!ideaSubmitted) redirect('/register/stage-2/idea')

    // All stage 2 sub-steps complete
    if (!openStages[3]) redirect('/stage-locked?stage=3')
    redirect('/register/stage-3/engage')
  }

  const stageNum = parseInt(stage, 10)

  if (stageNum === 1 && !openStages[1]) redirect('/stage-locked?stage=1')
  if (stageNum === 3 && !openStages[3]) redirect('/stage-locked?stage=3')

  const STAGE_ROUTES: Record<string, string> = {
    '1': '/dashboard/apply',
    '3': '/register/stage-3/engage',
    '4': '/dashboard',
    '5': '/dashboard',
  }

  redirect(STAGE_ROUTES[stage] ?? '/dashboard/apply')
}
