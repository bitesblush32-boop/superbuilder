'use client'

import { motion } from 'framer-motion'
import { BADGES } from '@/lib/gamification/badges'

const XP_THRESHOLDS = [0, 50, 150, 350, 550, 750, 1050, 1350, 1850, 2350]
const ALL_BADGES    = Object.values(BADGES)

function badgeName(id: string) {
  return id.split('_').map(w => w.charAt(0).toUpperCase() + w.slice(1)).join(' ')
}

interface Props {
  xpPoints:      number
  earnedBadgeIds: string[]
}

export function XPSection({ xpPoints, earnedBadgeIds }: Props) {
  const earnedSet     = new Set(earnedBadgeIds)
  const nextThreshold = XP_THRESHOLDS.find(t => t > xpPoints) ?? 2350
  const prevThreshold = [...XP_THRESHOLDS].reverse().find(t => t <= xpPoints) ?? 0
  const pct           = prevThreshold === nextThreshold
    ? 1
    : (xpPoints - prevThreshold) / (nextThreshold - prevThreshold)
  const earnedCount   = ALL_BADGES.filter(b => earnedSet.has(b.id)).length

  return (
    <div
      className="rounded-2xl p-5 space-y-4 border"
      style={{ background: 'var(--bg-card)', borderColor: 'var(--border-faint)' }}
    >
      {/* XP bar */}
      <div>
        <div className="flex items-center justify-between mb-2">
          <div className="flex items-center gap-2">
            <span className="font-display text-xl" style={{ color: 'var(--brand)' }}>
              ⚡ {xpPoints.toLocaleString('en-IN')}
            </span>
            <span className="font-mono text-[11px]" style={{ color: 'var(--text-3)' }}>XP</span>
          </div>
          <span className="font-mono text-[11px]" style={{ color: 'var(--text-4)' }}>
            {earnedCount} / {ALL_BADGES.length} badges · next at {nextThreshold.toLocaleString('en-IN')}
          </span>
        </div>
        <div className="h-2.5 rounded-full overflow-hidden" style={{ background: 'var(--bg-float)' }}>
          <motion.div
            className="h-full rounded-full origin-left"
            style={{
              background:  'linear-gradient(90deg, var(--brand-dim), var(--brand), var(--brand-bright))',
              willChange:  'transform',
            }}
            initial={{ scaleX: 0 }}
            animate={{ scaleX: pct }}
            transition={{ duration: 1.2, ease: [0.16, 1, 0.3, 1], delay: 0.1 }}
          />
        </div>
      </div>

      {/* Badge shelf — horizontal scroll */}
      <div>
        <p className="font-mono text-[10px] tracking-[0.2em] uppercase mb-3" style={{ color: 'var(--text-4)' }}>
          Badges
        </p>
        <div className="flex overflow-x-auto snap-x snap-mandatory scrollbar-none gap-3 pb-1 -mx-1 px-1">
          {ALL_BADGES.map(badge => {
            const earned = earnedSet.has(badge.id)
            return (
              <div
                key={badge.id}
                className="snap-start flex-shrink-0 flex flex-col items-center gap-1.5 w-[68px]"
              >
                <div
                  className="w-14 h-14 rounded-full flex items-center justify-center text-2xl border-2 transition-all"
                  style={{
                    background:  earned ? `${badge.color}20` : 'var(--bg-float)',
                    borderColor: earned ? badge.color : 'var(--border-faint)',
                    opacity:     earned ? 1 : 0.35,
                    filter:      earned ? 'none' : 'grayscale(0.6)',
                    boxShadow:   earned ? `0 0 12px ${badge.color}40` : 'none',
                  }}
                >
                  {badge.emoji}
                </div>
                <p
                  className="font-mono text-[9px] text-center leading-tight"
                  style={{ color: earned ? 'var(--text-2)' : 'var(--text-4)' }}
                >
                  {badgeName(badge.id)}
                </p>
                <p className="font-mono text-[9px]" style={{ color: 'var(--text-brand)' }}>
                  +{badge.xp}
                </p>
              </div>
            )
          })}
        </div>
      </div>
    </div>
  )
}
