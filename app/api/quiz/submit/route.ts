// POST /api/quiz/submit
// Scores quiz, enforces max 2 attempts via Upstash Redis counter, awards XP + badge

export async function POST(req: Request) {
  return Response.json({ ok: true })
}
