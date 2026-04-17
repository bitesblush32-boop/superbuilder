import { auth } from '@clerk/nextjs/server'
import { exportStudentsCSV } from '@/lib/db/queries/admin'

export const dynamic = 'force-dynamic'

export async function GET(req: Request) {
  const { userId, sessionClaims } = await auth()
  if (!userId) return new Response('Unauthorized', { status: 401 })
  const role = (sessionClaims?.publicMetadata as { role?: string } | undefined)?.role
  if (role !== 'admin') return new Response('Forbidden', { status: 403 })

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
