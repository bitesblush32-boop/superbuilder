import { db } from '@/lib/db'
import { parents } from '@/lib/db/schema'
import { eq } from 'drizzle-orm'

export type Parent    = typeof parents.$inferSelect
export type NewParent = typeof parents.$inferInsert

export async function createParent(data: NewParent): Promise<Parent> {
  const [parent] = await db.insert(parents).values(data).returning()
  return parent
}

export async function getParentByStudentId(studentId: string): Promise<Parent | null> {
  const [parent] = await db
    .select()
    .from(parents)
    .where(eq(parents.studentId, studentId))
    .limit(1)
  return parent ?? null
}

// ─────────────────────────────────────────────────────────────────────────────
// upsertParent
// INSERT parent if none exists for student, otherwise UPDATE in-place.
// Called when the user submits the parent sub-step (Step 2) either fresh or as a re-edit.
// ─────────────────────────────────────────────────────────────────────────────

export async function upsertParent(data: NewParent): Promise<Parent> {
  const now       = new Date()
  const consentAt = data.consentGiven ? now : undefined

  // student_id has no unique constraint in the DB, so we cannot use onConflictDoUpdate.
  // Manually check for an existing row and update if found, otherwise insert.
  const existing = await getParentByStudentId(data.studentId)

  if (existing) {
    const [row] = await db
      .update(parents)
      .set({
        fullName:           data.fullName,
        email:              data.email,
        phone:              data.phone,
        relationship:       data.relationship,
        consentGiven:       data.consentGiven,
        consentAt:          data.consentGiven ? now : undefined,
        safetyAcknowledged: data.safetyAcknowledged,
        emergencyContact:   data.emergencyContact,
      })
      .where(eq(parents.studentId, data.studentId))
      .returning()
    return row
  }

  const [row] = await db
    .insert(parents)
    .values({ ...data, consentAt })
    .returning()
  return row
}
