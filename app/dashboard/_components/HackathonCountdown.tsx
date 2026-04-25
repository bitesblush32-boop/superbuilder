'use client'

import { useState, useEffect, useCallback } from 'react'

interface TimeLeft {
  days:  number
  hours: number
  mins:  number
  secs:  number
}

function compute(targetMs: number): TimeLeft | null {
  const diff = targetMs - Date.now()
  if (diff <= 0) return null
  return {
    days:  Math.floor(diff / 86_400_000),
    hours: Math.floor((diff % 86_400_000) / 3_600_000),
    mins:  Math.floor((diff % 3_600_000) / 60_000),
    secs:  Math.floor((diff % 60_000) / 1_000),
  }
}

interface Props {
  targetDate: string // ISO string
}

export function HackathonCountdown({ targetDate }: Props) {
  const targetMs = new Date(targetDate).getTime()
  const [timeLeft, setTimeLeft] = useState<TimeLeft | null>(() => compute(targetMs))

  const tick = useCallback(() => setTimeLeft(compute(targetMs)), [targetMs])

  useEffect(() => {
    tick()
    const id = setInterval(tick, 1_000)
    return () => clearInterval(id)
  }, [tick])

  if (!timeLeft) {
    return (
      <div
        className="flex items-center justify-center gap-3 py-4 rounded-2xl border"
        style={{
          background:  'rgba(255,184,0,0.08)',
          borderColor: 'rgba(255,184,0,0.3)',
        }}
      >
        <span className="font-display text-2xl tracking-widest" style={{ color: 'var(--brand)' }}>
          HACKATHON IS LIVE
        </span>
        <span className="text-2xl animate-bounce">🔥</span>
      </div>
    )
  }

  const units = [
    { val: timeLeft.days,  label: 'DAYS' },
    { val: timeLeft.hours, label: 'HRS'  },
    { val: timeLeft.mins,  label: 'MINS' },
    { val: timeLeft.secs,  label: 'SECS' },
  ]

  return (
    <div className="flex gap-2 justify-center">
      {units.map(({ val, label }, i) => (
        <div key={label} className="flex-1 flex flex-col items-center gap-1">
          <div
            className="w-full rounded-xl border flex items-center justify-center"
            style={{
              background:  'var(--bg-card)',
              borderColor: 'var(--border-subtle)',
              aspectRatio: '1',
              maxWidth: '72px',
            }}
          >
            <span
              className="font-display leading-none"
              style={{
                fontSize: 'clamp(1.5rem, 5vw, 2rem)',
                color: i === 0 ? 'var(--brand)' : 'var(--text-1)',
              }}
            >
              {String(val).padStart(2, '0')}
            </span>
          </div>
          <span className="font-mono text-[10px] tracking-widest" style={{ color: 'var(--text-4)' }}>
            {label}
          </span>
        </div>
      ))}
    </div>
  )
}
