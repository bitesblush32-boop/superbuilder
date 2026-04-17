'use client'

import { useEffect, useRef, useState } from 'react'
import { useRouter } from 'next/navigation'
import { motion, AnimatePresence } from 'framer-motion'
import { BadgeUnlock } from '@/components/gamification/BadgeUnlock'
import type { BadgeId } from '@/lib/gamification/badges'

// ─── Motion ───────────────────────────────────────────────────────────────────

type Bez = [number, number, number, number]
const EASE_OUT:    Bez = [0.16, 1, 0.3, 1]
const EASE_SPRING: Bez = [0.34, 1.56, 0.64, 1]

interface SuccessClientProps {
  firstName:    string
  fullName:     string
  referralCode: string
  tier:         'pro' | 'premium'
  xp:           number
}

// ─── ICS helper ───────────────────────────────────────────────────────────────

function downloadWorkshop1ICS() {
  const ics = [
    'BEGIN:VCALENDAR',
    'VERSION:2.0',
    'PRODID:-//Super Builders//EN',
    'BEGIN:VEVENT',
    'UID:sb-workshop-1-2025@superbuilder.org',
    'DTSTART:20250526T123000Z',      // May 26 6pm IST = 12:30 UTC
    'DTEND:20250526T151500Z',        // + 90 min
    'SUMMARY:🚀 Super Builders — Workshop 1: AI Fundamentals + Tools',
    'DESCRIPTION:Use 3+ AI tools confidently. Join via the Discord link in your dashboard.',
    'LOCATION:Online (Discord)',
    'STATUS:CONFIRMED',
    'END:VEVENT',
    'END:VCALENDAR',
  ].join('\r\n')

  const blob = new Blob([ics], { type: 'text/calendar;charset=utf-8' })
  const url  = URL.createObjectURL(blob)
  const a    = document.createElement('a')
  a.href     = url
  a.download = 'sb-workshop-1.ics'
  a.click()
  URL.revokeObjectURL(url)
}

// ─── Component ────────────────────────────────────────────────────────────────

