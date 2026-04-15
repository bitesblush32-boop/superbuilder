import { db } from '@/lib/db'
import { students } from '@/lib/db/schema'
import { eq, sql } from 'drizzle-orm'
import type { BadgeId } from './badges'

// TODO: import { redis } from '@/lib/redis' — wire in once Upstash env vars are set

/**
 * Awards XP to a student.
 * Writes to PostgreSQL (persistent) and will write to Redis sorted set
 * (live leaderboard) once Upstash is configured.
 */
export async function awardXP(studentId: string, points: number): Promise<void> {
  await db
    .update(students)
    .set({ xpPoints: sql`xp_points + ${points}` })
    .where(eq(students.id, studentId))

  // TODO: uncomment once lib/redis/index.ts is wired up
  // await redis.zincrby('leaderboard', points, studentId)
}

/**
 * Appends a badge id to the student's jsonb badges array.
 * Called server-side after stage completion.
 */
export async function awardBadge(studentId: string, badgeId: BadgeId): Promise<void> {
  await db
    .update(students)
    .set({
      badges: sql`badges || ${JSON.stringify([badgeId])}::jsonb`,
    })
    .where(eq(students.id, studentId))
}

/**
 * Awards XP and badge together in a single DB round-trip where possible.
 * Use this at stage completion events.
 */
export async function awardXPAndBadge(
  studentId: string,
  points: number,
  badgeId: BadgeId,
): Promise<void> {
  await Promise.all([
    awardXP(studentId, points),
    awardBadge(studentId, badgeId),
  ])
}
