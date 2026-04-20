'use client'

import { useState } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import Script from 'next/script'
import { motion, AnimatePresence } from 'framer-motion'

type Bez = [number, number, number, number]
const EASE_OUT: Bez = [0.16, 1, 0.3, 1]

interface TeamMember {
  id: string; fullName: string; grade: string; city: string | null
  teamRole: string | null; isPaid: boolean; tier: string | null
}

interface TeamData {
  id: string; name: string; code: string; memberCount: number
  members: TeamMember[]
}

interface PayPageProps {
  studentId:   string
  fullName:    string
  email:       string
  phone:       string
  defaultTier: 'pro' | 'premium' | null  // kept for DB compat, not used in UI
  teamData:    TeamData | null
  discountPct: number                    // kept for DB compat, not used in new pricing
}

// Client-side price display only — server recomputes from DB before charging
const PLAN_PRICES: Record<number, number> = {
  1: 3499, // Solo Builder
  2: 6000, // Team of 2
  3: 9000, // Team of 3
}

function getPlanLabel(memberCount: number): string {
  if (memberCount === 2) return 'Team of 2'
  if (memberCount >= 3) return 'Team of 3'
  return 'Solo Builder'
}

function getPlanEmoji(memberCount: number): string {
  if (memberCount >= 2) return '👥'
  return '🦅'
}

declare global {
  interface Window {
    Razorpay: new (options: RazorpayOptions) => { open: () => void }
  }
}
interface RazorpayOptions {
  key:            string
  amount:         number
  currency:       string
  order_id:       string
  name:           string
  description:    string
  prefill?:       { name?: string; email?: string; contact?: string }
  theme?:         { color?: string }
  handler:        (response: { razorpay_order_id: string; razorpay_payment_id: string; razorpay_signature: string }) => void
  modal?:         { ondismiss?: () => void }
}

function TeamStatusBadge({ teamData }: { teamData: TeamData }) {
  const paidCount  = teamData.members.filter(m => m.isPaid).length
  const totalCount = teamData.memberCount

  return (
    <div
      className="rounded-2xl p-4 flex flex-col gap-3"
      style={{ background: 'rgba(255,184,0,0.06)', border: '1px solid rgba(255,184,0,0.25)' }}
    >
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <span className="text-base">👥</span>
          <p className="font-body text-sm font-semibold" style={{ color: 'var(--text-1)' }}>
            {teamData.name}
          </p>
          <span
            className="font-mono text-[10px] px-1.5 py-0.5 rounded"
            style={{ background: 'var(--bg-float)', color: 'var(--text-3)' }}
          >
            {teamData.code}
          </span>
        </div>
        <span
          className="font-mono text-xs px-2 py-0.5 rounded-full"
          style={{ background: 'rgba(255,184,0,0.12)', color: 'var(--text-brand)' }}
        >
          {totalCount} members
        </span>
      </div>
      {/* Payment progress bar */}
      <div className="flex items-center gap-2">
        <div className="flex-1 h-1.5 rounded-full overflow-hidden" style={{ background: 'var(--bg-float)' }}>
          <div
            className="h-full rounded-full transition-all"
            style={{ width: `${totalCount > 0 ? (paidCount / totalCount) * 100 : 0}%`, background: 'var(--green)' }}
          />
        </div>
        <p className="font-mono text-[11px] shrink-0" style={{ color: 'var(--text-3)' }}>
          {paidCount}/{totalCount} paid
        </p>
      </div>
    </div>
  )
}

