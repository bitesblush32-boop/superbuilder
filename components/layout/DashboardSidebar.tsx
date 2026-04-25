'use client'

import Link           from 'next/link'
import { usePathname } from 'next/navigation'
import { useState }   from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { useClerk }   from '@clerk/nextjs'
import { LogOut, ChevronDown } from 'lucide-react'
import type { DashboardProgress, StudentData, TeamData } from './DashboardShell'
import { useRegistrationStore } from '@/lib/store/registration'

// ── Easing constant (typed tuple for Framer Motion v12) ─────────────────────
const EASE_OUT: [number, number, number, number] = [0.16, 1, 0.3, 1]

// ── Nav links ────────────────────────────────────────────────────────────────

const NAV_LINKS = [
  { href: '/dashboard',             label: 'Overview',    emoji: '🏠' },
  { href: '/dashboard/workshops',   label: 'Workshops',   emoji: '🎓' },
  { href: '/dashboard/mentors',     label: 'Mentors',     emoji: '👤' },
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
  dates:    string
  done:     boolean
  active:   boolean
  locked:   boolean
  href:     string | null
  subSteps: SubStep[]
}

function buildStages(
  progress:   DashboardProgress,
  stageLocks: Record<number, boolean>,
): Stage[] {
  const now            = new Date()
  const isPaid         = progress.s3_paid
  const hackathonStart = new Date('2026-06-07T08:00:00+05:30')
  const hackathonEnd   = new Date('2026-06-08T08:00:00+05:30')
  const hackathonEnded = now > hackathonEnd
  const demoDay        = new Date('2026-06-27T00:00:00+05:30')
  const certsLive      = new Date('2026-07-01T00:00:00+05:30')

  const s1Complete = progress.s1_personal && progress.s1_parents &&
                     progress.s1_team && progress.s2_orientation &&
                     progress.s2_domain && progress.s2_quiz &&
                     progress.s2_idea && isPaid

  return [
    {
      num: 1,
      label: 'Apply & Prepare',
      dates: 'Apr 23 – May 30',
      done: !!s1Complete,
      active: !s1Complete,
      locked: !stageLocks[1],
      href: null,
      subSteps: [
        { label: 'Personal Info',    done: progress.s1_personal,    href: '/dashboard/apply?step=1' },
        { label: 'Parent Info',      done: progress.s1_parents,     href: '/dashboard/apply?step=2' },
        { label: 'Team Building',    done: progress.s1_team,        href: '/dashboard/team-setup' },
        { label: 'Intro',            done: progress.s2_orientation, href: '/dashboard/intro' },
        { label: 'Domain Selection', done: progress.s2_domain,      href: '/dashboard/domain' },
        { label: 'AI Quiz',          done: progress.s2_quiz,        href: '/dashboard/quiz' },
        { label: 'Idea Submission',  done: progress.s2_idea,        href: '/dashboard/idea' },
        { label: 'Payment',          done: isPaid,                  href: progress.s2_idea ? '/dashboard/engage' : undefined },
      ],
    },
    {
      num: 2,
      label: 'Workshops',
      dates: 'Jun 3–5',
      done: false,
      active: isPaid && !hackathonEnded,
      locked: !isPaid,
      href: isPaid ? '/dashboard/workshops' : null,
      subSteps: [
        { label: 'Workshop 1 – AI Fundamentals',  done: false, href: '/dashboard/workshops' },
        { label: 'Workshop 2 – Domain Deep-Dive', done: false, href: '/dashboard/workshops' },
        { label: 'Workshop 3 – Build Sprint',     done: false, href: '/dashboard/workshops' },
      ],
    },
    {
      num: 3,
      label: 'Hackathon',
      dates: 'Jun 7–8',
      done: hackathonEnded,
      active: isPaid && now >= hackathonStart && !hackathonEnded,
      locked: !isPaid,
      href: isPaid ? '/dashboard/submit' : null,
      subSteps: [
        { label: 'Build your project', done: false },
        { label: 'Submit project',     done: false, href: '/dashboard/submit' },
      ],
    },
    {
      num: 4,
      label: 'Demo Day',
      dates: 'Jun 27',
      done: now > demoDay,
      active: hackathonEnded && now <= demoDay,
      locked: !hackathonEnded,
      href: hackathonEnded ? '/dashboard' : null,
      subSteps: [],
    },
    {
      num: 5,
      label: 'Certificates & Prizes',
      dates: 'Jul 1',
      done: progress.s5_cert,
      active: now >= certsLive,
      locked: now < certsLive,
      href: progress.s5_cert ? '/dashboard/certificate' : null,
      subSteps: [],
    },
  ]
}

