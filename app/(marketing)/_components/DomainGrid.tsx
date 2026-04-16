'use client'

import { motion, type Variants } from 'framer-motion'

/* ─── Constants ──────────────────────────────────────────────────────────────── */
const EASE_OUT = [0.16, 1, 0.3, 1] as const

const DOMAINS = [
  {
    id:    'health',
    name:  'Health',
    desc:  'AI symptom checkers, mental wellness companions, medication reminders, and fitness trackers for underserved communities.',
    color: '#22C55E',
    icon: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" className="w-6 h-6">
        <path d="M22 12h-4l-3 9L9 3l-3 9H2" />
      </svg>
    ),
  },
  {
    id:    'education',
    name:  'Education',
    desc:  'Personalised tutors, doubt-solving bots, vernacular language learning tools, and accessible study aids for every learner.',
    color: '#60A5FA',
    icon: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" className="w-6 h-6">
        <path d="M2 3h6a4 4 0 0 1 4 4v14a3 3 0 0 0-3-3H2z" />
        <path d="M22 3h-6a4 4 0 0 0-4 4v14a3 3 0 0 1 3-3h7z" />
      </svg>
    ),
  },
  {
    id:    'finance',
    name:  'Finance',
    desc:  'Smart budgeting apps, fraud detection alerts, loan eligibility advisors, and micro-savings tools for first-time earners.',
    color: '#FFB800',
    icon: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" className="w-6 h-6">
        <line x1="12" y1="1" x2="12" y2="23" />
        <path d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6" />
      </svg>
    ),
  },
  {
    id:    'environment',
    name:  'Environment',
    desc:  'Air quality monitors, waste sorting assistants, crop disease detectors, and carbon footprint calculators for everyday use.',
    color: '#34D399',
    icon: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" className="w-6 h-6">
        <path d="M17 8C8 10 5.9 16.17 3.82 19.49c-.63 1.02.17 2.34 1.35 2.34 1.1 0 1.96-.81 1.96-1.84V18c0-1.1.9-2 2-2h4c1.1 0 2-.9 2-2v-2c0-1.1.9-2 2-2h1" />
        <path d="M12 13V9" />
        <path d="M12 5C14.21 5 16 3.21 16 1 13.79 1 12 2.79 12 5z" />
      </svg>
    ),
  },
  {
    id:    'entertainment',
    name:  'Entertainment',
    desc:  'AI story generators, music recommendation engines, game difficulty adapters, and content moderation tools for creators.',
    color: '#C084FC',
    icon: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" className="w-6 h-6">
        <polygon points="5 3 19 12 5 21 5 3" />
      </svg>
    ),
  },
  {
    id:    'social_impact',
    name:  'Social Impact',
    desc:  'Accessibility tools for the differently-abled, disaster response coordinators, job-skill matchers, and civic grievance trackers.',
    color: '#FB923C',
    icon: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" className="w-6 h-6">
        <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" />
        <circle cx="9" cy="7" r="4" />
        <path d="M23 21v-2a4 4 0 0 0-3-3.87" />
        <path d="M16 3.13a4 4 0 0 1 0 7.75" />
      </svg>
    ),
  },
] as const

/* ─── Variants ───────────────────────────────────────────────────────────────── */
const gridVariants: Variants = {
  hidden: {},
  show:   { transition: { staggerChildren: 0.08, delayChildren: 0.05 } },
}

const cardVariants: Variants = {
  hidden: { opacity: 0, y: 24 },
  show:   { opacity: 1, y: 0, transition: { duration: 0.5, ease: EASE_OUT } },
}

const headerVariants: Variants = {
  hidden: { opacity: 0, y: 20 },
  show:   { opacity: 1, y: 0, transition: { duration: 0.55, ease: EASE_OUT } },
}

