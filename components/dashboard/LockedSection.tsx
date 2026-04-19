'use client'

import { motion } from 'framer-motion'

interface LockedSectionProps {
  emoji:      string
  title:      string
  reason:     string
  unlocksAt?: string
}

export function LockedSection({ emoji, title, reason, unlocksAt }: LockedSectionProps) {
  return (
    <motion.div
      className="flex flex-col items-center justify-center py-16 px-6 text-center rounded-2xl border"
      style={{ background: 'var(--bg-card)', borderColor: 'var(--border-faint)' }}
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, ease: [0.16, 1, 0.3, 1] }}
    >
      <div
        className="w-14 h-14 rounded-xl flex items-center justify-center text-3xl mb-4 border"
        style={{
          background:  'var(--bg-float)',
          borderColor: 'var(--border-subtle)',
          filter:      'grayscale(0.3)',
        }}
      >
        {emoji}
      </div>
      <p className="font-display text-xl tracking-wide mb-2" style={{ color: 'var(--text-2)' }}>
        {title}
      </p>
      <p className="font-body text-sm max-w-[280px] leading-relaxed mb-3" style={{ color: 'var(--text-4)' }}>
        {reason}
      </p>
      {unlocksAt && (
        <div
          className="flex items-center gap-2 font-mono text-[11px] px-3 h-7 rounded-full border"
          style={{
            background:  'rgba(255,184,0,0.06)',
            borderColor: 'rgba(255,184,0,0.2)',
            color:       'var(--text-brand)',
          }}
        >
          🕐 Opens: {unlocksAt}
        </div>
      )}
    </motion.div>
  )
}
