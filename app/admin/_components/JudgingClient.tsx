'use client'

import { useState } from 'react'
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogClose,
} from '@/components/ui/dialog'
import type { ProjectCard, ScoredProject, LeaderboardEntry } from '@/lib/db/queries/admin'

// ─── Types ───────────────────────────────────────────────────────────────────
interface ScoreValues {
  innovation:   number
  impact:       number
  technical:    number
  presentation: number
  completeness: number
}

const CRITERIA: { key: keyof ScoreValues; label: string; max: number; desc: string }[] = [
  { key: 'innovation',   label: 'Innovation & Originality',       max: 25, desc: 'Unique, thoughtful idea' },
  { key: 'impact',       label: 'Impact & Problem-Solution Fit',   max: 25, desc: 'Solves a real problem' },
  { key: 'technical',    label: 'Technical Implementation',        max: 25, desc: 'Works well, AI used effectively' },
  { key: 'presentation', label: 'Presentation',                   max: 15, desc: 'Clear, compelling demo' },
  { key: 'completeness', label: 'Completeness',                   max: 10, desc: 'Fully documented' },
]

const DOMAIN_COLORS: Record<string, string> = {
  health:        'var(--green)',
  education:     'var(--blue)',
  finance:       'var(--amber)',
  environment:   'var(--bdg-launcher, #34D399)',
  entertainment: 'var(--purple)',
  social_impact: 'var(--bdg-warrior, #FB923C)',
  other:         'var(--text-3)',
}

