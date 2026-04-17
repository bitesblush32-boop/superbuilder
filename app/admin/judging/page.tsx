import { auth } from '@clerk/nextjs/server'
import {
  getProjectsQueue, getScoredProjects, getJudgingLeaderboard, clerkIdToUuid,
} from '@/lib/db/queries/admin'
import { JudgingClient } from '../_components/JudgingClient'

export const dynamic = 'force-dynamic'

export default async function AdminJudgingPage() {
  const { userId } = await auth()
  if (!userId) return null

  const judgeUuid = clerkIdToUuid(userId)

  const [queue, scored, leaderboard] = await Promise.all([
    getProjectsQueue(judgeUuid),
    getScoredProjects(judgeUuid),
    getJudgingLeaderboard(),
  ])

  return (
    <div className="p-4 md:p-6 space-y-5 max-w-5xl">
      <div>
        <h2 className="font-display text-2xl md:text-3xl tracking-wide" style={{ color: 'var(--text-1)' }}>
          JUDGING
        </h2>
        <p className="text-sm mt-1" style={{ color: 'var(--text-3)' }}>
          Score submitted projects · {queue.length} in queue · {scored.length} completed
        </p>
      </div>

      <JudgingClient
        queue={queue}
        scored={scored}
        leaderboard={leaderboard}
        judgeClerkId={userId}
      />
    </div>
  )
}
