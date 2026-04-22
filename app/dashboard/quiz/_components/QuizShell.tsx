'use client'

import { useEffect, useRef, useState } from 'react'
import { useRouter } from 'next/navigation'
import { motion, AnimatePresence } from 'framer-motion'
import { BadgeUnlock } from '@/components/gamification/BadgeUnlock'
import { QUIZ_QUESTIONS, CORRECT_ANSWERS, SHORT_ANSWER_MIN, DOMAIN_META } from '@/lib/content/quizQuestions'
import type { BadgeId } from '@/lib/gamification/badges'

// ─── Types ────────────────────────────────────────────────────────────────────

type Phase = 'intro' | 'question' | 'submitting' | 'results' | 'locked'

const TIMER_START = 5 * 60 // 300s

// ─── Motion helpers ───────────────────────────────────────────────────────────

type Bez = [number, number, number, number]
const EASE_OUT: Bez   = [0.16, 1, 0.3, 1]
const EASE_IN_OUT: Bez = [0.87, 0, 0.13, 1]

const slideVariants = {
  enter: (dir: number) => ({ x: dir > 0 ? '60%' : '-60%', opacity: 0 }),
  center: { x: 0, opacity: 1, transition: { duration: 0.32, ease: EASE_OUT } },
  exit:   (dir: number) => ({
    x: dir > 0 ? '-30%' : '30%',
    opacity: 0,
    transition: { duration: 0.22, ease: EASE_IN_OUT },
  }),
}

const fadeUp = {
  hidden:  { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.4, ease: EASE_OUT } },
}

// ─── Helpers ──────────────────────────────────────────────────────────────────

function isAnswered(qId: number, ans: string | undefined, shortMin: Record<number, number>): boolean {
  if (!ans) return false
  if (shortMin[qId] !== undefined) return ans.trim().length >= 1 // allow Next if any text
  return ans.length > 0
}

function isCorrect(qId: number, ans: string, correctKeys: Record<number, string>, shortMin: Record<number, number>): boolean {
  if (shortMin[qId] !== undefined) return ans.trim().length >= shortMin[qId]
  return correctKeys[qId] === ans
}

function fmtTime(secs: number): string {
  const m = Math.floor(secs / 60)
  const s = secs % 60
  return `${m}:${s.toString().padStart(2, '0')}`
}

// ─── Props ────────────────────────────────────────────────────────────────────

interface QuizShellProps {
  domain:        string
  attemptCount:  number
  isLocked:      boolean
  lastAttemptAt: string | null
}

// ─── Component ────────────────────────────────────────────────────────────────

