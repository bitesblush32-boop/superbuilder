import { redirect }            from 'next/navigation'
import { eq }                   from 'drizzle-orm'
import { db }                   from '@/lib/db'
import { projects }             from '@/lib/db/schema'
import { getStudentOrRedirect } from '@/lib/auth/getStudentOrRedirect'
import { checkStageLock }       from '@/lib/auth/stageLock'
import { HACKATHON_START, HACKATHON_END } from '@/lib/content/programme'
import { LockedSection }        from '@/components/dashboard/LockedSection'
import { ProjectSubmitForm }    from './_components/ProjectSubmitForm'
import type { ProjectFormData } from '@/lib/actions/project'

export const dynamic = 'force-dynamic'

export const metadata = {
  title: 'Submit Project — Super Builders',
}

const DOMAIN_LABELS: Record<string, string> = {
  health:        '🏥 Health',
  education:     '📚 Education',
  finance:       '💰 Finance',
  environment:   '🌿 Environment',
  entertainment: '🎮 Entertainment',
  social_impact: '🤝 Social Impact',
  other:         '✨ Other',
}

export default async function SubmitPage() {
  const { isOpen } = await checkStageLock(3)
  if (!isOpen) redirect('/dashboard')

  const { student } = await getStudentOrRedirect(4)
  if (!student) redirect('/register')

  const now           = new Date()
  const isBeforeHack  = now < HACKATHON_START
  const isAfterHack   = now > HACKATHON_END

  // Fetch existing project if any
  const [existing] = await db
    .select()
    .from(projects)
    .where(eq(projects.studentId, student.id))
    .limit(1)

  const initialData: ProjectFormData | null = existing
    ? {
        title:            existing.title,
        problemStatement: existing.problemStatement,
        solutionDesc:     existing.solutionDesc,
        aiTools:          existing.aiTools ?? [],
        techStack:        existing.techStack ?? '',
        demoVideoUrl:     existing.demoVideoUrl ?? '',
        githubUrl:        existing.githubUrl ?? '',
        biggestChallenge: existing.biggestChallenge ?? '',
        nextSteps:        existing.nextSteps ?? '',
      }
    : null

  const domain = student.hackathonDomain ?? 'other'

  return (
    <div className="max-w-2xl mx-auto pb-8">
      {/* Page header */}
      <div className="px-4 pt-5 pb-2 md:px-6 md:pt-6">
        <p className="font-mono text-[11px] tracking-[0.2em] uppercase mb-1" style={{ color: 'var(--text-brand)' }}>
          Hackathon
        </p>
        <h1 className="font-display text-[2rem] md:text-[2.5rem] leading-none tracking-wide" style={{ color: 'var(--text-1)' }}>
          SUBMIT
        </h1>
      </div>

      <div className="px-4 md:px-6 space-y-4">

        {isBeforeHack ? (
          <>
            <LockedSection
              emoji="🚀"
              title="Submission Locked"
              reason="The hackathon hasn't started yet. The submission window opens Jun 7 at 8:00 AM IST and closes Jun 8 at 8:00 AM IST — 24 hours to ship."
              unlocksAt="Jun 7, 8:00 AM IST"
            />

            {/* What to prepare */}
            <div
              className="rounded-2xl border p-5 space-y-3"
              style={{ background: 'var(--bg-card)', borderColor: 'var(--border-faint)' }}
            >
              <p className="font-mono text-[10px] tracking-[0.2em] uppercase" style={{ color: 'var(--text-4)' }}>
                Prepare Now
              </p>
              <ul className="space-y-2">
                {[
                  'Finish Workshop 3 and have your prototype ready',
                  'Set up your GitHub repo (makes submission faster)',
                  'Plan your demo video — 2–3 minutes is the sweet spot',
                  'Know your problem statement cold — you\'ll need it',
                ].map(tip => (
                  <li key={tip} className="flex items-start gap-2">
                    <span style={{ color: 'var(--brand)', flexShrink: 0 }}>→</span>
                    <span className="font-body text-sm" style={{ color: 'var(--text-3)' }}>{tip}</span>
                  </li>
                ))}
              </ul>
            </div>
          </>
        ) : isAfterHack ? (
          <>
            <div
              className="rounded-2xl border p-5"
              style={{ background: 'var(--bg-card)', borderColor: 'var(--border-faint)' }}
            >
              <p className="font-mono text-[10px] tracking-[0.2em] uppercase mb-2" style={{ color: 'var(--text-4)' }}>
                Submission Closed
              </p>
              <p className="font-display text-2xl tracking-wide mb-2" style={{ color: 'var(--text-1)' }}>
                {existing ? 'SUBMITTED ✓' : 'WINDOW CLOSED'}
              </p>
              <p className="font-body text-sm" style={{ color: 'var(--text-3)' }}>
                {existing
                  ? 'Your project has been submitted. Results announced Jun 27 at Demo Day. Certificates go live Jul 1.'
                  : 'The 24-hour hackathon window has ended. See you next season!'}
              </p>
            </div>

            {existing && (
              <div
                className="rounded-2xl border p-5 space-y-3"
                style={{ background: 'var(--bg-card)', borderColor: 'var(--border-faint)' }}
              >
                <p className="font-mono text-[10px] tracking-[0.2em] uppercase" style={{ color: 'var(--text-4)' }}>
                  Your Submission
                </p>
                <h2 className="font-heading font-bold text-lg" style={{ color: 'var(--text-1)' }}>
                  {existing.title}
                </h2>
                <p className="font-mono text-[11px]" style={{ color: 'var(--text-brand)' }}>
                  {DOMAIN_LABELS[existing.domain] ?? existing.domain}
                </p>
                <p className="font-body text-sm leading-relaxed" style={{ color: 'var(--text-3)' }}>
                  {existing.problemStatement.slice(0, 160)}{existing.problemStatement.length > 160 ? '…' : ''}
                </p>
                {existing.demoVideoUrl && (
                  <a
                    href={existing.demoVideoUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-2 min-h-[44px] px-4 rounded-xl font-heading font-semibold text-sm border transition-all active:scale-95"
                    style={{ borderColor: 'var(--border-subtle)', color: 'var(--text-2)' }}
                  >
                    ▶ Watch Demo Video
                  </a>
                )}
                {existing.submittedAt && (
                  <p className="font-mono text-[11px]" style={{ color: 'var(--text-4)' }}>
                    Submitted {new Date(existing.submittedAt).toLocaleString('en-IN', {
                      dateStyle: 'medium', timeStyle: 'short',
                    })}
                  </p>
                )}
              </div>
            )}
          </>
        ) : (
          <>
            {/* Hackathon is live */}
            <div
              className="rounded-2xl border p-4 flex items-center gap-3"
              style={{ background: 'rgba(255,184,0,0.07)', borderColor: 'rgba(255,184,0,0.35)' }}
            >
              <span className="text-2xl animate-bounce">🔥</span>
              <div>
                <p className="font-heading font-bold text-sm" style={{ color: 'var(--text-brand)' }}>
                  HACKATHON IS LIVE
                </p>
                <p className="font-body text-sm" style={{ color: 'var(--text-3)' }}>
                  You have until Jun 8, 8:00 AM IST to submit. Build fast. Build bold.
                </p>
              </div>
            </div>

            {existing && (
              <div
                className="rounded-2xl border p-4 flex items-center gap-3"
                style={{ background: 'rgba(34,197,94,0.06)', borderColor: 'rgba(34,197,94,0.2)' }}
              >
                <span style={{ color: 'var(--green)' }}>✓</span>
                <p className="font-body text-sm" style={{ color: 'var(--text-3)' }}>
                  You have an existing submission. You can update it any time before the deadline.
                </p>
              </div>
            )}

            <ProjectSubmitForm domain={domain} initialData={initialData} />
          </>
        )}
      </div>
    </div>
  )
}
