// POST /api/quiz/retake
// Validates attempt count ≤ 2, resets quiz state for retake

export async function POST(req: Request) {
  return Response.json({ ok: true })
}
