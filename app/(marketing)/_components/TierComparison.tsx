'use client'

import Link from 'next/link'
import { motion, type Variants } from 'framer-motion'

/* ─── constants ─────────────────────────────────────────────────────────────── */
const EASE_OUT = [0.16, 1, 0.3, 1] as const

const FEATURES = [
  '3 live AI workshops',
  'Group mentorship sessions',
  '24-hour hackathon access',
  'Participation certificate + digital badge',
  '₹1,00,000+ prize pool',
  'Leaderboard + XP system',
  'Discord community access',
]

/* ─── variants ──────────────────────────────────────────────────────────────── */
const soloCard: Variants = {
  hidden: { opacity: 0, x: -48 },
  show: { opacity: 1, x: 0, transition: { duration: 0.65, ease: EASE_OUT } },
}

const teamCard: Variants = {
  hidden: { opacity: 0, x: 48 },
  show: { opacity: 1, x: 0, transition: { duration: 0.65, ease: EASE_OUT } },
}

const headerAnim: Variants = {
  hidden: { opacity: 0, y: 20 },
  show: { opacity: 1, y: 0, transition: { duration: 0.55, ease: EASE_OUT } },
}

/* ─── FeatureRow ────────────────────────────────────────────────────────────── */
function FeatureRow({ feature, accent }: { feature: string; accent: string }) {
  return (
    <li className="flex items-start gap-3 py-2.5 border-b last:border-0" style={{ borderColor: 'var(--border-faint)' }}>
      <span
        className="mt-[1px] flex-shrink-0 w-4 h-4 rounded-full flex items-center justify-center text-[12px] font-bold"
        style={{ background: `${accent}20`, color: accent }}
        aria-hidden="true"
      >
        ✓
      </span>
      <span className="font-body text-[13px] leading-snug" style={{ color: 'var(--text-2)' }}>
        {feature}
      </span>
    </li>
  )
}

