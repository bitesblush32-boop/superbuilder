'use client'

import { motion } from 'framer-motion'
import { Check } from 'lucide-react'

const STAGES = [
  { num: 1, label: 'Apply' },
  { num: 2, label: 'Quiz + Idea' },
  { num: 3, label: 'Pay' },
  { num: 4, label: 'Build' },
  { num: 5, label: 'Celebrate' },
]

interface StageProgressBarProps {
  currentStage: number
}

export function StageProgressBar({ currentStage }: StageProgressBarProps) {
  return (
    <div className="w-full px-4 py-3 sm:py-4">
      <div className="relative mx-auto max-w-md sm:max-w-lg">
        {/* Connector lines — rendered behind circles */}
        <div className="absolute top-4 left-0 right-0 flex items-center px-4 sm:px-5" aria-hidden="true">
          {STAGES.slice(0, -1).map((stage) => {
            const isComplete = stage.num < currentStage
            return (
              <div
                key={stage.num}
                className="relative flex-1 h-[2px] overflow-hidden"
                style={{ background: 'var(--border-faint)' }}
              >
                <motion.div
                  className="absolute inset-0 h-full origin-left"
                  style={{ background: 'linear-gradient(90deg, #FFB800, #FFCF40)' }}
                  initial={{ scaleX: 0 }}
                  animate={{ scaleX: isComplete ? 1 : 0 }}
                  transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1], delay: stage.num * 0.08 }}
                />
              </div>
            )
          })}
        </div>

        {/* Circles row */}
        <div className="relative flex items-start justify-between">
          {STAGES.map((stage) => {
            const isDone   = stage.num < currentStage
            const isActive = stage.num === currentStage
            const isLocked = stage.num > currentStage

            return (
              <div key={stage.num} className="flex flex-col items-center gap-1.5">
                {/* Circle */}
                <motion.div
                  layout
                  className="relative flex h-8 w-8 sm:h-9 sm:w-9 items-center justify-center rounded-full text-[11px] sm:text-xs font-bold font-mono select-none"
                  style={{
                    background: isDone
                      ? '#FFB800'
                      : isActive
                        ? 'var(--bg-base)'
                        : 'var(--bg-float)',
                    border: isActive
                      ? '2px solid #FFB800'
                      : isDone
                        ? '2px solid #FFB800'
                        : '2px solid var(--border-subtle)',
                    color: isDone
                      ? '#000'
                      : isActive
                        ? '#FFB800'
                        : 'var(--text-4)',
                    boxShadow: isActive
                      ? '0 0 14px rgba(255,184,0,0.45), 0 0 4px rgba(255,184,0,0.3)'
                      : isDone
                        ? '0 0 8px rgba(255,184,0,0.2)'
                        : 'none',
                  }}
                  initial={false}
                  animate={{
                    scale: isActive ? [1, 1.06, 1] : 1,
                  }}
                  transition={isActive
                    ? { duration: 2.4, repeat: Infinity, ease: 'easeInOut' }
                    : { duration: 0.3 }
                  }
                >
                  {isDone ? (
                    <Check className="h-3.5 w-3.5 sm:h-4 sm:w-4" strokeWidth={3} />
                  ) : (
                    <span>{stage.num}</span>
                  )}

                  {/* Active glow ring */}
                  {isActive && (
                    <motion.div
                      className="absolute inset-0 rounded-full"
                      style={{ border: '2px solid #FFB800' }}
                      initial={{ scale: 1, opacity: 0.6 }}
                      animate={{ scale: 1.6, opacity: 0 }}
                      transition={{ duration: 1.6, repeat: Infinity, ease: 'easeOut' }}
                    />
                  )}
                </motion.div>

                {/* Label — hidden on xs, visible on sm+ */}
                <span
                  className={[
                    'hidden sm:block text-[10px] font-body text-center leading-tight max-w-[56px]',
                    isDone   ? 'text-brand'   : '',
                    isActive ? 'text-brand font-semibold' : '',
                    isLocked ? 'text-text-4'  : '',
                  ].join(' ')}
                >
                  {stage.label}
                </span>
              </div>
            )
          })}
        </div>
      </div>

      {/* Mobile step text — xs only */}
      <p className="sm:hidden mt-2 text-center text-[11px] text-text-3 font-body">
        Step <span className="text-brand font-semibold">{currentStage}</span> of 5
      </p>
    </div>
  )
}
