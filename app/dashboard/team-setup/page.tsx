import { auth }               from '@clerk/nextjs/server'
import { redirect }           from 'next/navigation'
import { db }                 from '@/lib/db'
import { students }           from '@/lib/db/schema'
import { eq }                 from 'drizzle-orm'
import { getTeamWithMembers } from '@/lib/db/queries/teams'
import { checkStageLock }     from '@/lib/auth/stageLock'
import { StageLocked }        from '@/components/stage/StageLocked'
import { TeamManageClient }   from '@/app/register/team/_components/TeamManageClient'

export const dynamic = 'force-dynamic'

export const metadata = {
  title: 'Team Setup — Super Builders',
}

export default async function DashboardTeamSetupPage() {
  const { isOpen } = await checkStageLock(1)
  if (!isOpen) return <StageLocked stageNum={1} />

  const { userId } = await auth()
  if (!userId) redirect('/sign-in')

  const [student] = await db
    .select()
    .from(students)
    .where(eq(students.clerkId, userId))
    .limit(1)

  if (!student) redirect('/dashboard/apply')

  const team = student.teamId ? await getTeamWithMembers(student.teamId) : null

  return (
    <div className="max-w-2xl mx-auto px-4 pt-5 pb-12">
      <TeamManageClient
        studentId={student.id}
        studentName={student.fullName.split(' ')[0]}
        teamRole={student.teamRole}
        referralCode={student.referralCode ?? ''}
        team={team ? {
          id:          team.id,
          name:        team.name,
          code:        team.code,
          memberCount: team.memberCount,
          maxSize:     team.maxSize,
          isLocked:    team.isLocked,
          members:     team.members.map(m => ({
            id:       m.id,
            fullName: m.fullName,
            grade:    m.grade,
            city:     m.city,
            teamRole: m.teamRole,
          })),
        } : null}
      />
    </div>
  )
}