/* ─── TierComparison ────────────────────────────────────────────────────────── */
export function TierComparison() {
  return (
    <section
      className="relative py-20 sm:py-28 overflow-hidden"
      id="pricing"
      style={{ background: 'var(--bg-base)' }}
    >
      {/* Radial background accent */}
      <div
        className="pointer-events-none absolute inset-0"
        aria-hidden="true"
        style={{
          background:
            'radial-gradient(ellipse 60% 40% at 70% 50%, rgba(255,184,0,0.05) 0%, transparent 70%)',
        }}
      />

      <div className="relative max-w-5xl mx-auto px-4 sm:px-6">

        {/* ── Section header ── */}
        <motion.div
          className="mb-14 text-center"
          variants={headerAnim}
          initial="hidden"
          whileInView="show"
          viewport={{ once: true, margin: '-60px' }}
        >
          <p
            className="font-mono text-[12px] tracking-[0.28em] uppercase mb-3"
            style={{ color: 'var(--text-brand)' }}
          >
            Simple Pricing
          </p>
          <h2
            className="font-display leading-none tracking-tight"
            style={{ fontSize: 'clamp(36px, 6vw, 80px)', color: 'var(--text-1)' }}
          >
            SOLO OR{' '}
            <span style={{ color: 'var(--text-brand)' }}>TEAM</span>
          </h2>
          <p
            className="mt-4 font-body text-[15px] max-w-md mx-auto"
            style={{ color: 'var(--text-3)' }}
          >
            Same programme, same prizes. Teams of 2–3 pay less per head.
          </p>
        </motion.div>

        {/* ── Cards ── */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-5 md:items-stretch">

          {/* ── SOLO card ── */}
          <motion.div
            variants={soloCard}
            initial="hidden"
            whileInView="show"
            viewport={{ once: true, margin: '-60px' }}
            className="relative rounded-[6px] border p-7 flex flex-col"
            style={{
              background: 'var(--bg-card)',
              borderColor: 'var(--border-subtle)',
            }}
          >
            <p
              className="font-mono text-[9px] tracking-[0.22em] uppercase mb-2"
              style={{ color: 'var(--text-3)' }}
            >
              Individual
            </p>

            <h3
              className="font-display leading-none mb-5"
              style={{ fontSize: 'clamp(40px, 5vw, 56px)', color: 'var(--text-1)' }}
            >
              Solo
            </h3>

            <div className="mb-6">
              <span
                className="font-heading font-extrabold"
                style={{ fontSize: 'clamp(28px, 4vw, 36px)', color: 'var(--text-brand)' }}
              >
                ₹3,499
              </span>
              <p
                className="font-mono text-[12px] mt-1 tracking-wide"
                style={{ color: 'var(--text-4)' }}
              >
                One-time · per student
              </p>
            </div>

            <ul className="mb-8 flex-1">
              {FEATURES.map((f) => (
                <FeatureRow key={f} feature={f} accent="#22C55E" />
              ))}
            </ul>

            <Link
              href="/dashboard/apply"
              className="flex items-center justify-center h-[50px] rounded-[4px] border font-heading font-bold text-[13px] tracking-[0.1em] uppercase transition-all duration-150 touch-manipulation active:opacity-70 active:scale-95"
              style={{
                borderColor: 'var(--border-soft)',
                color: 'var(--text-2)',
              }}
              onMouseEnter={(e) => {
                const el = e.currentTarget as HTMLElement
                el.style.borderColor = 'var(--border-brand)'
                el.style.color = 'var(--text-brand)'
              }}
              onMouseLeave={(e) => {
                const el = e.currentTarget as HTMLElement
                el.style.borderColor = 'var(--border-soft)'
                el.style.color = 'var(--text-2)'
              }}
            >
              Register Solo
            </Link>
          </motion.div>

          {/* ── TEAM card ── */}
          <motion.div
            variants={teamCard}
            initial="hidden"
            whileInView="show"
            viewport={{ once: true, margin: '-60px' }}
            className="relative rounded-[6px] border p-7 flex flex-col"
            style={{
              background: 'var(--bg-float)',
              borderColor: 'rgba(255,184,0,0.45)',
              boxShadow: '0 0 0 1px rgba(255,184,0,0.15), 0 8px 48px rgba(255,184,0,0.12), inset 0 1px 0 rgba(255,184,0,0.1)',
            }}
          >
            {/* Save badge */}
            <div
              className="absolute -top-3.5 left-1/2 -translate-x-1/2 inline-flex items-center gap-1.5 px-4 h-7 rounded-full border font-mono text-[12px] tracking-wider uppercase font-semibold whitespace-nowrap"
              style={{
                background: 'var(--brand)',
                borderColor: 'rgba(255,184,0,0.6)',
                color: '#000',
              }}
            >
              💰 Save ₹500/head
            </div>

            {/* Corner glow accent */}
            <div
              className="pointer-events-none absolute top-0 right-0 w-32 h-32 rounded-br-[6px] rounded-tl-full"
              aria-hidden="true"
              style={{
                background:
                  'radial-gradient(circle at top right, rgba(255,184,0,0.12) 0%, transparent 70%)',
              }}
            />

            <p
              className="font-mono text-[9px] tracking-[0.22em] uppercase mb-2"
              style={{ color: 'var(--text-brand)' }}
            >
              Team of 2–3
            </p>

            <h3
              className="font-display leading-none mb-5"
              style={{ fontSize: 'clamp(40px, 5vw, 56px)', color: 'var(--text-brand)' }}
            >
              Team
            </h3>

            <div className="mb-2">
              <span
                className="font-heading font-extrabold"
                style={{ fontSize: 'clamp(28px, 4vw, 36px)', color: 'var(--text-brand)' }}
              >
                ₹2,999
              </span>
              <span
                className="font-heading font-medium text-lg ml-1.5"
                style={{ color: 'var(--text-3)' }}
              >
                /head
              </span>
              <p
                className="font-mono text-[12px] mt-1 tracking-wide"
                style={{ color: 'var(--text-4)' }}
              >
                One-time · 2–3 members
              </p>
            </div>

            {/* Savings callout */}
            <div
              className="mb-6 px-3.5 py-2.5 rounded-[4px] border"
              style={{
                background: 'rgba(255,184,0,0.07)',
                borderColor: 'rgba(255,184,0,0.25)',
              }}
            >
              <p
                className="font-mono text-[13px] font-semibold"
                style={{ color: 'var(--text-brand)' }}
              >
                One person creates the team → share the code with your friends
              </p>
            </div>

            <ul className="mb-8 flex-1">
              {FEATURES.map((f) => (
                <FeatureRow key={f} feature={f} accent="#FFB800" />
              ))}
            </ul>

            <Link
              href="/dashboard/apply"
              className="flex items-center justify-center gap-2 h-[50px] rounded-[4px] font-heading font-bold text-[13px] tracking-[0.1em] uppercase transition-all duration-150 touch-manipulation active:opacity-70 active:scale-95 text-black"
              style={{
                background: 'var(--brand)',
                boxShadow: '0 0 0 1px rgba(255,184,0,0.4), 0 4px 24px rgba(255,184,0,0.3)',
              }}
              onMouseEnter={(e) => {
                const el = e.currentTarget as HTMLElement
                el.style.background = 'var(--brand-bright)'
                el.style.boxShadow = '0 0 0 1px rgba(255,184,0,0.6), 0 6px 32px rgba(255,184,0,0.45)'
              }}
              onMouseLeave={(e) => {
                const el = e.currentTarget as HTMLElement
                el.style.background = 'var(--brand)'
                el.style.boxShadow = '0 0 0 1px rgba(255,184,0,0.4), 0 4px 24px rgba(255,184,0,0.3)'
              }}
            >
              Register as Team
            </Link>
          </motion.div>
        </div>

        {/* ── Footer note ── */}
        <motion.p
          className="text-center font-mono text-[12px] mt-8 tracking-wide"
          style={{ color: 'var(--text-4)' }}
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6, delay: 0.4 }}
        >
          🔒 Secure payment via Razorpay · Refund policy applies · Spots limited per grade
        </motion.p>
      </div>
    </section>
  )
}
