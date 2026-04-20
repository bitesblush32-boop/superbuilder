import { redirect } from 'next/navigation'
import { getStudentOrRedirect } from '@/lib/auth/getStudentOrRedirect'
import { checkStageLock } from '@/lib/auth/stageLock'
import { StageLocked } from '@/components/stage/StageLocked'
import { getTeamWithMembers, getTeamDiscounts } from '@/lib/db/queries/teams'
import { PayPage } from './_components/PayPage'

export const metadata = {
  title: 'Confirm & Pay — Super Builders',
  description: 'Lock in your Super Builders spot.',
}

export default async function PayPageRoute() {
  const { isOpen } = await checkStageLock(3)
  if (!isOpen) return <StageLocked stageNum={3} />

  const { student } = await getStudentOrRedirect(3)
  if (!student) redirect('/dashboard/apply')

  const [teamData, discounts] = await Promise.all([
    student.teamId ? getTeamWithMembers(student.teamId) : Promise.resolve(null),
    getTeamDiscounts(),
  ])

  const memberCount  = teamData?.memberCount ?? 1
  const discountPct  = memberCount >= 4 ? discounts.team4
                     : memberCount >= 3 ? discounts.team3
                     : 0

  return (
    <PayPage
      studentId={student.id}
      fullName={student.fullName}
      email={student.email}
      phone={student.phone ?? ''}
      defaultTier={(student.tier as 'pro' | 'premium' | null) ?? null}
      teamData={teamData}
      discountPct={discountPct}
    />
  )
}
