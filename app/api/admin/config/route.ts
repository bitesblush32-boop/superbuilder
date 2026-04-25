import { NextResponse } from 'next/server'
import { revalidatePath } from 'next/cache'
import { getAdminSessionFromHeaders } from '@/lib/auth/adminAuth'
import { getDatesConfig, upsertDatesConfig } from '@/lib/db/queries/config'

export async function GET(req: Request) {
  if (!getAdminSessionFromHeaders(req.headers)) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }
  const dates = await getDatesConfig()
  return NextResponse.json({ dates })
}

export async function PUT(req: Request) {
  if (!getAdminSessionFromHeaders(req.headers)) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }
  const { section, data } = await req.json()
  if (section === 'dates') await upsertDatesConfig(data)
  revalidatePath('/')
  return NextResponse.json({ ok: true })
}
