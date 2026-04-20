import { auth }           from '@clerk/nextjs/server'
import { redirect }       from 'next/navigation'
import { db }             from '@/lib/db'
import { students }       from '@/lib/db/schema'
import { eq }             from 'drizzle-orm'
import { checkStageLock } from '@/lib/auth/stageLock'
import { StageLocked }    from '@/components/stage/StageLocked'
import { Stage1Form }     from '@/app/register/stage-1/_components/Stage1Form'

export const dynamic = 'force-dynamic'

export const metadata = {
  title: 'Apply — Super Builders',
  description: 'Start your Super Builders application. Takes about 5 minutes.',
}

export default async function DashboardApplyPage() {
  const { isOpen } = await checkStageLock(1)
  if (!isOpen) return <StageLocked stageNum={1} />

  const { userId } = await auth()
  if (!userId) redirect('/sign-in')

  // If student has already submitted Stage 1, redirect to dashboard overview
  const [student] = await db
    .select({ currentStage: students.currentStage })
    .from(students)
    .where(eq(students.clerkId, userId))
    .limit(1)

  if (student && parseInt(student.currentStage, 10) > 1) {
    redirect('/dashboard')
  }

  return (
    <div className="max-w-2xl mx-auto px-4 pt-5 pb-12">
      <Stage1Form />
    </div>
  )
}
