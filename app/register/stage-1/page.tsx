import { getStudentOrRedirect } from '@/lib/auth/getStudentOrRedirect'
import { Stage1Form } from './_components/Stage1Form'

export const metadata = {
  title: 'Apply — Super Builders',
  description: 'Start your Super Builders application. Takes about 5 minutes.',
}

export default async function Stage1Page() {
  // Redirects to sign-in if unauthenticated; redirects past stage-1 if already submitted
  await getStudentOrRedirect(1)
  return <Stage1Form />
}
