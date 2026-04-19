import { redirect }             from 'next/navigation'
import { getStudentOrRedirect } from '@/lib/auth/getStudentOrRedirect'
import { getTeamWithMembers }   from '@/lib/db/queries/teams'
import { DashboardShell }       from '@/components/layout/DashboardShell'

export const dynamic = 'force-dynamic'

export default async function DashboardLayout({ children }: { children: React.ReactNode }) {
  const { student } = await getStudentOrRedirect(4)
  if (!student) redirect('/register')
  if (!student.isPaid) redirect('/register/stage-3/pay')

  const team = student.teamId ? await getTeamWithMembers(student.teamId) : null

  return (
    <DashboardShell
      student={{
        id:           student.id,
        fullName:     student.fullName,
        firstName:    student.fullName.split(' ')[0],
        grade:        student.grade,
        city:         student.city ?? '',
        tier:         (student.tier ?? 'pro') as 'pro' | 'premium',
        xpPoints:     student.xpPoints,
        badges:       (student.badges as string[]) ?? [],
        currentStage: parseInt(student.currentStage, 10),
        orientationComplete: student.orientationComplete,
        hackathonDomain:     student.hackathonDomain ?? null,
        teamId:       student.teamId ?? null,
      }}
      team={team ? {
        name:        team.name,
        code:        team.code,
        memberCount: team.memberCount,
        members:     team.members.map(m => ({
          fullName: m.fullName,
          isPaid:   m.isPaid,
          teamRole: m.teamRole ?? 'member',
        })),
      } : null}
    >
      {children}
    </DashboardShell>
  )
}
