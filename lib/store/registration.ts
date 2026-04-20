import { create } from 'zustand'
import { persist } from 'zustand/middleware'

// Sub-step tracking for Stage 1: 1 = Personal Info, 2 = Parents Info, 3 = Team Building
export type Stage1SubStep = 1 | 2 | 3

interface RegistrationStore {
  // Stage 1 sub-step — persisted so page refresh remembers where you are
  stage1SubStep: Stage1SubStep
  setStage1SubStep: (step: Stage1SubStep) => void
  reset: () => void
}

export const useRegistrationStore = create<RegistrationStore>()(
  persist(
    (set) => ({
      stage1SubStep:    1,
      setStage1SubStep: (step) => set({ stage1SubStep: step }),
      reset:            () => set({ stage1SubStep: 1 }),
    }),
    { name: 'sb-registration' },
  ),
)
