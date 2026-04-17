import { auth } from '@clerk/nextjs/server'
import { getStudentDetail } from '@/lib/db/queries/admin'

export const dynamic = 'force-dynamic'

export async function GET(
  _req: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  const { userId, sessionClaims } = await auth()
  if (!userId) return new Response('Unauthorized', { status: 401 })
  const role = (sessionClaims?.publicMetadata as { role?: string } | undefined)?.role
  if (role !== 'admin') return new Response('Forbidden', { status: 403 })

  const { id } = await params
  const detail = await getStudentDetail(id)

  return Response.json(detail)
}
