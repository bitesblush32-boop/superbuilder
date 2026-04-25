import { redirect } from 'next/navigation'
import { getStudentOrRedirect } from '@/lib/auth/getStudentOrRedirect'
import { checkStageLock } from '@/lib/auth/stageLock'
import { EngageForm } from './_components/EngageForm'

export const metadata = {
  title: 'Almost There — Super Builders',
  description: '3 quick questions before your spot is locked in.',
}

export default async function EngagePage() {
  const { isOpen } = await checkStageLock(1)
  if (!isOpen) redirect('/dashboard')

  const { student } = await getStudentOrRedirect(3)

  // Already completed engage — skip straight to payment
  if (student?.engageAnswers) redirect('/dashboard/pay')

  return <EngageForm />
}
