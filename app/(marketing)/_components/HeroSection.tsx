'use client'

import Link from 'next/link'
import dynamic from 'next/dynamic'
import { motion, type Variants } from 'framer-motion'
import { useCountdown } from '@/hooks/useCountdown'

/* Three.js — lazy loaded with ssr:false so it never runs during SSR and
   gets code-split into its own chunk, keeping the landing page bundle small. */
const HeroAnimation = dynamic<{ className?: string }>(
  () => import('@/components/three/heroanimation').then((m) => ({ default: m.HeroAnimation })),
  { ssr: false },
)

/* ═══════════════════════════════════════════════════════════════════════════
   Motion variants — total entrance: ~800ms
   Grid fades in (0ms) → eyebrow (100ms) → SUPER (200ms) → BUILDERS (280ms)
   → sub-headline (380ms) → pills (460ms) → CTAs (560ms) → stats (660ms)
═══════════════════════════════════════════════════════════════════════════ */
const EASE_OUT: [number, number, number, number] = [0.16, 1, 0.3, 1]

const stagger: Variants = {
  hidden: {},
  show: {
    transition: { staggerChildren: 0.08, delayChildren: 0.1 },
  },
}

const fadeUp: Variants = {
  hidden: { opacity: 0, y: 28 },
  show: { opacity: 1, y: 0, transition: { duration: 0.6, ease: EASE_OUT } },
}

const fadeIn: Variants = {
  hidden: { opacity: 0 },
  show: { opacity: 1, transition: { duration: 0.9, ease: 'easeOut' } },
}

/* ═══════════════════════════════════════════════════════════════════════════
   Pill component
═══════════════════════════════════════════════════════════════════════════ */
type PillColor = 'brand' | 'green' | 'blue' | 'purple'

const PILL_STYLES: Record<PillColor, { border: string; bg: string; text: string }> = {
  brand: { border: 'rgba(255,184,0,0.4)', bg: 'rgba(255,184,0,0.07)', text: '#FFB800' },
  green: { border: 'rgba(34,197,94,0.3)', bg: 'rgba(34,197,94,0.08)', text: '#22C55E' },
  blue: { border: 'rgba(96,165,250,0.3)', bg: 'rgba(96,165,250,0.08)', text: '#60A5FA' },
  purple: { border: 'rgba(192,132,252,0.3)', bg: 'rgba(192,132,252,0.08)', text: '#C084FC' },
}

function Pill({ label, color }: { label: string; color: PillColor }) {
  const s = PILL_STYLES[color]
  return (
    <span
      className="inline-flex items-center h-[26px] px-3 rounded-full font-mono text-[13px] tracking-wide border whitespace-nowrap"
      style={{ borderColor: s.border, background: s.bg, color: s.text }}
    >
      {label}
    </span>
  )
}

/* ═══════════════════════════════════════════════════════════════════════════
   Perspective grid overlay
   Lines fan out from the top vanishing point — "entering the arena"
═══════════════════════════════════════════════════════════════════════════ */
function PerspectiveGrid() {
  return (
    <motion.div
      variants={fadeIn}
      initial="hidden"
      animate="show"
      className="pointer-events-none absolute inset-0 overflow-hidden"
      aria-hidden="true"
    >
      {/* main perspective grid */}
      <div
        style={{
          position: 'absolute',
          top: 0,
          left: '-20%',
          right: '-20%',
          height: '70%',
          backgroundImage: `
            repeating-linear-gradient(
              rgba(255,184,0,0.07) 0px, rgba(255,184,0,0.07) 1px,
              transparent 1px, transparent 80px
            ),
            repeating-linear-gradient(
              90deg,
              rgba(255,184,0,0.07) 0px, rgba(255,184,0,0.07) 1px,
              transparent 1px, transparent 80px
            )
          `,
          transform: 'perspective(280px) rotateX(-52deg)',
          transformOrigin: 'top center',
          maskImage:
            'linear-gradient(to bottom, transparent 0%, rgba(0,0,0,0.6) 25%, rgba(0,0,0,0.3) 60%, transparent 95%)',
          WebkitMaskImage:
            'linear-gradient(to bottom, transparent 0%, rgba(0,0,0,0.6) 25%, rgba(0,0,0,0.3) 60%, transparent 95%)',
        }}
      />

      {/* secondary fine grid — tighter spacing for depth */}
      <div
        style={{
          position: 'absolute',
          top: 0,
          left: '-10%',
          right: '-10%',
          height: '45%',
          backgroundImage: `
            repeating-linear-gradient(
              rgba(255,184,0,0.04) 0px, rgba(255,184,0,0.04) 1px,
              transparent 1px, transparent 20px
            ),
            repeating-linear-gradient(
              90deg,
              rgba(255,184,0,0.04) 0px, rgba(255,184,0,0.04) 1px,
              transparent 1px, transparent 20px
            )
          `,
          transform: 'perspective(200px) rotateX(-52deg)',
          transformOrigin: 'top center',
          maskImage:
            'linear-gradient(to bottom, rgba(0,0,0,0.3) 0%, rgba(0,0,0,0.1) 50%, transparent 90%)',
          WebkitMaskImage:
            'linear-gradient(to bottom, rgba(0,0,0,0.3) 0%, rgba(0,0,0,0.1) 50%, transparent 90%)',
        }}
      />
    </motion.div>
  )
}