// ── Derive full active sub-step index for Stage 1 (covers all 8 sub-steps) ───

function getS1ActiveSubStep(progress: DashboardProgress, zustandStep: number): number {
  if (!progress.s1_personal)    return zustandStep       // 1
  if (!progress.s1_parents)     return Math.max(zustandStep, 2)
  if (!progress.s1_team)        return Math.max(zustandStep, 3)
  if (!progress.s2_orientation) return 4
  if (!progress.s2_domain)      return 5
  if (!progress.s2_quiz)        return 6
  if (!progress.s2_idea)        return 7
  if (!progress.s3_paid)        return 8
  return 8
}

// ── Stage node ───────────────────────────────────────────────────────────────

function StageNode({
  stage,
  isExpanded,
  onToggle,
  activeSubStepIndex,
}: {
  stage:              Stage
  isExpanded:         boolean
  onToggle:           () => void
  activeSubStepIndex?: number
}) {
  const hasSubSteps = stage.subSteps.length > 0
  const isClickable = !stage.locked && (hasSubSteps || !!stage.href)

  // Circle appearance
  const circleContent = stage.done
    ? <span className="text-[11px] font-bold text-black">✓</span>
    : stage.locked && stage.num > 1
    ? <span className="text-[11px]">🔒</span>
    : <span className="font-mono text-[11px] font-bold"
            style={{ color: stage.active ? 'var(--brand)' : 'var(--text-4)' }}>
        {stage.num}
      </span>

  const circleBg = stage.done
    ? 'var(--brand)'
    : stage.active
    ? 'var(--bg-base)'
    : stage.locked && stage.num > 1
    ? 'var(--bg-inset)'
    : 'rgba(255,184,0,0.06)'   // upcoming-unlocked: subtle gold tint

  const circleBorder = stage.done || stage.active
    ? 'var(--brand)'
    : stage.locked && stage.num > 1
    ? 'var(--border-faint)'
    : 'rgba(255,184,0,0.25)'   // upcoming-unlocked: faint gold border

  const rowOpacity = stage.locked ? 0.4 : 1
  const rowCursor  = stage.locked ? 'not-allowed' : 'default'

  const stageNumColor = stage.locked ? 'var(--text-4)'
                      : stage.done   ? 'var(--text-brand)'
                      : stage.active ? 'var(--text-1)'
                      :                'var(--text-2)'  // upcoming: brighter than locked

  const stageNameColor = stage.locked ? 'var(--text-4)'
                       : stage.done   ? 'var(--text-3)'
                       : stage.active ? 'var(--text-3)'
                       :                'var(--text-4)'

  const circleNode = (
    <div className="relative shrink-0 z-10">
      <div
        className="w-8 h-8 rounded-full flex items-center justify-center border-2 transition-all duration-300"
        style={{
          background:  circleBg,
          borderColor: circleBorder,
          boxShadow:   stage.active && !stage.done ? '0 0 14px rgba(255,184,0,0.5)' : 'none',
        }}
      >
        {circleContent}
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
  )

  const labelNode = (
    <div
      className="flex-1 text-left min-w-0"
      style={stage.locked ? { backdropFilter: 'blur(1.5px)', WebkitBackdropFilter: 'blur(1.5px)' } : undefined}
    >
      <p
        className="font-heading font-bold text-[13px] leading-none mb-0.5 truncate"
        style={{ color: stageNumColor }}
      >
        Stage {stage.num}
      </p>
      <p
        className="font-body text-[11px] leading-tight truncate"
        style={{ color: stageNameColor }}
      >
        {stage.label}
      </p>
      <p
        className="font-mono text-[10px] leading-tight mt-0.5"
        style={{ color: 'var(--text-4)' }}
      >
        {stage.dates}
      </p>
    </div>
  )

  const rightIcon = stage.locked
    ? null  // no icon — row opacity handles visual dimming; lock is in circle
    : hasSubSteps
    ? (
      <motion.div
        animate={{ rotate: isExpanded ? 180 : 0 }}
        transition={{ duration: 0.2 }}
        aria-hidden="true"
      >
        <ChevronDown size={14} style={{ color: 'var(--text-3)', flexShrink: 0 }} />
      </motion.div>
    )
    : null

  const rowBase = "w-full flex items-center gap-3 px-4 py-2.5 min-h-[60px] transition-opacity duration-150"

  const inner = (
    <>
      {circleNode}
      {labelNode}
      {rightIcon}
    </>
  )

  return (
    <div className="relative" style={{ opacity: rowOpacity }}>
      {isClickable && stage.href && !hasSubSteps ? (
        <Link
          href={stage.href}
          className={rowBase}
          style={{
            cursor: rowCursor,
            background: isExpanded && hasSubSteps ? 'rgba(255,184,0,0.04)' : 'transparent',
          }}
        >
          {inner}
        </Link>
      ) : (
        <button
          onClick={isClickable && hasSubSteps ? onToggle : undefined}
          disabled={!isClickable}
          aria-expanded={hasSubSteps ? isExpanded : undefined}
          className={rowBase}
          style={{
            cursor: rowCursor,
            background: isExpanded && hasSubSteps ? 'rgba(255,184,0,0.04)' : 'transparent',
          }}
        >
          {inner}
        </button>
      )}

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
            {/* Mini vertical track for sub-steps */}
            <div className="pl-[52px] pr-4 pb-3 relative">
              {/* Thin connector line running through all dots */}
              <div
                className="absolute left-[35px] top-0 bottom-3 w-px"
                style={{ background: 'var(--border-faint)' }}
                aria-hidden="true"
              />

              <div className="flex flex-col gap-0">
                {stage.subSteps.map((sub, idx) => {
                  const canNavigate = !stage.locked && !!sub.href

                  const isActiveSub = !sub.done && activeSubStepIndex === idx + 1
                  const isPastSub   = !sub.done && activeSubStepIndex !== undefined && activeSubStepIndex > idx + 1
                  const isEffDone   = sub.done || isPastSub

                  const dotEl = (
                    <div className="relative z-10 shrink-0 -ml-[17px] mr-2.5">
                      <div
                        className="w-[8px] h-[8px] rounded-full border transition-all duration-300"
                        style={{
                          background:  isEffDone   ? 'var(--brand)'
                                     : isActiveSub ? 'transparent'
                                     :               'var(--bg-float)',
                          borderColor: isEffDone || isActiveSub ? 'var(--brand)' : 'var(--border-subtle)',
                          boxShadow:   isActiveSub ? '0 0 6px rgba(255,184,0,0.7)' : 'none',
                        }}
                      />
                      {/* Pulse on active dot */}
                      {isActiveSub && (
                        <motion.div
                          className="absolute inset-0 rounded-full border"
                          style={{ borderColor: 'rgba(255,184,0,0.5)' }}
                          initial={{ scale: 1, opacity: 0.8 }}
                          animate={{ scale: 2.2, opacity: 0 }}
                          transition={{ duration: 1.4, repeat: Infinity, ease: 'easeOut' }}
                          aria-hidden="true"
                        />
                      )}
                    </div>
                  )

                  const labelEl = (
                    <p
                      className="font-mono text-[11px] truncate transition-all duration-200 flex-1"
                      style={{
                        color:      isEffDone   ? 'var(--text-brand)'
                                  : isActiveSub ? 'var(--text-1)'
                                  :               'var(--text-3)',
                        fontWeight: isActiveSub ? 600 : isEffDone ? 500 : 400,
                        filter:     !isEffDone && !isActiveSub && idx > (activeSubStepIndex ?? 99) - 1
                                    ? 'blur(1.5px)' : 'none',
                        userSelect: 'auto',
                      }}
                    >
                      {sub.label}
                    </p>
                  )

                  const rowCls = "flex items-center py-[5px] min-h-[28px] rounded transition-colors active:opacity-70"

                  return canNavigate ? (
                    <Link
                      key={sub.label}
                      href={sub.href!}
                      className={rowCls}
                      style={{ textDecoration: 'none' }}
                    >
                      {dotEl}{labelEl}
                    </Link>
                  ) : (
                    <div key={sub.label} className={rowCls}>
                      {dotEl}{labelEl}
                    </div>
                  )
                })}
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}

// ── Nav links ─────────────────────────────────────────────────────────────────

function NavLinks() {
  const pathname = usePathname()

  return (
    <nav className="px-3 py-2 flex flex-col gap-0.5" aria-label="Dashboard navigation">
      {NAV_LINKS.map(link => {
        const isActive = pathname === link.href ||
          (link.href !== '/dashboard' && pathname.startsWith(link.href))

        return (
          <Link
            key={link.href}
            href={link.href}
            className="flex items-center gap-3 px-3 min-h-[44px] rounded-xl transition-all duration-150 active:scale-[0.97]"
            style={{
              background:  isActive ? 'var(--brand-subtle)' : 'transparent',
              color:       isActive ? 'var(--text-brand)' : 'var(--text-3)',
              borderLeft:  isActive ? '2px solid var(--brand)' : '2px solid transparent',
            }}
          >
            <span className="text-base leading-none">{link.emoji}</span>
            <span className="font-body font-medium text-[13px] flex-1">{link.label}</span>
          </Link>
        )
      })}
    </nav>
  )
}

// ── XP bar footer ─────────────────────────────────────────────────────────────

const XP_THRESHOLDS = [0, 50, 150, 350, 550, 750, 1050, 1350, 1850]

function XPBarFooter({
  xpPoints, fullName, firstName,
}: {
  xpPoints: number; fullName: string; firstName: string
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
          <p className="font-mono text-[11px]" style={{ color: 'var(--text-4)' }}>
            Super Builder
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
  stageLocks,
}: {
  student:    StudentData
  progress:   DashboardProgress
  team:       TeamData
  stageLocks: Record<number, boolean>
}) {
  void team

  const stages       = buildStages(progress, stageLocks)
  const stage1SubStep = useRegistrationStore(s => s.stage1SubStep)

  // Auto-expand the currently active stage
  const defaultExpanded = stages.find(s => s.active)?.num ?? 1
  const [expandedStage, setExpandedStage] = useState<number | null>(defaultExpanded)

  const toggleStage = (num: number) =>
    setExpandedStage(prev => (prev === num ? null : num))

  const doneCount    = stages.filter(s => s.done).length
  const fillFraction = Math.max(0, doneCount / (stages.length - 1))

  return (
    <div className="flex flex-col h-full overflow-y-auto">
      {/* Brand header */}
      <div
        className="px-4 pt-4 pb-3 shrink-0 border-b"
        style={{ borderColor: 'var(--border-faint)' }}
      >
        <div className="flex items-center gap-2.5 mb-3">
          <div
            className="w-8 h-8 rounded-lg flex items-center justify-center font-display text-sm shrink-0"
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

        {/* Journey progress summary */}
        <div className="flex items-center justify-between">
          <p className="font-mono text-[10px] tracking-[0.18em] uppercase" style={{ color: 'var(--text-4)' }}>
            Your Journey
          </p>
          <p className="font-mono text-[10px]" style={{ color: 'var(--text-4)' }}>
            {doneCount}/{stages.length} done
          </p>
        </div>
      </div>

      {/* Stage rail */}
      <div className="px-0 py-2">
        <div className="relative flex flex-col" style={{ isolation: 'isolate' }}>
          {/* Grey connector rail — aligns with circle center */}
          <div
            className="absolute left-[31px] top-[30px] bottom-[30px] w-px"
            style={{ background: 'var(--border-faint)', zIndex: 0 }}
            aria-hidden="true"
          />

          {/* Gold progress fill (scaleY transform, GPU composited) */}
          <motion.div
            className="absolute left-[31px] top-[30px] w-px origin-top"
            style={{
              background: 'linear-gradient(to bottom, var(--brand), rgba(255,184,0,0.15))',
              height: 'calc(100% - 60px)',
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
              activeSubStepIndex={
                stage.num === 1 && stage.active
                  ? getS1ActiveSubStep(progress, stage1SubStep)
                  : undefined
              }
            />
          ))}
        </div>
      </div>

      {/* Divider */}
      <div className="mx-4 h-px shrink-0" style={{ background: 'var(--border-faint)' }} />

      {/* Nav links */}
      <div className="flex-1 overflow-y-auto py-2">
        <NavLinks />
      </div>

      {/* XP + avatar footer */}
      <XPBarFooter
        xpPoints={student.xpPoints}
        fullName={student.fullName}
        firstName={student.firstName}
      />
    </div>
  )
}
