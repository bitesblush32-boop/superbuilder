import { create } from 'zustand'
import { persist } from 'zustand/middleware'

interface RegistrationStore {
  reset: () => void
}

export const useRegistrationStore = create<RegistrationStore>()(
  persist(
    (set) => ({
      reset: () => set({}),
    }),
    { name: 'sb-registration' },
  ),
)