export function SuccessClient({ firstName, referralCode, tier, xp }: SuccessClientProps) {
  const router = useRouter()

  const [pendingBadge, setPendingBadge]   = useState<BadgeId | null>(null)
  const [cardsVisible, setCardsVisible]   = useState(false)
  const [copied, setCopied]               = useState(false)
  const confettiFired                     = useRef(false)
  const badgeTimerRef                     = useRef<ReturnType<typeof setTimeout> | null>(null)

  // 1. Fire confetti immediately on mount
  useEffect(() => {
    if (confettiFired.current) return
    confettiFired.current = true

    const fireConfetti = async () => {
      const confetti = (await import('canvas-confetti')).default

      // Initial burst — centre
      confetti({
        particleCount: 120,
        spread:        80,
        origin:        { y: 0.45 },
        colors:        ['#FFB800', '#FFCF40', '#FFD700', '#ffffff', '#FFA500'],
        gravity:       1.0,
        scalar:        1.1,
        ticks:         250,
      })

      // Delayed side cannons
      setTimeout(() => {
        confetti({ particleCount: 60, angle: 60, spread: 55, origin: { x: 0, y: 0.5 }, colors: ['#FFB800', '#FFCF40', '#fff'] })
        confetti({ particleCount: 60, angle: 120, spread: 55, origin: { x: 1, y: 0.5 }, colors: ['#FFB800', '#FFCF40', '#fff'] })
      }, 350)
    }

    fireConfetti()

    // 2. Trigger BUILDER badge at 900ms (after hero text animates in)
    badgeTimerRef.current = setTimeout(() => setPendingBadge('BUILDER'), 900)

    return () => {
      if (badgeTimerRef.current) clearTimeout(badgeTimerRef.current)
    }
  }, [])

  // Auto-dismiss badge after 3.5s → reveal cards
  useEffect(() => {
    if (!pendingBadge) return
    const t = setTimeout(() => {
      setPendingBadge(null)
      setCardsVisible(true)
    }, 3500)
    return () => clearTimeout(t)
  }, [pendingBadge])

  function handleBadgeDismiss() {
    setPendingBadge(null)
    setCardsVisible(true)
  }

  function copyReferralCode() {
    if (!referralCode) return
    navigator.clipboard.writeText(referralCode).then(() => {
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    })
  }

  const totalXP = xp

  return (
    <>
      {/* ── Fixed radial gold glow backdrop ── */}
      <div
        aria-hidden="true"
        className="pointer-events-none fixed inset-0 z-0"
        style={{
          background: 'radial-gradient(ellipse 70% 50% at 50% 40%, rgba(255,184,0,0.13) 0%, transparent 70%)',
        }}
      />

      {/* ── Subtle grid texture ── */}
      <div
        aria-hidden="true"
        className="pointer-events-none fixed inset-0 z-0 opacity-[0.025]"
        style={{
          backgroundImage:    'linear-gradient(rgba(255,184,0,0.5) 1px, transparent 1px), linear-gradient(90deg, rgba(255,184,0,0.5) 1px, transparent 1px)',
          backgroundSize:     '40px 40px',
        }}
      />

      <div className="relative z-10 flex flex-col items-center pt-4 pb-28 max-w-xl mx-auto px-2">

        {/* ── Hero text ── */}
        <motion.div
          className="text-center mb-8"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.3 }}
        >
          {/* XP pill */}
          <motion.div
            className="inline-flex items-center gap-1.5 rounded-full px-3 py-1.5 mb-5 font-mono text-xs font-bold"
            style={{
              background: 'rgba(255,184,0,0.12)',
              border:     '1px solid rgba(255,184,0,0.35)',
              color:      'var(--brand)',
            }}
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0, transition: { duration: 0.5, delay: 0.15, ease: EASE_OUT } }}
          >
            <span>⚡</span>
            <span>{totalXP} XP earned so far</span>
          </motion.div>

          {/* YOU'RE IN */}
          <motion.h1
            className="font-display leading-none tracking-wide mb-3"
            style={{ color: 'var(--brand)', fontSize: 'clamp(52px, 15vw, 88px)' }}
            initial={{ scale: 0.72, opacity: 0 }}
            animate={{
              scale:   1,
              opacity: 1,
              transition: { type: 'spring' as const, stiffness: 340, damping: 22, delay: 0.2 },
            }}
          >
            YOU'RE IN! 🏆
          </motion.h1>

          {/* Subtitle */}
          <motion.p
            className="font-heading text-lg font-semibold mb-1"
            style={{ color: 'var(--text-1)' }}
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0, transition: { duration: 0.45, ease: EASE_OUT, delay: 0.38 } }}
          >
            Welcome to Super Builders, {firstName}!
          </motion.p>
          <motion.p
            className="font-body text-sm"
            style={{ color: 'var(--text-3)' }}
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0, transition: { duration: 0.4, ease: EASE_OUT, delay: 0.5 } }}
          >
            {tier === 'premium' ? 'Premium' : 'Pro'} · Season 1 · Jun 7–8, 2025
          </motion.p>
        </motion.div>

        {/* ── Onboarding cards — revealed after badge dismisses ── */}
        <AnimatePresence>
          {cardsVisible && (
            <motion.div
              className="w-full grid grid-cols-1 sm:grid-cols-2 gap-3 mb-6"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.3 }}
            >
              {/* Card 1 — Discord */}
              <OnboardCard delay={0}>
                <div className="text-3xl mb-3">💬</div>
                <h3 className="font-heading text-base font-bold mb-1" style={{ color: 'var(--text-1)' }}>
                  Join the Community
                </h3>
                <p className="font-body text-xs mb-4" style={{ color: 'var(--text-3)' }}>
                  Meet your fellow builders on Discord. Intro yourself, find teammates, ask questions.
                </p>
                <a
                  href="https://discord.gg/superbuilders"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="block w-full rounded-xl py-3 text-center font-heading font-semibold text-sm tracking-wide min-h-[44px] transition-all active:scale-[0.97]"
                  style={{ background: 'var(--brand)', color: '#000' }}
                >
                  Join Discord →
                </a>
              </OnboardCard>

              {/* Card 2 — Referral Code */}
              <OnboardCard delay={0.08}>
                <div className="text-3xl mb-3">🎁</div>
                <h3 className="font-heading text-base font-bold mb-1" style={{ color: 'var(--text-1)' }}>
                  Your Referral Code
                </h3>
                <p className="font-body text-xs mb-3" style={{ color: 'var(--text-3)' }}>
                  Earn ₹200 for every friend who registers and pays.
                </p>

                {referralCode ? (
                  <>
                    <div
                      className="rounded-lg px-4 py-3 mb-3 text-center font-mono text-xl font-bold tracking-[0.2em]"
                      style={{
                        background: 'var(--bg-float)',
                        border:     '1px solid var(--border-subtle)',
                        color:      'var(--brand)',
                      }}
                    >
                      {referralCode}
                    </div>
                    <button
                      className="w-full rounded-xl py-3 font-heading font-semibold text-sm tracking-wide min-h-[44px] transition-all active:scale-[0.97]"
                      style={{
                        background: copied ? 'rgba(52,211,153,0.15)' : 'var(--bg-float)',
                        border:     copied ? '1px solid rgba(52,211,153,0.4)' : '1px solid var(--border-soft)',
                        color:      copied ? '#34D399' : 'var(--text-2)',
                      }}
                      onClick={copyReferralCode}
                    >
                      {copied ? '✓ Copied!' : 'Copy Code'}
                    </button>
                  </>
                ) : (
                  <p className="font-mono text-xs" style={{ color: 'var(--text-3)' }}>
                    Your code will appear here shortly.
                  </p>
                )}
              </OnboardCard>

              {/* Card 3 — Workshop 1 */}
              <OnboardCard delay={0.16}>
                <div className="text-3xl mb-3">📅</div>
                <h3 className="font-heading text-base font-bold mb-1" style={{ color: 'var(--text-1)' }}>
                  Workshop 1
                </h3>
                <p className="font-body text-xs mb-1" style={{ color: 'var(--brand)' }}>
                  May 26 · 6:00 PM IST · 90 min
                </p>
                <p className="font-body text-xs mb-4" style={{ color: 'var(--text-3)' }}>
                  AI Fundamentals + Tools Overview. Come ready to build.
                </p>
                <button
                  className="w-full rounded-xl py-3 font-heading font-semibold text-sm tracking-wide min-h-[44px] transition-all active:scale-[0.97]"
                  style={{ background: 'var(--bg-float)', color: 'var(--text-2)', border: '1px solid var(--border-soft)' }}
                  onClick={downloadWorkshop1ICS}
                >
                  + Add to Calendar
                </button>
              </OnboardCard>

              {/* Card 4 — Dashboard */}
              <OnboardCard delay={0.24}>
                <div className="text-3xl mb-3">⚡</div>
                <h3 className="font-heading text-base font-bold mb-1" style={{ color: 'var(--text-1)' }}>
                  Your Dashboard
                </h3>
                <p className="font-body text-xs mb-4" style={{ color: 'var(--text-3)' }}>
                  Track XP, badges, workshop recordings, your team, and project submission — all in one place.
                </p>
                <button
                  className="w-full rounded-xl py-3 font-heading font-semibold text-sm tracking-wide min-h-[44px] transition-all active:scale-[0.97]"
                  style={{ background: 'var(--bg-float)', color: 'var(--text-2)', border: '1px solid var(--border-soft)' }}
                  onClick={() => router.push('/dashboard')}
                >
                  Track Your Journey →
                </button>
              </OnboardCard>
            </motion.div>
          )}
        </AnimatePresence>

        {/* ── Journey preview — staggered stat pills ── */}
        <AnimatePresence>
          {cardsVisible && (
            <motion.div
              className="w-full rounded-2xl p-5 mb-4"
              style={{ background: 'var(--bg-card)', border: '1px solid var(--border-subtle)' }}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0, transition: { duration: 0.5, ease: EASE_OUT, delay: 0.45 } }}
            >
              <p className="font-mono text-[10px] tracking-[0.2em] uppercase mb-4" style={{ color: 'var(--text-3)' }}>
                Your Journey Ahead
              </p>
              <div className="flex flex-wrap gap-3">
                {[
                  { label: '3 Workshops',  sub: 'AI · Domain · Build', color: '#60A5FA' },
                  { label: '24h Hackathon', sub: 'Jun 7–8 · Build something real', color: 'var(--brand)' },
                  { label: '₹1,00,000+',  sub: 'Prize pool',           color: '#34D399' },
                  { label: '9 Badges',    sub: 'Unlock through the journey', color: '#A78BFA' },
                ].map(({ label, sub, color }) => (
                  <div
                    key={label}
                    className="rounded-xl px-4 py-3 flex-1"
                    style={{ background: 'var(--bg-float)', border: '1px solid var(--border-faint)', minWidth: 130 }}
                  >
                    <p className="font-heading text-sm font-bold mb-0.5" style={{ color }}>{label}</p>
                    <p className="font-body text-xs" style={{ color: 'var(--text-3)' }}>{sub}</p>
                  </div>
                ))}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* ── Sticky bottom CTA ── */}
      <div
        className="fixed bottom-0 left-0 right-0 px-4 py-4 safe-bottom z-20"
        style={{
          background:   'rgba(10,10,10,0.95)',
          backdropFilter: 'blur(10px)',
          borderTop:    '1px solid var(--border-faint)',
        }}
      >
        <div className="max-w-xl mx-auto">
          <button
            className="w-full rounded-xl py-4 font-heading font-bold text-base tracking-wide min-h-[52px] transition-all active:scale-[0.97]"
            style={{ background: 'var(--brand)', color: '#000' }}
            onClick={() => router.push('/dashboard')}
          >
            Go to Dashboard →
          </button>
        </div>
      </div>

      {/* ── Badge unlock overlay ── */}
      <BadgeUnlock badge={pendingBadge} onDismiss={handleBadgeDismiss} />
    </>
  )
}

// ─── Onboarding card wrapper ──────────────────────────────────────────────────

function OnboardCard({ children, delay }: { children: React.ReactNode; delay: number }) {
  return (
    <motion.div
      className="rounded-2xl p-5 flex flex-col"
      style={{ background: 'var(--bg-card)', border: '1px solid var(--border-subtle)' }}
      initial={{ opacity: 0, y: 24, scale: 0.97 }}
      animate={{
        opacity:    1,
        y:          0,
        scale:      1,
        transition: { duration: 0.45, ease: [0.16, 1, 0.3, 1] as Bez, delay },
      }}
    >
      {children}
    </motion.div>
  )
}
