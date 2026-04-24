import { redirect } from 'next/navigation'
import { getStudentOrRedirect } from '@/lib/auth/getStudentOrRedirect'
import { checkStageLock } from '@/lib/auth/stageLock'
import { DomainSelectClient } from './_components/DomainSelectClient'

export const dynamic = 'force-dynamic'

export default async function DomainPage() {
  const { isOpen } = await checkStageLock(1)
  if (!isOpen) redirect('/dashboard')

  const { student } = await getStudentOrRedirect(2)

  if (!student) redirect('/dashboard/apply')
  if (!student.orientationComplete) redirect('/dashboard/intro')
  if (student.hackathonDomain)      redirect('/dashboard/quiz')

  return <DomainSelectClient studentId={student.id} />
}
