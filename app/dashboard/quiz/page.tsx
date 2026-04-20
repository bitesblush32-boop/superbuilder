import { redirect } from 'next/navigation'
import { desc, eq } from 'drizzle-orm'
import { db } from '@/lib/db'
import { quizAttempts } from '@/lib/db/schema'
import { getStudentOrRedirect } from '@/lib/auth/getStudentOrRedirect'
import { checkStageLock } from '@/lib/auth/stageLock'
import { QuizShell } from './_components/QuizShell'

export const metadata = {
  title: 'Domain Challenge — Super Builders',
  description: 'Test your domain knowledge. Score 6+ to unlock your spot.',
}

export default async function QuizPage() {
  const { isOpen } = await checkStageLock(3)
  if (!isOpen) redirect('/dashboard')

  const { student } = await getStudentOrRedirect(2)
  if (!student) redirect('/dashboard/apply')

  // Guard: must have completed prior sub-steps
  if (!student.orientationComplete) redirect('/dashboard/orientation')
  if (!student.hackathonDomain)     redirect('/dashboard/domain')

  // Fetch all prior attempts ordered newest-first
  const attempts = await db
    .select()
    .from(quizAttempts)
    .where(eq(quizAttempts.studentId, student.id))
    .orderBy(desc(quizAttempts.createdAt))

  const attemptCount  = attempts.length
  const hasPassed     = attempts.some(a => a.passed)
  const isLocked      = attemptCount >= 2 && !hasPassed
  const lastAttemptAt = attempts[0]?.createdAt?.toISOString() ?? null

  // Already passed — go straight to the idea form
  if (hasPassed) redirect('/dashboard/idea')

  return (
    <QuizShell
      domain={student.hackathonDomain}
      attemptCount={attemptCount}
      isLocked={isLocked}
      lastAttemptAt={lastAttemptAt}
    />
  )
}
