'use client'

import React, { useState, useMemo, useCallback } from 'react'
import { useRouter } from 'next/navigation'
import { useForm, Controller, useWatch } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { motion, AnimatePresence } from 'framer-motion'
import { Check, Loader2, Lightbulb, Lock } from 'lucide-react'
import { ideaSchema, type IdeaFormData } from '@/lib/validation/stage2'
import { submitIdea } from '@/lib/actions/registration'
import { BadgeUnlock } from '@/components/gamification/BadgeUnlock'
import type { BadgeId } from '@/lib/gamification/badges'

// ─── Domain config ────────────────────────────────────────────────────────────

const DOMAINS = [
  {
    value:   'health'       as const,
    label:   'Health',
    emoji:   '🏥',
    teaser:  'AI tools for healthcare access',
    color:   '#22C55E',
    bg:      'rgba(34,197,94,0.08)',
  },
  {
    value:   'education'    as const,
    label:   'Education',
    emoji:   '🎓',
    teaser:  'AI tools for smarter classrooms',
    color:   '#60A5FA',
    bg:      'rgba(96,165,250,0.08)',
  },
  {
    value:   'finance'      as const,
    label:   'Finance',
    emoji:   '💰',
    teaser:  'AI for financial literacy',
    color:   '#FFB800',
    bg:      'rgba(255,184,0,0.08)',
  },
  {
    value:   'environment'  as const,
    label:   'Environment',
    emoji:   '🌱',
    teaser:  'AI for climate & sustainability',
    color:   '#34D399',
    bg:      'rgba(52,211,153,0.08)',
  },
  {
    value:   'entertainment' as const,
    label:   'Entertainment',
    emoji:   '🎮',
    teaser:  'AI-powered games, music & more',
    color:   '#C084FC',
    bg:      'rgba(192,132,252,0.08)',
  },
  {
    value:   'social_impact' as const,
    label:   'Social Impact',
    emoji:   '🤝',
    teaser:  'AI that gives back to communities',
    color:   '#FB923C',
    bg:      'rgba(251,147,60,0.08)',
  },
] as const

type DomainValue = typeof DOMAINS[number]['value']

// ─── Domain-aware copy ────────────────────────────────────────────────────────

const PROBLEM_PLACEHOLDERS: Partial<Record<DomainValue, string>> = {
  health:        "e.g. Many people in rural India can't reach a doctor quickly. A symptom-checker chatbot in local languages could give preliminary guidance and reduce unnecessary clinic visits...",
  education:     "e.g. Students studying alone often get stuck with no one to ask. An AI tutor that explains concepts in simple language and adapts to each student's pace could transform self-study...",
  finance:       "e.g. Most families don't track spending and end up in debt without realising it. An AI budgeting assistant that auto-categorises expenses from a photo of bills could help millions...",
  environment:   "e.g. Farmers struggle to plan crops without reliable rainfall data for their village. An AI tool trained on local weather patterns could send weekly crop advisory messages via WhatsApp...",
  entertainment: "e.g. People spend more time choosing what to watch than actually watching. An AI system that reads your mood from a quick selfie and picks the perfect film could fix that...",
  social_impact: "e.g. Elderly people in cities often feel isolated but don't know how to reach community support. An AI companion that checks in daily and connects them to local volunteers could help...",
}

