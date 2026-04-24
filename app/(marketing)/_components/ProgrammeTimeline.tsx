'use client'

import { motion, type Variants } from 'framer-motion'
import { cn } from '@/lib/utils'
import type { PhaseEntry, WorkshopEntry } from '@/lib/db/queries/config'
import { BADGES } from '@/lib/gamification/badges'

/* ─── Config ─────────────────────────────────────────────────────────────────── */
// Display Stage 1 = Apply & Prepare (currently open). Update as programme progresses.
const ACTIVE_PHASE = 1

const EASE_OUT = [0.16, 1, 0.3, 1] as const

/* ─── Variants ───────────────────────────────────────────────────────────────── */
const sectionVariants: Variants = {
  hidden: {},
  show:   { transition: { staggerChildren: 0.09, delayChildren: 0.05 } },
}

const nodeVariants: Variants = {
  hidden: { opacity: 0, scale: 0.7 },
  show:   { opacity: 1, scale: 1, transition: { duration: 0.45, ease: EASE_OUT } },
}

const labelVariants: Variants = {
  hidden: { opacity: 0, y: 10 },
  show:   { opacity: 1, y: 0, transition: { duration: 0.4, ease: EASE_OUT } },
}

const cardVariants: Variants = {
  hidden: { opacity: 0, y: 20 },
  show:   { opacity: 1, y: 0, transition: { duration: 0.5, ease: EASE_OUT } },
  hover:  { y: -6, transition: { type: 'spring', stiffness: 280, damping: 20 } },
}

/* ─── Phase node colors ──────────────────────────────────────────────────────── */
function phaseStyles(phaseNum: number) {
  const isActive  = phaseNum === ACTIVE_PHASE
  const isPast    = phaseNum < ACTIVE_PHASE
  const isFuture  = phaseNum > ACTIVE_PHASE

  return {
    isActive,
    isPast,
    isFuture,
    circleBg: isActive
      ? 'var(--brand)'
      : isPast
      ? 'rgba(255,184,0,0.15)'
      : 'var(--bg-raised)',
    circleBorder: isActive
      ? 'var(--brand)'
      : isPast
      ? 'rgba(255,184,0,0.35)'
      : 'var(--border-subtle)',
    numColor: isActive ? '#000' : isPast ? 'var(--text-brand)' : 'var(--text-4)',
    nameColor: isActive
      ? 'var(--text-brand)'
      : isPast
      ? 'var(--text-2)'
      : 'var(--text-4)',
    dateColor: isActive ? 'var(--text-2)' : 'var(--text-4)',
  }
}

