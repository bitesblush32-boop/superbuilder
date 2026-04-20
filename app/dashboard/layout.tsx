import { redirect }             from 'next/navigation'
import { auth }                 from '@clerk/nextjs/server'
import { db }                   from '@/lib/db'
import { students, parents, quizAttempts, ideaSubmissions } from '@/lib/db/schema'
import { eq, and }              from 'drizzle-orm'
import { getTeamWithMembers, getOpenStages } from '@/lib/db/queries/teams'
import { DashboardShell }       from '@/components/layout/DashboardShell'

export const dynamic = 'force-dynamic'

// Blank progress used when student hasn't submitted Stage 1 yet
const EMPTY_PROGRESS = {
  s1_personal: false, s1_parents: false, s1_team: false,
  s2_orientation: false, s2_domain: false, s2_quiz: false, s2_idea: false,
  s3_paid: false, s5_cert: false,
}

export default async function DashboardLayout({ children }: { children: React.ReactNode }) {
  const { userId } = await auth()
  if (!userId) redirect('/sign-in')

  const [[student], openStages] = await Promise.all([
    db.select().from(students).where(eq(students.clerkId, userId)).limit(1),
    getOpenStages(),
  ])

  // No student record yet — show the dashboard shell with Stage 1 active.
  // /dashboard/apply page will render the Stage 1 form inside.
  if (!student) {
    return (
      <DashboardShell
        student={{
          id: '', fullName: 'Builder', firstName: 'Builder',
          grade: '10', city: '', tier: 'pro',
          xpPoints: 0, badges: [], currentStage: 1,
          orientationComplete: false, hackathonDomain: null,
          teamId: null, teamRole: null, certificateUrl: null,
        }}
        progress={EMPTY_PROGRESS}
        stageLocks={openStages}
        team={null}
      >
        {children}
      </DashboardShell>
    )
  }

  // Gather all sub-step completion data in one parallel batch
  const [parentRow, quizRow, ideaRow] = await Promise.all([
    db.select({ id: parents.id })
      .from(parents)
      .where(eq(parents.studentId, student.id))
      .limit(1),
    db.select({ passed: quizAttempts.passed })
      .from(quizAttempts)
      .where(and(eq(quizAttempts.studentId, student.id), eq(quizAttempts.passed, true)))
      .limit(1),
    db.select({ id: ideaSubmissions.id })
      .from(ideaSubmissions)
      .where(eq(ideaSubmissions.studentId, student.id))
      .limit(1),
  ])

  const team = student.teamId ? await getTeamWithMembers(student.teamId) : null

  const progress = {
    s1_personal:    true,
    s1_parents:     parentRow.length > 0,
    s1_team:        student.teamRole !== null,
    s2_orientation: student.orientationComplete,
    s2_domain:      !!student.hackathonDomain,
    s2_quiz:        quizRow.length > 0,
    s2_idea:        ideaRow.length > 0,
    s3_paid:        student.isPaid,
    s5_cert:        !!student.certificateUrl,
  }

  return (
    <DashboardShell
      student={{
        id:                  student.id,
        fullName:            student.fullName,
        firstName:           student.fullName.split(' ')[0],
        grade:               student.grade,
        city:                student.city ?? '',
        tier:                (student.tier ?? 'pro') as 'pro' | 'premium',
        xpPoints:            student.xpPoints,
        badges:              (student.badges as string[]) ?? [],
        currentStage:        parseInt(student.currentStage, 10),
        orientationComplete: student.orientationComplete,
        hackathonDomain:     student.hackathonDomain ?? null,
        teamId:              student.teamId ?? null,
        teamRole:            student.teamRole ?? null,
        certificateUrl:      student.certificateUrl ?? null,
      }}
      progress={progress}
      stageLocks={openStages}
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
