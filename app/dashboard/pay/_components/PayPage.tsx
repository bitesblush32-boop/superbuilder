'use client'

import { useState }            from 'react'
import { useRouter }           from 'next/navigation'
import Script                  from 'next/script'
import { motion, AnimatePresence } from 'framer-motion'
import { setTeamSolo }         from '@/lib/actions/registration'

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

interface MemberReadinessStatus {
  id:            string
  name:          string
  quizPassed:    boolean
  ideaSubmitted: boolean
}

interface TeamReadiness {
  allReady:      boolean
  memberStatuses: MemberReadinessStatus[]
}

interface PayPageProps {
  studentId:      string
  fullName:       string
  email:          string
  phone:          string
  teamData:       TeamData | null
  memberCount:    number
  priceSolo:      number       // ₹ rupees
  priceTeam:      number       // ₹ rupees per head
  priceRupees:    number       // final price after all discounts
  hasQuizPerfect?: boolean
  quizDiscount?:  number       // ₹ rupees off for perfect score
  teamReadiness:  TeamReadiness | null
  isSoloInTeam:  boolean
  soloTeamCode:  string | null // team code to share when isSoloInTeam
}

declare global {
  interface Window {
    Razorpay: new (options: RazorpayOptions) => { open: () => void }
  }
}
interface RazorpayOptions {
  key: string; amount: number; currency: string; order_id: string
  name: string; description: string
  prefill?: { name?: string; email?: string; contact?: string }
  theme?: { color?: string }
  handler: (response: { razorpay_order_id: string; razorpay_payment_id: string; razorpay_signature: string }) => void
  modal?: { ondismiss?: () => void }
}

// ─── Member readiness row ────────────────────────────────────────────────────
function MemberReadinessRow({ status }: { status: MemberReadinessStatus }) {
  const isReady = status.quizPassed && status.ideaSubmitted
  return (
    <div className="flex items-center gap-2">
      <span style={{ fontSize: 14, flexShrink: 0 }}>
        {isReady ? '✅' : '⏳'}
      </span>
      <p className="font-body text-sm flex-1 truncate" style={{ color: isReady ? 'var(--text-2)' : 'var(--text-1)' }}>
        {status.name}
      </p>
      <div className="flex items-center gap-1.5 shrink-0">
        <span
          className="font-mono text-[9px] px-1.5 py-0.5 rounded-full"
          style={status.quizPassed
            ? { background: 'var(--green-bg)', color: 'var(--green)' }
            : { background: 'var(--amber-bg)', color: 'var(--amber)' }
          }
        >
          {status.quizPassed ? 'Quiz ✓' : 'Quiz…'}
        </span>
        <span
          className="font-mono text-[9px] px-1.5 py-0.5 rounded-full"
          style={status.ideaSubmitted
            ? { background: 'var(--green-bg)', color: 'var(--green)' }
            : { background: 'var(--amber-bg)', color: 'var(--amber)' }
          }
        >
          {status.ideaSubmitted ? 'Idea ✓' : 'Idea…'}
        </span>
      </div>
    </div>
  )
}

// ─── Team status card (with optional readiness) ──────────────────────────────
function TeamStatusCard({ teamData, memberCount, priceSolo, priceTeam, teamReadiness }: {
  teamData:     TeamData
  memberCount:  number
  priceSolo:    number
  priceTeam:    number
  teamReadiness: TeamReadiness | null
}) {
  const isTeamRate = memberCount >= 2
  const savedPer   = priceSolo - priceTeam
  const paidCount  = teamData.members.filter(m => m.isPaid).length

  return (
    <div
      className="rounded-2xl p-4"
      style={{
        background: isTeamRate ? 'rgba(34,197,94,0.06)' : 'var(--bg-card)',
        border:     isTeamRate ? '1px solid rgba(34,197,94,0.25)' : '1px solid var(--border-subtle)',
      }}
    >
      {/* Team name + code + rate badge */}
      <div className="flex flex-wrap items-center gap-2 mb-3">
        <div className="flex items-center gap-2 flex-1 min-w-0">
          <span className="text-base shrink-0">👥</span>
          <p className="font-body text-sm font-semibold truncate" style={{ color: 'var(--text-1)' }}>
            {teamData.name}
          </p>
          <span
            className="font-mono text-[10px] px-1.5 py-0.5 rounded shrink-0"
            style={{ background: 'var(--bg-float)', color: 'var(--text-3)' }}
          >
            {teamData.code}
          </span>
        </div>
        {isTeamRate && (
          <span
            className="font-mono text-xs px-2 py-0.5 rounded-full font-bold shrink-0"
            style={{ background: 'rgba(34,197,94,0.15)', color: 'var(--green)' }}
          >
            Team rate — save ₹{savedPer.toLocaleString('en-IN')}/head
          </span>
        )}
      </div>

      {/* Member readiness list */}
      {teamReadiness ? (
        <div className="flex flex-col gap-2">
          {teamReadiness.memberStatuses.map(s => (
            <MemberReadinessRow key={s.id} status={s} />
          ))}
        </div>
      ) : (
        /* Fallback: paid progress bar (when no readiness info available) */
        <div className="flex items-center gap-2 mt-1">
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
      )}
    </div>
  )
}

