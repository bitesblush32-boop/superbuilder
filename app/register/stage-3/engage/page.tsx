import { getStudentOrRedirect } from '@/lib/auth/getStudentOrRedirect'
import { EngageForm } from './_components/EngageForm'

export const metadata = {
  title: 'Almost There — Super Builders',
  description: '3 quick questions before your spot is locked in.',
}

export default async function EngagePage() {
  await getStudentOrRedirect(3)
  return <EngageForm />
}
