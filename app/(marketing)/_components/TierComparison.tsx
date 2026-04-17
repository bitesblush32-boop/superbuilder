'use client'

import Link from 'next/link'
import { motion, type Variants } from 'framer-motion'
import { TIERS } from '@/lib/content/programme'

/* ─── constants ─────────────────────────────────────────────────────────────── */
const EASE_OUT = [0.16, 1, 0.3, 1] as const

// All features in display order (superset of both tiers)
const ALL_FEATURES = [
  '3 live workshops',
  '3 workshops + bonus session',
  'Group mentorship',
  '1:1 mentor (2 slots)',
  'Participation certificate',
  'Verified LinkedIn certificate',
  'Digital badge',
  'T-shirt + premium kit',
  'Priority judging',
  'Parent progress report',
  'EMI available',
] as const

// What each tier actually has (for the ✓ / — check)
const PRO_HAS = new Set([
  '3 live workshops',
  'Group mentorship',
  'Participation certificate',
  'Digital badge',
])

const PREMIUM_HAS = new Set([
  '3 workshops + bonus session',
  '1:1 mentor (2 slots)',
  'Verified LinkedIn certificate',
  'T-shirt + premium kit',
  'Priority judging',
  'Parent progress report',
  'EMI available',
])

/* ─── variants ──────────────────────────────────────────────────────────────── */
const proCard: Variants = {
  hidden: { opacity: 0, x: -48 },
  show:   { opacity: 1, x: 0, transition: { duration: 0.65, ease: EASE_OUT } },
}

const premiumCard: Variants = {
  hidden: { opacity: 0, x: 48 },
  show:   { opacity: 1, x: 0, transition: { duration: 0.65, ease: EASE_OUT } },
}

const headerAnim: Variants = {
  hidden: { opacity: 0, y: 20 },
  show:   { opacity: 1, y: 0, transition: { duration: 0.55, ease: EASE_OUT } },
}

