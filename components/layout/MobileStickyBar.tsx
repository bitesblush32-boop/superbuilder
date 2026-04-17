'use client'

import { useEffect, useRef, useState } from 'react'
import Link from 'next/link'
import { motion, AnimatePresence } from 'framer-motion'
import { useCountdown } from '@/hooks/useCountdown'
import { REG_DEADLINE, HACKATHON_START } from '@/lib/content/programme'

/* ─── MobileStickyBar ────────────────────────────────────────────────────────── */
export function MobileStickyBar() {
  const [visible, setVisible] = useState(false)
  const sentinelRef = useRef<HTMLDivElement>(null)

  const { days: regDays, expired: regClosed } = useCountdown(REG_DEADLINE)
  const { days: hackDays, expired: hackStarted } = useCountdown(HACKATHON_START)

  const countdownLabel = regClosed
    ? hackStarted
      ? 'Live Now 🔥'
      : `${hackDays}d to Hackathon`
    : `${regDays}d left`

  /* Observe sentinel div placed at the bottom of the hero section */
  useEffect(() => {
    const el = sentinelRef.current
    if (!el) return

    const observer = new IntersectionObserver(
      ([entry]) => {
        // Show when sentinel (end of hero) has scrolled OUT of view
        setVisible(!entry.isIntersecting)
      },
      { threshold: 0, rootMargin: '0px' },
    )

    observer.observe(el)
    return () => observer.disconnect()
  }, [])

  return (
    <>
      {/* Sentinel — rendered at the bottom of the hero section's viewport height */}
      <div
        ref={sentinelRef}
        className="absolute top-screen left-0 w-px h-px pointer-events-none"
        style={{ top: '100vh' }}
        aria-hidden="true"
      />

      <AnimatePresence>
        {visible && (
          <motion.div
            key="sticky-bar"
            initial={{ y: '100%', opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            exit={{ y: '100%', opacity: 0 }}
            transition={{ type: 'spring', stiffness: 380, damping: 32 }}
            className="fixed bottom-0 inset-x-0 z-50 md:hidden"
            style={{ willChange: 'transform' }}
          >
            {/* Safe area padding for iPhone home indicator */}
            <div
              className="flex items-center justify-between gap-3 px-4 border-t"
              style={{
                background:   'rgba(22, 22, 22, 0.95)',
                backdropFilter: 'blur(16px)',
                WebkitBackdropFilter: 'blur(16px)',
                borderColor:  'rgba(255,184,0,0.3)',
                paddingTop:   '12px',
                paddingBottom: 'calc(12px + env(safe-area-inset-bottom, 0px))',
                minHeight:    '60px',
              }}
            >
              {/* Left: countdown */}
              <div className="flex flex-col gap-0.5 min-w-0">
                <span
                  className="font-mono text-[12px] tracking-[0.18em] uppercase leading-none"
                  style={{ color: 'var(--text-4)' }}
                >
                  Registration
                </span>
                <span
                  className="font-mono text-[13px] font-semibold leading-none"
                  style={{ color: 'var(--text-2)' }}
                >
                  {countdownLabel}
                </span>
              </div>

              {/* Right: CTA */}
              <motion.div
                whileTap={{ scale: 0.95 }}
                transition={{ type: 'spring', stiffness: 500, damping: 20 }}
                className="flex-shrink-0"
              >
                <Link
                  href="/register/stage-1"
                  className="flex items-center justify-center gap-1.5 h-[44px] px-5 rounded-[4px] font-heading font-bold text-[13px] tracking-[0.08em] uppercase text-black"
                  style={{
                    background: 'var(--brand)',
                    boxShadow:  '0 0 0 1px rgba(255,184,0,0.4), 0 4px 16px rgba(255,184,0,0.3)',
                  }}
                >
                  Register Now 🚀
                </Link>
              </motion.div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  )
}
