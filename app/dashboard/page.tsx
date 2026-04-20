import { redirect }           from 'next/navigation'
import Link                     from 'next/link'
import { getStudentOrRedirect } from '@/lib/auth/getStudentOrRedirect'
import { HACKATHON_START }      from '@/lib/content/programme'
import { HackathonCountdown }   from './_components/HackathonCountdown'
import { XPSection }            from './_components/XPSection'

export const dynamic = 'force-dynamic'

export const metadata = {
  title: 'Dashboard — Super Builders',
}

const HACK_END = new Date('2026-06-08T08:00:00+05:30')

// Next-step config per stage — shown as the primary action card
const NEXT_STEP: Record<number, { label: string; href: string; cta: string; emoji: string }> = {
  2: { label: 'Stage 2 — Learn & Quiz', href: '/register/stage-2/orientation', cta: 'Start Orientation →', emoji: '🧠' },
  3: { label: 'Stage 3 — Payment',      href: '/register/stage-3/engage',      cta: 'Continue to Payment →', emoji: '💳' },
}

export default async function DashboardPage() {
  // If no student record yet (just signed up), send them to the apply form
  // which renders Stage 1 form inside the dashboard shell
  const { student } = await getStudentOrRedirect(2)
  if (!student) redirect('/dashboard/apply')

  const firstName    = student.fullName.split(' ')[0]
  const earnedBadges = (student.badges as string[]) ?? []
  const now          = new Date()
  const isLive       = now >= HACKATHON_START && now <= HACK_END
  const isOver       = now > HACK_END

  return (
    <div className="max-w-2xl mx-auto space-y-4 pb-8">
      {/* Page header */}
      <div className="px-4 pt-5 pb-2 md:px-6 md:pt-6">
        <p className="font-mono text-[11px] tracking-[0.2em] uppercase mb-1" style={{ color: 'var(--text-brand)' }}>
          Dashboard
        </p>
        <h1 className="font-display text-[2rem] md:text-[2.5rem] leading-none tracking-wide" style={{ color: 'var(--text-1)' }}>
          OVERVIEW
        </h1>
      </div>

      <div className="px-4 md:px-6 space-y-4">

        {/* A — Welcome banner */}
        <div
          className="rounded-2xl p-5"
          style={{
            background:  'linear-gradient(135deg, rgba(255,184,0,0.08) 0%, rgba(255,184,0,0.03) 100%)',
            border:      '1px solid rgba(255,184,0,0.2)',
          }}
        >
          <p className="font-mono text-[11px] tracking-[0.18em] uppercase mb-1" style={{ color: 'var(--text-brand)' }}>
            Welcome back
          </p>
          <h2
            className="font-display leading-none tracking-wide mb-3"
            style={{ fontSize: 'clamp(1.8rem, 6vw, 2.2rem)', color: 'var(--text-1)' }}
          >
            HEY, {firstName.toUpperCase()}! 🔥
          </h2>
          <div className="flex flex-wrap gap-2">
            <span
              className="font-mono text-[11px] px-2.5 py-1 rounded-full"
              style={{ background: 'var(--bg-float)', color: 'var(--text-3)' }}
            >
              Grade {student.grade}
            </span>
            {student.city && (
              <span
                className="font-mono text-[11px] px-2.5 py-1 rounded-full"
                style={{ background: 'var(--bg-float)', color: 'var(--text-3)' }}
              >
                📍 {student.city}
              </span>
            )}
          </div>
        </div>

        {/* B — XP + Badge shelf */}
        <XPSection xpPoints={student.xpPoints} earnedBadgeIds={earnedBadges} />

        {/* B2 — Registration next step (stages 2 & 3 only) */}
        {!student.isPaid && NEXT_STEP[parseInt(student.currentStage, 10)] && (() => {
          const step = NEXT_STEP[parseInt(student.currentStage, 10)]!
          return (
            <div
              className="rounded-2xl p-5"
              style={{
                background: 'linear-gradient(135deg, rgba(255,184,0,0.10), rgba(255,184,0,0.04))',
                border: '2px solid rgba(255,184,0,0.4)',
              }}
            >
              <p className="font-mono text-[10px] tracking-[0.2em] uppercase mb-2" style={{ color: 'var(--text-brand)' }}>
                🎯 Next Step
              </p>
              <p className="font-display text-2xl tracking-wide mb-1" style={{ color: 'var(--text-1)' }}>
                {step.emoji} {step.label.toUpperCase()}
              </p>
              <p className="font-body text-sm mb-4" style={{ color: 'var(--text-3)' }}>
                Complete this step to unlock the full dashboard and hackathon access.
              </p>
              <Link
                href={step.href}
                className="inline-flex items-center gap-2 min-h-[48px] px-6 rounded-xl font-heading font-bold text-base tracking-wide transition-all active:scale-95"
                style={{ background: 'linear-gradient(135deg, #FFB800, #FFCF40)', color: '#000', boxShadow: '0 0 24px rgba(255,184,0,0.25)' }}
              >
                {step.cta}
              </Link>
            </div>
          )
        })()}

        {/* C — Hackathon action (only shown once paid/stage 4+) */}
        {student.isPaid && <div
          className="rounded-2xl p-5 border"
          style={{
            background:  isLive ? 'rgba(255,184,0,0.07)' : 'var(--bg-card)',
            borderColor: isLive ? 'rgba(255,184,0,0.35)'  : 'var(--border-subtle)',
          }}
        >
          <p className="font-mono text-[10px] tracking-[0.2em] uppercase mb-2" style={{ color: 'var(--text-brand)' }}>
            {isLive ? '🔥 Live Now' : isOver ? 'Results' : "What's Next"}
          </p>
          {isLive ? (
            <>
              <p className="font-display text-2xl tracking-wide mb-1" style={{ color: 'var(--text-1)' }}>
                HACKATHON IS LIVE!
              </p>
              <p className="font-body text-sm mb-4" style={{ color: 'var(--text-3)' }}>
                You have until Jun 8, 8:00 AM IST to submit. Build fast. Build bold.
              </p>
              <Link
                href="/dashboard/submit"
                className="inline-flex items-center gap-2 min-h-[44px] px-5 rounded-xl font-heading font-bold text-sm tracking-wide transition-all active:scale-95"
                style={{ background: 'var(--brand)', color: '#000' }}
              >
                🚀 Submit Your Project
              </Link>
            </>
          ) : isOver ? (
            <>
              <p className="font-display text-2xl tracking-wide mb-1" style={{ color: 'var(--text-1)' }}>
                HACKATHON COMPLETE 🏆
              </p>
              <p className="font-body text-sm mb-4" style={{ color: 'var(--text-3)' }}>
                Results and certificates go live Jun 9–10. Check back soon!
              </p>
              <Link
                href="/dashboard/certificate"
                className="inline-flex items-center gap-2 min-h-[44px] px-5 rounded-xl font-heading font-semibold text-sm border transition-all active:scale-95"
                style={{ borderColor: 'var(--border-soft)', color: 'var(--text-2)' }}
              >
                📜 View Certificate
              </Link>
            </>
          ) : (
            <>
              <p className="font-display text-2xl tracking-wide mb-1" style={{ color: 'var(--text-1)' }}>
                HACKATHON STARTS JUN 7
              </p>
              <p className="font-body text-sm mb-4" style={{ color: 'var(--text-3)' }}>
                Attend all 3 workshops, build your prototype, and show up ready Jun 7 at 8:00 AM IST.
              </p>
              <div className="flex flex-wrap gap-2">
                <Link
                  href="/dashboard/workshops"
                  className="inline-flex items-center gap-2 min-h-[44px] px-5 rounded-xl font-heading font-bold text-sm tracking-wide transition-all active:scale-95"
                  style={{ background: 'var(--brand)', color: '#000' }}
                >
                  🎓 View Workshops
                </Link>
                <a
                  href="https://discord.gg/superbuilders"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-2 min-h-[44px] px-5 rounded-xl font-heading font-semibold text-sm border transition-all active:scale-95"
                  style={{ borderColor: 'var(--border-soft)', color: 'var(--text-2)' }}
                >
                  💬 Join Discord
                </a>
              </div>
            </>
          )}
        </div>}

        {/* D — Hackathon countdown (paid students only) */}
        {student.isPaid && <>
        <div
          className="rounded-2xl p-5 border"
          style={{ background: 'var(--bg-card)', borderColor: 'var(--border-faint)' }}
        >
          <p className="font-mono text-[10px] tracking-[0.2em] uppercase mb-4 text-center" style={{ color: 'var(--text-4)' }}>
            {isOver ? 'Hackathon ended' : 'Hackathon starts in'}
          </p>
          {isOver ? (
            <p className="text-center font-display text-2xl tracking-wide" style={{ color: 'var(--text-2)' }}>
              SEASON 1 COMPLETE 🏆
            </p>
          ) : (
            <HackathonCountdown targetDate={HACKATHON_START.toISOString()} />
          )}
          <p className="text-center font-mono text-[11px] mt-4" style={{ color: 'var(--text-4)' }}>
            Jun 7, 8:00 AM → Jun 8, 8:00 AM IST · 24 hours
          </p>
        </div>

        {/* E — Programme stats */}
        <div className="grid grid-cols-3 gap-3">
          {[
            { value: '₹1L+',  label: 'Prize Pool' },
            { value: 'Jun 7', label: 'Hackathon'  },
            { value: '9',     label: 'Badges'     },
          ].map(({ value, label }) => (
            <div
              key={label}
              className="rounded-2xl p-4 flex flex-col items-center gap-1 border"
              style={{ background: 'var(--bg-card)', borderColor: 'var(--border-faint)' }}
            >
              <span className="font-display text-xl leading-none" style={{ color: 'var(--brand)' }}>
                {value}
              </span>
              <span className="font-mono text-[10px] text-center" style={{ color: 'var(--text-4)' }}>
                {label}
              </span>
            </div>
          ))}
        </div>

        </>}

      </div>
    </div>
  )
}
