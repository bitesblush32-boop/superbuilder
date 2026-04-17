import { redirect } from 'next/navigation'
import { auth } from '@clerk/nextjs/server'
import { db } from '@/lib/db'
import { students } from '@/lib/db/schema'
import { eq } from 'drizzle-orm'

export const dynamic = 'force-dynamic'

const STAGE_ROUTES: Record<string, string> = {
  '1': '/register/stage-1',
  '2': '/register/stage-2/quiz',
  '3': '/register/stage-3/engage',
  '4': '/dashboard',
  '5': '/dashboard',
}

// Redirect to the student's current stage (server-side stage gate)
export default async function RegisterPage() {
  const { userId } = await auth()

  if (!userId) {
    redirect('/sign-in')
  }

  const [student] = await db
    .select({ currentStage: students.currentStage })
    .from(students)
    .where(eq(students.clerkId, userId))
    .limit(1)

  if (!student) {
    redirect('/register/stage-1')
  }

  redirect(STAGE_ROUTES[student.currentStage] ?? '/register/stage-1')
}
