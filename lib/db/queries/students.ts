import { db } from '@/lib/db'
import { students } from '@/lib/db/schema'
import { eq, sql } from 'drizzle-orm'

export type Student    = typeof students.$inferSelect
export type NewStudent = typeof students.$inferInsert

// 8-character uppercase alphanumeric code — e.g. "A3BX72QK"
export function generateReferralCode(): string {
  const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789' // no ambiguous I/1/O/0
  let code = ''
  for (let i = 0; i < 8; i++) {
    code += chars[Math.floor(Math.random() * chars.length)]
  }
  return code
}

export async function getStudentByClerkId(clerkId: string): Promise<Student | null> {
  const [student] = await db
    .select()
    .from(students)
    .where(eq(students.clerkId, clerkId))
    .limit(1)
  return student ?? null
}

export async function createStudent(data: NewStudent): Promise<Student> {
  const [student] = await db.insert(students).values(data).returning()
  return student
}

export async function updateStudentStage(
  studentId: string,
  stage: '1' | '2' | '3' | '4' | '5',
): Promise<void> {
  await db
    .update(students)
    .set({ currentStage: stage, updatedAt: new Date() })
    .where(eq(students.id, studentId))
}

export async function updateStudentTier(
  studentId: string,
  tier: 'pro' | 'premium',
): Promise<void> {
  await db
    .update(students)
    .set({ tier, updatedAt: new Date() })
    .where(eq(students.id, studentId))
}

export interface EngageAnswers {
  goal:       string
  confidence: number
  winBoast:   string
}

export async function updateStudentEngageAnswers(
  studentId:     string,
  engageAnswers: EngageAnswers,
): Promise<void> {
  await db
    .update(students)
    .set({ engageAnswers: engageAnswers as unknown as Record<string, unknown>, updatedAt: new Date() })
    .where(eq(students.id, studentId))
}

// Atomically appends a badge id to the jsonb array and increments xp_points
export async function addBadgeToStudent(
  studentId: string,
  badgeId: string,
  xp: number,
): Promise<void> {
  await db
    .update(students)
    .set({
      xpPoints: sql`xp_points + ${xp}`,
      badges:   sql`badges || ${JSON.stringify([badgeId])}::jsonb`,
      updatedAt: new Date(),
    })
    .where(eq(students.id, studentId))
}
