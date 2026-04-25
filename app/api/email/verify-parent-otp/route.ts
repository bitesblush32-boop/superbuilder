import { Redis } from '@upstash/redis'

const redis = new Redis({
  url:   process.env.UPSTASH_REDIS_REST_URL!,
  token: process.env.UPSTASH_REDIS_REST_TOKEN!,
})

export async function POST(req: Request) {
  try {
    const { email, otp } = await req.json()

    if (!email || !otp) {
      return Response.json({ error: 'Missing email or code' }, { status: 400 })
    }

    const normalised = String(email).toLowerCase().trim()
    const key        = `parent_otp:${normalised}`
    const stored     = await redis.get<string>(key)

    if (!stored) {
      return Response.json(
        { error: 'Code expired. Request a new one.' },
        { status: 400 },
      )
    }

    if (String(stored).trim() !== String(otp).trim()) {
      return Response.json(
        { error: 'Incorrect code. Check and try again.' },
        { status: 400 },
      )
    }

    // Delete OTP immediately after successful use — one-time only
    await redis.del(key)

    return Response.json({ success: true })
  } catch (err) {
    console.error('[verify-parent-otp]', err)
    return Response.json({ error: 'Verification failed. Try again.' }, { status: 500 })
  }
}
