'use client'

import { create } from 'zustand'
import type { BadgeId } from '@/lib/gamification/badges'
import { BADGES } from '@/lib/gamification/badges'

interface BadgeUnlockState {
  /** Badge waiting to be shown in the unlock modal. null = no pending badge. */
  pendingBadge: BadgeId | null
  setPendingBadge: (badge: BadgeId) => void
  clearPendingBadge: () => void
}

const useBadgeUnlockStore = create<BadgeUnlockState>((set) => ({
  pendingBadge:      null,
  setPendingBadge:   (badge) => set({ pendingBadge: badge }),
  clearPendingBadge: ()      => set({ pendingBadge: null }),
}))

export interface BadgeUnlockActions {
  pendingBadge:      BadgeId | null
  /** Badge metadata resolved from BADGES constant, or null if no pending badge. */
  pendingBadgeData:  (typeof BADGES)[BadgeId] | null
  setPendingBadge:   (badge: BadgeId) => void
  clearPendingBadge: () => void
}

/**
 * Zustand-backed hook for the badge unlock modal flow.
 *
 * Usage in server action response handler:
 *   const { setPendingBadge } = useBadgeUnlock()
 *   if (result.badgeAwarded) setPendingBadge(result.badgeAwarded)
 *
 * Usage in BadgeUnlock modal:
 *   const { pendingBadge, pendingBadgeData, clearPendingBadge } = useBadgeUnlock()
 */
export function useBadgeUnlock(): BadgeUnlockActions {
  const { pendingBadge, setPendingBadge, clearPendingBadge } = useBadgeUnlockStore()

  return {
    pendingBadge,
    pendingBadgeData: pendingBadge ? BADGES[pendingBadge] : null,
    setPendingBadge,
    clearPendingBadge,
  }
}
