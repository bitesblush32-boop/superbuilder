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

/* ─── Data ──────────────────────────────────────────────────────────────────── */
const EASE_OUT = [0.16, 1, 0.3, 1] as const

const STATS = [
  {
    id: 'registered',
    numeric: true as const,
    to: 2847,
    prefix: '',
    suffix: '',
    label: 'Registered',
    accent: '#FFB800',
  },
  {
    id: 'cities',
    numeric: true as const,
    to: 38,
    prefix: '',
    suffix: '+',
    label: 'Cities',
    accent: '#22C55E',
  },
  {
    id: 'prize',
    numeric: true as const,
    to: 100000,
    prefix: '₹',
    suffix: '+',
    label: 'Prize Pool',
    accent: '#C084FC',
  },
  {
    id: 'date',
    numeric: false as const,
    display: 'Jun 7–8',
    label: '2026 Hackathon',
    accent: '#60A5FA',
  },
] as const

/* ─── Jigsaw SVG paths (viewBox 0 0 100 100, preserveAspectRatio="none") ─────
   Tab protrusion = 7 units = 7% of piece width.
   Desktop (horizontal row of 4):
     Piece 0 → right tab only
     Pieces 1,2 → left blank + right tab
     Piece 3 → left blank only
   Mobile 2×2 (pieces 0-3 in a grid):
     Piece 0 (top-left)   → right tab + bottom tab
     Piece 1 (top-right)  → left blank + bottom tab
     Piece 2 (bottom-left)  → top blank + right tab
     Piece 3 (bottom-right) → top blank + left blank
─────────────────────────────────────────────────────────────────────────────── */
const DESKTOP_PATHS = [
  // Piece 0 — right tab
  'M0,0 L100,0 L100,35 Q107,35 107,50 Q107,65 100,65 L100,100 L0,100 Z',
  // Piece 1 — left blank + right tab
  'M0,0 L100,0 L100,35 Q107,35 107,50 Q107,65 100,65 L100,100 L0,100 L0,65 Q7,65 7,50 Q7,35 0,35 Z',
  // Piece 2 — left blank + right tab
  'M0,0 L100,0 L100,35 Q107,35 107,50 Q107,65 100,65 L100,100 L0,100 L0,65 Q7,65 7,50 Q7,35 0,35 Z',
  // Piece 3 — left blank only
  'M0,0 L100,0 L100,100 L0,100 L0,65 Q7,65 7,50 Q7,35 0,35 Z',
]

const MOBILE_PATHS = [
  // Piece 0 (top-left) — right tab + bottom tab
  'M0,0 L100,0 L100,35 Q107,35 107,50 Q107,65 100,65 L100,100 L65,100 Q65,107 50,107 Q35,107 35,100 L0,100 Z',
  // Piece 1 (top-right) — left blank + bottom tab
  'M0,0 L100,0 L100,100 L65,100 Q65,107 50,107 Q35,107 35,100 L0,100 L0,65 Q7,65 7,50 Q7,35 0,35 Z',
  // Piece 2 (bottom-left) — top blank + right tab
  'M0,0 L35,0 Q35,7 50,7 Q65,7 65,0 L100,0 L100,35 Q107,35 107,50 Q107,65 100,65 L100,100 L0,100 Z',
  // Piece 3 (bottom-right) — top blank + left blank
  'M0,0 L35,0 Q35,7 50,7 Q65,7 65,0 L100,0 L100,100 L0,100 L0,65 Q7,65 7,50 Q7,35 0,35 Z',
]

const BG_RAISED = '#111111'

/* ─── Variants ───────────────────────────────────────────────────────────────── */
const containerVariants: Variants = {
  hidden: {},
  show: { transition: { staggerChildren: 0.1 } },
}

const statVariants: Variants = {
  hidden: { opacity: 0, y: 14 },
  show: { opacity: 1, y: 0, transition: { duration: 0.55, ease: EASE_OUT } },
}

/* ─── PieceSVG — 3-layer jigsaw shape ───────────────────────────────────────── */
function PieceSVG({ path, accent }: { path: string; accent: string }) {
  return (
    <svg
      className="pointer-events-none absolute inset-0 w-full h-full"
      viewBox="0 0 100 100"
      preserveAspectRatio="none"
      style={{ overflow: 'visible', zIndex: 0 }}
      aria-hidden="true"
    >
      {/* Layer 1 — opaque background (covers tab area too) */}
      <path d={path} fill={BG_RAISED} />
      {/* Layer 2 — accent color wash */}
      <path d={path} fill={accent} fillOpacity={0.10} />
      {/* Layer 3 — accent border stroke (1px regardless of scale) */}
      <path
        d={path}
        fill="none"
        stroke={accent}
        strokeOpacity={0.50}
        strokeWidth="1"
        vectorEffect="non-scaling-stroke"
      />
    </svg>
  )
}

/* ─── CountUp ────────────────────────────────────────────────────────────────── */
function CountUp({
  to,
  prefix = '',
  suffix = '',
  accent,
}: {
  to: number
  prefix?: string
  suffix?: string
  accent: string
}) {
  const ref = useRef<HTMLSpanElement>(null)
  const inView = useInView(ref, { once: true, margin: '-40px' })
  const count = useMotionValue(0)

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
      className="relative w-full overflow-visible"
      style={{ background: 'var(--bg-base)' }}
      id="stats"
      aria-label="Programme statistics"
    >
      <motion.div
        className="relative max-w-7xl mx-auto flex flex-wrap md:flex-nowrap"
        variants={containerVariants}
        initial="hidden"
        whileInView="show"
        viewport={{ once: true, margin: '-60px' }}
      >
        {STATS.map((stat, i) => (
          <motion.div
            key={stat.id}
            variants={statVariants}
            className="relative flex basis-1/2 md:basis-auto md:flex-1 flex-col items-center justify-center py-10 px-6"
            style={{ zIndex: (STATS.length - i) * 10 }}
            onMouseEnter={(e) => {
              ;(e.currentTarget as HTMLElement).style.filter = `drop-shadow(0 0 14px ${stat.accent}60)`
            }}
            onMouseLeave={(e) => {
              ;(e.currentTarget as HTMLElement).style.filter = ''
            }}
          >
            {/* Jigsaw SVG — desktop path */}
            <span className="hidden md:contents">
              <PieceSVG path={DESKTOP_PATHS[i]} accent={stat.accent} />
            </span>
            {/* Jigsaw SVG — mobile path */}
            <span className="contents md:hidden">
              <PieceSVG path={MOBILE_PATHS[i]} accent={stat.accent} />
            </span>

            {/* Content — sits above SVG layers */}
            <div className="relative z-10 flex flex-col items-center gap-1.5">
              {/* Main value */}
              <div
                className="font-display leading-none tracking-tight"
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
                className="font-mono text-[12px] tracking-[0.2em] uppercase"
                style={{ color: 'var(--text-3)' }}
              >
                {stat.label}
              </p>
            </div>
          </motion.div>
        ))}
      </motion.div>
    </section>
  )
}
