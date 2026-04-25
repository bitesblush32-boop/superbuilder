'use client'

import { motion, type Variants } from 'framer-motion'

/* ─── Constants ──────────────────────────────────────────────────────────────── */
const EASE_OUT = [0.16, 1, 0.3, 1] as const

const TRUST_CARDS = [
  {
    id: 'safety',
    title: 'Safe & Supervised',
    desc: '100% online with recorded sessions. Every mentor is background-verified by zer0.pro before they interact with students.',
    icon: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" className="w-6 h-6">
        <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
        <polyline points="9 12 11 14 15 10" />
      </svg>
    ),
    accent: '#22C55E',
  },
  {
    id: 'credentials',
    title: 'Verified Certificate',
    desc: 'zer0.pro certified completion certificate shareable directly on LinkedIn — a real credential that colleges and employers recognise.',
    icon: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" className="w-6 h-6">
        <circle cx="12" cy="8" r="6" />
        <path d="M15.477 12.89L17 22l-5-3-5 3 1.523-9.11" />
      </svg>
    ),
    accent: '#60A5FA',
  },
  {
    id: 'outcomes',
    title: 'Proven Outcomes',
    desc: '90% of students build a working AI prototype within 3 weeks — a real, demonstrable project they own and can show anyone.',
    icon: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" className="w-6 h-6">
        <line x1="18" y1="20" x2="18" y2="10" />
        <line x1="12" y1="20" x2="12" y2="4" />
        <line x1="6"  y1="20" x2="6"  y2="14" />
        <line x1="2"  y1="20" x2="22" y2="20" />
      </svg>
    ),
    accent: '#C084FC',
  },
  {
    id: 'refund',
    title: 'Refund Guarantee',
    desc: 'Full refund if the programme does not start as scheduled. No forms, no questions asked. Your investment is protected.',
    icon: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" className="w-6 h-6">
        <path d="M12 22C6.477 22 2 17.523 2 12S6.477 2 12 2s10 4.477 10 10-4.477 10-10 10z" />
        <path d="M9 9h.01" />
        <path d="M15 9h.01" />
        <path d="M9.5 15a3.5 3.5 0 0 0 5 0" />
      </svg>
    ),
    accent: '#FFB800',
  },
]

/* ─── Variants ───────────────────────────────────────────────────────────────── */
const sectionVariants: Variants = {
  hidden: {},
  show:   { transition: { staggerChildren: 0.1, delayChildren: 0.05 } },
}

const cardVariants: Variants = {
  hidden: { opacity: 0, y: 24 },
  show:   { opacity: 1, y: 0, transition: { duration: 0.5, ease: EASE_OUT } },
}

const headerVariants: Variants = {
  hidden: { opacity: 0, y: 20 },
  show:   { opacity: 1, y: 0, transition: { duration: 0.55, ease: EASE_OUT } },
}

/* ─── TrustCard ──────────────────────────────────────────────────────────────── */
function TrustCard({
  card,
}: {
  card: typeof TRUST_CARDS[number]
}) {
  return (
    <motion.div
      variants={cardVariants}
      className="relative rounded-[6px] border p-6 flex flex-col gap-4"
      style={{
        background:  'var(--bg-raised)',
        borderColor: 'var(--border-subtle)',
      }}
    >
      {/* Top accent line */}
      <div
        className="absolute top-0 left-6 right-6 h-px"
        style={{ background: `linear-gradient(90deg, transparent, ${card.accent}50, transparent)` }}
        aria-hidden="true"
      />

      {/* Icon */}
      <div
        className="w-10 h-10 rounded-lg flex items-center justify-center border flex-shrink-0"
        style={{
          background:  `${card.accent}12`,
          borderColor: `${card.accent}30`,
          color:        card.accent,
        }}
        aria-hidden="true"
      >
        {card.icon}
      </div>

      {/* Text */}
      <div>
        <h3
          className="font-heading font-semibold text-[15px] leading-snug mb-2"
          style={{ color: 'var(--text-1)' }}
        >
          {card.title}
        </h3>
        <p
          className="font-body text-[13px] leading-relaxed"
          style={{ color: 'var(--text-2)' }}
        >
          {card.desc}
        </p>
      </div>
    </motion.div>
  )
}

