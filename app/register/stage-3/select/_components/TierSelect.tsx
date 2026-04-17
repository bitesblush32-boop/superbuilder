'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { motion, AnimatePresence } from 'framer-motion'
import { TIERS } from '@/lib/content/programme'
import { useRegistrationStore } from '@/lib/store/registration'

type Bez = [number, number, number, number]
const EASE_OUT: Bez = [0.16, 1, 0.3, 1]

const PRO_FEATURES     = TIERS.pro.features as readonly string[]
const PRO_MISSING      = TIERS.pro.missing  as readonly string[]
const PREMIUM_FEATURES = TIERS.premium.features as readonly string[]

// What Pro is missing — shown as "—" on premium card for comparison
const ALL_COMPARISON = [
  ...PRO_FEATURES,
  ...PRO_MISSING,
]

export function TierSelect() {
  const router = useRouter()
  const { setTier, setIsEmi } = useRegistrationStore()

  const [selected, setSelected]       = useState<'pro' | 'premium' | null>(null)
  const [showEmi, setShowEmi]         = useState(false)
  const [navigating, setNavigating]   = useState(false)

  const PREMIUM_PRICE     = TIERS.premium.priceMin  // 2499
  const PREMIUM_EMI_FIRST = TIERS.premium.emiFirst  // 999
  const PREMIUM_EMI_REST  = PREMIUM_PRICE - PREMIUM_EMI_FIRST // 1500

  function choose(tier: 'pro' | 'premium', emi = false) {
    setSelected(tier)
    setNavigating(true)
    setTier(tier)
    setIsEmi(emi)
    setTimeout(() => router.push('/register/stage-3/pay'), 180)
  }

  return (
    <div className="pb-10">
      {/* Header */}
      <div className="mb-8">
        <h1 className="font-display text-5xl tracking-wide leading-none mb-2" style={{ color: 'var(--text-1)' }}>
          CHOOSE YOUR PATH
        </h1>
        <p className="font-body text-sm" style={{ color: 'var(--text-2)' }}>
          Both paths include the full hackathon. Premium unlocks the full experience.
        </p>
      </div>

      {/* Cards */}
      <div className="flex flex-col sm:flex-row gap-4 mb-6">
        {/* PRO */}
        <TierCard
          active={selected === 'pro'}
          onSelect={() => setSelected('pro')}
          featured={false}
          heading="Pro"
          priceLabel={`₹${TIERS.pro.priceMin.toLocaleString('en-IN')}`}
          subLabel="one-time"
          badge={null}
          scarcity={null}
          items={ALL_COMPARISON.map(f => ({
            label:   f,
            checked: PRO_FEATURES.includes(f as typeof PRO_FEATURES[number]),
          }))}
          cta={navigating && selected === 'pro' ? 'Loading…' : 'Choose Pro →'}
          ctaStyle="secondary"
          onCta={() => choose('pro')}
          disabled={navigating}
        />

        {/* PREMIUM */}
        <TierCard
          active={selected === 'premium'}
          onSelect={() => setSelected('premium')}
          featured={true}
          heading="Premium"
          priceLabel={showEmi ? `₹${PREMIUM_EMI_FIRST}` : `₹${PREMIUM_PRICE.toLocaleString('en-IN')}`}
          subLabel={showEmi ? `now + ₹${PREMIUM_EMI_REST} in 1 week` : 'one-time'}
          badge="Most Popular ⭐"
          scarcity="Limited spots remaining"
          items={ALL_COMPARISON.map(f => ({
            label:   f,
            checked: PREMIUM_FEATURES.some(pf => pf.includes(f.split(' ')[0]) || pf === f),
          }))}
          emiToggle={
            <EmiToggle
              checked={showEmi}
              price={PREMIUM_PRICE}
              emiFirst={PREMIUM_EMI_FIRST}
              emiRest={PREMIUM_EMI_REST}
              onToggle={v => setShowEmi(v)}
            />
          }
          cta={navigating && selected === 'premium' ? 'Loading…' : `Choose Premium →`}
          ctaStyle="primary"
          onCta={() => choose('premium', showEmi)}
          disabled={navigating}
        />
      </div>

      {/* Parent trust bar */}
      <div
        className="rounded-xl px-4 py-4 flex flex-wrap gap-x-5 gap-y-2 justify-center"
        style={{ background: 'var(--bg-card)', border: '1px solid var(--border-faint)' }}
      >
        {[
          { icon: '🔒', text: 'Safe & Secure' },
          { icon: '✅', text: 'zer0.pro Verified' },
          { icon: '💰', text: 'Full refund if programme doesn\'t start' },
          { icon: '📞', text: 'Parent helpline available' },
        ].map(({ icon, text }) => (
          <span key={text} className="font-body text-xs flex items-center gap-1.5" style={{ color: 'var(--text-2)' }}>
            <span>{icon}</span>
            <span>{text}</span>
          </span>
        ))}
      </div>
    </div>
  )
}

// ─── TierCard ─────────────────────────────────────────────────────────────────

interface TierCardProps {
  active:      boolean
  onSelect:    () => void
  featured:    boolean
  heading:     string
  priceLabel:  string
  subLabel:    string
  badge:       string | null
  scarcity:    string | null
  items:       { label: string; checked: boolean }[]
  emiToggle?:  React.ReactNode
  cta:         string
  ctaStyle:    'primary' | 'secondary'
  onCta:       () => void
  disabled:    boolean
}

