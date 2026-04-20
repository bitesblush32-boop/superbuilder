'use client'

import Link           from 'next/link'
import { usePathname } from 'next/navigation'
import { useState }   from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { useClerk }   from '@clerk/nextjs'
import { LogOut, ChevronDown, Lock } from 'lucide-react'
import type { DashboardProgress, StudentData, TeamData } from './DashboardShell'

// ── Easing constant (typed tuple for Framer Motion v12) ─────────────────────
const EASE_OUT: [number, number, number, number] = [0.16, 1, 0.3, 1]

// ── Nav links ────────────────────────────────────────────────────────────────

const NAV_LINKS = [
  { href: '/dashboard',             label: 'Overview',    emoji: '🏠' },
  { href: '/dashboard/workshops',   label: 'Workshops',   emoji: '🎓' },
  { href: '/dashboard/mentors',     label: 'Mentors',     emoji: '👤', premiumOnly: true },
  { href: '/dashboard/team',        label: 'My Team',     emoji: '🤝' },
  { href: '/dashboard/leaderboard', label: 'Leaderboard', emoji: '🏆' },
  { href: '/dashboard/submit',      label: 'Submit',      emoji: '🚀' },
  { href: '/dashboard/certificate', label: 'Certificate', emoji: '📜' },
] as const

// ── Stage types ──────────────────────────────────────────────────────────────

interface SubStep { label: string; done: boolean; href?: string }
interface Stage {
  num:      number
  label:    string
  done:     boolean
  active:   boolean
  locked:   boolean
  href:     string | null   // navigation target when clicked (non-expandable stages)
  subSteps: SubStep[]
}

function buildStages(progress: DashboardProgress, currentStage: number): Stage[] {
  const s1Done = progress.s1_personal && progress.s1_parents && progress.s1_team
  const s2Done = progress.s2_orientation && progress.s2_domain && progress.s2_quiz && progress.s2_idea

  return [
    {
      num: 1, label: 'Apply',
      done: s1Done, active: currentStage === 1, locked: false,
      href: null,
      subSteps: [
        { label: 'Personal Info', done: progress.s1_personal, href: '/dashboard/apply'     },
        { label: 'Parents Info',  done: progress.s1_parents,  href: '/dashboard/apply'     },
        { label: 'Team Building', done: progress.s1_team,     href: '/dashboard/team-setup' },
      ],
    },
    {
      num: 2, label: 'Learn & Quiz',
      done: s2Done, active: currentStage === 2, locked: currentStage < 2,
      href: null,
      subSteps: [
        { label: 'Orientation', done: progress.s2_orientation, href: '/register/stage-2/orientation' },
        { label: 'Domain',      done: progress.s2_domain,      href: '/register/stage-2/domain'      },
        { label: 'Quiz',        done: progress.s2_quiz,        href: '/register/stage-2/quiz'        },
        { label: 'Idea Pitch',  done: progress.s2_idea,        href: '/register/stage-2/idea'        },
      ],
    },
    {
      num: 3, label: 'Payment',
      done: progress.s3_paid, active: currentStage === 3, locked: currentStage < 3,
      href: currentStage >= 3 && !progress.s3_paid ? '/register/stage-3/engage' : null,
      subSteps: [],
    },
    {
      num: 4, label: 'Build Phase',
      done: false, active: currentStage >= 4, locked: currentStage < 4,
      href: null,
      subSteps: [],
    },
    {
      num: 5, label: 'Certificates',
      done: progress.s5_cert, active: false, locked: !progress.s5_cert && currentStage < 5,
      href: progress.s5_cert ? '/dashboard/certificate' : null,
      subSteps: [],
    },
  ]
}

// ── Stage node ───────────────────────────────────────────────────────────────

