'use client'

import { useState } from 'react'
import type { ReferralRecord, TopReferrer } from '@/lib/db/queries/admin'

const VOUCHER_AMOUNTS = [200, 500, 1000, 2000, 5000] as const

function Badge({
  label, color = '#FFB800',
}: { label: string; color?: string }) {
  return (
    <span
      className="inline-flex items-center px-2 py-0.5 rounded-full font-mono text-[10px] font-semibold"
      style={{ background: `${color}18`, color, border: `1px solid ${color}40` }}
    >
      {label}
    </span>
  )
}

function RankBadge({ rank }: { rank: number }) {
  const color = rank === 1 ? '#FFD700' : rank === 2 ? '#C0C0C0' : rank === 3 ? '#CD7F32' : 'var(--text-4)'
  const emoji = rank === 1 ? '🥇' : rank === 2 ? '🥈' : rank === 3 ? '🥉' : `#${rank}`
  return (
    <span className="font-mono font-bold text-sm w-8 text-center shrink-0" style={{ color }}>
      {emoji}
    </span>
  )
}

// ─── Send Reward Modal ────────────────────────────────────────────────────────

function SendRewardModal({
  referrer,
  onClose,
  onSent,
}: {
  referrer: TopReferrer
  onClose: () => void
  onSent: (referrerId: string) => void
}) {
  const [amount, setAmount]         = useState<number>(200)
  const [link, setLink]             = useState('')
  const [sending, setSending]       = useState(false)
  const [error, setError]           = useState<string | null>(null)
  const [success, setSuccess]       = useState(false)

  const handleSend = async () => {
    if (!link.startsWith('http')) { setError('Enter a valid voucher URL'); return }
    setSending(true); setError(null)

    const res = await fetch('/api/admin/referrals/send-reward', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        referrerId:    referrer.referrerId,
        voucherAmount: amount,
        voucherLink:   link,
      }),
    })

    setSending(false)
    if (!res.ok) {
      const data = await res.json().catch(() => ({}))
      setError((data as { error?: string }).error ?? 'Failed to send reward')
      return
    }
    setSuccess(true)
    setTimeout(() => { onSent(referrer.referrerId); onClose() }, 1400)
  }

  return (
    <div
      className="fixed inset-0 z-50 flex items-end md:items-center justify-center p-4"
      style={{ background: 'rgba(0,0,0,0.75)', backdropFilter: 'blur(4px)' }}
      onClick={e => { if (e.target === e.currentTarget) onClose() }}
    >
      <div
        className="w-full max-w-md rounded-2xl p-6 flex flex-col gap-5"
        style={{ background: 'var(--bg-card)', border: '1px solid var(--border-subtle)' }}
      >
        <div className="flex items-center justify-between">
          <h2 className="font-heading font-bold text-lg" style={{ color: 'var(--text-1)' }}>
            Send Reward 🎁
          </h2>
          <button
            onClick={onClose}
            className="w-8 h-8 flex items-center justify-center rounded-full transition-colors active:scale-95"
            style={{ background: 'var(--bg-float)', color: 'var(--text-3)' }}
          >
            ✕
          </button>
        </div>

        <div className="rounded-xl p-3 flex items-center gap-3" style={{ background: 'var(--bg-float)', border: '1px solid var(--border-faint)' }}>
          <div
            className="w-9 h-9 rounded-full flex items-center justify-center font-heading font-bold text-sm shrink-0"
            style={{ background: 'rgba(255,184,0,0.12)', color: 'var(--brand)' }}
          >
            {referrer.referrerName.charAt(0)}
          </div>
          <div>
            <p className="text-sm font-semibold" style={{ color: 'var(--text-1)' }}>{referrer.referrerName}</p>
            <p className="text-xs font-mono" style={{ color: 'var(--text-3)' }}>{referrer.referrerEmail}</p>
          </div>
          <Badge label={`${referrer.successfulReferrals} referrals`} color="#22C55E" />
        </div>

        <div>
          <p className="text-xs font-mono uppercase tracking-[0.1em] mb-2" style={{ color: 'var(--text-3)' }}>
            Voucher Amount
          </p>
          <div className="flex flex-wrap gap-2">
            {VOUCHER_AMOUNTS.map(v => (
              <button
                key={v}
                type="button"
                onClick={() => setAmount(v)}
                className="rounded-full text-sm font-mono font-semibold px-4 transition-all active:scale-95"
                style={{
                  minHeight: '36px',
                  background: amount === v ? 'rgba(255,184,0,0.12)' : 'var(--bg-float)',
                  border: `1.5px solid ${amount === v ? 'var(--brand)' : 'var(--border-subtle)'}`,
                  color: amount === v ? 'var(--brand)' : 'var(--text-3)',
                }}
              >
                ₹{v.toLocaleString('en-IN')}
              </button>
            ))}
          </div>
        </div>

        <div>
          <p className="text-xs font-mono uppercase tracking-[0.1em] mb-2" style={{ color: 'var(--text-3)' }}>
            Amazon Voucher Link
          </p>
          <input
            type="url"
            value={link}
            onChange={e => setLink(e.target.value)}
            placeholder="https://amazon.in/gc/..."
            className="w-full rounded-xl px-4 font-mono text-sm outline-none"
            style={{
              minHeight: '48px',
              background: 'var(--bg-inset)',
              border: `1px solid ${error ? 'rgba(248,113,113,0.45)' : 'var(--border-subtle)'}`,
              color: 'var(--text-1)',
              fontSize: '14px',
            }}
          />
          {error && (
            <p className="text-xs mt-1.5 font-body" style={{ color: 'var(--red)' }}>⚠ {error}</p>
          )}
        </div>

        {success ? (
          <div
            className="rounded-xl px-4 py-3 text-sm font-body text-center"
            style={{ background: 'rgba(34,197,94,0.1)', color: 'var(--green)', border: '1px solid rgba(34,197,94,0.25)' }}
          >
            ✓ Reward email sent to {referrer.referrerEmail}!
          </div>
        ) : (
          <button
            type="button"
            onClick={handleSend}
            disabled={sending || !link}
            className="w-full rounded-2xl font-heading font-bold text-sm tracking-wide transition-all flex items-center justify-center gap-2 active:scale-[0.98]"
            style={{
              minHeight: '52px',
              background: !link || sending ? 'var(--bg-float)' : 'linear-gradient(135deg,#FFB800,#FFCF40)',
              color: !link || sending ? 'var(--text-4)' : '#000',
              cursor: !link || sending ? 'not-allowed' : 'pointer',
            }}
          >
            {sending ? 'Sending…' : `Send ₹${amount.toLocaleString('en-IN')} Voucher`}
          </button>
        )}
      </div>
    </div>
  )
}

