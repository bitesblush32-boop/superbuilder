'use client'

import { useRef, useEffect } from 'react'
import {
  motion,
  useMotionValue,
  useTransform,
  animate,
  useInView,
  type Variants,
} from 'framer-motion'
import { cn } from '@/lib/utils'

/* ─── Data ──────────────────────────────────────────────────────────────────── */
const EASE_OUT = [0.16, 1, 0.3, 1] as const

const STATS = [
  {
    id:      'registered',
    numeric: true  as const,
    to:      2847,
    prefix:  '',
    suffix:  '',
    label:   'Registered',
    accent:  '#FFB800',
  },
  {
    id:      'cities',
    numeric: true  as const,
    to:      38,
    prefix:  '',
    suffix:  '+',
    label:   'Cities',
    accent:  '#22C55E',
  },
  {
    id:      'prize',
    numeric: true  as const,
    to:      100000,
    prefix:  '₹',
    suffix:  '+',
    label:   'Prize Pool',
    accent:  '#C084FC',
  },
  {
    id:      'date',
    numeric: false as const,
    display: 'Jun 7–8',
    label:   '2025 Hackathon',
    accent:  '#60A5FA',
  },
] as const

/* ─── Variants ───────────────────────────────────────────────────────────────── */
const containerVariants: Variants = {
  hidden: {},
  show:   { transition: { staggerChildren: 0.1 } },
}

const statVariants: Variants = {
  hidden: { opacity: 0, y: 14 },
  show:   { opacity: 1, y: 0, transition: { duration: 0.55, ease: EASE_OUT } },
}

/* ─── CountUp ────────────────────────────────────────────────────────────────── */
function CountUp({
  to,
  prefix = '',
  suffix = '',
  accent,
}: {
  to:      number
  prefix?: string
  suffix?: string
  accent:  string
}) {
  const ref     = useRef<HTMLSpanElement>(null)
  const inView  = useInView(ref, { once: true, margin: '-40px' })
  const count   = useMotionValue(0)

  // Format with Indian locale: 100000 → "1,00,000"
  const display = useTransform(count, (v) =>
    Math.round(v).toLocaleString('en-IN'),
  )

  useEffect(() => {
    if (!inView) return
    const controls = animate(count, to, { duration: 1.8, ease: EASE_OUT })
    return () => controls.stop()
  }, [inView, count, to])

  return (
    <span ref={ref} className="tabular-nums">
      {prefix && (
        <span className="font-display" style={{ color: accent }}>
          {prefix}
        </span>
      )}
      <motion.span className="font-display" style={{ color: accent }}>
        {display}
      </motion.span>
      {suffix && (
        <span className="font-display" style={{ color: accent }}>
          {suffix}
        </span>
      )}
    </span>
  )
}

/* ─── StatsBar ───────────────────────────────────────────────────────────────── */
export function StatsBar() {
  return (
    <section
      className="relative w-full border-y overflow-hidden"
      style={{
        background:   'var(--bg-raised)',
        borderColor:  'var(--border-faint)',
      }}
      id="stats"
      aria-label="Programme statistics"
    >
      {/* Subtle grid texture */}
      <div
        className="pointer-events-none absolute inset-0"
        aria-hidden="true"
        style={{
          backgroundImage: `
            repeating-linear-gradient(rgba(255,184,0,0.025) 0 1px, transparent 1px 48px),
            repeating-linear-gradient(90deg, rgba(255,184,0,0.025) 0 1px, transparent 1px 48px)
          `,
        }}
      />

      <motion.div
        className="relative max-w-7xl mx-auto grid grid-cols-2 md:grid-cols-4"
        variants={containerVariants}
        initial="hidden"
        whileInView="show"
        viewport={{ once: true, margin: '-60px' }}
      >
        {STATS.map((stat, i) => (
          <motion.div
            key={stat.id}
            variants={statVariants}
            className={cn(
              'flex flex-col items-center justify-center py-10 px-6 relative',
              // Mobile 2×2: left-column gets right border, top-row gets bottom border
              i % 2 === 0 && i < 3 && 'border-r',
              i < 2          && 'border-b md:border-b-0',
              // Desktop 1×4: all except last get right border
              i >= 1 && i < 3 && 'md:border-r',
            )}
            style={{ borderColor: 'var(--border-faint)' }}
          >
            {/* Accent dot — top of card */}
            <div
              className="absolute top-0 left-1/2 -translate-x-1/2 w-8 h-px"
              style={{ background: stat.accent, opacity: 0.6 }}
              aria-hidden="true"
            />

            {/* Main value */}
            <div
              className="font-display leading-none tracking-tight mb-1.5"
              style={{ fontSize: 'clamp(40px, 5vw, 64px)' }}
            >
              {stat.numeric ? (
                <CountUp
                  to={stat.to}
                  prefix={stat.prefix}
                  suffix={stat.suffix}
                  accent={stat.accent}
                />
              ) : (
                <span style={{ color: stat.accent }}>{stat.display}</span>
              )}
            </div>

            {/* Label */}
            <p
              className="font-mono text-[10px] tracking-[0.2em] uppercase"
              style={{ color: 'var(--text-3)' }}
            >
              {stat.label}
            </p>
          </motion.div>
        ))}
      </motion.div>
    </section>
  )
}
