import { getStudentOrRedirect } from '@/lib/auth/getStudentOrRedirect'
import { checkStageLock } from '@/lib/auth/stageLock'
import { StageLocked } from '@/components/stage/StageLocked'
import { EngageForm } from './_components/EngageForm'

export const metadata = {
  title: 'Almost There — Super Builders',
  description: '3 quick questions before your spot is locked in.',
}

export default async function EngagePage() {
  const { isOpen } = await checkStageLock(3)
  if (!isOpen) return <StageLocked stageNum={3} />

  await getStudentOrRedirect(3)
  return <EngageForm />
}
