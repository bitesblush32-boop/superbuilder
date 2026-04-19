'use client'

import { useState } from 'react'
import { updateSettingAction } from '@/lib/actions/admin'
import type { appSettings } from '@/lib/db/schema'
import type { PricingConfig } from '@/lib/db/queries/config'

type Setting = typeof appSettings.$inferSelect

const SECTIONS = [
  {
    title: 'Team Discounts',
    emoji: '🤝',
    keys: ['team_discount_3', 'team_discount_4'],
    description: 'Applied automatically when team size threshold is met at payment.',
    prefix: false,
  },
  {
    title: 'Pro Tier Pricing',
    emoji: '⚡',
    keys: ['pro_price_min', 'pro_price_max'],
    description: 'Price range shown to students. Payment uses priceMin.',
    prefix: true,
  },
  {
    title: 'Premium Tier Pricing',
    emoji: '⭐',
    keys: ['premium_price_min', 'premium_price_max', 'premium_emi_first'],
    description: 'Full price and EMI first instalment for Premium tier.',
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
          className="w-20 rounded-lg px-3 font-mono text-sm outline-none text-right"
          style={{
            minHeight: '40px',
            background: 'var(--bg-float)',
            border: `1px solid ${isDirty ? 'var(--border-brand)' : 'var(--border-subtle)'}`,
            color: 'var(--text-1)',
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

// ─── Pricing features (programme_config) ─────────────────────────────────────

function FeatureList({ features, onChange }: { features: string[]; onChange: (list: string[]) => void }) {
  return (
    <div className="space-y-2">
      {features.map((f, i) => (
        <div key={i} className="flex items-center gap-2">
          <input
            value={f}
            onChange={e => { const n = [...features]; n[i] = e.target.value; onChange(n) }}
            className="flex-1 rounded-lg px-3 py-1.5 text-sm outline-none"
            style={{ background: 'var(--bg-float)', border: '1px solid var(--border-subtle)', color: 'var(--text-1)' }}
          />
          <button
            onClick={() => onChange(features.filter((_, j) => j !== i))}
            className="text-xs px-2 py-1 rounded border shrink-0"
            style={{ color: 'var(--red)', borderColor: 'rgba(248,113,113,0.25)' }}
          >✕</button>
        </div>
      ))}
      <button
        onClick={() => onChange([...features, ''])}
        className="text-xs px-3 py-1.5 rounded-lg border w-full"
        style={{ color: 'var(--text-brand)', borderColor: 'var(--border-brand)', background: 'var(--brand-subtle)' }}
      >
        + Add Feature
      </button>
    </div>
  )
}

export function PricingFeatures({ pricing: init }: { pricing: PricingConfig }) {
  const [p, setP]           = useState<PricingConfig>(init)
  const [saving, setSaving] = useState(false)
  const [saved,  setSaved]  = useState(false)

  function setPro<K extends keyof PricingConfig['pro']>(k: K, v: PricingConfig['pro'][K]) {
    setP(prev => ({ ...prev, pro: { ...prev.pro, [k]: v } }))
    setSaved(false)
  }
  function setPremium<K extends keyof PricingConfig['premium']>(k: K, v: PricingConfig['premium'][K]) {
    setP(prev => ({ ...prev, premium: { ...prev.premium, [k]: v } }))
    setSaved(false)
  }

  async function handleSave() {
    setSaving(true)
    await fetch('/api/admin/config', {
      method: 'PUT', headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ section: 'pricing', data: p }),
    })
    setSaving(false)
    setSaved(true)
    setTimeout(() => setSaved(false), 2500)
  }

  return (
    <div className="space-y-5">
      <div className="rounded-lg px-4 py-3 border text-sm"
        style={{ background: 'var(--amber-bg)', borderColor: 'rgba(251,191,36,0.3)', color: 'var(--amber)' }}>
        ⚠️ Feature list changes update the landing page tier comparison. Price numbers above are used for payment amounts.
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
        {/* Pro features */}
        <div className="rounded-xl border p-5 space-y-4"
          style={{ background: 'var(--bg-card)', borderColor: 'var(--border-faint)' }}>
          <h3 className="text-sm font-heading font-bold uppercase tracking-wider" style={{ color: 'var(--blue)' }}>
            Pro — Feature Lists
          </h3>
          <div>
            <p className="text-xs font-mono uppercase tracking-wider mb-2" style={{ color: 'var(--text-4)' }}>Included</p>
            <FeatureList features={p.pro.features} onChange={v => setPro('features', v)} />
          </div>
          <div>
            <p className="text-xs font-mono uppercase tracking-wider mb-2" style={{ color: 'var(--text-4)' }}>Not Included</p>
            <FeatureList features={p.pro.missing} onChange={v => setPro('missing', v)} />
          </div>
        </div>

        {/* Premium features */}
        <div className="rounded-xl border p-5 space-y-4"
          style={{ background: 'var(--bg-card)', borderColor: 'var(--border-brand)' }}>
          <h3 className="text-sm font-heading font-bold uppercase tracking-wider" style={{ color: 'var(--text-brand)' }}>
            Premium ⭐ — Feature Lists
          </h3>
          <div>
            <p className="text-xs font-mono uppercase tracking-wider mb-2" style={{ color: 'var(--text-4)' }}>Included</p>
            <FeatureList features={p.premium.features} onChange={v => setPremium('features', v)} />
          </div>
        </div>
      </div>

      <div className="flex justify-end">
        <button
          onClick={handleSave}
          disabled={saving}
          className="min-h-[40px] px-6 rounded-lg text-sm font-heading font-bold tracking-wide transition-all active:scale-95 disabled:opacity-50"
          style={{ background: saved ? 'var(--green)' : 'var(--brand)', color: '#000' }}
        >
          {saving ? 'Saving…' : saved ? '✓ Saved' : 'Save Feature Lists'}
        </button>
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
