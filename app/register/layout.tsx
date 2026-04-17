// Registration layout — stage progress bar header + gated shell
// Wraps all /register/* routes. Server component — reads student stage from DB.

import Link from 'next/link'
import { auth } from '@clerk/nextjs/server'
import { db } from '@/lib/db'
import { students } from '@/lib/db/schema'
import { eq } from 'drizzle-orm'
import { StageProgressBar } from './_components/StageProgressBar'

export const dynamic = 'force-dynamic'

async function getCurrentStage(): Promise<number> {
  try {
    const { userId } = await auth()
    if (!userId) return 1

    const [student] = await db
      .select({ currentStage: students.currentStage })
      .from(students)
      .where(eq(students.clerkId, userId))

    if (!student) return 1
    return parseInt(student.currentStage, 10)
  } catch {
    return 1
  }
}

export default async function RegisterLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const currentStage = await getCurrentStage()

  return (
    <div className="min-h-screen flex flex-col" style={{ background: 'var(--bg-void)' }}>
      {/* Top bar */}
      <header
        className="flex items-center justify-between px-4 sm:px-6 h-12 shrink-0 border-b"
        style={{ borderColor: 'var(--border-faint)' }}
      >
        <Link
          href="/"
          className="flex items-center gap-1.5 group"
          aria-label="zer0.pro home"
        >
          <span
            className="font-display text-lg tracking-wider leading-none"
            style={{ color: 'var(--brand)' }}
          >
            zer0.pro
          </span>
        </Link>

        <Link
          href="/"
          className="flex items-center gap-1 text-xs font-body transition-colors min-h-[44px] px-2"
          style={{ color: 'var(--text-3)' }}
        >
          <svg
            width="12"
            height="12"
            viewBox="0 0 12 12"
            fill="none"
            aria-hidden="true"
          >
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
        <StageProgressBar currentStage={currentStage} />
      </div>

      {/* Page content */}
      <main className="flex-1 mx-auto w-full max-w-xl px-4 py-8 sm:py-10">
        {children}
      </main>
    </div>
  )
}
