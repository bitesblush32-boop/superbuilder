'use client'

import { useState, useTransition } from 'react'
import type { DatesConfig, ScheduleItem, WorkshopEntry, PhaseEntry } from '@/lib/db/queries/config'

// ── Helpers ──────────────────────────────────────────────────────────────────

function gcalLink(item: ScheduleItem) {
  const start = item.scheduledAt
    ? new Date(item.scheduledAt).toISOString().replace(/[-:]/g, '').split('.')[0] + 'Z'
    : ''
  const end = item.scheduledAt && item.durationMins
    ? new Date(new Date(item.scheduledAt).getTime() + item.durationMins * 60000)
      .toISOString().replace(/[-:]/g, '').split('.')[0] + 'Z'
    : start
  const params = new URLSearchParams({
    action: 'TEMPLATE',
    text: item.title,
    dates: `${start}/${end}`,
    details: `${item.description ?? ''}\n\nJoin: ${item.url ?? ''}`,
    location: item.url ?? '',
  })
  return `https://www.google.com/calendar/render?${params}`
}

const TYPE_COLORS: Record<string, string> = {
  video: 'var(--blue)',
  meeting: 'var(--green)',
  resource: 'var(--amber)',
}

const STAGE_OPTIONS = [
  { value: '1',         label: 'Stage 1 — Apply & Prepare (DB: 1-3)' },
  { value: '2',         label: 'Stage 1 — Quiz/Idea phase (DB: 2)' },
  { value: '3',         label: 'Stage 1 — Pre-payment (DB: 3)' },
  { value: '4',         label: 'Stage 2 — Workshops (DB: 4, paid)' },
  { value: '5',         label: 'Stage 3 — Hackathon (DB: 5)' },
  { value: 'dashboard', label: 'All paid students dashboard' },
  { value: 'all',       label: 'All stages' },
]

const SECTION_OPTIONS = [
  { value: 'general',     label: 'General' },
  { value: 'orientation', label: 'Intro / Orientation' },
  { value: 'workshop_1',  label: 'Workshop 1 (Jun 3)' },
  { value: 'workshop_2',  label: 'Workshop 2 (Jun 4)' },
  { value: 'workshop_3',  label: 'Workshop 3 (Jun 5)' },
  { value: 'hackathon',   label: 'Hackathon (Jun 7-8)' },
  { value: 'demo_day',    label: 'Demo Day (Jun 27)' },
]

// ── Sub-components ────────────────────────────────────────────────────────────

function TabBtn({ label, active, onClick }: { label: string; active: boolean; onClick: () => void }) {
  return (
    <button
      onClick={onClick}
      className="px-4 py-2.5 text-sm font-heading font-semibold tracking-wide transition-colors"
      style={{
        color: active ? 'var(--text-brand)' : 'var(--text-3)',
        borderBottom: active ? '2px solid var(--brand)' : '2px solid transparent',
      }}
    >
      {label}
    </button>
  )
}

function Input({
  label, value, onChange, type = 'text', placeholder,
}: {
  label: string; value: string | number; onChange: (v: string) => void
  type?: string; placeholder?: string
}) {
  return (
    <div className="flex flex-col gap-1">
      <label className="text-xs font-mono uppercase tracking-wider" style={{ color: 'var(--text-4)' }}>
        {label}
      </label>
      <input
        type={type}
        value={value}
        onChange={e => onChange(e.target.value)}
        placeholder={placeholder}
        className="rounded-lg px-3 py-2 text-sm outline-none focus:ring-1 w-full"
        style={{
          background: 'var(--bg-float)',
          border: '1px solid var(--border-subtle)',
          color: 'var(--text-1)',
        }}
      />
    </div>
  )
}

function SaveBtn({ saving, saved, onClick }: { saving: boolean; saved: boolean; onClick: () => void }) {
  return (
    <button
      onClick={onClick}
      disabled={saving}
      className="min-h-[40px] px-6 rounded-lg text-sm font-heading font-bold tracking-wide transition-all active:scale-95 disabled:opacity-50"
      style={{
        background: saved ? 'var(--green)' : 'var(--brand)',
        color: '#000',
      }}
    >
      {saving ? 'Saving…' : saved ? '✓ Saved' : 'Save Changes'}
    </button>
  )
}

// ── Timeline Tab ─────────────────────────────────────────────────────────────