export function QuizShell({ domain, attemptCount, isLocked, lastAttemptAt }: QuizShellProps) {
  const QUESTIONS    = QUIZ_QUESTIONS[domain]    ?? QUIZ_QUESTIONS['health']
  const CORRECT_KEYS = CORRECT_ANSWERS[domain]   ?? {}
  const SHORT_MIN    = SHORT_ANSWER_MIN
  const TOTAL        = QUESTIONS.length
  const router = useRouter()

  const [phase, setPhase]               = useState<Phase>(isLocked ? 'locked' : 'intro')
  const [currentQ, setCurrentQ]         = useState(0)
  const [direction, setDirection]       = useState(1)
  const [answers, setAnswers]           = useState<Record<number, string>>({})
  const [timeLeft, setTimeLeft]         = useState(TIMER_START)
  const [score, setScore]               = useState<number | null>(null)
  const [displayScore, setDisplayScore] = useState(0)
  const [passed, setPassed]             = useState(false)
  const [serverError, setServerError]   = useState<string | null>(null)
  const [pendingBadge, setPendingBadge] = useState<BadgeId | null>(null)
  const [unlockCountdown, setUnlockCountdown] = useState<string>('')

  const timerRef    = useRef<ReturnType<typeof setInterval> | null>(null)
  const submitGuard = useRef(false)

  // ── Timer ──────────────────────────────────────────────────────────────────
  useEffect(() => {
    if (phase !== 'question') return
    timerRef.current = setInterval(() => {
      setTimeLeft(t => {
        if (t <= 1) {
          clearInterval(timerRef.current!)
          handleAutoSubmit()
          return 0
        }
        return t - 1
      })
    }, 1000)
    return () => clearInterval(timerRef.current!)
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [phase])

  // ── Locked countdown ──────────────────────────────────────────────────────
  useEffect(() => {
    if (phase !== 'locked' || !lastAttemptAt) return
    const update = () => {
      const unlockAt = new Date(new Date(lastAttemptAt).getTime() + 24 * 60 * 60 * 1000)
      const diff = Math.max(0, unlockAt.getTime() - Date.now())
      if (diff === 0) { setUnlockCountdown('unlocked'); return }
      const h = Math.floor(diff / 3600000)
      const m = Math.floor((diff % 3600000) / 60000)
      setUnlockCountdown(`${h}h ${m}m`)
    }
    update()
    const id = setInterval(update, 30000)
    return () => clearInterval(id)
  }, [phase, lastAttemptAt])

  // ── Score animation ───────────────────────────────────────────────────────
  useEffect(() => {
    if (score === null || phase !== 'results') return
    let n = 0
    const step = () => {
      n += 1
      setDisplayScore(n)
      if (n < score!) setTimeout(step, 80)
    }
    const t = setTimeout(step, 400)
    return () => clearTimeout(t)
  }, [score, phase])

  // ── Submit logic ──────────────────────────────────────────────────────────
  // Uses fetch (not server action) so Next.js doesn't auto-refresh the page,
  // which would trigger the quiz page's `if (hasPassed) redirect(...)` before
  // the results screen has a chance to render.
  async function runSubmit(finalAnswers: Record<number, string>) {
    if (submitGuard.current) return
    submitGuard.current = true
    clearInterval(timerRef.current!)
    setPhase('submitting')

    const payload = QUESTIONS.map(q => ({
      questionId: q.id,
      answer:     finalAnswers[q.id] ?? '',
    }))

    try {
      const res  = await fetch('/api/quiz/submit', {
        method:  'POST',
        headers: { 'Content-Type': 'application/json' },
        body:    JSON.stringify({ answers: payload }),
      })
      const data = await res.json()

      if (!res.ok || data.error) {
        setServerError(data.error ?? 'Submission failed. Please try again.')
        setScore(0)
        setPassed(false)
        setPhase('results')
        return
      }

      setScore(data.score)
      setPassed(data.passed)
      setPhase('results')

      if (data.passed && data.badgeAwarded) {
        setTimeout(() => setPendingBadge(data.badgeAwarded as BadgeId), 800)
      }
    } catch {
      setServerError('Network error. Check your connection and try again.')
      setScore(0)
      setPassed(false)
      setPhase('results')
    }
  }

  function handleAutoSubmit() {
    setAnswers(prev => { runSubmit(prev); return prev })
  }

  function handleStart() {
    setPhase('question')
    setCurrentQ(0)
    setDirection(1)
    setTimeLeft(TIMER_START)
  }

  function handleSelect(key: string) {
    const qId = QUESTIONS[currentQ].id
    setAnswers(prev => ({ ...prev, [qId]: key }))
  }

  function handleShortChange(val: string) {
    const qId = QUESTIONS[currentQ].id
    setAnswers(prev => ({ ...prev, [qId]: val }))
  }

  function handleNext() {
    if (currentQ < TOTAL - 1) {
      setDirection(1)
      setCurrentQ(q => q + 1)
    } else {
      runSubmit(answers)
    }
  }

  const q         = QUESTIONS[currentQ]
  const curAnswer = answers[q?.id] ?? ''
  const canNext   = q ? isAnswered(q.id, curAnswer, SHORT_MIN) : false
  const isRed     = timeLeft <= 60
  const pct       = ((currentQ) / TOTAL) * 100

  // ─────────────────────────────────────────────────────────────────────────
  // LOCKED SCREEN
  // ─────────────────────────────────────────────────────────────────────────
  if (phase === 'locked') {
    return (
      <motion.div
        className="flex flex-col items-center justify-center min-h-[60vh] px-4 py-12 text-center"
        variants={fadeUp} initial="hidden" animate="visible"
      >
        <div className="text-6xl mb-6 select-none">🔒</div>
        <h1 className="font-display text-4xl tracking-wide mb-3" style={{ color: 'var(--text-1)' }}>
          MAX ATTEMPTS REACHED
        </h1>
        <p className="font-body text-base mb-2" style={{ color: 'var(--text-2)' }}>
          You&apos;ve used both quiz attempts. Don&apos;t worry — your journey continues!
        </p>
        <p className="font-body text-sm mb-8" style={{ color: 'var(--text-3)' }}>
          Our team reviews borderline scores manually. You&apos;ll hear from us within 48 hours.
        </p>
        {unlockCountdown && unlockCountdown !== 'unlocked' && (
          <div
            className="rounded-xl px-6 py-4 mb-6 font-mono text-sm"
            style={{
              background:   'var(--bg-card)',
              border:       '1px solid var(--border-subtle)',
              color:        'var(--text-2)',
            }}
          >
            Score unlock check in: <span style={{ color: 'var(--brand)' }}>{unlockCountdown}</span>
          </div>
        )}
        <button
          className="rounded-xl px-8 py-3 font-heading font-semibold text-sm tracking-wide min-h-[44px] transition-all active:scale-95"
          style={{ background: 'var(--bg-float)', color: 'var(--text-2)', border: '1px solid var(--border-soft)' }}
          onClick={() => router.push('/register')}
        >
          Back to Dashboard
        </button>
      </motion.div>
    )
  }

  // ─────────────────────────────────────────────────────────────────────────
  // INTRO SCREEN
  // ─────────────────────────────────────────────────────────────────────────
  if (phase === 'intro') {
    return (
      <motion.div
        className="flex flex-col items-center justify-center min-h-[65vh] px-4 py-10 text-center max-w-md mx-auto"
        variants={fadeUp} initial="hidden" animate="visible"
      >
        <motion.div
          className="text-7xl mb-6 select-none"
          initial={{ scale: 0.6, opacity: 0 }}
          animate={{ scale: 1, opacity: 1, transition: { type: 'spring' as const, stiffness: 400, damping: 20, delay: 0.1 } }}
        >
          {DOMAIN_META[domain]?.emoji ?? '🧠'}
        </motion.div>

        <h1 className="font-display text-5xl tracking-wide mb-3 text-center" style={{ color: 'var(--text-1)' }}>
          {(DOMAIN_META[domain]?.label ?? 'AI').toUpperCase()} CHALLENGE
        </h1>

        <p className="font-body text-base mb-8 max-w-[260px]" style={{ color: 'var(--text-2)' }}>
          10 questions · 5 minutes · Score 6+ to advance
        </p>

        {/* Rules card */}
        <div
          className="w-full rounded-2xl p-5 mb-8 text-left"
          style={{ background: 'var(--bg-card)', border: '1px solid var(--border-subtle)' }}
        >
          {[
            { icon: '⏱️', text: '5-minute countdown — answer at your own pace' },
            { icon: '🎯', text: 'Score 6 out of 10 to get shortlisted' },
            { icon: '🔁', text: `${attemptCount === 0 ? '2 attempts available' : '1 attempt remaining'} — make it count` },
            { icon: '✍️', text: 'Two open-ended questions — your words matter' },
          ].map(({ icon, text }) => (
            <div key={text} className="flex items-start gap-3 mb-3 last:mb-0">
              <span className="text-lg shrink-0 mt-0.5">{icon}</span>
              <span className="font-body text-sm leading-snug" style={{ color: 'var(--text-2)' }}>{text}</span>
            </div>
          ))}
        </div>

        <button
          className="w-full rounded-xl py-4 font-heading font-semibold text-base tracking-wide min-h-[52px] transition-all active:scale-95"
          style={{ background: 'var(--brand)', color: '#000' }}
          onClick={handleStart}
        >
          Start Challenge →
        </button>
      </motion.div>
    )
  }

  // ─────────────────────────────────────────────────────────────────────────
  // SUBMITTING SCREEN
  // ─────────────────────────────────────────────────────────────────────────
  if (phase === 'submitting') {
    return (
      <motion.div
        className="flex flex-col items-center justify-center min-h-[60vh] gap-5 px-4"
        variants={fadeUp} initial="hidden" animate="visible"
      >
        <motion.div
          className="w-12 h-12 rounded-full border-4"
          style={{ borderColor: 'var(--brand)', borderTopColor: 'transparent' }}
          animate={{ rotate: 360 }}
          transition={{ duration: 0.8, repeat: Infinity, ease: 'linear' }}
        />
        <p className="font-heading text-lg" style={{ color: 'var(--text-2)' }}>
          Scoring your answers…
        </p>
      </motion.div>
    )
  }

  // ─────────────────────────────────────────────────────────────────────────
  // RESULTS SCREEN
  // ─────────────────────────────────────────────────────────────────────────
  if (phase === 'results') {
    const wrongIds = QUESTIONS
      .filter(q => !isCorrect(q.id, answers[q.id] ?? '', CORRECT_KEYS, SHORT_MIN))
      .map(q => q.id)

    return (
      <>
        <motion.div
          className="flex flex-col items-center px-4 py-10 max-w-lg mx-auto"
          variants={fadeUp} initial="hidden" animate="visible"
        >
          {/* Score ring */}
          <div
            className="relative flex items-center justify-center w-36 h-36 rounded-full mb-6"
            style={{
              background: passed
                ? 'radial-gradient(circle, rgba(52,211,153,0.15) 0%, transparent 70%)'
                : 'radial-gradient(circle, rgba(248,113,113,0.12) 0%, transparent 70%)',
              border: `3px solid ${passed ? '#34D399' : '#F87171'}`,
              boxShadow: passed ? '0 0 32px rgba(52,211,153,0.3)' : '0 0 32px rgba(248,113,113,0.25)',
            }}
          >
            <div className="text-center">
              <div
                className="font-display text-5xl leading-none"
                style={{ color: passed ? '#34D399' : '#F87171' }}
              >
                {displayScore}
              </div>
              <div className="font-mono text-xs mt-1" style={{ color: 'var(--text-3)' }}>
                / {TOTAL}
              </div>
            </div>
          </div>

          {/* Heading */}
          <h1
            className="font-display text-4xl tracking-wide text-center mb-2"
            style={{ color: 'var(--text-1)' }}
          >
            {passed ? "YOU'RE SHORTLISTED! 🎉" : 'SO CLOSE!'}
          </h1>
          <p className="font-body text-sm text-center mb-8" style={{ color: 'var(--text-2)' }}>
            {passed
              ? "Score 6+ confirmed. Unlock your idea form and keep building."
              : `You scored ${score ?? 0}/10. You need 6 to advance.`}
          </p>

          {serverError && (
            <div
              className="w-full rounded-xl px-4 py-3 mb-6 font-body text-sm text-center"
              style={{ background: 'var(--red-bg)', color: 'var(--red)', border: '1px solid rgba(248,113,113,0.3)' }}
            >
              {serverError}
            </div>
          )}

          {/* Failed — show wrong questions */}
          {!passed && wrongIds.length > 0 && (
            <div
              className="w-full rounded-2xl p-5 mb-6"
              style={{ background: 'var(--bg-card)', border: '1px solid var(--border-subtle)' }}
            >
              <p className="font-mono text-[12px] tracking-[0.15em] uppercase mb-4" style={{ color: 'var(--text-3)' }}>
                Missed Questions
              </p>
              {wrongIds.map(id => {
                const wq = QUESTIONS.find(x => x.id === id)!
                const isShort = SHORT_MIN[id] !== undefined
                const myAns = answers[id] ?? ''
                const correctOpt = wq.options?.find(o => o.key === CORRECT_KEYS[id])
                return (
                  <div key={id} className="mb-4 last:mb-0">
                    <p className="font-body text-xs leading-snug mb-1" style={{ color: 'var(--text-2)' }}>
                      <span className="font-mono" style={{ color: 'var(--text-3)' }}>Q{id}. </span>
                      {wq.question}
                    </p>
                    {isShort ? (
                      <div className="flex items-center gap-1.5 text-xs font-mono" style={{ color: '#F87171' }}>
                        <span>✗</span>
                        <span>
                          {myAns.trim().length === 0
                            ? 'No answer given'
                            : `Too short (${myAns.trim().length}/${SHORT_MIN[id]} chars)`}
                        </span>
                      </div>
                    ) : (
                      <div className="flex flex-col gap-1 text-xs font-mono">
                        {myAns && (
                          <span style={{ color: '#F87171' }}>
                            ✗ Your answer: {wq.options?.find(o => o.key === myAns)?.label ?? myAns}
                          </span>
                        )}
                        {correctOpt && (
                          <span style={{ color: '#34D399' }}>
                            ✓ Correct: {correctOpt.label}
                          </span>
                        )}
                      </div>
                    )}
                  </div>
                )
              })}
            </div>
          )}

          {/* CTA */}
          {passed ? (
            <button
              className="w-full rounded-xl py-4 font-heading font-semibold text-base tracking-wide min-h-[52px] transition-all active:scale-95"
              style={{ background: 'var(--brand)', color: '#000' }}
              onClick={() => router.push('/dashboard/idea')}
            >
              Continue to Your Idea →
            </button>
          ) : (
            <div className="w-full flex flex-col gap-3">
              {attemptCount < 2 ? (
                <button
                  className="w-full rounded-xl py-4 font-heading font-semibold text-base tracking-wide min-h-[52px] transition-all active:scale-95"
                  style={{ background: 'var(--brand)', color: '#000' }}
                  onClick={() => {
                    submitGuard.current = false
                    setAnswers({})
                    setScore(null)
                    setDisplayScore(0)
                    setTimeLeft(TIMER_START)
                    setCurrentQ(0)
                    setDirection(1)
                    setServerError(null)
                    setPhase('question')
                  }}
                >
                  Try Again (Last Attempt)
                </button>
              ) : (
                <div
                  className="w-full rounded-xl px-5 py-4 text-center font-body text-sm"
                  style={{ background: 'var(--bg-card)', border: '1px solid var(--border-subtle)', color: 'var(--text-2)' }}
                >
                  No more attempts. Our team will review your scores manually within 48 hours.
                </div>
              )}
              <button
                className="w-full rounded-xl py-3 font-heading text-sm font-semibold tracking-wide min-h-[44px] transition-all active:scale-95"
                style={{ background: 'var(--bg-float)', color: 'var(--text-2)', border: '1px solid var(--border-soft)' }}
                onClick={() => router.push('/register')}
              >
                Back to Dashboard
              </button>
            </div>
          )}
        </motion.div>

        <BadgeUnlock badge={pendingBadge} onDismiss={() => {
          setPendingBadge(null)
          router.push('/dashboard/idea')
        }} />
      </>
    )
  }

  // ─────────────────────────────────────────────────────────────────────────
  // QUESTION SCREEN
  // ─────────────────────────────────────────────────────────────────────────
  return (
    <>
      {/* ── Progress bar ── */}
      <div className="fixed top-0 left-0 right-0 z-20 h-1" style={{ background: 'var(--bg-raised)' }}>
        <motion.div
          className="h-full"
          style={{ background: 'var(--brand)' }}
          initial={false}
          animate={{ width: `${pct}%` }}
          transition={{ duration: 0.35, ease: EASE_OUT }}
        />
      </div>

      {/* ── Header bar ── */}
      <div
        className="sticky top-0 z-10 flex items-center justify-between px-4 py-3"
        style={{ background: 'rgba(10,10,10,0.92)', backdropFilter: 'blur(8px)', borderBottom: '1px solid var(--border-faint)' }}
      >
        <div className="flex items-center gap-2">
          <span className="font-mono text-xs" style={{ color: 'var(--text-3)' }}>
            Q{currentQ + 1} of {TOTAL}
          </span>
          <span
            className="hidden sm:inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-[10px] font-mono"
            style={{ background: 'var(--brand-subtle)', color: 'var(--text-brand)', border: '1px solid var(--border-brand)' }}
          >
            {DOMAIN_META[domain]?.emoji} {DOMAIN_META[domain]?.label}
          </span>
        </div>

        {/* Timer */}
        <motion.span
          className="font-mono text-xl font-bold tabular-nums"
          style={{ color: isRed ? 'var(--red)' : 'var(--brand)' }}
          animate={isRed ? { scale: [1, 1.06, 1] } : {}}
          transition={{ duration: 0.6, repeat: isRed ? Infinity : 0, repeatType: 'loop' }}
        >
          {fmtTime(timeLeft)}
        </motion.span>

        {/* Dot progress */}
        <div className="flex items-center gap-1">
          {QUESTIONS.map((_, i) => (
            <div
              key={i}
              className="rounded-full transition-all duration-300"
              style={{
                width:  i === currentQ ? 8 : 5,
                height: i === currentQ ? 8 : 5,
                background: answers[QUESTIONS[i].id]
                  ? 'var(--brand)'
                  : i === currentQ
                  ? 'var(--text-2)'
                  : 'var(--border-subtle)',
              }}
            />
          ))}
        </div>
      </div>

      {/* ── Question card ── */}
      <div className="px-4 pt-6 pb-24 max-w-lg mx-auto overflow-hidden">
        <AnimatePresence mode="wait" custom={direction}>
          <motion.div
            key={currentQ}
            custom={direction}
            variants={slideVariants}
            initial="enter"
            animate="center"
            exit="exit"
          >
            {/* Question text */}
            <h2
              className="font-heading text-xl font-bold leading-snug mb-6"
              style={{ color: 'var(--text-1)' }}
            >
              {q.question}
            </h2>

            {/* MCQ / T-F options */}
            {(q.type === 'mcq' || q.type === 'tf') && q.options && (
              <div className="flex flex-col gap-3">
                {q.options.map(opt => {
                  const selected = curAnswer === opt.key
                  return (
                    <button
                      key={opt.key}
                      className="w-full rounded-xl px-4 text-left font-body text-sm font-medium leading-snug min-h-[52px] transition-all duration-150 active:scale-[0.98]"
                      style={{
                        background:   selected ? 'rgba(255,184,0,0.12)' : 'var(--bg-card)',
                        border:       selected ? '2px solid var(--brand)' : '1px solid var(--border-subtle)',
                        color:        selected ? 'var(--brand)' : 'var(--text-1)',
                        paddingTop:   14,
                        paddingBottom: 14,
                      }}
                      onClick={() => handleSelect(selected ? '' : opt.key)}
                    >
                      <span className="font-mono text-xs mr-3" style={{ color: selected ? 'var(--brand)' : 'var(--text-3)' }}>
                        {opt.key.toUpperCase()}.
                      </span>
                      {opt.label}
                    </button>
                  )
                })}
              </div>
            )}

            {/* Short answer */}
            {q.type === 'short' && (
              <div className="flex flex-col gap-3">
                {q.hint && (
                  <p className="font-body text-xs leading-snug" style={{ color: 'var(--text-3)' }}>
                    💡 {q.hint}
                  </p>
                )}
                <textarea
                  className="w-full rounded-xl px-4 py-3 font-body text-base leading-relaxed resize-none outline-none transition-all duration-200"
                  style={{
                    background:   'var(--bg-card)',
                    border:       curAnswer.length > 0 ? '2px solid var(--brand)' : '1px solid var(--border-subtle)',
                    color:        'var(--text-1)',
                    minHeight:    120,
                    fontSize:     16,
                    caretColor:   'var(--brand)',
                  }}
                  inputMode="text"
                  autoCapitalize="sentences"
                  placeholder="Type your answer here…"
                  value={curAnswer}
                  onChange={e => handleShortChange(e.target.value)}
                />
                <div className="flex justify-between font-mono text-xs" style={{ color: 'var(--text-3)' }}>
                  <span>
                    {SHORT_MIN[q.id] !== undefined && curAnswer.trim().length < SHORT_MIN[q.id]
                      ? `${SHORT_MIN[q.id] - curAnswer.trim().length} more chars to qualify`
                      : curAnswer.trim().length > 0 ? '✓ Qualifies' : ''}
                  </span>
                  <span>{curAnswer.length} chars</span>
                </div>
              </div>
            )}
          </motion.div>
        </AnimatePresence>
      </div>

      {/* ── Sticky bottom CTA ── */}
      <div
        className="fixed left-0 right-0 px-4 py-4 bottom-16 md:bottom-0 md:safe-bottom"
        style={{ background: 'rgba(10,10,10,0.95)', backdropFilter: 'blur(8px)', borderTop: '1px solid var(--border-faint)' }}
      >
        <div className="max-w-lg mx-auto">
          <button
            disabled={!canNext}
            className="w-full rounded-xl py-4 font-heading font-semibold text-base tracking-wide min-h-[52px] transition-all duration-150 active:scale-[0.97] disabled:opacity-30 disabled:active:scale-100"
            style={{
              background: canNext ? 'var(--brand)' : 'var(--bg-float)',
              color:      canNext ? '#000' : 'var(--text-3)',
              border:     canNext ? 'none' : '1px solid var(--border-subtle)',
            }}
            onClick={handleNext}
          >
            {currentQ === TOTAL - 1 ? 'Submit Answers ✓' : 'Next →'}
          </button>
        </div>
      </div>
    </>
  )
}
