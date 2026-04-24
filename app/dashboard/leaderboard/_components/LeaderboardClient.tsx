'use client'

import { useEffect, useState }     from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { BADGES }                  from '@/lib/gamification/badges'

export interface LeaderboardEntry {
  rank:          number
  id:            string
  firstName:     string
  city:          string | null
  xpPoints:      number
  badges:        string[]
  tier:          string | null
  isYou:         boolean
  bestQuizScore: number | null
}

interface Props {
  initialRows: LeaderboardEntry[]
  myEntry:     LeaderboardEntry
}

// ─── Motion helpers ─────────────────────────────────────────────────────────
type Bez = [number, number, number, number]
const EASE_OUT: Bez = [0.16, 1, 0.3, 1]

// ─── Rank medal colours ──────────────────────────────────────────────────────
const RANK_META = [
  {
    ring:     'rgba(255,215,0,0.7)',
    glow:     '0 0 32px rgba(255,200,0,0.5), 0 0 64px rgba(255,180,0,0.25)',
    avatarBg: 'linear-gradient(135deg,#FFE566,#FFB800,#CC8800)',
    label:    'GOLD',
    height:   156,
  },
  {
    ring:     'rgba(200,200,220,0.6)',
    glow:     '0 0 24px rgba(192,192,220,0.4)',
    avatarBg: 'linear-gradient(135deg,#E8E8F0,#B0B0C0,#888898)',
    label:    'SILVER',
    height:   120,
  },
  {
    ring:     'rgba(205,127,50,0.6)',
    glow:     '0 0 20px rgba(205,127,50,0.35)',
    avatarBg: 'linear-gradient(135deg,#E0A060,#A06020,#805010)',
    label:    'BRONZE',
    height:   96,
  },
] as const

// ─── Quiz score chip ─────────────────────────────────────────────────────────
function QuizChip({ score, size = 'sm' }: { score: number; size?: 'sm' | 'xs' }) {
  const isPerfect = score === 10
  const fontSize  = size === 'xs' ? 9 : 10
  const px        = size === 'xs' ? '1.5px 5px' : '2px 7px'
  return (
    <span
      style={{
        fontFamily:   'var(--font-mono)',
        fontSize,
        fontWeight:   700,
        padding:      px,
        borderRadius: 99,
        background:   isPerfect ? 'rgba(255,184,0,0.14)' : 'rgba(96,165,250,0.12)',
        color:        isPerfect ? 'var(--brand)'          : 'var(--blue)',
        border:       isPerfect ? '1px solid rgba(255,184,0,0.3)' : '1px solid rgba(96,165,250,0.3)',
        whiteSpace:   'nowrap',
      }}
    >
      {isPerfect ? '🎯' : '⭐'} {score}/10
    </span>
  )
}

// ─── Avatar circle ───────────────────────────────────────────────────────────
function Avatar({
  name, size, bg, textColor = '#000', fontSize = 16,
}: {
  name: string; size: number; bg: string; textColor?: string; fontSize?: number
}) {
  return (
    <div
      style={{
        width:          size,
        height:         size,
        borderRadius:   '50%',
        background:     bg,
        display:        'flex',
        alignItems:     'center',
        justifyContent: 'center',
        flexShrink:     0,
        fontFamily:     'var(--font-heading)',
        fontWeight:     800,
        fontSize,
        color:          textColor,
        userSelect:     'none',
      }}
    >
      {name.charAt(0).toUpperCase()}
    </div>
  )
}

// ─── Animated crown ──────────────────────────────────────────────────────────
function CrownIcon({ size = 28 }: { size?: number }) {
  return (
    <svg width={size} height={size * 0.75} viewBox="0 0 40 30" fill="none" xmlns="http://www.w3.org/2000/svg">
      <defs>
        <linearGradient id="cg1" x1="0" y1="0" x2="40" y2="30" gradientUnits="userSpaceOnUse">
          <stop offset="0%"   stopColor="#FFE566" />
          <stop offset="45%"  stopColor="#FFB800" />
          <stop offset="100%" stopColor="#CC8000" />
        </linearGradient>
        <filter id="glow-crown">
          <feGaussianBlur stdDeviation="2" result="blur" />
          <feMerge><feMergeNode in="blur"/><feMergeNode in="SourceGraphic"/></feMerge>
        </filter>
      </defs>
      <path d="M4 26 L4 18 L12 8 L20 18 L28 4 L36 18 L36 26 Z" fill="url(#cg1)" filter="url(#glow-crown)" />
      <circle cx="4"  cy="18" r="2.5" fill="#FF4444" />
      <circle cx="20" cy="18" r="2.5" fill="#44AAFF" />
      <circle cx="36" cy="18" r="2.5" fill="#44FF88" />
      <circle cx="28" cy="4"  r="2"   fill="#FF4444" opacity="0.9" />
      <rect x="2" y="25" width="36" height="3" rx="1.5" fill="#CC8000" />
    </svg>
  )
}

