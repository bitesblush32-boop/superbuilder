import { getStudentOrRedirect } from '@/lib/auth/getStudentOrRedirect'
import { IdeaForm } from './_components/IdeaForm'

export const metadata = {
  title: 'Pitch Your Idea — Super Builders',
  description: 'Share your problem statement and AI approach. Your idea deserves to exist.',
}

export default async function IdeaPage() {
  await getStudentOrRedirect(2)
  return <IdeaForm />
}