function TimelineTab({ dates, onSave }: { dates: DatesConfig; onSave: (d: DatesConfig) => Promise<void> }) {
  const [d, setD] = useState<DatesConfig>(dates)
  const [saving, setSaving] = useState(false)
  const [saved, setSaved] = useState(false)

  function setField<K extends keyof DatesConfig>(k: K, v: DatesConfig[K]) {
    setD(prev => ({ ...prev, [k]: v }))
    setSaved(false)
  }

  function setWorkshop(idx: number, field: keyof WorkshopEntry, val: string | number) {
    const ws = [...d.workshops]
    ws[idx] = { ...ws[idx], [field]: val }
    setD(prev => ({ ...prev, workshops: ws }))
    setSaved(false)
  }

  function setPhase(idx: number, field: keyof PhaseEntry, val: string) {
    const ps = [...d.phases]
    ps[idx] = { ...ps[idx], [field]: val }
    setD(prev => ({ ...prev, phases: ps }))
    setSaved(false)
  }

  async function handleSave() {
    setSaving(true)
    await onSave(d)
    setSaving(false)
    setSaved(true)
    setTimeout(() => setSaved(false), 2500)
  }

  return (
    <div className="space-y-8">
      {/* Key dates */}
      <section className="rounded-xl border p-5 space-y-4"
        style={{ background: 'var(--bg-card)', borderColor: 'var(--border-faint)' }}>
        <h3 className="text-sm font-heading font-bold uppercase tracking-wider" style={{ color: 'var(--text-brand)' }}>
          Key Dates
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <Input label="Reg Deadline ISO" value={d.regDeadlineISO}
            onChange={v => setField('regDeadlineISO', v)} placeholder="2026-05-25T23:59:59+05:30" />
          <Input label="Reg Deadline Display (shown in text)" value={d.regDeadlineDisplay}
            onChange={v => setField('regDeadlineDisplay', v)} placeholder="May 25" />
          <Input label="Hackathon Start ISO" value={d.hackathonStartISO}
            onChange={v => setField('hackathonStartISO', v)} placeholder="2026-06-07T08:00:00+05:30" />
          <Input label="Hackathon End ISO" value={d.hackathonEndISO}
            onChange={v => setField('hackathonEndISO', v)} placeholder="2026-06-08T08:00:00+05:30" />
          <Input label="Results Display (shown in text)" value={d.resultsDisplay}
            onChange={v => setField('resultsDisplay', v)} placeholder="Jun 27" />
        </div>
      </section>

      {/* Workshops */}
      <section className="rounded-xl border p-5 space-y-4"
        style={{ background: 'var(--bg-card)', borderColor: 'var(--border-faint)' }}>
        <h3 className="text-sm font-heading font-bold uppercase tracking-wider" style={{ color: 'var(--text-brand)' }}>
          Workshops
        </h3>
        {d.workshops.map((ws, i) => (
          <div key={ws.id} className="rounded-lg p-4 space-y-3 border"
            style={{ background: 'var(--bg-float)', borderColor: 'var(--border-faint)' }}>
            <p className="text-xs font-mono" style={{ color: 'var(--text-4)' }}>Workshop {ws.id}</p>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              <Input label="Title" value={ws.title} onChange={v => setWorkshop(i, 'title', v)} />
              <Input label="Outcome" value={ws.outcome} onChange={v => setWorkshop(i, 'outcome', v)} />
              <Input label="Date Range (display)" value={ws.dateRange} onChange={v => setWorkshop(i, 'dateRange', v)} placeholder="May 26, 6PM IST · 90 mins" />
              <Input label="Duration (mins)" value={ws.duration} type="number" onChange={v => setWorkshop(i, 'duration', Number(v))} />
            </div>
          </div>
        ))}
      </section>

      {/* Phases */}
      <section className="rounded-xl border p-5 space-y-4"
        style={{ background: 'var(--bg-card)', borderColor: 'var(--border-faint)' }}>
        <h3 className="text-sm font-heading font-bold uppercase tracking-wider" style={{ color: 'var(--text-brand)' }}>
          Programme Phases (5-Stage Structure)
        </h3>
        {d.phases.map((ph, i) => (
          <div key={ph.num} className="grid grid-cols-1 md:grid-cols-3 gap-3 items-end">
            <p className="text-xs font-mono md:col-span-1" style={{ color: 'var(--text-4)' }}>
              Phase {ph.num}: {ph.name}
            </p>
            <Input label="Dates (display)" value={ph.dates} onChange={v => setPhase(i, 'dates', v)} placeholder="May 26–Jun 1" />
            <Input label="Milestone" value={ph.milestone} onChange={v => setPhase(i, 'milestone', v)} placeholder="Welcome + Discord" />
          </div>
        ))}
      </section>

      <div className="flex justify-end">
        <SaveBtn saving={saving} saved={saved} onClick={handleSave} />
      </div>
    </div>
  )
}

