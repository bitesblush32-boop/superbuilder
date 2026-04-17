'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { motion, AnimatePresence } from 'framer-motion'
import { submitEngage } from '@/lib/actions/registration'

type Bez = [number, number, number, number]
const EASE_OUT: Bez    = [0.16, 1, 0.3, 1]
const EASE_IN_OUT: Bez = [0.87, 0, 0.13, 1]

const slideVariants = {
  enter: (dir: number) => ({ x: dir > 0 ? '60%' : '-60%', opacity: 0 }),
  center: { x: 0, opacity: 1, transition: { duration: 0.34, ease: EASE_OUT } },
  exit:   (dir: number) => ({
    x: dir > 0 ? '-30%' : '30%',
    opacity: 0,
    transition: { duration: 0.22, ease: EASE_IN_OUT },
  }),
}

const STEPS = 3

export function EngageForm() {
  const router = useRouter()

  const [step, setStep]           = useState(0)
  const [direction, setDirection] = useState(1)
  const [goal, setGoal]           = useState('')
  const [confidence, setConfidence] = useState(0)
  const [winBoast, setWinBoast]   = useState('')
  const [loading, setLoading]     = useState(false)
  const [error, setError]         = useState<string | null>(null)

  const canAdvance = [
    goal.trim().length >= 10,
    confidence >= 1,
    winBoast.trim().length >= 3,
  ]

  function goNext() {
    if (step < STEPS - 1) {
      setDirection(1)
      setStep(s => s + 1)
    } else {
      handleSubmit()
    }
  }

  function goBack() {
    if (step > 0) {
      setDirection(-1)
      setStep(s => s - 1)
    }
  }

  async function handleSubmit() {
    setLoading(true)
    setError(null)
    const res = await submitEngage({ goal, confidence, winBoast })
    setLoading(false)
    if (!res.success) { setError(res.error ?? 'Something went wrong'); return }
    router.push('/register/stage-3/select')
  }

  return (
    <div className="flex flex-col min-h-[70vh] max-w-lg mx-auto px-1">
      {/* Header */}
      <div className="mb-8 pt-2">
        <p className="font-mono text-xs tracking-[0.15em] uppercase mb-3" style={{ color: 'var(--text-3)' }}>
          {step + 1} of {STEPS}
        </p>
        <h1 className="font-display text-4xl sm:text-5xl tracking-wide leading-none mb-2" style={{ color: 'var(--text-1)' }}>
          ALMOST THERE!
        </h1>
        <p className="font-body text-sm" style={{ color: 'var(--text-2)' }}>
          3 quick ones before we lock in your spot 🔥
        </p>
      </div>

      {/* Progress dots */}
      <div className="flex gap-2 mb-8">
        {Array.from({ length: STEPS }).map((_, i) => (
          <motion.div
            key={i}
            className="h-1 rounded-full"
            animate={{
              width:      i === step ? 28 : 8,
              background: i < step ? 'var(--brand)' : i === step ? 'var(--brand)' : 'var(--border-subtle)',
              opacity:    i <= step ? 1 : 0.4,
            }}
            transition={{ duration: 0.3, ease: EASE_OUT }}
          />
        ))}
      </div>

      {/* Sliding question area */}
      <div className="flex-1 overflow-hidden">
        <AnimatePresence mode="wait" custom={direction}>
          {step === 0 && (
            <motion.div
              key="q1"
              custom={direction}
              variants={slideVariants}
              initial="enter"
              animate="center"
              exit="exit"
            >
              <Question1 value={goal} onChange={setGoal} />
            </motion.div>
          )}
          {step === 1 && (
            <motion.div
              key="q2"
              custom={direction}
              variants={slideVariants}
              initial="enter"
              animate="center"
              exit="exit"
            >
              <Question2 value={confidence} onChange={setConfidence} />
            </motion.div>
          )}
          {step === 2 && (
            <motion.div
              key="q3"
              custom={direction}
              variants={slideVariants}
              initial="enter"
              animate="center"
              exit="exit"
            >
              <Question3 value={winBoast} onChange={setWinBoast} />
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Error */}
      <AnimatePresence>
        {error && (
          <motion.p
            initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}
            className="font-body text-sm text-center mb-3"
            style={{ color: 'var(--red)' }}
          >
            {error}
          </motion.p>
        )}
      </AnimatePresence>

      {/* Navigation */}
      <div className="flex gap-3 mt-8 pb-6">
        {step > 0 && (
          <button
            className="flex-none rounded-xl px-5 py-4 font-heading font-semibold text-sm min-h-[52px] transition-all active:scale-95"
            style={{ background: 'var(--bg-float)', color: 'var(--text-2)', border: '1px solid var(--border-soft)' }}
            onClick={goBack}
          >
            ←
          </button>
        )}
        <button
          disabled={!canAdvance[step] || loading}
          className="flex-1 rounded-xl py-4 font-heading font-semibold text-base tracking-wide min-h-[52px] transition-all active:scale-[0.97] disabled:opacity-30"
          style={{
            background: canAdvance[step] && !loading ? 'var(--brand)' : 'var(--bg-float)',
            color:      canAdvance[step] && !loading ? '#000' : 'var(--text-3)',
            border:     canAdvance[step] && !loading ? 'none' : '1px solid var(--border-subtle)',
          }}
          onClick={goNext}
        >
          {loading
            ? 'Saving…'
            : step === STEPS - 1
            ? 'Show Me My Options →'
            : 'Next →'}
        </button>
      </div>
    </div>
  )
}

// ─── Sub-question components ──────────────────────────────────────────────────

