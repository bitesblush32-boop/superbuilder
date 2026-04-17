import { getStudentOrRedirect } from '@/lib/auth/getStudentOrRedirect'
import { TierSelect } from './_components/TierSelect'

export const metadata = {
  title: 'Choose Your Path — Super Builders',
  description: 'Pro or Premium — pick the experience that matches your ambition.',
}

export default async function TierSelectPage() {
  await getStudentOrRedirect(3)
  return <TierSelect />
}
