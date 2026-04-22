'use client'

import { useState, useRef } from 'react'
import { useRouter }        from 'next/navigation'
import { motion, useInView } from 'framer-motion'
import { completeOrientation } from '@/lib/actions/registration'
import type { ScheduleItem }   from '@/lib/db/queries/config'

// ─── Animation wrapper ────────────────────────────────────────────────────────
function FadeUp({
  children,
  delay = 0,
  className,
}: {
  children: React.ReactNode
  delay?: number
  className?: string
}) {
  const ref = useRef<HTMLDivElement>(null)
  const inView = useInView(ref, { once: true, margin: '-40px' })
  return (
    <motion.div
      ref={ref}
      className={className}
      initial={{ opacity: 0, y: 24 }}
      animate={inView ? { opacity: 1, y: 0 } : { opacity: 0, y: 24 }}
      transition={{ duration: 0.45, ease: [0.16, 1, 0.3, 1], delay }}
    >
      {children}
    </motion.div>
  )
}

// ─── Section heading ─────────────────────────────────────────────────────────
function SectionHeading({ children }: { children: React.ReactNode }) {
  return (
    <h2
      className="font-display text-2xl tracking-widest scroll-mt-4"
      style={{ color: 'var(--brand)' }}
    >
      {children}
    </h2>
  )
}

// ─── Key dates card ──────────────────────────────────────────────────────────
type KeyDate = { label: string; date: string; active: boolean }

const DEFAULT_KEY_DATES: KeyDate[] = [
  { label: 'Orientation',             date: 'Today — you\'re here! 🎉',        active: true  },
  { label: 'Workshop 1 (AI Basics)',  date: 'May 26, 6PM IST · 90 mins',        active: false },
  { label: 'Workshop 2 (Domain)',     date: 'Jun 1–3',                           active: false },
  { label: 'Workshop 3 (Build)',      date: 'Jun 3–5',                           active: false },
  { label: 'Hackathon',               date: 'Jun 7–8 · 24 hours! 🔥',            active: false },
  { label: 'Results + Certificates',  date: 'Jun 9–10 🏆',                       active: false },
]

// ─── Programme rules ─────────────────────────────────────────────────────────
const RULES = [
  'I will attend at least 2 of the 3 workshops (or watch replays)',
  'I will build an original project — no copy-pasting',
  'I will submit my project during the hackathon window (Jun 7–8)',
  'I understand this is a learning programme, not just a competition',
]

