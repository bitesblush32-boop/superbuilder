import { auth } from '@clerk/nextjs/server'
import { upsertScore, clerkIdToUuid } from '@/lib/db/queries/admin'
import { z } from 'zod'

const ScoreSchema = z.object({
  projectId:    z.string().uuid(),
  judgeClerkId: z.string(),
  innovation:   z.number().int().min(0).max(25),
  impact:       z.number().int().min(0).max(25),
  technical:    z.number().int().min(0).max(25),
  presentation: z.number().int().min(0).max(15),
  completeness: z.number().int().min(0).max(10),
  totalScore:   z.number().int().min(0).max(100),
  feedback:     z.string().max(2000).optional(),
})

export async function POST(req: Request) {
  const { userId, sessionClaims } = await auth()
  if (!userId) return new Response('Unauthorized', { status: 401 })
  const role = (sessionClaims?.publicMetadata as { role?: string } | undefined)?.role
  if (role !== 'admin') return new Response('Forbidden', { status: 403 })

  const body = await req.json()
  const parsed = ScoreSchema.safeParse(body)
  if (!parsed.success) {
    return new Response(JSON.stringify({ error: parsed.error.flatten() }), {
      status:  400,
      headers: { 'Content-Type': 'application/json' },
    })
  }

  const { projectId, innovation, impact, technical, presentation, completeness, totalScore, feedback } = parsed.data

  // Verify total
  const expectedTotal = innovation + impact + technical + presentation + completeness
  if (totalScore !== expectedTotal) {
    return new Response('Invalid totalScore', { status: 400 })
  }

  // Use the authenticated user's ID (ignore client-provided judgeClerkId for security)
  const judgeUuid = clerkIdToUuid(userId)

  await upsertScore({
    projectId, judgeId: judgeUuid,
    innovation, impact, technical, presentation, completeness, totalScore, feedback,
  })

  return Response.json({ success: true, totalScore })
}
