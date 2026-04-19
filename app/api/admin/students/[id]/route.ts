import { getAdminSessionFromHeaders } from '@/lib/auth/adminAuth'
import { getStudentDetail } from '@/lib/db/queries/admin'

export const dynamic = 'force-dynamic'

export async function GET(
  req: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  if (!getAdminSessionFromHeaders(req.headers)) {
    return new Response('Unauthorized', { status: 401 })
  }

  const { id } = await params
  const detail = await getStudentDetail(id)

  return Response.json(detail)
}
