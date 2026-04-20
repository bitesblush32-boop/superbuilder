import { db } from '@/lib/db'
import { teams, students, appSettings } from '@/lib/db/schema'
import { eq, inArray } from 'drizzle-orm'
import { sql } from 'drizzle-orm'

// Generate a team code like "SB-X7K2" — "SB-" prefix + 4 alphanumeric chars
export function generateTeamCode(): string {
  const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789'
  const suffix = Array.from({ length: 4 }, () =>
    chars[Math.floor(Math.random() * chars.length)]
  ).join('')
  return `SB-${suffix}`
}

export async function createTeam(leaderId: string, teamName: string) {
  const code = generateTeamCode()
  const [team] = await db.insert(teams).values({
    name:        teamName.trim(),
    code,
    leaderId,
    maxSize:     3,
    memberCount: 1,
  }).returning()

  await db.update(students)
    .set({ teamId: team.id, teamRole: 'leader' })
    .where(eq(students.id, leaderId))

  return team
}

export async function joinTeam(studentId: string, code: string): Promise<{
  success: boolean
  error?:  string
  team?:   typeof teams.$inferSelect
}> {
  const normalizedCode = code.trim().toUpperCase()

  const [team] = await db.select().from(teams).where(eq(teams.code, normalizedCode)).limit(1)
  if (!team)          return { success: false, error: 'Team code not found. Check the code and try again.' }
  if (team.isLocked)  return { success: false, error: 'This team is locked and no longer accepting members.' }
  if (team.memberCount >= team.maxSize) return { success: false, error: `This team is full (${team.maxSize} members max).` }

  const [student] = await db.select({ teamId: students.teamId }).from(students).where(eq(students.id, studentId)).limit(1)
  if (student?.teamId) return { success: false, error: 'You are already in a team. You cannot join another.' }

  await db.transaction(async (tx) => {
    await tx.update(students)
      .set({ teamId: team.id, teamRole: 'member' })
      .where(eq(students.id, studentId))
    await tx.update(teams)
      .set({ memberCount: team.memberCount + 1, updatedAt: new Date() })
      .where(eq(teams.id, team.id))
  })

  return { success: true, team }
}

export async function getTeamWithMembers(teamId: string) {
  const [team] = await db.select().from(teams).where(eq(teams.id, teamId)).limit(1)
  if (!team) return null

  const members = await db.select({
    id:       students.id,
    fullName: students.fullName,
    grade:    students.grade,
    city:     students.city,
    teamRole: students.teamRole,
    isPaid:   students.isPaid,
    tier:     students.tier,
  }).from(students).where(eq(students.teamId, teamId))

  return { ...team, members }
}

export async function leaveTeam(studentId: string): Promise<{ success: boolean; error?: string }> {
  const [student] = await db
    .select({ teamId: students.teamId, teamRole: students.teamRole })
    .from(students)
    .where(eq(students.id, studentId))
    .limit(1)

  if (!student?.teamId) return { success: false, error: 'You are not in a team.' }

  const [team] = await db.select().from(teams).where(eq(teams.id, student.teamId)).limit(1)
  if (!team) return { success: false, error: 'Team not found.' }
  if (team.isLocked) return { success: false, error: 'Team is locked — registration deadline has passed.' }

  if (student.teamRole === 'leader' && team.memberCount > 1) {
    // Leader leaving with members present — dissolve the whole team
    await db.transaction(async (tx) => {
      await tx.update(students)
        .set({ teamId: null, teamRole: null })
        .where(eq(students.teamId, team.id))
      await tx.delete(teams).where(eq(teams.id, team.id))
    })
    return { success: true }
  }

  // Solo leader or regular member — just detach and decrement
  await db.transaction(async (tx) => {
    await tx.update(students)
      .set({ teamId: null, teamRole: null })
      .where(eq(students.id, studentId))
    await tx.update(teams)
      .set({ memberCount: sql`${teams.memberCount} - 1`, updatedAt: new Date() })
      .where(eq(teams.id, team.id))
  })

  return { success: true }
}

export async function getFlatPricing(): Promise<{ priceSolo: number; priceTeam: number }> {
  const all = await db.select().from(appSettings)
  const get = (key: string, fallback: number) =>
    parseInt(all.find(r => r.key === key)?.value ?? String(fallback), 10)
  return {
    priceSolo: get('price_solo', 3499),
    priceTeam: get('price_team', 2999),
  }
}

export async function getAppSetting(key: string): Promise<string | null> {
  const [row] = await db.select({ value: appSettings.value }).from(appSettings).where(eq(appSettings.key, key)).limit(1)
  return row?.value ?? null
}

export async function updateAppSetting(key: string, value: string): Promise<void> {
  await db.update(appSettings).set({ value, updatedAt: new Date() }).where(eq(appSettings.key, key))
}

export async function getAllSettings(): Promise<typeof appSettings.$inferSelect[]> {
  return db.select().from(appSettings)
}

// Returns which stages are currently open globally (admin-controlled)
export async function getOpenStages(): Promise<Record<number, boolean>> {
  const rows = await db.select().from(appSettings)
    .where(inArray(appSettings.key, [
      'stage_1_open','stage_2_open','stage_3_open','stage_4_open','stage_5_open'
    ]))

  const result: Record<number, boolean> = { 1: false, 2: false, 3: false, 4: false, 5: false }
  for (const row of rows) {
    const num = parseInt(row.key.replace('stage_', '').replace('_open', ''), 10)
    result[num] = row.value === 'true'
  }
  return result
}

export async function isStageOpen(stageNum: number): Promise<boolean> {
  const row = await getAppSetting(`stage_${stageNum}_open`)
  return row === 'true'
}
