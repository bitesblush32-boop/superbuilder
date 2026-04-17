import { NextResponse } from 'next/server'
import { revalidatePath } from 'next/cache'
import { getAdminSessionFromHeaders } from '@/lib/auth/adminAuth'
import { getDatesConfig, getPricingConfig, upsertDatesConfig, upsertPricingConfig } from '@/lib/db/queries/config'

export async function GET(req: Request) {
  if (!getAdminSessionFromHeaders(req.headers)) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }
  const [dates, pricing] = await Promise.all([getDatesConfig(), getPricingConfig()])
  return NextResponse.json({ dates, pricing })
}

export async function PUT(req: Request) {
  if (!getAdminSessionFromHeaders(req.headers)) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }
  const { section, data } = await req.json()
  if (section === 'dates')   await upsertDatesConfig(data)
  if (section === 'pricing') await upsertPricingConfig(data)
  revalidatePath('/')
  revalidatePath('/register/stage-2/orientation')
  revalidatePath('/register/stage-3/select')
  return NextResponse.json({ ok: true })
}