/* ─── Horizontal timeline (desktop) ─────────────────────────────────────────── */
function HorizontalTimeline({ phases }: { phases: PhaseEntry[] }) {
  const total = phases.length

  return (
    <div className="hidden md:block relative" aria-label="Programme phases">
      {/* Background connector rail */}
      <div
        className="absolute top-[20px] h-px"
        style={{
          left:       `calc(100% / ${total * 2})`,
          right:      `calc(100% / ${total * 2})`,
          background: 'var(--border-faint)',
        }}
        aria-hidden="true"
      />

      {/* Gold filled rail — up to active phase */}
      {ACTIVE_PHASE > 1 && (
        <motion.div
          className="absolute top-[20px] h-px origin-left"
          style={{
            left:  `calc(100% / ${total * 2})`,
            width: `calc((100% / ${total}) * ${ACTIVE_PHASE - 1})`,
            background: 'linear-gradient(90deg, var(--brand) 0%, rgba(255,184,0,0.4) 100%)',
          }}
          initial={{ scaleX: 0 }}
          whileInView={{ scaleX: 1 }}
          viewport={{ once: true }}
          transition={{ duration: 0.9, ease: EASE_OUT }}
          aria-hidden="true"
        />
      )}

      {/* Phase nodes */}
      <motion.div
        className="grid"
        style={{ gridTemplateColumns: `repeat(${total}, 1fr)` }}
        variants={sectionVariants}
        initial="hidden"
        whileInView="show"
        viewport={{ once: true, margin: '-80px' }}
      >
        {phases.map((phase) => {
          const s = phaseStyles(phase.num)
          return (
            <div key={phase.num} className="flex flex-col items-center">
              {/* Node circle */}
              <motion.div variants={nodeVariants} className="relative">
                {/* Pulsing outer ring for active phase */}
                {s.isActive && (
                  <div
                    className="absolute inset-[-6px] rounded-full border"
                    style={{
                      borderColor: 'rgba(255,184,0,0.45)',
                      animation:   'glow-pulse 2s ease-in-out infinite',
                    }}
                    aria-hidden="true"
                  />
                )}

                <div
                  className="relative z-10 w-10 h-10 rounded-full border-2 flex items-center justify-center font-mono text-[13px] font-bold transition-all duration-300"
                  style={{
                    background:   s.circleBg,
                    borderColor:  s.circleBorder,
                    color:        s.numColor,
                    boxShadow:    s.isActive
                      ? '0 0 20px rgba(255,184,0,0.4), 0 0 40px rgba(255,184,0,0.15)'
                      : undefined,
                  }}
                >
                  {s.isPast ? '✓' : phase.num}
                </div>
              </motion.div>

              {/* Phase info below node */}
              <motion.div
                variants={labelVariants}
                className="mt-4 text-center px-2"
              >
                <p
                  className="font-heading font-semibold text-[12px] leading-snug mb-1"
                  style={{ color: s.nameColor }}
                >
                  {phase.name}
                </p>
                <p
                  className="font-mono text-[12px] leading-snug mb-1"
                  style={{ color: s.dateColor }}
                >
                  {phase.dates}
                </p>
                <p
                  className="font-mono text-[9px] tracking-wide uppercase"
                  style={{ color: 'var(--text-4)' }}
                >
                  {phase.milestone}
                </p>
              </motion.div>
            </div>
          )
        })}
      </motion.div>
    </div>
  )
}

/* ─── Vertical timeline (mobile) ─────────────────────────────────────────────── */
function VerticalTimeline({ phases }: { phases: PhaseEntry[] }) {
  return (
    <div className="md:hidden relative" aria-label="Programme phases">
      {/* Vertical gold gradient line */}
      <motion.div
        className="absolute top-4 bottom-4 w-px left-[18px] origin-top"
        style={{
          background:
            'linear-gradient(to bottom, var(--brand) 0%, rgba(255,184,0,0.2) 60%, transparent 100%)',
        }}
        initial={{ scaleY: 0 }}
        whileInView={{ scaleY: 1 }}
        viewport={{ once: true }}
        transition={{ duration: 1.1, ease: EASE_OUT }}
        aria-hidden="true"
      />

      <motion.div
        className="flex flex-col"
        variants={sectionVariants}
        initial="hidden"
        whileInView="show"
        viewport={{ once: true, margin: '-40px' }}
      >
        {phases.map((phase, i) => {
          const s = phaseStyles(phase.num)
          return (
            <motion.div
              key={phase.num}
              variants={nodeVariants}
              className={cn('flex items-start gap-5', i < phases.length - 1 && 'pb-8')}
            >
              {/* Node — w-9 = 36px, centre aligns with line at left-[18px] */}
              <div className="relative flex-shrink-0">
                {s.isActive && (
                  <div
                    className="absolute inset-[-5px] rounded-full border"
                    style={{
                      borderColor: 'rgba(255,184,0,0.4)',
                      animation:   'glow-pulse 2s ease-in-out infinite',
                    }}
                    aria-hidden="true"
                  />
                )}
                <div
                  className="relative z-10 w-9 h-9 rounded-full border-2 flex items-center justify-center font-mono text-[12px] font-bold"
                  style={{
                    background:  s.circleBg,
                    borderColor: s.circleBorder,
                    color:       s.numColor,
                    boxShadow:   s.isActive
                      ? '0 0 16px rgba(255,184,0,0.5)'
                      : undefined,
                  }}
                >
                  {s.isPast ? '✓' : phase.num}
                </div>
              </div>

              {/* Content */}
              <div className="pt-1.5 min-w-0">
                <p
                  className="font-heading font-semibold text-[14px] leading-tight mb-0.5"
                  style={{ color: s.nameColor }}
                >
                  {phase.name}
                </p>
                <p
                  className="font-mono text-[13px] mb-0.5"
                  style={{ color: s.dateColor }}
                >
                  {phase.dates}
                </p>
                <p
                  className="font-mono text-[12px] tracking-wide uppercase"
                  style={{ color: 'var(--text-4)' }}
                >
                  {phase.milestone}
                </p>
              </div>
            </motion.div>
          )
        })}
      </motion.div>
    </div>
  )
}

