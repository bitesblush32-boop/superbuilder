'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { motion } from 'framer-motion'

type Bez = [number, number, number, number]
const EASE_OUT: Bez = [0.16, 1, 0.3, 1]

interface TeamMember {
  id:       string
  fullName: string
  grade:    string
  isPaid:   boolean
  teamRole: string | null
}

interface TeamData {
  id:          string
  name:        string
  code:        string
  memberCount: number
  members:     TeamMember[]
}

interface PlanSelectProps {
  memberCount: 1 | 2 | 3
  teamData:    TeamData | null
}

// Flat-rate pricing
const PLAN_PRICES: Record<number, number> = {
  1: 3499,
  2: 6000,
  3: 9000,
}

function getPlanLabel(n: number) {
  if (n === 2) return 'Team of 2'
  if (n >= 3)  return 'Team of 3'
  return 'Solo Builder'
}

function getCostPerPerson(total: number, n: number) {
  return Math.round(total / n)
}

const PLAN_FEATURES = [
  'Full programme access',
  '3 live workshops',
  'Hackathon participation',
  'Certificate of completion',
  'Digital badge',
  'Community Discord access',
]

export function PlanSelect({ memberCount, teamData }: PlanSelectProps) {
  const router = useRouter()
  const [navigating, setNavigating] = useState(false)
  const [showManage, setShowManage]  = useState(false)

  const totalPrice  = PLAN_PRICES[memberCount] ?? PLAN_PRICES[1]
  const perPerson   = getCostPerPerson(totalPrice, memberCount)
  const planLabel   = getPlanLabel(memberCount)
  const isTeam      = memberCount >= 2

  function proceed() {
    setNavigating(true)
    setTimeout(() => router.push('/register/stage-3/pay'), 180)
  }

  return (
    <div className="pb-10 max-w-lg mx-auto">
      {/* Header */}
      <div className="mb-8">
        <h1
          className="font-display leading-none tracking-wider mb-2"
          style={{ fontSize: '2.6rem', color: 'var(--text-1)' }}
        >
          YOUR PLAN
        </h1>
        <p className="font-body text-sm" style={{ color: 'var(--text-3)' }}>
          {isTeam
            ? `You're in a team of ${memberCount}. Each member pays separately from their own dashboard.`
            : 'You\'re going solo. You can join or create a team any time before paying.'}
        </p>
      </div>

      {/* Plan card */}
      <motion.div
        className="rounded-2xl p-6 mb-4"
        style={{
          background: 'var(--bg-card)',
          border: isTeam ? '2px solid rgba(255,184,0,0.45)' : '1px solid var(--border-subtle)',
          boxShadow: isTeam ? '0 0 40px rgba(255,184,0,0.1)' : 'none',
        }}
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0, transition: { duration: 0.38, ease: EASE_OUT } }}
      >
        {/* Plan label + badge */}
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <span className="text-2xl">{isTeam ? '👥' : '🦅'}</span>
            <h2 className="font-display text-3xl tracking-wide" style={{ color: isTeam ? 'var(--brand)' : 'var(--text-1)' }}>
              {planLabel.toUpperCase()}
            </h2>
          </div>
          {isTeam && (
            <span
              className="font-mono text-[11px] px-2 py-1 rounded-full"
              style={{ background: 'rgba(255,184,0,0.12)', color: 'var(--text-brand)' }}
            >
              {memberCount} members
            </span>
          )}
        </div>

        {/* Price breakdown */}
        <div
          className="rounded-xl p-4 mb-5 flex items-center justify-between gap-4"
          style={{ background: 'var(--bg-float)', border: '1px solid var(--border-subtle)' }}
        >
          <div>
            <p className="font-mono text-[11px] tracking-[0.15em] uppercase mb-1" style={{ color: 'var(--text-4)' }}>
              {isTeam ? 'Your share' : 'Total'}
            </p>
            <p className="font-display text-4xl tracking-tight" style={{ color: 'var(--text-1)' }}>
              ₹{perPerson.toLocaleString('en-IN')}
            </p>
            <p className="font-body text-xs mt-0.5" style={{ color: 'var(--text-3)' }}>
              excl. GST
            </p>
          </div>
          {isTeam && (
            <div className="text-right">
              <p className="font-mono text-[11px] tracking-[0.15em] uppercase mb-1" style={{ color: 'var(--text-4)' }}>
                Team total
              </p>
              <p className="font-display text-2xl tracking-tight" style={{ color: 'var(--text-3)' }}>
                ₹{totalPrice.toLocaleString('en-IN')}
              </p>
              <p className="font-body text-xs mt-0.5" style={{ color: 'var(--text-4)' }}>
                ÷ {memberCount} members
              </p>
            </div>
          )}
        </div>

        {/* Features */}
        <ul className="flex flex-col gap-2.5 mb-5">
          {PLAN_FEATURES.map(f => (
            <li key={f} className="flex items-center gap-2.5">
              <span className="font-mono text-sm shrink-0" style={{ color: 'var(--brand)' }}>✓</span>
              <span className="font-body text-sm" style={{ color: 'var(--text-2)' }}>{f}</span>
            </li>
          ))}
        </ul>

        {/* Team members list */}
        {teamData && (
          <div
            className="rounded-xl overflow-hidden mb-1"
            style={{ border: '1px solid var(--border-faint)' }}
          >
            <div className="px-4 py-2.5" style={{ background: 'var(--bg-inset)', borderBottom: '1px solid var(--border-faint)' }}>
              <p className="font-mono text-[11px] tracking-[0.12em] uppercase" style={{ color: 'var(--text-4)' }}>
                Team · {teamData.name}
              </p>
            </div>
            {teamData.members.map((m, i) => (
              <div
                key={m.id}
                className="flex items-center justify-between px-4 py-3"
                style={{ borderBottom: i < teamData.members.length - 1 ? '1px solid var(--border-faint)' : 'none' }}
              >
                <div className="flex items-center gap-2.5">
                  <div
                    className="h-7 w-7 rounded-full flex items-center justify-center shrink-0 font-heading font-bold text-xs"
                    style={{ background: 'var(--bg-float)', color: 'var(--text-brand)' }}
                  >
                    {m.fullName.charAt(0)}
                  </div>
                  <div>
                    <p className="font-body text-sm font-medium" style={{ color: 'var(--text-1)' }}>{m.fullName}</p>
                    <p className="font-mono text-[10px]" style={{ color: 'var(--text-4)' }}>
                      {m.teamRole === 'leader' ? 'Leader' : 'Member'} · Class {m.grade}
                    </p>
                  </div>
                </div>
                <span
                  className="font-mono text-[11px] px-2 py-0.5 rounded-full"
                  style={{
                    background: m.isPaid ? 'rgba(34,197,94,0.1)' : 'var(--bg-float)',
                    color: m.isPaid ? 'var(--green)' : 'var(--text-4)',
                    border: `1px solid ${m.isPaid ? 'rgba(34,197,94,0.25)' : 'var(--border-subtle)'}`,
                  }}
                >
                  {m.isPaid ? '✓ Paid' : 'Pending'}
                </span>
              </div>
            ))}
          </div>
        )}

        {/* Manage team link */}
        <button
          type="button"
          onClick={() => router.push('/register/team')}
          className="w-full text-center font-body text-xs py-2 mt-2 rounded-lg transition-colors"
          style={{ color: 'var(--text-3)', background: 'var(--bg-float)', border: '1px solid var(--border-faint)' }}
        >
          {isTeam ? '⚙ Manage / Leave Team' : '+ Join or Create a Team'}
        </button>
      </motion.div>

      {/* CTA */}
      <motion.button
        disabled={navigating}
        onClick={proceed}
        whileTap={!navigating ? { scale: 0.98 } : {}}
        className="w-full rounded-2xl font-heading font-bold text-lg tracking-wide min-h-[56px] transition-all disabled:opacity-50 flex items-center justify-center gap-2"
        style={{ background: 'linear-gradient(135deg,#FFB800,#FFCF40)', color: '#000', boxShadow: 'var(--shadow-brand)' }}
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0, transition: { duration: 0.38, ease: EASE_OUT, delay: 0.1 } }}
      >
        {navigating ? 'Loading…' : `Proceed to Pay ₹${perPerson.toLocaleString('en-IN')} →`}
      </motion.button>

      <p className="text-center font-body text-xs mt-3" style={{ color: 'var(--text-4)' }}>
        {isTeam
          ? `Each team member pays ₹${perPerson.toLocaleString('en-IN')} from their own dashboard`
          : 'You can update your team before paying'}
      </p>

      {/* Trust bar */}
      <motion.div
        className="rounded-xl px-4 py-4 flex flex-wrap gap-x-5 gap-y-2 justify-center mt-6"
        style={{ background: 'var(--bg-card)', border: '1px solid var(--border-faint)' }}
        initial={{ opacity: 0 }}
        animate={{ opacity: 1, transition: { duration: 0.5, delay: 0.2 } }}
      >
        {[
          { icon: '🔒', text: 'Safe & Secure' },
          { icon: '✅', text: 'zer0.pro Verified' },
          { icon: '💰', text: 'Full refund if programme doesn\'t start' },
          { icon: '📞', text: 'Parent helpline available' },
        ].map(({ icon, text }) => (
          <span key={text} className="font-body text-xs flex items-center gap-1.5" style={{ color: 'var(--text-2)' }}>
            <span>{icon}</span>
            <span>{text}</span>
          </span>
        ))}
      </motion.div>
    </div>
  )
}
