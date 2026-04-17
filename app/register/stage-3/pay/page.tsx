import { redirect } from 'next/navigation'
import { getStudentOrRedirect } from '@/lib/auth/getStudentOrRedirect'
import { PayPage } from './_components/PayPage'

export const metadata = {
  title: 'Confirm & Pay — Super Builders',
  description: 'Lock in your Super Builders spot.',
}

export default async function PayPageRoute() {
  const { student } = await getStudentOrRedirect(3)
  if (!student) redirect('/register/stage-1')

  return (
    <PayPage
      studentId={student.id}
      fullName={student.fullName}
      email={student.email}
      phone={student.phone ?? ''}
      defaultTier={(student.tier as 'pro' | 'premium' | null) ?? null}
    />
  )
}