// ─── Mini XP bar ─────────────────────────────────────────────────────────────
const MAX_XP = 2350
function MiniXPBar({ xp, isYou }: { xp: number; isYou: boolean }) {
  const pct = Math.min(xp / MAX_XP, 1)
  return (
    <div style={{ height: 3, background: 'var(--bg-float)', borderRadius: 99, overflow: 'hidden', width: 60 }}>
      <motion.div
        style={{
          height:          '100%',
          borderRadius:    99,
          background:      isYou
            ? 'var(--brand)'
            : 'linear-gradient(90deg,rgba(255,184,0,0.5),rgba(255,184,0,0.2))',
          transformOrigin: 'left',
        }}
        initial={{ scaleX: 0 }}
        animate={{ scaleX: pct }}
        transition={{ duration: 1, ease: EASE_OUT, delay: 0.2 }}
      />
    </div>
  )
}

// ─── Badge Profile Sheet ──────────────────────────────────────────────────────
const ALL_BADGE_ENTRIES = Object.entries(BADGES) as [
  keyof typeof BADGES,
  (typeof BADGES)[keyof typeof BADGES]
][]

function BadgeProfileSheet({
  entry,
  onClose,
}: {
  entry: LeaderboardEntry
  onClose: () => void
}) {
  const earnedSet = new Set(entry.badges)

  return (
    <>
      {/* Backdrop */}
      <motion.div
        className="fixed inset-0 z-40"
        style={{ background: 'rgba(0,0,0,0.75)', backdropFilter: 'blur(4px)' }}
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        transition={{ duration: 0.2 }}
        onClick={onClose}
      />

      {/* Sheet */}
      <motion.div
        className="fixed bottom-0 left-0 right-0 z-50 rounded-t-3xl safe-bottom"
        style={{
          background:    'var(--bg-raised)',
          border:        '1px solid var(--border-subtle)',
          borderBottom:  'none',
          maxHeight:     '82vh',
          overflowY:     'auto',
        }}
        initial={{ y: '100%' }}
        animate={{ y: 0 }}
        exit={{ y: '100%' }}
        transition={{ type: 'spring', damping: 28, stiffness: 320 }}
      >
        {/* Drag handle */}
        <div className="flex justify-center pt-3 pb-1">
          <div style={{ width: 36, height: 4, borderRadius: 99, background: 'var(--border-soft)' }} />
        </div>

        {/* User header */}
        <div className="flex items-center gap-3 px-5 py-3">
          <div
            style={{
              width: 52, height: 52, borderRadius: '50%',
              background:   entry.isYou ? 'rgba(255,184,0,0.18)' : 'var(--bg-float)',
              border:       entry.isYou ? '2px solid rgba(255,184,0,0.35)' : '1px solid var(--border-subtle)',
              display:      'flex', alignItems: 'center', justifyContent: 'center',
              fontFamily:   'var(--font-heading)', fontWeight: 800, fontSize: 20,
              color:        entry.isYou ? 'var(--brand)' : 'var(--text-3)',
              flexShrink:   0,
            }}
          >
            {entry.firstName.charAt(0).toUpperCase()}
          </div>

          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 flex-wrap">
              <p className="font-heading font-bold text-base" style={{ color: 'var(--text-1)' }}>
                {entry.firstName}
              </p>
              {entry.isYou && (
                <span
                  className="font-mono text-[9px] px-1.5 py-0.5 rounded-full"
                  style={{ background: 'var(--brand)', color: '#000', fontWeight: 700 }}
                >
                  YOU
                </span>
              )}
              <span className="font-mono text-[10px]" style={{ color: 'var(--text-4)' }}>
                #{entry.rank}
              </span>
            </div>
            <div className="flex items-center gap-2 mt-1 flex-wrap">
              <span className="font-mono text-xs font-bold" style={{ color: 'var(--text-brand)' }}>
                ⚡ {entry.xpPoints.toLocaleString('en-IN')} XP
              </span>
              {entry.bestQuizScore !== null && (
                <QuizChip score={entry.bestQuizScore} />
              )}
            </div>
          </div>

          <button
            onClick={onClose}
            style={{
              width: 32, height: 32, borderRadius: '50%',
              background: 'var(--bg-float)', border: '1px solid var(--border-subtle)',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              flexShrink: 0, color: 'var(--text-3)', fontSize: 13, cursor: 'pointer',
            }}
          >
            ✕
          </button>
        </div>

        <div style={{ borderBottom: '1px solid var(--border-faint)', margin: '0 20px 16px' }} />

        {/* Badges label */}
        <p
          className="font-mono text-[10px] tracking-[0.18em] uppercase px-5 mb-3"
          style={{ color: 'var(--text-4)' }}
        >
          Badges · {entry.badges.length} earned
        </p>

        {/* 3×3 badge grid */}
        <div className="grid grid-cols-3 gap-2.5 px-5 pb-8">
          {ALL_BADGE_ENTRIES.map(([key, badge]) => {
            const earned = earnedSet.has(key)
            return (
              <div
                key={key}
                className="flex flex-col items-center gap-1.5 rounded-2xl p-3"
                style={{
                  background: earned ? `${badge.color}10` : 'var(--bg-card)',
                  border:     `1px solid ${earned ? `${badge.color}28` : 'var(--border-faint)'}`,
                  opacity:    earned ? 1 : 0.38,
                }}
              >
                <span style={{ fontSize: 28, lineHeight: 1 }}>{badge.emoji}</span>
                <p
                  className="font-mono text-center leading-tight"
                  style={{ fontSize: 9, color: earned ? badge.color : 'var(--text-4)', textTransform: 'uppercase', letterSpacing: '0.04em' }}
                >
                  {badge.id.replace(/_/g, ' ')}
                </p>
                {earned ? (
                  <span
                    style={{
                      fontFamily: 'var(--font-mono)', fontSize: 9,
                      color: 'var(--green)', fontWeight: 700,
                    }}
                  >
                    +{badge.xp} XP
                  </span>
                ) : (
                  <span style={{ fontFamily: 'var(--font-mono)', fontSize: 9, color: 'var(--text-4)' }}>
                    locked
                  </span>
                )}
              </div>
            )
          })}
        </div>
      </motion.div>
    </>
  )
}

