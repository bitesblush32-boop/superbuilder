import { redirect } from 'next/navigation'
import { getStudentOrRedirect } from '@/lib/auth/getStudentOrRedirect'
import { checkStageLock } from '@/lib/auth/stageLock'
import { StageLocked } from '@/components/stage/StageLocked'
import { getTeamWithMembers } from '@/lib/db/queries/teams'
import { PlanSelect } from './_components/TierSelect'

export const metadata = {
  title: 'Your Plan — Super Builders',
  description: 'Review your plan and proceed to payment.',
}

export default async function PlanSelectPage() {
  const { isOpen } = await checkStageLock(3)
  if (!isOpen) return <StageLocked stageNum={3} />

  const { student } = await getStudentOrRedirect(3)
  if (!student) redirect('/register/stage-1')

  const teamData = student.teamId
    ? await getTeamWithMembers(student.teamId)
    : null

  const memberCount = Math.min(teamData?.memberCount ?? 1, 3) as 1 | 2 | 3

  return (
    <PlanSelect
      memberCount={memberCount}
      teamData={teamData ? {
        id:          teamData.id,
        name:        teamData.name,
        code:        teamData.code,
        memberCount: teamData.memberCount,
        members:     teamData.members.map(m => ({
          id:       m.id,
          fullName: m.fullName,
          grade:    m.grade ?? '',
          isPaid:   m.isPaid,
          teamRole: m.teamRole,
        })),
      } : null}
    />
  )
}