export function PayPage({ studentId: _studentId, fullName, email, phone, teamData }: PayPageProps) {
  const router       = useRouter()
  const searchParams = useSearchParams()

  const [loading, setLoading]         = useState(false)
  const [scriptReady, setScriptReady] = useState(false)
  const [error, setError] = useState<string | null>(
    searchParams.get('error') ? decodeURIComponent(searchParams.get('error')!) : null
  )

  // Compute plan from team membership — mirrors what the server will do
  const memberCount  = Math.min(teamData?.memberCount ?? 1, 3) as 1 | 2 | 3
  const displayPrice = PLAN_PRICES[memberCount] ?? PLAN_PRICES[1]
  const planLabel    = getPlanLabel(memberCount)
  const planEmoji    = getPlanEmoji(memberCount)
  const isTeam       = memberCount >= 2

  async function handlePay() {
    if (!scriptReady) return
    setLoading(true)
    setError(null)

    try {
      // Server determines the final amount from DB — nothing price-sensitive is sent
      const res = await fetch('/api/payments/create-order', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({}),
      })

      if (!res.ok) {
        const { error: msg } = await res.json()
        throw new Error(msg ?? 'Failed to create order')
      }

      const { orderId, amount, keyId } = await res.json()

      const rzp = new window.Razorpay({
        key:         keyId,
        amount,
        currency:    'INR',
        order_id:    orderId,
        name:        'Super Builders',
        description: `${planLabel} — School Edition Season 1`,
        prefill:     { name: fullName, email, contact: phone },
        theme:       { color: '#FFB800' },
        handler:     async ({ razorpay_order_id, razorpay_payment_id, razorpay_signature }) => {
          const vRes = await fetch('/api/payments/verify', {
            method:  'POST',
            headers: { 'Content-Type': 'application/json' },
            body:    JSON.stringify({ razorpay_order_id, razorpay_payment_id, razorpay_signature }),
          })
          const vData = await vRes.json()
          if (vData.success) {
            router.push('/register/success')
          } else {
            setError('Payment verification failed. Contact support if amount was deducted.')
            setLoading(false)
          }
        },
        modal: { ondismiss: () => setLoading(false) },
      })

      rzp.open()
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Something went wrong. Please try again.')
      setLoading(false)
    }
  }

  return (
    <>
      <Script
        src="https://checkout.razorpay.com/v1/checkout.js"
        strategy="lazyOnload"
        onLoad={() => setScriptReady(true)}
        onReady={() => setScriptReady(true)}
      />

      <div className="flex flex-col gap-6 max-w-lg mx-auto pb-8">

        {/* Team context — only shown if in a team */}
        {teamData && (
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0, transition: { duration: 0.4, ease: EASE_OUT } }}
          >
            <TeamStatusBadge teamData={teamData} />
          </motion.div>
        )}

        {/* Plan card — single card derived from team status */}
        <motion.div
          className="rounded-2xl p-5"
          style={{
            background: 'var(--bg-card)',
            border: isTeam ? '2px solid rgba(255,184,0,0.4)' : '1px solid var(--border-subtle)',
            boxShadow: isTeam ? '0 0 32px rgba(255,184,0,0.1)' : 'none',
          }}
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0, transition: { duration: 0.4, ease: EASE_OUT } }}
        >
          <div className="flex items-center gap-2 mb-1">
            <span className="text-2xl">{planEmoji}</span>
            <p className="font-mono text-[12px] tracking-[0.2em] uppercase" style={{ color: 'var(--text-3)' }}>
              Your Plan
            </p>
          </div>
          <h2
            className="font-display text-3xl tracking-wide mb-4"
            style={{ color: isTeam ? 'var(--brand)' : 'var(--text-1)' }}
          >
            {planLabel.toUpperCase()}
          </h2>

          <ul className="flex flex-col gap-2 mb-4">
            {['Full programme access', '3 live workshops', 'Hackathon entry', 'Certificate of completion', 'Digital badge'].map(f => (
              <li key={f} className="flex items-center gap-2 font-body text-sm" style={{ color: 'var(--text-2)' }}>
                <span style={{ color: 'var(--brand)' }}>✓</span>
                {f}
              </li>
            ))}
          </ul>

          {isTeam && (
            <p className="font-body text-xs rounded-lg px-3 py-2" style={{ background: 'rgba(255,184,0,0.06)', color: 'var(--text-3)', border: '1px solid rgba(255,184,0,0.15)' }}>
              💡 Shared plan — all {memberCount} team members get access under this single payment.
            </p>
          )}
        </motion.div>

        {/* Price + CTA */}
        <motion.div
          className="flex flex-col gap-3"
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0, transition: { duration: 0.4, ease: EASE_OUT, delay: 0.1 } }}
        >
          <div className="flex flex-wrap items-baseline gap-x-3 gap-y-1 px-1">
            <span className="font-display text-5xl tracking-tight" style={{ color: 'var(--text-1)' }}>
              ₹{displayPrice.toLocaleString('en-IN')}
            </span>
            <span className="font-body text-sm" style={{ color: 'var(--text-3)' }}>
              excl. GST
            </span>
          </div>

          <AnimatePresence>
            {error && (
              <motion.div
                initial={{ opacity: 0, y: -4 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}
                className="rounded-xl px-4 py-3 font-body text-sm"
                style={{ background: 'var(--red-bg)', color: 'var(--red)', border: '1px solid rgba(248,113,113,0.3)' }}
              >
                {error}
              </motion.div>
            )}
          </AnimatePresence>

          <button
            disabled={loading || !scriptReady}
            className="w-full rounded-xl py-4 font-heading font-bold text-lg tracking-wide min-h-[56px] transition-all active:scale-[0.97] disabled:opacity-40"
            style={{ background: 'var(--brand)', color: '#000' }}
            onClick={handlePay}
          >
            {loading
              ? 'Opening payment…'
              : !scriptReady
              ? 'Loading payment…'
              : `Confirm & Pay ₹${displayPrice.toLocaleString('en-IN')}`}
          </button>

          <p className="font-body text-xs text-center" style={{ color: 'var(--text-3)' }}>
            🔒 Secured by Razorpay · UPI, Cards, NetBanking accepted
          </p>
        </motion.div>

        {/* For Parents */}
        <motion.div
          className="rounded-2xl p-5"
          style={{ background: 'var(--bg-card)', border: '1px solid var(--border-faint)' }}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1, transition: { duration: 0.5, delay: 0.2 } }}
        >
          <p className="font-mono text-[12px] tracking-[0.15em] uppercase mb-4" style={{ color: 'var(--text-3)' }}>
            For Parents
          </p>
          {[
            { icon: '✅', title: 'zer0.pro Verified', desc: 'Registered organisation with verified mentors and instructors.' },
            { icon: '💰', title: 'Full refund guarantee', desc: "If the programme is cancelled or doesn't start, you get 100% back." },
            { icon: '🔐', title: 'Safe online environment', desc: 'All sessions recorded. No direct student-mentor contact outside platform.' },
            { icon: '📲', title: 'Parent WhatsApp group', desc: 'Dedicated group for updates, schedules, and any concerns.' },
          ].map(({ icon, title, desc }) => (
            <div key={title} className="flex gap-3 mb-4 last:mb-0">
              <span className="text-lg shrink-0 mt-0.5">{icon}</span>
              <div>
                <p className="font-body text-sm font-semibold mb-0.5" style={{ color: 'var(--text-1)' }}>{title}</p>
                <p className="font-body text-xs leading-snug" style={{ color: 'var(--text-3)' }}>{desc}</p>
              </div>
            </div>
          ))}
        </motion.div>
      </div>
    </>
  )
}
