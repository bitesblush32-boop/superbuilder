'use client'

import React, {
  useState,
  useEffect,
  useMemo,
  useCallback,
  forwardRef,
} from 'react'
import { useRouter } from 'next/navigation'
import { useForm, Controller, useWatch } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { motion, AnimatePresence } from 'framer-motion'
import { ArrowLeft, ChevronRight, Loader2, Check } from 'lucide-react'
import { State, City } from 'country-state-city'
import { stage1Schema, type Stage1FormData } from '@/lib/validation/stage1'
import { submitStage1 } from '@/lib/actions/registration'
import { BadgeUnlock } from '@/components/gamification/BadgeUnlock'
import type { BadgeId } from '@/lib/gamification/badges'
import { SchoolAutocomplete } from './SchoolAutocomplete'

// ─── Constants ────────────────────────────────────────────────────────────────

// Pre-built at module load (server + client) — no API key needed
const _rawStates = State.getStatesOfCountry('IN')
const INDIAN_STATES = _rawStates.sort((a, b) => a.name.localeCompare(b.name))
const STATE_ISO_MAP: Record<string, string> = Object.fromEntries(
  INDIAN_STATES.map(s => [s.name, s.isoCode])
)


type PillOpt = { value: string; label: string; emoji?: string }

const GENDER_OPTS: PillOpt[] = [
  { value: 'male',              label: 'Male' },
  { value: 'female',            label: 'Female' },
  { value: 'non_binary',        label: 'Non-binary' },
  { value: 'prefer_not_to_say', label: 'Prefer not to say' },
]

const GRADE_OPTS: PillOpt[] = [
  { value: '8', label: 'Class 8' }, { value: '9',  label: 'Class 9' },
  { value: '10', label: 'Class 10' }, { value: '11', label: 'Class 11' },
  { value: '12', label: 'Class 12' },
]

const CODING_EXP_OPTS: PillOpt[] = [
  { value: 'none',         label: 'None',         emoji: '👋' },
  { value: 'beginner',     label: 'Beginner',     emoji: '🌱' },
  { value: 'intermediate', label: 'Intermediate', emoji: '⚡' },
  { value: 'advanced',     label: 'Advanced',     emoji: '🚀' },
]

const INTEREST_OPTS: PillOpt[] = [
  { value: 'AI',           label: 'AI & ML',      emoji: '🤖' },
  { value: 'Gaming',       label: 'Gaming',        emoji: '🎮' },
  { value: 'Health',       label: 'Health',        emoji: '🏥' },
  { value: 'Education',    label: 'Education',     emoji: '📚' },
  { value: 'Finance',      label: 'Finance',       emoji: '💰' },
  { value: 'Social Impact',label: 'Social Impact', emoji: '🌍' },
  { value: 'Environment',  label: 'Environment',   emoji: '🌱' },
  { value: 'Art & Design', label: 'Art & Design',  emoji: '🎨' },
  { value: 'Web Dev',      label: 'Web Dev',       emoji: '💻' },
  { value: 'Robotics',     label: 'Robotics',      emoji: '🦾' },
]

const AVAIL_OPTS: PillOpt[] = [
  { value: 'less_than_5',  label: '< 5h/week' },
  { value: '5_to_10',      label: '5–10h/week' },
  { value: '10_to_20',     label: '10–20h/week' },
  { value: 'more_than_20', label: '20+h/week' },
]

const DEVICE_OPTS: PillOpt[] = [
  { value: 'smartphone', label: 'Smartphone', emoji: '📱' },
  { value: 'laptop',     label: 'Laptop',     emoji: '💻' },
  { value: 'desktop',    label: 'Desktop',    emoji: '🖥️' },
  { value: 'tablet',     label: 'Tablet',     emoji: '📲' },
  { value: 'multiple',   label: 'Multiple',   emoji: '🔌' },
]

const TSHIRT_OPTS: PillOpt[] = [
  { value: 'XS', label: 'XS' }, { value: 'S', label: 'S' },
  { value: 'M',  label: 'M' },  { value: 'L', label: 'L' },
  { value: 'XL', label: 'XL' }, { value: 'XXL', label: 'XXL' },
]

const RELATIONSHIP_OPTS: PillOpt[] = [
  { value: 'mother',   label: 'Mother',   emoji: '👩' },
  { value: 'father',   label: 'Father',   emoji: '👨' },
  { value: 'guardian', label: 'Guardian', emoji: '👤' },
]