// ─── Main component ──────────────────────────────────────────────────────────
export function OrientationClient({
  firstName,
  keyDates = DEFAULT_KEY_DATES,
  adminVideos = [],
}: {
  studentId:    string
  firstName:    string
  keyDates?:    KeyDate[]
  adminVideos?: Pick<ScheduleItem, 'id' | 'title' | 'description' | 'url'>[]
}) {
  const router  = useRouter()
  const [loading, setLoading] = useState(false)
  const [error,   setError]   = useState('')

  async function handleReady() {
    setLoading(true)
    setError('')
    try {
      const res = await completeOrientation()
      if (res.success) {
        router.push('/dashboard/domain')
      } else {
        setError('Something went wrong. Please try again.')
        setLoading(false)
      }
    } catch {
      setError('Something went wrong. Please try again.')
      setLoading(false)
    }
  }

  return (
    <div className="max-w-2xl mx-auto px-4 md:px-6 pt-5 pb-12">
    <div className="flex flex-col gap-10">

      {/* ── SECTION 1 — Welcome ─────────────────────────────────────────── */}
      <FadeUp>
        <div className="flex flex-col gap-4">
          <SectionHeading>WELCOME 🚀</SectionHeading>

          <motion.h1
            className="font-display text-3xl sm:text-4xl leading-tight"
            style={{ color: 'var(--text-1)' }}
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.1, ease: [0.16, 1, 0.3, 1] }}
          >
            Welcome to Super Builders,{' '}
            <span style={{ color: 'var(--brand)' }}>{firstName}!</span>
          </motion.h1>

          <p className="text-sm sm:text-base leading-relaxed" style={{ color: 'var(--text-2)' }}>
            Before you take the quiz, let&apos;s make sure you know what you&apos;re getting into.
            This is going to be intense, fun, and unforgettable. 🧠
          </p>

          {/* Key dates */}
          <div
            className="rounded-xl border overflow-hidden mt-2"
            style={{ borderColor: 'var(--border-subtle)', background: 'var(--bg-card)' }}
          >
            <div
              className="px-4 py-2.5 border-b"
              style={{ borderColor: 'var(--border-faint)', background: 'var(--bg-raised)' }}
            >
              <p className="text-xs font-mono tracking-widest uppercase" style={{ color: 'var(--text-3)' }}>
                Programme Schedule
              </p>
            </div>
            <div className="divide-y" style={{ '--tw-divide-opacity': 1 } as React.CSSProperties}>
              {keyDates.map((item) => (
                <div
                  key={item.label}
                  className="flex items-center justify-between px-4 py-3 gap-3"
                  style={{
                    background: item.active ? 'var(--brand-subtle)' : 'transparent',
                  }}
                >
                  <span
                    className="text-sm font-medium"
                    style={{ color: item.active ? 'var(--text-brand)' : 'var(--text-2)' }}
                  >
                    {item.label}
                  </span>
                  <span
                    className="text-xs text-right shrink-0"
                    style={{ color: item.active ? 'var(--brand)' : 'var(--text-3)' }}
                  >
                    {item.date}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </FadeUp>

      {/* Divider */}
      <div className="h-px" style={{ background: 'var(--border-faint)' }} />

      {/* ── SECTION 2 — Video ───────────────────────────────────────────── */}
      <FadeUp delay={0.05}>
        <div className="flex flex-col gap-4">
          <SectionHeading>WATCH FIRST 🎬</SectionHeading>

          {adminVideos.length > 0 ? (
            /* Dynamic videos from admin schedule */
            <div className="flex flex-col gap-6">
              {adminVideos.map((vid) => {
                // Convert YouTube watch URL to embed URL
                const src = vid.url!.includes('youtu.be/')
                  ? `https://www.youtube.com/embed/${vid.url!.split('youtu.be/')[1]?.split('?')[0]}`
                  : vid.url!.includes('youtube.com/watch')
                  ? `https://www.youtube.com/embed/${new URLSearchParams(vid.url!.split('?')[1]).get('v')}`
                  : vid.url! // already an embed or other URL
                return (
                  <div key={vid.id} className="flex flex-col gap-2">
                    {adminVideos.length > 1 && (
                      <p className="text-sm font-semibold" style={{ color: 'var(--text-1)' }}>
                        {vid.title}
                      </p>
                    )}
                    {vid.description && (
                      <p className="text-sm" style={{ color: 'var(--text-3)' }}>{vid.description}</p>
                    )}
                    <div
                      className="relative w-full rounded-xl overflow-hidden border"
                      style={{
                        paddingBottom: '56.25%',
                        borderColor: 'var(--border-brand)',
                        boxShadow: 'var(--shadow-brand-sm)',
                      }}
                    >
                      <iframe
                        src={src}
                        title={vid.title}
                        allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                        allowFullScreen
                        className="absolute inset-0 w-full h-full"
                        style={{ border: 'none' }}
                      />
                    </div>
                  </div>
                )
              })}
            </div>
          ) : (
            /* Static fallback until admin adds a video */
            <>
              <p className="text-sm" style={{ color: 'var(--text-3)' }}>
                Watch: What is Super Builders? (3 mins)
              </p>
              <div
                className="relative w-full rounded-xl overflow-hidden border"
                style={{
                  paddingBottom: '56.25%',
                  borderColor: 'var(--border-brand)',
                  boxShadow: 'var(--shadow-brand-sm)',
                }}
              >
                <iframe
                  src="https://www.youtube.com/embed/dQw4w9WgXcQ"
                  title="What is Super Builders?"
                  allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                  allowFullScreen
                  className="absolute inset-0 w-full h-full"
                  style={{ border: 'none' }}
                />
              </div>
            </>
          )}

          <p className="text-xs" style={{ color: 'var(--text-4)' }}>
            Don&apos;t worry if you can&apos;t watch now — you can revisit this later.
          </p>
        </div>
      </FadeUp>

      {/* Divider */}
      <div className="h-px" style={{ background: 'var(--border-faint)' }} />

      {/* ── SECTION 3 — Community ───────────────────────────────────────── */}
      <FadeUp delay={0.05}>
        <div className="flex flex-col gap-4">
          <SectionHeading>JOIN THE COMMUNITY 👥</SectionHeading>

          <div className="flex flex-col gap-3">
            {/* Discord */}
            <a
              href="https://discord.gg/superbuilders"
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center justify-between px-4 py-4 rounded-xl border transition-all duration-150 active:scale-[0.98] active:opacity-80 min-h-[72px]"
              style={{
                background:   'var(--bg-card)',
                borderColor:  'rgba(99,102,241,0.35)',
                boxShadow:    '0 0 16px rgba(99,102,241,0.08)',
              }}
            >
              <div className="flex items-center gap-3">
                {/* Discord icon */}
                <div
                  className="flex h-10 w-10 items-center justify-center rounded-lg shrink-0"
                  style={{ background: 'rgba(99,102,241,0.15)' }}
                >
                  <svg width="22" height="17" viewBox="0 0 24 18" fill="none" aria-hidden="true">
                    <path
                      d="M20.317 1.492A19.825 19.825 0 0015.971.5a.075.075 0 00-.079.037c-.19.339-.402.782-.55 1.131a18.301 18.301 0 00-5.487 0 11.3 11.3 0 00-.558-1.131.077.077 0 00-.079-.037A19.736 19.736 0 003.677 1.492a.07.07 0 00-.032.027C.533 5.757-.32 9.9.099 13.987a.082.082 0 00.031.055 19.9 19.9 0 005.993 3.03.078.078 0 00.084-.028c.462-.63.874-1.295 1.226-1.994a.076.076 0 00-.041-.106 13.107 13.107 0 01-1.872-.892.077.077 0 01-.008-.128 10.2 10.2 0 00.372-.292.074.074 0 01.077-.01c3.928 1.793 8.18 1.793 12.062 0a.074.074 0 01.078.01c.12.098.246.198.373.292a.077.077 0 01-.006.127 12.3 12.3 0 01-1.873.892.077.077 0 00-.041.107c.36.698.772 1.362 1.225 1.993a.076.076 0 00.084.028 19.839 19.839 0 006.002-3.03.077.077 0 00.032-.054c.5-5.177-.838-9.674-3.549-13.468a.061.061 0 00-.031-.03zM8.02 11.278c-1.183 0-2.157-1.085-2.157-2.419 0-1.333.956-2.419 2.157-2.419 1.21 0 2.176 1.095 2.157 2.42 0 1.333-.956 2.418-2.157 2.418zm7.975 0c-1.183 0-2.157-1.085-2.157-2.419 0-1.333.955-2.419 2.157-2.419 1.21 0 2.176 1.095 2.157 2.42 0 1.333-.946 2.418-2.157 2.418z"
                      fill="#818CF8"
                    />
                  </svg>
                </div>
                <div>
                  <p className="text-sm font-semibold" style={{ color: 'var(--text-1)' }}>
                    Join 2,847 builders on Discord
                  </p>
                  <p className="text-xs mt-0.5" style={{ color: 'var(--text-3)' }}>
                    Ask questions · find teammates · get help
                  </p>
                </div>
              </div>
              <span className="text-xs font-mono shrink-0" style={{ color: '#818CF8' }}>
                Join →
              </span>
            </a>

            {/* WhatsApp */}
            <a
              href="https://chat.whatsapp.com/Kn9WvBrBsXsJ4PWg1rJC56"
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center justify-between px-4 py-4 rounded-xl border transition-all duration-150 active:scale-[0.98] active:opacity-80 min-h-[72px]"
              style={{
                background:  'var(--bg-card)',
                borderColor: 'rgba(34,197,94,0.35)',
                boxShadow:   '0 0 16px rgba(34,197,94,0.06)',
              }}
            >
              <div className="flex items-center gap-3">
                {/* WhatsApp icon */}
                <div
                  className="flex h-10 w-10 items-center justify-center rounded-lg shrink-0"
                  style={{ background: 'rgba(34,197,94,0.12)' }}
                >
                  <svg width="22" height="22" viewBox="0 0 24 24" fill="none" aria-hidden="true">
                    <path
                      d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347z"
                      fill="#22C55E"
                    />
                    <path
                      d="M12 2C6.477 2 2 6.477 2 12c0 1.89.525 3.659 1.438 5.168L2 22l4.975-1.406A9.955 9.955 0 0012 22c5.523 0 10-4.477 10-10S17.523 2 12 2zm0 18a7.946 7.946 0 01-4.049-1.107l-.29-.173-3.006.849.85-2.927-.19-.3A7.964 7.964 0 014 12c0-4.418 3.582-8 8-8s8 3.582 8 8-3.582 8-8 8z"
                      fill="#22C55E"
                    />
                  </svg>
                </div>
                <div>
                  <p className="text-sm font-semibold" style={{ color: 'var(--text-1)' }}>
                    Parent WhatsApp Group
                  </p>
                  <p className="text-xs mt-0.5" style={{ color: 'var(--text-3)' }}>
                    Schedule updates · safety info · support
                  </p>
                </div>
              </div>
              <span className="text-xs font-mono shrink-0" style={{ color: '#22C55E' }}>
                Join →
              </span>
            </a>
          </div>
        </div>
      </FadeUp>

      {/* Divider */}
      <div className="h-px" style={{ background: 'var(--border-faint)' }} />

      {/* ── SECTION 4 — Rules & CTA ─────────────────────────────────────── */}
      <FadeUp delay={0.05}>
        <div className="flex flex-col gap-5">
          <SectionHeading>THE DEAL 🤝</SectionHeading>

          {/* Rules checklist */}
          <div className="flex flex-col gap-3">
            {RULES.map((rule, i) => (
              <div key={i} className="flex items-start gap-3">
                <div
                  className="flex h-5 w-5 shrink-0 mt-0.5 items-center justify-center rounded-full"
                  style={{ background: 'var(--brand)', color: '#000' }}
                >
                  <svg width="10" height="8" viewBox="0 0 10 8" fill="none" aria-hidden="true">
                    <path
                      d="M1 4L3.5 6.5L9 1.5"
                      stroke="currentColor"
                      strokeWidth="1.8"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    />
                  </svg>
                </div>
                <p className="text-sm leading-snug" style={{ color: 'var(--text-2)' }}>
                  {rule}
                </p>
              </div>
            ))}
          </div>

          {/* Error */}
          {error && (
            <p
              className="text-xs font-mono px-3 py-2 rounded-lg border"
              style={{
                color:       'var(--red)',
                background:  'var(--red-bg)',
                borderColor: 'rgba(248,113,113,0.25)',
              }}
            >
              ✕ {error}
            </p>
          )}

          {/* CTA */}
          <motion.button
            onClick={handleReady}
            disabled={loading}
            className="w-full min-h-[52px] rounded-xl font-heading font-bold text-base tracking-wide transition-all duration-150 active:scale-[0.98] active:opacity-90 disabled:opacity-60 disabled:cursor-not-allowed flex items-center justify-center gap-2 mt-2"
            style={{
              background: loading ? 'var(--brand-dim)' : 'var(--brand)',
              color: '#000',
              boxShadow: loading ? 'none' : 'var(--shadow-brand)',
            }}
            whileTap={{ scale: 0.97 }}
          >
            {loading ? (
              <>
                <svg
                  className="animate-spin h-4 w-4 shrink-0"
                  fill="none"
                  viewBox="0 0 24 24"
                  aria-hidden="true"
                >
                  <circle
                    className="opacity-25"
                    cx="12" cy="12" r="10"
                    stroke="currentColor"
                    strokeWidth="4"
                  />
                  <path
                    className="opacity-75"
                    fill="currentColor"
                    d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"
                  />
                </svg>
                <span>Unlocking your quiz journey…</span>
              </>
            ) : (
              <span>I&apos;m Ready — Start My Quiz Journey 🧠</span>
            )}
          </motion.button>

          <p className="text-center text-xs" style={{ color: 'var(--text-4)' }}>
            This unlocks Domain Selection + the AI Quiz
          </p>
        </div>
      </FadeUp>

    </div>
    </div>
  )
}
