'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { motion, AnimatePresence } from 'framer-motion'
import { Check } from 'lucide-react'
import { selectDomain } from '@/lib/actions/registration'

const DOMAINS = [
  {
    value:       'health',
    label:       'Health',
    emoji:       '🏥',
    tagline:     'AI for healthcare access',
    description: 'Build tools that help people get medical advice, track wellness, or navigate the healthcare system.',
    color:       '#22C55E',
    bg:          'rgba(34,197,94,0.08)',
  },
  {
    value:       'education',
    label:       'Education',
    emoji:       '🎓',
    tagline:     'AI for smarter learning',
    description: 'Create tutors, doubt-solvers, or learning aids that work for every student, in any language.',
    color:       '#60A5FA',
    bg:          'rgba(96,165,250,0.08)',
  },
  {
    value:       'finance',
    label:       'Finance',
    emoji:       '💰',
    tagline:     'AI for financial freedom',
    description: 'Help people budget, save, get loans, or understand money — especially those without bank access.',
    color:       '#FFB800',
    bg:          'rgba(255,184,0,0.08)',
  },
  {
    value:       'environment',
    label:       'Environment',
    emoji:       '🌱',
    tagline:     'AI for a cleaner planet',
    description: 'Build solutions for climate, farming, waste, pollution, or conservation using AI.',
    color:       '#34D399',
    bg:          'rgba(52,211,153,0.08)',
  },
  {
    value:       'entertainment',
    label:       'Entertainment',
    emoji:       '🎮',
    tagline:     'AI for creativity & fun',
    description: 'Create AI-powered games, music, content recommendations, or creative tools.',
    color:       '#C084FC',
    bg:          'rgba(192,132,252,0.08)',
  },
  {
    value:       'social_impact',
    label:       'Social Impact',
    emoji:       '🤝',
    tagline:     'AI for communities',
    description: 'Help underserved communities with accessibility, safety, rights, or civic services.',
    color:       '#FB923C',
    bg:          'rgba(251,147,60,0.08)',
  },
] as const

type DomainValue = typeof DOMAINS[number]['value']

