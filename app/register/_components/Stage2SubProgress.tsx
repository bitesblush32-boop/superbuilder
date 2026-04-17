'use client'

import { motion } from 'framer-motion'
import { Check } from 'lucide-react'

const SUB_STEPS = [
  { key: 'orientation', label: 'Orientation' },
  { key: 'domain',      label: 'Domain' },
  { key: 'quiz',        label: 'Quiz' },
  { key: 'idea',        label: 'Idea' },
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
  hasIdea,
}: Stage2SubProgressProps) {
  const completed: Record<string, boolean> = {
    orientation: orientationComplete,
    domain:      hasDomain,
    quiz:        hasPassedQuiz,
    idea:        hasIdea,
  }

  // Active = first incomplete step
  const activeKey = SUB_STEPS.find(s => !completed[s.key])?.key ?? 'idea'

  return (
    <div className="w-full px-4 py-2.5">
      <div className="relative mx-auto max-w-md sm:max-w-lg flex items-center justify-between">

        {/* Connector lines */}
        <div
          className="absolute top-[13px] left-0 right-0 flex items-center px-[13px] sm:px-[15px]"
          aria-hidden="true"
        >
          {SUB_STEPS.slice(0, -1).map((step, i) => {
            const isComplete = completed[step.key]
            return (
              <div
                key={step.key}
                className="relative flex-1 h-[1.5px] overflow-hidden"
                style={{ background: 'var(--border-faint)' }}
              >
                <motion.div
                  className="absolute inset-0 origin-left"
                  style={{ background: 'linear-gradient(90deg, #FFB800, #FFCF40)' }}
                  initial={{ scaleX: 0 }}
                  animate={{ scaleX: isComplete ? 1 : 0 }}
                  transition={{ duration: 0.4, ease: [0.16, 1, 0.3, 1], delay: i * 0.07 }}
                />
              </div>
            )
          })}
        </div>

        {/* Dots row */}
        {SUB_STEPS.map((step) => {
          const isDone   = completed[step.key]
          const isActive = step.key === activeKey && !isDone

          return (
            <div key={step.key} className="flex flex-col items-center gap-1 relative">
              {/* Dot */}
              <motion.div
                className="relative flex h-[26px] w-[26px] items-center justify-center rounded-full text-[9px] font-bold font-mono select-none"
                style={{
                  background: isDone
                    ? '#FFB800'
                    : isActive
                      ? 'var(--bg-base)'
                      : 'var(--bg-float)',
                  border: isDone || isActive
                    ? '1.5px solid #FFB800'
                    : '1.5px solid var(--border-subtle)',
                  color: isDone
                    ? '#000'
                    : isActive
                      ? '#FFB800'
                      : 'var(--text-4)',
                  boxShadow: isActive
                    ? '0 0 10px rgba(255,184,0,0.40)'
                    : isDone
                      ? '0 0 6px rgba(255,184,0,0.15)'
                      : 'none',
                }}
                initial={false}
                animate={{ scale: isActive ? [1, 1.08, 1] : 1 }}
                transition={isActive
                  ? { duration: 2.2, repeat: Infinity, ease: 'easeInOut' }
                  : { duration: 0.25 }
                }
              >
                {isDone ? (
                  <Check className="h-3 w-3" strokeWidth={3} />
                ) : (
                  <span className="text-[8px]">●</span>
                )}

                {/* Active pulse ring */}
                {isActive && (
                  <motion.div
                    className="absolute inset-0 rounded-full"
                    style={{ border: '1.5px solid #FFB800' }}
                    initial={{ scale: 1, opacity: 0.5 }}
                    animate={{ scale: 1.7, opacity: 0 }}
                    transition={{ duration: 1.5, repeat: Infinity, ease: 'easeOut' }}
                  />
                )}
              </motion.div>

              {/* Label */}
              <span
                className="text-[10px] font-body leading-none"
                style={{
                  color: isDone
                    ? 'var(--text-brand)'
                    : isActive
                      ? 'var(--text-brand)'
                      : 'var(--text-4)',
                  fontWeight: isActive ? 600 : 400,
                }}
              >
                {step.label}
              </span>
            </div>
          )
        })}
      </div>
    </div>
  )
}