// ─── Main component ───────────────────────────────────────────────────────────
export function PayPage({
  studentId: _studentId, fullName, email, phone,
  teamData, memberCount, priceSolo, priceTeam, priceRupees,
  hasQuizPerfect = false, quizDiscount = 0,
  teamReadiness, isSoloInTeam, soloTeamCode,
}: PayPageProps) {
  const router = useRouter()

  const [loading, setLoading]           = useState(false)
  const [scriptReady, setScriptReady]   = useState(false)
  const [error, setError]               = useState<string | null>(null)
  const [copied, setCopied]             = useState(false)

  const isTeamRate     = memberCount >= 2
  const savedAmount    = isTeamRate ? priceSolo - priceTeam : 0
  const notReadyMembers = teamReadiness?.memberStatuses.filter(m => !m.quizPassed || !m.ideaSubmitted) ?? []
  const isTeamBlocked  = !!teamReadiness && !teamReadiness.allReady

  async function handleGoSolo() {
    setLoading(true)
    await setTeamSolo()
    router.refresh()
  }

  async function handleCopyCode() {
    if (!soloTeamCode) return
    try {
      await navigator.clipboard.writeText(soloTeamCode)
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    } catch {
      // fallback: select + copy not supported
    }
  }

  async function handlePay() {
    if (!scriptReady || isTeamBlocked) return
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
        key:         keyId,
        amount,
        currency:    'INR',
        order_id:    orderId,
        name:        'Super Builders',
        description: 'School Edition Season 1',
        prefill:     { name: fullName, email, contact: phone },
        theme:       { color: '#FFB800' },
        handler: async ({ razorpay_order_id, razorpay_payment_id, razorpay_signature }) => {
          const vRes  = await fetch('/api/payments/verify', {
            method:  'POST',
            headers: { 'Content-Type': 'application/json' },
            body:    JSON.stringify({ razorpay_order_id, razorpay_payment_id, razorpay_signature }),
          })
          const vData = await vRes.json()
          if (vData.success) {
            router.push('/dashboard')
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

        {/* ── CASE A: Solo in team (no one has joined) ─────────────────────── */}
        {isSoloInTeam && (
          <motion.div
            className="rounded-2xl p-4 flex flex-col gap-3"
            style={{
              background: 'var(--amber-bg)',
              border:     '1px solid rgba(251,191,36,0.35)',
            }}
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0, transition: { duration: 0.4, ease: EASE_OUT } }}
          >
            <div className="flex items-start gap-2">
              <span className="text-lg shrink-0 mt-0.5">👥</span>
              <div>
                <p className="font-body text-sm font-semibold mb-0.5" style={{ color: 'var(--amber)' }}>
                  Your team is empty
                </p>
                <p className="font-body text-xs leading-snug" style={{ color: 'var(--text-2)' }}>
                  No one has joined yet. You can wait for teammates or continue as a solo builder.
                </p>
              </div>
            </div>

            {soloTeamCode && (
              <div
                className="flex items-center gap-2 rounded-xl px-3 py-2"
                style={{ background: 'rgba(0,0,0,0.2)' }}
              >
                <p className="font-mono text-xs flex-1" style={{ color: 'var(--text-2)' }}>
                  Team code: <span style={{ color: 'var(--amber)', fontWeight: 700 }}>{soloTeamCode}</span>
                </p>
                <button
                  onClick={handleCopyCode}
                  className="font-mono text-[10px] px-2.5 py-1 rounded-lg transition-all active:scale-95"
                  style={{ background: 'rgba(251,191,36,0.2)', color: 'var(--amber)', border: '1px solid rgba(251,191,36,0.3)' }}
                >
                  {copied ? '✓ Copied' : 'Copy'}
                </button>
              </div>
            )}

            <div className="flex gap-2">
              <button
                onClick={handleGoSolo}
                disabled={loading}
                className="flex-1 rounded-xl py-2.5 font-heading font-bold text-sm transition-all active:scale-[0.97] disabled:opacity-40"
                style={{ background: 'var(--amber)', color: '#000' }}
              >
                {loading ? 'Updating…' : 'Continue as Solo'}
              </button>
              {soloTeamCode && (
                <button
                  onClick={handleCopyCode}
                  className="rounded-xl px-4 py-2.5 font-heading font-bold text-sm transition-all active:scale-[0.97]"
                  style={{ background: 'rgba(251,191,36,0.12)', color: 'var(--amber)', border: '1px solid rgba(251,191,36,0.3)' }}
                >
                  {copied ? '✓ Copied!' : 'Share Code'}
                </button>
              )}
            </div>
          </motion.div>
        )}

        {/* ── Team status card (with member readiness) ─────────────────────── */}
        {teamData && !isSoloInTeam && (
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0, transition: { duration: 0.4, ease: EASE_OUT } }}
          >
            <TeamStatusCard
              teamData={teamData}
              memberCount={memberCount}
              priceSolo={priceSolo}
              priceTeam={priceTeam}
              teamReadiness={teamReadiness}
            />
          </motion.div>
        )}

        {/* ── CASE B: Team blocked — some members not ready ─────────────────── */}
        {isTeamBlocked && notReadyMembers.length > 0 && (
          <motion.div
            className="rounded-2xl p-4 flex flex-col gap-3"
            style={{
              background: 'var(--red-bg)',
              border:     '1px solid rgba(248,113,113,0.3)',
            }}
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0, transition: { duration: 0.4, ease: EASE_OUT } }}
          >
            <div className="flex items-start gap-2">
              <span className="text-lg shrink-0 mt-0.5">⏳</span>
              <div>
                <p className="font-body text-sm font-semibold mb-0.5" style={{ color: 'var(--red)' }}>
                  Waiting for Teammates
                </p>
                <p className="font-body text-xs leading-snug" style={{ color: 'var(--text-2)' }}>
                  All team members must complete the quiz and submit their idea before the team can pay.
                </p>
              </div>
            </div>

            <div className="flex flex-col gap-1.5">
              {notReadyMembers.map(m => (
                <div key={m.id} className="flex items-center gap-2 text-sm">
                  <span style={{ color: 'var(--red)', fontSize: 12, flexShrink: 0 }}>●</span>
                  <p className="font-body flex-1 truncate" style={{ color: 'var(--text-1)' }}>
                    {m.name}
                  </p>
                  <p className="font-mono text-[10px] shrink-0" style={{ color: 'var(--text-3)' }}>
                    needs:{' '}
                    {[!m.quizPassed && 'Quiz', !m.ideaSubmitted && 'Idea']
                      .filter(Boolean)
                      .join(' + ')}
                  </p>
                </div>
              ))}
            </div>

            <button
              onClick={handleGoSolo}
              disabled={loading}
              className="w-full rounded-xl py-2.5 font-heading font-bold text-sm transition-all active:scale-[0.97] disabled:opacity-40"
              style={{ background: 'rgba(248,113,113,0.12)', color: 'var(--red)', border: '1px solid rgba(248,113,113,0.3)' }}
            >
              {loading ? 'Updating…' : 'Go Solo Instead'}
            </button>
          </motion.div>
        )}

        {/* ── Pricing card ─────────────────────────────────────────────────── */}
        <motion.div
          className="rounded-2xl p-5"
          style={{
            background:  'var(--bg-card)',
            border:      '2px solid rgba(255,184,0,0.4)',
            boxShadow:   '0 0 32px rgba(255,184,0,0.08)',
            opacity:     isTeamBlocked ? 0.5 : 1,
          }}
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: isTeamBlocked ? 0.5 : 1, y: 0, transition: { duration: 0.4, ease: EASE_OUT } }}
        >
          <p className="font-mono text-[11px] tracking-[0.18em] uppercase mb-2" style={{ color: 'var(--text-3)' }}>
            Registration Fee
          </p>

          {/* Perfect score badge */}
          {hasQuizPerfect && (
            <div
              className="flex items-center gap-2 rounded-xl px-3 py-2 mb-3"
              style={{ background: 'rgba(34,197,94,0.08)', border: '1px solid rgba(34,197,94,0.3)' }}
            >
              <span className="text-base shrink-0">🎯</span>
              <div>
                <p className="font-mono text-xs font-bold" style={{ color: 'var(--green)' }}>
                  Perfect Quiz Score — ₹500 discount applied!
                </p>
                <p className="font-body text-[11px]" style={{ color: 'var(--text-3)' }}>
                  You scored 10/10. This bonus is yours to keep.
                </p>
              </div>
            </div>
          )}

          <div className="flex items-baseline gap-3 mb-3">
            <span className="font-display text-5xl tracking-tight" style={{ color: 'var(--text-1)' }}>
              ₹{priceRupees.toLocaleString('en-IN')}
            </span>
            {isTeamRate && (
              <span className="font-body text-sm" style={{ color: 'var(--text-3)' }}>per head</span>
            )}
          </div>

          {/* Discount lines */}
          {(isTeamRate && savedAmount > 0) || quizDiscount > 0 ? (
            <div className="flex flex-wrap items-center gap-2 mb-4">
              <span className="font-body text-sm line-through" style={{ color: 'var(--text-4)' }}>
                ₹{(priceRupees + savedAmount + quizDiscount).toLocaleString('en-IN')}
              </span>
              {isTeamRate && savedAmount > 0 && (
                <span
                  className="font-mono text-xs px-2 py-0.5 rounded-full"
                  style={{ background: 'rgba(34,197,94,0.12)', color: 'var(--green)' }}
                >
                  Team rate — ₹{savedAmount.toLocaleString('en-IN')} off
                </span>
              )}
              {quizDiscount > 0 && (
                <span
                  className="font-mono text-xs px-2 py-0.5 rounded-full"
                  style={{ background: 'rgba(34,197,94,0.12)', color: 'var(--green)' }}
                >
                  🎯 Perfect score — ₹{quizDiscount.toLocaleString('en-IN')} off
                </span>
              )}
            </div>
          ) : null}

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

        {/* ── Price + CTA ───────────────────────────────────────────────────── */}
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

          {/* Team blocked notice */}
          {isTeamBlocked && (
            <p className="font-body text-xs text-center" style={{ color: 'var(--text-3)' }}>
              Payment is locked until all teammates complete the quiz and submit their idea.
            </p>
          )}

          <button
            disabled={loading || !scriptReady || isTeamBlocked}
            className="w-full rounded-xl py-4 font-heading font-bold text-lg tracking-wide min-h-[56px] transition-all active:scale-[0.97] disabled:opacity-40"
            style={{ background: 'var(--brand)', color: '#000' }}
            onClick={handlePay}
          >
            {loading
              ? 'Opening payment…'
              : !scriptReady
                ? 'Loading payment…'
                : isTeamBlocked
                  ? 'Waiting for team…'
                  : `Confirm & Pay ₹${priceRupees.toLocaleString('en-IN')}`}
          </button>

          <p className="font-body text-xs text-center" style={{ color: 'var(--text-3)' }}>
            🔒 Secured by Razorpay · UPI, Cards, NetBanking accepted
          </p>
        </motion.div>

        {/* ── For Parents ───────────────────────────────────────────────────── */}
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
            { icon: '✅', title: 'zer0.pro Verified',        desc: 'Registered organisation with verified mentors and instructors.' },
            { icon: '💰', title: 'Full refund guarantee',    desc: "If the programme is cancelled or doesn't start, you get 100% back." },
            { icon: '🔐', title: 'Safe online environment',  desc: 'All sessions recorded. No direct student-mentor contact outside platform.' },
            { icon: '📲', title: 'Parent WhatsApp group',    desc: 'Dedicated group for updates, schedules, and any concerns.' },
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
