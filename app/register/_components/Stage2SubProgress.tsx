'use client'

import { motion } from 'framer-motion'
import { Check } from 'lucide-react'

const LEARN_STEPS = [
  { key: 'domain', label: 'Domain', emoji: '🎯' },
  { key: 'quiz',   label: 'Quiz',   emoji: '🧠' },
] as const

interface Stage2SubProgressProps {
  orientationComplete: boolean
  hasDomain:           boolean
  hasPassedQuiz:       boolean
  hasIdea:             boolean
}

export function Stage2SubProgress({
  orientationComplete,
  hasDomain,
  hasPassedQuiz,
}: Stage2SubProgressProps) {
  // Only show this stepper during the Learn phase (after orientation, before idea)
  if (!orientationComplete) return null

  const completed: Record<string, boolean> = {
    domain: hasDomain,
    quiz:   hasPassedQuiz,
  }

  const activeKey = LEARN_STEPS.find(s => !completed[s.key])?.key ?? 'quiz'

  return (
    <div className="w-full px-4 py-3">
      <div className="mx-auto max-w-md">
        {/* Label */}
        <p
          className="font-mono text-[10px] tracking-[0.18em] uppercase mb-3 text-center"
          style={{ color: 'var(--text-4)' }}
        >
          Learn Progress
        </p>

        {/* Pill-style linear stepper — visually distinct from main stepper */}
        <div className="flex items-center gap-0">
          {LEARN_STEPS.map((step, i) => {
            const isDone   = completed[step.key]
            const isActive = step.key === activeKey && !isDone
            const isLast   = i === LEARN_STEPS.length - 1

            return (
              <div key={step.key} className="flex items-center flex-1">
                {/* Step pill */}
                <motion.div
                  className="flex items-center gap-2 rounded-full px-3 h-8 flex-1 justify-center"
                  animate={{
                    background: isDone
                      ? 'rgba(255,184,0,0.12)'
                      : isActive
                        ? 'rgba(255,184,0,0.07)'
                        : 'var(--bg-float)',
                    borderColor: isDone || isActive
                      ? 'rgba(255,184,0,0.45)'
                      : 'var(--border-faint)',
                  }}
                  style={{ border: '1px solid', transition: 'all 0.3s ease' }}
                >
                  <span className="text-xs">{step.emoji}</span>
                  <span
                    className="font-body text-[11px] font-medium"
                    style={{
                      color: isDone
                        ? 'var(--text-brand)'
                        : isActive
                          ? 'var(--text-brand)'
                          : 'var(--text-4)',
                    }}
                  >
                    {step.label}
                  </span>
                  {isDone && (
                    <Check
                      className="h-3 w-3 shrink-0"
                      strokeWidth={3}
                      style={{ color: 'var(--text-brand)' }}
                    />
                  )}
                  {isActive && (
                    <motion.div
                      className="h-1.5 w-1.5 rounded-full shrink-0"
                      style={{ background: 'var(--brand)' }}
                      animate={{ opacity: [1, 0.3, 1] }}
                      transition={{ duration: 1.4, repeat: Infinity, ease: 'easeInOut' }}
                    />
                  )}
                </motion.div>

                {/* Connector arrow */}
                {!isLast && (
                  <div className="w-5 flex items-center justify-center shrink-0" aria-hidden="true">
                    <svg width="10" height="10" viewBox="0 0 10 10" fill="none">
                      <path
                        d="M2 5h6M6 3l2 2-2 2"
                        stroke={isDone ? '#FFB800' : 'var(--border-subtle)'}
                        strokeWidth="1.5"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      />
                    </svg>
                  </div>
                )}
              </div>
            )
          })}
        </div>
      </div>
    </div>
  )
}
