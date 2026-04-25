import { redirect }           from 'next/navigation'
import { getStudentOrRedirect } from '@/lib/auth/getStudentOrRedirect'
import { MentorCards }          from './_components/MentorCards'

export const dynamic = 'force-dynamic'

export const metadata = {
  title: 'Mentors — Super Builders',
}

export default async function MentorsPage() {
  const { student } = await getStudentOrRedirect(4)
  if (!student) redirect('/dashboard/apply')

  return (
    <div className="max-w-2xl mx-auto pb-8">
      {/* Page header */}
      <div className="px-4 pt-5 pb-2 md:px-6 md:pt-6">
        <p className="font-mono text-[11px] tracking-[0.2em] uppercase mb-1" style={{ color: 'var(--text-brand)' }}>
          Mentorship
        </p>
        <h1 className="font-display text-[2rem] md:text-[2.5rem] leading-none tracking-wide" style={{ color: 'var(--text-1)' }}>
          MENTORS
        </h1>
      </div>

      <div className="px-4 md:px-6 space-y-4">
        <MentorCards />
      </div>
    </div>
  )
}