/* ═══════════════════════════════════════════════════════════════════════════
   HeroSection
═══════════════════════════════════════════════════════════════════════════ */
export function HeroSection({
  hackathonStartISO,
  regDeadlineISO,
}: {
  hackathonStartISO: string
  regDeadlineISO: string
}) {
  const { days: hackDays, expired: hackStarted } = useCountdown(new Date(hackathonStartISO))
  const { days: regDays, expired: regClosed } = useCountdown(new Date(regDeadlineISO))

  const daysLabel = regClosed
    ? hackStarted
      ? 'Live Now'
      : `${hackDays}d to Hackathon`
    : `${regDays}d to Register`

  return (
    <section
      className="relative min-h-screen overflow-hidden"
      style={{ background: 'var(--bg-void)' }}
    >
      {/* ── Background: radial gold glow at center-top ── */}
      <div
        className="pointer-events-none absolute inset-x-0 top-0 h-[65%]"
        style={{
          background:
            'radial-gradient(ellipse 90% 55% at 50% 0%, rgba(255,184,0,0.12) 0%, rgba(255,184,0,0.04) 45%, transparent 70%)',
        }}
        aria-hidden="true"
      />

      {/* ── Perspective grid overlay ── */}
      <PerspectiveGrid />

      {/* ── Thin gold horizon line ── */}
      <div
        className="pointer-events-none absolute md:top-[72px] inset-x-0 h-px"
        style={{
          background:
            'linear-gradient(90deg, transparent 0%, rgba(255,184,0,0.25) 30%, rgba(255,184,0,0.25) 70%, transparent 100%)',
        }}
        aria-hidden="true"
      />

      {/* ── Main content ── */}
      <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-[52px] min-h-screen flex flex-col items-center md:flex-row md:items-center">

        {/* ── Badge column — top on mobile, right on desktop ── */}
        <motion.div
          className="md:order-2 w-full md:flex-1 flex items-center justify-center pt-10 md:pt-0 pb-2 md:pb-0"
          initial={{ opacity: 0, scale: 0.82, rotate: -6 }}
          animate={{ opacity: 1, scale: 1, rotate: 0 }}
          transition={{
            duration: 0.9,
            delay: 0.25,
            ease: [0.34, 1.56, 0.64, 1], // spring
          }}
        >
          <HeroAnimation className="w-[230px] h-[230px] sm:w-[300px] sm:h-[300px] md:w-[420px] md:h-[420px] lg:w-[560px] lg:h-[560px]" />
        </motion.div>

        {/* ── Text column — bottom on mobile, left on desktop ── */}
        <motion.div
          className="md:order-1 md:flex-[1.15] flex flex-col items-center md:items-start text-center md:text-left pb-16 md:pb-0"
          variants={stagger}
          initial="hidden"
          animate="show"
        >
          {/* Eyebrow */}
          <motion.p
            variants={fadeUp}
            className="font-mono text-[12px] tracking-[0.28em] uppercase mb-5"
            style={{ color: 'var(--text-brand)' }}
          >
            ZER0.PRO PRESENTS · SEASON 1 · 2026
          </motion.p>

          {/* Headline */}
          <div className="mb-3" aria-label="Super Builders">
            <motion.div variants={fadeUp} aria-hidden="true">
              <span
                className="block font-display leading-[0.88] tracking-[-0.01em] text-white"
                style={{ fontSize: 'clamp(72px, 11vw, 140px)' }}
              >
                SUPER
              </span>
            </motion.div>
            <motion.div variants={fadeUp} aria-hidden="true">
              <span
                className="block font-display leading-[0.88] tracking-[-0.01em]"
                style={{
                  fontSize: 'clamp(72px, 11vw, 140px)',
                  color: 'var(--text-brand)',
                  textShadow: '0 0 60px rgba(255,184,0,0.35)',
                }}
              >
                BUILDERS
              </span>
            </motion.div>
          </div>

          {/* Sub-headline */}
          <motion.p
            variants={fadeUp}
            className="font-heading font-light text-xl tracking-[0.25em] uppercase mb-7"
            style={{ color: 'var(--text-2)' }}
          >
            SCHOOL EDITION
          </motion.p>

          {/* Pill row */}
          <motion.div
            variants={fadeUp}
            className="flex flex-wrap justify-center md:justify-start gap-2 mb-8"
          >
            <Pill label="Class 8–12" color="brand" />
            <Pill label="Hybrid Mode" color="green" />
            <Pill label="₹1,00,000+ Prize Pool" color="purple" />
            <Pill label="Jun 7–8, 2026" color="blue" />
          </motion.div>

          {/* CTA buttons */}
          <motion.div
            variants={fadeUp}
            className="flex flex-col sm:flex-row gap-3 w-full sm:w-auto"
          >
            {/* Primary — Framer bounce on hover */}
            <motion.div
              whileHover={{ scale: 1.04, y: -3 }}
              whileTap={{ scale: 0.97 }}
              transition={{ type: 'spring', stiffness: 420, damping: 12 }}
            >
              <Link
                href="/register/stage-1"
                className="flex items-center justify-center gap-2 h-[54px] px-8 rounded-[4px] font-heading font-bold tracking-[0.1em] uppercase text-[14px] text-black w-full sm:w-auto transition-all duration-150 touch-manipulation active:opacity-70 active:scale-95"
                style={{
                  background: 'var(--brand)',
                  boxShadow:
                    '0 0 0 1px rgba(255,184,0,0.4), 0 4px 24px rgba(255,184,0,0.35)',
                }}
              >
                Claim Your Spot
              </Link>
            </motion.div>

            {/* Secondary */}
            <motion.div
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.97 }}
              transition={{ type: 'spring', stiffness: 400, damping: 14 }}
            >
              <Link
                href="#parents"
                className="flex items-center justify-center gap-2 h-[54px] px-7 rounded-[4px] font-heading font-semibold tracking-[0.08em] uppercase text-[13px] border transition-all duration-150 touch-manipulation active:opacity-70 active:scale-95 w-full sm:w-auto"
                style={{
                  borderColor: 'var(--border-subtle)',
                  color: 'var(--text-2)',
                }}
                onMouseEnter={(e) => {
                  const el = e.currentTarget as HTMLElement
                  el.style.borderColor = 'var(--border-brand)'
                  el.style.color = 'var(--text-brand)'
                }}
                onMouseLeave={(e) => {
                  const el = e.currentTarget as HTMLElement
                  el.style.borderColor = 'var(--border-subtle)'
                  el.style.color = 'var(--text-2)'
                }}
              >
                For Parents →
              </Link>
            </motion.div>
          </motion.div>
        </motion.div>
      </div>

      {/* ── Scroll nudge — bottom center ── */}
      <motion.div
        className="absolute bottom-8 left-1/2 -translate-x-1/2 hidden md:flex flex-col items-center gap-2"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 1.2, duration: 0.6 }}
        aria-hidden="true"
      >
        <span
          className="font-mono text-[9px] tracking-[0.25em] uppercase"
          style={{ color: 'var(--text-4)' }}
        >
          Scroll
        </span>
        <motion.div
          animate={{ y: [0, 5, 0] }}
          transition={{ duration: 1.6, repeat: Infinity, ease: 'easeInOut' }}
          className="w-px h-8 rounded-full"
          style={{
            background:
              'linear-gradient(to bottom, var(--brand), transparent)',
          }}
        />
      </motion.div>
    </section>
  )
}
