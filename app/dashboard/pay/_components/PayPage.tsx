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
  studentId: string
  fullName: string
  email: string
  phone: string
  teamData: TeamData | null
  memberCount: number
  priceSolo: number  // ₹ rupees
  priceTeam: number  // ₹ rupees per head
  priceRupees: number  // computed price for this student
}

declare global {
  interface Window {
    Razorpay: new (options: RazorpayOptions) => { open: () => void }
  }
}
interface RazorpayOptions {
  key: string
  amount: number
  currency: string
  order_id: string
  name: string
  description: string
  prefill?: { name?: string; email?: string; contact?: string }
  theme?: { color?: string }
  handler: (response: { razorpay_order_id: string; razorpay_payment_id: string; razorpay_signature: string }) => void
  modal?: { ondismiss?: () => void }
}

function TeamStatusCard({ teamData, memberCount, priceSolo, priceTeam }: {
  teamData: TeamData
  memberCount: number
  priceSolo: number
  priceTeam: number
}) {
  const paidCount = teamData.members.filter(m => m.isPaid).length
  const isTeamRate = memberCount >= 2
  const savedPer = priceSolo - priceTeam

  return (
    <div
      className="rounded-2xl p-4"
      style={{
        background: isTeamRate ? 'rgba(34,197,94,0.06)' : 'var(--bg-card)',
        border: isTeamRate ? '1px solid rgba(34,197,94,0.25)' : '1px solid var(--border-subtle)',
      }}
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
        {isTeamRate && (
          <span
            className="font-mono text-xs px-2 py-0.5 rounded-full font-bold"
            style={{ background: 'rgba(34,197,94,0.15)', color: 'var(--green)' }}
          >
            Team rate — save ₹{savedPer.toLocaleString('en-IN')}/head
          </span>
        )}
      </div>

      <div className="flex items-center gap-2">
        <div className="flex-1 h-1.5 rounded-full overflow-hidden" style={{ background: 'var(--bg-float)' }}>
          <div
            className="h-full rounded-full transition-all"
            style={{ width: `${(paidCount / memberCount) * 100}%`, background: 'var(--green)' }}
          />
        </div>
        <p className="font-mono text-[11px] shrink-0" style={{ color: 'var(--text-3)' }}>
          {paidCount}/{memberCount} paid
        </p>
      </div>

      {!isTeamRate && (
        <p className="font-body text-[11px] mt-2" style={{ color: 'var(--text-3)' }}>
          Add 1 more member to unlock the team rate (₹{priceTeam.toLocaleString('en-IN')}/head)
        </p>
      )}
    </div>
  )
}

export function PayPage({
  studentId: _studentId, fullName, email, phone,
  teamData, memberCount, priceSolo, priceTeam, priceRupees,
}: PayPageProps) {
  const router = useRouter()
  const searchParams = useSearchParams()

  const [loading, setLoading] = useState(false)
  const [scriptReady, setScriptReady] = useState(false)
  const [error, setError] = useState<string | null>(
    searchParams.get('error') ? decodeURIComponent(searchParams.get('error')!) : null
  )

  const isTeamRate = memberCount >= 2
  const savedAmount = isTeamRate ? priceSolo - priceTeam : 0

  async function handlePay() {
    if (!scriptReady) return
    setLoading(true)
    setError(null)

    try {
      const res = await fetch('/api/payments/create-order', { method: 'POST' })

      if (!res.ok) {
        const { error: msg } = await res.json()
        throw new Error(msg ?? 'Failed to create order')
      }

      const { orderId, amount, keyId } = await res.json()

      const rzp = new window.Razorpay({
        key: keyId,
        amount,
        currency: 'INR',
        order_id: orderId,
        name: 'Super Builders',
        description: 'School Edition Season 1',
        prefill: { name: fullName, email, contact: phone },
        theme: { color: '#FFB800' },
        handler: async ({ razorpay_order_id, razorpay_payment_id, razorpay_signature }) => {
          const vRes = await fetch('/api/payments/verify', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ razorpay_order_id, razorpay_payment_id, razorpay_signature }),
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
        {/* Team status card */}
        {teamData && (
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0, transition: { duration: 0.4, ease: EASE_OUT } }}
          >
            <TeamStatusCard
              teamData={teamData}
              memberCount={memberCount}
              priceSolo={priceSolo}
              priceTeam={priceTeam}
            />
          </motion.div>
        )}

        {/* Pricing card */}
        <motion.div
          className="rounded-2xl p-5"
          style={{
            background: 'var(--bg-card)',
            border: '2px solid rgba(255,184,0,0.4)',
            boxShadow: '0 0 32px rgba(255,184,0,0.08)',
          }}
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0, transition: { duration: 0.4, ease: EASE_OUT } }}
        >
          <p className="font-mono text-[11px] tracking-[0.18em] uppercase mb-2" style={{ color: 'var(--text-3)' }}>
            Registration Fee
          </p>
          <div className="flex items-baseline gap-3 mb-3">
            <span className="font-display text-5xl tracking-tight" style={{ color: 'var(--text-1)' }}>
              ₹{priceRupees.toLocaleString('en-IN')}
            </span>
            {isTeamRate && (
              <span className="font-body text-sm" style={{ color: 'var(--text-3)' }}>per head</span>
            )}
          </div>

          {/* Savings badge for team rate */}
          {isTeamRate && savedAmount > 0 && (
            <div className="flex items-center gap-2 mb-4">
              <span className="font-body text-sm line-through" style={{ color: 'var(--text-4)' }}>
                ₹{priceSolo.toLocaleString('en-IN')}
              </span>
              <span
                className="font-mono text-xs px-2 py-0.5 rounded-full"
                style={{ background: 'rgba(34,197,94,0.12)', color: 'var(--green)' }}
              >
                Team rate — ₹{savedAmount.toLocaleString('en-IN')} off
              </span>
            </div>
          )}

          {/* What's included */}
          <ul className="flex flex-col gap-2">
            {[
              '3 live AI workshops',
              'Group mentorship sessions',
              '24-hour hackathon access',
              'Participation certificate + digital badge',
              '₹1,00,000+ prize pool',
            ].map(f => (
              <li key={f} className="flex items-center gap-2 font-body text-sm" style={{ color: 'var(--text-2)' }}>
                <span style={{ color: 'var(--brand)' }}>✓</span>
                {f}
              </li>
            ))}
          </ul>
        </motion.div>

        {/* Price + CTA */}
        <motion.div
          className="flex flex-col gap-3"
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0, transition: { duration: 0.4, ease: EASE_OUT, delay: 0.1 } }}
        >
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
                : `Confirm & Pay ₹${priceRupees.toLocaleString('en-IN')}`}
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