// ─── Scoring Dialog ───────────────────────────────────────────────────────────
function ScoringDialog({
  project,
  judgeClerkId,
  onClose,
  onScored,
}: {
  project:      ProjectCard
  judgeClerkId: string
  onClose:      () => void
  onScored:     (projectId: string) => void
}) {
  const [scores, setScores] = useState<ScoreValues>({
    innovation: 0, impact: 0, technical: 0, presentation: 0, completeness: 0,
  })
  const [feedback, setFeedback] = useState('')
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const total = scores.innovation + scores.impact + scores.technical + scores.presentation + scores.completeness

  async function handleSubmit() {
    setSubmitting(true)
    setError(null)
    try {
      const res = await fetch('/api/admin/judging/score', {
        method:  'POST',
        headers: { 'Content-Type': 'application/json' },
        body:    JSON.stringify({
          projectId:    project.id,
          judgeClerkId,
          ...scores,
          totalScore: total,
          feedback,
        }),
      })
      if (!res.ok) throw new Error(await res.text())
      onScored(project.id)
      onClose()
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Failed to submit')
    } finally {
      setSubmitting(false)
    }
  }

  // Embed helper: detect YouTube/Loom
  function getEmbedUrl(url: string | null): string | null {
    if (!url) return null
    const ytMatch = url.match(/(?:youtube\.com\/watch\?v=|youtu\.be\/)([^&\s]+)/)
    if (ytMatch) return `https://www.youtube.com/embed/${ytMatch[1]}`
    const loomMatch = url.match(/loom\.com\/share\/([^?]+)/)
    if (loomMatch) return `https://www.loom.com/embed/${loomMatch[1]}`
    return null
  }

  const embedUrl = getEmbedUrl(project.demoVideoUrl)

  return (
    <Dialog open onOpenChange={open => { if (!open) onClose() }}>
      <DialogContent
        className="max-w-2xl w-full max-h-[90vh] overflow-y-auto p-0"
        style={{ background: 'var(--bg-card)', borderColor: 'var(--border-subtle)' }}
      >
        <DialogHeader
          className="px-5 py-4 border-b sticky top-0 z-10"
          style={{ background: 'var(--bg-card)', borderColor: 'var(--border-faint)' }}
        >
          <div className="flex items-start justify-between gap-3">
            <div>
              <DialogTitle style={{ color: 'var(--text-1)' }}>{project.title}</DialogTitle>
              <p className="text-xs mt-1" style={{ color: 'var(--text-3)' }}>
                {project.studentName} · Grade {project.grade}
                {project.city && ` · ${project.city}`}
              </p>
            </div>
            <span
              className="text-xs px-2 py-1 rounded-full shrink-0"
              style={{
                background: 'var(--bg-float)',
                color:      DOMAIN_COLORS[project.domain] ?? 'var(--text-3)',
              }}
            >
              {project.domain.replace('_', ' ')}
            </span>
          </div>
        </DialogHeader>

        <div className="p-5 space-y-5">
          {/* Project details */}
          <div className="space-y-3">
            <div>
              <p className="text-xs uppercase tracking-wider mb-1" style={{ color: 'var(--text-4)' }}>Problem</p>
              <p className="text-sm" style={{ color: 'var(--text-2)' }}>{project.problemStatement}</p>
            </div>
            <div>
              <p className="text-xs uppercase tracking-wider mb-1" style={{ color: 'var(--text-4)' }}>Solution</p>
              <p className="text-sm" style={{ color: 'var(--text-2)' }}>{project.solutionDesc}</p>
            </div>
          </div>

          {/* Links */}
          {(project.githubUrl || project.demoVideoUrl) && (
            <div className="flex gap-3">
              {project.githubUrl && (
                <a
                  href={project.githubUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-xs px-3 py-1.5 rounded-lg border"
                  style={{ borderColor: 'var(--border-subtle)', color: 'var(--blue)' }}
                >
                  GitHub ↗
                </a>
              )}
              {project.demoVideoUrl && !embedUrl && (
                <a
                  href={project.demoVideoUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-xs px-3 py-1.5 rounded-lg border"
                  style={{ borderColor: 'var(--border-subtle)', color: 'var(--purple)' }}
                >
                  Demo Video ↗
                </a>
              )}
            </div>
          )}

          {/* Embedded video */}
          {embedUrl && (
            <div className="aspect-video rounded-lg overflow-hidden" style={{ background: 'var(--bg-void)' }}>
              <iframe
                src={embedUrl}
                className="w-full h-full"
                allowFullScreen
                title="Demo video"
              />
            </div>
          )}

          {/* Screenshots */}
          {project.screenshotUrls && project.screenshotUrls.length > 0 && (
            <div className="flex gap-2 overflow-x-auto pb-1">
              {project.screenshotUrls.slice(0, 5).map((url, i) => (
                <img
                  key={i}
                  src={url}
                  alt={`Screenshot ${i + 1}`}
                  className="h-24 w-auto rounded-lg shrink-0 object-cover"
                  style={{ border: '1px solid var(--border-faint)' }}
                />
              ))}
            </div>
          )}

          {/* Divider */}
          <div className="border-t" style={{ borderColor: 'var(--border-faint)' }} />

          {/* Live score total */}
          <div className="flex items-center justify-between">
            <p className="text-sm font-medium" style={{ color: 'var(--text-3)' }}>Your Score</p>
            <p className="font-display text-4xl" style={{ color: 'var(--text-brand)' }}>
              {total} <span className="text-xl" style={{ color: 'var(--text-4)' }}>/ 100</span>
            </p>
          </div>

          {/* Criteria sliders */}
          <div className="space-y-5">
            {CRITERIA.map(c => (
              <div key={c.key} className="space-y-1.5">
                <div className="flex justify-between items-baseline">
                  <div>
                    <span className="text-sm font-medium" style={{ color: 'var(--text-1)' }}>{c.label}</span>
                    <span className="text-xs ml-2" style={{ color: 'var(--text-4)' }}>{c.desc}</span>
                  </div>
                  <span className="font-display text-xl" style={{ color: 'var(--text-brand)' }}>
                    {scores[c.key]}
                    <span className="text-xs ml-0.5" style={{ color: 'var(--text-4)' }}>/{c.max}</span>
                  </span>
                </div>
                <input
                  type="range"
                  min={0}
                  max={c.max}
                  value={scores[c.key]}
                  onChange={e => setScores(prev => ({ ...prev, [c.key]: parseInt(e.target.value) }))}
                  className="w-full h-2 rounded-full appearance-none cursor-pointer"
                  style={{
                    background: `linear-gradient(to right, var(--brand) ${(scores[c.key] / c.max) * 100}%, var(--bg-float) ${(scores[c.key] / c.max) * 100}%)`,
                    accentColor: 'var(--brand)',
                  }}
                />
              </div>
            ))}
          </div>

          {/* Feedback */}
          <div className="space-y-1.5">
            <label className="text-xs uppercase tracking-wider" style={{ color: 'var(--text-4)' }}>
              Feedback (optional)
            </label>
            <textarea
              value={feedback}
              onChange={e => setFeedback(e.target.value)}
              rows={3}
              placeholder="Constructive feedback for the student…"
              className="w-full px-3 py-2.5 text-sm rounded-lg border resize-none outline-none"
              style={{
                background:  'var(--bg-float)',
                borderColor: 'var(--border-subtle)',
                color:       'var(--text-1)',
              }}
            />
          </div>

          {error && (
            <p className="text-sm" style={{ color: 'var(--red)' }}>{error}</p>
          )}

          {/* Submit */}
          <button
            onClick={handleSubmit}
            disabled={submitting || total === 0}
            className="w-full min-h-[48px] rounded-xl font-semibold text-sm transition-opacity disabled:opacity-40"
            style={{ background: 'var(--brand)', color: 'var(--bg-void)' }}
          >
            {submitting ? 'Submitting…' : `Submit Score — ${total} / 100`}
          </button>
        </div>
      </DialogContent>
    </Dialog>
  )
}

// ─── Project card ─────────────────────────────────────────────────────────────
function ProjectCardItem({
  project,
  onScore,
  scored,
}: {
  project: ProjectCard
  onScore: (p: ProjectCard) => void
  scored?: boolean
}) {
  return (
    <div
      className="rounded-xl p-4 border space-y-3"
      style={{ background: 'var(--bg-card)', borderColor: 'var(--border-faint)' }}
    >
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0 flex-1">
          <h3 className="font-semibold truncate" style={{ color: 'var(--text-1)' }}>{project.title}</h3>
          <p className="text-xs mt-0.5" style={{ color: 'var(--text-3)' }}>
            {project.studentName} · Grade {project.grade}
            {project.city && ` · ${project.city}`}
          </p>
        </div>
        <span
          className="text-xs px-2 py-1 rounded-full shrink-0"
          style={{
            background: 'var(--bg-float)',
            color:      DOMAIN_COLORS[project.domain] ?? 'var(--text-3)',
          }}
        >
          {project.domain.replace('_', ' ')}
        </span>
      </div>

      <p className="text-sm line-clamp-2" style={{ color: 'var(--text-3)' }}>
        {project.problemStatement}
      </p>

      <div className="flex items-center justify-between">
        <p className="text-xs font-mono" style={{ color: 'var(--text-4)' }}>
          Submitted {project.submittedAt
            ? new Date(project.submittedAt).toLocaleDateString('en-IN', { day: '2-digit', month: 'short' })
            : '—'}
        </p>
        {!scored && (
          <button
            onClick={() => onScore(project)}
            className="text-xs px-4 min-h-[36px] rounded-lg font-medium transition-opacity active:scale-95"
            style={{ background: 'var(--brand)', color: 'var(--bg-void)' }}
          >
            Score This Project
          </button>
        )}
      </div>
    </div>
  )
}

// ─── Main client component ────────────────────────────────────────────────────
interface Props {
  queue:         ProjectCard[]
  scored:        ScoredProject[]
  leaderboard:   LeaderboardEntry[]
  judgeClerkId:  string
}

export function JudgingClient({ queue: initialQueue, scored: initialScored, leaderboard, judgeClerkId }: Props) {
  const [tab, setTab] = useState<'queue' | 'scored' | 'leaderboard'>('queue')
  const [scoringProject, setScoringProject] = useState<ProjectCard | null>(null)
  const [queue, setQueue] = useState(initialQueue)
  const [scored, setScored] = useState(initialScored)

  function handleScored(projectId: string) {
    const project = queue.find(p => p.id === projectId)
    if (project) {
      setQueue(prev => prev.filter(p => p.id !== projectId))
      // Add to scored list with placeholder score (will refresh on next page load)
    }
  }

  const TAB_STYLE = (active: boolean) => ({
    color:        active ? 'var(--text-brand)' : 'var(--text-3)',
    borderBottom: active ? '2px solid var(--brand)' : '2px solid transparent',
    background:   'transparent',
  })

  return (
    <div className="space-y-5">
      {/* Tabs */}
      <div className="flex gap-0 border-b" style={{ borderColor: 'var(--border-faint)' }}>
        {([
          { key: 'queue',       label: `Queue (${queue.length})` },
          { key: 'scored',      label: `Scored (${scored.length})` },
          { key: 'leaderboard', label: 'Leaderboard' },
        ] as const).map(t => (
          <button
            key={t.key}
            onClick={() => setTab(t.key)}
            className="px-4 py-3 text-sm font-medium transition-colors duration-150 whitespace-nowrap"
            style={TAB_STYLE(tab === t.key)}
          >
            {t.label}
          </button>
        ))}
      </div>

      {/* Queue tab */}
      {tab === 'queue' && (
        <div className="space-y-3">
          {queue.length === 0 ? (
            <div className="py-16 text-center">
              <p className="text-3xl">✅</p>
              <p className="text-sm mt-2" style={{ color: 'var(--text-3)' }}>
                All projects in the queue have been scored!
              </p>
            </div>
          ) : (
            queue.map(p => (
              <ProjectCardItem key={p.id} project={p} onScore={setScoringProject} />
            ))
          )}
        </div>
      )}

      {/* Scored tab */}
      {tab === 'scored' && (
        <div className="space-y-3">
          {scored.length === 0 ? (
            <p className="py-12 text-center text-sm" style={{ color: 'var(--text-4)' }}>
              No projects scored yet.
            </p>
          ) : (
            scored.map(p => (
              <div
                key={p.id}
                className="rounded-xl p-4 border space-y-3"
                style={{ background: 'var(--bg-card)', borderColor: 'var(--border-faint)' }}
              >
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <h3 className="font-semibold" style={{ color: 'var(--text-1)' }}>{p.title}</h3>
                    <p className="text-xs mt-0.5" style={{ color: 'var(--text-3)' }}>
                      {p.studentName} · Grade {p.grade}
                    </p>
                  </div>
                  <div className="text-right shrink-0">
                    <p className="font-display text-2xl" style={{ color: 'var(--text-brand)' }}>
                      {p.myScore.totalScore ?? '—'}
                    </p>
                    <p className="text-xs" style={{ color: 'var(--text-4)' }}>/ 100</p>
                  </div>
                </div>
                {/* Score breakdown */}
                <div className="grid grid-cols-5 gap-2 text-xs text-center">
                  {[
                    { label: 'Innovation', value: p.myScore.innovation, max: 25 },
                    { label: 'Impact',     value: p.myScore.impact,     max: 25 },
                    { label: 'Technical',  value: p.myScore.technical,  max: 25 },
                    { label: 'Presn.',     value: p.myScore.presentation, max: 15 },
                    { label: 'Complete',   value: p.myScore.completeness, max: 10 },
                  ].map(c => (
                    <div key={c.label}
                      className="rounded-lg py-2"
                      style={{ background: 'var(--bg-float)' }}
                    >
                      <p className="font-display text-base" style={{ color: 'var(--text-brand)' }}>
                        {c.value ?? 0}
                      </p>
                      <p style={{ color: 'var(--text-4)' }}>{c.label}</p>
                    </div>
                  ))}
                </div>
                {p.myScore.feedback && (
                  <p className="text-xs italic" style={{ color: 'var(--text-3)' }}>
                    "{p.myScore.feedback}"
                  </p>
                )}
              </div>
            ))
          )}
        </div>
      )}

      {/* Leaderboard tab */}
      {tab === 'leaderboard' && (
        <div className="rounded-xl border overflow-hidden" style={{ borderColor: 'var(--border-faint)' }}>
          {leaderboard.length === 0 ? (
            <p className="py-12 text-center text-sm" style={{ color: 'var(--text-4)' }}>
              No scores submitted yet.
            </p>
          ) : (
            <table className="w-full text-sm border-collapse">
              <thead>
                <tr style={{ background: 'var(--bg-raised)' }}>
                  {['Rank', 'Project', 'Domain', 'Student', 'Avg Score', 'Judges'].map(h => (
                    <th
                      key={h}
                      className="px-4 py-3 text-left text-xs uppercase tracking-wider font-medium whitespace-nowrap"
                      style={{ color: 'var(--text-3)', borderBottom: '1px solid var(--border-faint)' }}
                    >
                      {h}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {leaderboard.map((entry, i) => (
                  <tr
                    key={entry.projectId}
                    style={{ borderBottom: '1px solid var(--border-faint)' }}
                  >
                    <td className="px-4 py-3">
                      <span
                        className="font-display text-lg"
                        style={{ color: i < 3 ? 'var(--text-brand)' : 'var(--text-4)' }}
                      >
                        {i + 1}
                      </span>
                    </td>
                    <td className="px-4 py-3 font-medium" style={{ color: 'var(--text-1)' }}>
                      {entry.projectTitle}
                    </td>
                    <td className="px-4 py-3">
                      <span
                        className="text-xs px-2 py-0.5 rounded-full"
                        style={{
                          background: 'var(--bg-float)',
                          color:      DOMAIN_COLORS[entry.domain] ?? 'var(--text-3)',
                        }}
                      >
                        {entry.domain.replace('_', ' ')}
                      </span>
                    </td>
                    <td className="px-4 py-3" style={{ color: 'var(--text-2)' }}>{entry.studentName}</td>
                    <td className="px-4 py-3">
                      <span className="font-display text-xl" style={{ color: 'var(--text-brand)' }}>
                        {entry.avgScore}
                      </span>
                    </td>
                    <td className="px-4 py-3 font-mono text-xs" style={{ color: 'var(--text-4)' }}>
                      {entry.judgeCount}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      )}

      {/* Scoring dialog */}
      {scoringProject && (
        <ScoringDialog
          project={scoringProject}
          judgeClerkId={judgeClerkId}
          onClose={() => setScoringProject(null)}
          onScored={handleScored}
        />
      )}
    </div>
  )
}