/* ─── DomainCard ─────────────────────────────────────────────────────────────── */
function DomainCard({ domain }: { domain: typeof DOMAINS[number] }) {
  return (
    <motion.div
      variants={cardVariants}
      whileHover={{
        y: -6,
        borderColor: 'rgba(255,184,0,0.5)',
        boxShadow: '0 0 0 1px rgba(255,184,0,0.2), 0 12px 40px rgba(255,184,0,0.1)',
        transition: { type: 'spring', stiffness: 300, damping: 20 },
      }}
      className="relative rounded-[6px] border p-6 flex flex-col gap-4 cursor-default"
      style={{
        background:  'var(--bg-card)',
        borderColor: 'var(--border-faint)',
      }}
    >
      {/* Bottom accent line */}
      <div
        className="absolute bottom-0 left-6 right-6 h-px"
        style={{
          background: `linear-gradient(90deg, transparent, ${domain.color}45, transparent)`,
        }}
        aria-hidden="true"
      />

      {/* Icon */}
      <div
        className="w-10 h-10 rounded-lg flex items-center justify-center border flex-shrink-0"
        style={{
          background:  `${domain.color}12`,
          borderColor: `${domain.color}30`,
          color:        domain.color,
        }}
        aria-hidden="true"
      >
        {domain.icon}
      </div>

      {/* Text */}
      <div>
        <h3
          className="font-heading font-bold text-[15px] leading-snug mb-2"
          style={{ color: 'var(--text-1)' }}
        >
          {domain.name}
        </h3>
        <p
          className="font-body text-[13px] leading-relaxed"
          style={{ color: 'var(--text-3)' }}
        >
          {domain.desc}
        </p>
      </div>

      {/* Domain pill */}
      <div className="mt-auto">
        <span
          className="inline-flex items-center h-5 px-2.5 rounded-full font-mono text-[9px] tracking-wider uppercase border max-w-full truncate"
          style={{
            color:       domain.color,
            borderColor: `${domain.color}35`,
            background:  `${domain.color}0d`,
          }}
        >
          {domain.id.replace('_', ' ')}
        </span>
      </div>
    </motion.div>
  )
}

/* ─── DomainGrid ─────────────────────────────────────────────────────────────── */
export function DomainGrid() {
  return (
    <section
      className="relative py-20 sm:py-28 overflow-hidden"
      id="domains"
      style={{ background: 'var(--bg-base)' }}
    >
      {/* Radial spotlight from bottom-right */}
      <div
        className="pointer-events-none absolute inset-0"
        aria-hidden="true"
        style={{
          background:
            'radial-gradient(ellipse 55% 45% at 85% 80%, rgba(255,184,0,0.04) 0%, transparent 70%)',
        }}
      />

      <div className="relative max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">

        {/* ── Header ── */}
        <motion.div
          className="mb-12"
          variants={headerVariants}
          initial="hidden"
          whileInView="show"
          viewport={{ once: true, margin: '-60px' }}
        >
          <p
            className="font-mono text-[10px] tracking-[0.28em] uppercase mb-3"
            style={{ color: 'var(--text-brand)' }}
          >
            Build In Any Domain
          </p>
          <h2
            className="font-display leading-none tracking-tight mb-4"
            style={{ fontSize: 'clamp(30px, 5vw, 64px)', color: 'var(--text-1)' }}
          >
            PICK YOUR{' '}
            <span style={{ color: 'var(--text-brand)' }}>PROBLEM</span>
          </h2>
          <p
            className="font-body text-[15px] max-w-lg"
            style={{ color: 'var(--text-3)' }}
          >
            Your project can tackle any real-world problem. Here are the six domains judges are most excited to see.
          </p>
        </motion.div>

        {/* ── Grid ── */}
        <motion.div
          className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4"
          variants={gridVariants}
          initial="hidden"
          whileInView="show"
          viewport={{ once: true, margin: '-60px' }}
        >
          {DOMAINS.map((domain) => (
            <DomainCard key={domain.id} domain={domain} />
          ))}
        </motion.div>

        {/* ── Footer note ── */}
        <motion.p
          className="mt-8 font-mono text-[10px] tracking-wide text-center"
          style={{ color: 'var(--text-4)' }}
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5, delay: 0.35 }}
        >
          Other domains welcome — if it solves a real problem with AI, it qualifies.
        </motion.p>

      </div>
    </section>
  )
}
