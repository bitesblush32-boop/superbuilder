'use client'

import { useRegistrationStore } from '@/lib/store/registration'
import { motion } from 'framer-motion'
import { Check } from 'lucide-react'

const STAGE1_SUBSTEPS = [
  { step: 1 as const, label: 'Personal Info',  icon: '🪪' },
  { step: 2 as const, label: 'Parents Info',   icon: '👨‍👩‍👧' },
  { step: 3 as const, label: 'Team Building',  icon: '👥' },
]

interface Stage1SubProgressProps {
  /** Layout variant: 'sidebar' for vertical list, 'bar' for compact horizontal strip */
  variant?: 'sidebar' | 'bar'
}

export function Stage1SubProgress({ variant = 'bar' }: Stage1SubProgressProps) {
  const subStep = useRegistrationStore(s => s.stage1SubStep)

  if (variant === 'sidebar') {
    return (
      <ul className="flex flex-col gap-1 pl-1">
        {STAGE1_SUBSTEPS.map(({ step, label }) => {
          const isDone   = step < subStep
          const isActive = step === subStep
          return (
            <li key={step} className="flex items-center gap-2.5 py-1">
              {/* Circle indicator */}
              <div className="relative flex-shrink-0">
                <motion.div
                  className="w-5 h-5 rounded-full flex items-center justify-center"
                  style={{
                    background: isDone
                      ? '#FFB800'
                      : isActive
                        ? 'transparent'
                        : 'transparent',
                    border: isDone
                      ? '2px solid #FFB800'
                      : isActive
                        ? '2px solid #FFB800'
                        : '2px solid var(--border-subtle)',
                  }}
                  animate={isActive ? { scale: [1, 1.08, 1] } : { scale: 1 }}
                  transition={isActive
                    ? { duration: 2, repeat: Infinity, ease: 'easeInOut' }
                    : { duration: 0.2 }
                  }
                >
                  {isDone ? (
                    <Check size={10} strokeWidth={3} style={{ color: '#000' }} />
                  ) : (
                    <span
                      className="text-[9px] font-mono font-bold"
                      style={{ color: isActive ? '#FFB800' : 'var(--text-4)' }}
                    >
                      {step}
                    </span>
                  )}
                </motion.div>
                {/* Active pulse ring */}
                {isActive && (
                  <motion.div
                    className="absolute inset-0 rounded-full pointer-events-none"
                    style={{ border: '2px solid #FFB800' }}
                    initial={{ scale: 1, opacity: 0.5 }}
                    animate={{ scale: 1.8, opacity: 0 }}
                    transition={{ duration: 1.4, repeat: Infinity, ease: 'easeOut' }}
                  />
                )}
              </div>

              {/* Label */}
              <span
                className="font-body text-xs leading-none"
                style={{
                  color: isDone
                    ? 'var(--text-brand)'
                    : isActive
                      ? 'var(--text-1)'
                      : 'var(--text-4)',
                  fontWeight: isActive ? 600 : 400,
                }}
              >
                {label}
              </span>

              {isDone && (
                <span className="text-[10px] ml-auto" style={{ color: 'var(--text-brand)' }}>✓</span>
              )}
            </li>
          )
        })}
      </ul>
    )
  }

  // Bar variant — compact horizontal strip
  return (
    <div className="w-full px-4 py-2 flex items-center gap-3">
      {STAGE1_SUBSTEPS.map(({ step, label }, i) => {
        const isDone   = step < subStep
        const isActive = step === subStep
        return (
          <div key={step} className="flex items-center gap-2 flex-1">
            {/* Connector line before (except first) */}
            {i > 0 && (
              <div className="h-px flex-1" style={{
                background: step <= subStep ? '#FFB800' : 'var(--border-faint)',
              }} />
            )}
            <div className="flex flex-col items-center gap-0.5 shrink-0">
              <div
                className="w-4 h-4 rounded-full flex items-center justify-center"
                style={{
                  background: isDone ? '#FFB800' : 'transparent',
                  border: isDone || isActive
                    ? '2px solid #FFB800'
                    : '2px solid var(--border-subtle)',
                }}
              >
                {isDone ? (
                  <Check size={8} strokeWidth={3} style={{ color: '#000' }} />
                ) : (
                  <span className="text-[8px] font-mono font-bold" style={{ color: isActive ? '#FFB800' : 'var(--text-4)' }}>
                    {step}
                  </span>
                )}
              </div>
              <span
                className="text-[10px] font-body whitespace-nowrap"
                style={{ color: isActive ? 'var(--brand)' : isDone ? 'var(--text-brand)' : 'var(--text-4)' }}
              >
                {label}
              </span>
            </div>
          </div>
        )
      })}
    </div>
  )
}
