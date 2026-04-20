// Registration layout — stage progress bar header + gated shell
// Wraps all /register/* routes. Server component — reads student stage from DB.

import Link from 'next/link'
import Image from 'next/image'
import { auth } from '@clerk/nextjs/server'
import { db } from '@/lib/db'
import { students, quizAttempts, ideaSubmissions } from '@/lib/db/schema'
import { eq, and } from 'drizzle-orm'
import { StageProgressBar } from './_components/StageProgressBar'
import { Stage2SubProgress } from './_components/Stage2SubProgress'
import { Stage1SubProgress } from './_components/Stage1SubProgress'

export const dynamic = 'force-dynamic'

interface StageData {
  currentStage: number
  // Stage 2 sub-step completion — only populated when currentStage === 2
  orientationComplete: boolean
  hasDomain:           boolean
  hasPassedQuiz:       boolean
  hasIdea:             boolean
}

async function getStageData(): Promise<StageData> {
  try {
    const { userId } = await auth()
    if (!userId) return { currentStage: 1, orientationComplete: false, hasDomain: false, hasPassedQuiz: false, hasIdea: false }

    const [student] = await db
      .select()
      .from(students)
      .where(eq(students.clerkId, userId))
      .limit(1)

    if (!student) return { currentStage: 1, orientationComplete: false, hasDomain: false, hasPassedQuiz: false, hasIdea: false }

    const stageNum = parseInt(student.currentStage, 10)

    if (stageNum !== 2) {
      return { currentStage: stageNum, orientationComplete: false, hasDomain: false, hasPassedQuiz: false, hasIdea: false }
    }

    // Stage 2 — check sub-steps in parallel
    const [quizRow, ideaRow] = await Promise.all([
      db.select({ passed: quizAttempts.passed })
        .from(quizAttempts)
        .where(and(eq(quizAttempts.studentId, student.id), eq(quizAttempts.passed, true)))
        .limit(1),
      db.select({ id: ideaSubmissions.id })
        .from(ideaSubmissions)
        .where(eq(ideaSubmissions.studentId, student.id))
        .limit(1),
    ])

    return {
      currentStage:        2,
      orientationComplete: student.orientationComplete,
      hasDomain:           !!student.hackathonDomain,
      hasPassedQuiz:       quizRow.length > 0,
      hasIdea:             ideaRow.length > 0,
    }
  } catch {
    return { currentStage: 1, orientationComplete: false, hasDomain: false, hasPassedQuiz: false, hasIdea: false }
  }
}

export default async function RegisterLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const stageData = await getStageData()

  return (
    <div className="min-h-screen flex flex-col" style={{ background: 'var(--bg-void)' }}>
      {/* Top bar */}
      <header
        className="flex items-center justify-between px-4 sm:px-6 h-12 md:h-16 shrink-0 border-b"
        style={{ borderColor: 'var(--border-faint)' }}
      >
        <Link
          href="/"
          className="flex shrink-0 items-center gap-2 sm:gap-3 min-h-[44px] select-none"
          aria-label="Super Builders — home"
        >
          <Image
            src="/logo.png"
            alt="Super Builders"
            width={140}
            height={40}
            className="h-8 md:h-10 w-auto object-contain"
            priority
          />
          <span
            className="flex items-center font-heading font-extrabold text-[12px] md:text-[14px] tracking-[0.08em] uppercase leading-none whitespace-nowrap"
            style={{ color: 'var(--text-brand)' }}
          >
            x Super Builders
          </span>
        </Link>

        <Link
          href="/"
          className="flex items-center gap-1 text-xs font-body transition-colors min-h-[44px] px-2"
          style={{ color: 'var(--text-3)' }}
        >
          <svg width="12" height="12" viewBox="0 0 12 12" fill="none" aria-hidden="true">
            <path
              d="M10 6H2M2 6L5 3M2 6L5 9"
              stroke="currentColor"
              strokeWidth="1.5"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>
          Exit
        </Link>
      </header>

      {/* Stage progress bar */}
      <div
        className="shrink-0 border-b"
        style={{ borderColor: 'var(--border-faint)', background: 'var(--bg-base)' }}
      >
        <StageProgressBar
          currentStage={stageData.currentStage}
          orientationComplete={stageData.orientationComplete}
          hackathonDomain={stageData.hasDomain ? 'set' : null}
          quizPassed={stageData.hasPassedQuiz}
          ideaSubmitted={stageData.hasIdea}
        />
      </div>

      {/* Stage 1 sub-progress (Personal Info → Parents Info → Team Building) */}
      {stageData.currentStage === 1 && (
        <div
          className="shrink-0 border-b"
          style={{ borderColor: 'var(--border-faint)', background: 'var(--bg-inset)' }}
        >
          <Stage1SubProgress variant="bar" />
        </div>
      )}

      {/* Learn sub-progress (Domain → Quiz) — visible during stage 2 after orientation */}
      {stageData.currentStage === 2 && stageData.orientationComplete && (
        <div
          className="shrink-0 border-b"
          style={{ borderColor: 'var(--border-faint)', background: 'var(--bg-inset)' }}
        >
          <Stage2SubProgress
            orientationComplete={stageData.orientationComplete}
            hasDomain={stageData.hasDomain}
            hasPassedQuiz={stageData.hasPassedQuiz}
            hasIdea={stageData.hasIdea}
          />
        </div>
      )}

      {/* Team manage link — visible during stage 2 after orientation, not during team step */}
      {stageData.currentStage === 2 && stageData.orientationComplete && (
        <div
          className="shrink-0 flex items-center justify-between px-4 sm:px-6 py-2"
          style={{ background: 'var(--bg-raised)', borderBottom: '1px solid var(--border-faint)' }}
        >
          <p className="text-xs font-body" style={{ color: 'var(--text-4)' }}>
            Building with friends?
          </p>
          <Link
            href="/register/team"
            className="flex items-center gap-1.5 text-xs font-heading font-semibold px-3 rounded-lg transition-all active:scale-95"
            style={{
              minHeight: '32px',
              background: 'rgba(255,184,0,0.08)',
              border:     '1px solid rgba(255,184,0,0.25)',
              color:      'var(--text-brand)',
            }}
          >
            <span aria-hidden="true">👥</span>
            Team Settings
          </Link>
        </div>
      )}

      {/* Page content */}
      <main className="flex-1 mx-auto w-full max-w-xl px-4 py-8 sm:py-10">
        {children}
      </main>
    </div>
  )
}