const DOMAIN_TIPS: Partial<Record<DomainValue, { title: string; tips: string[] }>> & { default: { title: string; tips: string[] } } = {
  health: {
    title: '🏥 Health Ideas That Win',
    tips: [
      'Focus on accessibility — rural clinics, language barriers, or affordability gaps',
      "Be specific: 'mental health support for Class 10 students' beats 'health app'",
      'Judges love ideas grounded in real observations or personal experience',
    ],
  },
  education: {
    title: '🎓 Education Ideas That Win',
    tips: [
      'Target a real gap — homework help, weak-subject coaching, or exam anxiety',
      'Consider teachers as users too — tools that save teacher time score well',
      'Ideas that work offline or on low-end phones are especially valued in India',
    ],
  },
  finance: {
    title: '💰 Finance Ideas That Win',
    tips: [
      'Focus on first-time earners, students, or parents managing tight budgets',
      'Simple > sophisticated: an SMS-based tool beats a complex app here',
      'Show you understand the user\'s mindset — trust and privacy matter most',
    ],
  },
  environment: {
    title: '🌱 Environment Ideas That Win',
    tips: [
      'Localise it — water scarcity in Rajasthan, floods in Assam, heat in Delhi',
      'Think about who actually implements the fix — farmers, municipalities, kids',
      'Behavioural nudges ("save 2L water today") often beat big infrastructure plays',
    ],
  },
  entertainment: {
    title: '🎮 Entertainment Ideas That Win',
    tips: [
      'AI-generated content that\'s personalised and interactive scores highest',
      'Think about discovery — finding new music, stories, or games people love',
      'Indian languages and cultural context are a massive underserved market',
    ],
  },
  social_impact: {
    title: '🤝 Social Impact Ideas That Win',
    tips: [
      'Start with a community you know — your street, your school, your town',
      'AI that bridges gaps between people (volunteers ↔ those who need help) is powerful',
      'Concrete measurable outcomes ("connects 50 mentors to 500 students") impress judges',
    ],
  },
  default: {
    title: '💡 What Makes a Great Idea?',
    tips: [
      'Pick a real problem you\'ve personally seen or experienced',
      'The more specific your target user, the stronger your idea reads',
      'You don\'t need to know how to build it yet — judges reward the thinking',
    ],
  },
}

const TECH_OPTS = ['Python', 'No-code', 'JavaScript', "I don't know yet"] as const

// ─── Utilities ────────────────────────────────────────────────────────────────

function wordCount(text: string): number {
  return text.trim().split(/\s+/).filter(Boolean).length
}

// ─── Sub-components ───────────────────────────────────────────────────────────

function FieldError({ message }: { message?: string }) {
  if (!message) return null
  return (
    <motion.p
      className="text-xs font-body mt-1.5 flex items-center gap-1"
      style={{ color: 'var(--red)' }}
      initial={{ opacity: 0, x: -6 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ duration: 0.2 }}
      role="alert"
    >
      <span aria-hidden="true">⚠</span> {message}
    </motion.p>
  )
}

function FieldLabel({ children, optional }: { children: React.ReactNode; optional?: boolean }) {
  return (
    <p className="text-xs font-mono font-medium mb-1.5 flex items-center gap-2" style={{ color: 'var(--text-3)' }}>
      {children}
      {optional && (
        <span className="rounded-full px-2 py-0.5 text-[12px]"
          style={{ background: 'var(--bg-float)', color: 'var(--text-4)', border: '1px solid var(--border-faint)' }}>
          optional
        </span>
      )}
    </p>
  )
}

// Word-counted textarea — all in one unit
function WordTextarea({
  value,
  onChange,
  maxWords,
  placeholder,
  hasError,
  rows = 5,
  ...rest
}: {
  value: string
  onChange: (v: string) => void
  maxWords: number
  placeholder?: string
  hasError?: boolean
  rows?: number
} & Omit<React.TextareaHTMLAttributes<HTMLTextAreaElement>, 'value' | 'onChange' | 'rows'>) {
  const words = wordCount(value)
  const pct = words / maxWords
  const counterColor = pct >= 1 ? 'var(--red)' : pct >= 0.9 ? 'var(--amber)' : 'var(--text-3)'

  return (
    <div>
      <textarea
        value={value}
        onChange={e => onChange(e.target.value)}
        rows={rows}
        placeholder={placeholder}
        inputMode="text"
        autoCapitalize="sentences"
        className="w-full rounded-xl px-4 py-3 font-body transition-colors outline-none resize-none placeholder:opacity-30"
        style={{
          minHeight: '120px',
          background: 'var(--bg-inset)',
          border: `1px solid ${hasError ? 'rgba(248,113,113,0.45)' : 'var(--border-subtle)'}`,
          color: 'var(--text-1)',
          fontSize: '16px',
        }}
        {...rest}
      />
      <div className="flex items-center justify-between mt-1">
        <span />
        <span className="text-xs font-mono transition-colors" style={{ color: counterColor }}>
          {words} / {maxWords} words
        </span>
      </div>
    </div>
  )
}