// ─── Motion variants ──────────────────────────────────────────────────────────
// Framer Motion v12 requires typed bezier tuples, not plain number[]
type Bez = [number, number, number, number]
const EASE_OUT:    Bez = [0.16, 1, 0.3, 1]
const EASE_IN_OUT: Bez = [0.87, 0, 0.13, 1]

const SLIDE = {
  enter:  (d: number) => ({ x: d > 0 ? '100%' : '-100%', opacity: 0 }),
  center: { x: 0, opacity: 1, transition: { duration: 0.38, ease: EASE_OUT } },
  exit:   (d: number) => ({
    x: d > 0 ? '-40%' : '40%', opacity: 0,
    transition: { duration: 0.25, ease: EASE_IN_OUT },
  }),
}

const CARD_APPEAR = {
  hidden:  { opacity: 0, y: 18 },
  visible: (i: number) => ({
    opacity: 1, y: 0,
    transition: { delay: i * 0.07, duration: 0.42, ease: EASE_OUT },
  }),
}

// ─── Shared field components ──────────────────────────────────────────────────

function FormCard({
  icon, title, children, index = 0,
}: { icon: string; title: string; children: React.ReactNode; index?: number }) {
  return (
    <motion.div
      custom={index}
      variants={CARD_APPEAR}
      initial="hidden"
      animate="visible"
      className="rounded-2xl p-5 flex flex-col gap-5"
      style={{ background: 'var(--bg-card)', border: '1px solid var(--border-faint)' }}
    >
      <div className="flex items-center gap-2">
        {/* <span className="text-base" aria-hidden="true">{icon}</span> */}
        <h3
          className="font-heading font-semibold text-xs tracking-[0.1em] uppercase"
          style={{ color: 'var(--text-3)' }}
        >
          {title}
        </h3>
      </div>
      {children}
    </motion.div>
  )
}

function FieldLabel({ children, required }: { children: React.ReactNode; required?: boolean }) {
  return (
    <p className="text-xs font-mono font-medium mb-1.5" style={{ color: 'var(--text-3)' }}>
      {children}
      {required && <span style={{ color: 'var(--brand)' }}> *</span>}
    </p>
  )
}

function FieldError({ message }: { message?: string }) {
  if (!message) return null
  return (
    <motion.p
      className="text-xs font-body mt-1.5 flex items-center gap-1"
      style={{ color: 'var(--red)' }}
      initial={{ opacity: 0, x: -8 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ duration: 0.22 }}
      role="alert"
    >
      <span aria-hidden="true">⚠</span>
      {message}
    </motion.p>
  )
}

// forwardRef so react-hook-form's register() ref works correctly
const TextInput = forwardRef<
  HTMLInputElement,
  React.InputHTMLAttributes<HTMLInputElement> & { hasError?: boolean }
>(({ hasError, style: extraStyle, className, ...props }, ref) => (
  <input
    ref={ref}
    className={`w-full rounded-xl px-4 font-body transition-colors outline-none focus:outline-none placeholder:opacity-40 ${className ?? ''}`}
    style={{
      minHeight: '48px',
      background: 'var(--bg-inset)',
      border: `1px solid ${hasError ? 'rgba(248,113,113,0.45)' : 'var(--border-subtle)'}`,
      color: 'var(--text-1)',
      fontSize: '16px',
      ...extraStyle,
    }}
    {...props}
  />
))
TextInput.displayName = 'TextInput'

// Controlled textarea with live character counter
function Textarea({
  value,
  onChange,
  maxChars = 500,
  hasError,
  ...props
}: {
  value: string
  onChange: (v: string) => void
  maxChars?: number
  hasError?: boolean
} & Omit<React.TextareaHTMLAttributes<HTMLTextAreaElement>, 'value' | 'onChange'>) {
  const count = value.length
  const overLimit = count > maxChars
  return (
    <div>
      <textarea
        value={value}
        onChange={e => onChange(e.target.value)}
        rows={4}
        className="w-full rounded-xl px-4 py-3 font-body transition-colors outline-none resize-none placeholder:opacity-40"
        style={{
          background: 'var(--bg-inset)',
          border: `1px solid ${hasError || overLimit ? 'rgba(248,113,113,0.45)' : 'var(--border-subtle)'}`,
          color: 'var(--text-1)',
          fontSize: '16px',
          minHeight: '110px',
        }}
        inputMode="text"
        autoCapitalize="sentences"
        {...props}
      />
      <p
        className="text-[11px] text-right font-mono mt-1"
        style={{ color: overLimit ? 'var(--red)' : 'var(--text-4)' }}
      >
        {count}/{maxChars}
      </p>
    </div>
  )
}

