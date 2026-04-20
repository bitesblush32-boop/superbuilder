'use client'

import { useState, useCallback } from 'react'
import { useRouter } from 'next/navigation'
import { motion, AnimatePresence } from 'framer-motion'
import { Check, Loader2 } from 'lucide-react'
import { createStudentTeam, joinStudentTeam, leaveStudentTeam, setTeamSolo } from '@/lib/actions/registration'
import { useRegistrationStore } from '@/lib/store/registration'

// ─── Types ────────────────────────────────────────────────────────────────────

interface TeamMember {
  id: string
  fullName: string
  grade: string | null
  city: string | null
  teamRole: string | null
}

interface TeamInfo {
  id: string
  name: string
  code: string
  memberCount: number
  maxSize: number
  isLocked: boolean
  members: TeamMember[]
}

interface Props {
  studentId: string
  studentName: string
  teamRole: string | null
  team: TeamInfo | null
}

// ─── Shared helpers ────────────────────────────────────────────────────────────

function CopyButton({ text }: { text: string }) {
  const [copied, setCopied] = useState(false)
  return (
    <button
      type="button"
      onClick={() => {
        navigator.clipboard.writeText(text).then(() => {
          setCopied(true)
          setTimeout(() => setCopied(false), 2000)
        })
      }}
      className="flex items-center gap-2 px-4 rounded-xl font-heading font-semibold text-sm transition-all active:scale-95"
      style={{
        minHeight: '40px',
        background: copied ? 'rgba(34,197,94,0.12)' : 'var(--bg-float)',
        border: `1px solid ${copied ? 'rgba(34,197,94,0.4)' : 'var(--border-soft)'}`,
        color: copied ? 'var(--green)' : 'var(--text-2)',
      }}
    >
      {copied ? '✓ Copied!' : '📋 Copy Code'}
    </button>
  )
}

function CTAButton({
  onClick, disabled, loading, children, variant = 'primary',
}: {
  onClick?: () => void
  disabled?: boolean
  loading?: boolean
  children: React.ReactNode
  variant?: 'primary' | 'danger' | 'ghost'
}) {
  const isActive = !disabled && !loading
  const bg =
    variant === 'danger' ? (isActive ? 'rgba(248,113,113,0.15)' : 'var(--bg-float)') :
      variant === 'ghost' ? 'var(--bg-float)' :
        isActive ? 'linear-gradient(135deg,#FFB800,#FFCF40)' : 'var(--bg-float)'
  const color =
    variant === 'danger' ? (isActive ? 'var(--red)' : 'var(--text-4)') :
      variant === 'ghost' ? 'var(--text-3)' :
        isActive ? '#000' : 'var(--text-4)'
  const border =
    variant === 'danger' ? `1px solid ${isActive ? 'rgba(248,113,113,0.35)' : 'var(--border-subtle)'}` :
      variant === 'ghost' ? '1px solid var(--border-subtle)' :
        'none'

  return (
    <motion.button
      type="button"
      onClick={onClick}
      disabled={disabled || loading}
      whileTap={isActive ? { scale: 0.98 } : {}}
      className="w-full rounded-2xl font-heading font-bold text-sm tracking-wide transition-all flex items-center justify-center gap-2"
      style={{
        minHeight: '52px',
        background: bg,
        color,
        border,
        cursor: isActive ? 'pointer' : 'not-allowed',
        boxShadow: variant === 'primary' && isActive ? 'var(--shadow-brand)' : 'none',
      }}
    >
      {loading ? <Loader2 size={16} className="animate-spin" /> : children}
    </motion.button>
  )
}

// ─── Current team view ────────────────────────────────────────────────────────

