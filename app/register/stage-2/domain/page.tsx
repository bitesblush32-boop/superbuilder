import { redirect } from 'next/navigation'
import { getStudentOrRedirect } from '@/lib/auth/getStudentOrRedirect'
import { DomainSelectClient } from './_components/DomainSelectClient'

export const dynamic = 'force-dynamic'

export default async function DomainPage() {
  const { student } = await getStudentOrRedirect(2)

  if (!student) redirect('/register/stage-1')
  if (!student.orientationComplete) redirect('/register/stage-2/orientation')
  if (student.hackathonDomain)      redirect('/register/stage-2/quiz')

  return <DomainSelectClient studentId={student.id} />
}
