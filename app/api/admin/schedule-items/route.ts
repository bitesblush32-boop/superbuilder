import { NextResponse } from 'next/server'
import { revalidatePath } from 'next/cache'
import { getAdminSessionFromHeaders } from '@/lib/auth/adminAuth'
import { getScheduleItems } from '@/lib/db/queries/config'
import { db } from '@/lib/db'
import { scheduleItems } from '@/lib/db/schema'

export async function GET(req: Request) {
  if (!getAdminSessionFromHeaders(req.headers)) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }
  const items = await getScheduleItems()
  return NextResponse.json(items)
}

export async function POST(req: Request) {
  if (!getAdminSessionFromHeaders(req.headers)) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }
  const body = await req.json()
  const [item] = await db.insert(scheduleItems).values({
    type:          body.type,
    title:         body.title,
    description:   body.description || null,
    url:           body.url || null,
    targetStage:   body.targetStage || null,
    targetSection: body.targetSection || null,
    scheduledAt:   body.scheduledAt ? new Date(body.scheduledAt) : null,
    durationMins:  body.durationMins ? Number(body.durationMins) : null,
    isVisible:     body.isVisible ?? true,
  }).returning()
  revalidatePath('/dashboard/workshops')
  return NextResponse.json(item)
}