function CurrentTeamView({
  team, teamRole, onLeave, leaving,
}: {
  team: TeamInfo
  teamRole: string | null
  onLeave: () => void
  leaving: boolean
}) {
  const isLeader = teamRole === 'leader'
  const spots = team.maxSize - team.memberCount

  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.38, ease: [0.16, 1, 0.3, 1] }}
      className="flex flex-col gap-5"
    >
      {/* Team card */}
      <div
        className="rounded-2xl p-5 flex flex-col gap-4"
        style={{ background: 'rgba(255,184,0,0.06)', border: '2px solid rgba(255,184,0,0.3)' }}
      >
        <div className="flex items-start justify-between gap-3">
          <div>
            <p className="font-mono text-[11px] tracking-[0.15em] uppercase mb-1" style={{ color: 'var(--text-4)' }}>
              Your Team
            </p>
            <h2 className="font-display text-3xl leading-none tracking-wide" style={{ color: 'var(--text-1)' }}>
              {team.name}
            </h2>
          </div>
          <span
            className="text-xs font-mono px-2 py-1 rounded-full shrink-0 mt-1"
            style={{ background: 'rgba(255,184,0,0.12)', color: 'var(--text-brand)' }}
          >
            {isLeader ? 'Leader' : 'Member'}
          </span>
        </div>

        {/* Code + copy */}
        <div
          className="rounded-xl p-4 flex items-center justify-between gap-3"
          style={{ background: 'var(--bg-inset)', border: '1px solid var(--border-brand)' }}
        >
          <div>
            <p className="font-mono text-[10px] tracking-[0.18em] uppercase mb-1" style={{ color: 'var(--text-4)' }}>Team Code</p>
            <p className="font-mono font-bold tracking-[0.2em] text-xl" style={{ color: 'var(--brand)' }}>
              {team.code}
            </p>
          </div>
          <CopyButton text={team.code} />
        </div>

        {/* Member count */}
        <div className="flex items-center gap-2">
          {Array.from({ length: team.maxSize }).map((_, i) => (
            <div
              key={i}
              className="h-2 flex-1 rounded-full transition-colors"
              style={{ background: i < team.memberCount ? 'var(--brand)' : 'var(--border-subtle)' }}
            />
          ))}
          <span className="text-xs font-mono shrink-0 ml-1" style={{ color: 'var(--text-3)' }}>
            {team.memberCount}/{team.maxSize}
          </span>
        </div>
        {spots > 0 && (
          <p className="text-xs font-body" style={{ color: 'var(--text-4)' }}>
            {spots} spot{spots > 1 ? 's' : ''} open — share the code with friends!
          </p>
        )}
      </div>

      {/* Members list */}
      <div
        className="rounded-2xl overflow-hidden"
        style={{ background: 'var(--bg-card)', border: '1px solid var(--border-faint)' }}
      >
        <div className="px-4 py-3 border-b" style={{ borderColor: 'var(--border-faint)' }}>
          <p className="text-[11px] font-mono uppercase tracking-[0.12em]" style={{ color: 'var(--text-4)' }}>
            Members
          </p>
        </div>
        {team.members.map((m, i) => (
          <div
            key={m.id}
            className="flex items-center gap-3 px-4 py-3"
            style={{
              borderBottom: i < team.members.length - 1 ? '1px solid var(--border-faint)' : 'none',
            }}
          >
            <div
              className="h-8 w-8 rounded-full flex items-center justify-center shrink-0 font-heading font-bold text-sm"
              style={{ background: 'var(--bg-float)', color: 'var(--text-brand)' }}
            >
              {m.fullName.charAt(0)}
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium truncate" style={{ color: 'var(--text-1)' }}>{m.fullName}</p>
              <p className="text-xs truncate" style={{ color: 'var(--text-4)' }}>
                Class {m.grade}{m.city ? ` · ${m.city}` : ''}
              </p>
            </div>
            {m.teamRole === 'leader' && (
              <span className="text-[10px] font-mono px-2 py-0.5 rounded-full shrink-0" style={{ background: 'rgba(255,184,0,0.1)', color: 'var(--text-brand)' }}>
                Leader
              </span>
            )}
            {m.teamRole !== 'leader' && (
              <Check size={14} style={{ color: 'var(--green)' }} aria-hidden="true" />
            )}
          </div>
        ))}
      </div>

      {/* Team rate status */}
      {team.memberCount >= 2 && (
        <div
          className="rounded-xl px-4 py-3 flex items-center gap-3"
          style={{ background: 'rgba(34,197,94,0.08)', border: '1px solid rgba(34,197,94,0.2)' }}
        >
          <span>🎉</span>
          <p className="text-sm font-body" style={{ color: 'var(--green)' }}>
            Team rate unlocked — everyone pays ₹2,999 instead of ₹3,499!
          </p>
        </div>
      )}

      {/* Leave team */}
      {!team.isLocked && (
        <div className="mt-2">
          <CTAButton onClick={onLeave} loading={leaving} variant="danger">
            {isLeader && team.memberCount > 1
              ? '⚠ Dissolve Team (removes all members)'
              : 'Leave Team'}
          </CTAButton>
          <p className="text-center text-xs mt-2" style={{ color: 'var(--text-4)' }}>
            {isLeader && team.memberCount > 1
              ? 'This will remove all members from the team'
              : 'You can join or create a new team after leaving'}
          </p>
        </div>
      )}
      {team.isLocked && (
        <p className="text-center text-xs" style={{ color: 'var(--text-4)' }}>
          Team is locked — registration deadline has passed
        </p>
      )}
    </motion.div>
  )
}

