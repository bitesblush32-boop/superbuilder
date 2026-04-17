import { create } from 'zustand'
import { persist } from 'zustand/middleware'

interface RegistrationStore {
  tier:     'pro' | 'premium' | null
  isEmi:    boolean
  setTier:  (tier: 'pro' | 'premium') => void
  setIsEmi: (v: boolean) => void
  reset:    () => void
}

export const useRegistrationStore = create<RegistrationStore>()(
  persist(
    (set) => ({
      tier:     null,
      isEmi:    false,
      setTier:  (tier)  => set({ tier }),
      setIsEmi: (isEmi) => set({ isEmi }),
      reset:    ()      => set({ tier: null, isEmi: false }),
    }),
    { name: 'sb-registration' },
  ),
)
