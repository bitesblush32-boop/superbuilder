import { Resend } from 'resend'
import { verifyAdminSession } from '@/lib/auth/adminAuth'
import { db } from '@/lib/db'
import { students } from '@/lib/db/schema'
import { eq } from 'drizzle-orm'
import { markVoucherSent } from '@/lib/db/queries/admin'

export async function POST(req: Request) {
  const valid = await verifyAdminSession()
  if (!valid) return Response.json({ error: 'Unauthorized' }, { status: 401 })

  let body: { referrerId?: string; voucherAmount?: number; voucherLink?: string }
  try {
    body = await req.json()
  } catch {
    return Response.json({ error: 'Invalid JSON' }, { status: 400 })
  }

  const { referrerId, voucherAmount, voucherLink } = body
  if (!referrerId || !voucherAmount || !voucherLink) {
    return Response.json({ error: 'Missing required fields' }, { status: 400 })
  }

  if (!voucherLink.startsWith('http')) {
    return Response.json({ error: 'Invalid voucher link' }, { status: 400 })
  }

  const [referrer] = await db
    .select({ fullName: students.fullName, email: students.email })
    .from(students)
    .where(eq(students.id, referrerId))
    .limit(1)

  if (!referrer) return Response.json({ error: 'Referrer not found' }, { status: 404 })

  const resend = new Resend(process.env.RESEND_API_KEY)
  const firstName = referrer.fullName.split(' ')[0]

  const { error: emailError } = await resend.emails.send({
    from:    'Super Builders <hello@superbuilder.org>',
    to:      [referrer.email],
    subject: `Your ₹${voucherAmount} referral reward is here! 🎁`,
    html:    rewardEmail({ firstName, voucherAmount, voucherLink }),
  })

  if (emailError) {
    console.error('[send-reward] email failed:', emailError)
    return Response.json({ error: 'Failed to send email' }, { status: 500 })
  }

  await markVoucherSent(referrerId)

  return Response.json({ success: true })
}

function rewardEmail({
  firstName, voucherAmount, voucherLink,
}: { firstName: string; voucherAmount: number; voucherLink: string }) {
  return `<!DOCTYPE html>
<html>
<head><meta charset="UTF-8"><meta name="viewport" content="width=device-width,initial-scale=1"></head>
<body style="margin:0;padding:0;background:#0A0A0A;font-family:sans-serif;color:#C0C0C0">
  <table width="100%" cellpadding="0" cellspacing="0" style="max-width:560px;margin:0 auto;padding:40px 16px">
    <tr><td>
      <div style="text-align:center;margin-bottom:32px">
        <div style="font-size:52px;margin-bottom:12px">🎁</div>
        <h1 style="margin:0 0 6px;font-size:30px;letter-spacing:0.06em;color:#FFB800;font-family:Impact,sans-serif;text-transform:uppercase">
          You earned ₹${voucherAmount}!
        </h1>
        <p style="margin:0;font-size:13px;color:#808080;letter-spacing:0.05em">
          SUPER BUILDERS — REFERRAL REWARD
        </p>
      </div>

      <div style="background:#161616;border:1px solid rgba(255,255,255,0.09);border-radius:16px;padding:28px;margin-bottom:20px">
        <p style="margin:0 0 20px;font-size:15px;line-height:1.7;color:#FFFFFF">
          Hey ${firstName}! 🔥 Thanks for spreading the word about Super Builders. Your referrals paid off — literally.
        </p>

        <div style="background:#111;border:1px solid rgba(255,184,0,0.25);border-radius:12px;padding:20px;margin-bottom:20px;text-align:center">
          <p style="margin:0 0 4px;font-size:12px;color:#484848;letter-spacing:0.12em;text-transform:uppercase">Your Amazon Voucher</p>
          <p style="margin:0 0 16px;font-size:36px;font-weight:700;color:#FFB800;letter-spacing:0.04em">₹${voucherAmount}</p>
          <a href="${voucherLink}"
             style="display:inline-block;background:#FFB800;color:#000;padding:14px 28px;border-radius:10px;font-weight:700;font-size:14px;letter-spacing:0.06em;text-decoration:none;text-transform:uppercase">
            Claim Voucher →
          </a>
        </div>

        <p style="margin:0;font-size:13px;color:#808080;line-height:1.7">
          Keep referring — more friends = more rewards! Share your code with classmates and climb the leaderboard. 🚀
        </p>
      </div>

      <p style="text-align:center;font-size:12px;color:#484848;margin:0;line-height:1.8">
        Questions? Reply to this email.<br>
        zer0.pro · Super Builders Season 1 · 2026
      </p>
    </td></tr>
  </table>
</body>
</html>`
}
