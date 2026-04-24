'use client'

import { motion, type Variants } from 'framer-motion'
import { BADGES } from '@/lib/gamification/badges'

/* ─── Config ─────────────────────────────────────────────────────────────────── */
const EASE_OUT = [0.16, 1, 0.3, 1] as const
const BADGE_ORDER: (keyof typeof BADGES)[] = [
  'EXPLORER',
  'AI_CURIOUS',
  'IDEA_LAUNCHER',
  'BUILDER',
  'WARRIOR',
  'DOMAIN_EXPERT',
  'PROTOTYPE_PRO',
  'HACKER',
  'SUPER_BUILDER',
]

// All badges unlocked — full achievement showcase
const UNLOCKED_COUNT = 9

/* ─── Variants ───────────────────────────────────────────────────────────────── */
const gridVariants: Variants = {
  hidden: {},
  show: { transition: { staggerChildren: 0.07, delayChildren: 0.05 } },
}

const cardVariants: Variants = {
  hidden: { opacity: 0, scale: 0.75, y: 16 },
  show: { opacity: 1, scale: 1, y: 0, transition: { duration: 0.45, ease: EASE_OUT } },
}

const headerVariants: Variants = {
  hidden: { opacity: 0, y: 20 },
  show: { opacity: 1, y: 0, transition: { duration: 0.55, ease: EASE_OUT } },
}

/* ─── XP bar constants (static demo) ────────────────────────────────────────── */
const DEMO_CURRENT_XP = 325   // after Explorer + AI_CURIOUS + IDEA_LAUNCHER + BUILDER = 50+100+75+200
const DEMO_LEVEL2_XP = 500
const DEMO_FILL_PCT = Math.round((DEMO_CURRENT_XP / DEMO_LEVEL2_XP) * 100)
const DEMO_REMAINING = DEMO_LEVEL2_XP - DEMO_CURRENT_XP

/* ─── BadgeCard ──────────────────────────────────────────────────────────────── */
function BadgeCard({
  badgeKey,
  unlocked,
}: {
  badgeKey: keyof typeof BADGES
  unlocked: boolean
}) {
  const badge = BADGES[badgeKey]

  return (
    <motion.div
      variants={cardVariants}
      whileHover={
        unlocked
          ? { scale: 1.12, rotate: -5, transition: { type: 'spring', stiffness: 350, damping: 14 } }
          : {}
      }
      className="relative flex flex-col items-center gap-3 cursor-default select-none"
    >
      {/* Badge circle */}
      <div className="relative">
        {/* Outer glow ring — unlocked only */}
        {unlocked && (
          <div
            className="absolute inset-[-5px] rounded-full"
            style={{
              background: `radial-gradient(circle, ${badge.color}28 0%, transparent 70%)`,
              border: `1px solid ${badge.color}50`,
              animation: 'glow-pulse 2.4s ease-in-out infinite',
            }}
            aria-hidden="true"
          />
        )}

        {/* Main circle */}
        <div
          className="relative z-10 w-16 h-16 sm:w-20 sm:h-20 rounded-full flex items-center justify-center text-2xl sm:text-3xl border-2 transition-all duration-300"
          style={
            unlocked
              ? {
                background: `linear-gradient(145deg, ${badge.color}28 0%, ${badge.color}12 100%)`,
                borderColor: badge.color,
                boxShadow: `0 0 20px ${badge.color}35, inset 0 1px 0 ${badge.color}25`,
              }
              : {
                background: 'var(--bg-raised)',
                borderColor: 'var(--border-faint)',
                filter: 'grayscale(1)',
                opacity: 0.35,
              }
          }
          aria-label={unlocked ? `${badge.id} badge — unlocked` : `${badge.id} badge — locked`}
        >
          {unlocked ? badge.emoji : '🔒'}
        </div>

        {/* XP chip — unlocked only */}
        {unlocked && (
          <div
            className="absolute -bottom-1.5 -right-1.5 z-20 h-5 px-1.5 rounded-full flex items-center font-mono text-[9px] font-bold border"
            style={{
              background: 'var(--bg-card)',
              borderColor: `${badge.color}60`,
              color: badge.color,
            }}
          >
            +{badge.xp}
          </div>
        )}
      </div>

      {/* Label */}
      <div className="text-center">
        <p
          className="font-heading font-semibold text-[12px] sm:text-[12px] leading-tight text-center w-full truncate px-1"
          style={{ color: unlocked ? 'var(--text-2)' : 'var(--text-4)' }}
        >
          {badge.id.replace(/_/g, ' ').toUpperCase()}
        </p>
        <p
          className="font-mono text-[9px] mt-0.5"
          style={{ color: unlocked ? badge.color : 'var(--text-4)' }}
        >
          STAGE {badge.stage}
        </p>
      </div>
    </motion.div>
  )
}