/* ─── ForParents ─────────────────────────────────────────────────────────────── */
export function ForParents() {
  return (
    <section
      className="relative py-20 sm:py-28 overflow-hidden"
      id="parents"
      style={{ background: 'var(--bg-card)' }}
    >
      {/* Subtle top separator */}
      <div
        className="absolute top-0 inset-x-0 h-px"
        style={{
          background:
            'linear-gradient(90deg, transparent 0%, var(--border-subtle) 30%, var(--border-subtle) 70%, transparent 100%)',
        }}
        aria-hidden="true"
      />

      {/* Subtle bottom separator */}
      <div
        className="absolute bottom-0 inset-x-0 h-px"
        style={{
          background:
            'linear-gradient(90deg, transparent 0%, var(--border-subtle) 30%, var(--border-subtle) 70%, transparent 100%)',
        }}
        aria-hidden="true"
      />

      <div className="relative max-w-5xl mx-auto px-4 sm:px-6">

        {/* ── Header ── */}
        <motion.div
          className="mb-12"
          variants={headerVariants}
          initial="hidden"
          whileInView="show"
          viewport={{ once: true, margin: '-60px' }}
        >
          <p
            className="font-mono text-[12px] tracking-[0.28em] uppercase mb-3"
            style={{ color: 'var(--text-brand)' }}
          >
            For Parents
          </p>
          <h2
            className="font-display leading-none tracking-tight mb-4"
            style={{ fontSize: 'clamp(30px, 5vw, 64px)', color: 'var(--text-1)' }}
          >
            YOUR CHILD IS IN{' '}
            <span style={{ color: 'var(--text-brand)' }}>SAFE HANDS</span>
          </h2>
          <p
            className="font-body text-[15px] max-w-xl leading-relaxed"
            style={{ color: 'var(--text-2)' }}
          >
            We understand that letting your child join an online programme requires trust.
            Here&apos;s exactly what we&apos;ve put in place so you can say yes with confidence.
          </p>
        </motion.div>

        {/* ── Trust cards grid ── */}
        <motion.div
          className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-10"
          variants={sectionVariants}
          initial="hidden"
          whileInView="show"
          viewport={{ once: true, margin: '-60px' }}
        >
          {TRUST_CARDS.map((card) => (
            <TrustCard key={card.id} card={card} />
          ))}
        </motion.div>

        {/* ── CTA + WhatsApp row ── */}
        <motion.div
          className="flex flex-col sm:flex-row items-start sm:items-stretch gap-4"
          initial={{ opacity: 0, y: 16 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5, ease: EASE_OUT, delay: 0.2 }}
        >
          {/* Parent info session CTA */}
          <a
            href="#"
            className="w-full sm:w-1/2 inline-flex items-center justify-center sm:justify-start gap-2.5 h-[48px] px-6 rounded-[4px] border font-heading font-semibold text-[13px] tracking-[0.08em] uppercase transition-all duration-150 touch-manipulation active:opacity-70 active:scale-95"
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
            {/* Calendar icon */}
            <svg viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" className="w-4 h-4 flex-shrink-0" aria-hidden="true">
              <rect x="3" y="4" width="14" height="14" rx="2" />
              <line x1="3" y1="9" x2="17" y2="9" />
              <line x1="8" y1="2" x2="8" y2="6" />
              <line x1="12" y1="2" x2="12" y2="6" />
            </svg>
            Join Free Parent Info Session
          </a>

          {/* WhatsApp pill */}
          <span
            className="w-full sm:w-1/2 inline-flex items-center gap-2 px-4 py-2.5 rounded-[6px] border font-body text-[12px] leading-snug"
            style={{
              borderColor: 'rgba(34,197,94,0.25)',
              background:  'rgba(34,197,94,0.06)',
              color:       'var(--text-2)',
            }}
          >
            <svg viewBox="0 0 24 24" fill="currentColor" className="w-4 h-4 flex-shrink-0 mt-px" style={{ color: '#22C55E' }} aria-hidden="true">
              <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/>
            </svg>
             Dedicated WhatsApp group for parents throughout the programme
          </span>
        </motion.div>

      </div>
    </section>
  )
}
