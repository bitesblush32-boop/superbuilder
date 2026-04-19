import { auth } from '@clerk/nextjs/server'
import { Resend } from 'resend'
import { redis } from '@/lib/redis'
import { sendWhatsApp } from '@/lib/whatsapp'
import { getStudentsForTrigger, insertCommsLog } from '@/lib/db/queries/admin'
import { z } from 'zod'

// ─── Validation ───────────────────────────────────────────────────────────────
const BodySchema = z.object({
  triggerType: z.string(),
  segment: z.string().optional(),
  message: z.string().max(1000).optional(),  // for bulk
  channel: z.enum(['email', 'whatsapp', 'both']).default('both'),
})

// ─── Template map ─────────────────────────────────────────────────────────────
const APP_URL = process.env.NEXT_PUBLIC_APP_URL ?? 'https://superbuilder.org'

function getWhatsAppTemplate(triggerType: string): string {
  const MAP: Record<string, string> = {
    stage1_incomplete: 'sb_stage1_incomplete',
    quiz_not_started: 'sb_quiz_not_started',
    not_paid_d1: 'sb_not_paid_d1',
    not_paid_d2: 'sb_not_paid_d2',
    not_paid_d3: 'sb_not_paid_d3',
    not_paid_d4: 'sb_not_paid_d1',  // reuse d1 template for d4 (manual call variant)
    not_paid_d5: 'sb_not_paid_d5',
    not_paid_final: 'sb_not_paid_final',
    bulk: 'sb_bulk_announcement',
  }
  return MAP[triggerType] ?? 'sb_bulk_announcement'
}

function getWhatsAppVars(
  triggerType: string,
  firstName: string,
  city?: string | null,
  customMsg?: string,
): string[] {
  const link = `${APP_URL}/register`
  switch (triggerType) {
    case 'stage1_incomplete': return [firstName, link]
    case 'quiz_not_started': return [firstName, link]
    case 'not_paid_d1': return [firstName, link]
    case 'not_paid_d2': return [firstName, city ?? 'your city', link]
    case 'not_paid_d3': return [firstName, link]
    case 'not_paid_d4': return [firstName, link]
    case 'not_paid_d5': return [firstName, link]
    case 'not_paid_final': return [firstName, link]
    case 'bulk': return [firstName, customMsg ?? '']
    default: return [firstName]
  }
}

function getEmailSubject(triggerType: string, firstName: string): string {
  const MAP: Record<string, string> = {
    stage1_incomplete: `${firstName}, your application is waiting 🚀`,
    quiz_not_started: `${firstName}, your AI quiz is ready — take it now 🧠`,
    not_paid_d1: `${firstName}, you're shortlisted! Lock in your spot ⚡`,
    not_paid_d2: `Spots filling up, ${firstName} — grab yours now 🔥`,
    not_paid_d3: `What other builders are saying, ${firstName} 👀`,
    not_paid_d4: `${firstName}, a quick note from our team`,
    not_paid_d5: `⚡ 48 hours left, ${firstName} — your spot expires soon`,
    not_paid_final: `🚨 Last chance ${firstName} — May 25 deadline`,
    bulk: `Message from Super Builders`,
  }
  return MAP[triggerType] ?? `Message from Super Builders, ${firstName}`
}

function getEmailBody(triggerType: string, firstName: string, customMsg?: string): string {
  const link = `${APP_URL}/register`
  const lines: Record<string, string> = {
    stage1_incomplete: `You started your Super Builders application but didn't finish. <a href="${link}">Complete it now</a> before spots fill up.`,
    quiz_not_started: `Your AI quiz is ready and waiting. <a href="${link}">Take it now</a> — score 6+ to unlock your spot.`,
    not_paid_d1: `You're shortlisted for Super Builders! 🎉 <a href="${link}">Lock in your spot</a> before someone else takes it.`,
    not_paid_d2: `Spots are filling up fast in your city. <a href="${link}">Secure yours now</a> — don't miss out.`,
    not_paid_d3: `Hundreds of students have already committed. <a href="${link}">Join them</a> and build something amazing.`,
    not_paid_d4: `We noticed you haven't confirmed your spot yet. Our team is here to help — reply to this email with any questions.`,
    not_paid_d5: `Your Super Builders spot expires in 48 hours. <a href="${link}">Confirm now</a> — registration closes May 25.`,
    not_paid_final: `🚨 Last call — registration closes May 25. <a href="${link}">Claim your spot</a> before it's gone.`,
    bulk: customMsg ?? '',
  }
  const body = lines[triggerType] ?? customMsg ?? ''
  return `<!DOCTYPE html><html><body style="background:#0A0A0A;color:#C0C0C0;font-family:sans-serif;padding:40px 16px;max-width:560px;margin:0 auto">
<h2 style="color:#FFB800;margin:0 0 16px;font-family:Impact,sans-serif;letter-spacing:.06em">HEY ${firstName.toUpperCase()}!</h2>
<p style="font-size:15px;line-height:1.7;color:#fff;margin:0 0 20px">${body}</p>
<a href="${link}" style="display:inline-block;background:#FFB800;color:#000;padding:14px 28px;border-radius:10px;font-weight:700;text-decoration:none;font-size:14px;letter-spacing:.06em">GO TO REGISTRATION →</a>
<p style="margin-top:32px;font-size:12px;color:#484848">zer0.pro · Super Builders · 2026</p>
</body></html>`
}