/* ─── Workshop card ──────────────────────────────────────────────────────────── */
function WorkshopCard({
  workshop,
  index,
}: {
  workshop: WorkshopEntry
  index: number
}) {
  const badge  = BADGES[workshop.badge as keyof typeof BADGES]
  const accent = badge.color
  const num    = String(index + 1).padStart(2, '0')

  return (
    <motion.div
      variants={cardVariants}
      whileHover="hover"
      className="relative rounded-[4px] border p-6 cursor-default flex flex-col"
      style={{
        background:  'var(--bg-card)',
        borderColor: 'var(--border-faint)',
      }}
    >
      {/* Hover glow overlay — opacity-only animation, GPU composited */}
      <motion.div
        variants={{ hover: { opacity: 1 } }}
        initial={{ opacity: 0 }}
        transition={{ type: 'spring', stiffness: 280, damping: 20 }}
        className="absolute inset-0 rounded-[4px] pointer-events-none"
        style={{
          boxShadow: '0 0 0 1px rgba(255,184,0,0.5), 0 12px 40px rgba(255,184,0,0.12)',
          border:    '1px solid rgba(255,184,0,0.45)',
        }}
        aria-hidden="true"
      />
      {/* Left accent strip */}
      <div
        className="absolute left-0 top-0 bottom-0 w-[3px] rounded-l-[4px]"
        style={{ background: accent }}
        aria-hidden="true"
      />

      {/* Ghost workshop number — hidden on mobile to prevent layout pressure */}
      <div
        className="hidden sm:block absolute right-4 top-0 font-display leading-none select-none pointer-events-none"
        style={{
          fontSize:  'clamp(72px, 10vw, 110px)',
          color:     accent,
          opacity:   0.06,
        }}
        aria-hidden="true"
      >
        WS-{num}
      </div>

      {/* Header row */}
      <div className="flex items-start justify-between mb-4 relative z-10">
        <div>
          <p
            className="font-mono text-[9px] tracking-[0.2em] uppercase mb-2"
            style={{ color: accent }}
          >
            Workshop {workshop.id}
          </p>
          <h3
            className="font-heading font-bold text-[15px] leading-snug"
            style={{ color: 'var(--text-1)' }}
          >
            {workshop.title}
          </h3>
        </div>

        {/* Badge emoji preview */}
        <div
          className="flex-shrink-0 ml-3 w-10 h-10 rounded-lg flex items-center justify-center text-xl border"
          style={{
            background:  `${accent}18`,
            borderColor: `${accent}35`,
          }}
          aria-label={`Unlocks ${badge.id} badge`}
          title={`Unlocks: ${badge.id} badge`}
        >
          {badge.emoji}
        </div>
      </div>

      {/* Meta pills */}
      <div className="flex flex-wrap gap-2 mb-4 relative z-10">
        <span
          className="inline-flex items-center h-[22px] px-2.5 rounded-full font-mono text-[12px] border"
          style={{
            borderColor: 'var(--border-subtle)',
            color:       'var(--text-3)',
          }}
        >
          ⏱ {workshop.duration} min
        </span>
        <span
          className="inline-flex items-center h-[22px] px-2.5 rounded-full font-mono text-[12px] border"
          style={{
            borderColor: 'var(--border-subtle)',
            color:       'var(--text-3)',
          }}
        >
          📅 {workshop.dateRange}
        </span>
      </div>

      {/* Outcome */}
      <div
        className="flex items-start gap-2 mb-4 relative z-10"
      >
        <span
          className="mt-px flex-shrink-0 text-[13px]"
          style={{ color: accent }}
          aria-hidden="true"
        >
          ✦
        </span>
        <p
          className="font-body text-[13px] leading-snug"
          style={{ color: 'var(--text-2)' }}
        >
          {workshop.outcome}
        </p>
      </div>

      {/* Badge unlock row */}
      <div
        className="mt-auto flex items-center gap-2 pt-4 border-t relative z-10"
        style={{ borderColor: 'var(--border-faint)' }}
      >
        <span
          className="font-mono text-[9px] tracking-[0.18em] uppercase"
          style={{ color: 'var(--text-4)' }}
        >
          Unlock:
        </span>
        <span
          className="font-mono text-[12px] font-semibold"
          style={{ color: accent }}
        >
          {badge.id.replace(/_/g, ' ').toUpperCase()} BADGE
        </span>
        <span
          className="ml-auto font-mono text-[9px] uppercase tracking-wide"
          style={{ color: 'var(--text-4)' }}
        >
          +{badge.xp} XP
        </span>
      </div>
    </motion.div>
  )
}