// ── Content Tab ───────────────────────────────────────────────────────────────

const BLANK_ITEM = {
  type: 'video', title: '', description: '', url: '',
  targetStage: '2', targetSection: 'orientation',
  scheduledAt: '', durationMins: '', isVisible: true,
}

// Helper: extract YouTube video ID from various URL formats
function getYouTubeId(url: string): string | null {
  try {
    if (url.includes('youtu.be/')) return url.split('youtu.be/')[1]?.split('?')[0] ?? null
    if (url.includes('youtube.com/watch')) return new URLSearchParams(url.split('?')[1]).get('v')
    if (url.includes('youtube.com/embed/')) return url.split('/embed/')[1]?.split('?')[0] ?? null
  } catch { /* ignore */ }
  return null
}

function ContentTab({ items: initItems }: { items: ScheduleItem[] }) {
  const [items, setItems]     = useState<ScheduleItem[]>(initItems)
  const [form, setForm]       = useState(BLANK_ITEM)
  const [adding, setAdding]   = useState(false)
  const [addedOk, setAddedOk] = useState(false)
  const [addError, setAddError] = useState<string | null>(null)
  const [, startT]            = useTransition()

  function setFormField(k: string, v: string | boolean | number) {
    setForm(p => ({ ...p, [k]: v }))
  }

  async function handleAdd() {
    if (!form.title.trim()) return
    setAdding(true)
    setAddError(null)
    try {
      const res = await fetch('/api/admin/schedule-items', {
        method: 'POST', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(form),
      })
      if (!res.ok) throw new Error(`Server error ${res.status}`)
      const item = await res.json()
      setItems(p => [item, ...p])
      setForm(BLANK_ITEM)
      setAddedOk(true)
      setTimeout(() => setAddedOk(false), 2500)
    } catch (e) {
      setAddError(e instanceof Error ? e.message : 'Failed to add item')
    } finally {
      setAdding(false)
    }
  }

  async function handleDelete(id: string) {
    if (!confirm('Delete this content item?')) return
    await fetch(`/api/admin/schedule-items/${id}`, { method: 'DELETE' })
    setItems(p => p.filter(i => i.id !== id))
  }

  async function handleToggle(item: ScheduleItem) {
    const updated = { ...item, isVisible: !item.isVisible }
    await fetch(`/api/admin/schedule-items/${item.id}`, {
      method: 'PUT', headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(updated),
    })
    startT(() => setItems(p => p.map(i => i.id === item.id ? { ...i, isVisible: !i.isVisible } : i)))
  }

  const inputStyle = {
    background: 'var(--bg-float)', border: '1px solid var(--border-subtle)',
    color: 'var(--text-1)', borderRadius: '8px', padding: '8px 12px',
    fontSize: '14px', width: '100%', outline: 'none', minHeight: '44px',
  }
  const selectStyle = { ...inputStyle }

  const stageLabel = (v: string) => STAGE_OPTIONS.find(o => o.value === v)?.label ?? v
  const sectionLabel = (v: string) => SECTION_OPTIONS.find(o => o.value === v)?.label ?? v

  return (
    <div className="space-y-6">
      {/* Existing items */}
      {items.length === 0 ? (
        <div
          className="rounded-xl py-10 text-center"
          style={{ background: 'var(--bg-card)', border: '1px solid var(--border-faint)' }}
        >
          <p className="text-2xl mb-2">🎬</p>
          <p className="text-sm" style={{ color: 'var(--text-4)' }}>No content items yet. Add one below.</p>
        </div>
      ) : (
        <div className="space-y-2">
          {items.map(item => {
            const ytId = item.type === 'video' && item.url ? getYouTubeId(item.url) : null
            return (
              <div
                key={item.id}
                className="rounded-xl border overflow-hidden"
                style={{ background: 'var(--bg-card)', borderColor: 'var(--border-faint)' }}
              >
                {/* YouTube thumbnail preview */}
                {ytId && (
                  <div className="relative w-full" style={{ paddingBottom: '30%', background: '#000' }}>
                    <img
                      src={`https://img.youtube.com/vi/${ytId}/mqdefault.jpg`}
                      alt={item.title}
                      className="absolute inset-0 w-full h-full object-cover opacity-70"
                    />
                    <div className="absolute inset-0 flex items-center justify-center">
                      <span className="text-2xl">▶</span>
                    </div>
                  </div>
                )}

                <div className="flex items-start gap-3 px-4 py-3">
                  {/* Type badge */}
                  <span
                    className="shrink-0 mt-0.5 text-xs font-mono px-2 py-0.5 rounded-full border"
                    style={{
                      color: TYPE_COLORS[item.type] ?? 'var(--text-3)',
                      borderColor: TYPE_COLORS[item.type] ?? 'var(--border-faint)',
                      background: 'transparent',
                    }}
                  >
                    {item.type}
                  </span>

                  {/* Info */}
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium leading-snug" style={{ color: 'var(--text-1)' }}>
                      {item.title}
                    </p>
                    <p className="text-xs mt-0.5" style={{ color: 'var(--text-4)' }}>
                      {[
                        item.targetStage && stageLabel(item.targetStage),
                        item.targetSection && sectionLabel(item.targetSection),
                        item.scheduledAt && new Date(item.scheduledAt).toLocaleString('en-IN', { timeZone: 'Asia/Kolkata' }) + ' IST',
                      ].filter(Boolean).join(' · ')}
                    </p>
                    {item.url && (
                      <a
                        href={item.url} target="_blank" rel="noopener noreferrer"
                        className="text-xs truncate block mt-0.5"
                        style={{ color: 'var(--blue)' }}
                      >
                        {item.url.length > 50 ? item.url.slice(0, 50) + '…' : item.url}
                      </a>
                    )}
                  </div>

                  {/* Actions — stacked on mobile */}
                  <div className="flex flex-col sm:flex-row items-end sm:items-center gap-1.5 shrink-0">
                    {item.type === 'meeting' && item.scheduledAt && (
                      <a
                        href={gcalLink(item)} target="_blank" rel="noopener noreferrer"
                        className="text-xs px-2 py-1 rounded border transition-colors min-h-[32px] flex items-center"
                        style={{ color: 'var(--green)', borderColor: 'rgba(34,197,94,0.3)', whiteSpace: 'nowrap' }}
                      >
                        📅 Cal
                      </a>
                    )}
                    <button
                      onClick={() => handleToggle(item)}
                      className="text-xs px-2 py-1 rounded border transition-colors min-h-[32px]"
                      style={{
                        color: item.isVisible ? 'var(--text-brand)' : 'var(--text-4)',
                        borderColor: item.isVisible ? 'var(--border-brand)' : 'var(--border-faint)',
                        whiteSpace: 'nowrap',
                      }}
                    >
                      {item.isVisible ? 'Visible' : 'Hidden'}
                    </button>
                    <button
                      onClick={() => handleDelete(item.id)}
                      className="text-xs px-2 py-1 rounded border transition-colors min-h-[32px]"
                      style={{ color: 'var(--red)', borderColor: 'rgba(248,113,113,0.25)' }}
                    >
                      Delete
                    </button>
                  </div>
                </div>
              </div>
            )
          })}
        </div>
      )}

      {/* ── Add form ── */}
      <div
        className="rounded-xl border p-4 sm:p-5 space-y-4"
        style={{ background: 'var(--bg-card)', borderColor: 'var(--border-brand)' }}
      >
        <h3 className="text-sm font-heading font-bold uppercase tracking-wider" style={{ color: 'var(--text-brand)' }}>
          + Add Content Item
        </h3>

        {/* Type + Title row */}
        <div className="flex flex-col sm:flex-row gap-3">
          <div className="flex flex-col gap-1 sm:w-40 shrink-0">
            <label className="text-xs font-mono uppercase tracking-wider" style={{ color: 'var(--text-4)' }}>Type</label>
            <select value={form.type} onChange={e => setFormField('type', e.target.value)} style={selectStyle}>
              <option value="video">🎬 YouTube Video</option>
              <option value="meeting">📹 Meeting (Meet/Zoom)</option>
              <option value="resource">🔗 Resource Link</option>
            </select>
          </div>
          <div className="flex flex-col gap-1 flex-1">
            <label className="text-xs font-mono uppercase tracking-wider" style={{ color: 'var(--text-4)' }}>Title *</label>
            <input
              value={form.title}
              onChange={e => setFormField('title', e.target.value)}
              placeholder="e.g. Workshop 1 — AI Fundamentals"
              style={inputStyle}
              inputMode="text"
              autoCapitalize="words"
            />
          </div>
        </div>

        {/* URL */}
        <div className="flex flex-col gap-1">
          <label className="text-xs font-mono uppercase tracking-wider" style={{ color: 'var(--text-4)' }}>
            URL {form.type === 'video' ? '(YouTube watch / share link)' : form.type === 'meeting' ? '(Meet / Zoom link)' : '(Resource URL)'}
          </label>
          <input
            value={form.url}
            onChange={e => setFormField('url', e.target.value)}
            placeholder={form.type === 'video' ? 'https://youtu.be/...' : 'https://...'}
            style={inputStyle}
            inputMode="url"
          />
        </div>

        {/* Target Stage + Section */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <div className="flex flex-col gap-1">
            <label className="text-xs font-mono uppercase tracking-wider" style={{ color: 'var(--text-4)' }}>Target Stage</label>
            <select value={form.targetStage} onChange={e => setFormField('targetStage', e.target.value)} style={selectStyle}>
              {STAGE_OPTIONS.map(o => <option key={o.value} value={o.value}>{o.label}</option>)}
            </select>
          </div>
          <div className="flex flex-col gap-1">
            <label className="text-xs font-mono uppercase tracking-wider" style={{ color: 'var(--text-4)' }}>Section</label>
            <select value={form.targetSection} onChange={e => setFormField('targetSection', e.target.value)} style={selectStyle}>
              {SECTION_OPTIONS.map(o => <option key={o.value} value={o.value}>{o.label}</option>)}
            </select>
          </div>
        </div>

        {/* Duration + Scheduled At */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <div className="flex flex-col gap-1">
            <label className="text-xs font-mono uppercase tracking-wider" style={{ color: 'var(--text-4)' }}>Duration (mins)</label>
            <input
              type="number"
              value={form.durationMins}
              onChange={e => setFormField('durationMins', e.target.value)}
              placeholder="90"
              style={inputStyle}
              inputMode="numeric"
            />
          </div>
          {form.type === 'meeting' && (
            <div className="flex flex-col gap-1">
              <label className="text-xs font-mono uppercase tracking-wider" style={{ color: 'var(--text-4)' }}>Scheduled At</label>
              <input
                type="datetime-local"
                value={form.scheduledAt as string}
                onChange={e => setFormField('scheduledAt', e.target.value)}
                style={inputStyle}
              />
            </div>
          )}
        </div>

        {/* Description */}
        <div className="flex flex-col gap-1">
          <label className="text-xs font-mono uppercase tracking-wider" style={{ color: 'var(--text-4)' }}>Description (optional)</label>
          <input
            value={form.description}
            onChange={e => setFormField('description', e.target.value)}
            placeholder="What students will learn or gain from this…"
            style={inputStyle}
            inputMode="text"
            autoCapitalize="sentences"
          />
        </div>

        {/* Error */}
        {addError && (
          <p className="text-xs px-3 py-2 rounded-lg" style={{ background: 'var(--red-bg)', color: 'var(--red)', border: '1px solid rgba(248,113,113,0.25)' }}>
            ✕ {addError}
          </p>
        )}

        {/* Actions */}
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
          <label className="flex items-center gap-2 cursor-pointer min-h-[44px]">
            <input
              type="checkbox"
              checked={form.isVisible as boolean}
              onChange={e => setFormField('isVisible', e.target.checked)}
              className="accent-yellow-400 w-4 h-4"
            />
            <span className="text-sm" style={{ color: 'var(--text-2)' }}>Visible to students immediately</span>
          </label>
          <button
            onClick={handleAdd}
            disabled={adding || !form.title.trim()}
            className="min-h-[44px] px-6 rounded-xl text-sm font-heading font-bold tracking-wide active:scale-95 disabled:opacity-50 transition-all"
            style={{ background: addedOk ? 'var(--green)' : 'var(--brand)', color: '#000' }}
          >
            {adding ? 'Adding…' : addedOk ? '✓ Added!' : '+ Add Item'}
          </button>
        </div>
      </div>
    </div>
  )
}

// ── Main ─────────────────────────────────────────────────────────────────────

export function ScheduleEditor({
  initialDates,
  initialItems,
}: {
  initialDates: DatesConfig
  initialItems: ScheduleItem[]
}) {
  const [tab, setTab] = useState<'timeline' | 'content'>('timeline')

  async function saveDates(data: DatesConfig) {
    await fetch('/api/admin/config', {
      method: 'PUT', headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ section: 'dates', data }),
    })
  }

  return (
    <div>
      {/* Tabs */}
      <div className="flex border-b mb-6" style={{ borderColor: 'var(--border-faint)' }}>
        <TabBtn label="📅 Timeline" active={tab === 'timeline'} onClick={() => setTab('timeline')} />
        <TabBtn label="🎬 Content" active={tab === 'content'} onClick={() => setTab('content')} />
      </div>

      {tab === 'timeline' && <TimelineTab dates={initialDates} onSave={saveDates} />}
      {tab === 'content' && <ContentTab items={initialItems} />}
    </div>
  )
}
