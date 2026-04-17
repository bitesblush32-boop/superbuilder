import { NextResponse } from 'next/server'

export async function POST() {
  const res = NextResponse.redirect(
    new URL('/admin/login', process.env.NEXT_PUBLIC_APP_URL ?? 'http://localhost:3000'),
  )
  res.headers.set(
    'Set-Cookie',
    'admin_session=; HttpOnly; Secure; SameSite=Strict; Max-Age=0; Path=/',
  )
  return res
}
