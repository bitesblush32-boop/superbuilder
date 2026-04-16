'use client'

import { useState } from 'react'
import { motion, type Variants, AnimatePresence } from 'framer-motion'
import { JUDGING } from '@/lib/content/programme'

/* ─── Constants ──────────────────────────────────────────────────────────────── */
const EASE_OUT = [0.16, 1, 0.3, 1] as const

// Colors assigned per criterion index
const CRITERION_COLORS = ['#FFB800', '#60A5FA', '#22C55E', '#C084FC', '#FB923C'] as const

/* ─── Variants ───────────────────────────────────────────────────────────────── */
const headerVariants: Variants = {
  hidden: { opacity: 0, y: 20 },
  show:   { opacity: 1, y: 0, transition: { duration: 0.55, ease: EASE_OUT } },
}

const rowVariants: Variants = {
  hidden: {},
  show:   { transition: { staggerChildren: 0.08, delayChildren: 0.1 } },
}

const itemVariants: Variants = {
  hidden: { opacity: 0, x: -20 },
  show:   { opacity: 1, x: 0, transition: { duration: 0.45, ease: EASE_OUT } },
}

const descVariants: Variants = {
  hidden: { opacity: 0, height: 0 },
  show:   { opacity: 1, height: 'auto', transition: { duration: 0.3, ease: EASE_OUT } },
}

