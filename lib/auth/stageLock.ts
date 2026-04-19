import { isStageOpen } from '@/lib/db/queries/teams'

export interface StageLockResult {
  isOpen: boolean
  stageNum: number
}

/**
 * Call at the TOP of any registration page server component.
 * If the stage is locked by admin, return isOpen: false.
 * The page then renders <StageLocked stageNum={n} /> instead of its content.
 */
export async function checkStageLock(stageNum: number): Promise<StageLockResult> {
  const isOpen = await isStageOpen(stageNum)
  return { isOpen, stageNum }
}
