import crypto from 'crypto'

export async function POST(req: Request) {
  const { email, password } = await req.json()

  const adminEmail    = process.env.ADMIN_EMAIL    ?? ''
  const adminPassword = process.env.ADMIN_PASSWORD ?? ''
  const secret        = process.env.ADMIN_SESSION_SECRET ?? 'fallback-secret-change-me'

  const emailMatch    = email?.toLowerCase() === adminEmail.toLowerCase()
  const passwordMatch = password === adminPassword

  if (!emailMatch || !passwordMatch) {
    return Response.json({ success: false, error: 'Invalid credentials' }, { status: 401 })
  }

  const token = crypto
    .createHmac('sha256', secret)
    .update(adminEmail + ':' + Date.now())
    .digest('hex')

  const res = Response.json({ success: true })
  res.headers.set(
    'Set-Cookie',
    `admin_session=${token}; HttpOnly; Secure; SameSite=Strict; Max-Age=86400; Path=/`,
  )
  return res
}
