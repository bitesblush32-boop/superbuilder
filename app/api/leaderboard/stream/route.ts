// GET /api/leaderboard/stream
// Server-Sent Events — streams top-50 leaderboard from Upstash Redis sorted set

import { redis } from '@/lib/redis'
import { db } from '@/lib/db'
import { students } from '@/lib/db/schema'
import { inArray } from 'drizzle-orm'
import { seedLeaderboard } from '@/lib/redis/seedLeaderboard'

export const dynamic = 'force-dynamic'
export const runtime = 'nodejs'

interface LeaderboardEntry {
  rank: number
  studentId: string
  name: string
  city: string | null
  xp: number
}

async function getTop50(): Promise<LeaderboardEntry[]> {
  // Redis sorted set: zrange with scores, descending
  const raw = await redis.zrange('leaderboard', 0, 49, { rev: true, withScores: true })

  if (!raw || raw.length === 0) return []

  // raw is [member, score, member, score, ...] OR [{member, score}, ...]
  // @upstash/redis returns [{member, score}] with withScores
  const pairs = raw as { member: string; score: number }[]
  const ids = pairs.map((p) => p.member)

  if (ids.length === 0) return []

  const rows = await db
    .select({ id: students.id, fullName: students.fullName, city: students.city })
    .from(students)
    .where(inArray(students.id, ids))

  const nameMap = new Map(rows.map((r) => [r.id, { name: r.fullName, city: r.city }]))

  return pairs.map((p, i) => ({
    rank: i + 1,
    studentId: p.member,
    name: nameMap.get(p.member)?.name ?? 'Builder',
    city: nameMap.get(p.member)?.city ?? null,
    xp: p.score,
  }))
}

export async function GET(req: Request) {
  const encoder = new TextEncoder()

  const stream = new ReadableStream({
    async start(controller) {
      const send = (data: object) => {
        try {
          controller.enqueue(encoder.encode(`data: ${JSON.stringify(data)}\n\n`))
        } catch {
          // client disconnected
        }
      }

      // Auto-recover if Redis leaderboard was flushed / evicted
      await seedLeaderboard()

      // Initial snapshot
      try {
        const top50 = await getTop50()
        send({ type: 'init', data: top50 })
      } catch (err) {
        send({ type: 'error', message: 'Failed to load leaderboard' })
      }

      // Poll every 10 seconds
      const interval = setInterval(async () => {
        try {
          const top50 = await getTop50()
          send({ type: 'update', data: top50 })
        } catch {
          // silently skip failed polls
        }
      }, 10_000)

      req.signal.addEventListener('abort', () => {
        clearInterval(interval)
        try { controller.close() } catch { /* already closed */ }
      })
    },
  })

  return new Response(stream, {
    headers: {
      'Content-Type':  'text/event-stream',
      'Cache-Control': 'no-cache',
      'Connection':    'keep-alive',
    },
  })
}
