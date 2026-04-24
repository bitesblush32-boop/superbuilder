import { redirect }             from 'next/navigation'
import { and, eq, inArray }     from 'drizzle-orm'
import { db }                   from '@/lib/db'
import { quizAttempts, ideaSubmissions } from '@/lib/db/schema'
import { getStudentOrRedirect }  from '@/lib/auth/getStudentOrRedirect'
import { checkStageLock }        from '@/lib/auth/stageLock'
import { getTeamWithMembers, getFlatPricing } from '@/lib/db/queries/teams'
import { PayPage }               from './_components/PayPage'

export const metadata = {
  title: 'Confirm & Pay — Super Builders',
  description: 'Lock in your Super Builders spot.',
}

export default async function PayPageRoute() {
  const { isOpen } = await checkStageLock(1)
  if (!isOpen) redirect('/dashboard')

  const { student } = await getStudentOrRedirect(3)
  if (!student) redirect('/dashboard/apply')

  // If student explicitly went solo (via "Go Solo" button), treat as no team
  const isEffectivelySolo = student.teamRole === 'solo'

  const [rawTeamData, pricing] = await Promise.all([
    student.teamId ? getTeamWithMembers(student.teamId) : Promise.resolve(null),
    getFlatPricing(),
  ])

  const teamData    = isEffectivelySolo ? null : rawTeamData
  const memberCount = teamData?.memberCount ?? 1
  const basePrice   = memberCount >= 2 ? pricing.priceTeam : pricing.priceSolo
  const quizDiscount = student.quizPerfect ? 500 : 0
  const priceRupees  = Math.max(999, basePrice - quizDiscount)

  // Student is in a team they created/joined but no one else has joined yet
  const isSoloInTeam = rawTeamData !== null && rawTeamData.memberCount === 1 && !isEffectivelySolo

  // Team readiness check — only when team has 2+ members
  let teamReadiness: {
    allReady: boolean
    memberStatuses: { id: string; name: string; quizPassed: boolean; ideaSubmitted: boolean }[]
  } | null = null

  if (teamData && memberCount >= 2) {
    const memberIds = teamData.members.map(m => m.id)

    const [quizPassed, ideasSubmitted] = await Promise.all([
      db
        .select({ studentId: quizAttempts.studentId })
        .from(quizAttempts)
        .where(and(inArray(quizAttempts.studentId, memberIds), eq(quizAttempts.passed, true))),
      db
        .select({ studentId: ideaSubmissions.studentId })
        .from(ideaSubmissions)
        .where(inArray(ideaSubmissions.studentId, memberIds)),
    ])

    const passedIds = new Set(quizPassed.map(r => r.studentId))
    const ideaIds   = new Set(ideasSubmitted.map(r => r.studentId))

    const memberStatuses = teamData.members.map(m => ({
      id:            m.id,
      name:          m.fullName,
      quizPassed:    passedIds.has(m.id),
      ideaSubmitted: ideaIds.has(m.id),
    }))

    teamReadiness = {
      allReady: memberStatuses.every(m => m.quizPassed && m.ideaSubmitted),
      memberStatuses,
    }
  }

  return (
    <PayPage
      studentId={student.id}
      fullName={student.fullName}
      email={student.email}
      phone={student.phone ?? ''}
      teamData={teamData}
      memberCount={memberCount}
      priceSolo={pricing.priceSolo}
      priceTeam={pricing.priceTeam}
      priceRupees={priceRupees}
      hasQuizPerfect={student.quizPerfect}
      quizDiscount={quizDiscount}
      teamReadiness={teamReadiness}
      isSoloInTeam={isSoloInTeam}
      soloTeamCode={isSoloInTeam ? (rawTeamData?.code ?? null) : null}
    />
  )
}
