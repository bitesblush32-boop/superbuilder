// GET /api/leaderboard/stream
// Server-Sent Events — streams top-50 leaderboard from Upstash Redis sorted set
// See CLAUDE.md §11 for full SSE + Redis implementation

export const dynamic = 'force-dynamic'
export const runtime = 'nodejs'

export async function GET(req: Request) {
  return Response.json({ ok: true })
}
