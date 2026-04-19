'use client'

import { useState, useTransition } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { updateStageAction } from '@/lib/actions/admin'
import type { appSettings } from '@/lib/db/schema'

type Setting = typeof appSettings.$inferSelect

const STAGE_META: Record<string, {
  num:         number
  name:        string
  emoji:       string
  description: string
  color:       string
}> = {
  stage_1_open: {
    num: 1, name: 'Applications', emoji: '📝',
    description: 'Students can access Stage 1 and fill in their application form.',
    color: '#A78BFA',
  },
  stage_2_open: {
    num: 2, name: 'Orientation & Quiz', emoji: '🧠',
    description: 'Students can do orientation, pick their domain, take the quiz, and submit their idea.',
    color: '#60A5FA',
  },
  stage_3_open: {
    num: 3, name: 'Payment', emoji: '💳',
    description: 'Students can see tier pricing and complete payment via Razorpay.',
    color: '#34D399',
  },
  stage_4_open: {
    num: 4, name: 'Build Phase + Dashboard', emoji: '🚀',
    description: 'Paid students can access their dashboard, workshops, and the project submission form.',
    color: '#FFB800',
  },
  stage_5_open: {
    num: 5, name: 'Certificates', emoji: '🏆',
    description: 'Students can download their certificate and view final results.',
    color: '#FFD700',
  },
}

function StageToggle({ setting }: { setting: Setting }) {
  const meta = STAGE_META[setting.key]
  if (!meta) return null

  const [isOpen, setIsOpen]             = useState(setting.value === 'true')
  const [, startTransition]             = useTransition()
  const [saving, setSaving]             = useState(false)
  const [confirmClose, setConfirmClose] = useState(false)

  async function toggle(newValue: boolean) {
    setSaving(true)
    await updateStageAction(setting.key, newValue ? 'true' : 'false')
    startTransition(() => setIsOpen(newValue))
    setSaving(false)
    setConfirmClose(false)
  }

  function handleToggleClick() {
    if (isOpen) {
      setConfirmClose(true)
    } else {
      toggle(true)
    }
  }

  return (
    <div
      className="rounded-2xl border overflow-hidden"
      style={{
        background:  isOpen ? `${meta.color}08` : 'var(--bg-card)',
        borderColor: isOpen ? `${meta.color}40` : 'var(--border-faint)',
        boxShadow:   isOpen ? `0 0 24px ${meta.color}12` : 'none',
      }}
    >
      {/* Main row */}
      <div className="flex items-center gap-4 p-5">
        {/* Stage badge */}
        <div
          className="w-12 h-12 rounded-xl flex items-center justify-center text-2xl shrink-0 border"
          style={{
            background:  isOpen ? `${meta.color}15` : 'var(--bg-float)',
            borderColor: isOpen ? `${meta.color}35` : 'var(--border-subtle)',
          }}
        >
          {meta.emoji}
        </div>

        {/* Info */}
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-0.5 flex-wrap">
            <p
              className="font-heading font-bold text-sm"
              style={{ color: isOpen ? 'var(--text-1)' : 'var(--text-2)' }}
            >
              Stage {meta.num} — {meta.name}
            </p>
            <span
              className="font-mono text-[10px] px-2 py-0.5 rounded-full shrink-0"
              style={{
                background: isOpen ? `${meta.color}18` : 'var(--bg-float)',
                color:      isOpen ? meta.color : 'var(--text-4)',
                border:     `1px solid ${isOpen ? `${meta.color}35` : 'var(--border-faint)'}`,
              }}
            >
              {isOpen ? '● OPEN' : '○ LOCKED'}
            </span>
          </div>
          <p className="font-body text-xs leading-snug" style={{ color: 'var(--text-3)' }}>
            {meta.description}
          </p>
        </div>

        {/* Toggle switch */}
        <button
          onClick={handleToggleClick}
          disabled={saving}
          aria-pressed={isOpen}
          aria-label={`${isOpen ? 'Close' : 'Open'} Stage ${meta.num}`}
          className="shrink-0 relative w-14 h-7 rounded-full transition-all duration-300 active:scale-95 disabled:opacity-50"
          style={{
            background: isOpen ? meta.color : 'var(--bg-float)',
            border:     isOpen ? 'none' : '1px solid var(--border-subtle)',
          }}
        >
          <motion.div
            className="absolute top-1 w-5 h-5 rounded-full shadow-sm"
            style={{ background: isOpen ? '#000' : 'var(--text-4)' }}
            animate={{ x: isOpen ? 30 : 4 }}
            transition={{ type: 'spring', stiffness: 500, damping: 28 }}
          />
        </button>
      </div>

      {/* Confirm close panel */}
      <AnimatePresence>
        {confirmClose && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.22 }}
            className="overflow-hidden"
          >
            <div
              className="px-5 pb-5 pt-0 flex flex-col gap-3"
              style={{ borderTop: '1px solid var(--border-faint)' }}
            >
              <p className="font-body text-sm pt-4" style={{ color: 'var(--amber)' }}>
                ⚠️ This will lock Stage {meta.num} for ALL students immediately.
                Students mid-flow will be blocked. Are you sure?
              </p>
              <div className="flex gap-2">
                <button
                  onClick={() => toggle(false)}
                  disabled={saving}
                  className="flex-1 h-10 rounded-xl font-heading font-bold text-sm tracking-wide active:scale-95 disabled:opacity-50"
                  style={{ background: 'var(--red)', color: '#fff' }}
                >
                  {saving ? 'Closing…' : 'Yes, Close Stage'}
                </button>
                <button
                  onClick={() => setConfirmClose(false)}
                  disabled={saving}
                  className="flex-1 h-10 rounded-xl font-heading font-semibold text-sm border active:scale-95"
                  style={{ borderColor: 'var(--border-subtle)', color: 'var(--text-2)' }}
                >
                  Cancel
                </button>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}

export function StagesClient({ settings }: { settings: Setting[] }) {
  const sorted = [...settings].sort((a, b) => {
    const numA = parseInt(a.key.replace('stage_', '').replace('_open', ''), 10)
    const numB = parseInt(b.key.replace('stage_', '').replace('_open', ''), 10)
    return numA - numB
  })

  const openCount = sorted.filter(s => s.value === 'true').length

  return (
    <div className="space-y-4">
      {/* Summary strip */}
      <div
        className="rounded-xl px-4 py-3 flex items-center gap-3"
        style={{ background: 'var(--bg-card)', border: '1px solid var(--border-faint)' }}
      >
        <div className="flex gap-1">
          {sorted.map((s) => {
            const isOpen = s.value === 'true'
            const meta   = STAGE_META[s.key]
            return (
              <div
                key={s.key}
                className="w-7 h-7 rounded-lg flex items-center justify-center text-sm border"
                style={{
                  background:  isOpen ? `${meta?.color}15` : 'var(--bg-float)',
                  borderColor: isOpen ? `${meta?.color}40` : 'var(--border-faint)',
                }}
                title={`Stage ${meta?.num}: ${isOpen ? 'Open' : 'Locked'}`}
              >
                {isOpen ? meta?.emoji : '🔒'}
              </div>
            )
          })}
        </div>
        <p className="font-body text-sm" style={{ color: 'var(--text-3)' }}>
          <span style={{ color: 'var(--text-1)', fontWeight: 600 }}>{openCount}</span>
          {' '}of {sorted.length} stages currently open
        </p>
      </div>

      {sorted.map(setting => (
        <StageToggle key={setting.key} setting={setting} />
      ))}
    </div>
  )
}
