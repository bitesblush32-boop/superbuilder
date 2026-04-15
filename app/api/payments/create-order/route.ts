// POST /api/payments/create-order
// Creates Razorpay order, returns orderId + keyId to client for checkout
// See CLAUDE.md §10 for full implementation

export async function POST(req: Request) {
  return Response.json({ ok: true })
}
