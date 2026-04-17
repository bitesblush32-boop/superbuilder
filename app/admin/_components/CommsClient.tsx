'use client'

import { useState } from 'react'
import type { DropoffCounts, CommsLogEntry } from '@/lib/db/queries/admin'

// ─── Types ────────────────────────────────────────────────────────────────────
interface TriggerResult { sent: number; failed: number; total: number; message?: string }

// ─── Confirm Dialog ───────────────────────────────────────────────────────────
function ConfirmDialog({
  title,
  count,
  channel,
  onConfirm,
  onCancel,
  children,
}: {
  title:     string
  count:     number
  channel:   string
  onConfirm: () => void
  onCancel:  () => void
  children?: React.ReactNode
}) {
  return (
    <div className="fixed inset-0 z-50 flex items-end md:items-center justify-center p-4"
      style={{ background: 'rgba(0,0,0,0.8)' }}>
      <div
        className="w-full max-w-sm rounded-2xl p-5 space-y-4"
        style={{ background: 'var(--bg-float)', border: '1px solid var(--border-subtle)' }}
      >
        <h3 className="font-semibold" style={{ color: 'var(--text-1)' }}>{title}</h3>
        <p className="text-sm" style={{ color: 'var(--text-3)' }}>
          This will send to <strong style={{ color: 'var(--text-brand)' }}>{count} students</strong> via{' '}
          <strong style={{ color: 'var(--text-1)' }}>{channel}</strong>.
          This action cannot be undone.
        </p>
        {children}
        <div className="flex gap-2 pt-1">
          <button
            onClick={onCancel}
            className="flex-1 min-h-[44px] rounded-xl text-sm border"
            style={{ borderColor: 'var(--border-subtle)', color: 'var(--text-3)' }}
          >
            Cancel
          </button>
          <button
            onClick={onConfirm}
            className="flex-1 min-h-[44px] rounded-xl text-sm font-semibold"
            style={{ background: 'var(--brand)', color: 'var(--bg-void)' }}
          >
            Send Now
          </button>
        </div>
      </div>
    </div>
  )
}

// ─── Result toast ─────────────────────────────────────────────────────────────
function ResultBanner({ result, onClose }: { result: TriggerResult; onClose: () => void }) {
  return (
    <div
      className="fixed bottom-4 right-4 z-50 rounded-xl px-4 py-3 flex items-center gap-3 shadow-lg"
      style={{ background: 'var(--bg-float)', border: '1px solid var(--border-subtle)' }}
    >
      <span style={{ color: result.failed > 0 ? 'var(--amber)' : 'var(--green)' }}>
        {result.failed > 0 ? '⚠️' : '✓'}
      </span>
      <span className="text-sm" style={{ color: 'var(--text-1)' }}>
        Sent {result.sent} · Failed {result.failed}
        {result.message ? ` · ${result.message}` : ''}
      </span>
      <button onClick={onClose} className="text-xs" style={{ color: 'var(--text-4)' }}>✕</button>
    </div>
  )
}

