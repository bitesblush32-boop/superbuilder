import { getAdminSessionFromHeaders } from '@/lib/auth/adminAuth'
import { exportStudentsCSV } from '@/lib/db/queries/admin'

export const dynamic = 'force-dynamic'

export async function GET(req: Request) {
  if (!getAdminSessionFromHeaders(req.headers)) {
    return new Response('Unauthorized', { status: 401 })
  }

  const { searchParams } = new URL(req.url)

  const csv = await exportStudentsCSV({
    search: searchParams.get('search') ?? undefined,
    stage:  searchParams.get('stage')  ?? undefined,
    tier:   searchParams.get('tier')   ?? undefined,
    city:   searchParams.get('city')   ?? undefined,
    grade:  searchParams.get('grade')  ?? undefined,
  })

  return new Response(csv, {
    headers: {
      'Content-Type':        'text/csv',
      'Content-Disposition': `attachment; filename="students-${new Date().toISOString().slice(0, 10)}.csv"`,
    },
  })
}
