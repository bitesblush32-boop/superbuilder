import crypto from 'crypto'
import { Resend } from 'resend'
import { db } from '@/lib/db'
import { students, payments, parents, referrals } from '@/lib/db/schema'
import { eq, sql } from 'drizzle-orm'
import { generateReferralCode } from '@/lib/db/queries/students'

const resend = new Resend(process.env.RESEND_API_KEY)

export async function POST(req: Request) {
  // 1. Read raw body — must be text before JSON.parse for HMAC integrity
  const rawBody  = await req.text()
  const sigHeader = req.headers.get('x-razorpay-signature') ?? ''

  // 2. Verify HMAC SHA256
  const expected = crypto
    .createHmac('sha256', process.env.RAZORPAY_WEBHOOK_SECRET!)
    .update(rawBody)
    .digest('hex')

  if (sigHeader !== expected) {
    return new Response('Unauthorized', { status: 401 })
  }

  // 3. Parse event
  let event: { event: string; payload?: { payment?: { entity?: { id?: string; order_id?: string } } } }
  try {
    event = JSON.parse(rawBody)
  } catch {
    return new Response('Bad Request', { status: 400 })
  }

  // 4. Only act on payment.captured — acknowledge all others silently
  if (event.event !== 'payment.captured') {
    return new Response('OK', { status: 200 })
  }

  const razorpayPaymentId = event.payload?.payment?.entity?.id
  const razorpayOrderId   = event.payload?.payment?.entity?.order_id

  if (!razorpayPaymentId || !razorpayOrderId) {
    return new Response('OK', { status: 200 })
  }

  // 5. Collect for post-transaction email
  let studentEmail  = ''
  let studentName   = ''
  let studentId     = ''
  let parentEmail   = ''
  let parentName    = ''
  let tierName      = ''

  try {
    await db.transaction(async (tx) => {
      // a. Find payment record
      const [payment] = await tx
        .select()
        .from(payments)
        .where(eq(payments.razorpayOrderId, razorpayOrderId))
        .limit(1)

      if (!payment) return
      if (payment.status === 'captured') return // idempotency — already processed

      // b. Update payment record: captured
      await tx
        .update(payments)
        .set({
          razorpayPaymentId,
          status:      'captured',
          confirmedAt: new Date(),
        })
        .where(eq(payments.id, payment.id))

      // c. Fetch student
      const [student] = await tx
        .select()
        .from(students)
        .where(eq(students.id, payment.studentId))
        .limit(1)

      if (!student) return

      // d. Generate referral code if not already set
      const referralCode = student.referralCode ?? generateReferralCode()

      // e. Update student: isPaid, tier, stage, referralCode
      await tx
        .update(students)
        .set({
          isPaid:       true,
          tier:         payment.tier,
          currentStage: '4',
          referralCode,
          updatedAt:    new Date(),
        })
        .where(eq(students.id, student.id))

      // f. Award BUILDER badge + 200 XP atomically
      await tx
        .update(students)
        .set({
          xpPoints:  sql`xp_points + 200`,
          badges:    sql`badges || '["builder"]'::jsonb`,
          updatedAt: new Date(),
        })
        .where(eq(students.id, student.id))

      // g. Handle referral — mark as paid if student was referred
      if (student.referredBy) {
        const [referrer] = await tx
          .select({ id: students.id })
          .from(students)
          .where(eq(students.referralCode, student.referredBy))
          .limit(1)

        if (referrer) {
          // Insert referral record (ignore if already exists)
          await tx
            .insert(referrals)
            .values({ referrerId: referrer.id, refereeId: student.id, paid: true })
            .onConflictDoNothing()

          // Also ensure any existing record is marked paid
          await tx
            .update(referrals)
            .set({ paid: true })
            .where(eq(referrals.refereeId, student.id))
        }
      }

      // h. Fetch parent for post-transaction emails
      const [parent] = await tx
        .select({ email: parents.email, fullName: parents.fullName })
        .from(parents)
        .where(eq(parents.studentId, student.id))
        .limit(1)

      // Collect data for email sending after transaction closes
      studentEmail = student.email
      studentName  = student.fullName
      studentId    = student.id
      tierName     = payment.tier === 'premium' ? 'Premium' : 'Pro'
      parentEmail  = parent?.email  ?? ''
      parentName   = parent?.fullName ?? ''
    })
  } catch (err) {
    console.error('[razorpay-webhook] transaction failed:', err)
    return new Response('Internal Server Error', { status: 500 })
  }

  // 6. Send emails — best-effort, never fail the webhook response
  if (studentEmail) {
    const firstName = studentName.split(' ')[0]

    resend.emails.send({
      from:    'Super Builders <hello@superbuilders.zer0.pro>',
      to:      [studentEmail],
      subject: `You're officially a Super Builder, ${firstName}! 🏆`,
      html:    studentConfirmationEmail({ firstName, tier: tierName }),
    }).catch(e => console.error('[razorpay-webhook] student email:', e))

    if (parentEmail) {
      resend.emails.send({
        from:    'Super Builders <hello@superbuilders.zer0.pro>',
        to:      [parentEmail],
        subject: `${firstName} is registered for Super Builders ${tierName} ✅`,
        html:    parentConfirmationEmail({ studentName, parentName, tier: tierName }),
      }).catch(e => console.error('[razorpay-webhook] parent email:', e))
    }
  }

  return new Response('OK', { status: 200 })
}