// ─── Top Referrers Table ──────────────────────────────────────────────────────

function TopReferrersTab({
  referrers: initialReferrers,
}: {
  referrers: TopReferrer[]
}) {
  const [referrers, setReferrers] = useState(initialReferrers)
  const [modal, setModal]         = useState<TopReferrer | null>(null)
  const [filterPaid, setFilterPaid] = useState<'all' | 'pending'>('all')

  const filtered = filterPaid === 'pending'
    ? referrers.filter(r => !r.voucherSent)
    : referrers

  const handleSent = (referrerId: string) => {
    setReferrers(prev => prev.map(r =>
      r.referrerId === referrerId ? { ...r, voucherSent: true } : r
    ))
  }

  return (
    <>
      {modal && (
        <SendRewardModal
          referrer={modal}
          onClose={() => setModal(null)}
          onSent={handleSent}
        />
      )}

      <div className="flex items-center gap-3 mb-4">
        {(['all', 'pending'] as const).map(f => (
          <button
            key={f}
            onClick={() => setFilterPaid(f)}
            className="text-xs font-mono px-3 py-1.5 rounded-full transition-colors"
            style={{
              background: filterPaid === f ? 'rgba(255,184,0,0.12)' : 'var(--bg-float)',
              border: `1px solid ${filterPaid === f ? 'var(--border-brand)' : 'var(--border-subtle)'}`,
              color: filterPaid === f ? 'var(--brand)' : 'var(--text-3)',
            }}
          >
            {f === 'all' ? 'All Referrers' : 'Reward Pending'}
          </button>
        ))}
        <span className="ml-auto text-xs font-mono" style={{ color: 'var(--text-4)' }}>
          {filtered.length} referrer{filtered.length !== 1 ? 's' : ''}
        </span>
      </div>

      {filtered.length === 0 ? (
        <p className="text-sm font-body text-center py-12" style={{ color: 'var(--text-4)' }}>
          No referrers found
        </p>
      ) : (
        <div className="flex flex-col gap-2">
          {filtered.map((r, i) => (
            <div
              key={r.referrerId}
              className="flex items-center gap-3 rounded-xl p-4"
              style={{ background: 'var(--bg-card)', border: '1px solid var(--border-faint)' }}
            >
              <RankBadge rank={i + 1} />

              <div
                className="w-9 h-9 rounded-full flex items-center justify-center font-heading font-bold text-sm shrink-0"
                style={{ background: 'rgba(255,184,0,0.10)', color: 'var(--brand)' }}
              >
                {r.referrerName.charAt(0)}
              </div>

              <div className="flex-1 min-w-0">
                <p className="text-sm font-semibold truncate" style={{ color: 'var(--text-1)' }}>
                  {r.referrerName}
                </p>
                <p className="text-xs font-mono truncate" style={{ color: 'var(--text-3)' }}>
                  {r.referrerEmail}
                </p>
              </div>

              <div className="flex items-center gap-2 shrink-0">
                <Badge label={`${r.successfulReferrals} refs`} color="#22C55E" />
                {r.voucherSent
                  ? <Badge label="Sent ✓" color="#22C55E" />
                  : (
                    <button
                      onClick={() => setModal(r)}
                      className="text-xs font-heading font-semibold px-3 py-1.5 rounded-lg transition-all active:scale-95"
                      style={{
                        background: 'linear-gradient(135deg,#FFB800,#FFCF40)',
                        color: '#000',
                        minHeight: '32px',
                      }}
                    >
                      Send Reward
                    </button>
                  )}
              </div>
            </div>
          ))}
        </div>
      )}
    </>
  )
}