function StageNode({
  stage,
  isExpanded,
  onToggle,
}: {
  stage: Stage
  isExpanded: boolean
  onToggle: () => void
}) {
  const hasSubSteps  = stage.subSteps.length > 0
  const isNavigable  = !hasSubSteps && !stage.locked && stage.href

  const circleColor  = stage.done   ? '#000'
                     : stage.active ? 'var(--brand)'
                     :                'var(--text-4)'
  const circleBg     = stage.done   ? 'var(--brand)'
                     : stage.active ? 'var(--bg-base)'
                     :                'var(--bg-float)'
  const circleBorder = stage.done || stage.active ? 'var(--brand)' : 'var(--border-faint)'

  const labelColor   = stage.locked ? 'var(--text-4)'
                     : stage.done   ? 'var(--text-brand)'
                     : stage.active ? 'var(--text-1)'
                     :                'var(--text-3)'

  const RowElement = isNavigable ? Link : 'button'

  return (
    <div className="relative">
      <RowElement
        {...(isNavigable
          ? { href: stage.href! }
          : {
              onClick: hasSubSteps ? onToggle : undefined,
              disabled: stage.locked && !hasSubSteps,
              'aria-expanded': hasSubSteps ? isExpanded : undefined,
            })}
        className="w-full flex items-center gap-3 px-4 min-h-[52px] transition-all duration-150 active:scale-[0.98] disabled:cursor-default"
        style={{ background: isExpanded && hasSubSteps ? 'rgba(255,184,0,0.04)' : 'transparent' }}
      >
        {/* Stage circle */}
        <div className="relative shrink-0 z-10">
          <div
            className="w-8 h-8 rounded-full flex items-center justify-center border-2 transition-all duration-300"
            style={{
              background:  circleBg,
              borderColor: circleBorder,
              color:       circleColor,
              boxShadow:   stage.active && !stage.done ? '0 0 14px rgba(255,184,0,0.5)' : 'none',
            }}
          >
            {stage.done ? (
              <span className="text-xs font-bold">✓</span>
            ) : (
              <span className="font-mono text-[11px] font-bold">{stage.num}</span>
            )}
          </div>

          {/* Active pulse ring */}
          {stage.active && !stage.done && (
            <motion.div
              className="absolute inset-0 rounded-full border-2"
              style={{ borderColor: 'rgba(255,184,0,0.45)' }}
              initial={{ scale: 1, opacity: 0.7 }}
              animate={{ scale: 1.7, opacity: 0 }}
              transition={{ duration: 1.8, repeat: Infinity, ease: 'easeOut' }}
              aria-hidden="true"
            />
          )}
        </div>

        {/* Label */}
        <div className="flex-1 text-left min-w-0">
          <p
            className="font-heading font-semibold text-[13px] leading-tight truncate"
            style={{ color: labelColor }}
          >
            {stage.label}
          </p>
          {stage.active && !stage.done && (
            <p className="font-mono text-[10px]" style={{ color: 'var(--text-brand)' }}>
              ← You are here
            </p>
          )}
        </div>

        {/* Right: lock or chevron */}
        {stage.locked ? (
          <Lock size={13} style={{ color: 'var(--text-4)', flexShrink: 0 }} aria-hidden="true" />
        ) : hasSubSteps ? (
          <motion.div
            animate={{ rotate: isExpanded ? 180 : 0 }}
            transition={{ duration: 0.2 }}
            aria-hidden="true"
          >
            <ChevronDown size={14} style={{ color: 'var(--text-3)', flexShrink: 0 }} />
          </motion.div>
        ) : null}
      </RowElement>

      {/* Sub-steps */}
      <AnimatePresence initial={false}>
        {hasSubSteps && isExpanded && (
          <motion.div
            key="sub"
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.25, ease: EASE_OUT }}
            className="overflow-hidden"
          >
            <div className="pl-11 pr-4 pb-2 flex flex-col gap-0.5">
              {stage.subSteps.map((sub) => {
                // Sub-step is only locked if the entire stage is locked (admin gate)
                const subLocked = stage.locked
                const canNavigate = !subLocked && sub.href

                const dotEl = (
                  <div
                    className="w-[18px] h-[18px] rounded-full flex items-center justify-center shrink-0 border"
                    style={{
                      background:  sub.done ? 'var(--brand)' : 'var(--bg-float)',
                      borderColor: sub.done ? 'var(--brand)' : 'var(--border-subtle)',
                    }}
                  >
                    {sub.done && (
                      <span className="text-[8px] font-bold text-black">✓</span>
                    )}
                  </div>
                )

                const labelEl = (
                  <div className="relative flex-1 min-w-0 flex items-center gap-1.5">
                    <p
                      className="font-mono text-[11px] truncate transition-all duration-200"
                      style={{
                        color:  sub.done   ? 'var(--text-brand)'
                              : subLocked  ? 'var(--text-4)'
                              :              'var(--text-3)',
                        filter:     subLocked ? 'blur(3px)' : 'none',
                        userSelect: subLocked ? 'none' : 'auto',
                      }}
                    >
                      {sub.label}
                    </p>
                    {subLocked && (
                      <Lock size={10} style={{ color: 'var(--text-4)', flexShrink: 0 }} aria-label={`${sub.label} locked`} />
                    )}
                  </div>
                )

                return canNavigate ? (
                  <Link
                    key={sub.label}
                    href={sub.href!}
                    className="flex items-center gap-2.5 py-1.5 min-h-[36px] rounded-lg px-1 -mx-1 transition-colors active:opacity-70"
                    style={{ textDecoration: 'none' }}
                  >
                    {dotEl}{labelEl}
                  </Link>
                ) : (
                  <div key={sub.label} className="flex items-center gap-2.5 py-1.5 min-h-[36px]">
                    {dotEl}{labelEl}
                  </div>
                )
              })}
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Locked stage overlay */}
      {stage.locked && (
        <div
          className="absolute inset-0 rounded-lg pointer-events-none"
          style={{
            background:           'rgba(10,10,10,0.5)',
            backdropFilter:       'blur(1.5px)',
            WebkitBackdropFilter: 'blur(1.5px)',
          }}
          aria-hidden="true"
        />
      )}
    </div>
  )
}