// ─── Simple trigger card ──────────────────────────────────────────────────────
function TriggerCard({
  title,
  description,
  count,
  triggerType,
  onSent,
}: {
  title:       string
  description: string
  count:       number
  triggerType: string
  onSent:      (r: TriggerResult) => void
}) {
  const [confirming, setConfirming] = useState(false)
  const [channel, setChannel]       = useState<'both' | 'email' | 'whatsapp'>('both')
  const [loading, setLoading]       = useState(false)

  async function send() {
    setLoading(true)
    setConfirming(false)
    try {
      const res = await fetch('/api/admin/comms/trigger', {
        method:  'POST',
        headers: { 'Content-Type': 'application/json' },
        body:    JSON.stringify({ triggerType, channel }),
      })
      const data: TriggerResult = await res.json()
      onSent(data)
    } catch {
      onSent({ sent: 0, failed: 1, total: 0, message: 'Network error' })
    } finally {
      setLoading(false)
    }
  }

  return (
    <>
      <div
        className="rounded-xl p-4 border space-y-3"
        style={{ background: 'var(--bg-card)', borderColor: 'var(--border-faint)' }}
      >
        <div>
          <h3 className="font-semibold" style={{ color: 'var(--text-1)' }}>{title}</h3>
          <p className="text-xs mt-0.5" style={{ color: 'var(--text-3)' }}>{description}</p>
        </div>
        <div className="flex items-center justify-between">
          <span className="font-display text-2xl" style={{ color: 'var(--text-brand)' }}>
            {count.toLocaleString('en-IN')}
            <span className="text-xs ml-1 font-body" style={{ color: 'var(--text-4)' }}>eligible</span>
          </span>
          <div className="flex items-center gap-2">
            <select
              value={channel}
              onChange={e => setChannel(e.target.value as typeof channel)}
              className="text-xs px-2 py-1 rounded border"
              style={{ background: 'var(--bg-float)', borderColor: 'var(--border-subtle)', color: 'var(--text-2)' }}
            >
              <option value="both">Email + WA</option>
              <option value="email">Email only</option>
              <option value="whatsapp">WA only</option>
            </select>
            <button
              onClick={() => setConfirming(true)}
              disabled={count === 0 || loading}
              className="text-xs px-4 min-h-[36px] rounded-lg font-medium transition-opacity disabled:opacity-30"
              style={{ background: 'var(--brand)', color: 'var(--bg-void)' }}
            >
              {loading ? 'Sending…' : 'Send'}
            </button>
          </div>
        </div>
      </div>
      {confirming && (
        <ConfirmDialog
          title={`Send: ${title}`}
          count={count}
          channel={channel === 'both' ? 'Email + WhatsApp' : channel}
          onConfirm={send}
          onCancel={() => setConfirming(false)}
        />
      )}
    </>
  )
}