// ─── Email templates ──────────────────────────────────────────────────────────

function studentConfirmationEmail({ firstName, tier }: { firstName: string; tier: string }) {
  return `<!DOCTYPE html>
<html>
<head><meta charset="UTF-8"><meta name="viewport" content="width=device-width,initial-scale=1"></head>
<body style="margin:0;padding:0;background:#0A0A0A;font-family:sans-serif;color:#C0C0C0">
  <table width="100%" cellpadding="0" cellspacing="0" style="max-width:560px;margin:0 auto;padding:40px 16px">
    <tr><td>
      <div style="text-align:center;margin-bottom:32px">
        <div style="font-size:48px;margin-bottom:12px">🏆</div>
        <h1 style="margin:0 0 6px;font-size:36px;letter-spacing:0.06em;color:#FFB800;font-family:Impact,sans-serif;text-transform:uppercase">
          YOU'RE IN, ${firstName}!
        </h1>
        <p style="margin:0;font-size:13px;color:#808080;letter-spacing:0.05em">
          SUPER BUILDERS · SCHOOL EDITION · SEASON 1
        </p>
      </div>

      <div style="background:#161616;border:1px solid rgba(255,255,255,0.09);border-radius:16px;padding:28px;margin-bottom:20px">
        <p style="margin:0 0 20px;font-size:15px;line-height:1.7;color:#FFFFFF">
          Your <strong style="color:#FFB800">${tier}</strong> spot is locked in. You're officially a Super Builder. ⚡
        </p>
        <div style="border-top:1px solid rgba(255,255,255,0.06);padding-top:20px;margin-bottom:20px">
          <p style="margin:0 0 10px;font-size:12px;color:#484848;letter-spacing:0.12em;text-transform:uppercase">What's next</p>
          <div style="display:flex;flex-direction:column;gap:12px">
            ${[
              ['🎮', 'Join Discord', 'Your community is waiting. Link in your dashboard.'],
              ['📅', 'Workshop 1 — May 26', 'AI Fundamentals + Tools · 90 minutes · Live'],
              ['🔥', 'Build Phase — Jun 1–6', 'Apply everything you learn'],
              ['🚀', 'Hackathon — Jun 7–8', '24 hours. One idea. Build it.'],
            ].map(([icon, title, desc]) => `
            <div style="display:flex;gap:12px;align-items:flex-start">
              <span style="font-size:18px;line-height:1;margin-top:2px">${icon}</span>
              <div>
                <p style="margin:0 0 2px;font-size:14px;font-weight:600;color:#FFFFFF">${title}</p>
                <p style="margin:0;font-size:13px;color:#808080">${desc}</p>
              </div>
            </div>`).join('')}
          </div>
        </div>
        <a href="https://superbuilders.zer0.pro/dashboard"
           style="display:block;background:#FFB800;color:#000;text-align:center;padding:16px 24px;border-radius:12px;font-weight:700;font-size:14px;letter-spacing:0.06em;text-decoration:none;text-transform:uppercase">
          Go to Dashboard →
        </a>
      </div>

      <p style="text-align:center;font-size:12px;color:#484848;margin:0;line-height:1.8">
        Questions? Reply to this email or WhatsApp us.<br>
        zer0.pro · 2025
      </p>
    </td></tr>
  </table>
</body>
</html>`
}

