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
    num: 1, name: 'Apply', emoji: '📝',
    description: 'Students fill in personal info, parent consent, and create or join a team.',
    color: '#A78BFA',
  },
  stage_2_open: {
    num: 2, name: 'Orientation & Learning', emoji: '🧠',
    description: 'Orientation video, domain selection, AI quiz (domain-specific, 10 Qs), and idea pitch.',
    color: '#60A5FA',
  },
  stage_3_open: {
    num: 3, name: 'Payment', emoji: '💳',
    description: 'Engage questions + Razorpay payment (₹3,499 solo / ₹2,999/head team).',
    color: '#34D399',
  },
  stage_4_open: {
    num: 4, name: 'Build Phase', emoji: '🚀',
    description: 'Paid students access workshops, mentors, submit their project during the hackathon.',
    color: '#FFB800',
  },
  stage_5_open: {
    num: 5, name: 'Certificates', emoji: '🏆',
    description: 'Results published, leaderboard finalised, certificates available for download.',
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
      className="rounded-2xl border overflow-hidden transition-all duration-300"
      style={{
        background:  isOpen ? `${meta.color}08` : 'var(--bg-card)',
        borderColor: isOpen ? `${meta.color}40` : 'var(--border-faint)',
        boxShadow:   isOpen ? `0 0 32px ${meta.color}18` : 'none',
      }}
    >
      {/* Main row */}
      <div className="flex items-center gap-3 sm:gap-4 p-4 sm:p-5">
        {/* Stage badge */}
        <div
          className="w-10 h-10 sm:w-12 sm:h-12 rounded-xl flex items-center justify-center text-xl sm:text-2xl shrink-0 border transition-all duration-300"
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
              className="font-mono text-[10px] px-2 py-0.5 rounded-full shrink-0 transition-all duration-300"
              style={{
                background: isOpen ? `${meta.color}18` : 'var(--bg-float)',
                color:      isOpen ? meta.color : 'var(--text-4)',
                border:     `1px solid ${isOpen ? `${meta.color}35` : 'var(--border-faint)'}`,
              }}
            >
              {isOpen ? '● OPEN' : '○ LOCKED'}
            </span>
          </div>
          <p className="font-body text-xs leading-snug hidden sm:block" style={{ color: 'var(--text-3)' }}>
            {meta.description}
          </p>
        </div>

        {/* Premium toggle switch */}
        <button
          onClick={handleToggleClick}
          disabled={saving}
          aria-pressed={isOpen}
          aria-label={`${isOpen ? 'Close' : 'Open'} Stage ${meta.num}`}
          className="shrink-0 relative rounded-full transition-all duration-300 active:scale-95 disabled:opacity-50 focus:outline-none"
          style={{
            width: '56px',
            height: '30px',
            minHeight: 'unset',  // prevent global min-height: 44px from stretching this
            background: isOpen
              ? `linear-gradient(135deg, ${meta.color}ee, ${meta.color}aa)`
              : 'var(--bg-float)',
            border: isOpen
              ? `1px solid ${meta.color}80`
              : '1px solid var(--border-soft)',
            boxShadow: isOpen
              ? `0 0 18px ${meta.color}55, inset 0 1px 0 rgba(255,255,255,0.18)`
              : 'inset 0 2px 4px rgba(0,0,0,0.5)',
          }}
        >
          {/* Outer glow ring when open */}
          {isOpen && (
            <span
              className="absolute inset-0 rounded-full pointer-events-none animate-pulse"
              style={{ boxShadow: `0 0 0 4px ${meta.color}22` }}
            />
          )}
          {/* Thumb */}
          <motion.div
            className="absolute rounded-full"
            style={{
              top: '4px',
              width: '20px',
              height: '20px',
              background: isOpen ? '#ffffff' : 'var(--text-4)',
              boxShadow: isOpen
                ? `0 2px 8px rgba(0,0,0,0.4), 0 0 0 1px rgba(255,255,255,0.15)`
                : '0 1px 4px rgba(0,0,0,0.35)',
            }}
            animate={{ x: isOpen ? 30 : 5 }}
            transition={{ type: 'spring', stiffness: 600, damping: 32 }}
          />
        </button>
      </div>

      {/* Description shown below on mobile */}
      <p className="font-body text-xs leading-snug sm:hidden px-4 pb-4 -mt-1" style={{ color: 'var(--text-3)' }}>
        {meta.description}
      </p>

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
              className="px-4 sm:px-5 pb-4 sm:pb-5 pt-0 flex flex-col sm:flex-row gap-3"
              style={{ borderTop: '1px solid var(--border-faint)' }}
            >
              <p className="font-body text-sm pt-4 flex-1" style={{ color: 'var(--amber)' }}>
                ⚠️ This will lock Stage {meta.num} for ALL students immediately.
                Students mid-flow will be blocked. Are you sure?
              </p>
              <div className="flex gap-2 sm:items-end sm:pb-0 pt-0 sm:pt-4">
                <button
                  onClick={() => toggle(false)}
                  disabled={saving}
                  className="flex-1 sm:flex-none sm:w-36 rounded-xl font-heading font-bold text-sm tracking-wide active:scale-95 disabled:opacity-50 transition-all"
                  style={{ height: '40px', minHeight: 'unset', background: 'var(--red)', color: '#fff', boxShadow: '0 2px 12px rgba(248,113,113,0.35)' }}
                >
                  {saving ? 'Closing…' : 'Yes, Close Stage'}
                </button>
                <button
                  onClick={() => setConfirmClose(false)}
                  disabled={saving}
                  className="flex-1 sm:flex-none sm:w-24 rounded-xl font-heading font-semibold text-sm border active:scale-95 transition-all"
                  style={{ height: '40px', minHeight: 'unset', borderColor: 'var(--border-subtle)', color: 'var(--text-2)' }}
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
