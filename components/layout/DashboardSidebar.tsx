'use client'

import Link            from 'next/link'
import { usePathname } from 'next/navigation'
import { motion }      from 'framer-motion'
import { useClerk }    from '@clerk/nextjs'
import { LogOut }      from 'lucide-react'
import type { StudentData, TeamData } from './DashboardShell'

// ── Stage progress rail ─────────────────────────────────────────────────────

const PIPELINE_STAGES = [
  { num: 1, label: 'Apply',        emoji: '📝', description: 'Application submitted'    },
  { num: 2, label: 'Learn & Quiz', emoji: '🧠', description: 'Orientation → Quiz → Idea' },
  { num: 3, label: 'Pay',          emoji: '💳', description: 'Tier selected + payment'  },
  { num: 4, label: 'Build',        emoji: '🚀', description: 'Workshops + hackathon'    },
  { num: 5, label: 'Celebrate',    emoji: '🏆', description: 'Certificates + prizes'    },
]

function StageProgressRail({ currentStage }: { currentStage: number }) {
  const fillFraction = Math.max(0, (currentStage - 1) / (PIPELINE_STAGES.length - 1))

  return (
    <div className="px-4 py-5">
      <p
        className="font-mono text-[10px] tracking-[0.2em] uppercase mb-4"
        style={{ color: 'var(--text-4)' }}
      >
        Your Journey
      </p>

      <div className="relative flex flex-col gap-0">
        {/* Background connector line */}
        <div
          className="absolute left-[15px] top-[16px] bottom-[16px] w-px"
          style={{ background: 'var(--border-faint)' }}
          aria-hidden="true"
        />

        {/* Gold progress fill — scales from top */}
        <motion.div
          className="absolute left-[15px] top-[16px] bottom-[16px] w-px origin-top"
          style={{
            background: 'linear-gradient(to bottom, var(--brand), rgba(255,184,0,0.3))',
            willChange: 'transform',
          }}
          initial={{ scaleY: 0 }}
          animate={{ scaleY: fillFraction }}
          transition={{ duration: 1.2, ease: [0.16, 1, 0.3, 1], delay: 0.2 }}
          aria-hidden="true"
        />

        {PIPELINE_STAGES.map((stage) => {
          const isDone   = stage.num < currentStage
          const isActive = stage.num === currentStage
          const isLocked = stage.num > currentStage

          return (
            <div key={stage.num} className="relative flex items-start gap-3 py-2.5">
              {/* Stage dot */}
              <div className="relative z-10 shrink-0 mt-0.5">
                <motion.div
                  className="w-[30px] h-[30px] rounded-full flex items-center justify-center text-sm font-bold border-2"
                  style={{
                    background:  isDone   ? 'var(--brand)'
                               : isActive ? 'var(--bg-base)'
                               :            'var(--bg-float)',
                    borderColor: isDone   ? 'var(--brand)'
                               : isActive ? 'var(--brand)'
                               :            'var(--border-faint)',
                    color:       isDone   ? '#000'
                               : isActive ? 'var(--brand)'
                               :            'var(--text-4)',
                    boxShadow:   isActive ? '0 0 12px rgba(255,184,0,0.5)' : 'none',
                  }}
                  animate={isActive ? { scale: [1, 1.05, 1] } : {}}
                  transition={isActive ? { duration: 2.4, repeat: Infinity, ease: 'easeInOut' } : {}}
                >
                  {isDone ? '✓' : stage.emoji}
                </motion.div>

                {/* Active ring pulse */}
                {isActive && (
                  <motion.div
                    className="absolute inset-0 rounded-full border-2"
                    style={{ borderColor: 'rgba(255,184,0,0.4)' }}
                    initial={{ scale: 1, opacity: 0.6 }}
                    animate={{ scale: 1.7, opacity: 0 }}
                    transition={{ duration: 1.8, repeat: Infinity, ease: 'easeOut' }}
                  />
                )}
              </div>

              {/* Text */}
              <div className="flex-1 min-w-0 pt-0.5">
                <p
                  className="font-heading font-semibold text-[13px] leading-tight"
                  style={{
                    color: isDone   ? 'var(--text-brand)'
                         : isActive ? 'var(--text-1)'
                         :            'var(--text-4)',
                  }}
                >
                  {stage.label}
                </p>
                <p
                  className="font-body text-[11px] mt-0.5 leading-tight"
                  style={{ color: isLocked ? 'var(--text-4)' : 'var(--text-3)' }}
                >
                  {isActive ? '← You are here'
                   : isDone ? stage.description
                   :          '🔒 Locked'}
                </p>
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
}

// ── Nav links ───────────────────────────────────────────────────────────────

const NAV_LINKS = [
  { href: '/dashboard',             label: 'Overview',    emoji: '🏠' },
  { href: '/dashboard/workshops',   label: 'Workshops',   emoji: '🎓' },
  { href: '/dashboard/mentors',     label: 'Mentors',     emoji: '👤', premiumOnly: true },
  { href: '/dashboard/team',        label: 'My Team',     emoji: '🤝' },
  { href: '/dashboard/leaderboard', label: 'Leaderboard', emoji: '🏆' },
  { href: '/dashboard/submit',      label: 'Submit',      emoji: '🚀' },
  { href: '/dashboard/certificate', label: 'Certificate', emoji: '📜' },
] as const

function NavLinks({ tier }: { tier: 'pro' | 'premium' }) {
  const pathname = usePathname()

  return (
    <nav className="px-3 py-2 flex flex-col gap-0.5" aria-label="Dashboard navigation">
      {NAV_LINKS.map(link => {
        const isActive = pathname === link.href ||
          (link.href !== '/dashboard' && pathname.startsWith(link.href))
        const isLocked = 'premiumOnly' in link && link.premiumOnly && tier !== 'premium'

        return (
          <Link
            key={link.href}
            href={link.href}
            className="flex items-center gap-3 px-3 min-h-[44px] rounded-xl transition-all duration-150 active:scale-[0.98]"
            style={{
              background:  isActive ? 'var(--brand-subtle)' : 'transparent',
              color:       isActive ? 'var(--text-brand)'   : isLocked ? 'var(--text-4)' : 'var(--text-3)',
              borderLeft:  isActive ? '2px solid var(--brand)' : '2px solid transparent',
            }}
          >
            <span className="text-base leading-none">{link.emoji}</span>
            <span className="font-body font-medium text-sm">{link.label}</span>
            {isLocked && (
              <span
                className="ml-auto font-mono text-[10px] px-1.5 py-0.5 rounded"
                style={{ background: 'var(--bg-float)', color: 'var(--text-4)' }}
              >
                ⭐ Premium
              </span>
            )}
          </Link>
        )
      })}
    </nav>
  )
}

// ── XP bar footer ───────────────────────────────────────────────────────────

// Cumulative XP thresholds at each badge unlock
const XP_THRESHOLDS = [0, 50, 150, 350, 550, 750, 1050, 1350, 1850]

function XPBarFooter({
  xpPoints,
  fullName,
  tier,
  firstName,
}: {
  xpPoints:  number
  fullName:  string
  tier:      string
  firstName: string
}) {
  const { signOut } = useClerk()

  const nextThreshold = XP_THRESHOLDS.find(t => t > xpPoints) ?? 2000
  const prevThreshold = [...XP_THRESHOLDS].reverse().find(t => t <= xpPoints) ?? 0
  const pct = prevThreshold === nextThreshold
    ? 1
    : (xpPoints - prevThreshold) / (nextThreshold - prevThreshold)

  const initials = fullName
    .split(' ')
    .map(w => w[0])
    .join('')
    .slice(0, 2)
    .toUpperCase()

  return (
    <div className="mt-auto border-t" style={{ borderColor: 'var(--border-faint)' }}>
      {/* XP bar */}
      <div className="px-4 pt-4 pb-3">
        <div className="flex items-center justify-between mb-1.5">
          <span className="font-mono text-[11px]" style={{ color: 'var(--text-3)' }}>
            ⚡ {xpPoints.toLocaleString('en-IN')} XP
          </span>
          <span className="font-mono text-[11px]" style={{ color: 'var(--text-4)' }}>
            Next: {nextThreshold.toLocaleString('en-IN')}
          </span>
        </div>
        <div
          className="h-1.5 rounded-full overflow-hidden"
          style={{ background: 'var(--bg-float)' }}
        >
          <motion.div
            className="h-full rounded-full origin-left"
            style={{
              background:  'linear-gradient(90deg, var(--brand-dim), var(--brand), var(--brand-bright))',
              willChange:  'transform',
            }}
            initial={{ scaleX: 0 }}
            animate={{ scaleX: pct }}
            transition={{ duration: 1.0, ease: [0.16, 1, 0.3, 1], delay: 0.4 }}
          />
        </div>
      </div>

      {/* Avatar row */}
      <div className="flex items-center gap-3 px-4 pb-4">
        <div
          className="w-9 h-9 rounded-full flex items-center justify-center font-display text-sm shrink-0"
          style={{ background: 'var(--brand-subtle)', color: 'var(--brand)' }}
        >
          {initials}
        </div>
        <div className="flex-1 min-w-0">
          <p className="font-body text-sm font-medium truncate" style={{ color: 'var(--text-1)' }}>
            {firstName}
          </p>
          <p className="font-mono text-[11px] capitalize" style={{ color: 'var(--text-4)' }}>
            {tier} tier
          </p>
        </div>
        <button
          onClick={() => signOut({ redirectUrl: '/' })}
          className="w-8 h-8 flex items-center justify-center rounded-lg transition-colors hover:bg-white/5 active:scale-90"
          style={{ color: 'var(--text-4)' }}
          title="Sign out"
          aria-label="Sign out"
        >
          <LogOut size={15} />
        </button>
      </div>
    </div>
  )
}

// ── Main export ─────────────────────────────────────────────────────────────

export function DashboardSidebar({
  student,
  team,
}: {
  student: StudentData
  team:    TeamData
}) {
  void team // available for future team display in sidebar

  return (
    <div className="flex flex-col h-full overflow-y-auto">
      {/* Brand header */}
      <div
        className="flex items-center gap-2.5 px-4 h-16 shrink-0 border-b"
        style={{ borderColor: 'var(--border-faint)' }}
      >
        <span
          className="font-display text-xl tracking-wider"
          style={{ color: 'var(--brand)' }}
        >
          SB
        </span>
        <div>
          <p
            className="font-heading font-bold text-[12px] leading-none"
            style={{ color: 'var(--text-1)' }}
          >
            SUPER BUILDERS
          </p>
          <p className="font-mono text-[10px]" style={{ color: 'var(--text-4)' }}>
            School Edition · S1
          </p>
        </div>
      </div>

      {/* Stage progress rail */}
      <StageProgressRail currentStage={student.currentStage} />

      {/* Divider */}
      <div className="mx-4 h-px shrink-0" style={{ background: 'var(--border-faint)' }} />

      {/* Nav links — scrollable if needed */}
      <div className="flex-1 overflow-y-auto py-2">
        <NavLinks tier={student.tier} />
      </div>

      {/* XP + avatar footer */}
      <XPBarFooter
        xpPoints={student.xpPoints}
        fullName={student.fullName}
        firstName={student.firstName}
        tier={student.tier}
      />
    </div>
  )
}
