'use client'

import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'

// ─── Types ────────────────────────────────────────────────────────────────────
type EventType = 'stage1' | 'workshop' | 'hackathon' | 'demo' | 'certificate'

interface CalEvent {
  type:   EventType
  label:  string
  detail: string
  emoji:  string
}

// ─── Programme data (hardcoded) ───────────────────────────────────────────────
const EVENTS: Record<string, CalEvent[]> = {
  '2026-06-03': [
    { type: 'workshop', label: 'Orientation Session', detail: 'Welcome · Full programme briefing · Community intro', emoji: '🎓' },
    { type: 'workshop', label: 'Workshop 1 — AI Fundamentals', detail: 'AI tools overview · Use 3+ AI tools confidently · 90 mins', emoji: '🤖' },
  ],
  '2026-06-04': [
    { type: 'workshop', label: 'Workshop 2 — Domain Deep-Dive', detail: 'Problem framing · Domain research · 75 mins', emoji: '🎯' },
  ],
  '2026-06-05': [
    { type: 'workshop', label: 'Workshop 3 — Build Sprint', detail: 'Working prototype ready · 90 mins', emoji: '🛠️' },
  ],
  '2026-06-07': [
    { type: 'hackathon', label: 'Hackathon Starts', detail: '8:00 AM IST — 24-hour build sprint begins. Ship it!', emoji: '🔥' },
  ],
  '2026-06-08': [
    { type: 'hackathon', label: 'Hackathon Ends', detail: '8:00 AM IST — Final submissions due. Build fast, build bold.', emoji: '⏰' },
  ],
  '2026-06-27': [
    { type: 'demo', label: 'Demo Day', detail: 'Live project showcase + winner announcement', emoji: '🏆' },
  ],
  '2026-07-01': [
    { type: 'certificate', label: 'Certificates + Prizes', detail: 'Download your Super Builder certificate · Prizes distributed', emoji: '📜' },
  ],
}

// Stage 1: Apr 23 – May 30
const STAGE1_START = new Date(2026, 3, 23)
const STAGE1_END   = new Date(2026, 4, 30)

const MONTHS = [
  { year: 2026, month: 4, label: 'May',  full: 'May 2026'  },
  { year: 2026, month: 5, label: 'Jun',  full: 'June 2026' },
  { year: 2026, month: 6, label: 'Jul',  full: 'July 2026' },
]

const WEEKDAYS = ['Su', 'Mo', 'Tu', 'We', 'Th', 'Fr', 'Sa']

// ─── Visual styles per event type ─────────────────────────────────────────────
const STYLES: Record<EventType, { bg: string; border: string; text: string; dot: string; pill: string }> = {
  stage1:      { bg: 'rgba(255,184,0,0.10)',  border: 'rgba(255,184,0,0.35)',  text: '#FFB800', dot: '#FFB800', pill: 'rgba(255,184,0,0.15)'  },
  workshop:    { bg: 'rgba(96,165,250,0.11)', border: 'rgba(96,165,250,0.4)',  text: '#60A5FA', dot: '#60A5FA', pill: 'rgba(96,165,250,0.15)' },
  hackathon:   { bg: 'rgba(251,146,60,0.14)', border: 'rgba(251,146,60,0.45)', text: '#FB923C', dot: '#FB923C', pill: 'rgba(251,146,60,0.15)' },
  demo:        { bg: 'rgba(192,132,252,0.11)',border: 'rgba(192,132,252,0.4)', text: '#C084FC', dot: '#C084FC', pill: 'rgba(192,132,252,0.15)'},
  certificate: { bg: 'rgba(34,197,94,0.11)',  border: 'rgba(34,197,94,0.4)',   text: '#22C55E', dot: '#22C55E', pill: 'rgba(34,197,94,0.15)'  },
}

const LEGEND_ITEMS: { type: EventType; label: string }[] = [
  { type: 'stage1',      label: 'Apply & Prep'    },
  { type: 'workshop',    label: 'Workshops'        },
  { type: 'hackathon',   label: 'Hackathon'        },
  { type: 'demo',        label: 'Demo Day'         },
  { type: 'certificate', label: 'Certificates'     },
]

