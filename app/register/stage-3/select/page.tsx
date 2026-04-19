import { getStudentOrRedirect } from '@/lib/auth/getStudentOrRedirect'
import { checkStageLock } from '@/lib/auth/stageLock'
import { StageLocked } from '@/components/stage/StageLocked'
import { TierSelect } from './_components/TierSelect'

export const metadata = {
  title: 'Choose Your Path — Super Builders',
  description: 'Pro or Premium — pick the experience that matches your ambition.',
}

export default async function TierSelectPage() {
  const { isOpen } = await checkStageLock(3)
  if (!isOpen) return <StageLocked stageNum={3} />

  await getStudentOrRedirect(3)
  return <TierSelect />
}
