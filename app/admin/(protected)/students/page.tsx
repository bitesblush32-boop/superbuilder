import { Suspense } from 'react'
import { getStudents } from '@/lib/db/queries/admin'
import { StudentsFilterBar } from '../../_components/StudentsFilterBar'
import { StudentsTable } from '../../_components/StudentsTable'

interface PageProps {
  searchParams: Promise<{
    search?: string
    stage?:  string
    tier?:   string
    city?:   string
    grade?:  string
    page?:   string
  }>
}

export const dynamic = 'force-dynamic'

export default async function AdminStudentsPage({ searchParams }: PageProps) {
  const sp = await searchParams
  const page = Math.max(1, parseInt(sp.page ?? '1', 10))

  const { students, total } = await getStudents({
    search: sp.search,
    stage:  sp.stage,
    tier:   sp.tier,
    city:   sp.city,
    grade:  sp.grade,
    page,
    limit:  50,
  })

  return (
    <div className="p-4 md:p-6 space-y-5 max-w-7xl">
      <div>
        <h2
          className="font-display text-2xl md:text-3xl tracking-wide"
          style={{ color: 'var(--text-1)' }}
        >
          STUDENTS
        </h2>
        <p className="text-sm mt-1" style={{ color: 'var(--text-3)' }}>
          Manage and filter all registered students
        </p>
      </div>

      <Suspense>
        <StudentsFilterBar total={total} showing={students.length} />
      </Suspense>

      <Suspense>
        <StudentsTable students={students} total={total} currentPage={page} />
      </Suspense>
    </div>
  )
}