/* ─── ProgrammeTimeline ──────────────────────────────────────────────────────── */
export function ProgrammeTimeline({ phases, workshops }: { phases: PhaseEntry[]; workshops: WorkshopEntry[] }) {
  return (
    <section
      className="relative py-20 sm:py-28 overflow-hidden"
      id="programme"
      style={{ background: 'var(--bg-base)' }}
    >
      {/* Faint grid texture — blueprint feel */}
      <div
        className="pointer-events-none absolute inset-0"
        aria-hidden="true"
        style={{
          backgroundImage: `
            repeating-linear-gradient(rgba(255,184,0,0.025) 0 1px, transparent 1px 64px),
            repeating-linear-gradient(90deg, rgba(255,184,0,0.025) 0 1px, transparent 1px 64px)
          `,
        }}
      />

      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">

        {/* ── Section header ── */}
        <motion.div
          className="mb-14"
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6, ease: EASE_OUT }}
        >
          <p
            className="font-mono text-[12px] tracking-[0.28em] uppercase mb-3"
            style={{ color: 'var(--text-brand)' }}
          >
            Programme Journey
          </p>
          <h2
            className="font-display leading-none tracking-tight"
            style={{
              fontSize:  'clamp(32px, 5vw, 68px)',
              color:     'var(--text-1)',
            }}
          >
            FROM ZERO TO HACKER{' '}
            <span style={{ color: 'var(--text-brand)' }}>IN 65 DAYS</span>
          </h2>
        </motion.div>

        {/* ── Timeline ── */}
        <div className="mb-16">
          <HorizontalTimeline phases={phases} />
          <VerticalTimeline phases={phases} />
        </div>

        {/* ── Workshop cards ── */}
        <motion.div
          className="mb-8"
          initial={{ opacity: 0, y: 12 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5, ease: EASE_OUT }}
        >
          <p
            className="font-mono text-[12px] tracking-[0.22em] uppercase mb-6"
            style={{ color: 'var(--text-3)' }}
          >
            Three Workshops · Earn Badges · Level Up
          </p>
        </motion.div>

        <motion.div
          className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4"
          variants={sectionVariants}
          initial="hidden"
          whileInView="show"
          viewport={{ once: true, margin: '-60px' }}
        >
          {workshops.map((ws, i) => (
            <WorkshopCard key={ws.id} workshop={ws} index={i} />
          ))}
        </motion.div>

      </div>
    </section>
  )
}
