import { redirect }             from 'next/navigation'
import { desc }                  from 'drizzle-orm'
import { db }                    from '@/lib/db'
import { students }              from '@/lib/db/schema'
import { getStudentOrRedirect }  from '@/lib/auth/getStudentOrRedirect'
import { LeaderboardClient }     from './_components/LeaderboardClient'
import type { LeaderboardEntry } from './_components/LeaderboardClient'

export const dynamic = 'force-dynamic'

export const metadata = {
  title: 'Leaderboard — Super Builders',
}

export default async function LeaderboardPage() {
  const { student } = await getStudentOrRedirect(4)
  if (!student) redirect('/register')

  // Fetch top 50 + enough to find current student rank
  const allRanked = await db
    .select({
      id:       students.id,
      fullName: students.fullName,
      city:     students.city,
      xpPoints: students.xpPoints,
      badges:   students.badges,
      tier:     students.tier,
    })
    .from(students)
    // show all paid students — add eq(students.isPaid, true) filter when ready
    .orderBy(desc(students.xpPoints))
    .limit(500)  // enough to compute rank for current student

  const myRankIndex = allRanked.findIndex(s => s.id === student.id)
  const myRank      = myRankIndex === -1 ? allRanked.length + 1 : myRankIndex + 1

  const top50: LeaderboardEntry[] = allRanked.slice(0, 50).map((s, i) => ({
    rank:      i + 1,
    id:        s.id,
    firstName: s.fullName.split(' ')[0],
    city:      s.city ?? null,
    xpPoints:  s.xpPoints,
    badges:    (s.badges as string[]) ?? [],
    tier:      s.tier ?? null,
    isYou:     s.id === student.id,
  }))

  const myEntry: LeaderboardEntry = {
    rank:      myRank,
    id:        student.id,
    firstName: student.fullName.split(' ')[0],
    city:      student.city ?? null,
    xpPoints:  student.xpPoints,
    badges:    (student.badges as string[]) ?? [],
    tier:      student.tier ?? null,
    isYou:     true,
  }

  return (
    <div className="max-w-2xl mx-auto pb-8">
      {/* Page header */}
      <div className="px-4 pt-5 pb-2 md:px-6 md:pt-6">
        <p className="font-mono text-[11px] tracking-[0.2em] uppercase mb-1" style={{ color: 'var(--text-brand)' }}>
          Rankings
        </p>
        <div className="flex items-center gap-3">
          <h1 className="font-display text-[2rem] md:text-[2.5rem] leading-none tracking-wide" style={{ color: 'var(--text-1)' }}>
            LEADERBOARD
          </h1>
          {/* Live indicator */}
          <span className="flex items-center gap-1.5 font-mono text-[10px] px-2.5 py-1 rounded-full border" style={{ background: 'rgba(34,197,94,0.08)', borderColor: 'rgba(34,197,94,0.25)', color: 'var(--green)' }}>
            <span className="w-1.5 h-1.5 rounded-full animate-pulse" style={{ background: 'var(--green)' }} />
            LIVE
          </span>
        </div>
      </div>

      <div className="px-4 md:px-6">
        {top50.length === 0 ? (
          <div
            className="rounded-2xl border p-10 flex flex-col items-center gap-3 text-center"
            style={{ background: 'var(--bg-card)', borderColor: 'var(--border-faint)' }}
          >
            <span className="text-4xl">🏆</span>
            <p className="font-display text-xl tracking-wide" style={{ color: 'var(--text-2)' }}>
              LEADERBOARD EMPTY
            </p>
            <p className="font-body text-sm" style={{ color: 'var(--text-4)' }}>
              Be the first on the board. Earn XP by completing workshops and submitting your project.
            </p>
          </div>
        ) : (
          <LeaderboardClient initialRows={top50} myEntry={myEntry} />
        )}
      </div>
    </div>
  )
}