/* ─── JudgingCriteria ────────────────────────────────────────────────────────── */
export function JudgingCriteria() {
  const [active, setActive] = useState<number | null>(null)

  const toggle = (i: number) => setActive((prev) => (prev === i ? null : i))

  return (
    <section
      className="relative py-20 sm:py-28 overflow-hidden"
      id="judging"
      style={{ background: 'var(--bg-base)' }}
    >
      {/* Faint diagonal lines — editorial feel */}
      <div
        className="pointer-events-none absolute inset-0"
        aria-hidden="true"
        style={{
          backgroundImage: `repeating-linear-gradient(
            -45deg,
            rgba(255,184,0,0.015) 0px,
            rgba(255,184,0,0.015) 1px,
            transparent 1px,
            transparent 40px
          )`,
        }}
      />

      <div className="relative max-w-4xl mx-auto px-4 sm:px-6">

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
            Judging
          </p>
          <h2
            className="font-display leading-none tracking-tight mb-4"
            style={{ fontSize: 'clamp(30px, 5vw, 64px)', color: 'var(--text-1)' }}
          >
            HOW PROJECTS ARE{' '}
            <span style={{ color: 'var(--text-brand)' }}>JUDGED</span>
          </h2>
          <p
            className="font-body text-[15px]"
            style={{ color: 'var(--text-3)' }}
          >
            100 points total. Tap a criterion to learn what judges look for.
          </p>
        </motion.div>

        {/* ── Stacked bar ── */}
        <motion.div
          className="mb-10"
          initial={{ opacity: 0, y: 12 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5, ease: EASE_OUT }}
        >
          <div
            className="h-3 rounded-full overflow-hidden flex"
            style={{ background: 'var(--bg-raised)', border: '1px solid var(--border-faint)' }}
            role="img"
            aria-label="Judging weight distribution"
          >
            {JUDGING.map((criterion, i) => (
              <motion.div
                key={criterion.criterion}
                className="h-full first:rounded-l-full last:rounded-r-full relative cursor-pointer"
                style={{
                  width:      `${criterion.weight}%`,
                  background:  CRITERION_COLORS[i],
                  opacity:     active === null || active === i ? 1 : 0.3,
                  transition:  'opacity 0.2s ease',
                  boxShadow:   active === i ? `0 0 10px ${CRITERION_COLORS[i]}80` : 'none',
                }}
                initial={{ scaleX: 0, originX: 0 }}
                whileInView={{ scaleX: 1 }}
                viewport={{ once: true }}
                transition={{ duration: 0.8, ease: EASE_OUT, delay: i * 0.1 }}
                onClick={() => toggle(i)}
                title={`${criterion.criterion} — ${criterion.weight}pts`}
              />
            ))}
          </div>

          {/* Bar legend */}
          <div className="mt-3 flex flex-wrap gap-x-4 gap-y-1.5">
            {JUDGING.map((criterion, i) => (
              <button
                key={criterion.criterion}
                onClick={() => toggle(i)}
                className="flex items-center gap-1.5 font-mono text-[9px] tracking-wide uppercase transition-opacity duration-150"
                style={{
                  color:   active === null || active === i ? 'var(--text-3)' : 'var(--text-4)',
                  opacity: active === null || active === i ? 1 : 0.5,
                }}
              >
                <span
                  className="inline-block w-2 h-2 rounded-full flex-shrink-0"
                  style={{ background: CRITERION_COLORS[i] }}
                />
                {criterion.criterion} · {criterion.weight}pts
              </button>
            ))}
          </div>
        </motion.div>

        {/* ── Criteria rows ── */}
        <motion.div
          className="flex flex-col divide-y"
          style={{ borderColor: 'var(--border-faint)' }}
          variants={rowVariants}
          initial="hidden"
          whileInView="show"
          viewport={{ once: true, margin: '-60px' }}
        >
          {JUDGING.map((criterion, i) => {
            const color    = CRITERION_COLORS[i]
            const isActive = active === i

            return (
              <motion.div key={criterion.criterion} variants={itemVariants}>
                <button
                  onClick={() => toggle(i)}
                  className="w-full flex items-center gap-4 py-4 text-left group min-h-[44px] active:opacity-70"
                  style={{ borderColor: 'var(--border-faint)' }}
                  aria-expanded={isActive}
                >
                  {/* Weight badge */}
                  <div
                    className="flex-shrink-0 w-12 h-12 rounded-lg flex items-center justify-center font-display text-[20px] leading-none border transition-all duration-200"
                    style={{
                      background:  isActive ? `${color}18` : 'var(--bg-raised)',
                      borderColor: isActive ? `${color}50` : 'var(--border-faint)',
                      color:        isActive ? color : 'var(--text-3)',
                      boxShadow:   isActive ? `0 0 16px ${color}25` : 'none',
                    }}
                    aria-hidden="true"
                  >
                    {criterion.weight}
                  </div>

                  {/* Name */}
                  <div className="flex-1 min-w-0">
                    <p
                      className="font-heading font-semibold text-[14px] leading-snug transition-colors duration-150"
                      style={{ color: isActive ? 'var(--text-1)' : 'var(--text-2)' }}
                    >
                      {criterion.criterion}
                    </p>
                    <p
                      className="font-mono text-[10px] mt-0.5"
                      style={{ color }}
                    >
                      {criterion.weight} points
                    </p>
                  </div>

                  {/* Weight bar pill */}
                  <div
                    className="hidden sm:block relative h-1.5 w-24 rounded-full overflow-hidden flex-shrink-0"
                    style={{ background: 'var(--bg-raised)' }}
                    aria-hidden="true"
                  >
                    <motion.div
                      className="absolute inset-y-0 left-0 rounded-full w-full"
                      style={{ background: color, transformOrigin: 'left center', willChange: 'transform' }}
                      initial={{ scaleX: 0 }}
                      whileInView={{ scaleX: criterion.weight / 100 }}
                      viewport={{ once: true }}
                      transition={{ duration: 0.7, ease: EASE_OUT, delay: i * 0.08 + 0.3 }}
                    />
                  </div>

                  {/* Chevron */}
                  <svg
                    viewBox="0 0 16 16"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="1.8"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    className="w-4 h-4 flex-shrink-0 transition-transform duration-200"
                    style={{
                      color:     'var(--text-4)',
                      transform: isActive ? 'rotate(180deg)' : 'rotate(0deg)',
                    }}
                    aria-hidden="true"
                  >
                    <polyline points="4 6 8 10 12 6" />
                  </svg>
                </button>

                {/* Expandable description */}
                <AnimatePresence initial={false}>
                  {isActive && (
                    <motion.div
                      key="desc"
                      variants={descVariants}
                      initial="hidden"
                      animate="show"
                      exit="hidden"
                      className="overflow-hidden"
                    >
                      <div
                        className="pb-5 pl-16 pr-4"
                      >
                        <p
                          className="font-body text-[13px] leading-relaxed"
                          style={{ color: 'var(--text-2)' }}
                        >
                          {criterion.desc}
                        </p>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </motion.div>
            )
          })}
        </motion.div>

        {/* ── Total note ── */}
        <motion.p
          className="mt-8 text-right font-mono text-[10px] tracking-wide"
          style={{ color: 'var(--text-4)' }}
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5, delay: 0.4 }}
        >
          Total: 100 points · Scored by 2 independent judges · Average used
        </motion.p>

      </div>
    </section>
  )
}
