'use client'

import { useState, useTransition } from 'react'
import { useRouter }               from 'next/navigation'
import { submitProjectAction }     from '@/lib/actions/project'
import type { ProjectFormData }    from '@/lib/actions/project'
import { BADGES }                  from '@/lib/gamification/badges'

const AI_TOOLS = [
  'ChatGPT', 'Claude', 'Gemini', 'GitHub Copilot', 'Cursor',
  'v0.dev', 'Bolt.new', 'Replit AI', 'Perplexity', 'Midjourney',
  'Stable Diffusion', 'ElevenLabs', 'Other',
]

const DOMAIN_LABELS: Record<string, string> = {
  health:        '🏥 Health',
  education:     '📚 Education',
  finance:       '💰 Finance',
  environment:   '🌿 Environment',
  entertainment: '🎮 Entertainment',
  social_impact: '🤝 Social Impact',
  other:         '✨ Other',
}

interface Props {
  domain:      string
  initialData: ProjectFormData | null
}

type Step = 1 | 2 | 3

export function ProjectSubmitForm({ domain, initialData }: Props) {
  const router             = useRouter()
  const [pending, start]   = useTransition()

  const [step, setStep]    = useState<Step>(1)
  const [success, setSuccess] = useState(false)
  const [badgeEarned, setBadge] = useState(false)
  const [error, setError]  = useState<string | null>(null)

  // Step 1
  const [title, setTitle]   = useState(initialData?.title ?? '')
  const [problem, setProblem] = useState(initialData?.problemStatement ?? '')
  const [solution, setSolution] = useState(initialData?.solutionDesc ?? '')

  // Step 2
  const [selectedTools, setTools] = useState<string[]>(initialData?.aiTools ?? [])
  const [techStack, setTechStack] = useState(initialData?.techStack ?? '')
  const [videoUrl, setVideoUrl]   = useState(initialData?.demoVideoUrl ?? '')
  const [githubUrl, setGithubUrl] = useState(initialData?.githubUrl ?? '')

  // Step 3
  const [challenge, setChallenge]  = useState(initialData?.biggestChallenge ?? '')
  const [nextSteps, setNextSteps]  = useState(initialData?.nextSteps ?? '')

  function toggleTool(tool: string) {
    setTools(prev =>
      prev.includes(tool) ? prev.filter(t => t !== tool) : [...prev, tool]
    )
  }

  function validateStep(s: Step): string | null {
    if (s === 1) {
      if (!title.trim())    return 'Project title is required.'
      if (!problem.trim())  return 'Problem statement is required.'
      if (!solution.trim()) return 'Solution description is required.'
    }
    if (s === 2) {
      if (!videoUrl.trim()) return 'Demo video URL is required.'
    }
    return null
  }

  function nextStep() {
    const err = validateStep(step)
    if (err) { setError(err); return }
    setError(null)
    setStep(s => (s + 1) as Step)
  }

  function prevStep() {
    setError(null)
    setStep(s => (s - 1) as Step)
  }

  function handleSubmit() {
    const err = validateStep(3)
    if (err) { setError(err); return }
    setError(null)

    const data: ProjectFormData = {
      title,
      problemStatement: problem,
      solutionDesc:     solution,
      aiTools:          selectedTools,
      techStack,
      demoVideoUrl:     videoUrl,
      githubUrl:        githubUrl || undefined,
      biggestChallenge: challenge || undefined,
      nextSteps:        nextSteps || undefined,
    }

    start(async () => {
      const result = await submitProjectAction(data)
      if (!result.success) {
        setError(result.error ?? 'Submission failed. Try again.')
      } else {
        setBadge(result.badgeEarned)
        setSuccess(true)
        router.refresh()
      }
    })
  }

  // ─── Success state ───────────────────────────────────────────
  if (success) {
    const hacker = BADGES.HACKER
    return (
      <div className="space-y-4">
        <div
          className="rounded-2xl border p-6 flex flex-col items-center gap-4 text-center"
          style={{ background: 'rgba(74,222,128,0.06)', borderColor: 'rgba(74,222,128,0.25)' }}
        >
          <span className="text-5xl">{badgeEarned ? hacker.emoji : '🚀'}</span>
          <div>
            <p className="font-display text-2xl tracking-wide mb-1" style={{ color: 'var(--text-1)' }}>
              {badgeEarned ? 'HACKER BADGE EARNED!' : 'PROJECT UPDATED!'}
            </p>
            <p className="font-body text-sm" style={{ color: 'var(--text-3)' }}>
              {badgeEarned
                ? `You earned the ${hacker.id.replace('_', ' ')} badge and +${hacker.xp} XP. You built something — that's real.`
                : 'Your submission has been updated. Good luck!'
              }
            </p>
          </div>
          {badgeEarned && (
            <div
              className="rounded-xl px-4 py-2 font-mono text-sm"
              style={{ background: `${hacker.color}15`, color: hacker.color, border: `1px solid ${hacker.color}30` }}
            >
              +{hacker.xp} XP · {hacker.copy}
            </div>
          )}
        </div>
        <button
          onClick={() => { setSuccess(false); setStep(1) }}
          className="w-full min-h-[44px] rounded-xl font-heading font-semibold text-sm border transition-all active:scale-95"
          style={{ borderColor: 'var(--border-subtle)', color: 'var(--text-2)' }}
        >
          Edit Submission
        </button>
      </div>
    )
  }

  // ─── Step indicator ──────────────────────────────────────────
  const STEPS = ['Basics', 'Tech & Demo', 'Reflection']

  return (
    <div className="space-y-5">
      {/* Step dots */}
      <div className="flex items-center gap-0 px-2">
        {STEPS.map((label, i) => {
          const num     = (i + 1) as Step
          const active  = step === num
          const done    = step > num
          return (
            <div key={label} className="flex items-center flex-1">
              <div className="flex flex-col items-center gap-1 w-8">
                <div
                  className="w-8 h-8 rounded-full flex items-center justify-center font-mono text-xs font-bold border-2 transition-all"
                  style={{
                    background:  done ? 'var(--brand)' : active ? 'rgba(255,184,0,0.15)' : 'var(--bg-float)',
                    borderColor: done || active ? 'var(--brand)' : 'var(--border-subtle)',
                    color:       done ? '#000' : active ? 'var(--brand)' : 'var(--text-4)',
                  }}
                >
                  {done ? '✓' : num}
                </div>
                <span className="font-mono text-[9px] text-center leading-none w-14 -mx-3" style={{ color: active ? 'var(--text-brand)' : 'var(--text-4)' }}>
                  {label}
                </span>
              </div>
              {i < STEPS.length - 1 && (
                <div
                  className="flex-1 h-0.5 mx-1 mb-4"
                  style={{ background: done ? 'var(--brand)' : 'var(--border-subtle)' }}
                />
              )}
            </div>
          )
        })}
      </div>

      {/* Form card */}
      <div
        className="rounded-2xl border p-5 space-y-4"
        style={{ background: 'var(--bg-card)', borderColor: 'var(--border-faint)' }}
      >
        {/* ── Step 1 ── */}
        {step === 1 && (
          <>
            <div>
              <label className="font-mono text-[10px] tracking-[0.15em] uppercase block mb-1.5" style={{ color: 'var(--text-4)' }}>
                Project Title *
              </label>
              <input
                type="text"
                value={title}
                onChange={e => setTitle(e.target.value)}
                placeholder="e.g. CropAI — Farmer Advisory Bot"
                maxLength={120}
                className="w-full min-h-[48px] px-4 rounded-xl font-body text-sm outline-none border"
                style={{ background: 'var(--bg-float)', borderColor: 'var(--border-subtle)', color: 'var(--text-1)' }}
              />
            </div>

            <div>
              <label className="font-mono text-[10px] tracking-[0.15em] uppercase block mb-1.5" style={{ color: 'var(--text-4)' }}>
                Domain
              </label>
              <div
                className="min-h-[44px] px-4 rounded-xl font-body text-sm flex items-center border"
                style={{ background: 'var(--bg-float)', borderColor: 'var(--border-subtle)', color: 'var(--text-3)' }}
              >
                {DOMAIN_LABELS[domain] ?? domain}
                <span className="ml-2 font-mono text-[10px]" style={{ color: 'var(--text-4)' }}>(locked to your domain)</span>
              </div>
            </div>

            <div>
              <label className="font-mono text-[10px] tracking-[0.15em] uppercase block mb-1.5" style={{ color: 'var(--text-4)' }}>
                Problem Statement * <span className="normal-case" style={{ color: 'var(--text-4)' }}>(min 80 chars)</span>
              </label>
              <textarea
                value={problem}
                onChange={e => setProblem(e.target.value)}
                placeholder="What specific problem are you solving? Who faces this problem and why does it matter?"
                rows={4}
                inputMode="text"
                autoCapitalize="sentences"
                className="w-full px-4 py-3 rounded-xl font-body text-sm outline-none border resize-none"
                style={{ background: 'var(--bg-float)', borderColor: 'var(--border-subtle)', color: 'var(--text-1)' }}
              />
              <p className="font-mono text-[10px] mt-1 text-right" style={{ color: problem.length < 80 ? 'var(--text-4)' : 'var(--green)' }}>
                {problem.length} chars
              </p>
            </div>

            <div>
              <label className="font-mono text-[10px] tracking-[0.15em] uppercase block mb-1.5" style={{ color: 'var(--text-4)' }}>
                Your Solution * <span className="normal-case" style={{ color: 'var(--text-4)' }}>(min 80 chars)</span>
              </label>
              <textarea
                value={solution}
                onChange={e => setSolution(e.target.value)}
                placeholder="How does your solution work? What makes it unique? How does AI play a role?"
                rows={4}
                inputMode="text"
                autoCapitalize="sentences"
                className="w-full px-4 py-3 rounded-xl font-body text-sm outline-none border resize-none"
                style={{ background: 'var(--bg-float)', borderColor: 'var(--border-subtle)', color: 'var(--text-1)' }}
              />
              <p className="font-mono text-[10px] mt-1 text-right" style={{ color: solution.length < 80 ? 'var(--text-4)' : 'var(--green)' }}>
                {solution.length} chars
              </p>
            </div>
          </>
        )}

        {/* ── Step 2 ── */}
        {step === 2 && (
          <>
            <div>
              <label className="font-mono text-[10px] tracking-[0.15em] uppercase block mb-2" style={{ color: 'var(--text-4)' }}>
                AI Tools Used
              </label>
              <div className="flex flex-wrap gap-2">
                {AI_TOOLS.map(tool => {
                  const selected = selectedTools.includes(tool)
                  return (
                    <button
                      key={tool}
                      type="button"
                      onClick={() => toggleTool(tool)}
                      className="min-h-[36px] px-3 rounded-xl font-mono text-xs border transition-all active:scale-95"
                      style={{
                        background:  selected ? 'rgba(255,184,0,0.12)' : 'var(--bg-float)',
                        borderColor: selected ? 'rgba(255,184,0,0.4)' : 'var(--border-subtle)',
                        color:       selected ? 'var(--brand)' : 'var(--text-3)',
                      }}
                    >
                      {selected && '✓ '}{tool}
                    </button>
                  )
                })}
              </div>
            </div>

            <div>
              <label className="font-mono text-[10px] tracking-[0.15em] uppercase block mb-1.5" style={{ color: 'var(--text-4)' }}>
                Tech Stack
              </label>
              <input
                type="text"
                value={techStack}
                onChange={e => setTechStack(e.target.value)}
                placeholder="e.g. React, Python, FastAPI, Firebase"
                className="w-full min-h-[48px] px-4 rounded-xl font-body text-sm outline-none border"
                style={{ background: 'var(--bg-float)', borderColor: 'var(--border-subtle)', color: 'var(--text-1)' }}
              />
            </div>

            <div>
              <label className="font-mono text-[10px] tracking-[0.15em] uppercase block mb-1.5" style={{ color: 'var(--text-4)' }}>
                Demo Video URL * <span className="normal-case" style={{ color: 'var(--text-4)' }}>(YouTube, Loom, Drive)</span>
              </label>
              <input
                type="url"
                value={videoUrl}
                onChange={e => setVideoUrl(e.target.value)}
                placeholder="https://youtu.be/..."
                inputMode="url"
                className="w-full min-h-[48px] px-4 rounded-xl font-body text-sm outline-none border"
                style={{ background: 'var(--bg-float)', borderColor: 'var(--border-subtle)', color: 'var(--text-1)' }}
              />
            </div>

            <div>
              <label className="font-mono text-[10px] tracking-[0.15em] uppercase block mb-1.5" style={{ color: 'var(--text-4)' }}>
                GitHub URL <span className="normal-case" style={{ color: 'var(--text-4)' }}>(optional)</span>
              </label>
              <input
                type="url"
                value={githubUrl}
                onChange={e => setGithubUrl(e.target.value)}
                placeholder="https://github.com/..."
                inputMode="url"
                className="w-full min-h-[48px] px-4 rounded-xl font-body text-sm outline-none border"
                style={{ background: 'var(--bg-float)', borderColor: 'var(--border-subtle)', color: 'var(--text-1)' }}
              />
            </div>
          </>
        )}

        {/* ── Step 3 ── */}
        {step === 3 && (
          <>
            <div>
              <label className="font-mono text-[10px] tracking-[0.15em] uppercase block mb-1.5" style={{ color: 'var(--text-4)' }}>
                Biggest Challenge <span className="normal-case" style={{ color: 'var(--text-4)' }}>(optional)</span>
              </label>
              <textarea
                value={challenge}
                onChange={e => setChallenge(e.target.value)}
                placeholder="What was the hardest part to build? What did you learn?"
                rows={3}
                inputMode="text"
                autoCapitalize="sentences"
                className="w-full px-4 py-3 rounded-xl font-body text-sm outline-none border resize-none"
                style={{ background: 'var(--bg-float)', borderColor: 'var(--border-subtle)', color: 'var(--text-1)' }}
              />
            </div>

            <div>
              <label className="font-mono text-[10px] tracking-[0.15em] uppercase block mb-1.5" style={{ color: 'var(--text-4)' }}>
                Next Steps <span className="normal-case" style={{ color: 'var(--text-4)' }}>(optional)</span>
              </label>
              <textarea
                value={nextSteps}
                onChange={e => setNextSteps(e.target.value)}
                placeholder="If you had one more week, what would you add or improve?"
                rows={3}
                inputMode="text"
                autoCapitalize="sentences"
                className="w-full px-4 py-3 rounded-xl font-body text-sm outline-none border resize-none"
                style={{ background: 'var(--bg-float)', borderColor: 'var(--border-subtle)', color: 'var(--text-1)' }}
              />
            </div>

            {/* Summary */}
            <div
              className="rounded-xl p-4 space-y-1"
              style={{ background: 'var(--bg-float)', border: '1px solid var(--border-subtle)' }}
            >
              <p className="font-mono text-[10px] tracking-[0.15em] uppercase mb-2" style={{ color: 'var(--text-4)' }}>
                Submission Summary
              </p>
              <p className="font-heading font-semibold text-sm" style={{ color: 'var(--text-1)' }}>{title}</p>
              <p className="font-mono text-[11px]" style={{ color: 'var(--text-brand)' }}>
                {DOMAIN_LABELS[domain] ?? domain}
              </p>
              {selectedTools.length > 0 && (
                <p className="font-mono text-[11px]" style={{ color: 'var(--text-3)' }}>
                  AI: {selectedTools.slice(0, 4).join(', ')}{selectedTools.length > 4 ? ` +${selectedTools.length - 4}` : ''}
                </p>
              )}
              <p className="font-mono text-[11px] truncate" style={{ color: 'var(--text-4)' }}>
                🎥 {videoUrl}
              </p>
            </div>
          </>
        )}

        {/* Error */}
        {error && (
          <div
            className="rounded-xl px-4 py-3 font-body text-sm"
            style={{ background: 'rgba(248,113,113,0.1)', border: '1px solid rgba(248,113,113,0.25)', color: 'var(--red)' }}
          >
            {error}
          </div>
        )}

        {/* Nav buttons */}
        <div className="flex gap-3 pt-1">
          {step > 1 && (
            <button
              onClick={prevStep}
              className="flex-1 min-h-[44px] rounded-xl font-heading font-semibold text-sm border transition-all active:scale-95"
              style={{ borderColor: 'var(--border-subtle)', color: 'var(--text-2)' }}
            >
              ← Back
            </button>
          )}
          {step < 3 ? (
            <button
              onClick={nextStep}
              className="flex-1 min-h-[44px] rounded-xl font-heading font-bold text-sm tracking-wide transition-all active:scale-95"
              style={{ background: 'var(--brand)', color: '#000' }}
            >
              Next →
            </button>
          ) : (
            <button
              onClick={handleSubmit}
              disabled={pending}
              className="flex-1 min-h-[44px] rounded-xl font-heading font-bold text-sm tracking-wide transition-all active:scale-95 disabled:opacity-50"
              style={{ background: 'var(--brand)', color: '#000' }}
            >
              {pending ? 'Submitting…' : initialData ? '✓ Update Submission' : '🚀 Submit Project'}
            </button>
          )}
        </div>
      </div>
    </div>
  )
}