function PillSelector({
  options, value, onChange, disabled,
}: { options: PillOpt[]; value?: string; onChange: (v: string) => void; disabled?: boolean }) {
  return (
    <div className="flex flex-wrap gap-2">
      {options.map(opt => {
        const sel = value === opt.value
        return (
          <button
            key={opt.value}
            type="button"
            disabled={disabled}
            onClick={() => onChange(opt.value)}
            className="flex items-center gap-1.5 rounded-full text-sm font-body font-medium transition-all active:scale-95 select-none"
            style={{
              minHeight: '40px',
              padding: '0 14px',
              background: sel ? 'rgba(255,184,0,0.10)' : 'var(--bg-float)',
              border: `1.5px solid ${sel ? 'var(--brand)' : 'var(--border-subtle)'}`,
              color: sel ? 'var(--brand)' : 'var(--text-3)',
              fontWeight: sel ? 600 : 400,
            }}
          >
            {opt.emoji && <span aria-hidden="true">{opt.emoji}</span>}
            {opt.label}
            {sel && <Check size={11} strokeWidth={3} aria-hidden="true" />}
          </button>
        )
      })}
    </div>
  )
}

function MultiPill({
  options, value, onChange, disabled,
}: { options: PillOpt[]; value: string[]; onChange: (v: string[]) => void; disabled?: boolean }) {
  const toggle = (v: string) =>
    onChange(value.includes(v) ? value.filter(x => x !== v) : [...value, v])
  return (
    <div className="flex flex-wrap gap-2">
      {options.map(opt => {
        const sel = value.includes(opt.value)
        return (
          <button
            key={opt.value}
            type="button"
            disabled={disabled}
            onClick={() => toggle(opt.value)}
            className="flex items-center gap-1.5 rounded-full text-sm font-body font-medium transition-all active:scale-95 select-none"
            style={{
              minHeight: '40px',
              padding: '0 14px',
              background: sel ? 'rgba(255,184,0,0.10)' : 'var(--bg-float)',
              border: `1.5px solid ${sel ? 'var(--brand)' : 'var(--border-subtle)'}`,
              color: sel ? 'var(--brand)' : 'var(--text-3)',
              fontWeight: sel ? 600 : 400,
            }}
          >
            {opt.emoji && <span aria-hidden="true">{opt.emoji}</span>}
            {opt.label}
          </button>
        )
      })}
    </div>
  )
}

function ConsentCard({
  checked, onChange, children, disabled,
}: { checked: boolean; onChange: (v: boolean) => void; children: React.ReactNode; disabled?: boolean }) {
  return (
    <button
      type="button"
      onClick={() => onChange(!checked)}
      disabled={disabled}
      role="checkbox"
      aria-checked={checked}
      className="w-full text-left rounded-xl p-4 flex items-start gap-3 transition-all active:scale-[0.99]"
      style={{
        background: checked ? 'rgba(255,184,0,0.05)' : 'var(--bg-float)',
        border: `1.5px solid ${checked ? 'var(--border-brand)' : 'var(--border-subtle)'}`,
        minHeight: '72px',
      }}
    >
      <div
        className="flex-shrink-0 mt-0.5 flex items-center justify-center rounded-md transition-colors"
        style={{
          width: '22px',
          height: '22px',
          background: checked ? 'var(--brand)' : 'transparent',
          border: `2px solid ${checked ? 'var(--brand)' : 'var(--border-soft)'}`,
        }}
        aria-hidden="true"
      >
        {checked && <Check size={13} strokeWidth={3} color="#000" />}
      </div>
      <div className="flex-1 text-sm font-body leading-snug" style={{ color: 'var(--text-2)' }}>
        {children}
      </div>
    </button>
  )
}

// ─── Sub-step indicator ───────────────────────────────────────────────────────