// ─── No-team view (create / join) ────────────────────────────────────────────

type NoTeamMode = 'choosing' | 'create_form' | 'join_form' | 'created' | 'joined'

function NoTeamView({ studentName, onDone }: { studentName: string; onDone: () => void }) {
  const [mode, setMode] = useState<NoTeamMode>('choosing')
  const [teamName, setTeamName] = useState('')
  const [joinCode, setJoinCode] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [result, setResult] = useState<{ teamCode?: string; teamName?: string; memberCount?: number } | null>(null)

  const handleCreate = async () => {
    if (teamName.trim().length < 2) { setError('Team name must be at least 2 characters'); return }
    setLoading(true); setError(null)
    const res = await createStudentTeam(teamName)
    setLoading(false)
    if (!res.success) { setError(res.error ?? 'Something went wrong'); return }
    setResult({ teamCode: res.teamCode })
    setMode('created')
  }

  const handleJoin = async () => {
    if (joinCode.trim().length < 5) { setError('Enter a valid team code'); return }
    setLoading(true); setError(null)
    const res = await joinStudentTeam(joinCode)
    setLoading(false)
    if (!res.success) { setError(res.error ?? 'Invalid code'); return }
    setResult({ teamName: res.teamName, memberCount: res.memberCount })
    setMode('joined')
  }

  const inputStyle = {
    minHeight: '52px', background: 'var(--bg-inset)',
    border: `1px solid ${error ? 'rgba(248,113,113,0.45)' : 'var(--border-subtle)'}`,
    color: 'var(--text-1)', fontSize: '16px',
  }

  if (mode === 'choosing') return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.38, ease: [0.16, 1, 0.3, 1] }}
      className="flex flex-col gap-4"
    >
      <p className="text-sm font-body" style={{ color: 'var(--text-3)' }}>
        {studentName ? `Hey ${studentName}! ` : ''}Teams of 2–3 pay ₹2,999/head vs ₹3,499 solo. Individual stages are completed solo.
      </p>

      {/* Solo */}
      <button
        type="button"
        onClick={async () => {
          await setTeamSolo()
          onDone()
        }}
        className="w-full rounded-2xl p-5 text-left transition-all active:scale-[0.98] flex items-start gap-4"
        style={{ background: 'var(--bg-card)', border: '1px solid var(--border-subtle)' }}
      >
        <span className="text-3xl">🦅</span>
        <div>
          <p className="font-heading font-bold text-base mb-0.5" style={{ color: 'var(--text-1)' }}>Stay Solo</p>
          <p className="font-body text-xs" style={{ color: 'var(--text-3)' }}>Build independently. Full prize if you win.</p>
        </div>
      </button>

      {/* Create */}
      <button
        type="button"
        onClick={() => setMode('create_form')}
        className="w-full rounded-2xl p-5 text-left transition-all active:scale-[0.98] flex items-start gap-4"
        style={{ background: 'rgba(255,184,0,0.06)', border: '2px solid rgba(255,184,0,0.4)' }}
      >
        <span className="text-3xl">⚡</span>
        <div>
          <p className="font-heading font-bold text-base mb-0.5" style={{ color: 'var(--text-brand)' }}>Create a Team</p>
          <p className="font-body text-xs" style={{ color: 'var(--text-3)' }}>Get a code → share with 1–2 friends</p>
          <div className="flex flex-wrap gap-2 mt-2">
            <span className="font-mono text-[11px] px-2 py-0.5 rounded-full" style={{ background: 'rgba(34,197,94,0.12)', color: 'var(--green)' }}>Team of 2–3 → ₹2,999/head</span>
          </div>
        </div>
      </button>

      {/* Join */}
      <button
        type="button"
        onClick={() => setMode('join_form')}
        className="w-full rounded-2xl p-5 text-left transition-all active:scale-[0.98] flex items-start gap-4"
        style={{ background: 'var(--bg-card)', border: '1px solid var(--border-subtle)' }}
      >
        <span className="text-3xl">🔗</span>
        <div>
          <p className="font-heading font-bold text-base mb-0.5" style={{ color: 'var(--text-1)' }}>Join a Team</p>
          <p className="font-body text-xs" style={{ color: 'var(--text-3)' }}>Friend already created a team? Enter their code.</p>
        </div>
      </button>
    </motion.div>
  )

  if (mode === 'create_form') return (
    <motion.div
      initial={{ opacity: 0, x: 40 }} animate={{ opacity: 1, x: 0 }}
      transition={{ duration: 0.32, ease: [0.16, 1, 0.3, 1] }}
      className="flex flex-col gap-5"
    >
      <button type="button" onClick={() => { setMode('choosing'); setError(null) }}
        className="flex items-center gap-1 text-sm" style={{ minHeight: '44px', color: 'var(--text-3)' }}>
        ← Back
      </button>
      <h2 className="font-display text-3xl leading-none tracking-wide" style={{ color: 'var(--text-1)' }}>NAME YOUR TEAM ⚡</h2>
      <input
        type="text" value={teamName} onChange={e => setTeamName(e.target.value)}
        onKeyDown={e => e.key === 'Enter' && handleCreate()}
        placeholder="e.g. Byte Brigade, AI Avengers…"
        inputMode="text" autoCapitalize="words" maxLength={50}
        className="w-full rounded-xl px-4 font-body outline-none"
        style={inputStyle}
      />
      {error && <p className="text-xs font-body" style={{ color: 'var(--red)' }}>⚠ {error}</p>}
      <CTAButton onClick={handleCreate} disabled={loading || teamName.trim().length < 2} loading={loading}>
        Create Team →
      </CTAButton>
    </motion.div>
  )

  if (mode === 'join_form') return (
    <motion.div
      initial={{ opacity: 0, x: 40 }} animate={{ opacity: 1, x: 0 }}
      transition={{ duration: 0.32, ease: [0.16, 1, 0.3, 1] }}
      className="flex flex-col gap-5"
    >
      <button type="button" onClick={() => { setMode('choosing'); setError(null) }}
        className="flex items-center gap-1 text-sm" style={{ minHeight: '44px', color: 'var(--text-3)' }}>
        ← Back
      </button>
      <h2 className="font-display text-3xl leading-none tracking-wide" style={{ color: 'var(--text-1)' }}>ENTER TEAM CODE 🔗</h2>
      <input
        type="text" value={joinCode} onChange={e => setJoinCode(e.target.value.toUpperCase())}
        onKeyDown={e => e.key === 'Enter' && handleJoin()}
        placeholder="SB-XXXX" inputMode="text" autoCapitalize="characters" autoComplete="off" maxLength={10}
        className="w-full rounded-xl px-4 font-mono outline-none tracking-widest text-center"
        style={{ ...inputStyle, fontSize: '20px', color: 'var(--text-brand)', letterSpacing: '0.15em' }}
      />
      {error && <p className="text-xs font-body" style={{ color: 'var(--red)' }}>⚠ {error}</p>}
      <CTAButton onClick={handleJoin} disabled={loading || joinCode.trim().length < 5} loading={loading}>
        Join Team →
      </CTAButton>
    </motion.div>
  )

  if (mode === 'created') return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.35, ease: [0.16, 1, 0.3, 1] }}
      className="flex flex-col gap-5 items-center text-center"
    >
      <div className="text-5xl">🎉</div>
      <h2 className="font-display text-3xl leading-none tracking-wide" style={{ color: 'var(--text-brand)' }}>TEAM CREATED!</h2>
      <div className="w-full rounded-2xl p-5 flex flex-col gap-3 items-center" style={{ background: 'var(--bg-card)', border: '2px solid rgba(255,184,0,0.4)' }}>
        <p className="font-mono text-xs tracking-[0.2em] uppercase" style={{ color: 'var(--text-4)' }}>Your Team Code</p>
        <p className="font-mono font-bold tracking-[0.25em]" style={{ fontSize: '2.2rem', color: 'var(--brand)' }}>{result?.teamCode}</p>
        <CopyButton text={result?.teamCode ?? ''} />
      </div>
      <CTAButton onClick={onDone}>Continue to Stage 2 →</CTAButton>
    </motion.div>
  )

  if (mode === 'joined') return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.35, ease: [0.16, 1, 0.3, 1] }}
      className="flex flex-col gap-5 items-center text-center"
    >
      <div className="text-5xl">🤝</div>
      <h2 className="font-display text-3xl leading-none tracking-wide" style={{ color: 'var(--text-brand)' }}>YOU&apos;RE IN!</h2>
      <div className="w-full rounded-2xl p-4" style={{ background: 'var(--bg-card)', border: '1px solid var(--border-subtle)' }}>
        <p className="font-heading font-bold text-lg mb-1" style={{ color: 'var(--text-1)' }}>{result?.teamName}</p>
        <p className="font-mono text-xs" style={{ color: 'var(--text-3)' }}>{result?.memberCount} of 3 members joined</p>
      </div>
      <CTAButton onClick={onDone}>Continue to Stage 2 →</CTAButton>
    </motion.div>
  )

  return null
}

