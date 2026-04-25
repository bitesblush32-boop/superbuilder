// GET /api/email/verify-parent?token=...
// Validates parent email magic link token (stored in Upstash Redis)
// Marks parent.email_verified = true on success

import { NextRequest, NextResponse } from 'next/server'
import { Redis }                     from '@upstash/redis'
import { markParentEmailVerified }   from '@/lib/db/queries/parents'

const redis = new Redis({
  url:   process.env.UPSTASH_REDIS_REST_URL!,
  token: process.env.UPSTASH_REDIS_REST_TOKEN!,
})

export async function GET(req: NextRequest) {
  const token = req.nextUrl.searchParams.get('token')
  if (!token) {
    return NextResponse.redirect(new URL('/verify-parent?status=invalid', req.url))
  }

  const key       = `parent_verify:${token}`
  const studentId = await redis.get<string>(key)

  if (!studentId) {
    return NextResponse.redirect(new URL('/verify-parent?status=expired', req.url))
  }

  await markParentEmailVerified(studentId)
  await redis.del(key)

  return NextResponse.redirect(new URL('/verify-parent?status=success', req.url))
}
