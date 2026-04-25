'use client'

import { useState, useTransition } from 'react'
import { useRouter }                from 'next/navigation'

interface Props {
  studentId: string
}

export function TeamActions({ studentId: _studentId }: Props) {
  const router             = useRouter()
  const [isPending, start] = useTransition()

  const [view, setView]     = useState<'idle' | 'create' | 'join'>('idle')
  const [teamName, setName] = useState('')
  const [joinCode, setCode] = useState('')
  const [error, setError]   = useState<string | null>(null)

  async function handleCreate() {
    if (!teamName.trim()) { setError('Enter a team name.'); return }
    setError(null)
    start(async () => {
      const res = await fetch('/api/team/create', {
        method: 'POST',
        body:   JSON.stringify({ teamName }),
        headers: { 'Content-Type': 'application/json' },
      })
      if (res.ok) { router.refresh() }
      else {
        const { error: e } = await res.json().catch(() => ({}))
        setError(e ?? 'Something went wrong. Try again.')
      }
    })
  }

  async function handleJoin() {
    if (!joinCode.trim()) { setError('Enter a team code.'); return }
    setError(null)
    start(async () => {
      const res = await fetch('/api/team/join', {
        method: 'POST',
        body:   JSON.stringify({ code: joinCode }),
        headers: { 'Content-Type': 'application/json' },
      })
      if (res.ok) { router.refresh() }
      else {
        const { error: e } = await res.json().catch(() => ({}))
        setError(e ?? 'Something went wrong. Try again.')
      }
    })
  }

  return (
    <div className="space-y-3">
      {/* Action buttons */}
      {view === 'idle' && (
        <div className="flex flex-col sm:flex-row gap-3">
          <button
            onClick={() => { setView('create'); setError(null) }}
            className="flex-1 min-h-[44px] px-5 rounded-xl font-heading font-bold text-sm tracking-wide transition-all active:scale-95"
            style={{ background: 'var(--brand)', color: '#000' }}
          >
            + Create a Team
          </button>
          <button
            onClick={() => { setView('join'); setError(null) }}
            className="flex-1 min-h-[44px] px-5 rounded-xl font-heading font-semibold text-sm border transition-all active:scale-95"
            style={{ borderColor: 'var(--border-subtle)', color: 'var(--text-2)' }}
          >
            Join with Code
          </button>
        </div>
      )}

      {/* Create form */}
      {view === 'create' && (
        <div
          className="rounded-2xl border p-5 space-y-4"
          style={{ background: 'var(--bg-card)', borderColor: 'var(--border-subtle)' }}
        >
          <p className="font-mono text-[10px] tracking-[0.2em] uppercase" style={{ color: 'var(--text-brand)' }}>
            Create Team
          </p>
          <input
            type="text"
            placeholder="Team name (e.g. Bug Busters)"
            value={teamName}
            onChange={e => setName(e.target.value)}
            maxLength={50}
            autoCapitalize="words"
            className="w-full min-h-[48px] px-4 rounded-xl font-body text-sm outline-none border"
            style={{
              background:   'var(--bg-float)',
              borderColor:  'var(--border-subtle)',
              color:        'var(--text-1)',
            }}
          />
          {error && <p className="font-body text-sm" style={{ color: 'var(--red)' }}>{error}</p>}
          <div className="flex gap-3">
            <button
              onClick={handleCreate}
              disabled={isPending}
              className="flex-1 min-h-[44px] rounded-xl font-heading font-bold text-sm transition-all active:scale-95 disabled:opacity-50"
              style={{ background: 'var(--brand)', color: '#000' }}
            >
              {isPending ? 'Creating…' : 'Create'}
            </button>
            <button
              onClick={() => setView('idle')}
              className="flex-1 min-h-[44px] rounded-xl font-heading font-semibold text-sm border transition-all active:scale-95"
              style={{ borderColor: 'var(--border-subtle)', color: 'var(--text-2)' }}
            >
              Cancel
            </button>
          </div>
        </div>
      )}

      {/* Join form */}
      {view === 'join' && (
        <div
          className="rounded-2xl border p-5 space-y-4"
          style={{ background: 'var(--bg-card)', borderColor: 'var(--border-subtle)' }}
        >
          <p className="font-mono text-[10px] tracking-[0.2em] uppercase" style={{ color: 'var(--text-brand)' }}>
            Join Team
          </p>
          <input
            type="text"
            placeholder="Team code (e.g. SB-X7K2)"
            value={joinCode}
            onChange={e => setCode(e.target.value.toUpperCase())}
            maxLength={10}
            inputMode="text"
            autoCapitalize="characters"
            className="w-full min-h-[48px] px-4 rounded-xl font-mono text-base outline-none border tracking-widest"
            style={{
              background:  'var(--bg-float)',
              borderColor: 'var(--border-subtle)',
              color:       'var(--text-1)',
            }}
          />
          {error && <p className="font-body text-sm" style={{ color: 'var(--red)' }}>{error}</p>}
          <div className="flex gap-3">
            <button
              onClick={handleJoin}
              disabled={isPending}
              className="flex-1 min-h-[44px] rounded-xl font-heading font-bold text-sm transition-all active:scale-95 disabled:opacity-50"
              style={{ background: 'var(--brand)', color: '#000' }}
            >
              {isPending ? 'Joining…' : 'Join'}
            </button>
            <button
              onClick={() => setView('idle')}
              className="flex-1 min-h-[44px] rounded-xl font-heading font-semibold text-sm border transition-all active:scale-95"
              style={{ borderColor: 'var(--border-subtle)', color: 'var(--text-2)' }}
            >
              Cancel
            </button>
          </div>
        </div>
      )}
    </div>
  )
}