function Question1({ value, onChange }: { value: string; onChange: (v: string) => void }) {
  const MAX = 400
  const pct = Math.min(value.length / MAX, 1)
  const atLimit = value.length >= MAX

  return (
    <div>
      <p className="font-mono text-[10px] tracking-[0.2em] uppercase mb-3" style={{ color: 'var(--brand)' }}>
        Question 1
      </p>
      <h2 className="font-heading text-2xl font-bold mb-6 leading-snug" style={{ color: 'var(--text-1)' }}>
        What's the #1 thing you want to learn? 🧠
      </h2>
      <textarea
        className="w-full rounded-xl px-4 py-3 font-body text-sm leading-relaxed resize-none outline-none transition-all duration-200"
        style={{
          background:  'var(--bg-card)',
          border:      value.length > 0 ? '2px solid var(--brand)' : '1px solid var(--border-subtle)',
          color:       'var(--text-1)',
          minHeight:   120,
          fontSize:    16,
          caretColor:  'var(--brand)',
        }}
        inputMode="text"
        autoCapitalize="sentences"
        maxLength={MAX}
        placeholder="e.g. How to build an AI app that actually helps people…"
        value={value}
        onChange={e => onChange(e.target.value)}
      />
      <div className="flex items-center justify-between mt-2">
        <span className="font-body text-xs" style={{ color: 'var(--text-3)' }}>
          {value.trim().length < 10 ? `${10 - value.trim().length} more chars` : '✓ Looks good'}
        </span>
        <div className="flex items-center gap-2">
          <div className="w-16 h-1 rounded-full overflow-hidden" style={{ background: 'var(--bg-float)' }}>
            <div
              className="h-full rounded-full transition-all duration-300"
              style={{ width: `${pct * 100}%`, background: atLimit ? 'var(--red)' : 'var(--brand)' }}
            />
          </div>
          <span className="font-mono text-xs" style={{ color: atLimit ? 'var(--red)' : 'var(--text-3)' }}>
            {value.length}/{MAX}
          </span>
        </div>
      </div>
    </div>
  )
}

function Question2({ value, onChange }: { value: number; onChange: (v: number) => void }) {
  const [hovered, setHovered] = useState(0)

  const LABELS: Record<number, string> = {
    1: "I've never tried AI tools",
    2: "I've explored a little",
    3: "I can use a few tools",
    4: "I build things with AI",
    5: "I'm ready to ship something 🚀",
  }

  return (
    <div>
      <p className="font-mono text-[10px] tracking-[0.2em] uppercase mb-3" style={{ color: 'var(--brand)' }}>
        Question 2
      </p>
      <h2 className="font-heading text-2xl font-bold mb-6 leading-snug" style={{ color: 'var(--text-1)' }}>
        Rate your AI build confidence ⚡
      </h2>

      {/* Stars */}
      <div className="flex gap-3 mb-5">
        {[1, 2, 3, 4, 5].map(n => {
          const active = n <= (hovered || value)
          return (
            <motion.button
              key={n}
              className="text-5xl select-none transition-transform"
              style={{ minWidth: 48, minHeight: 48, filter: active ? 'none' : 'grayscale(1) opacity(0.35)' }}
              whileTap={{ scale: 0.88 }}
              animate={{ scale: active ? 1 : 0.92 }}
              transition={{ type: 'spring' as const, stiffness: 400, damping: 20 }}
              onClick={() => onChange(n)}
              onMouseEnter={() => setHovered(n)}
              onMouseLeave={() => setHovered(0)}
              aria-label={`${n} star${n !== 1 ? 's' : ''}`}
            >
              ⭐
            </motion.button>
          )
        })}
      </div>

      {/* Label */}
      <AnimatePresence mode="wait">
        <motion.p
          key={hovered || value}
          initial={{ opacity: 0, y: 6 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.2 }}
          className="font-body text-sm"
          style={{ color: (hovered || value) ? 'var(--brand)' : 'var(--text-3)', minHeight: 20 }}
        >
          {LABELS[hovered || value] ?? 'Tap a star to rate yourself'}
        </motion.p>
      </AnimatePresence>
    </div>
  )
}

function Question3({ value, onChange }: { value: string; onChange: (v: string) => void }) {
  return (
    <div>
      <p className="font-mono text-[10px] tracking-[0.2em] uppercase mb-3" style={{ color: 'var(--brand)' }}>
        Question 3
      </p>
      <h2 className="font-heading text-2xl font-bold mb-2 leading-snug" style={{ color: 'var(--text-1)' }}>
        What will you tell your friends if you win? 🏆
      </h2>
      <p className="font-body text-sm mb-6" style={{ color: 'var(--text-3)' }}>
        Be bold. Be specific. Make it real.
      </p>
      <input
        type="text"
        className="w-full rounded-xl px-4 font-body text-sm outline-none transition-all duration-200"
        style={{
          background:   'var(--bg-card)',
          border:       value.length > 0 ? '2px solid var(--brand)' : '1px solid var(--border-subtle)',
          color:        'var(--text-1)',
          minHeight:    52,
          fontSize:     16,
          caretColor:   'var(--brand)',
        }}
        inputMode="text"
        autoCapitalize="sentences"
        autoComplete="off"
        maxLength={200}
        placeholder="e.g. I built an AI that helps farmers predict droughts…"
        value={value}
        onChange={e => onChange(e.target.value)}
      />
      <p className="font-body text-xs mt-2" style={{ color: 'var(--text-3)' }}>
        This fuels your builder mindset — we'll remind you of this when it gets hard 💪
      </p>
    </div>
  )
}
