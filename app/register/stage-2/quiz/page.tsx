import { redirect } from 'next/navigation'
import { desc } from 'drizzle-orm'
import { eq } from 'drizzle-orm'
import { db } from '@/lib/db'
import { quizAttempts } from '@/lib/db/schema'
import { getStudentOrRedirect } from '@/lib/auth/getStudentOrRedirect'
import { QuizShell } from './_components/QuizShell'

export const metadata = {
  title: 'AI Explorer Challenge — Super Builders',
  description: 'Test your AI knowledge. Score 6+ to unlock your spot.',
}

export default async function QuizPage() {
  const { student } = await getStudentOrRedirect(2)
  if (!student) redirect('/register/stage-1')

  // Fetch all prior attempts ordered newest-first
  const attempts = await db
    .select()
    .from(quizAttempts)
    .where(eq(quizAttempts.studentId, student.id))
    .orderBy(desc(quizAttempts.createdAt))

  const attemptCount   = attempts.length
  const hasPassed      = attempts.some(a => a.passed)
  const isLocked       = attemptCount >= 2 && !hasPassed
  const lastAttemptAt  = attempts[0]?.createdAt?.toISOString() ?? null

  // Already passed — go straight to the idea form
  if (hasPassed) redirect('/register/stage-2/idea')

  return (
    <QuizShell
      attemptCount={attemptCount}
      isLocked={isLocked}
      lastAttemptAt={lastAttemptAt}
    />
  )
}