function parentConfirmationEmail({
  studentName, parentName, tier,
}: { studentName: string; parentName: string; tier: string }) {
  const firstName = studentName.split(' ')[0]
  return `<!DOCTYPE html>
<html>
<head><meta charset="UTF-8"><meta name="viewport" content="width=device-width,initial-scale=1"></head>
<body style="margin:0;padding:0;background:#0A0A0A;font-family:sans-serif;color:#C0C0C0">
  <table width="100%" cellpadding="0" cellspacing="0" style="max-width:560px;margin:0 auto;padding:40px 16px">
    <tr><td>
      <div style="text-align:center;margin-bottom:28px">
        <h1 style="margin:0 0 6px;font-size:22px;color:#FFFFFF;font-weight:700">
          ${firstName} is in! ✅
        </h1>
        <p style="margin:0;font-size:13px;color:#808080">Super Builders ${tier} — Payment Confirmed</p>
      </div>

      <div style="background:#161616;border:1px solid rgba(255,255,255,0.09);border-radius:16px;padding:24px;margin-bottom:16px">
        <p style="margin:0 0 16px;font-size:14px;line-height:1.7">Dear ${parentName || 'Parent/Guardian'},</p>
        <p style="margin:0 0 16px;font-size:14px;line-height:1.7;color:#808080">
          Payment for <strong style="color:#FFFFFF">${studentName}</strong>'s <strong style="color:#FFB800">${tier}</strong> registration is confirmed. Here's everything you need to know.
        </p>

        <div style="background:#111;border:1px solid rgba(255,255,255,0.05);border-radius:10px;padding:16px;margin-bottom:12px">
          <p style="margin:0 0 10px;font-size:11px;color:#484848;letter-spacing:0.12em;text-transform:uppercase">Programme Timeline</p>
          <table style="width:100%;border-collapse:collapse;font-size:13px">
            ${[
              ['May 26–Jun 1', 'Workshop 1 — AI Fundamentals'],
              ['Jun 1–3', 'Workshop 2 — Domain Deep-Dive'],
              ['Jun 3–5', 'Workshop 3 — Build Sprint'],
              ['Jun 7–8', '24-hour Hackathon'],
              ['Jun 9–10', 'Results + Certificates'],
            ].map(([date, desc]) => `
            <tr>
              <td style="padding:6px 12px 6px 0;color:#FFB800;white-space:nowrap;font-size:12px">${date}</td>
              <td style="padding:6px 0;color:#C0C0C0">${desc}</td>
            </tr>`).join('')}
          </table>
        </div>

        <div style="background:#111;border:1px solid rgba(255,255,255,0.05);border-radius:10px;padding:16px">
          <p style="margin:0 0 10px;font-size:11px;color:#484848;letter-spacing:0.12em;text-transform:uppercase">Safety & Your Assurance</p>
          ${[
            ['🔐', 'All sessions are recorded and moderated'],
            ['✅', 'zer0.pro is a verified organisation'],
            ['💰', 'Full refund if programme doesn\'t start'],
            ['📲', 'Parent WhatsApp group — updates and Q&A'],
            ['🛡️', 'No direct student-mentor contact outside platform'],
          ].map(([icon, text]) => `
          <div style="display:flex;gap:10px;margin-bottom:10px;align-items:flex-start">
            <span style="font-size:14px">${icon}</span>
            <span style="font-size:13px;color:#C0C0C0;line-height:1.5">${text}</span>
          </div>`).join('')}
        </div>
      </div>

      <p style="text-align:center;font-size:12px;color:#484848;margin:0;line-height:1.8">
        Reply to this email with any concerns. We're always available.<br>
        zer0.pro · 2025
      </p>
    </td></tr>
  </table>
</body>
</html>`
}
