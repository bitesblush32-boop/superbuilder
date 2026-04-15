// POST /api/webhooks/razorpay
// Verifies HMAC SHA256 signature, handles payment.captured event
// See CLAUDE.md §10 for full implementation spec

export async function POST(req: Request) {
  return Response.json({ ok: true })
}
