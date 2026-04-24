'use client'

import Link from 'next/link'
import { motion, type Variants } from 'framer-motion'
import { useCountdown } from '@/hooks/useCountdown'

/* ─── Constants ──────────────────────────────────────────────────────────────── */
const EASE_OUT = [0.16, 1, 0.3, 1] as const

/* ─── Variants ───────────────────────────────────────────────────────────────── */
const containerVariants: Variants = {
  hidden: {},
  show: { transition: { staggerChildren: 0.1, delayChildren: 0.05 } },
}

const fadeUpVariants: Variants = {
  hidden: { opacity: 0, y: 24 },
  show: { opacity: 1, y: 0, transition: { duration: 0.6, ease: EASE_OUT } },
}

/* ─── CountdownUnit ──────────────────────────────────────────────────────────── */
function CountdownUnit({ value, label }: { value: number; label: string }) {
  const display = String(value).padStart(2, '0')
  return (
    <div className="flex flex-col items-center gap-1">
      <div
        className="relative w-[46px] sm:w-[64px] h-[40px] sm:h-[56px] rounded-[4px] border flex items-center justify-center font-display leading-none"
        style={{
          fontSize: 'clamp(20px, 5vw, 40px)',
          background: 'rgba(255,184,0,0.06)',
          borderColor: 'rgba(255,184,0,0.25)',
          color: 'var(--text-brand)',
          boxShadow: '0 0 20px rgba(255,184,0,0.1), inset 0 1px 0 rgba(255,184,0,0.08)',
        }}
      >
        {display}
        {/* Top reflection */}
        <div
          className="absolute top-0 inset-x-0 h-1/2 rounded-t-[3px]"
          style={{ background: 'linear-gradient(to bottom, rgba(255,184,0,0.04), transparent)' }}
          aria-hidden="true"
        />
      </div>
      <span
        className="font-mono text-[8px] sm:text-[9px] tracking-[0.18em] uppercase"
        style={{ color: 'var(--text-4)' }}
      >
        {label}
      </span>
    </div>
  )
}