// ─── Main exported component ──────────────────────────────────────────────────

export function TeamManageClient({ studentId: _studentId, studentName, teamRole, team: initialTeam }: Props) {
  const router = useRouter()
  const { reset: resetRegistration } = useRegistrationStore()
  const [team, setTeam] = useState(initialTeam)
  const [leaving, setLeaving] = useState(false)
  const [leaveError, setLeaveError] = useState<string | null>(null)
  const [leaveConfirm, setLeaveConfirm] = useState(false)

  const handleLeave = useCallback(async () => {
    if (!leaveConfirm) {
      setLeaveConfirm(true)
      return
    }
    setLeaving(true)
    setLeaveError(null)
    const res = await leaveStudentTeam()
    setLeaving(false)
    if (!res.success) { setLeaveError(res.error ?? 'Something went wrong'); return }
    setTeam(null)
    setLeaveConfirm(false)
  }, [leaveConfirm])

  const goToStage2 = () => {
    // Reset the stage 1 substep in Zustand — ensures sidebar shows correct state after team completion
    resetRegistration()
    // Navigate directly to orientation to maintain consistent routing
    router.push('/dashboard/orientation')
  }

  // If student already made a team decision, show status + continue CTA
  const alreadyDecided = teamRole !== null
  const isSolo = teamRole === 'solo'

  return (
    <div className="flex flex-col gap-6 pb-12">
      {/* Header */}
      <div className="flex flex-col gap-1">
        <p
          className="font-mono text-[11px] tracking-[0.15em] uppercase mb-1"
          style={{ color: 'var(--text-brand)' }}
        >
          Step 3 of 3 — Team Building
        </p>
        <h1
          className="font-display leading-none tracking-wider"
          style={{ fontSize: '2.6rem', color: 'var(--text-1)' }}
        >
          {alreadyDecided ? (isSolo ? 'GOING SOLO 🦅' : 'TEAM SETTINGS 🤝') : 'TEAM BUILDING 🤝'}
        </h1>
        <p className="text-sm font-body" style={{ color: 'var(--text-3)' }}>
          {alreadyDecided
            ? 'Your team status is set. Continue to Stage 2 when ready.'
            : 'Teams of 2–3 pay ₹2,999/head vs ₹3,499 solo. Individual stages are completed solo.'}
        </p>
      </div>

      {/* Leave error */}
      <AnimatePresence>
        {leaveError && (
          <motion.p
            initial={{ opacity: 0, y: -8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}
            className="text-xs font-body px-3 py-2 rounded-lg border"
            style={{ color: 'var(--red)', background: 'var(--red-bg)', borderColor: 'rgba(248,113,113,0.25)' }}
          >
            ⚠ {leaveError}
          </motion.p>
        )}
      </AnimatePresence>

      {/* Confirm dissolve banner */}
      <AnimatePresence>
        {leaveConfirm && team && (
          <motion.div
            initial={{ opacity: 0, y: -8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}
            className="rounded-xl p-4 flex flex-col gap-3"
            style={{ background: 'rgba(248,113,113,0.08)', border: '1px solid rgba(248,113,113,0.25)' }}
          >
            <p className="text-sm font-body" style={{ color: 'var(--red)' }}>
              {teamRole === 'leader' && team.memberCount > 1
                ? `This will remove all ${team.memberCount} members from "${team.name}". Are you sure?`
                : `You will leave "${team.name}". Are you sure?`}
            </p>
            <div className="flex gap-3">
              <button
                type="button"
                onClick={() => setLeaveConfirm(false)}
                className="flex-1 rounded-xl font-heading font-semibold text-sm transition-all active:scale-95"
                style={{ minHeight: '44px', background: 'var(--bg-float)', border: '1px solid var(--border-subtle)', color: 'var(--text-2)' }}
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleLeave}
                disabled={leaving}
                className="flex-1 rounded-xl font-heading font-semibold text-sm transition-all active:scale-95 flex items-center justify-center gap-2"
                style={{ minHeight: '44px', background: 'rgba(248,113,113,0.15)', border: '1px solid rgba(248,113,113,0.35)', color: 'var(--red)' }}
              >
                {leaving ? <Loader2 size={14} className="animate-spin" /> : 'Confirm'}
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Main content */}
      <AnimatePresence mode="wait">
        {team ? (
          <motion.div key="has-team" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="flex flex-col gap-5">
            <CurrentTeamView
              team={team}
              teamRole={teamRole}
              onLeave={handleLeave}
              leaving={leaving && leaveConfirm}
            />
            {/* Continue CTA — always visible when in a team */}
            <motion.button
              onClick={goToStage2}
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              className="w-full rounded-2xl font-heading font-bold text-base tracking-wide
                         flex items-center justify-center gap-2.5 transition-all active:scale-[0.97]"
              style={{
                minHeight: '56px',
                background: 'linear-gradient(135deg, #FFB800, #FFCF40)',
                color: '#000',
                boxShadow: '0 0 32px rgba(255,184,0,0.25)',
              }}
            >
              Continue to Stage 2 →
            </motion.button>
          </motion.div>
        ) : isSolo ? (
          /* Already chose solo — show status + continue */
          <motion.div
            key="is-solo"
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.38, ease: [0.16, 1, 0.3, 1] as [number, number, number, number] }}
            className="flex flex-col gap-5 items-center text-center"
          >
            <div className="text-5xl">🦅</div>
            <div
              className="w-full rounded-2xl p-5 border"
              style={{ background: 'var(--bg-card)', borderColor: 'var(--border-subtle)' }}
            >
              <p className="font-mono text-xs tracking-[0.15em] uppercase mb-1" style={{ color: 'var(--text-4)' }}>Status</p>
              <p className="font-heading font-bold text-lg" style={{ color: 'var(--text-1)' }}>Solo Builder</p>
              <p className="font-body text-sm mt-1" style={{ color: 'var(--text-3)' }}>
                You&apos;re building independently. Full prize if you win. Good luck! 🔥
              </p>
            </div>
            <motion.button
              onClick={goToStage2}
              className="w-full rounded-2xl font-heading font-bold text-base tracking-wide
                         flex items-center justify-center gap-2.5 transition-all active:scale-[0.97]"
              style={{
                minHeight: '56px',
                background: 'linear-gradient(135deg, #FFB800, #FFCF40)',
                color: '#000',
                boxShadow: '0 0 32px rgba(255,184,0,0.25)',
              }}
            >
              Continue to Stage 2 →
            </motion.button>
          </motion.div>
        ) : (
          <motion.div key="no-team" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
            <NoTeamView studentName={studentName} onDone={goToStage2} />
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}