export function DomainSelectClient({ studentId: _studentId }: { studentId: string }) {
  const router = useRouter()
  const [selected, setSelected] = useState<DomainValue | null>(null)
  const [loading,  setLoading]  = useState(false)
  const [error,    setError]    = useState('')

  async function handleLockIn() {
    if (!selected) return
    setLoading(true)
    setError('')
    try {
      const res = await selectDomain(selected)
      if (res.success) {
        router.push('/register/stage-2/quiz')
      } else {
        setError(res.error ?? 'Something went wrong. Please try again.')
        setLoading(false)
      }
    } catch {
      setError('Network error. Check your connection and try again.')
      setLoading(false)
    }
  }

  const selectedMeta = selected ? DOMAINS.find(d => d.value === selected) : null

  return (
    <div className="flex flex-col gap-6 pb-12">

      {/* Header */}
      <motion.div
        className="flex flex-col gap-2"
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.45, ease: [0.16, 1, 0.3, 1] }}
      >
        <h1
          className="font-display text-4xl sm:text-5xl tracking-widest leading-none"
          style={{ color: 'var(--brand)' }}
        >
          CHOOSE YOUR DOMAIN 🎯
        </h1>
        <p className="text-sm sm:text-base leading-relaxed" style={{ color: 'var(--text-2)' }}>
          Your quiz will be about this domain. Pick the one that excites you most.
        </p>
      </motion.div>

      {/* Domain grid */}
      <motion.div
        className="grid grid-cols-2 sm:grid-cols-3 gap-3"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.45, delay: 0.08, ease: [0.16, 1, 0.3, 1] }}
      >
        {DOMAINS.map((domain) => {
          const isSelected = selected === domain.value
          return (
            <motion.button
              key={domain.value}
              type="button"
              onClick={() => setSelected(domain.value)}
              className="relative flex flex-col gap-2.5 rounded-2xl p-4 text-left w-full transition-shadow"
              style={{
                background:  isSelected ? domain.bg : 'var(--bg-card)',
                border:      `2px solid ${isSelected ? domain.color : 'var(--border-faint)'}`,
                minHeight:   '180px',
                boxShadow:   isSelected ? `0 0 20px ${domain.color}22` : 'none',
              }}
              whileTap={{ scale: 0.97 }}
              animate={{ scale: isSelected ? [1, 1.04, 1] : 1 }}
              transition={{ type: 'tween', duration: 0.3, ease: 'easeInOut' }}
            >
              {/* Check badge */}
              <AnimatePresence>
                {isSelected && (
                  <motion.div
                    className="absolute top-2.5 right-2.5 flex items-center justify-center rounded-full"
                    style={{ width: 22, height: 22, background: domain.color }}
                    initial={{ scale: 0, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    exit={{ scale: 0, opacity: 0 }}
                    transition={{ type: 'spring', stiffness: 500, damping: 22 }}
                  >
                    <Check size={12} strokeWidth={3} color="#000" />
                  </motion.div>
                )}
              </AnimatePresence>

              {/* Emoji */}
              <span className="text-5xl leading-none select-none" aria-hidden="true">
                {domain.emoji}
              </span>

              {/* Label + tagline */}
              <div className="flex flex-col gap-0.5">
                <p
                  className="font-heading font-bold text-sm leading-tight"
                  style={{ color: isSelected ? domain.color : 'var(--text-1)' }}
                >
                  {domain.label}
                </p>
                <p
                  className="text-[13px] font-body leading-tight"
                  style={{ color: isSelected ? domain.color : 'var(--text-brand)', opacity: isSelected ? 0.9 : 0.75 }}
                >
                  {domain.tagline}
                </p>
              </div>

              {/* Description — shown when selected */}
              <AnimatePresence>
                {isSelected && (
                  <motion.p
                    className="text-[13px] font-body leading-relaxed"
                    style={{ color: 'var(--text-2)' }}
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: 'auto' }}
                    exit={{ opacity: 0, height: 0 }}
                    transition={{ duration: 0.25 }}
                  >
                    {domain.description}
                  </motion.p>
                )}
              </AnimatePresence>
            </motion.button>
          )
        })}
      </motion.div>

      {/* Warning */}
      <motion.div
        className="flex items-start gap-3 rounded-xl px-4 py-3 border"
        style={{
          background:   'var(--amber-bg)',
          borderColor:  'rgba(251,191,36,0.3)',
          color:        'var(--amber)',
        }}
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.2, duration: 0.35 }}
      >
        <span className="text-lg shrink-0 mt-0.5" aria-hidden="true">⚠️</span>
        <p className="text-xs sm:text-sm leading-snug font-body">
          <strong>Choose carefully</strong> — you cannot change your domain after selecting.
          Your quiz and idea submission will both be based on this domain.
        </p>
      </motion.div>

      {/* Selected domain confirmation */}
      <AnimatePresence>
        {selectedMeta && (
          <motion.div
            className="flex items-center gap-3 rounded-xl px-4 py-3 border"
            style={{
              background:  selectedMeta.bg,
              borderColor: `${selectedMeta.color}40`,
            }}
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -4 }}
            transition={{ duration: 0.25 }}
          >
            <span className="text-2xl" aria-hidden="true">{selectedMeta.emoji}</span>
            <div>
              <p className="text-sm font-heading font-bold" style={{ color: selectedMeta.color }}>
                {selectedMeta.label} selected
              </p>
              <p className="text-xs" style={{ color: 'var(--text-3)' }}>
                Your quiz will focus on AI in {selectedMeta.label.toLowerCase()}
              </p>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Error */}
      <AnimatePresence>
        {error && (
          <motion.p
            className="text-xs font-mono px-3 py-2 rounded-lg border"
            style={{
              color:       'var(--red)',
              background:  'var(--red-bg)',
              borderColor: 'rgba(248,113,113,0.25)',
            }}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          >
            ✕ {error}
          </motion.p>
        )}
      </AnimatePresence>

      {/* CTA */}
      <motion.button
        onClick={handleLockIn}
        disabled={!selected || loading}
        className="w-full min-h-[52px] rounded-xl font-heading font-bold text-base tracking-wide transition-all duration-150 active:scale-[0.98] disabled:opacity-40 disabled:cursor-not-allowed flex items-center justify-center gap-2"
        style={{
          background: selected && !loading
            ? 'var(--brand)'
            : 'var(--bg-float)',
          color:      selected && !loading ? '#000' : 'var(--text-3)',
          border:     selected && !loading ? 'none' : '1px solid var(--border-subtle)',
          boxShadow:  selected && !loading ? 'var(--shadow-brand)' : 'none',
        }}
        whileTap={selected && !loading ? { scale: 0.97 } : {}}
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.15, duration: 0.4 }}
      >
        {loading ? (
          <>
            <svg className="animate-spin h-4 w-4 shrink-0" fill="none" viewBox="0 0 24 24" aria-hidden="true">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
            </svg>
            <span>Locking in…</span>
          </>
        ) : (
          <span>
            {selected ? `Lock In ${selectedMeta?.emoji} ${selectedMeta?.label} 🔒` : 'Select a Domain to Continue'}
          </span>
        )}
      </motion.button>

      <p className="text-center text-xs" style={{ color: 'var(--text-4)' }}>
        This opens your personalised domain quiz
      </p>
    </div>
  )
}