function TierCard({
  active, onSelect, featured, heading, priceLabel, subLabel,
  badge, scarcity, items, emiToggle, cta, ctaStyle, onCta, disabled,
}: TierCardProps) {
  return (
    <motion.div
      className="flex-1 rounded-2xl flex flex-col cursor-pointer select-none"
      style={{
        background:  active || featured ? 'var(--bg-card)' : 'var(--bg-raised)',
        border:      featured
          ? `2px solid ${active ? 'var(--brand)' : 'rgba(255,184,0,0.45)'}`
          : `1px solid ${active ? 'var(--border-soft)' : 'var(--border-faint)'}`,
        boxShadow:   featured ? '0 0 40px rgba(255,184,0,0.12), 0 0 0 1px rgba(255,184,0,0.08)' : 'none',
      }}
      onClick={onSelect}
      whileTap={{ scale: 0.99 }}
      transition={{ duration: 0.15 }}
    >
      <div className="p-5 flex flex-col gap-4 flex-1">
        {/* Badge pill */}
        {badge && (
          <motion.div
            className="self-start rounded-full px-3 py-1 font-mono text-[12px] tracking-[0.15em] uppercase"
            style={{ background: 'rgba(255,184,0,0.15)', color: 'var(--brand)', border: '1px solid rgba(255,184,0,0.3)' }}
            animate={{ opacity: [0.8, 1, 0.8] }}
            transition={{ duration: 2.5, repeat: Infinity, ease: 'easeInOut' }}
          >
            {badge}
          </motion.div>
        )}

        {/* Heading + price */}
        <div>
          <h3 className="font-display text-3xl tracking-wide mb-1" style={{ color: featured ? 'var(--brand)' : 'var(--text-1)' }}>
            {heading}
          </h3>
          <div className="flex items-baseline gap-2">
            <span className="font-display text-4xl tracking-tight" style={{ color: 'var(--text-1)' }}>
              {priceLabel}
            </span>
            <span className="font-body text-xs" style={{ color: 'var(--text-3)' }}>
              {subLabel}
            </span>
          </div>
          {scarcity && (
            <p className="font-mono text-[12px] tracking-[0.1em] uppercase mt-1" style={{ color: 'var(--red)' }}>
              {scarcity}
            </p>
          )}
        </div>

        {/* EMI toggle */}
        {emiToggle}

        {/* Feature list */}
        <ul className="flex flex-col gap-2.5">
          {items.map(({ label, checked }) => (
            <li key={label} className="flex items-start gap-2.5">
              <span
                className="font-mono text-sm shrink-0 mt-0.5 w-4"
                style={{ color: checked ? (featured ? 'var(--brand)' : '#34D399') : 'var(--text-4)' }}
              >
                {checked ? '✓' : '—'}
              </span>
              <span
                className="font-body text-sm leading-snug"
                style={{ color: checked ? 'var(--text-1)' : 'var(--text-4)' }}
              >
                {label}
              </span>
            </li>
          ))}
        </ul>

        {/* CTA */}
        <button
          disabled={disabled}
          className="mt-auto w-full rounded-xl py-3.5 font-heading font-semibold text-sm tracking-wide min-h-[48px] transition-all active:scale-[0.97] disabled:opacity-50"
          style={
            ctaStyle === 'primary'
              ? { background: 'var(--brand)', color: '#000' }
              : { background: 'var(--bg-float)', color: 'var(--text-2)', border: '1px solid var(--border-soft)' }
          }
          onClick={e => { e.stopPropagation(); onCta() }}
        >
          {cta}
        </button>
      </div>
    </motion.div>
  )
}

// ─── EMI Toggle ───────────────────────────────────────────────────────────────

function EmiToggle({
  checked, price, emiFirst, emiRest, onToggle,
}: { checked: boolean; price: number; emiFirst: number; emiRest: number; onToggle: (v: boolean) => void }) {
  return (
    <button
      className="flex items-start gap-3 rounded-xl p-3 text-left transition-all active:scale-[0.98]"
      style={{
        background: checked ? 'rgba(255,184,0,0.08)' : 'var(--bg-float)',
        border:     checked ? '1px solid rgba(255,184,0,0.4)' : '1px solid var(--border-subtle)',
      }}
      onClick={e => { e.stopPropagation(); onToggle(!checked) }}
    >
      {/* Checkbox */}
      <div
        className="shrink-0 mt-0.5 w-4 h-4 rounded flex items-center justify-center"
        style={{
          background: checked ? 'var(--brand)' : 'transparent',
          border:     checked ? 'none' : '1.5px solid var(--border-soft)',
        }}
      >
        {checked && <span className="text-[12px] font-bold" style={{ color: '#000' }}>✓</span>}
      </div>

      <div>
        <p className="font-body text-xs font-semibold mb-0.5" style={{ color: checked ? 'var(--brand)' : 'var(--text-2)' }}>
          Pay in 2 instalments (EMI)
        </p>
        <p className="font-mono text-[13px]" style={{ color: 'var(--text-3)' }}>
          ₹{emiFirst} now · ₹{emiRest} in 1 week · Total ₹{price.toLocaleString('en-IN')}
        </p>
      </div>
    </button>
  )
}