/* ─── BadgeWall ──────────────────────────────────────────────────────────────── */
export function BadgeWall() {
  return (
    <section
      className="relative py-20 sm:py-28 overflow-hidden"
      id="badges"
      style={{ background: 'var(--bg-base)' }}
    >
      {/* Multi-color ambient glow — energetic */}
      <div
        className="pointer-events-none absolute inset-0"
        aria-hidden="true"
        style={{
          background: `
            radial-gradient(ellipse 50% 35% at 20% 40%, rgba(167,139,250,0.06) 0%, transparent 70%),
            radial-gradient(ellipse 40% 30% at 80% 30%, rgba(96,165,250,0.06) 0%, transparent 70%),
            radial-gradient(ellipse 45% 35% at 50% 80%, rgba(255,184,0,0.05) 0%, transparent 70%)
          `,
        }}
      />

      {/* Dot grid texture */}
      <div
        className="pointer-events-none absolute inset-0"
        aria-hidden="true"
        style={{
          backgroundImage:
            'radial-gradient(rgba(255,184,0,0.08) 1px, transparent 1px)',
          backgroundSize: '32px 32px',
          maskImage:
            'radial-gradient(ellipse 80% 80% at 50% 50%, black 40%, transparent 100%)',
          WebkitMaskImage:
            'radial-gradient(ellipse 80% 80% at 50% 50%, black 40%, transparent 100%)',
        }}
      />

      <div className="relative max-w-5xl mx-auto px-4 sm:px-6">

        {/* ── Section header ── */}
        <motion.div
          className="mb-14 text-center"
          variants={headerVariants}
          initial="hidden"
          whileInView="show"
          viewport={{ once: true, margin: '-60px' }}
        >
          <p
            className="font-mono text-[12px] tracking-[0.28em] uppercase mb-3"
            style={{ color: 'var(--text-brand)' }}
          >
            Your Journey
          </p>
          <h2
            className="font-display leading-none tracking-tight"
            style={{ fontSize: 'clamp(32px, 5.5vw, 72px)', color: 'var(--text-1)' }}
          >
            EVERY STEP EARNS{' '}
            <span style={{ color: 'var(--text-brand)' }}>A BADGE</span>
          </h2>
          <p
            className="mt-4 font-body text-[15px] max-w-md mx-auto"
            style={{ color: 'var(--text-3)' }}
          >
            Level up through 9 stages. Each badge = real XP.{' '}
            <span style={{ color: 'var(--text-2)' }}>Top builders get featured.</span>
          </p>
        </motion.div>

        {/* ── Badge grid ── */}
        <motion.div
          className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-5 gap-x-4 sm:gap-x-6 gap-y-8 sm:gap-y-10 place-items-center"
          variants={gridVariants}
          initial="hidden"
          whileInView="show"
          viewport={{ once: true, margin: '-60px' }}
        >
          {BADGE_ORDER.map((key, i) => (
            <BadgeCard
              key={key}
              badgeKey={key}
              unlocked={i < UNLOCKED_COUNT}
            />
          ))}
        </motion.div>

      </div>
    </section>
  )
}
