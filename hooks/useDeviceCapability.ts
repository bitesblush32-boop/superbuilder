'use client'

import { useMemo } from 'react'

export type DeviceTier = 'low' | 'mid' | 'high'

export interface DeviceCapability {
  /**
   * low  — Redmi 9A class: ≤4 cores, ≤2GB RAM
   *        → no Three.js, no particles, CSS transitions only (opacity + transform)
   *
   * mid  — Redmi Note class: ≤6 cores, ≤4GB RAM
   *        → Three.js low-poly, reduced particle count
   *
   * high — Flagship / desktop
   *        → full Three.js, particles, Framer Motion stagger
   */
  tier: DeviceTier
}

export function useDeviceCapability(): DeviceCapability {
  return useMemo(() => {
    if (typeof navigator === 'undefined') return { tier: 'high' }

    const cores  = navigator.hardwareConcurrency || 4
    const memory = (navigator as Navigator & { deviceMemory?: number }).deviceMemory ?? 4

    if (cores <= 4 && memory <= 2) return { tier: 'low' }
    if (cores <= 6 && memory <= 4) return { tier: 'mid' }
    return { tier: 'high' }
  }, [])
}