// ─── Activity Tab ─────────────────────────────────────────────────────────────

function ActivityTab({ records }: { records: ReferralRecord[] }) {
  return (
    <div className="flex flex-col gap-2">
      {records.length === 0 ? (
        <p className="text-sm font-body text-center py-12" style={{ color: 'var(--text-4)' }}>
          No referral activity yet
        </p>
      ) : (
        records.map(r => (
          <div
            key={r.id}
            className="flex items-center gap-3 rounded-xl p-3"
            style={{ background: 'var(--bg-card)', border: '1px solid var(--border-faint)' }}
          >
            <div className="flex-1 min-w-0">
              <p className="text-sm font-semibold truncate" style={{ color: 'var(--text-1)' }}>
                {r.referrerName}
                <span className="font-normal" style={{ color: 'var(--text-3)' }}> → {r.refereeName}</span>
              </p>
              <p className="text-xs font-mono truncate" style={{ color: 'var(--text-4)' }}>
                {r.referrerEmail} → {r.refereeEmail}
              </p>
            </div>
            <div className="flex items-center gap-2 shrink-0">
              {r.paid
                ? <Badge label="Paid ✓" color="#22C55E" />
                : <Badge label="Pending" color="#808080" />}
              {r.voucherSent && <Badge label="Rewarded" color="#FFB800" />}
            </div>
            {r.createdAt && (
              <p className="text-[11px] font-mono shrink-0 hidden md:block" style={{ color: 'var(--text-4)' }}>
                {new Date(r.createdAt).toLocaleDateString('en-IN', { day: 'numeric', month: 'short' })}
              </p>
            )}
          </div>
        ))
      )}
    </div>
  )
}

// ─── Main Client ──────────────────────────────────────────────────────────────

export function ReferralsClient({
  topReferrers,
  activity,
  stats,
}: {
  topReferrers: TopReferrer[]
  activity: ReferralRecord[]
  stats: { total: number; paid: number; vouchersSent: number }
}) {
  const [tab, setTab] = useState<'leaderboard' | 'activity'>('leaderboard')

  return (
    <div className="p-4 md:p-6 max-w-4xl mx-auto">
      {/* Page header */}
      <div className="mb-6">
        <h1 className="font-display text-3xl tracking-wider mb-1" style={{ color: 'var(--text-1)' }}>
          REFERRALS
        </h1>
        <p className="text-sm font-body" style={{ color: 'var(--text-3)' }}>
          Track referrals and distribute rewards to top referrers
        </p>
      </div>

      {/* KPI cards */}
      <div className="grid grid-cols-3 gap-3 mb-6">
        {[
          { label: 'Total Referrals',  value: stats.total,       color: 'var(--text-1)' },
          { label: 'Paid Referrals',   value: stats.paid,        color: '#22C55E' },
          { label: 'Vouchers Sent',    value: stats.vouchersSent, color: 'var(--brand)' },
        ].map(kpi => (
          <div
            key={kpi.label}
            className="rounded-xl p-4"
            style={{ background: 'var(--bg-card)', border: '1px solid var(--border-faint)' }}
          >
            <p className="text-[10px] font-mono uppercase tracking-[0.12em] mb-1" style={{ color: 'var(--text-4)' }}>
              {kpi.label}
            </p>
            <p className="text-2xl font-heading font-bold" style={{ color: kpi.color }}>
              {kpi.value}
            </p>
          </div>
        ))}
      </div>

      {/* Tabs */}
      <div className="flex gap-2 mb-5 border-b" style={{ borderColor: 'var(--border-faint)' }}>
        {([
          { key: 'leaderboard', label: '🏆 Top Referrers' },
          { key: 'activity',    label: '📋 Activity Log' },
        ] as const).map(t => (
          <button
            key={t.key}
            onClick={() => setTab(t.key)}
            className="pb-3 px-1 text-sm font-heading font-semibold transition-colors"
            style={{
              color: tab === t.key ? 'var(--brand)' : 'var(--text-3)',
              borderBottom: tab === t.key ? '2px solid var(--brand)' : '2px solid transparent',
              marginBottom: '-1px',
            }}
          >
            {t.label}
          </button>
        ))}
      </div>

      {/* Tab content */}
      {tab === 'leaderboard'
        ? <TopReferrersTab referrers={topReferrers} />
        : <ActivityTab records={activity} />}
    </div>
  )
}