// Domain selection card
function DomainCard({
  domain,
  selected,
  onSelect,
  animKey,
}: {
  domain: typeof DOMAINS[number]
  selected: boolean
  onSelect: () => void
  animKey: number
}) {
  return (
    <motion.button
      key={animKey}
      type="button"
      onClick={onSelect}
      className="relative flex flex-col items-start gap-2 rounded-2xl p-4 text-left w-full transition-shadow"
      style={{
        background: selected ? domain.bg : 'var(--bg-card)',
        border: `2px solid ${selected ? domain.color : 'var(--border-faint)'}`,
        minHeight: '96px',
      }}
      initial={animKey > 0 ? { scale: 1.06 } : false}
      animate={{ scale: 1 }}
      whileTap={{ scale: 0.96 }}
      transition={{ type: 'spring' as const, stiffness: 380, damping: 20 }}
    >
      {/* Checkmark badge */}
      <AnimatePresence>
        {selected && (
          <motion.div
            className="absolute top-2.5 right-2.5 flex items-center justify-center rounded-full"
            style={{
              width: '20px', height: '20px',
              background: domain.color,
            }}
            initial={{ scale: 0, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0, opacity: 0 }}
            transition={{ type: 'spring' as const, stiffness: 500, damping: 22 }}
          >
            <Check size={11} strokeWidth={3} color="#000" />
          </motion.div>
        )}
      </AnimatePresence>

      <span className="text-2xl leading-none" aria-hidden="true">{domain.emoji}</span>

      <div>
        <p
          className="font-heading font-bold text-sm leading-tight"
          style={{ color: selected ? domain.color : 'var(--text-1)' }}
        >
          {domain.label}
        </p>
        <p className="text-[13px] font-body mt-0.5 leading-tight" style={{ color: 'var(--text-4)' }}>
          {domain.teaser}
        </p>
      </div>
    </motion.button>
  )
}

// Desktop sticky side panel
function SidePanel({ domain }: { domain: DomainValue | undefined }) {
  const tips = domain ? (DOMAIN_TIPS[domain] ?? DOMAIN_TIPS.default) : DOMAIN_TIPS.default

  // Only on 2xl+ (≥1536px): calc(50% + 472px) accounts for the 240px sidebar,
  // placing the panel 16px past the max-w-2xl form's right edge at any viewport.
  return (
    <div
      className="hidden 2xl:block fixed w-[234px]"
      style={{ top: '180px', left: 'calc(50% + 472px)' }}
      aria-label="Idea tips panel"
    >
      <AnimatePresence mode="wait">
        <motion.div
          key={domain ?? 'default'}
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -8 }}
          transition={{ duration: 0.28, ease: 'easeOut' }}
          className="rounded-2xl p-5 flex flex-col gap-4"
          style={{
            background: 'var(--bg-card)',
            border: '1px solid var(--border-faint)',
            boxShadow: '0 4px 24px rgba(0,0,0,0.4)',
          }}
        >
          <div className="flex items-center gap-2">
            <Lightbulb size={14} style={{ color: 'var(--brand)' }} />
            <p className="text-xs font-heading font-semibold uppercase tracking-[0.1em]" style={{ color: 'var(--brand)' }}>
              Pro Tips
            </p>
          </div>

          <p className="text-sm font-heading font-bold leading-tight" style={{ color: 'var(--text-1)' }}>
            {tips.title}
          </p>

          <ul className="flex flex-col gap-3">
            {tips.tips.map((tip, i) => (
              <li key={i} className="flex items-start gap-2.5">
                <div
                  className="mt-1 flex-shrink-0 w-1.5 h-1.5 rounded-full"
                  style={{ background: 'var(--brand)' }}
                  aria-hidden="true"
                />
                <p className="text-xs font-body leading-relaxed" style={{ color: 'var(--text-2)' }}>
                  {tip}
                </p>
              </li>
            ))}
          </ul>

          {/* Bottom decoration */}
          <div
            className="rounded-xl px-3 py-2.5 text-[13px] font-mono"
            style={{
              background: 'var(--brand-subtle)',
              border: '1px solid var(--border-brand)',
              color: 'var(--text-brand)',
            }}
          >
            💡 No idea is too small. The best builders started with a rough sketch.
          </div>
        </motion.div>
      </AnimatePresence>
    </div>
  )
}