// ─── Shortlisted Not Paid card ────────────────────────────────────────────────
function ShortlistedCard({
  counts,
  onSent,
}: {
  counts: DropoffCounts['notPaid']
  onSent: (r: TriggerResult) => void
}) {
  const [confirming, setConfirming] = useState<string | null>(null)
  const [channel, setChannel]       = useState<'both' | 'email' | 'whatsapp'>('both')
  const [loading, setLoading]       = useState<string | null>(null)

  const days = [
    { key: 'not_paid_d1',    label: 'D+1', count: counts.d1,    desc: 'Email student + parent separately' },
    { key: 'not_paid_d2',    label: 'D+2', count: counts.d2,    desc: 'WA scarcity — X spots left in city' },
    { key: 'not_paid_d3',    label: 'D+3', count: counts.d3,    desc: 'Social proof email' },
    { key: 'not_paid_d4',    label: 'D+4', count: counts.d4,    desc: 'Flag for manual sales call' },
    { key: 'not_paid_d5',    label: 'D+5', count: counts.d5,    desc: 'Urgency — spot expires 48h' },
    { key: 'not_paid_final', label: 'Final', count: counts.final, desc: 'Last chance — May 25' },
  ]

  async function send(triggerType: string) {
    setLoading(triggerType)
    setConfirming(null)
    try {
      const res = await fetch('/api/admin/comms/trigger', {
        method:  'POST',
        headers: { 'Content-Type': 'application/json' },
        body:    JSON.stringify({ triggerType, channel }),
      })
      const data: TriggerResult = await res.json()
      onSent(data)
    } catch {
      onSent({ sent: 0, failed: 1, total: 0, message: 'Network error' })
    } finally {
      setLoading(null)
    }
  }

  return (
    <>
      <div
        className="rounded-xl p-4 border space-y-3"
        style={{ background: 'var(--bg-card)', borderColor: 'var(--border-faint)' }}
      >
        <div className="flex items-start justify-between">
          <div>
            <h3 className="font-semibold" style={{ color: 'var(--text-1)' }}>Shortlisted, Not Paid</h3>
            <p className="text-xs mt-0.5" style={{ color: 'var(--text-3)' }}>
              {counts.total.toLocaleString('en-IN')} total eligible · D+1 through Final
            </p>
          </div>
          <select
            value={channel}
            onChange={e => setChannel(e.target.value as typeof channel)}
            className="text-xs px-2 py-1 rounded border"
            style={{ background: 'var(--bg-float)', borderColor: 'var(--border-subtle)', color: 'var(--text-2)' }}
          >
            <option value="both">Email + WA</option>
            <option value="email">Email only</option>
            <option value="whatsapp">WA only</option>
          </select>
        </div>

        <div className="space-y-2">
          {days.map(d => (
            <div key={d.key}
              className="flex items-center justify-between rounded-lg px-3 py-2"
              style={{ background: 'var(--bg-float)' }}
            >
              <div className="flex items-center gap-3">
                <span className="font-display text-sm" style={{ color: 'var(--text-brand)' }}>{d.label}</span>
                <span className="text-xs" style={{ color: 'var(--text-4)' }}>{d.desc}</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-sm font-mono" style={{ color: 'var(--text-2)' }}>
                  {d.count}
                </span>
                <button
                  onClick={() => setConfirming(d.key)}
                  disabled={d.count === 0 || !!loading}
                  className="text-xs px-3 min-h-[32px] rounded-lg font-medium disabled:opacity-30"
                  style={{ background: 'var(--brand)', color: 'var(--bg-void)' }}
                >
                  {loading === d.key ? '…' : 'Send'}
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>

      {confirming && (() => {
        const day = days.find(d => d.key === confirming)!
        return (
          <ConfirmDialog
            title={`Send ${day.label}: ${day.desc}`}
            count={day.count}
            channel={channel === 'both' ? 'Email + WhatsApp' : channel}
            onConfirm={() => send(confirming)}
            onCancel={() => setConfirming(null)}
          />
        )
      })()}
    </>
  )
}

// ─── Bulk Announcement card ───────────────────────────────────────────────────
function BulkCard({ onSent }: { onSent: (r: TriggerResult) => void }) {
  const [segment,     setSegment]     = useState('all')
  const [message,     setMessage]     = useState('')
  const [channel,     setChannel]     = useState<'both' | 'email' | 'whatsapp'>('email')
  const [previewing,  setPreviewing]  = useState(false)
  const [confirming,  setConfirming]  = useState(false)
  const [loading,     setLoading]     = useState(false)

  // Rough count estimate — for now just show "will send to segment" text
  const segmentLabel: Record<string, string> = {
    all:     'All students',
    paid:    'Paid students',
    free:    'Free / unpaid students',
    premium: 'Premium tier',
    pro:     'Pro tier',
    stage_1: 'Stage 1 students',
    stage_2: 'Stage 2 students',
    stage_3: 'Stage 3 students',
    stage_4: 'Paid / Stage 4',
    stage_5: 'Submitted / Stage 5',
  }

  async function send() {
    setLoading(true)
    setConfirming(false)
    try {
      const res = await fetch('/api/admin/comms/trigger', {
        method:  'POST',
        headers: { 'Content-Type': 'application/json' },
        body:    JSON.stringify({ triggerType: 'bulk', segment, message, channel }),
      })
      const data: TriggerResult = await res.json()
      onSent(data)
      setMessage('')
    } catch {
      onSent({ sent: 0, failed: 1, total: 0, message: 'Network error' })
    } finally {
      setLoading(false)
    }
  }

  const inputStyle = {
    background:  'var(--bg-float)',
    borderColor: 'var(--border-subtle)',
    color:       'var(--text-1)',
  }

  return (
    <>
      <div
        className="rounded-xl p-4 border space-y-3"
        style={{ background: 'var(--bg-card)', borderColor: 'var(--border-faint)' }}
      >
        <h3 className="font-semibold" style={{ color: 'var(--text-1)' }}>Bulk Announcement</h3>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
          <select value={segment} onChange={e => setSegment(e.target.value)}
            className="min-h-[40px] px-3 text-sm rounded-lg border"
            style={inputStyle}
          >
            {Object.entries(segmentLabel).map(([v, l]) => (
              <option key={v} value={v}>{l}</option>
            ))}
          </select>

          <select value={channel} onChange={e => setChannel(e.target.value as typeof channel)}
            className="min-h-[40px] px-3 text-sm rounded-lg border"
            style={inputStyle}
          >
            <option value="email">Email only</option>
            <option value="whatsapp">WhatsApp only</option>
            <option value="both">Email + WhatsApp</option>
          </select>

          <div className="flex gap-2">
            <button
              onClick={() => setPreviewing(p => !p)}
              className="flex-1 min-h-[40px] text-sm rounded-lg border"
              style={{ borderColor: 'var(--border-subtle)', color: 'var(--text-2)' }}
            >
              {previewing ? 'Hide Preview' : 'Preview'}
            </button>
            <button
              onClick={() => setConfirming(true)}
              disabled={!message.trim() || loading}
              className="flex-1 min-h-[40px] text-sm rounded-lg font-medium disabled:opacity-30"
              style={{ background: 'var(--brand)', color: 'var(--bg-void)' }}
            >
              {loading ? 'Sending…' : `Send to ${segmentLabel[segment]}`}
            </button>
          </div>
        </div>

        <textarea
          value={message}
          onChange={e => setMessage(e.target.value)}
          rows={4}
          placeholder="Compose your message here…"
          className="w-full px-3 py-2.5 text-sm rounded-lg border resize-none outline-none"
          style={inputStyle}
        />

        {previewing && message && (
          <div
            className="rounded-xl p-4 text-sm"
            style={{ background: 'var(--bg-inset)', border: '1px solid var(--border-faint)' }}
          >
            <p className="text-xs uppercase tracking-wider mb-2" style={{ color: 'var(--text-4)' }}>
              Preview ({channel})
            </p>
            <p style={{ color: 'var(--text-2)', lineHeight: 1.7 }}>
              Hey [Student First Name]! {message}
            </p>
          </div>
        )}
      </div>

      {confirming && (
        <ConfirmDialog
          title="Send Bulk Announcement"
          count={0}
          channel={channel === 'both' ? 'Email + WhatsApp' : channel}
          onConfirm={send}
          onCancel={() => setConfirming(false)}
        >
          <p className="text-xs" style={{ color: 'var(--text-4)' }}>
            Segment: <strong style={{ color: 'var(--text-2)' }}>{segmentLabel[segment]}</strong>
          </p>
        </ConfirmDialog>
      )}
    </>
  )
}

// ─── Comms Log table ──────────────────────────────────────────────────────────
function CommsLogTable({ log }: { log: CommsLogEntry[] }) {
  function timeAgo(d: Date): string {
    const s = Math.floor((Date.now() - new Date(d).getTime()) / 1000)
    if (s < 60)   return `${s}s ago`
    if (s < 3600) return `${Math.floor(s / 60)}m ago`
    if (s < 86400) return `${Math.floor(s / 3600)}h ago`
    return `${Math.floor(s / 86400)}d ago`
  }

  return (
    <div className="rounded-xl border overflow-hidden" style={{ borderColor: 'var(--border-faint)' }}>
      <div
        className="px-4 py-3 border-b flex items-center justify-between"
        style={{ background: 'var(--bg-raised)', borderColor: 'var(--border-faint)' }}
      >
        <h3 className="text-sm font-semibold uppercase tracking-wider" style={{ color: 'var(--text-3)' }}>
          Automation Log
        </h3>
        <span className="text-xs font-mono" style={{ color: 'var(--text-4)' }}>
          last {log.length} entries
        </span>
      </div>

      {log.length === 0 ? (
        <p className="py-12 text-center text-sm" style={{ color: 'var(--text-4)' }}>
          No automations sent yet.
        </p>
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full text-xs border-collapse">
            <thead>
              <tr style={{ background: 'var(--bg-raised)' }}>
                {['Time', 'Student', 'Template', 'Channel', 'Recipient', 'Status'].map(h => (
                  <th
                    key={h}
                    className="px-4 py-2.5 text-left uppercase tracking-wider font-medium whitespace-nowrap"
                    style={{ color: 'var(--text-4)', borderBottom: '1px solid var(--border-faint)' }}
                  >
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {log.map(entry => (
                <tr
                  key={entry.id}
                  style={{ borderBottom: '1px solid var(--border-faint)' }}
                >
                  <td className="px-4 py-2.5 font-mono whitespace-nowrap" style={{ color: 'var(--text-4)' }}>
                    {timeAgo(entry.createdAt)}
                  </td>
                  <td className="px-4 py-2.5" style={{ color: 'var(--text-2)' }}>
                    {entry.studentName ?? '—'}
                  </td>
                  <td className="px-4 py-2.5 font-mono" style={{ color: 'var(--text-3)' }}>
                    {entry.template}
                  </td>
                  <td className="px-4 py-2.5">
                    <span
                      className="px-2 py-0.5 rounded-full capitalize"
                      style={{
                        background: entry.channel === 'email' ? 'rgba(96,165,250,0.1)' : 'rgba(34,197,94,0.1)',
                        color:      entry.channel === 'email' ? 'var(--blue)' : 'var(--green)',
                      }}
                    >
                      {entry.channel}
                    </span>
                  </td>
                  <td className="px-4 py-2.5 font-mono max-w-[160px] truncate" style={{ color: 'var(--text-4)' }}>
                    {entry.recipient}
                  </td>
                  <td className="px-4 py-2.5">
                    <span
                      className="px-2 py-0.5 rounded-full capitalize"
                      style={{
                        background: entry.status === 'sent' ? 'rgba(34,197,94,0.1)' : 'rgba(248,113,113,0.1)',
                        color:      entry.status === 'sent' ? 'var(--green)' : 'var(--red)',
                      }}
                    >
                      {entry.status}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  )
}

// ─── Main export ──────────────────────────────────────────────────────────────
export function CommsClient({
  counts,
  log: initialLog,
}: {
  counts: DropoffCounts
  log:    CommsLogEntry[]
}) {
  const [log, setLog]         = useState(initialLog)
  const [result, setResult]   = useState<TriggerResult | null>(null)

  function handleSent(r: TriggerResult) {
    setResult(r)
    setTimeout(() => setResult(null), 5000)
    // Re-fetch log would require a router.refresh() — use Suspense revalidation
    // For now, the user can refresh the page
  }

  return (
    <div className="space-y-8">
      {/* Section 1 — Send Now */}
      <section className="space-y-4">
        <h2 className="font-display text-xl tracking-wide" style={{ color: 'var(--text-2)' }}>
          SEND NOW
        </h2>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          <TriggerCard
            title="Stage 1 Incomplete (>48h)"
            description="Applied but never submitted their application"
            count={counts.stage1Incomplete}
            triggerType="stage1_incomplete"
            onSent={handleSent}
          />
          <TriggerCard
            title="Quiz Not Started (>24h)"
            description="Shortlisted but quiz not yet attempted after 24h"
            count={counts.quizNotStarted}
            triggerType="quiz_not_started"
            onSent={handleSent}
          />
        </div>

        <ShortlistedCard counts={counts.notPaid} onSent={handleSent} />
        <BulkCard onSent={handleSent} />
      </section>

      {/* Section 2 — Log */}
      <section>
        <CommsLogTable log={log} />
      </section>

      {/* Result toast */}
      {result && <ResultBanner result={result} onClose={() => setResult(null)} />}
    </div>
  )
}