function SubStepHeader({ step }: { step: 1 | 2 }) {
  return (
    <div className="mb-7">
      {/* Pill dots */}
      <div className="flex items-center gap-2 mb-3">
        <div className="flex items-center gap-1.5">
          {([1, 2] as const).map(s => (
            <motion.div
              key={s}
              animate={{
                width: s === step ? 24 : 8,
                background: s <= step ? '#FFB800' : 'var(--border-subtle)',
              }}
              transition={{ duration: 0.3, ease: [0.16, 1, 0.3, 1] }}
              className="rounded-full"
              style={{ height: 8 }}
            />
          ))}
        </div>
        <span className="text-xs font-mono" style={{ color: 'var(--text-4)' }}>
          Step {step} of 2
        </span>
      </div>

      <h1
        className="font-display text-[2.6rem] leading-none tracking-wider mb-2"
        style={{ color: 'var(--text-1)' }}
      >
        {step === 1 ? 'ABOUT YOU' : 'PARENT / GUARDIAN'}
      </h1>
      <p className="text-sm font-body leading-relaxed" style={{ color: 'var(--text-3)' }}>
        {step === 1
          ? 'No experience needed — just bring your ideas. Takes ~3 minutes.'
          : 'We need a parent or guardian to confirm your participation. Almost in! 🏆'}
      </p>
    </div>
  )
}

// ─── Primary CTA button ───────────────────────────────────────────────────────

function CTAButton({
  onClick, disabled, loading, children, type = 'button',
}: {
  onClick?: () => void
  disabled?: boolean
  loading?: boolean
  children: React.ReactNode
  type?: 'button' | 'submit'
}) {
  const active = !disabled && !loading
  return (
    <motion.button
      type={type}
      onClick={onClick}
      disabled={disabled || loading}
      whileTap={active ? { scale: 0.98 } : {}}
      className="w-full rounded-2xl font-heading font-bold text-base tracking-wide transition-all flex items-center justify-center gap-2.5"
      style={{
        minHeight: '56px',
        background: active ? 'linear-gradient(135deg,#FFB800,#FFCF40)' : 'var(--bg-float)',
        color: active ? '#000' : 'var(--text-4)',
        border: active ? 'none' : '1px solid var(--border-subtle)',
        cursor: active ? 'pointer' : 'not-allowed',
        boxShadow: active ? 'var(--shadow-brand)' : 'none',
      }}
    >
      {loading ? <Loader2 size={18} className="animate-spin" /> : children}
    </motion.button>
  )
}

// ─── Main exported form ───────────────────────────────────────────────────────


// ─────────────────────────────────────────────────────────────────────────────


