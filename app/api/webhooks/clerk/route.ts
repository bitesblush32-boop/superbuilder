// POST /api/webhooks/clerk
// Syncs Clerk user events (user.created, user.updated) to students table

export async function POST(req: Request) {
  return Response.json({ ok: true })
}
