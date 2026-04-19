'use client'

import Link from 'next/link'
import { motion } from 'framer-motion'

interface StageLockedProps {
  stageNum:  number
  message?:  string
}

const STAGE_NAMES: Record<number, string> = {
  1: 'Applications',
  2: 'Orientation & Quiz',
  3: 'Payment',
  4: 'Build Phase',
  5: 'Certificates',
}

const STAGE_EMOJIS: Record<number, string> = {
  1: '📝', 2: '🧠', 3: '💳', 4: '🚀', 5: '🏆',
}

export function StageLocked({ stageNum, message }: StageLockedProps) {
  const name  = STAGE_NAMES[stageNum] ?? `Stage ${stageNum}`
  const emoji = STAGE_EMOJIS[stageNum] ?? '🔒'

  return (
    <motion.div
      className="flex flex-col items-center justify-center min-h-[60vh] px-4 py-16 text-center max-w-sm mx-auto"
      initial={{ opacity: 0, y: 24 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
    >
      {/* Outer glow container */}
      <div
        className="relative flex items-center justify-center w-24 h-24 rounded-2xl mb-8"
        style={{
          background: 'rgba(255,184,0,0.07)',
          border:     '1px solid rgba(255,184,0,0.25)',
          boxShadow:  '0 0 40px rgba(255,184,0,0.1)',
        }}
      >
        {/* Pulsing ring */}
        <motion.div
          className="absolute inset-0 rounded-2xl"
          style={{ border: '1px solid rgba(255,184,0,0.3)' }}
          animate={{ scale: [1, 1.12, 1], opacity: [0.6, 0, 0.6] }}
          transition={{ duration: 2.4, repeat: Infinity, ease: 'easeInOut' }}
        />
        <span className="text-4xl select-none">{emoji}</span>
        {/* Lock badge */}
        <div
          className="absolute -bottom-2.5 -right-2.5 w-8 h-8 rounded-full flex items-center justify-center text-base"
          style={{ background: 'var(--bg-float)', border: '2px solid var(--border-subtle)' }}
        >
          🔒
        </div>
      </div>

      {/* Label */}
      <p
        className="font-mono text-[11px] tracking-[0.25em] uppercase mb-3"
        style={{ color: 'var(--text-brand)' }}
      >
        Stage {stageNum} · {name}
      </p>

      {/* Heading */}
      <h1
        className="font-display leading-none tracking-wide mb-4"
        style={{ fontSize: 'clamp(2rem, 8vw, 3rem)', color: 'var(--text-1)' }}
      >
        NOT OPEN YET
      </h1>

      {/* Body */}
      <p
        className="font-body text-sm leading-relaxed mb-8"
        style={{ color: 'var(--text-3)' }}
      >
        {message ?? `${name} hasn't opened yet. The organiser will unlock this stage when you're ready. Stay tuned on Discord and WhatsApp.`}
      </p>

      {/* Pulsing dot indicator */}
      <div className="flex items-center gap-2 mb-8">
        <span
          className="w-2 h-2 rounded-full animate-pulse"
          style={{ background: 'var(--amber)' }}
        />
        <span className="font-mono text-[11px] tracking-wider" style={{ color: 'var(--text-4)' }}>
          Waiting for organiser to open
        </span>
      </div>

      {/* CTA back */}
      <Link
        href="/"
        className="inline-flex items-center gap-2 h-[48px] px-6 rounded-xl font-heading font-semibold text-sm tracking-wide border transition-all active:scale-95"
        style={{
          borderColor: 'var(--border-soft)',
          color:       'var(--text-2)',
        }}
      >
        ← Back to Home
      </Link>
    </motion.div>
  )
}
