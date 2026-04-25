import { Redis }             from '@upstash/redis'
import { sendEmail }         from '@/lib/email/send'
import { parentOtpTemplate } from '@/lib/email/templates'

const redis = new Redis({
  url:   process.env.UPSTASH_REDIS_REST_URL!,
  token: process.env.UPSTASH_REDIS_REST_TOKEN!,
})

export async function POST(req: Request) {
  try {
    const body = await req.json()
    const { email, parentName, studentName } = body

    if (!email || typeof email !== 'string' || !email.includes('@')) {
      return Response.json({ error: 'Invalid email address' }, { status: 400 })
    }

    const normalised = email.toLowerCase().trim()

    // Rate limit: max 5 sends per email per hour
    const rateKey = `parent_otp_rate:${normalised}`
    const count   = await redis.incr(rateKey)
    if (count === 1) await redis.expire(rateKey, 3600)
    if (count > 5) {
      return Response.json(
        { error: 'Too many attempts. Please wait an hour and try again.' },
        { status: 429 },
      )
    }

    // Generate cryptographically random 6-digit OTP
    const otp = String(Math.floor(100000 + Math.random() * 900000))

    // Store in Redis — 10 minute TTL
    await redis.set(`parent_otp:${normalised}`, otp, { ex: 600 })

    // Send email
    const { subject, html } = parentOtpTemplate({
      parentName:  parentName  || 'Parent',
      studentName: studentName || 'your child',
      otp,
    })

    const result = await sendEmail({
      to:       email,
      subject,
      html,
      template: 'parent_otp',
    })

    if (!result.success) {
      return Response.json({ error: 'Failed to send email. Check the address and try again.' }, { status: 500 })
    }

    return Response.json({ success: true })
  } catch (err) {
    console.error('[send-parent-otp]', err)
    return Response.json({ error: 'Something went wrong. Try again.' }, { status: 500 })
  }
}