/* ─── FeatureRow ────────────────────────────────────────────────────────────── */
function FeatureRow({
  feature,
  included,
  accent,
}: {
  feature:  string
  included: boolean
  accent:   string
}) {
  return (
    <li className="flex items-start gap-3 py-2.5 border-b last:border-0" style={{ borderColor: 'var(--border-faint)' }}>
      <span
        className="mt-[1px] flex-shrink-0 w-4 h-4 rounded-full flex items-center justify-center text-[12px] font-bold"
        style={
          included
            ? { background: `${accent}20`, color: accent }
            : { background: 'rgba(255,255,255,0.04)', color: 'var(--text-4)' }
        }
        aria-hidden="true"
      >
        {included ? '✓' : '—'}
      </span>
      <span
        className="font-body text-[13px] leading-snug"
        style={{ color: included ? 'var(--text-2)' : 'var(--text-4)' }}
      >
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
      id="tiers"
      style={{ background: 'var(--bg-base)' }}
    >
      {/* Diagonal brand gradient sweep — asymmetric background detail */}
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
            Choose Your Path
          </p>
          <h2
            className="font-display leading-none tracking-tight"
            style={{ fontSize: 'clamp(36px, 6vw, 80px)', color: 'var(--text-1)' }}
          >
            PRO VS{' '}
            <span style={{ color: 'var(--text-brand)' }}>PREMIUM</span>
          </h2>
          <p
            className="mt-4 font-body text-[15px] max-w-md mx-auto"
            style={{ color: 'var(--text-3)' }}
          >
            Both get you into the arena. Premium gets you the edge.
          </p>
        </motion.div>

        {/* ── Cards ── */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-5 md:items-stretch">

          {/* ── PRO card ── */}
          <motion.div
            variants={proCard}
            initial="hidden"
            whileInView="show"
            viewport={{ once: true, margin: '-60px' }}
            className="relative rounded-[6px] border p-7 flex flex-col"
            style={{
              background:  'var(--bg-card)',
              borderColor: 'var(--border-subtle)',
            }}
          >
            {/* Tier label */}
            <p
              className="font-mono text-[9px] tracking-[0.22em] uppercase mb-2"
              style={{ color: 'var(--text-3)' }}
            >
              Tier 01
            </p>

            {/* Name */}
            <h3
              className="font-display leading-none mb-5"
              style={{ fontSize: 'clamp(40px, 5vw, 56px)', color: 'var(--text-1)' }}
            >
              {TIERS.pro.name}
            </h3>

            {/* Price */}
            <div className="mb-6">
              <span
                className="font-heading font-extrabold"
                style={{ fontSize: 'clamp(28px, 4vw, 36px)', color: 'var(--text-brand)' }}
              >
                ₹{TIERS.pro.priceMin.toLocaleString('en-IN')}
              </span>
              <span
                className="font-heading font-medium text-lg ml-1"
                style={{ color: 'var(--text-3)' }}
              >
                – ₹{TIERS.pro.priceMax.toLocaleString('en-IN')}
              </span>
              <p
                className="font-mono text-[12px] mt-1 tracking-wide"
                style={{ color: 'var(--text-4)' }}
              >
                One-time · Early bird pricing
              </p>
            </div>

            {/* Features */}
            <ul className="mb-8 flex-1">
              {ALL_FEATURES.map((f) => (
                <FeatureRow
                  key={f}
                  feature={f}
                  included={PRO_HAS.has(f)}
                  accent="#22C55E"
                />
              ))}
            </ul>

            {/* CTA */}
            <Link
              href="/register/stage-1"
              className="flex items-center justify-center h-[50px] rounded-[4px] border font-heading font-bold text-[13px] tracking-[0.1em] uppercase transition-all duration-150"
              style={{
                borderColor: 'var(--border-soft)',
                color:       'var(--text-2)',
              }}
              onMouseEnter={(e) => {
                const el = e.currentTarget as HTMLElement
                el.style.borderColor = 'var(--border-brand)'
                el.style.color       = 'var(--text-brand)'
              }}
              onMouseLeave={(e) => {
                const el = e.currentTarget as HTMLElement
                el.style.borderColor = 'var(--border-soft)'
                el.style.color       = 'var(--text-2)'
              }}
            >
              Choose Pro
            </Link>
          </motion.div>

          {/* ── PREMIUM card ── */}
          <motion.div
            variants={premiumCard}
            initial="hidden"
            whileInView="show"
            viewport={{ once: true, margin: '-60px' }}
            className="relative rounded-[6px] border p-7 flex flex-col"
            style={{
              background:  'var(--bg-float)',
              borderColor: 'rgba(255,184,0,0.45)',
              boxShadow:   '0 0 0 1px rgba(255,184,0,0.15), 0 8px 48px rgba(255,184,0,0.12), inset 0 1px 0 rgba(255,184,0,0.1)',
            }}
          >
            {/* Most Popular pill */}
            <div
              className="absolute -top-3.5 left-1/2 -translate-x-1/2 inline-flex items-center gap-1.5 px-4 h-7 rounded-full border font-mono text-[12px] tracking-wider uppercase font-semibold whitespace-nowrap"
              style={{
                background:  'var(--brand)',
                borderColor: 'rgba(255,184,0,0.6)',
                color:       '#000',
              }}
            >
              ⭐ Most Popular
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

            {/* Tier label */}
            <p
              className="font-mono text-[9px] tracking-[0.22em] uppercase mb-2"
              style={{ color: 'var(--text-brand)' }}
            >
              Tier 02
            </p>

            {/* Name */}
            <h3
              className="font-display leading-none mb-5"
              style={{ fontSize: 'clamp(40px, 5vw, 56px)', color: 'var(--text-brand)' }}
            >
              {TIERS.premium.name}
            </h3>

            {/* Price */}
            <div className="mb-2">
              <span
                className="font-heading font-extrabold"
                style={{ fontSize: 'clamp(28px, 4vw, 36px)', color: 'var(--text-brand)' }}
              >
                ₹{TIERS.premium.priceMin.toLocaleString('en-IN')}
              </span>
              <span
                className="font-heading font-medium text-lg ml-1"
                style={{ color: 'var(--text-3)' }}
              >
                – ₹{TIERS.premium.priceMax.toLocaleString('en-IN')}
              </span>
              <p
                className="font-mono text-[12px] mt-1 tracking-wide"
                style={{ color: 'var(--text-4)' }}
              >
                One-time · Early bird pricing
              </p>
            </div>

            {/* EMI highlight — prominent */}
            <div
              className="mb-6 px-3.5 py-2.5 rounded-[4px] border"
              style={{
                background:  'rgba(255,184,0,0.07)',
                borderColor: 'rgba(255,184,0,0.25)',
              }}
            >
              <p
                className="font-mono text-[11px] font-semibold"
                style={{ color: 'var(--text-brand)' }}
              >
                Or pay ₹{TIERS.premium.emiFirst} now + rest in 1 week
              </p>
            </div>

            {/* Features */}
            <ul className="mb-8 flex-1">
              {ALL_FEATURES.map((f) => (
                <FeatureRow
                  key={f}
                  feature={f}
                  included={PREMIUM_HAS.has(f)}
                  accent="#FFB800"
                />
              ))}
            </ul>

            {/* CTA */}
            <Link
              href="/register/stage-1"
              className="flex items-center justify-center gap-2 h-[50px] rounded-[4px] font-heading font-bold text-[13px] tracking-[0.1em] uppercase transition-all duration-150 text-black"
              style={{
                background: 'var(--brand)',
                boxShadow:  '0 0 0 1px rgba(255,184,0,0.4), 0 4px 24px rgba(255,184,0,0.3)',
              }}
              onMouseEnter={(e) => {
                const el = e.currentTarget as HTMLElement
                el.style.background = 'var(--brand-bright)'
                el.style.boxShadow  = '0 0 0 1px rgba(255,184,0,0.6), 0 6px 32px rgba(255,184,0,0.45)'
              }}
              onMouseLeave={(e) => {
                const el = e.currentTarget as HTMLElement
                el.style.background = 'var(--brand)'
                el.style.boxShadow  = '0 0 0 1px rgba(255,184,0,0.4), 0 4px 24px rgba(255,184,0,0.3)'
              }}
            >
              Choose Premium
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