// ─── Top 3 Podium ────────────────────────────────────────────────────────────
function Podium({
  top3,
  isYouFn,
  onSelect,
}: {
  top3:     LeaderboardEntry[]
  isYouFn:  (id: string) => boolean
  onSelect: (entry: LeaderboardEntry) => void
}) {
  const order      = [top3[1], top3[0], top3[2]].filter(Boolean)
  const visualRanks = [1, 0, 2]

  return (
    <div className="flex items-end justify-center gap-2 pt-8 pb-2">
      {order.map((entry, vi) => {
        const meta   = RANK_META[entry.rank - 1]
        const isFirst = entry.rank === 1
        const isYou   = isYouFn(entry.id)
        const badgeCount = entry.badges.length

        return (
          <motion.div
            key={entry.id}
            className="flex flex-col items-center gap-2"
            style={{ width: 100, cursor: 'pointer' }}
            initial={{ opacity: 0, y: 40 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, ease: EASE_OUT, delay: vi * 0.12 }}
            onClick={() => onSelect(entry)}
            whileTap={{ scale: 0.96 }}
          >
            {/* Crown above #1 */}
            {isFirst && (
              <motion.div
                animate={{ y: [-3, 3, -3], rotate: [-4, 4, -4] }}
                transition={{ duration: 2.8, repeat: Infinity, ease: 'easeInOut' }}
                style={{ marginBottom: -4, zIndex: 1 }}
              >
                <CrownIcon size={32} />
              </motion.div>
            )}

            {/* Avatar with glow ring */}
            <div style={{ position: 'relative' }}>
              {isFirst && (
                <motion.div
                  style={{
                    position:     'absolute',
                    inset:        -6,
                    borderRadius: '50%',
                    background:   'transparent',
                    border:       '2px solid rgba(255,215,0,0.6)',
                    boxShadow:    meta.glow,
                  }}
                  animate={{ opacity: [0.6, 1, 0.6] }}
                  transition={{ duration: 2, repeat: Infinity }}
                />
              )}
              <Avatar
                name={entry.firstName}
                size={isFirst ? 60 : 48}
                bg={meta.avatarBg}
                textColor={isFirst ? '#000' : '#fff'}
                fontSize={isFirst ? 22 : 17}
              />
              {isYou && (
                <div
                  style={{
                    position:   'absolute', bottom: -2, right: -2,
                    background: 'var(--brand)', borderRadius: 99,
                    padding:    '1px 5px',
                    fontSize:   8, fontFamily: 'var(--font-mono)', color: '#000', fontWeight: 700,
                  }}
                >
                  YOU
                </div>
              )}
            </div>

            {/* Name + city */}
            <div className="text-center px-1">
              <p className="font-heading font-bold text-sm leading-tight truncate" style={{ color: 'var(--text-1)', maxWidth: 96 }}>
                {entry.firstName}
              </p>
              {entry.city && (
                <p className="font-mono text-[9px] mt-0.5 truncate" style={{ color: 'var(--text-4)', maxWidth: 96 }}>
                  {entry.city}
                </p>
              )}
            </div>

            {/* XP chip */}
            <div
              style={{
                background:   'rgba(255,184,0,0.08)',
                border:       `1px solid ${meta.ring}`,
                borderRadius: 99,
                padding:      '3px 10px',
                fontFamily:   'var(--font-mono)',
                fontSize:     11,
                fontWeight:   700,
                color:        isFirst ? '#FFD700' : 'var(--text-brand)',
                boxShadow:    isFirst ? meta.glow : 'none',
              }}
            >
              ⚡ {entry.xpPoints.toLocaleString('en-IN')}
            </div>

            {/* Quiz score chip */}
            {entry.bestQuizScore !== null && (
              <QuizChip score={entry.bestQuizScore} size="xs" />
            )}

            {/* Badge emojis */}
            {badgeCount > 0 && (
              <p style={{ fontSize: 13, lineHeight: 1, letterSpacing: -2 }}>
                {entry.badges.slice(0, 4).map(id => BADGES[id as keyof typeof BADGES]?.emoji ?? '').join('')}
                {badgeCount > 4 && (
                  <span style={{ fontSize: 9, fontFamily: 'var(--font-mono)', color: 'var(--text-4)' }}>
                    +{badgeCount - 4}
                  </span>
                )}
              </p>
            )}

            {/* Podium base */}
            <div
              style={{
                width:          88,
                height:         meta.height,
                background:     isFirst
                  ? 'linear-gradient(180deg,rgba(255,184,0,0.20) 0%,rgba(255,184,0,0.08) 100%)'
                  : 'var(--bg-card)',
                border:         `1px solid ${meta.ring}`,
                borderBottom:   'none',
                borderRadius:   '10px 10px 0 0',
                display:        'flex',
                alignItems:     'flex-start',
                justifyContent: 'center',
                paddingTop:     10,
                boxShadow:      meta.glow,
              }}
            >
              <span
                style={{
                  fontFamily: 'var(--font-display)',
                  fontSize:   isFirst ? 28 : 22,
                  color:      isFirst ? '#FFD700' : entry.rank === 2 ? '#C0C0D0' : '#A07040',
                  lineHeight: 1,
                  opacity:    0.8,
                }}
              >
                #{entry.rank}
              </span>
            </div>
          </motion.div>
        )
      })}
    </div>
  )
}

