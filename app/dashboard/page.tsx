import { redirect }             from 'next/navigation'
import Link                      from 'next/link'
import { getStudentOrRedirect, getStage2Checkpoint } from '@/lib/auth/getStudentOrRedirect'
import { HACKATHON_START, DEMO_DAY, CERTS_LIVE } from '@/lib/content/programme'
import { HackathonCountdown }    from './_components/HackathonCountdown'
import { XPSection }             from './_components/XPSection'

export const dynamic = 'force-dynamic'

export const metadata = {
  title: 'Dashboard — Super Builders',
}

const HACK_END = new Date('2026-06-08T08:00:00+05:30')

// ─── Journey step definitions ─────────────────────────────────────────────────
// Maps from the student's actual sub-step state to a visual progress item.

interface JourneyStep {
  id:        string
  label:     string
  emoji:     string
  href:      string
  completed: boolean
  active:    boolean
  locked:    boolean
}

// ─── Page ─────────────────────────────────────────────────────────────────────

export default async function DashboardPage() {
  const { student } = await getStudentOrRedirect(2)
  if (!student) redirect('/dashboard/apply')

  const stageNum = parseInt(student.currentStage, 10)

  // Fetch sub-step completion for stage-2 students (requires DB queries)
  const checkpoint = stageNum === 2
    ? await getStage2Checkpoint(student.id)
    : null

  const firstName    = student.fullName.split(' ')[0]
  const earnedBadges = (student.badges as string[]) ?? []
  const now          = new Date()
  const isLive        = now >= HACKATHON_START && now <= HACK_END
  const isOver        = now > HACK_END
  const demoDayPassed = now > DEMO_DAY
  const certsLive     = now >= CERTS_LIVE

  // ── Build journey steps ────────────────────────────────────────────────────
  // Apply is always complete (they're on the dashboard)
  const orientDone  = stageNum > 2 || !!checkpoint?.orientationComplete
  const domainDone  = stageNum > 2 || !!checkpoint?.domainSelected
  const quizDone    = stageNum > 2 || !!checkpoint?.quizPassed
  const ideaDone    = stageNum > 2 || !!checkpoint?.ideaSubmitted
  const payDone     = student.isPaid || stageNum >= 4

  // Active = the first incomplete step
  const orientActive = !orientDone
  const domainActive = orientDone && !domainDone
  const quizActive   = domainDone && !quizDone
  const ideaActive   = quizDone   && !ideaDone
  const payActive    = ideaDone   && !payDone

  const journeySteps: JourneyStep[] = [
    {
      id: 'apply', label: 'Application', emoji: '📝',
      href: '/dashboard/apply',
      completed: true, active: false, locked: false,
    },
    {
      id: 'orient', label: 'Orientation', emoji: '🎓',
      href: '/dashboard/intro',
      completed: orientDone, active: orientActive, locked: false,
    },
    {
      id: 'domain', label: 'Domain Pick', emoji: '🎯',
      href: '/dashboard/domain',
      completed: domainDone, active: domainActive, locked: !orientDone && !orientActive,
    },
    {
      id: 'quiz', label: 'AI Quiz', emoji: '🧠',
      href: '/dashboard/quiz',
      completed: quizDone, active: quizActive, locked: !domainDone && !domainActive,
    },
    {
      id: 'idea', label: 'Idea Pitch', emoji: '💡',
      href: '/dashboard/idea',
      completed: ideaDone, active: ideaActive, locked: !quizDone && !quizActive,
    },
    {
      id: 'pay', label: 'Confirm Spot', emoji: '💳',
      href: '/dashboard/engage',
      completed: payDone, active: payActive, locked: !ideaDone && !ideaActive,
    },
    {
      id: 'build', label: 'Build & Win', emoji: '🚀',
      href: '/dashboard/workshops',
      completed: isOver, active: isLive, locked: !payDone,
    },
  ]

  // The active step drives the primary CTA
  const activeStep = journeySteps.find(s => s.active)
  const ctaLabels: Record<string, string> = {
    orient: 'Complete Intro →',
    domain: 'Pick Your Domain →',
    quiz:   'Take the AI Quiz →',
    idea:   'Launch Your Idea →',
    pay:    'Confirm & Pay →',
    build:  'View Workshops →',
  }

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
            background: 'linear-gradient(135deg, rgba(255,184,0,0.08) 0%, rgba(255,184,0,0.03) 100%)',
            border:     '1px solid rgba(255,184,0,0.2)',
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
            {student.hackathonDomain && (
              <span
                className="font-mono text-[11px] px-2.5 py-1 rounded-full capitalize"
                style={{ background: 'rgba(255,184,0,0.07)', color: 'var(--text-brand)', border: '1px solid rgba(255,184,0,0.2)' }}
              >
                {student.hackathonDomain.replace('_', ' ')}
              </span>
            )}
          </div>
        </div>

        {/* B — XP + Badge shelf */}
        <XPSection xpPoints={student.xpPoints} earnedBadgeIds={earnedBadges} />

        {/* B2 — Journey Progress (pre-payment students) */}
        {!student.isPaid && (
          <div
            className="rounded-2xl overflow-hidden"
            style={{ background: 'var(--bg-card)', border: '1px solid var(--border-faint)' }}
          >
            {/* Section header */}
            <div
              className="px-5 pt-4 pb-3 flex items-center justify-between"
              style={{ borderBottom: '1px solid var(--border-faint)' }}
            >
              <p className="font-mono text-[10px] tracking-[0.2em] uppercase" style={{ color: 'var(--text-brand)' }}>
                🗺 Your Journey
              </p>
              <p className="font-mono text-[10px]" style={{ color: 'var(--text-4)' }}>
                {journeySteps.filter(s => s.completed).length} / {journeySteps.length} done
              </p>
            </div>

            {/* Stage 1 label */}
            <div className="px-5 pt-3 pb-0">
              <span
                className="font-mono text-[9px] tracking-[0.2em] uppercase px-2 py-0.5 rounded"
                style={{ background: 'rgba(167,139,250,0.1)', color: '#A78BFA' }}
              >
                STAGE 1 — APPLY &amp; PREPARE
              </span>
            </div>

            {/* Step track — horizontal scroll on mobile */}
            <div className="px-5 py-4">
              <div className="flex items-start gap-0 overflow-x-auto scrollbar-none -mx-1 px-1 pb-1">
                {journeySteps.map((step, i) => (
                  <div key={step.id} className="flex items-start flex-shrink-0" style={{ minWidth: 0 }}>
                    {/* Step node */}
                    <div className="flex flex-col items-center gap-1.5 w-[64px]">
                      {/* Circle */}
                      <div
                        className="w-9 h-9 rounded-full flex items-center justify-center text-base transition-all"
                        style={{
                          background: step.completed
                            ? 'rgba(34,197,94,0.15)'
                            : step.active
                            ? 'rgba(255,184,0,0.18)'
                            : 'var(--bg-float)',
                          border: step.completed
                            ? '2px solid #22C55E'
                            : step.active
                            ? '2px solid var(--brand)'
                            : '2px solid var(--border-faint)',
                          boxShadow: step.active ? '0 0 12px rgba(255,184,0,0.35)' : 'none',
                          opacity: step.locked ? 0.3 : 1,
                        }}
                      >
                        {step.completed ? (
                          <span style={{ color: '#22C55E', fontSize: 14 }}>✓</span>
                        ) : (
                          <span style={{ opacity: step.locked ? 0.5 : 1 }}>{step.emoji}</span>
                        )}
                      </div>

                      {/* Label */}
                      <p
                        className="font-mono text-[9px] text-center leading-tight"
                        style={{
                          color: step.completed
                            ? '#22C55E'
                            : step.active
                            ? 'var(--brand)'
                            : 'var(--text-4)',
                          opacity: step.locked ? 0.35 : 1,
                          maxWidth: 56,
                        }}
                      >
                        {step.label}
                      </p>
                    </div>

                    {/* Connector line between steps */}
                    {i < journeySteps.length - 1 && (
                      <div
                        className="flex-shrink-0 mt-[17px] w-4"
                        style={{
                          height: 2,
                          background: step.completed
                            ? '#22C55E'
                            : 'var(--border-faint)',
                        }}
                      />
                    )}
                  </div>
                ))}
              </div>
            </div>

            {/* Active step CTA */}
            {activeStep && (
              <div
                className="px-5 pb-5 pt-1 flex flex-col gap-2"
              >
                <div
                  className="rounded-xl p-3 flex items-center gap-3"
                  style={{
                    background: 'rgba(255,184,0,0.06)',
                    border: '1px solid rgba(255,184,0,0.2)',
                  }}
                >
                  <span className="text-xl shrink-0">{activeStep.emoji}</span>
                  <div className="flex-1 min-w-0">
                    <p className="font-heading font-semibold text-sm" style={{ color: 'var(--text-1)' }}>
                      Next: {activeStep.label}
                    </p>
                    <p className="font-mono text-[11px]" style={{ color: 'var(--text-3)' }}>
                      Complete this to unlock your next badge &amp; XP
                    </p>
                  </div>
                </div>
                <Link
                  href={activeStep.href}
                  className="inline-flex items-center justify-center gap-2 min-h-[48px] w-full rounded-xl font-heading font-bold text-base tracking-wide transition-all active:scale-95"
                  style={{
                    background: 'linear-gradient(135deg, #FFB800, #FFCF40)',
                    color: '#000',
                    boxShadow: '0 0 24px rgba(255,184,0,0.25)',
                  }}
                >
                  {ctaLabels[activeStep.id] ?? `Continue →`}
                </Link>
              </div>
            )}
          </div>
        )}

        {/* C — Hackathon action (only shown once paid/stage 4+) */}
        {student.isPaid && (
          <div
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
                  {certsLive
                    ? 'Certificates are live! Download yours now.'
                    : demoDayPassed
                    ? 'Certificates go live Jul 1. Check back soon!'
                    : 'Results announced Jun 27 at Demo Day. Certificates go live Jul 1.'}
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
          </div>
        )}

        {/* C2 — Demo Day widget (paid, post-hackathon, pre-Demo Day) */}
        {student.isPaid && isOver && !demoDayPassed && (
          <div
            className="rounded-2xl p-5 border"
            style={{ background: 'rgba(192,132,252,0.06)', borderColor: 'rgba(192,132,252,0.25)' }}
          >
            <p className="font-mono text-[10px] tracking-[0.2em] uppercase mb-2" style={{ color: 'var(--purple)' }}>
              🎤 Coming Up
            </p>
            <p className="font-display text-2xl tracking-wide mb-1" style={{ color: 'var(--text-1)' }}>
              DEMO DAY — JUN 27
            </p>
            <p className="font-body text-sm mb-4" style={{ color: 'var(--text-3)' }}>
              Winners announced live on Jun 27 at 10:00 AM IST. Certificates go live Jul 1.
            </p>
            <Link
              href="/dashboard/certificate"
              className="inline-flex items-center gap-2 min-h-[44px] px-5 rounded-xl font-heading font-semibold text-sm border transition-all active:scale-95"
              style={{ borderColor: 'rgba(192,132,252,0.35)', color: 'var(--purple)' }}
            >
              📜 View Certificate Page
            </Link>
          </div>
        )}

        {/* D — Hackathon countdown + stats (paid students only) */}
        {student.isPaid && (
          <>
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
              <div className="flex flex-wrap justify-center gap-1.5 mt-2">
                {([
                  { label: 'Workshops', dates: 'Jun 3–5' },
                  { label: 'Hackathon', dates: 'Jun 7–8' },
                  { label: 'Demo Day',  dates: 'Jun 27'  },
                  { label: 'Certs',     dates: 'Jul 1'   },
                ] as const).map(({ label, dates }) => (
                  <span
                    key={label}
                    className="font-mono text-[9px] px-2 py-0.5 rounded-full border"
                    style={{ borderColor: 'var(--border-faint)', color: 'var(--text-4)' }}
                  >
                    {label}: {dates}
                  </span>
                ))}
              </div>
            </div>

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
          </>
        )}

      </div>
    </div>
  )
}
