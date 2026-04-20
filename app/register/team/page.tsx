import { redirect } from 'next/navigation'
import { auth } from '@clerk/nextjs/server'
import { getStudentByClerkId } from '@/lib/db/queries/students'
import { getTeamWithMembers } from '@/lib/db/queries/teams'
import { TeamManageClient } from './_components/TeamManageClient'

export const dynamic = 'force-dynamic'

export default async function TeamPage() {
  const { userId } = await auth()
  if (!userId) redirect('/sign-in')

  const student = await getStudentByClerkId(userId)
  if (!student) redirect('/dashboard/apply')

  // Stage 1 sub-step 3 — team building. Allow stage >= 1.
  const stageNum = parseInt(student.currentStage, 10)
  if (stageNum < 1) redirect('/dashboard/apply')

  const team = student.teamId ? await getTeamWithMembers(student.teamId) : null

  return (
    <TeamManageClient
      studentId={student.id}
      studentName={student.fullName.split(' ')[0]}
      teamRole={student.teamRole}
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
  )
}