// ─── Rate limiter ─────────────────────────────────────────────────────────────
async function checkRateLimit(userId: string): Promise<boolean> {
  try {
    const minute = Math.floor(Date.now() / 60_000)
    const key = `rate:comms:${userId}:${minute}`
    const count = await redis.incr(key)
    if (count === 1) await redis.expire(key, 120) // expire after 2 minutes for safety
    return count <= 100
  } catch {
    // If Redis is unavailable, allow through (don't block comms)
    return true
  }
}

// ─── Route handler ────────────────────────────────────────────────────────────
export async function POST(req: Request) {
  const { userId, sessionClaims } = await auth()
  if (!userId) return new Response('Unauthorized', { status: 401 })
  const role = (sessionClaims?.publicMetadata as { role?: string } | undefined)?.role
  if (role !== 'admin') return new Response('Forbidden', { status: 403 })

  const body = await req.json()
  const parsed = BodySchema.safeParse(body)
  if (!parsed.success) {
    return Response.json({ error: parsed.error.flatten() }, { status: 400 })
  }

  const { triggerType, segment, message, channel } = parsed.data

  const allowed = await checkRateLimit(userId)
  if (!allowed) {
    return Response.json({ error: 'Rate limited — max 100 sends per minute' }, { status: 429 })
  }

  const targets = await getStudentsForTrigger(triggerType, segment)
  if (targets.length === 0) {
    return Response.json({ sent: 0, failed: 0, message: 'No matching students' })
  }

  const resend = new Resend(process.env.RESEND_API_KEY)
  let sent = 0
  let failed = 0

  for (const student of targets) {
    const firstName = student.fullName.split(' ')[0]

    // ── Email ──────────────────────────────────────────────────────────────
    if (channel === 'email' || channel === 'both') {
      try {
        await resend.emails.send({
          from: 'Super Builders <hello@superbuilder.org>',
          to: [student.email],
          subject: getEmailSubject(triggerType, firstName),
          html: getEmailBody(triggerType, firstName, message),
        })
        await insertCommsLog({
          studentId: student.id,
          studentName: student.fullName,
          template: triggerType,
          recipient: student.email,
          channel: 'email',
          status: 'sent',
          triggeredBy: userId,
        })
        sent++
      } catch (e) {
        await insertCommsLog({
          studentId: student.id,
          studentName: student.fullName,
          template: triggerType,
          recipient: student.email,
          channel: 'email',
          status: 'failed',
          error: e instanceof Error ? e.message : String(e),
          triggeredBy: userId,
        })
        failed++
      }
    }

    // ── WhatsApp ───────────────────────────────────────────────────────────
    if ((channel === 'whatsapp' || channel === 'both') && student.phone) {
      const ok = await sendWhatsApp({
        to: student.phone,
        template: getWhatsAppTemplate(triggerType),
        vars: getWhatsAppVars(triggerType, firstName, student.city, message),
      })
      await insertCommsLog({
        studentId: student.id,
        studentName: student.fullName,
        template: triggerType,
        recipient: student.phone,
        channel: 'whatsapp',
        status: ok ? 'sent' : 'failed',
        triggeredBy: userId,
      })
      if (ok) sent++; else failed++
    }
  }

  return Response.json({ sent, failed, total: targets.length })
}
