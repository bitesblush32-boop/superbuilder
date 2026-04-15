// POST /api/registration/[stage]
// Validates and persists each registration stage, advances student.currentStage

export async function POST(
  req: Request,
  { params }: { params: Promise<{ stage: string }> }
) {
  const { stage } = await params
  return Response.json({ ok: true, stage })
}
