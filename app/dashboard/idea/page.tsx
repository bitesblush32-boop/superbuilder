import { redirect } from 'next/navigation'
import { getStudentOrRedirect, getStage2Checkpoint } from '@/lib/auth/getStudentOrRedirect'
import { checkStageLock } from '@/lib/auth/stageLock'
import { StageLocked } from '@/components/stage/StageLocked'
import { IdeaForm } from './_components/IdeaForm'

export const metadata = {
  title: 'Pitch Your Idea — Super Builders',
  description: 'Share your problem statement and AI approach. Your idea deserves to exist.',
}

export default async function IdeaPage() {
  const { isOpen } = await checkStageLock(2)
  if (!isOpen) return <StageLocked stageNum={2} />

  const { student } = await getStudentOrRedirect(2)
  if (!student) redirect('/dashboard/apply')
  if (!student.hackathonDomain) redirect('/dashboard/domain')

  const { quizPassed } = await getStage2Checkpoint(student.id)
  if (!quizPassed) redirect('/dashboard/quiz')

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  return <IdeaForm lockedDomain={student.hackathonDomain as any} />
}
