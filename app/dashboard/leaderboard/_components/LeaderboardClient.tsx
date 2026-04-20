'use client'

import { useEffect, useState } from 'react'
import { BADGES }              from '@/lib/gamification/badges'

export interface LeaderboardEntry {
  rank:       number
  id:         string
  firstName:  string
  city:       string | null
  xpPoints:   number
  badges:     string[]
  tier:       string | null
  isYou:      boolean
}

interface Props {
  initialRows: LeaderboardEntry[]
  myEntry:     LeaderboardEntry
}

const PODIUM = ['🥇', '🥈', '🥉']

export function LeaderboardClient({ initialRows, myEntry }: Props) {
  const [rows, setRows] = useState<LeaderboardEntry[]>(initialRows)
  const [lastUpdated, setLastUpdated] = useState<Date>(new Date())

  // SSE live updates — wired when /api/leaderboard/stream is implemented
  useEffect(() => {
    let es: EventSource
    try {
      es = new EventSource('/api/leaderboard/stream')
      es.addEventListener('update', (e: MessageEvent) => {
        try {
          const data = JSON.parse(e.data) as LeaderboardEntry[]
          setRows(data)
          setLastUpdated(new Date())
        } catch {
          // ignore parse errors
        }
      })
    } catch {
      // SSE not available — fall back to initial data
    }
    return () => es?.close()
  }, [])

  const top3    = rows.slice(0, 3)
  const rest    = rows.slice(3)
  const myInTop = rows.some(r => r.isYou)

  return (
    <div className="space-y-4">

      {/* Your rank — always pinned */}
      <div
        className="rounded-2xl border p-4 flex items-center gap-4"
        style={{ background: 'rgba(255,184,0,0.06)', borderColor: 'rgba(255,184,0,0.3)' }}
      >
        <div
          className="w-12 h-12 rounded-full flex items-center justify-center font-display text-xl shrink-0"
          style={{ background: 'rgba(255,184,0,0.15)', color: 'var(--brand)', border: '2px solid rgba(255,184,0,0.4)' }}
        >
          #{myEntry.rank}
        </div>
        <div className="flex-1 min-w-0">
          <p className="font-heading font-bold text-sm" style={{ color: 'var(--text-1)' }}>
            You — {myEntry.firstName}
            {myEntry.city && <span className="font-mono text-[11px] ml-2" style={{ color: 'var(--text-4)' }}>📍 {myEntry.city}</span>}
          </p>
          <p className="font-mono text-[11px]" style={{ color: 'var(--text-3)' }}>
            {myEntry.xpPoints.toLocaleString('en-IN')} XP · {myEntry.badges.length} badge{myEntry.badges.length !== 1 ? 's' : ''}
          </p>
        </div>
      </div>

      {/* Podium — top 3 */}
      <div className="grid grid-cols-3 gap-2">
        {top3.map((entry, i) => (
          <div
            key={entry.id}
            className="rounded-2xl border p-3 flex flex-col items-center gap-1 text-center"
            style={{
              background:  entry.isYou ? 'rgba(255,184,0,0.08)' : 'var(--bg-card)',
              borderColor: i === 0 ? 'rgba(255,215,0,0.4)' : i === 1 ? 'rgba(192,192,192,0.3)' : i === 2 ? 'rgba(205,127,50,0.3)' : 'var(--border-faint)',
            }}
          >
            <span className="text-xl">{PODIUM[i]}</span>
            <div
              className="w-10 h-10 rounded-full flex items-center justify-center font-heading font-bold text-sm"
              style={{
                background:  entry.isYou ? 'rgba(255,184,0,0.2)' : 'var(--bg-float)',
                color:       entry.isYou ? 'var(--brand)' : 'var(--text-2)',
                border:      `1px solid ${entry.isYou ? 'rgba(255,184,0,0.35)' : 'var(--border-subtle)'}`,
              }}
            >
              {entry.firstName.charAt(0).toUpperCase()}
            </div>
            <p className="font-heading font-semibold text-xs leading-tight" style={{ color: 'var(--text-1)' }}>
              {entry.firstName}
            </p>
            <p className="font-mono text-[10px]" style={{ color: 'var(--text-brand)' }}>
              {entry.xpPoints.toLocaleString('en-IN')} XP
            </p>
          </div>
        ))}
      </div>

      {/* Rows 4–50 */}
      <div
        className="rounded-2xl border overflow-hidden"
        style={{ background: 'var(--bg-card)', borderColor: 'var(--border-faint)' }}
      >
        <div className="divide-y" style={{ borderColor: 'var(--border-faint)' }}>
          {rest.map(entry => (
            <div
              key={entry.id}
              className="flex items-center gap-3 px-4 py-3"
              style={{
                borderLeft:      entry.isYou ? '3px solid var(--brand)' : '3px solid transparent',
                background:      entry.isYou ? 'rgba(255,184,0,0.04)' : 'transparent',
              }}
            >
              <span className="font-mono text-[11px] w-7 text-right shrink-0" style={{ color: 'var(--text-4)' }}>
                #{entry.rank}
              </span>
              <div
                className="w-8 h-8 rounded-full flex items-center justify-center font-heading font-bold text-xs shrink-0"
                style={{
                  background:  entry.isYou ? 'rgba(255,184,0,0.15)' : 'var(--bg-float)',
                  color:       entry.isYou ? 'var(--brand)' : 'var(--text-3)',
                  border:      `1px solid ${entry.isYou ? 'rgba(255,184,0,0.3)' : 'var(--border-subtle)'}`,
                }}
              >
                {entry.firstName.charAt(0).toUpperCase()}
              </div>
              <div className="flex-1 min-w-0">
                <p className="font-heading font-semibold text-sm truncate" style={{ color: 'var(--text-1)' }}>
                  {entry.firstName}
                  {entry.isYou && <span className="ml-1 font-mono text-[10px]" style={{ color: 'var(--text-4)' }}>you</span>}
                </p>
                {entry.city && (
                  <p className="font-mono text-[10px] truncate" style={{ color: 'var(--text-4)' }}>
                    {entry.city}
                  </p>
                )}
              </div>
              <div className="text-right shrink-0">
                <p className="font-mono text-sm" style={{ color: 'var(--text-brand)' }}>
                  {entry.xpPoints.toLocaleString('en-IN')}
                </p>
                {entry.badges.length > 0 && (
                  <p className="font-mono text-[10px]" style={{ color: 'var(--text-4)' }}>
                    {entry.badges.length > 3
                      ? entry.badges.slice(0, 3).map(id => BADGES[id as keyof typeof BADGES]?.emoji ?? '').join('') + `+${entry.badges.length - 3}`
                      : entry.badges.map(id => BADGES[id as keyof typeof BADGES]?.emoji ?? '').join('')
                    }
                  </p>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* If you're not in top 50 */}
      {!myInTop && (
        <div
          className="rounded-2xl border p-4 text-center"
          style={{ background: 'var(--bg-card)', borderColor: 'var(--border-faint)' }}
        >
          <p className="font-body text-sm" style={{ color: 'var(--text-4)' }}>
            You're ranked #{myEntry.rank} · Earn more XP by completing workshops and submitting your project.
          </p>
        </div>
      )}

      {/* Footer */}
      <p className="text-center font-mono text-[10px]" style={{ color: 'var(--text-4)' }}>
        Updates every 10 seconds · Last updated {lastUpdated.toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit', second: '2-digit' })}
      </p>
    </div>
  )
}
