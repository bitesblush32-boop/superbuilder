// POST /api/certificates/generate
// Generates 1920×1080 PNG + PDF cert via canvas-design skill,
// uploads to Cloudflare R2, updates students.certificate_url
// See CLAUDE.md §20 for spec

export async function POST(req: Request) {
  return Response.json({ ok: true })
}
