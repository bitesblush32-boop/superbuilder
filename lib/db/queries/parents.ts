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