// ─── Main form ────────────────────────────────────────────────────────────────

export function IdeaForm({ lockedDomain }: { lockedDomain: DomainValue }) {
  const router = useRouter()
  const [submitting, setSubmitting]     = useState(false)
  const [serverError, setServerError]   = useState<string | null>(null)
  const [pendingBadge, setPendingBadge] = useState<BadgeId | null>(null)
  const [animKeys]                      = useState<Partial<Record<DomainValue, number>>>({})

  const {
    control,
    handleSubmit,
    formState: { errors },
  } = useForm<IdeaFormData>({
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    resolver: zodResolver(ideaSchema) as any,
    mode: 'onBlur',
    reValidateMode: 'onChange',
    defaultValues: {
      domain:        lockedDomain,
      techStackPref: undefined,
      priorBuildExp: undefined,
    },
  })

  const selectedDomain = useWatch({ control, name: 'domain' }) as DomainValue | undefined

  // Domain is locked — no-op handler
  const handleDomainSelect = useCallback(
    (_onChange: (v: DomainValue) => void, _value: DomainValue) => {
      // Domain is locked after selection in stage-2/domain — cannot be changed here
    },
    [],
  )

  const onSubmit = handleSubmit(async (data) => {
    setSubmitting(true)
    setServerError(null)
    try {
      const result = await submitIdea(data)
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
    router.push('/dashboard/engage')
  }, [router])

  // Dynamic placeholder for problem statement based on domain
  const problemPlaceholder = useMemo(() =>
    selectedDomain
      ? (PROBLEM_PLACEHOLDERS[selectedDomain] ?? 'Describe the problem you want to solve with AI...')
      : 'Describe the problem you want to solve with AI. Be as specific as you can!',
    [selectedDomain],
  )

  return (
    <>
      <BadgeUnlock badge={pendingBadge} onDismiss={handleBadgeDismiss} />
      <SidePanel domain={selectedDomain} />

      <div className="max-w-2xl mx-auto px-4 md:px-6 pt-5 pb-12">
      <form onSubmit={onSubmit} noValidate className="flex flex-col gap-6">

        {/* ── Page header ─────────────────────────────────────────────────── */}
        <div className="flex flex-col gap-3">
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] as [number,number,number,number] }}
          >
            <h1
              className="font-display tracking-wider leading-none"
              style={{ fontSize: 'clamp(2.4rem, 8vw, 3.5rem)', color: 'var(--brand)' }}
            >
              PITCH YOUR IDEA
              <br />
              TO THE WORLD 💡
            </h1>
          </motion.div>
          <motion.p
            className="text-base font-body leading-relaxed"
            style={{ color: 'var(--text-2)' }}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.15, duration: 0.4 }}
          >
            Don't worry about being perfect. Tell us what problem you want to solve — judges reward bold thinking over polished presentations.
          </motion.p>
        </div>

        {/* ── Domain (locked) ─────────────────────────────────────────────── */}
        <motion.section
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1, duration: 0.45, ease: [0.16, 1, 0.3, 1] as [number,number,number,number] }}
          aria-labelledby="domain-label"
        >
          <p
            id="domain-label"
            className="text-xs font-mono font-semibold uppercase tracking-[0.12em] mb-3"
            style={{ color: 'var(--text-3)' }}
          >
            Your domain <span style={{ color: 'var(--brand)' }}>*</span>
          </p>

          {/* Locked domain display */}
          {(() => {
            const d = DOMAINS.find(x => x.value === lockedDomain)
            if (!d) return null
            return (
              <div
                className="flex items-center gap-4 rounded-2xl px-4 py-4 border"
                style={{
                  background:  d.bg,
                  borderColor: `${d.color}50`,
                }}
              >
                <span className="text-3xl select-none" aria-hidden="true">{d.emoji}</span>
                <div className="flex-1">
                  <p className="font-heading font-bold text-sm" style={{ color: d.color }}>
                    {d.label}
                  </p>
                  <p className="text-xs mt-0.5" style={{ color: 'var(--text-3)' }}>
                    {d.teaser}
                  </p>
                </div>
                <div
                  className="flex items-center gap-1 rounded-full px-2.5 py-1 text-[13px] font-mono"
                  style={{ background: 'var(--bg-float)', border: '1px solid var(--border-subtle)', color: 'var(--text-4)' }}
                >
                  <Lock size={10} />
                  Locked
                </div>
              </div>
            )
          })()}

          {/* Hidden field to keep form value in sync */}
          <Controller
            control={control}
            name="domain"
            render={({ field }) => (
              <input type="hidden" value={field.value ?? lockedDomain} readOnly />
            )}
          />

          <p className="text-xs mt-2 font-body" style={{ color: 'var(--text-4)' }}>
            Your domain is locked to <strong style={{ color: 'var(--text-3)' }}>{DOMAINS.find(d => d.value === lockedDomain)?.label ?? lockedDomain}</strong>. This was set in the previous step.
          </p>
          <FieldError message={errors.domain?.message} />
        </motion.section>

        {/* ── Divider ─────────────────────────────────────────────────────── */}
        <div
          className="h-px w-full"
          style={{ background: 'var(--border-faint)' }}
          aria-hidden="true"
        />

        {/* ── Text fields ─────────────────────────────────────────────────── */}
        <motion.div
          className="flex flex-col gap-6"
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2, duration: 0.4 }}
        >

          {/* Problem statement */}
          <div>
            <FieldLabel>What problem do you want to solve?</FieldLabel>
            <Controller
              control={control}
              name="problemStatement"
              render={({ field }) => (
                <WordTextarea
                  value={field.value ?? ''}
                  onChange={field.onChange}
                  maxWords={200}
                  placeholder={problemPlaceholder}
                  hasError={!!errors.problemStatement}
                  rows={6}
                />
              )}
            />
            <FieldError message={errors.problemStatement?.message} />
          </div>

          {/* Target user */}
          <div>
            <FieldLabel>Who will it help? Describe your target user.</FieldLabel>
            <Controller
              control={control}
              name="targetUser"
              render={({ field }) => (
                <WordTextarea
                  value={field.value ?? ''}
                  onChange={field.onChange}
                  maxWords={150}
                  placeholder="e.g. Class 10 students in tier-2 cities who study alone without access to tuition centres..."
                  hasError={!!errors.targetUser}
                  rows={4}
                />
              )}
            />
            <FieldError message={errors.targetUser?.message} />
          </div>

          {/* AI approach */}
          <div>
            <FieldLabel>How might AI help solve it?</FieldLabel>
            <p className="text-xs font-body mb-2" style={{ color: 'var(--text-4)' }}>
              Don't worry about technical details yet — just share your thinking 💭
            </p>
            <Controller
              control={control}
              name="aiApproach"
              render={({ field }) => (
                <WordTextarea
                  value={field.value ?? ''}
                  onChange={field.onChange}
                  maxWords={150}
                  placeholder="e.g. An AI chatbot that can answer subject questions in simple language, recognise when a student is confused, and suggest shorter explanations..."
                  hasError={!!errors.aiApproach}
                  rows={4}
                />
              )}
            />
            <FieldError message={errors.aiApproach?.message} />
          </div>

          {/* Tech stack preference — optional pill selector */}
          <div>
            <FieldLabel optional>Tech stack preference</FieldLabel>
            <Controller
              control={control}
              name="techStackPref"
              render={({ field }) => (
                <div className="flex flex-wrap gap-2">
                  {TECH_OPTS.map(opt => {
                    const sel = field.value === opt
                    return (
                      <button
                        key={opt}
                        type="button"
                        onClick={() => field.onChange(sel ? undefined : opt)}
                        className="flex items-center gap-1.5 rounded-full text-sm font-body font-medium transition-all active:scale-95 select-none"
                        style={{
                          minHeight: '44px',
                          padding: '0 16px',
                          background: sel ? 'rgba(255,184,0,0.10)' : 'var(--bg-float)',
                          border: `1.5px solid ${sel ? 'var(--brand)' : 'var(--border-subtle)'}`,
                          color: sel ? 'var(--brand)' : 'var(--text-3)',
                          fontWeight: sel ? 600 : 400,
                        }}
                      >
                        {opt}
                        {sel && <Check size={11} strokeWidth={3} className="ml-1" />}
                      </button>
                    )
                  })}
                </div>
              )}
            />
          </div>

          {/* Prior build experience — optional */}
          <div>
            <FieldLabel optional>Have you tried building anything before?</FieldLabel>
            <Controller
              control={control}
              name="priorBuildExp"
              render={({ field }) => (
                <WordTextarea
                  value={field.value ?? ''}
                  onChange={field.onChange}
                  maxWords={150}
                  placeholder="e.g. I made a basic website using HTML/CSS in school, or I tried Scratch once, or this will be my first time..."
                  rows={3}
                />
              )}
            />
          </div>
        </motion.div>

        {/* ── Server error ─────────────────────────────────────────────────── */}
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

        {/* ── Submit ──────────────────────────────────────────────────────── */}
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.25, duration: 0.4 }}
          className="flex flex-col gap-3 pb-8"
        >
          {/* Mobile tips (below xl, above submit) */}
          {selectedDomain && (
            <div
              className="xl:hidden rounded-xl p-4 flex flex-col gap-3"
              style={{
                background: 'var(--bg-card)',
                border: '1px solid var(--border-faint)',
              }}
            >
              <p className="text-xs font-heading font-semibold uppercase tracking-wider" style={{ color: 'var(--brand)' }}>
                💡 {DOMAIN_TIPS[selectedDomain]?.title ?? DOMAIN_TIPS.default.title}
              </p>
              <ul className="flex flex-col gap-2">
                {(DOMAIN_TIPS[selectedDomain]?.tips ?? DOMAIN_TIPS.default.tips).map((tip, i) => (
                  <li key={i} className="flex items-start gap-2">
                    <div className="mt-1.5 flex-shrink-0 w-1 h-1 rounded-full" style={{ background: 'var(--brand)' }} />
                    <p className="text-xs font-body leading-relaxed" style={{ color: 'var(--text-2)' }}>{tip}</p>
                  </li>
                ))}
              </ul>
            </div>
          )}

          <motion.button
            type="submit"
            disabled={submitting}
            whileTap={!submitting ? { scale: 0.98 } : {}}
            className="w-full rounded-2xl font-heading font-bold text-base tracking-wide flex items-center justify-center gap-2.5 transition-all"
            style={{
              minHeight: '56px',
              background: submitting
                ? 'var(--bg-float)'
                : 'linear-gradient(135deg, #FFB800, #FFCF40)',
              color: submitting ? 'var(--text-4)' : '#000',
              border: submitting ? '1px solid var(--border-subtle)' : 'none',
              cursor: submitting ? 'not-allowed' : 'pointer',
              boxShadow: submitting ? 'none' : '0 0 32px rgba(255,184,0,0.25)',
            }}
          >
            {submitting ? (
              <>
                <Loader2 size={18} className="animate-spin" />
                Launching...
              </>
            ) : (
              'Launch My Idea 🚀'
            )}
          </motion.button>

          <p className="text-center text-xs font-body" style={{ color: 'var(--text-4)' }}>
            You can edit this later in your dashboard before the hackathon.
          </p>
        </motion.div>
      </form>
      </div>
    </>
  )
}
