// Backfills the Redis leaderboard sorted set from PostgreSQL.
// Call this:
//   - On app startup (from instrumentation.ts or a startup route)
//   - After a Redis flush / Upstash eviction
//   - Via: npx tsx lib/redis/seedLeaderboard.ts

import { db } from '@/lib/db'
import { students } from '@/lib/db/schema'
import { redis } from '@/lib/redis'
import { gt } from 'drizzle-orm'

export async function seedLeaderboard(): Promise<number> {
  // Check if leaderboard already has entries — skip if populated
  const existingCount = await redis.zcard('leaderboard')
  if (existingCount > 0) return existingCount

  // Fetch all students with XP > 0
  const rows = await db
    .select({ id: students.id, xpPoints: students.xpPoints })
    .from(students)
    .where(gt(students.xpPoints, 0))

  if (rows.length === 0) return 0

  // Batch ZADD — Upstash supports multi-member zadd
  for (const r of rows) {
    await redis.zadd('leaderboard', { score: r.xpPoints, member: r.id })
  }

  console.log(`[redis] Seeded leaderboard with ${rows.length} students`)
  return rows.length
}

// Allow direct execution: npx tsx lib/redis/seedLeaderboard.ts
if (require.main === module) {
  seedLeaderboard()
    .then(n => { console.log(`Seeded ${n} entries`); process.exit(0) })
    .catch(e => { console.error(e); process.exit(1) })
}
