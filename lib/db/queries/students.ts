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

// ─────────────────────────────────────────────────────────────────────────────
// upsertStudentPersonalInfo
// INSERT or UPDATE personal info on conflict with clerk_id (unique).
// Never touches currentStage, badges, or xpPoints — safe to call on re-entry.
// ─────────────────────────────────────────────────────────────────────────────

export interface PersonalInfoPayload {
  fullName:         string
  dateOfBirth?:     Date | null
  gender?:          string | null
  grade:            '8' | '9' | '10' | '11' | '12'
  schoolName?:      string | null
  city?:            string | null
  state?:           string | null
  phone?:           string | null
  codingExp?:       string | null
  interests?:       string[] | null
  availabilityHrs?: string | null
  deviceAccess?:    string | null
  tshirtSize?:      string | null
  instagramHandle?: string | null
  linkedinHandle?:  string | null
  referredBy?:      string | null
  whyJoin?:         string | null
  whatToBuild?:     string | null
}

export async function upsertStudentPersonalInfo(
  clerkId:      string,
  email:        string,
  referralCode: string,
  payload:      PersonalInfoPayload,
): Promise<Student> {
  const now = new Date()

  const [row] = await db
    .insert(students)
    .values({
      clerkId,
      email,
      referralCode,
      fullName:        payload.fullName,
      dateOfBirth:     payload.dateOfBirth ?? null,
      gender:          payload.gender ?? null,
      grade:           payload.grade,
      schoolName:      payload.schoolName ?? null,
      city:            payload.city ?? null,
      state:           payload.state ?? null,
      phone:           payload.phone ?? null,
      codingExp:       payload.codingExp ?? null,
      interests:       payload.interests ?? [],
      availabilityHrs: payload.availabilityHrs ?? null,
      deviceAccess:    payload.deviceAccess ?? null,
      tshirtSize:      payload.tshirtSize ?? null,
      instagramHandle: payload.instagramHandle ?? null,
      linkedinHandle:  payload.linkedinHandle ?? null,
      referredBy:      payload.referredBy ?? null,
      currentStage:    '1',
      createdAt:       now,
      updatedAt:       now,
    })
    .onConflictDoUpdate({
      target: students.clerkId,
      set: {
        fullName:        payload.fullName,
        dateOfBirth:     payload.dateOfBirth ?? null,
        gender:          payload.gender ?? null,
        grade:           payload.grade,
        schoolName:      payload.schoolName ?? null,
        city:            payload.city ?? null,
        state:           payload.state ?? null,
        phone:           payload.phone ?? null,
        codingExp:       payload.codingExp ?? null,
        interests:       payload.interests ?? [],
        availabilityHrs: payload.availabilityHrs ?? null,
        deviceAccess:    payload.deviceAccess ?? null,
        tshirtSize:      payload.tshirtSize ?? null,
        instagramHandle: payload.instagramHandle ?? null,
        linkedinHandle:  payload.linkedinHandle ?? null,
        // referredBy intentionally NOT updated — only set on first insert
        updatedAt:       now,
      },
    })
    .returning()

  return row
}
