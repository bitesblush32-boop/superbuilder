import { redirect }           from 'next/navigation'
import { getStudentOrRedirect } from '@/lib/auth/getStudentOrRedirect'
import { LockedSection }        from '@/components/dashboard/LockedSection'
import { MentorCards }          from './_components/MentorCards'

export const dynamic = 'force-dynamic'

export const metadata = {
  title: 'Mentors — Super Builders',
}

export default async function MentorsPage() {
  const { student } = await getStudentOrRedirect(4)
  if (!student) redirect('/register')

  const isPremium = student.tier === 'premium'

  return (
    <div className="max-w-2xl mx-auto pb-8">
      {/* Page header */}
      <div className="px-4 pt-5 pb-2 md:px-6 md:pt-6">
        <p className="font-mono text-[11px] tracking-[0.2em] uppercase mb-1" style={{ color: 'var(--text-brand)' }}>
          Premium
        </p>
        <h1 className="font-display text-[2rem] md:text-[2.5rem] leading-none tracking-wide" style={{ color: 'var(--text-1)' }}>
          MENTORS
        </h1>
      </div>

      <div className="px-4 md:px-6 space-y-4">
        {!isPremium ? (
          <>
            {/* Premium gate */}
            <div
              className="rounded-2xl border p-6 space-y-4"
              style={{ background: 'var(--bg-card)', borderColor: 'var(--border-faint)' }}
            >
              <div
                className="w-14 h-14 rounded-xl flex items-center justify-center text-3xl border"
                style={{ background: 'var(--bg-float)', borderColor: 'var(--border-subtle)', filter: 'grayscale(0.3)' }}
              >
                🎯
              </div>

              <div>
                <p className="font-mono text-[10px] tracking-[0.2em] uppercase mb-1" style={{ color: 'var(--text-4)' }}>
                  Premium Only
                </p>
                <h2 className="font-display text-2xl tracking-wide mb-2" style={{ color: 'var(--text-2)' }}>
                  1:1 MENTORSHIP
                </h2>
                <p className="font-body text-sm leading-relaxed" style={{ color: 'var(--text-3)' }}>
                  Direct access to industry mentors is a Premium tier feature. Premium students
                  get two dedicated 30-minute sessions during the programme.
                </p>
              </div>

              <div className="space-y-2">
                {[
                  '1:1 mentor sessions (2 slots)',
                  'Mentor-reviewed prototype feedback',
                  'LinkedIn recommendation from mentor',
                  'Priority pairing with domain-matched mentor',
                ].map(item => (
                  <div key={item} className="flex items-center gap-2">
                    <span className="text-sm" style={{ color: 'var(--text-4)' }}>✕</span>
                    <span className="font-body text-sm" style={{ color: 'var(--text-4)' }}>{item}</span>
                  </div>
                ))}
              </div>

              <div
                className="rounded-xl p-4 border"
                style={{ background: 'rgba(255,184,0,0.04)', borderColor: 'rgba(255,184,0,0.12)' }}
              >
                <p className="font-body text-sm leading-relaxed" style={{ color: 'var(--text-3)' }}>
                  Tier upgrades are not available during an active programme.
                  <br />
                  <span style={{ color: 'var(--text-2)' }}>
                    Focus on building — you've got everything you need to win. 🔥
                  </span>
                </p>
              </div>
            </div>

            <LockedSection
              emoji="⭐"
              title="Mentors are for Premium"
              reason="Pro tier students have full access to all workshops, resources, and community support to build a winning project."
            />
          </>
        ) : (
          <MentorCards />
        )}
      </div>
    </div>
  )
}