// ── Nav links ─────────────────────────────────────────────────────────────────

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
            className="flex items-center gap-3 px-3 min-h-[44px] rounded-xl transition-all duration-150 active:scale-[0.97]"
            style={{
              background:  isActive ? 'var(--brand-subtle)' : 'transparent',
              color:       isActive ? 'var(--text-brand)' : isLocked ? 'var(--text-4)' : 'var(--text-3)',
              borderLeft:  isActive ? '2px solid var(--brand)' : '2px solid transparent',
            }}
          >
            <span className="text-base leading-none">{link.emoji}</span>
            <span className="font-body font-medium text-[13px] flex-1">{link.label}</span>
            {isLocked && (
              <span
                className="font-mono text-[10px] px-1.5 py-0.5 rounded"
                style={{ background: 'var(--bg-float)', color: 'var(--text-4)' }}
              >
                ⭐
              </span>
            )}
          </Link>
        )
      })}
    </nav>
  )
}

// ── XP bar footer ─────────────────────────────────────────────────────────────

const XP_THRESHOLDS = [0, 50, 150, 350, 550, 750, 1050, 1350, 1850]

function XPBarFooter({
  xpPoints, fullName, tier, firstName,
}: {
  xpPoints: number; fullName: string; tier: string; firstName: string
}) {
  const { signOut } = useClerk()
  const nextThreshold = XP_THRESHOLDS.find(t => t > xpPoints) ?? 2000
  const prevThreshold = [...XP_THRESHOLDS].reverse().find(t => t <= xpPoints) ?? 0
  const pct = prevThreshold === nextThreshold
    ? 1
    : (xpPoints - prevThreshold) / (nextThreshold - prevThreshold)
  const initials = fullName.split(' ').map(w => w[0]).join('').slice(0, 2).toUpperCase()

  return (
    <div className="mt-auto border-t" style={{ borderColor: 'var(--border-faint)' }}>
      <div className="px-4 pt-4 pb-3">
        <div className="flex items-center justify-between mb-1.5">
          <span className="font-mono text-[11px]" style={{ color: 'var(--text-3)' }}>
            ⚡ {xpPoints.toLocaleString('en-IN')} XP
          </span>
          <span className="font-mono text-[11px]" style={{ color: 'var(--text-4)' }}>
            Next: {nextThreshold.toLocaleString('en-IN')}
          </span>
        </div>
        <div className="h-1.5 rounded-full overflow-hidden" style={{ background: 'var(--bg-float)' }}>
          <motion.div
            className="h-full rounded-full origin-left"
            style={{
              background: 'linear-gradient(90deg, var(--brand-dim), var(--brand), var(--brand-bright))',
              willChange: 'transform',
            }}
            initial={{ scaleX: 0 }}
            animate={{ scaleX: pct }}
            transition={{ duration: 1.0, ease: EASE_OUT, delay: 0.4 }}
          />
        </div>
      </div>

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

// ── Main export ───────────────────────────────────────────────────────────────

export function DashboardSidebar({
  student,
  progress,
  team,
}: {
  student:  StudentData
  progress: DashboardProgress
  team:     TeamData
}) {
  void team

  const stages = buildStages(progress, student.currentStage)

  // Default-expand the active stage (or the last completed one)
  const defaultExpanded =
    stages.find(s => s.active)?.num ??
    stages.filter(s => s.done).at(-1)?.num ??
    1

  const [expandedStage, setExpandedStage] = useState<number | null>(defaultExpanded)

  const toggleStage = (num: number) =>
    setExpandedStage(prev => (prev === num ? null : num))

  const doneCount   = stages.filter(s => s.done).length
  const fillFraction = Math.max(0, doneCount / Math.max(stages.length - 1, 1))

  return (
    <div className="flex flex-col h-full overflow-y-auto">
      {/* Brand header */}
      <div
        className="flex items-center gap-2.5 px-4 h-16 shrink-0 border-b"
        style={{ borderColor: 'var(--border-faint)' }}
      >
        <div
          className="w-8 h-8 rounded-lg flex items-center justify-center font-display text-sm"
          style={{ background: 'var(--brand)', color: '#000' }}
        >
          SB
        </div>
        <div>
          <p className="font-heading font-bold text-[12px] leading-none" style={{ color: 'var(--text-1)' }}>
            SUPER BUILDERS
          </p>
          <p className="font-mono text-[10px]" style={{ color: 'var(--text-4)' }}>
            School Edition · S1
          </p>
        </div>
      </div>

      {/* Stage rail */}
      <div className="px-0 py-3">
        <p
          className="px-4 font-mono text-[10px] tracking-[0.2em] uppercase mb-2"
          style={{ color: 'var(--text-4)' }}
        >
          Your Journey
        </p>

        <div className="relative flex flex-col" style={{ isolation: 'isolate' }}>
          {/* Grey connector rail */}
          <div
            className="absolute left-[31px] top-[20px] bottom-[20px] w-px"
            style={{ background: 'var(--border-faint)', zIndex: 0 }}
            aria-hidden="true"
          />

          {/* Gold progress fill */}
          <motion.div
            className="absolute left-[31px] top-[20px] w-px origin-top"
            style={{
              background: 'linear-gradient(to bottom, var(--brand), rgba(255,184,0,0.2))',
              height: 'calc(100% - 40px)',
              willChange: 'transform',
              zIndex: 0,
            }}
            initial={{ scaleY: 0 }}
            animate={{ scaleY: fillFraction }}
            transition={{ duration: 1.4, ease: EASE_OUT, delay: 0.2 }}
            aria-hidden="true"
          />

          {stages.map(stage => (
            <StageNode
              key={stage.num}
              stage={stage}
              isExpanded={expandedStage === stage.num}
              onToggle={() => toggleStage(stage.num)}
            />
          ))}
        </div>
      </div>

      {/* Divider */}
      <div className="mx-4 h-px shrink-0" style={{ background: 'var(--border-faint)' }} />

      {/* Nav links */}
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