// ─── Helpers ──────────────────────────────────────────────────────────────────
function toKey(y: number, m: number, d: number) {
  return `${y}-${String(m + 1).padStart(2, '0')}-${String(d).padStart(2, '0')}`
}

function isStage1(y: number, m: number, d: number) {
  const date = new Date(y, m, d)
  return date >= STAGE1_START && date <= STAGE1_END
}

function buildGrid(year: number, month: number): (number | null)[] {
  const firstDay    = new Date(year, month, 1).getDay()
  const daysInMonth = new Date(year, month + 1, 0).getDate()
  const cells: (number | null)[] = []
  for (let i = 0; i < firstDay; i++) cells.push(null)
  for (let d = 1; d <= daysInMonth; d++) cells.push(d)
  while (cells.length % 7 !== 0) cells.push(null)
  return cells
}

// ─── Main component ───────────────────────────────────────────────────────────
export function CalendarView() {
  const today = new Date()

  // Default to the month most relevant today; fallback to May
  const defaultIdx = (() => {
    if (today.getFullYear() === 2026) {
      const idx = MONTHS.findIndex(m => m.month === today.getMonth())
      if (idx !== -1) return idx
    }
    return 0
  })()

  const [activeIdx,    setActiveIdx]    = useState(defaultIdx)
  const [direction,    setDirection]    = useState(0)  // +1 forward, -1 back
  const [selectedKey,  setSelectedKey]  = useState<string | null>(null)

  function switchMonth(idx: number) {
    if (idx === activeIdx) return
    setDirection(idx > activeIdx ? 1 : -1)
    setActiveIdx(idx)
    setSelectedKey(null)
  }

  const { year, month, full } = MONTHS[activeIdx]
  const grid = buildGrid(year, month)

  const variants = {
    enter:  (d: number) => ({ opacity: 0, x: d > 0 ? 32 : -32 }),
    center: { opacity: 1, x: 0 },
    exit:   (d: number) => ({ opacity: 0, x: d > 0 ? -32 : 32 }),
  }

  return (
    <div
      className="rounded-2xl border overflow-hidden"
      style={{ background: 'var(--bg-card)', borderColor: 'var(--border-subtle)' }}
    >
      {/* ── Header ─────────────────────────────────────────────────────────── */}
      <div
        className="flex items-center justify-between px-4 py-3 border-b"
        style={{ borderColor: 'var(--border-faint)', background: 'var(--bg-raised)' }}
      >
        {/* Animated month name */}
        <div className="flex items-center gap-2 min-w-0">
          <span className="text-lg shrink-0">📅</span>
          <AnimatePresence mode="wait">
            <motion.p
              key={full}
              className="font-display text-xl tracking-widest leading-none"
              style={{ color: 'var(--brand)' }}
              initial={{ opacity: 0, y: -6 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 6 }}
              transition={{ duration: 0.22, ease: [0.16, 1, 0.3, 1] }}
            >
              {full.toUpperCase()}
            </motion.p>
          </AnimatePresence>
        </div>

        {/* Month tabs */}
        <div className="flex gap-1 shrink-0">
          {MONTHS.map((m, i) => (
            <button
              key={m.month}
              onClick={() => switchMonth(i)}
              className="font-mono text-[11px] rounded-lg transition-all duration-150 active:scale-90"
              style={{
                minHeight:  '32px',
                minWidth:   '44px',
                padding:    '0 8px',
                background: i === activeIdx ? 'var(--brand)' : 'var(--bg-float)',
                color:      i === activeIdx ? '#000' : 'var(--text-3)',
                fontWeight: i === activeIdx ? 700 : 400,
                border:     i === activeIdx ? 'none' : '1px solid var(--border-faint)',
              }}
            >
              {m.label}
            </button>
          ))}
        </div>
      </div>

      {/* ── Calendar grid ──────────────────────────────────────────────────── */}
      <div className="px-3 pt-3 pb-2">
        {/* Weekday row */}
        <div className="grid grid-cols-7 mb-1">
          {WEEKDAYS.map((wd, i) => (
            <div
              key={i}
              className="text-center font-mono text-[10px] py-1"
              style={{ color: 'var(--text-4)' }}
            >
              {wd}
            </div>
          ))}
        </div>

        {/* Animated day cells */}
        <div className="relative overflow-hidden" style={{ minHeight: 240 }}>
          <AnimatePresence custom={direction} mode="wait">
            <motion.div
              key={`${year}-${month}`}
              custom={direction}
              variants={variants}
              initial="enter"
              animate="center"
              exit="exit"
              transition={{ duration: 0.26, ease: [0.16, 1, 0.3, 1] }}
              className="grid grid-cols-7 gap-0.5"
            >
              {grid.map((day, idx) => {
                if (day === null) {
                  return <div key={`e-${idx}`} className="aspect-square" />
                }

                const key        = toKey(year, month, day)
                const events     = EVENTS[key] ?? []
                const s1         = isStage1(year, month, day)
                const isToday    = today.getFullYear() === year && today.getMonth() === month && today.getDate() === day
                const isSelected = selectedKey === key
                const hasEvents  = events.length > 0 || s1

                const primaryType: EventType | null = events[0]?.type ?? (s1 ? 'stage1' : null)
                const st = primaryType ? STYLES[primaryType] : null

                // Cell background
                const cellBg = isSelected && st
                  ? st.bg
                  : events.length > 0 && st
                  ? st.bg
                  : s1
                  ? 'rgba(255,184,0,0.06)'
                  : 'transparent'

                // Cell border
                const cellBorder = isToday
                  ? '2px solid #FFB800'
                  : isSelected && st
                  ? `2px solid ${st.border}`
                  : events.length > 0 && st
                  ? `1.5px solid ${st.border}`
                  : s1
                  ? '1.5px solid rgba(255,184,0,0.15)'
                  : '1.5px solid transparent'

                return (
                  <button
                    key={key}
                    onClick={() => hasEvents && setSelectedKey(isSelected ? null : key)}
                    disabled={!hasEvents}
                    className="relative flex flex-col items-center justify-center rounded-xl transition-all duration-150 active:scale-[0.88]"
                    style={{
                      minHeight:  '40px',
                      background: cellBg,
                      border:     cellBorder,
                      boxShadow:  isToday ? '0 0 12px rgba(255,184,0,0.28)' : 'none',
                      cursor:     hasEvents ? 'pointer' : 'default',
                    }}
                    aria-label={hasEvents ? `${day} ${full}: ${events.map(e => e.label).join(', ')}` : String(day)}
                  >
                    {/* Day number */}
                    <span
                      className="font-mono text-[11px] leading-none"
                      style={{
                        color:      isToday ? '#FFB800' : st ? st.text : s1 ? 'rgba(255,184,0,0.55)' : 'var(--text-3)',
                        fontWeight: isToday || events.length ? 700 : 400,
                      }}
                    >
                      {day}
                    </span>

                    {/* Event dots */}
                    {events.length > 0 && (
                      <div className="flex gap-[2px] mt-[3px]">
                        {events.slice(0, 3).map((e, di) => (
                          <div
                            key={di}
                            className="rounded-full shrink-0"
                            style={{ width: 4, height: 4, background: STYLES[e.type].dot }}
                          />
                        ))}
                      </div>
                    )}

                    {/* Special emoji badge for key milestones */}
                    {events[0] && (events[0].type === 'hackathon' || events[0].type === 'demo' || events[0].type === 'certificate') && (
                      <span style={{ fontSize: 8, lineHeight: 1, marginTop: 2 }}>{events[0].emoji}</span>
                    )}

                    {/* TODAY pill */}
                    {isToday && (
                      <motion.div
                        className="absolute inset-0 rounded-xl"
                        style={{ border: '2px solid rgba(255,184,0,0.5)' }}
                        initial={{ scale: 1, opacity: 0.7 }}
                        animate={{ scale: 1.15, opacity: 0 }}
                        transition={{ duration: 1.8, repeat: Infinity, ease: 'easeOut' }}
                        aria-hidden="true"
                      />
                    )}
                  </button>
                )
              })}
            </motion.div>
          </AnimatePresence>
        </div>

        {/* ── Selected date detail panel ──────────────────────────────────── */}
        <AnimatePresence>
          {selectedKey && (() => {
            const parts  = selectedKey.split('-').map(Number)
            const evts   = EVENTS[selectedKey] ?? []
            const s1     = isStage1(parts[0], parts[1] - 1, parts[2])
            const dateLabel = new Date(parts[0], parts[1] - 1, parts[2])
              .toLocaleDateString('en-IN', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' })

            return (
              <motion.div
                key={selectedKey}
                initial={{ opacity: 0, y: 8, scale: 0.98 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{ opacity: 0, y: 4, scale: 0.98 }}
                transition={{ duration: 0.2, ease: [0.16, 1, 0.3, 1] }}
                className="mt-3 rounded-xl border p-3 flex flex-col gap-2.5"
                style={{ background: 'var(--bg-raised)', borderColor: 'var(--border-brand)' }}
              >
                <div className="flex items-center justify-between gap-2">
                  <p className="font-mono text-[11px] tracking-widest uppercase" style={{ color: 'var(--text-brand)' }}>
                    {dateLabel}
                  </p>
                  <button
                    onClick={() => setSelectedKey(null)}
                    className="w-6 h-6 flex items-center justify-center rounded-md transition-colors active:scale-90"
                    style={{ color: 'var(--text-4)', background: 'var(--bg-float)' }}
                    aria-label="Close"
                  >
                    <svg width="10" height="10" viewBox="0 0 10 10" fill="none" aria-hidden="true">
                      <path d="M1 1l8 8M9 1L1 9" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
                    </svg>
                  </button>
                </div>

                {s1 && evts.length === 0 && (
                  <div className="flex items-start gap-2.5">
                    <span
                      className="flex items-center justify-center rounded-lg shrink-0 text-sm"
                      style={{ width: 32, height: 32, background: STYLES.stage1.pill }}
                    >
                      🏗️
                    </span>
                    <div>
                      <p className="text-sm font-semibold" style={{ color: STYLES.stage1.text }}>Apply &amp; Prep — Stage 1</p>
                      <p className="text-xs mt-0.5 leading-snug" style={{ color: 'var(--text-3)' }}>
                        Registration open · Complete your application, quiz &amp; idea submission
                      </p>
                    </div>
                  </div>
                )}

                {evts.map((evt, i) => (
                  <div key={i} className="flex items-start gap-2.5">
                    <span
                      className="flex items-center justify-center rounded-lg shrink-0 text-sm"
                      style={{ width: 32, height: 32, background: STYLES[evt.type].pill }}
                    >
                      {evt.emoji}
                    </span>
                    <div>
                      <p className="text-sm font-semibold" style={{ color: STYLES[evt.type].text }}>{evt.label}</p>
                      <p className="text-xs mt-0.5 leading-snug" style={{ color: 'var(--text-3)' }}>{evt.detail}</p>
                    </div>
                  </div>
                ))}
              </motion.div>
            )
          })()}
        </AnimatePresence>
      </div>

      {/* ── Legend ─────────────────────────────────────────────────────────── */}
      <div
        className="px-4 py-3 border-t flex flex-wrap gap-x-4 gap-y-2"
        style={{ borderColor: 'var(--border-faint)', background: 'var(--bg-inset)' }}
      >
        {LEGEND_ITEMS.map(({ type, label }) => (
          <div key={type} className="flex items-center gap-1.5">
            <div
              className="rounded-full shrink-0"
              style={{ width: 8, height: 8, background: STYLES[type].dot }}
            />
            <span className="font-mono text-[10px]" style={{ color: 'var(--text-4)' }}>
              {label}
            </span>
          </div>
        ))}
      </div>
    </div>
  )
}
