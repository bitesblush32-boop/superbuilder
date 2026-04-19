'use client'

import { usePathname } from 'next/navigation'
import { motion } from 'framer-motion'
import { Check } from 'lucide-react'

const STAGES = [
  { num: 1, label: 'Apply'       },
  { num: 2, label: 'Team'        },
  { num: 3, label: 'Orientation' },
  { num: 4, label: 'Learn'       },
  { num: 5, label: 'Idea'        },
  { num: 6, label: 'Pay'         },
  { num: 7, label: 'Build'       },
]

interface StageProgressBarProps {
  currentStage:         number
  orientationComplete?: boolean
  hackathonDomain?:     string | null
  quizPassed?:          boolean
  ideaSubmitted?:       boolean
}

function computeDisplayStage(
  pathname: string,
  currentStage: number,
  orientationComplete: boolean,
  hasDomain: boolean,
  quizPassed: boolean,
  ideaSubmitted: boolean,
): number {
  // Priority: Match exact routes so the stepper always visually matches the page
  if (pathname.includes('/register/stage-1')) return 1
  if (pathname.includes('/register/team')) return 2
  if (pathname.includes('/register/stage-2/orientation')) return 3
  if (pathname.includes('/register/stage-2/idea')) return 5
  if (pathname.includes('/register/stage-2')) return 4
  if (pathname.includes('/register/stage-3')) return 6
  if (pathname.includes('/register/success') || pathname.includes('/dashboard')) return 7

  // Fallback to state-based calculation
  if (currentStage <= 1) return 1
  if (currentStage >= 4) return 7
  if (currentStage === 3) return 6

  if (!orientationComplete) return 3
  if (!hasDomain || !quizPassed) return 4
  if (!ideaSubmitted) return 5
  return 5
}

export function StageProgressBar({
  currentStage,
  orientationComplete = false,
  hackathonDomain,
  quizPassed = false,
  ideaSubmitted = false,
}: StageProgressBarProps) {
  const pathname     = usePathname()
  const displayStage = computeDisplayStage(
    pathname, currentStage,
    orientationComplete, !!hackathonDomain, quizPassed, ideaSubmitted,
  )

  return (
    <div className="w-full px-4 py-3 sm:py-4">
      <div className="relative mx-auto max-w-2xl">
        {/* Connector lines */}
        <div className="absolute top-4 left-0 right-0 flex items-center px-3 sm:px-4" aria-hidden="true">
          {STAGES.slice(0, -1).map((stage) => {
            const isComplete = stage.num < displayStage
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
                  transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1], delay: stage.num * 0.06 }}
                />
              </div>
            )
          })}
        </div>

        {/* Circles row */}
        <div className="relative flex items-start justify-between">
          {STAGES.map((stage) => {
            const isDone   = stage.num < displayStage
            const isActive = stage.num === displayStage
            const isLocked = stage.num > displayStage

            return (
              <div key={stage.num} className="flex flex-col items-center gap-1.5">
                {/* Circle */}
                <motion.div
                  layout
                  className="relative flex h-8 w-8 items-center justify-center rounded-full text-[10px] font-bold font-mono select-none"
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
                  animate={{ scale: isActive ? [1, 1.06, 1] : 1 }}
                  transition={isActive
                    ? { duration: 2.4, repeat: Infinity, ease: 'easeInOut' }
                    : { duration: 0.3 }
                  }
                >
                  {isDone ? (
                    <Check className="h-3.5 w-3.5" strokeWidth={3} />
                  ) : (
                    <span>{stage.num}</span>
                  )}

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

                {/* Label — hidden on very small screens */}
                <span
                  className={[
                    'hidden sm:block text-[10px] font-body text-center leading-tight max-w-[46px]',
                    isDone   ? 'text-brand'                   : '',
                    isActive ? 'text-brand font-semibold'     : '',
                    isLocked ? ''                             : '',
                  ].join(' ')}
                  style={{ color: isLocked ? 'var(--text-4)' : undefined }}
                >
                  {stage.label}
                </span>
              </div>
            )
          })}
        </div>
      </div>

      {/* Mobile step text */}
      <p className="sm:hidden mt-2 text-center text-[11px] text-text-3 font-body">
        Step <span className="text-brand font-semibold">{displayStage}</span> of {STAGES.length}
      </p>
    </div>
  )
}