// ─── Main component ───────────────────────────────────────────────────────────

export function LeaderboardClient({ initialRows, myEntry }: Props) {
  const [rows, setRows]               = useState<LeaderboardEntry[]>(initialRows)
  const [lastUpdated, setLastUpdated] = useState<Date | null>(null)
  const [isConnected, setIsConnected] = useState(false)
  const [selectedEntry, setSelectedEntry] = useState<LeaderboardEntry | null>(null)

  // SSE live updates
  useEffect(() => {
    let es: EventSource
    try {
      es = new EventSource('/api/leaderboard/stream')
      es.onopen = () => setIsConnected(true)
      es.onmessage = (e: MessageEvent) => {
        try {
          const payload = JSON.parse(e.data) as { type: string; data: unknown }
          if (payload.type === 'init' || payload.type === 'update') {
            const data = payload.data
            // Only accept data that is a properly shaped LeaderboardEntry array
            if (
              Array.isArray(data) &&
              data.length > 0 &&
              typeof (data[0] as LeaderboardEntry).xpPoints === 'number'
            ) {
              setRows(data as LeaderboardEntry[])
              setLastUpdated(new Date())
            }
          }
        } catch { /* ignore parse errors */ }
      }
      es.onerror = () => { setIsConnected(false); es?.close() }
    } catch { /* SSE unavailable */ }
    return () => es?.close()
  }, [])

  const isYouFn = (id: string) => id === myEntry.id
  const top3    = rows.slice(0, 3)
  const rest    = rows.slice(3)
  const myInTop = rows.some(r => r.isYou)

  const totalXP = rows.reduce((s, r) => s + r.xpPoints, 0)
  const cities  = new Set(rows.filter(r => r.city).map(r => r.city)).size

  return (
    <div className="space-y-4 pb-4">

      {/* ── Stats row ────────────────────────────────────────────────────── */}
      <div className="grid grid-cols-3 gap-2">
        {[
          { value: rows.length.toLocaleString('en-IN'), label: 'Builders' },
          { value: `⚡ ${(totalXP / 1000).toFixed(1)}K`,  label: 'Total XP' },
          { value: cities.toString(),                     label: 'Cities' },
        ].map(({ value, label }, i) => (
          <motion.div
            key={label}
            className="rounded-2xl p-3 flex flex-col items-center gap-0.5"
            style={{ background: 'var(--bg-card)', border: '1px solid var(--border-faint)' }}
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.45, ease: EASE_OUT, delay: i * 0.07 }}
          >
            <span className="font-display text-lg leading-none" style={{ color: 'var(--brand)' }}>
              {value}
            </span>
            <span className="font-mono text-[9px] uppercase tracking-[0.12em]" style={{ color: 'var(--text-4)' }}>
              {label}
            </span>
          </motion.div>
        ))}
      </div>

      {/* ── Your rank — pinned ───────────────────────────────────────────── */}
      <motion.div
        className="rounded-2xl p-4 flex items-center gap-3"
        style={{ background: 'rgba(255,184,0,0.06)', border: '2px solid rgba(255,184,0,0.25)', cursor: 'pointer' }}
        initial={{ opacity: 0, x: -16 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ duration: 0.5, ease: EASE_OUT, delay: 0.1 }}
        onClick={() => setSelectedEntry(myEntry)}
        whileTap={{ scale: 0.98 }}
      >
        <div
          style={{
            width: 44, height: 44, borderRadius: '50%',
            background:   'rgba(255,184,0,0.15)',
            border:       '2px solid rgba(255,184,0,0.4)',
            display:      'flex', alignItems: 'center', justifyContent: 'center',
            fontFamily:   'var(--font-display)',
            fontSize:     16,
            color:        'var(--brand)',
            flexShrink:   0,
          }}
        >
          #{myEntry.rank}
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-1.5 flex-wrap">
            <p className="font-heading font-bold text-sm" style={{ color: 'var(--text-1)' }}>
              {myEntry.firstName}
            </p>
            <span
              className="font-mono text-[9px] px-1.5 py-0.5 rounded-full"
              style={{ background: 'var(--brand)', color: '#000' }}
            >
              YOU
            </span>
            {myEntry.city && (
              <span className="font-mono text-[10px]" style={{ color: 'var(--text-4)' }}>
                📍 {myEntry.city}
              </span>
            )}
          </div>
          <div className="flex items-center gap-2 mt-0.5 flex-wrap">
            <p className="font-mono text-[11px]" style={{ color: 'var(--text-brand)' }}>
              ⚡ {myEntry.xpPoints.toLocaleString('en-IN')} XP
            </p>
            {myEntry.bestQuizScore !== null && (
              <QuizChip score={myEntry.bestQuizScore} size="xs" />
            )}
            <p className="font-mono text-[11px]" style={{ color: 'var(--text-4)' }}>
              {myEntry.badges.length} badge{myEntry.badges.length !== 1 ? 's' : ''}
            </p>
          </div>
        </div>
        {myEntry.badges.length > 0 && (
          <p style={{ fontSize: 16, flexShrink: 0 }}>
            {myEntry.badges.slice(0, 3).map(id => BADGES[id as keyof typeof BADGES]?.emoji ?? '').join('')}
          </p>
        )}
      </motion.div>

      {/* ── Podium — top 3 ──────────────────────────────────────────────── */}
      {top3.length > 0 && (
        <div
          className="rounded-2xl overflow-hidden"
          style={{
            background: 'linear-gradient(180deg, rgba(255,184,0,0.04) 0%, var(--bg-card) 60%)',
            border:     '1px solid var(--border-faint)',
          }}
        >
          <div className="flex items-center justify-between px-5 pt-4">
            <p className="font-mono text-[10px] tracking-[0.2em] uppercase" style={{ color: 'var(--text-brand)' }}>
              🏆 Top Builders
            </p>
            <div className="flex items-center gap-1.5">
              <span
                className="w-1.5 h-1.5 rounded-full"
                style={{
                  background: isConnected ? 'var(--green)' : 'var(--text-4)',
                  animation:  isConnected ? 'pulse 2s infinite' : 'none',
                }}
              />
              <span className="font-mono text-[10px]" style={{ color: isConnected ? 'var(--green)' : 'var(--text-4)' }}>
                {isConnected ? 'LIVE' : 'STATIC'}
              </span>
            </div>
          </div>

          <Podium top3={top3} isYouFn={isYouFn} onSelect={setSelectedEntry} />
        </div>
      )}

      {/* ── GLOBAL RANKINGS header ───────────────────────────────────────── */}
      {rest.length > 0 && (
        <div className="flex items-center gap-3 px-1 mt-2">
          <div style={{ flex: 1, height: 1, background: 'var(--border-faint)' }} />
          <p className="font-mono text-[10px] tracking-[0.25em] uppercase" style={{ color: 'var(--text-4)' }}>
            Global Rankings
          </p>
          <div style={{ flex: 1, height: 1, background: 'var(--border-faint)' }} />
        </div>
      )}

      {/* ── Full list — ranks 4–50 ───────────────────────────────────────── */}
      {rest.length > 0 && (
        <div
          className="rounded-2xl overflow-hidden"
          style={{ background: 'var(--bg-card)', border: '1px solid var(--border-faint)' }}
        >
          {/* Table header */}
          <div
            className="flex items-center gap-3 px-4 py-2.5"
            style={{ borderBottom: '1px solid var(--border-faint)' }}
          >
            <span className="font-mono text-[9px] uppercase tracking-[0.15em] w-8 text-right shrink-0" style={{ color: 'var(--text-4)' }}>#</span>
            <span className="font-mono text-[9px] uppercase tracking-[0.15em] flex-1" style={{ color: 'var(--text-4)' }}>Builder</span>
            <span className="font-mono text-[9px] uppercase tracking-[0.15em] text-right" style={{ color: 'var(--text-4)' }}>XP</span>
          </div>

          <div className="divide-y" style={{ borderColor: 'var(--border-faint)' }}>
            {rest.map((entry, i) => (
              <motion.div
                key={entry.id}
                className="flex items-center gap-3 px-4 py-3"
                style={{
                  borderLeft:  entry.isYou ? '3px solid var(--brand)' : '3px solid transparent',
                  background:  entry.isYou ? 'rgba(255,184,0,0.04)' : 'transparent',
                  cursor:      'pointer',
                }}
                initial={{ opacity: 0, x: -8 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.35, ease: EASE_OUT, delay: Math.min(i * 0.025, 0.5) }}
                onClick={() => setSelectedEntry(entry)}
                whileTap={{ scale: 0.985, backgroundColor: 'rgba(255,255,255,0.02)' }}
              >
                {/* Rank */}
                <span
                  className="font-mono text-[11px] w-8 text-right shrink-0"
                  style={{ color: 'var(--text-4)' }}
                >
                  {entry.rank}
                </span>

                {/* Avatar */}
                <Avatar
                  name={entry.firstName}
                  size={34}
                  bg={entry.isYou ? 'rgba(255,184,0,0.2)' : 'var(--bg-float)'}
                  textColor={entry.isYou ? 'var(--brand)' : 'var(--text-3)'}
                  fontSize={13}
                />

                {/* Name + city + xp bar */}
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-1.5 flex-wrap">
                    <p className="font-heading font-semibold text-sm truncate" style={{ color: entry.isYou ? 'var(--text-1)' : 'var(--text-2)' }}>
                      {entry.firstName}
                    </p>
                    {entry.isYou && (
                      <span
                        className="font-mono text-[9px] px-1.5 py-0.5 rounded-full"
                        style={{ background: 'var(--brand)', color: '#000', flexShrink: 0 }}
                      >
                        YOU
                      </span>
                    )}
                    {entry.tier === 'premium' && (
                      <span
                        className="font-mono text-[9px] px-1.5 py-0.5 rounded-full"
                        style={{ background: 'rgba(192,132,252,0.12)', color: 'var(--purple)', border: '1px solid rgba(192,132,252,0.25)', flexShrink: 0 }}
                      >
                        PRO+
                      </span>
                    )}
                  </div>
                  <div className="flex items-center gap-2 mt-0.5">
                    {entry.city && (
                      <p className="font-mono text-[10px] truncate" style={{ color: 'var(--text-4)', maxWidth: 80 }}>
                        {entry.city}
                      </p>
                    )}
                    <MiniXPBar xp={entry.xpPoints} isYou={entry.isYou} />
                  </div>
                </div>

                {/* Right: quiz score + XP + badges */}
                <div className="text-right shrink-0 flex flex-col items-end gap-0.5">
                  {entry.bestQuizScore !== null && (
                    <QuizChip score={entry.bestQuizScore} size="xs" />
                  )}
                  <p className="font-mono text-sm font-bold" style={{ color: entry.isYou ? 'var(--brand)' : 'var(--text-2)' }}>
                    {entry.xpPoints.toLocaleString('en-IN')}
                  </p>
                  {entry.badges.length > 0 && (
                    <p style={{ fontSize: 12, lineHeight: 1, letterSpacing: -1 }}>
                      {entry.badges.slice(0, 4).map(id => BADGES[id as keyof typeof BADGES]?.emoji ?? '').join('')}
                      {entry.badges.length > 4 && (
                        <span style={{ fontSize: 9, fontFamily: 'var(--font-mono)', color: 'var(--text-4)' }}>
                          +{entry.badges.length - 4}
                        </span>
                      )}
                    </p>
                  )}
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      )}

      {/* ── Not in top 50 ────────────────────────────────────────────────── */}
      {!myInTop && (
        <div
          className="rounded-2xl border p-4 text-center"
          style={{ background: 'var(--bg-card)', borderColor: 'var(--border-faint)' }}
        >
          <p className="font-heading font-semibold text-sm mb-1" style={{ color: 'var(--text-2)' }}>
            You&apos;re ranked #{myEntry.rank} globally
          </p>
          <p className="font-body text-xs" style={{ color: 'var(--text-4)' }}>
            Complete workshops and submit your project to climb the board 🚀
          </p>
        </div>
      )}

      {/* ── Footer ───────────────────────────────────────────────────────── */}
      <div className="flex items-center justify-between px-1">
        <p className="font-mono text-[10px]" style={{ color: 'var(--text-4)' }}>
          Top {rows.length} builders · {rows.length === 50 ? 'top 50 shown' : 'all shown'}
        </p>
        <p className="font-mono text-[10px]" style={{ color: 'var(--text-4)' }}>
          {lastUpdated ? lastUpdated.toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit', second: '2-digit' }) : ''}
        </p>
      </div>

      {/* ── Badge profile sheet ───────────────────────────────────────────── */}
      <AnimatePresence>
        {selectedEntry && (
          <BadgeProfileSheet
            entry={selectedEntry}
            onClose={() => setSelectedEntry(null)}
          />
        )}
      </AnimatePresence>

    </div>
  )
}
