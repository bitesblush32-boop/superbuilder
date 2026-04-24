import { redirect }           from 'next/navigation'
import { eq, and, isNull, ne } from 'drizzle-orm'
import { db }                  from '@/lib/db'
import { students }            from '@/lib/db/schema'
import { getStudentOrRedirect } from '@/lib/auth/getStudentOrRedirect'
import { getTeamWithMembers }  from '@/lib/db/queries/teams'
import { CopyCodeButton }      from './_components/CopyCodeButton'
import { TeamActions }         from './_components/TeamActions'

export const dynamic = 'force-dynamic'

export const metadata = {
  title: 'Team — Super Builders',
}

const DOMAIN_LABELS: Record<string, string> = {
  health:         'Health',
  education:      'Education',
  finance:        'Finance',
  environment:    'Environment',
  entertainment:  'Entertainment',
  social_impact:  'Social Impact',
  other:          'Other',
}

export default async function TeamPage() {
  const { student } = await getStudentOrRedirect(2)
  if (!student) redirect('/dashboard/apply')

  const [team, potentialTeammates] = await Promise.all([
    student.teamId ? getTeamWithMembers(student.teamId) : null,
    // Only query potential teammates when solo
    !student.teamId
      ? db.select({
          id:               students.id,
          fullName:         students.fullName,
          grade:            students.grade,
          city:             students.city,
          hackathonDomain:  students.hackathonDomain,
        })
        .from(students)
        .where(and(
          isNull(students.teamId),
          ne(students.id, student.id),
          eq(students.isPaid, true),
        ))
        .limit(5)
      : Promise.resolve([]),
  ])

  // Discount rules from programme
  const paidCount     = team ? team.members.filter(m => m.isPaid).length : 0
  const discountTier  = paidCount >= 4 ? 20 : paidCount >= 3 ? 10 : 0

  return (
    <div className="max-w-2xl mx-auto pb-8">
      {/* Page header */}
      <div className="px-4 pt-5 pb-2 md:px-6 md:pt-6">
        <p className="font-mono text-[11px] tracking-[0.2em] uppercase mb-1" style={{ color: 'var(--text-brand)' }}>
          Collaboration
        </p>
        <h1 className="font-display text-[2rem] md:text-[2.5rem] leading-none tracking-wide" style={{ color: 'var(--text-1)' }}>
          TEAM
        </h1>
      </div>

      <div className="px-4 md:px-6 space-y-4">

        {team ? (
          <>
            {/* Team banner */}
            <div
              className="rounded-2xl border p-5"
              style={{ background: 'rgba(255,184,0,0.04)', borderColor: 'rgba(255,184,0,0.18)' }}
            >
              <div className="flex items-start justify-between gap-3 mb-1">
                <div>
                  <p className="font-mono text-[10px] tracking-[0.2em] uppercase mb-1" style={{ color: 'var(--text-brand)' }}>
                    Your Team
                  </p>
                  <h2 className="font-display text-2xl tracking-wide" style={{ color: 'var(--text-1)' }}>
                    {team.name}
                  </h2>
                </div>
                <div className="text-right shrink-0">
                  <p className="font-mono text-[10px] mb-1" style={{ color: 'var(--text-4)' }}>Team Code</p>
                  <CopyCodeButton code={team.code} />
                </div>
              </div>
              <p className="font-mono text-[11px]" style={{ color: 'var(--text-4)' }}>
                {team.memberCount} / {team.maxSize} members
                {team.isLocked && ' · 🔒 Locked'}
              </p>
            </div>

            {/* Discount status */}
            {discountTier > 0 && (
              <div
                className="rounded-2xl border p-4 flex items-center gap-3"
                style={{ background: 'rgba(34,197,94,0.06)', borderColor: 'rgba(34,197,94,0.2)' }}
              >
                <span className="text-xl">🎉</span>
                <div>
                  <p className="font-heading font-semibold text-sm" style={{ color: 'var(--green)' }}>
                    {discountTier}% Team Discount Unlocked
                  </p>
                  <p className="font-body text-sm" style={{ color: 'var(--text-3)' }}>
                    {paidCount} paid members — discount applied at checkout.
                  </p>
                </div>
              </div>
            )}

            {paidCount < 3 && team.memberCount < 3 && (
              <div
                className="rounded-2xl border p-4"
                style={{ background: 'var(--bg-card)', borderColor: 'var(--border-faint)' }}
              >
                <p className="font-mono text-[10px] tracking-[0.2em] uppercase mb-1" style={{ color: 'var(--text-4)' }}>
                  Team Discount
                </p>
                <p className="font-body text-sm" style={{ color: 'var(--text-3)' }}>
                  Add {3 - team.memberCount} more member{3 - team.memberCount !== 1 ? 's' : ''} to unlock 10% off.
                  Teams of 4 get 20% off.
                </p>
              </div>
            )}

            {/* Member list */}
            <div
              className="rounded-2xl border overflow-hidden"
              style={{ background: 'var(--bg-card)', borderColor: 'var(--border-faint)' }}
            >
              <div className="px-5 pt-4 pb-2">
                <p className="font-mono text-[10px] tracking-[0.2em] uppercase" style={{ color: 'var(--text-4)' }}>
                  Members
                </p>
              </div>
              <div className="divide-y" style={{ borderColor: 'var(--border-faint)' }}>
                {team.members.map(member => (
                  <div key={member.id} className="flex items-center gap-3 px-5 py-3">
                    <div
                      className="w-9 h-9 rounded-full flex items-center justify-center font-heading font-bold text-sm shrink-0"
                      style={{
                        background:  member.teamRole === 'leader' ? 'rgba(255,184,0,0.15)' : 'var(--bg-float)',
                        color:       member.teamRole === 'leader' ? 'var(--brand)' : 'var(--text-2)',
                        border:      `1px solid ${member.teamRole === 'leader' ? 'rgba(255,184,0,0.3)' : 'var(--border-subtle)'}`,
                      }}
                    >
                      {member.fullName.charAt(0).toUpperCase()}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="font-heading font-semibold text-sm truncate" style={{ color: 'var(--text-1)' }}>
                        {member.fullName.split(' ')[0]}
                        {member.id === student.id && (
                          <span className="ml-2 font-mono text-[10px]" style={{ color: 'var(--text-4)' }}>you</span>
                        )}
                      </p>
                      <p className="font-mono text-[11px]" style={{ color: 'var(--text-4)' }}>
                        Class {member.grade}{member.city ? ` · ${member.city}` : ''}
                      </p>
                    </div>
                    <div className="flex items-center gap-2 shrink-0">
                      {member.teamRole === 'leader' && (
                        <span
                          className="font-mono text-[10px] px-2 py-0.5 rounded-full"
                          style={{ background: 'rgba(255,184,0,0.12)', color: 'var(--brand)' }}
                        >
                          Leader
                        </span>
                      )}
                      <span
                        className="font-mono text-[10px] px-2 py-0.5 rounded-full"
                        style={{
                          background:  member.isPaid ? 'rgba(34,197,94,0.1)' : 'rgba(255,255,255,0.04)',
                          color:       member.isPaid ? 'var(--green)' : 'var(--text-4)',
                        }}
                      >
                        {member.isPaid ? '✓ Paid' : '⏳ Pending'}
                      </span>
                    </div>
                  </div>
                ))}

                {/* Empty slots */}
                {!team.isLocked && Array.from({ length: team.maxSize - team.memberCount }).map((_, i) => (
                  <div key={`slot-${i}`} className="flex items-center gap-3 px-5 py-3">
                    <div
                      className="w-9 h-9 rounded-full flex items-center justify-center font-display text-lg shrink-0 border border-dashed"
                      style={{ borderColor: 'var(--border-subtle)', opacity: 0.35 }}
                    >
                      +
                    </div>
                    <p className="font-body text-sm" style={{ color: 'var(--text-4)' }}>
                      Open slot — share your code to invite
                    </p>
                  </div>
                ))}
              </div>
            </div>

            {/* Share code */}
            {!team.isLocked && (
              <div
                className="rounded-2xl border p-5"
                style={{ background: 'var(--bg-card)', borderColor: 'var(--border-faint)' }}
              >
                <p className="font-mono text-[10px] tracking-[0.2em] uppercase mb-2" style={{ color: 'var(--text-4)' }}>
                  Invite Teammates
                </p>
                <p className="font-body text-sm mb-3" style={{ color: 'var(--text-3)' }}>
                  Share this code. Teammates go to Dashboard → Team → Join with Code.
                </p>
                <div
                  className="rounded-xl p-4 flex items-center justify-between gap-3"
                  style={{ background: 'var(--bg-float)', border: '1px solid var(--border-subtle)' }}
                >
                  <span className="font-mono text-2xl tracking-[0.25em]" style={{ color: 'var(--brand)' }}>
                    {team.code}
                  </span>
                  <CopyCodeButton code={team.code} showLabel />
                </div>
              </div>
            )}
          </>
        ) : (
          <>
            {/* Solo state */}
            <div
              className="rounded-2xl border p-5"
              style={{ background: 'rgba(255,184,0,0.04)', borderColor: 'rgba(255,184,0,0.18)' }}
            >
              <p className="font-mono text-[10px] tracking-[0.2em] uppercase mb-1" style={{ color: 'var(--text-brand)' }}>
                Status
              </p>
              <h2 className="font-display text-2xl tracking-wide mb-2" style={{ color: 'var(--text-1)' }}>
                YOU'RE FLYING SOLO 🦅
              </h2>
              <p className="font-body text-sm" style={{ color: 'var(--text-3)' }}>
                Teams of 3–4 unlock discounts. But solo entries are 100% welcome — plenty of solo winners out there.
              </p>
            </div>

            {/* Referral code */}
            {student.referralCode && (
              <div
                className="rounded-2xl border p-5"
                style={{ background: 'var(--bg-card)', borderColor: 'var(--border-faint)' }}
              >
                <p className="font-mono text-[10px] tracking-[0.2em] uppercase mb-2" style={{ color: 'var(--text-4)' }}>
                  Your Referral Code
                </p>
                <p className="font-body text-sm mb-3" style={{ color: 'var(--text-3)' }}>
                  Share this with friends. When they register and pay, you both get bonus XP.
                </p>
                <div
                  className="rounded-xl p-4 flex items-center justify-between gap-3"
                  style={{ background: 'var(--bg-float)', border: '1px solid var(--border-subtle)' }}
                >
                  <span className="font-mono text-xl tracking-[0.2em]" style={{ color: 'var(--brand)' }}>
                    {student.referralCode}
                  </span>
                  <CopyCodeButton code={student.referralCode} />
                </div>
              </div>
            )}

            {/* Create / Join */}
            <div
              className="rounded-2xl border p-5 space-y-3"
              style={{ background: 'var(--bg-card)', borderColor: 'var(--border-faint)' }}
            >
              <p className="font-mono text-[10px] tracking-[0.2em] uppercase" style={{ color: 'var(--text-4)' }}>
                Team Up
              </p>
              <p className="font-body text-sm" style={{ color: 'var(--text-3)' }}>
                Create a new team or join a friend's team with their code.
              </p>
              <TeamActions studentId={student.id} />
            </div>

            {/* Potential teammates */}
            {potentialTeammates.length > 0 && (
              <div
                className="rounded-2xl border overflow-hidden"
                style={{ background: 'var(--bg-card)', borderColor: 'var(--border-faint)' }}
              >
                <div className="px-5 pt-4 pb-2">
                  <p className="font-mono text-[10px] tracking-[0.2em] uppercase" style={{ color: 'var(--text-4)' }}>
                    Looking for Teammates
                  </p>
                  <p className="font-body text-xs mt-1" style={{ color: 'var(--text-4)' }}>
                    Other solo students — connect on Discord to team up
                  </p>
                </div>
                <div className="divide-y" style={{ borderColor: 'var(--border-faint)' }}>
                  {potentialTeammates.map(p => (
                    <div key={p.id} className="flex items-center gap-3 px-5 py-3">
                      <div
                        className="w-8 h-8 rounded-full flex items-center justify-center font-heading font-bold text-xs shrink-0"
                        style={{ background: 'var(--bg-float)', color: 'var(--text-3)', border: '1px solid var(--border-subtle)' }}
                      >
                        {p.fullName.charAt(0).toUpperCase()}
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="font-heading font-semibold text-sm" style={{ color: 'var(--text-1)' }}>
                          {p.fullName.split(' ')[0]}
                        </p>
                        <p className="font-mono text-[11px]" style={{ color: 'var(--text-4)' }}>
                          Class {p.grade}{p.city ? ` · ${p.city}` : ''}
                          {p.hackathonDomain ? ` · ${DOMAIN_LABELS[p.hackathonDomain] ?? p.hackathonDomain}` : ''}
                        </p>
                      </div>
                      <a
                        href="https://discord.gg/superbuilders"
                        target="_blank"
                        rel="noopener noreferrer"
                        className="min-h-[36px] px-3 rounded-xl font-mono text-[11px] border transition-all active:scale-95 shrink-0 flex items-center"
                        style={{ borderColor: 'var(--border-subtle)', color: 'var(--text-3)' }}
                      >
                        Discord
                      </a>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  )
}