export function Stage1Form() {
  const router = useRouter()
  const [subStep, setSubStep]           = useState<1 | 2>(1)
  const [direction, setDirection]       = useState<1 | -1>(1)
  const [submitting, setSubmitting]     = useState(false)
  const [serverError, setServerError]   = useState<string | null>(null)
  const [pendingBadge, setPendingBadge] = useState<BadgeId | null>(null)

  const {
    register,
    control,
    trigger,
    handleSubmit,
    setValue,
    formState: { errors },
  } = useForm<Stage1FormData>({
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    resolver: zodResolver(stage1Schema) as any,
    mode: 'onBlur',
    reValidateMode: 'onChange',
    defaultValues: { interests: [] },
  })

  // ── Reactive "Next" disabled check for sub-step 1 ──────────────────────────
  const [
    fullName, dateOfBirth, gender, grade,
    schoolName, city, state, phone,
    codingExp, interests,
    availabilityHrs, deviceAccess, tshirtSize,
    whyJoin, whatToBuild,
  ] = useWatch({
    control,
    name: [
      'fullName', 'dateOfBirth', 'gender', 'grade',
      'schoolName', 'city', 'state', 'phone',
      'codingExp', 'interests',
      'availabilityHrs', 'deviceAccess', 'tshirtSize',
      'whyJoin', 'whatToBuild',
    ],
  })

  const step1Ready = useMemo(() => !!(
    fullName?.length >= 2 &&
    dateOfBirth &&
    gender && grade &&
    schoolName?.length >= 2 &&
    city && state &&
    phone && /^[6-9]\d{9}$/.test(phone) &&
    codingExp &&
    interests?.length >= 1 &&
    availabilityHrs && deviceAccess && tshirtSize &&
    whyJoin?.length >= 20 &&
    whatToBuild?.length >= 20
  ), [
    fullName, dateOfBirth, gender, grade, schoolName, city, state, phone,
    codingExp, interests, availabilityHrs, deviceAccess,
    tshirtSize, whyJoin, whatToBuild,
  ])

  // Reset city when state changes so stale value doesn't persist
  useEffect(() => {
    setValue('city', '', { shouldValidate: false, shouldDirty: false })
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [state])

  // Derive city options from country-state-city package
  const citiesForState = useMemo(() => {
    const iso = STATE_ISO_MAP[state as string]
    if (!iso) return []
    return City.getCitiesOfState('IN', iso)
      .map(c => c.name)
      .sort((a, b) => a.localeCompare(b))
  }, [state])

  // ── Reactive "Submit" disabled check for sub-step 2 ────────────────────────
  const [
    parentName, relationship, parentEmail, parentPhone,
    consentGiven, safetyAcknowledged, emergencyContact,
  ] = useWatch({
    control,
    name: [
      'parent.parentName', 'parent.relationship',
      'parent.parentEmail', 'parent.parentPhone',
      'parent.consentGiven', 'parent.safetyAcknowledged',
      'parent.emergencyContact',
    ],
  })

  const step2Ready = useMemo(() => !!(
    parentName?.length >= 2 &&
    relationship &&
    parentEmail?.includes('@') &&
    parentPhone && /^[6-9]\d{9}$/.test(parentPhone) &&
    consentGiven === true &&
    safetyAcknowledged === true &&
    emergencyContact
  ), [
    parentName, relationship, parentEmail, parentPhone,
    consentGiven, safetyAcknowledged, emergencyContact,
  ])

  // ── Navigation ──────────────────────────────────────────────────────────────
  const handleNext = async () => {
    const valid = await trigger([
      'fullName', 'dateOfBirth', 'gender', 'grade',
      'schoolName', 'city', 'state', 'phone',
      'codingExp', 'interests',
      'availabilityHrs', 'deviceAccess', 'tshirtSize',
      'whyJoin', 'whatToBuild',
    ])
    if (!valid) {
      setTimeout(() => {
        const firstErrorAlert = document.querySelector('p[role="alert"]')
        if (firstErrorAlert && firstErrorAlert.parentElement) {
          firstErrorAlert.parentElement.scrollIntoView({ behavior: 'smooth', block: 'center' })
        }
      }, 50)
      return
    }
    setDirection(1)
    setSubStep(2)
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }

  const handleBack = () => {
    setDirection(-1)
    setSubStep(1)
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }

  // ── Submit ──────────────────────────────────────────────────────────────────
  const onSubmit = handleSubmit(async (data) => {
    setSubmitting(true)
    setServerError(null)
    try {
      const result = await submitStage1(data)
      if (result.success && result.badgeAwarded) {
        setPendingBadge(result.badgeAwarded)
      } else {
        setServerError(result.error ?? 'Something went wrong. Please try again.')
      }
    } catch {
      setServerError('Network error. Check your connection and try again.')
    } finally {
      setSubmitting(false)
    }
  })

  const handleBadgeDismiss = useCallback(() => {
    setPendingBadge(null)
    router.push('/register/team')
  }, [router])

  // ── Input style helpers ─────────────────────────────────────────────────────
  const inputCls = 'w-full rounded-xl px-4 font-body transition-colors outline-none focus:outline-none placeholder:opacity-40'
  const inputStyle = (hasError: boolean) => ({
    minHeight: '48px',
    background: 'var(--bg-inset)',
    border: `1px solid ${hasError ? 'rgba(248,113,113,0.45)' : 'var(--border-subtle)'}`,
    color: 'var(--text-1)',
    fontSize: '16px' as const,
  })

  // ─────────────────────────────────────────────────────────────────────────────

  return (
    <>
      <BadgeUnlock badge={pendingBadge} onDismiss={handleBadgeDismiss} />

      <form onSubmit={onSubmit} noValidate>
        {/* Overflow hidden only on the clipping wrapper — scroll container lives outside */}
        <div style={{ overflow: 'hidden' }}>
          <AnimatePresence mode="wait" custom={direction}>
            <motion.div
              key={subStep}
              custom={direction}
              variants={SLIDE}
              initial="enter"
              animate="center"
              exit="exit"
              className="flex flex-col gap-4"
            >
              <SubStepHeader step={subStep} />

              {/* ═══ SUB-STEP 1 — Student fields ═══════════════════════════════ */}
              {subStep === 1 ? (
                <>
                  {/* Card 1 · Identity */}
                  <FormCard icon="🪪" title="Your Identity" index={0}>
                    <div>
                      <FieldLabel required>Full Name</FieldLabel>
                      <TextInput
                        {...register('fullName')}
                        placeholder="As on your school ID"
                        inputMode="text"
                        autoComplete="name"
                        autoCapitalize="words"
                        hasError={!!errors.fullName}
                      />
                      <FieldError message={errors.fullName?.message} />
                    </div>

                    <div>
                      <FieldLabel required>Date of Birth</FieldLabel>
                      <TextInput
                        {...register('dateOfBirth')}
                        type="date"
                        inputMode="none"
                        autoComplete="bday"
                        hasError={!!errors.dateOfBirth}
                        style={{ colorScheme: 'dark' }}
                      />
                      <FieldError message={errors.dateOfBirth?.message} />
                    </div>

                    <div>
                      <FieldLabel required>Gender</FieldLabel>
                      <Controller
                        control={control}
                        name="gender"
                        render={({ field }) => (
                          <PillSelector
                            options={GENDER_OPTS}
                            value={field.value}
                            onChange={field.onChange}
                            disabled={submitting}
                          />
                        )}
                      />
                      <FieldError message={errors.gender?.message} />
                    </div>

                    <div>
                      <FieldLabel required>Your Grade</FieldLabel>
                      <Controller
                        control={control}
                        name="grade"
                        render={({ field }) => (
                          <PillSelector
                            options={GRADE_OPTS}
                            value={field.value}
                            onChange={field.onChange}
                            disabled={submitting}
                          />
                        )}
                      />
                      <FieldError message={errors.grade?.message} />
                    </div>
                  </FormCard>

                  {/* Card 2 · School */}
                  <FormCard icon="🏫" title="Your School" index={1}>
                    {/* 1. State — fixed dropdown */}
                    <div>
                      <FieldLabel required>State</FieldLabel>
                      <select
                        {...register('state')}
                        className={inputCls}
                        style={{ ...inputStyle(!!errors.state), colorScheme: 'dark' }}
                      >
                        <option value="">Select your state</option>
                        {INDIAN_STATES.map(s => (
                          <option key={s.isoCode} value={s.name}>{s.name}</option>
                        ))}
                      </select>
                      <FieldError message={errors.state?.message} />
                    </div>

                    {/* 2. City — filtered by state, fixed dropdown */}
                    <div>
                      <FieldLabel required>City</FieldLabel>
                      <select
                        {...register('city')}
                        className={inputCls}
                        disabled={!state}
                        style={{
                          ...inputStyle(!!errors.city),
                          colorScheme: 'dark',
                          opacity: !state ? 0.45 : 1,
                          cursor: !state ? 'not-allowed' : 'pointer',
                        }}
                      >
                        <option value="">{state ? 'Select your city' : 'Select state first'}</option>
                        {citiesForState.map(c => (
                          <option key={c} value={c}>{c}</option>
                        ))}
                      </select>
                      <FieldError message={errors.city?.message} />
                    </div>

                    {/* 3. School — Google Places autocomplete with free-text fallback */}
                    <div>
                      <FieldLabel required>School Name</FieldLabel>
                      <Controller
                        control={control}
                        name="schoolName"
                        render={({ field }) => (
                          <SchoolAutocomplete
                            value={field.value ?? ''}
                            onChange={field.onChange}
                            onBlur={field.onBlur}
                            cityName={(city as string) ?? ''}
                            hasError={!!errors.schoolName}
                          />
                        )}
                      />
                      <FieldError message={errors.schoolName?.message} />
                    </div>
                  </FormCard>

                  {/* Card 3 · Experience */}
                  <FormCard icon="💡" title="Your Experience" index={2}>
                    <div>
                      <FieldLabel required>Coding Experience</FieldLabel>
                      <Controller
                        control={control}
                        name="codingExp"
                        render={({ field }) => (
                          <PillSelector
                            options={CODING_EXP_OPTS}
                            value={field.value}
                            onChange={field.onChange}
                            disabled={submitting}
                          />
                        )}
                      />
                      <FieldError message={errors.codingExp?.message} />
                    </div>

                    <div>
                      <FieldLabel required>Interests — pick all that apply</FieldLabel>
                      <Controller
                        control={control}
                        name="interests"
                        render={({ field }) => (
                          <MultiPill
                            options={INTEREST_OPTS}
                            value={field.value ?? []}
                            onChange={field.onChange}
                            disabled={submitting}
                          />
                        )}
                      />
                      <FieldError message={errors.interests?.message} />
                    </div>
                  </FormCard>

                  {/* Card 4 · Setup */}
                  <FormCard icon="⚡" title="Your Setup" index={3}>
                    <div>
                      <FieldLabel required>WhatsApp / Phone</FieldLabel>
                      <TextInput
                        {...register('phone')}
                        type="tel"
                        placeholder="10-digit mobile number"
                        inputMode="numeric"
                        autoComplete="tel"
                        hasError={!!errors.phone}
                      />
                      <FieldError message={errors.phone?.message} />
                    </div>

                    <div>
                      <FieldLabel required>Weekly Availability</FieldLabel>
                      <Controller
                        control={control}
                        name="availabilityHrs"
                        render={({ field }) => (
                          <PillSelector
                            options={AVAIL_OPTS}
                            value={field.value}
                            onChange={field.onChange}
                            disabled={submitting}
                          />
                        )}
                      />
                      <FieldError message={errors.availabilityHrs?.message} />
                    </div>

                    <div>
                      <FieldLabel required>Primary Device</FieldLabel>
                      <Controller
                        control={control}
                        name="deviceAccess"
                        render={({ field }) => (
                          <PillSelector
                            options={DEVICE_OPTS}
                            value={field.value}
                            onChange={field.onChange}
                            disabled={submitting}
                          />
                        )}
                      />
                      <FieldError message={errors.deviceAccess?.message} />
                    </div>

                    <div>
                      <FieldLabel required>T-Shirt Size</FieldLabel>
                      <Controller
                        control={control}
                        name="tshirtSize"
                        render={({ field }) => (
                          <PillSelector
                            options={TSHIRT_OPTS}
                            value={field.value}
                            onChange={field.onChange}
                            disabled={submitting}
                          />
                        )}
                      />
                      <FieldError message={errors.tshirtSize?.message} />
                    </div>
                  </FormCard>

                  {/* Card 5 · Story */}
                  <FormCard icon="✍️" title="Your Story" index={4}>
                    <div>
                      <FieldLabel required>Why do you want to join Super Builders?</FieldLabel>
                      <Controller
                        control={control}
                        name="whyJoin"
                        render={({ field }) => (
                          <Textarea
                            value={field.value ?? ''}
                            onChange={field.onChange}
                            maxChars={500}
                            placeholder="What excites you about AI? What do you want to prove to yourself? Be real!"
                            hasError={!!errors.whyJoin}
                          />
                        )}
                      />
                      <FieldError message={errors.whyJoin?.message} />
                    </div>

                    <div>
                      <FieldLabel required>What do you hope to build?</FieldLabel>
                      <Controller
                        control={control}
                        name="whatToBuild"
                        render={({ field }) => (
                          <Textarea
                            value={field.value ?? ''}
                            onChange={field.onChange}
                            maxChars={500}
                            placeholder="Any idea counts. What problem would you love to solve with AI?"
                            hasError={!!errors.whatToBuild}
                          />
                        )}
                      />
                      <FieldError message={errors.whatToBuild?.message} />
                    </div>

                    {/* Optional extras */}
                    <div
                      className="rounded-xl p-4 flex flex-col gap-4"
                      style={{ background: 'var(--bg-float)', border: '1px solid var(--border-faint)' }}
                    >
                      <p className="text-[11px] font-mono uppercase tracking-[0.12em]" style={{ color: 'var(--text-4)' }}>
                        Optional — but appreciated 😊
                      </p>

                      <div>
                        <FieldLabel>Instagram Handle</FieldLabel>
                        <TextInput
                          {...register('instagramHandle')}
                          placeholder="@yourhandle"
                          inputMode="text"
                          autoComplete="nameid"
                          autoCapitalize="none"
                        />
                      </div>

                      <div>
                        <FieldLabel>LinkedIn URL</FieldLabel>
                        <TextInput
                          {...register('linkedinHandle')}
                          placeholder="linkedin.com/in/yourname"
                          inputMode="url"
                          autoComplete="url"
                          autoCapitalize="none"
                        />
                      </div>

                    </div>
                  </FormCard>

                  {/* Next CTA */}
                  <CTAButton onClick={handleNext}>
                    Parent Details
                    <ChevronRight size={18} strokeWidth={2.5} />
                  </CTAButton>
                </>
              ) : (
                /* ═══ SUB-STEP 2 — Parent fields ════════════════════════════ */
                <>
                  {/* Card 1 · Parent info */}
                  <FormCard icon="👨‍👩‍👧" title="Parent / Guardian Info" index={0}>
                    <div>
                      <FieldLabel required>Parent / Guardian Full Name</FieldLabel>
                      <TextInput
                        {...register('parent.parentName')}
                        placeholder="Full name"
                        inputMode="text"
                        autoComplete="name"
                        autoCapitalize="words"
                        hasError={!!errors.parent?.parentName}
                      />
                      <FieldError message={errors.parent?.parentName?.message} />
                    </div>

                    <div>
                      <FieldLabel required>Relationship to You</FieldLabel>
                      <Controller
                        control={control}
                        name="parent.relationship"
                        render={({ field }) => (
                          <PillSelector
                            options={RELATIONSHIP_OPTS}
                            value={field.value}
                            onChange={field.onChange}
                            disabled={submitting}
                          />
                        )}
                      />
                      <FieldError message={errors.parent?.relationship?.message} />
                    </div>

                    <div>
                      <FieldLabel required>Parent Email</FieldLabel>
                      <TextInput
                        {...register('parent.parentEmail')}
                        type="email"
                        placeholder="parent@email.com"
                        inputMode="email"
                        autoComplete="email"
                        autoCapitalize="none"
                        hasError={!!errors.parent?.parentEmail}
                      />
                      <FieldError message={errors.parent?.parentEmail?.message} />
                    </div>

                    <div>
                      <FieldLabel required>Parent WhatsApp Number</FieldLabel>
                      <TextInput
                        {...register('parent.parentPhone')}
                        type="tel"
                        placeholder="10-digit mobile number"
                        inputMode="numeric"
                        autoComplete="tel"
                        hasError={!!errors.parent?.parentPhone}
                      />
                      <FieldError message={errors.parent?.parentPhone?.message} />
                    </div>

                    <div>
                      <FieldLabel required>Emergency Contact Number</FieldLabel>
                      <TextInput
                        {...register('parent.emergencyContact')}
                        type="tel"
                        placeholder="Alternate number to reach your family"
                        inputMode="numeric"
                        autoComplete="tel"
                        hasError={!!errors.parent?.emergencyContact}
                      />
                      <FieldError message={errors.parent?.emergencyContact?.message} />
                    </div>
                  </FormCard>

                  {/* Card 2 · Consent */}
                  <FormCard icon="📋" title="Consent & Safety" index={1}>
                    <p className="text-sm font-body leading-relaxed" style={{ color: 'var(--text-3)' }}>
                      Super Builders is 100% online. All sessions are recorded. No personal details are shared publicly. Tap each card to confirm.
                    </p>

                    <div className="flex flex-col gap-3">
                      <Controller
                        control={control}
                        name="parent.consentGiven"
                        render={({ field }) => (
                          <ConsentCard
                            checked={field.value === true}
                            onChange={field.onChange}
                            disabled={submitting}
                          >
                            <span className="font-semibold block mb-1" style={{ color: 'var(--text-1)' }}>
                              Parental Consent ✅
                            </span>
                            I consent to my child participating in Super Builders — School Edition 2025, including live workshops, the 24-hour hackathon, and communications from zer0.pro.
                          </ConsentCard>
                        )}
                      />
                      <FieldError message={errors.parent?.consentGiven?.message} />

                      <Controller
                        control={control}
                        name="parent.safetyAcknowledged"
                        render={({ field }) => (
                          <ConsentCard
                            checked={field.value === true}
                            onChange={field.onChange}
                            disabled={submitting}
                          >
                            <span className="font-semibold block mb-1" style={{ color: 'var(--text-1)' }}>
                              Safety Acknowledgement 🛡️
                            </span>
                            I confirm I have read the safety guidelines. This is a supervised, online-only event with no in-person requirements.
                          </ConsentCard>
                        )}
                      />
                      <FieldError message={errors.parent?.safetyAcknowledged?.message} />
                    </div>
                  </FormCard>

                  {/* Server error */}
                  <AnimatePresence>
                    {serverError && (
                      <motion.div
                        initial={{ opacity: 0, y: 8 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0 }}
                        className="rounded-xl px-4 py-3 text-sm font-body"
                        style={{
                          background: 'rgba(248,113,113,0.07)',
                          border: '1px solid rgba(248,113,113,0.3)',
                          color: 'var(--red)',
                        }}
                        role="alert"
                      >
                        ⚠️ {serverError}
                      </motion.div>
                    )}
                  </AnimatePresence>

                  {/* Submit CTA */}
                  <CTAButton type="submit" loading={submitting}>
                    🚀 Submit Application
                  </CTAButton>

                  {/* Back */}
                  <button
                    type="button"
                    onClick={handleBack}
                    disabled={submitting}
                    className="w-full flex items-center justify-center gap-1.5 text-sm font-body transition-opacity active:opacity-60"
                    style={{ minHeight: '44px', color: 'var(--text-4)' }}
                  >
                    <ArrowLeft size={14} />
                    Back to About You
                  </button>
                </>
              )}
            </motion.div>
          </AnimatePresence>
        </div>
      </form>
    </>
  )
}
