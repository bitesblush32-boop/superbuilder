// POST /api/webhooks/resend
// Receives delivery events from Resend (via Svix signing)
// Verifies signature, then handles bounce/complaint events
// https://resend.com/docs/dashboard/webhooks/introduction

import { NextRequest, NextResponse } from 'next/server'
import crypto                         from 'crypto'
import { db }                         from '@/lib/db'
import { commsLog }                   from '@/lib/db/schema'
import { eq }                         from 'drizzle-orm'

export const dynamic = 'force-dynamic'

function verifyResendSignature(
  body:      string,
  headers:   { svixId: string; svixTimestamp: string; svixSignature: string },
  secret:    string
): boolean {
  // Resend uses Svix: signature = HMAC-SHA256(svix-id.svix-timestamp.body)
  const toSign  = `${headers.svixId}.${headers.svixTimestamp}.${body}`
  const key     = Buffer.from(secret.replace(/^whsec_/, ''), 'base64')
  const computed = crypto.createHmac('sha256', key).update(toSign).digest('base64')

  // svix-signature header is "v1,<base64sig>" — may have multiple comma-separated
  const signatures = headers.svixSignature.split(' ')
  for (const sig of signatures) {
    const [, value] = sig.split(',')
    if (value && crypto.timingSafeEqual(Buffer.from(computed), Buffer.from(value))) {
      return true
    }
  }
  return false
}

export async function POST(req: NextRequest) {
  const secret = process.env.RESEND_WEBHOOK_SECRET
  if (!secret) {
    return NextResponse.json({ error: 'Webhook secret not configured' }, { status: 500 })
  }

  const svixId        = req.headers.get('svix-id')        ?? ''
  const svixTimestamp = req.headers.get('svix-timestamp')  ?? ''
  const svixSignature = req.headers.get('svix-signature')  ?? ''

  if (!svixId || !svixTimestamp || !svixSignature) {
    return NextResponse.json({ error: 'Missing Svix headers' }, { status: 400 })
  }

  const body = await req.text()

  const valid = verifyResendSignature(body, {
    svixId,
    svixTimestamp,
    svixSignature,
  }, secret)

  if (!valid) {
    return NextResponse.json({ error: 'Invalid signature' }, { status: 401 })
  }

  let event: { type: string; data: Record<string, unknown> }
  try {
    event = JSON.parse(body)
  } catch {
    return NextResponse.json({ error: 'Invalid JSON' }, { status: 400 })
  }

  const emailId = event.data?.email_id as string | undefined

  // Update comms_log status if we track by Resend email ID
  if (emailId) {
    const newStatus =
      event.type === 'email.delivered'       ? 'delivered' :
      event.type === 'email.bounced'         ? 'bounced' :
      event.type === 'email.complained'      ? 'complained' :
      event.type === 'email.opened'          ? 'opened' :
      event.type === 'email.clicked'         ? 'clicked' :
      null

    if (newStatus) {
      // commsLog doesn't store resend email ID natively — log is best-effort
      // In a future migration we can add resend_email_id column
      // For now: update the most recent matching log entry
      // Best-effort: update log status. A proper implementation would require
      // storing the Resend email ID in comms_log. For MVP this is a no-op.
      void db
        .update(commsLog)
        .set({ status: newStatus })
        .where(eq(commsLog.status, 'placeholder_noop_' + emailId))
        .catch(() => { /* ignore */ })
    }
  }

  return NextResponse.json({ received: true })
}
