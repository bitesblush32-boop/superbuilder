'use client'

import { useEffect, useRef } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { BADGES, type BadgeId } from '@/lib/gamification/badges'

interface BadgeUnlockProps {
  badge: BadgeId | null
  onDismiss: () => void
}

const overlayVariants = {
  hidden: { opacity: 0 },
  visible: { opacity: 1, transition: { duration: 0.25 } },
  exit:    { opacity: 0, transition: { duration: 0.2 } },
}

type Bez = [number, number, number, number]
const EASE_OUT: Bez = [0.16, 1, 0.3, 1]

const cardVariants = {
  hidden: { scale: 0.78, opacity: 0, y: 24 },
  visible: {
    scale: 1,
    opacity: 1,
    y: 0,
    transition: { type: 'spring' as const, stiffness: 380, damping: 24, delay: 0.1 },
  },
  exit: {
    scale: 0.9,
    opacity: 0,
    y: -16,
    transition: { duration: 0.18, ease: 'easeIn' as const },
  },
}

const badgeCircleVariants = {
  hidden: { scale: 0, rotate: -20 },
  visible: {
    scale: 1,
    rotate: 0,
    transition: { type: 'spring' as const, stiffness: 460, damping: 18, delay: 0.25 },
  },
}

const textVariants = {
  hidden: { opacity: 0, y: 16 },
  visible: (delay: number) => ({
    opacity: 1,
    y: 0,
    transition: { duration: 0.35, ease: EASE_OUT, delay },
  }),
}

export function BadgeUnlock({ badge, onDismiss }: BadgeUnlockProps) {
  const confettiFired = useRef(false)
  const info = badge ? BADGES[badge] : null

  // Fire confetti after badge circle animates in
  useEffect(() => {
    if (!badge || confettiFired.current) return
    confettiFired.current = true

    const timer = setTimeout(async () => {
      const confetti = (await import('canvas-confetti')).default
      const color = info?.color ?? '#FFB800'

      confetti({
        particleCount: 90,
        spread: 70,
        origin: { y: 0.55 },
        colors: [color, '#FFB800', '#FFCF40', '#ffffff'],
        gravity: 1.1,
        scalar: 0.9,
        ticks: 200,
      })
    }, 420)

    return () => clearTimeout(timer)
  }, [badge, info?.color])

  // Reset confetti flag when badge clears
  useEffect(() => {
    if (!badge) confettiFired.current = false
  }, [badge])

  return (
    <AnimatePresence>
      {badge && info && (
        <>
          {/* aria live announcement */}
          <div aria-live="polite" className="sr-only">
            Badge unlocked: {info.id.replace(/_/g, ' ')}. {info.copy}
          </div>

          {/* Overlay */}
          <motion.div
            className="fixed inset-0 z-50 flex items-center justify-center p-4"
            style={{ background: 'rgba(0,0,0,0.82)', backdropFilter: 'blur(6px)' }}
            variants={overlayVariants}
            initial="hidden"
            animate="visible"
            exit="exit"
            onClick={onDismiss}
            role="dialog"
            aria-modal="true"
            aria-label={`Badge unlocked: ${info.id.replace(/_/g, ' ')}`}
          >
            {/* Card */}
            <motion.div
              className="relative w-full max-w-[320px] rounded-2xl border flex flex-col items-center gap-5 px-6 pb-7 pt-8 text-center"
              style={{
                background: 'var(--bg-card)',
                borderColor: `${info.color}55`,
                boxShadow: `0 0 48px ${info.color}33, 0 0 0 1px ${info.color}22`,
              }}
              variants={cardVariants}
              initial="hidden"
              animate="visible"
              exit="exit"
              onClick={(e) => e.stopPropagation()}
            >
              {/* Radial glow behind badge */}
              <div
                className="absolute top-0 left-1/2 -translate-x-1/2 -translate-y-1/2 w-32 h-32 rounded-full pointer-events-none"
                style={{
                  background: `radial-gradient(circle, ${info.color}30 0%, transparent 70%)`,
                }}
                aria-hidden="true"
              />

              {/* Badge circle */}
              <motion.div
                className="relative flex items-center justify-center w-24 h-24 rounded-full text-5xl select-none"
                style={{
                  background: `radial-gradient(135deg, ${info.color}22 0%, transparent 70%)`,
                  border: `3px solid ${info.color}`,
                  boxShadow: `0 0 24px ${info.color}55, 0 0 8px ${info.color}33`,
                }}
                variants={badgeCircleVariants}
                initial="hidden"
                animate="visible"
              >
                {info.emoji}

                {/* Orbiting dot */}
                <motion.div
                  className="absolute w-2.5 h-2.5 rounded-full"
                  style={{
                    background: info.color,
                    boxShadow: `0 0 8px ${info.color}`,
                    top: '6px',
                    right: '6px',
                  }}
                  animate={{ rotate: 360 }}
                  transition={{ duration: 3, repeat: Infinity, ease: 'linear' }}
                  aria-hidden="true"
                />
              </motion.div>

              {/* "BADGE UNLOCKED" label */}
              <motion.p
                className="text-[12px] font-mono tracking-[0.2em] uppercase"
                style={{ color: info.color }}
                variants={textVariants}
                custom={0.45}
                initial="hidden"
                animate="visible"
              >
                Badge Unlocked
              </motion.p>

              {/* Badge name */}
              <motion.h2
                className="font-display text-3xl leading-none tracking-wide"
                style={{ color: '#FFFFFF' }}
                variants={textVariants}
                custom={0.52}
                initial="hidden"
                animate="visible"
              >
                {info.id.replace(/_/g, ' ').toUpperCase()}
              </motion.h2>

              {/* XP pill */}
              <motion.div
                className="flex items-center gap-1.5 rounded-full px-3 py-1 text-xs font-mono font-bold"
                style={{
                  background: `${info.color}18`,
                  border: `1px solid ${info.color}40`,
                  color: info.color,
                }}
                variants={textVariants}
                custom={0.58}
                initial="hidden"
                animate="visible"
              >
                <span>⚡</span>
                <span>+{info.xp} XP</span>
              </motion.div>

              {/* Copy text */}
              <motion.p
                className="text-sm font-body leading-snug max-w-[220px]"
                style={{ color: 'var(--text-2)' }}
                variants={textVariants}
                custom={0.65}
                initial="hidden"
                animate="visible"
              >
                {info.copy}
              </motion.p>

              {/* CTA button */}
              <motion.button
                className="mt-1 w-full rounded-xl py-3 text-sm font-heading font-semibold tracking-wide transition-all active:scale-[0.97]"
                style={{
                  background: info.color,
                  color: '#000',
                  minHeight: '44px',
                }}
                onClick={onDismiss}
                variants={textVariants}
                custom={0.78}
                initial="hidden"
                animate="visible"
                whileHover={{ opacity: 0.9 }}
                whileTap={{ scale: 0.97 }}
              >
                Keep Going →
              </motion.button>
            </motion.div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  )
}
