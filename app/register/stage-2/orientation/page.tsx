import { redirect } from 'next/navigation'
import { getStudentOrRedirect } from '@/lib/auth/getStudentOrRedirect'
import { OrientationClient } from './_components/OrientationClient'

export const dynamic = 'force-dynamic'

export default async function OrientationPage() {
  const { student } = await getStudentOrRedirect(2)

  if (!student) redirect('/register/stage-1')
  if (student.orientationComplete) redirect('/register/stage-2/domain')

  const firstName = student.fullName.split(' ')[0]

  return <OrientationClient studentId={student.id} firstName={firstName} />
}
