import { NextResponse } from 'next/server'
import { revalidatePath } from 'next/cache'
import { eq } from 'drizzle-orm'
import { getAdminSessionFromHeaders } from '@/lib/auth/adminAuth'
import { db } from '@/lib/db'
import { scheduleItems } from '@/lib/db/schema'

export async function PUT(req: Request, { params }: { params: Promise<{ id: string }> }) {
  if (!getAdminSessionFromHeaders(req.headers)) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }
  const { id } = await params
  const body    = await req.json()
  const [item]  = await db.update(scheduleItems).set({
    type:          body.type,
    title:         body.title,
    description:   body.description || null,
    url:           body.url || null,
    targetStage:   body.targetStage || null,
    targetSection: body.targetSection || null,
    scheduledAt:   body.scheduledAt ? new Date(body.scheduledAt) : null,
    durationMins:  body.durationMins ? Number(body.durationMins) : null,
    isVisible:     body.isVisible ?? true,
    updatedAt:     new Date(),
  }).where(eq(scheduleItems.id, id)).returning()
  revalidatePath('/dashboard/workshops')
  return NextResponse.json(item)
}

export async function DELETE(req: Request, { params }: { params: Promise<{ id: string }> }) {
  if (!getAdminSessionFromHeaders(req.headers)) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }
  const { id } = await params
  await db.delete(scheduleItems).where(eq(scheduleItems.id, id))
  revalidatePath('/dashboard/workshops')
  return NextResponse.json({ ok: true })
}
