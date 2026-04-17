'use client'

import { useEffect, useState } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import Script from 'next/script'
import { motion, AnimatePresence } from 'framer-motion'
import { useRegistrationStore } from '@/lib/store/registration'
import { TIERS } from '@/lib/content/programme'

type Bez = [number, number, number, number]
const EASE_OUT: Bez = [0.16, 1, 0.3, 1]

interface PayPageProps {
  studentId:   string
  fullName:    string
  email:       string
  phone:       string
  defaultTier: 'pro' | 'premium' | null
}

// Feature summaries for the summary card
const TIER_HIGHLIGHTS: Record<'pro' | 'premium', string[]> = {
  pro:     ['3 live workshops', 'Group mentorship', 'Participation certificate', 'Digital badge'],
  premium: ['3 workshops + bonus session', '1:1 mentor (2 slots)', 'Verified LinkedIn certificate', 'T-shirt + premium kit'],
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

export function PayPage({ studentId, fullName, email, phone, defaultTier }: PayPageProps) {
  const router       = useRouter()
  const searchParams = useSearchParams()
  const { tier: storeTier, isEmi, setTier } = useRegistrationStore()

  // Prefer Zustand (set on select page), fall back to DB value
  const tier = storeTier ?? defaultTier

  // If no tier at all, redirect back to select
  useEffect(() => {
    if (!tier) router.replace('/register/stage-3/select')
  }, [tier, router])

  const [emiEnabled, setEmiEnabled]   = useState(isEmi)
  const [loading, setLoading]         = useState(false)
  const [scriptReady, setScriptReady] = useState(false)
  // Pre-populate error from callback redirect (e.g. net banking failure)
  const [error, setError] = useState<string | null>(
    searchParams.get('error') ? decodeURIComponent(searchParams.get('error')!) : null
  )

  const PREMIUM_PRICE  = TIERS.premium.priceMin // 2499
  const EMI_FIRST      = TIERS.premium.emiFirst  // 999
  const EMI_REST       = PREMIUM_PRICE - EMI_FIRST

  const displayPrice = !tier
    ? 0
    : tier === 'pro'
    ? TIERS.pro.priceMin
    : emiEnabled ? EMI_FIRST : PREMIUM_PRICE

  const amountPaise = displayPrice * 100

  async function handlePay() {
    if (!tier || !scriptReady) return
    setLoading(true)
    setError(null)

    try {
      const res = await fetch('/api/payments/create-order', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ tier, isEmi: tier === 'premium' && emiEnabled }),
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
        description: `${tier === 'premium' ? 'Premium' : 'Pro'} — School Edition Season 1`,
        prefill:     { name: fullName, email, contact: phone },
        theme:       { color: '#FFB800' },
        handler:     async ({ razorpay_order_id, razorpay_payment_id, razorpay_signature }) => {
          // Verify on server
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
        modal: {
          ondismiss: () => setLoading(false),
        },
      })

      rzp.open()
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Something went wrong. Please try again.')
      setLoading(false)
    }
  }

  if (!tier) return null

  return (
    <>
      <Script
        src="https://checkout.razorpay.com/v1/checkout.js"
        strategy="lazyOnload"
        onLoad={() => setScriptReady(true)}
      />

      <div className="flex flex-col gap-6 max-w-lg mx-auto pb-8">
        {/* Tier summary card */}
        <motion.div
          className="rounded-2xl p-5"
          style={{
            background:  'var(--bg-card)',
            border:      tier === 'premium' ? '2px solid rgba(255,184,0,0.4)' : '1px solid var(--border-subtle)',
            boxShadow:   tier === 'premium' ? '0 0 32px rgba(255,184,0,0.1)' : 'none',
          }}
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0, transition: { duration: 0.4, ease: EASE_OUT } }}
        >
          <div className="flex items-start justify-between mb-4">
            <div>
              <p className="font-mono text-[12px] tracking-[0.2em] uppercase mb-1" style={{ color: 'var(--text-3)' }}>
                Your selection
              </p>
              <h2 className="font-display text-3xl tracking-wide" style={{ color: tier === 'premium' ? 'var(--brand)' : 'var(--text-1)' }}>
                {tier === 'premium' ? 'PREMIUM' : 'PRO'}
              </h2>
            </div>
            <button
              className="font-body text-xs underline min-h-[44px] px-2 flex items-center"
              style={{ color: 'var(--text-3)' }}
              onClick={() => router.push('/register/stage-3/select')}
            >
              Change
            </button>
          </div>

          {/* Features */}
          <ul className="flex flex-col gap-2 mb-4">
            {TIER_HIGHLIGHTS[tier].map(f => (
              <li key={f} className="flex items-center gap-2 font-body text-sm" style={{ color: 'var(--text-2)' }}>
                <span style={{ color: tier === 'premium' ? 'var(--brand)' : '#34D399' }}>✓</span>
                {f}
              </li>
            ))}
          </ul>

          {/* EMI toggle — Premium only */}
          {tier === 'premium' && (
            <div
              className="rounded-xl p-3 cursor-pointer transition-all active:scale-[0.98]"
              style={{
                background: emiEnabled ? 'rgba(255,184,0,0.08)' : 'var(--bg-float)',
                border:     emiEnabled ? '1px solid rgba(255,184,0,0.4)' : '1px solid var(--border-subtle)',
              }}
              onClick={() => setEmiEnabled(v => !v)}
            >
              <div className="flex items-center gap-3">
                <div
                  className="w-4 h-4 rounded flex items-center justify-center shrink-0"
                  style={{
                    background: emiEnabled ? 'var(--brand)' : 'transparent',
                    border:     emiEnabled ? 'none' : '1.5px solid var(--border-soft)',
                  }}
                >
                  {emiEnabled && <span className="text-[9px] font-bold" style={{ color: '#000' }}>✓</span>}
                </div>
                <div>
                  <p className="font-body text-xs font-semibold" style={{ color: emiEnabled ? 'var(--brand)' : 'var(--text-2)' }}>
                    Pay in 2 instalments
                  </p>
                  <p className="font-mono text-[13px]" style={{ color: 'var(--text-3)' }}>
                    ₹{EMI_FIRST} now · ₹{EMI_REST} in 1 week
                  </p>
                </div>
              </div>
            </div>
          )}
        </motion.div>

        {/* Price + CTA */}
        <motion.div
          className="flex flex-col gap-3"
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0, transition: { duration: 0.4, ease: EASE_OUT, delay: 0.1 } }}
        >
          {/* Price display */}
          <div className="flex items-baseline gap-2 px-1">
            <span className="font-display text-5xl tracking-tight" style={{ color: 'var(--text-1)' }}>
              ₹{displayPrice.toLocaleString('en-IN')}
            </span>
            {tier === 'premium' && emiEnabled && (
              <span className="font-body text-sm" style={{ color: 'var(--text-3)' }}>
                now (₹{EMI_REST} due in 1 week)
              </span>
            )}
          </div>

          {/* Error message */}
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

          {/* Pay button */}
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

          {/* Trust line */}
          <p className="font-body text-xs text-center" style={{ color: 'var(--text-3)' }}>
            🔒 Secured by Razorpay · UPI, Cards, NetBanking accepted
          </p>
        </motion.div>

        {/* Parent trust section */}
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
            { icon: '💰', title: 'Full refund guarantee', desc: 'If the programme is cancelled or doesn\'t start, you get 100% back.' },
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