/* ─── FinalCTA ───────────────────────────────────────────────────────────────── */
export function FinalCTA({
  regDeadlineISO,
  regDeadlineDisplay,
}: {
  regDeadlineISO: string
  regDeadlineDisplay: string
}) {
  const { days, hours, mins, secs, expired } = useCountdown(new Date(regDeadlineISO))

  return (
    <section
      className="relative py-24 sm:py-36 overflow-hidden"
      id="register"
      style={{ background: 'var(--bg-void)' }}
    >
      {/* Center radial gold glow */}
      <div
        className="pointer-events-none absolute inset-0"
        aria-hidden="true"
        style={{
          background:
            'radial-gradient(ellipse 70% 60% at 50% 50%, rgba(255,184,0,0.1) 0%, rgba(255,184,0,0.04) 40%, transparent 70%)',
        }}
      />

      {/* Outer edge vignette — keeps focus central */}
      <div
        className="pointer-events-none absolute inset-0"
        aria-hidden="true"
        style={{
          background:
            'radial-gradient(ellipse 100% 100% at 50% 50%, transparent 50%, rgba(0,0,0,0.7) 100%)',
        }}
      />

      {/* Perspective grid — same motif as hero */}
      <div
        className="pointer-events-none absolute inset-x-0 top-0 h-full overflow-hidden"
        aria-hidden="true"
        style={{ opacity: 0.4 }}
      >
        <div
          style={{
            position: 'absolute',
            top: 0,
            left: '-20%',
            right: '-20%',
            height: '60%',
            backgroundImage: `
              repeating-linear-gradient(
                rgba(255,184,0,0.05) 0px, rgba(255,184,0,0.05) 1px,
                transparent 1px, transparent 80px
              ),
              repeating-linear-gradient(
                90deg,
                rgba(255,184,0,0.05) 0px, rgba(255,184,0,0.05) 1px,
                transparent 1px, transparent 80px
              )
            `,
            transform: 'perspective(300px) rotateX(-52deg)',
            transformOrigin: 'top center',
            maskImage:
              'linear-gradient(to bottom, transparent 0%, rgba(0,0,0,0.5) 30%, rgba(0,0,0,0.2) 70%, transparent 100%)',
            WebkitMaskImage:
              'linear-gradient(to bottom, transparent 0%, rgba(0,0,0,0.5) 30%, rgba(0,0,0,0.2) 70%, transparent 100%)',
          }}
        />
      </div>

      <motion.div
        className="relative z-10 max-w-4xl mx-auto px-4 sm:px-6 flex flex-col items-center text-center"
        variants={containerVariants}
        initial="hidden"
        whileInView="show"
        viewport={{ once: true, margin: '-80px' }}
      >

        {/* Eyebrow */}
        <motion.p
          variants={fadeUpVariants}
          className="font-mono text-[12px] tracking-[0.3em] uppercase mb-6"
          style={{ color: 'var(--text-brand)' }}
        >
          Registration closes {regDeadlineDisplay} · Spots limited per grade
        </motion.p>

        {/* Headline */}
        <motion.h2
          variants={fadeUpVariants}
          className="font-display leading-none tracking-tight mb-6"
          style={{
            fontSize: 'clamp(48px, 7vw, 96px)',
            color: 'var(--text-brand)',
            textShadow: '0 0 80px rgba(255,184,0,0.3)',
          }}
        >
          REGISTER BEFORE {regDeadlineDisplay.toUpperCase()}
        </motion.h2>

        {/* Sub-headline */}
        <motion.p
          variants={fadeUpVariants}
          className="font-heading font-light text-[18px] sm:text-[22px] tracking-[0.12em] uppercase mb-12"
          style={{ color: 'var(--text-2)' }}
        >
          65 days of AI &nbsp;·&nbsp; 24 hours of hacking &nbsp;·&nbsp; ₹1,00,000 in prizes
        </motion.p>

        {/* Live countdown */}
        <motion.div variants={fadeUpVariants} className="mb-12">
          {expired ? (
            <p
              className="font-display text-[32px] tracking-wide"
              style={{ color: 'var(--text-brand)' }}
            >
              REGISTRATION CLOSED
            </p>
          ) : (
            <div
              className="flex items-end gap-2 sm:gap-3"
              aria-label={`Registration closes in ${days} days ${hours} hours ${mins} minutes ${secs} seconds`}
            >
              <CountdownUnit value={days} label="Days" />
              <span
                className="font-display leading-none pb-[28px] sm:pb-[32px] text-[20px] sm:text-[28px]"
                style={{ color: 'rgba(255,184,0,0.4)' }}
                aria-hidden="true"
              >
                :
              </span>
              <CountdownUnit value={hours} label="Hours" />
              <span
                className="font-display leading-none pb-[28px] sm:pb-[32px] text-[20px] sm:text-[28px]"
                style={{ color: 'rgba(255,184,0,0.4)' }}
                aria-hidden="true"
              >
                :
              </span>
              <CountdownUnit value={mins} label="Mins" />
              <span
                className="font-display leading-none pb-[28px] sm:pb-[32px] text-[20px] sm:text-[28px]"
                style={{ color: 'rgba(255,184,0,0.4)' }}
                aria-hidden="true"
              >
                :
              </span>
              <CountdownUnit value={secs} label="Secs" />
            </div>
          )}
        </motion.div>

        {/* CTA buttons */}
        <motion.div
          variants={fadeUpVariants}
          className="flex flex-col sm:flex-row gap-3 w-full sm:w-auto"
        >
          {/* Primary */}
          <motion.div
            whileHover={{ scale: 1.04, y: -3 }}
            whileTap={{ scale: 0.97 }}
            transition={{ type: 'spring', stiffness: 420, damping: 12 }}
          >
            <Link
              href="/dashboard/apply"
              className="flex items-center justify-center gap-2 h-[56px] px-10 rounded-[4px] font-heading font-bold tracking-[0.1em] uppercase text-[15px] text-black w-full sm:w-auto transition-all duration-150 touch-manipulation active:opacity-70 active:scale-95"
              style={{
                background: 'var(--brand)',
                boxShadow: '0 0 0 1px rgba(255,184,0,0.5), 0 4px 32px rgba(255,184,0,0.4)',
              }}
            >
              Claim Your Spot
            </Link>
          </motion.div>

          {/* Ghost */}
          <motion.div
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.97 }}
            transition={{ type: 'spring', stiffness: 400, damping: 14 }}
          >
            <a
              href="#"
              className="flex items-center justify-center gap-2 h-[56px] px-8 rounded-[4px] font-heading font-semibold tracking-[0.08em] uppercase text-[13px] border transition-all duration-150 touch-manipulation active:opacity-70 active:scale-95 w-full sm:w-auto"
              style={{
                borderColor: 'var(--border-subtle)',
                color: 'var(--text-3)',
              }}
              onMouseEnter={(e) => {
                const el = e.currentTarget as HTMLElement
                el.style.borderColor = 'var(--border-brand)'
                el.style.color = 'var(--text-brand)'
              }}
              onMouseLeave={(e) => {
                const el = e.currentTarget as HTMLElement
                el.style.borderColor = 'var(--border-subtle)'
                el.style.color = 'var(--text-3)'
              }}
            >
              <svg viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" className="w-4 h-4" aria-hidden="true">
                <path d="M3 17l4-4m0 0l3 3 7-9M7 13V3" />
              </svg>
              Download Brochure
            </a>
          </motion.div>
        </motion.div>

        {/* Small print */}
        <motion.p
          variants={fadeUpVariants}
          className="mt-6 font-mono text-[12px] tracking-wide"
          style={{ color: 'var(--text-4)' }}
        >
          🔒 Full refund if programme doesn&apos;t start &nbsp;·&nbsp; No questions asked &nbsp;·&nbsp; Secure payment via Razorpay
        </motion.p>

      </motion.div>
    </section>
  )
}
