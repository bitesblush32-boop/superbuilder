'use client'

import { useState } from 'react'
import { updateSettingAction } from '@/lib/actions/admin'
import type { appSettings } from '@/lib/db/schema'

type Setting = typeof appSettings.$inferSelect

const SECTIONS = [
  {
    title: 'Solo Price',
    emoji: '🦅',
    keys: ['price_solo'],
    description: 'Flat fee for students registering without a team, or as the only member.',
    prefix: true,
  },
  {
    title: 'Team Price (per head)',
    emoji: '👥',
    keys: ['price_team'],
    description: 'Per-head fee applied when a student is in a team of 2 or 3.',
    prefix: true,
  },
]

// ─── Setting row ──────────────────────────────────────────────────────────────

function SettingRow({ setting, prefix }: { setting: Setting; prefix: boolean }) {
  const [val, setVal]           = useState(setting.value)
  const [savedVal, setSavedVal] = useState(setting.value)
  const [saving, setSaving]     = useState(false)
  const [saved, setSaved]       = useState(false)
  const isDirty = val !== savedVal

  const handleSave = async () => {
    setSaving(true)
    try {
      await updateSettingAction(setting.key, val)
      setSavedVal(val)
      setSaved(true)
      setTimeout(() => setSaved(false), 2000)
    } catch {
      // revert on error
      setVal(savedVal)
    } finally {
      setSaving(false)
    }
  }

  return (
    <div
      className="flex items-center gap-3 py-3 border-b last:border-0"
      style={{ borderColor: 'var(--border-faint)' }}
    >
      <div className="flex-1 min-w-0">
        <p className="text-sm font-body" style={{ color: 'var(--text-2)' }}>
          {setting.label ?? setting.key}
        </p>
        <p className="font-mono text-[11px]" style={{ color: 'var(--text-4)' }}>
          {setting.key}
        </p>
      </div>

      <div className="flex items-center gap-2 shrink-0">
        {prefix && (
          <span className="font-mono text-sm" style={{ color: 'var(--text-3)' }}>₹</span>
        )}
        <input
          type="number"
          value={val}
          onChange={e => setVal(e.target.value)}
          onKeyDown={e => e.key === 'Enter' && isDirty && !saving && handleSave()}
          inputMode="numeric"
          className="w-20 rounded-lg px-3 font-mono text-base outline-none text-right"
          style={{
            minHeight: '40px',
            background: 'var(--bg-float)',
            border: `1px solid ${isDirty ? 'var(--border-brand)' : 'var(--border-subtle)'}`,
            color: 'var(--text-1)',
            fontSize: '16px',
          }}
        />
        {!prefix && (
          <span className="font-mono text-sm" style={{ color: 'var(--text-3)' }}>%</span>
        )}
        {isDirty && (
          <button
            onClick={handleSave}
            disabled={saving}
            className="px-3 rounded-lg font-heading font-semibold text-xs transition-all active:scale-95 disabled:opacity-50"
            style={{
              minHeight: '40px',
              background: saved ? 'rgba(34,197,94,0.15)' : 'var(--brand)',
              color:      saved ? 'var(--green)' : '#000',
            }}
          >
            {saving ? '...' : saved ? '✓ Saved' : 'Save'}
          </button>
        )}
      </div>
    </div>
  )
}

// ─── Main client component ────────────────────────────────────────────────────

interface Props {
  settings: Setting[]
}

export function SettingsClient({ settings }: Props) {
  const byKey = Object.fromEntries(settings.map(s => [s.key, s]))

  return (
    <div className="flex flex-col gap-5">
      {SECTIONS.map(section => {
        const rows = section.keys.map(k => byKey[k]).filter(Boolean)
        if (rows.length === 0) return null

        return (
          <div
            key={section.title}
            className="rounded-xl p-5"
            style={{ background: 'var(--bg-card)', border: '1px solid var(--border-faint)' }}
          >
            <div className="flex items-center gap-2 mb-1">
              <span>{section.emoji}</span>
              <h3
                className="font-heading font-semibold text-sm"
                style={{ color: 'var(--text-1)' }}
              >
                {section.title}
              </h3>
            </div>
            <p className="text-xs font-body mb-4" style={{ color: 'var(--text-3)' }}>
              {section.description}
            </p>
            <div>
              {rows.map(s => (
                <SettingRow key={s.key} setting={s} prefix={section.prefix} />
              ))}
            </div>
          </div>
        )
      })}
    </div>
  )
}
