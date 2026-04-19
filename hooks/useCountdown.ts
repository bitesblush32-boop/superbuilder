'use client'

import { useState, useEffect, useCallback } from 'react'

export interface CountdownResult {
  days:    number
  hours:   number
  mins:    number
  secs:    number
  expired: boolean
}

function calculate(target: Date): CountdownResult {
  const diff = target.getTime() - Date.now()

  if (diff <= 0) {
    return { days: 0, hours: 0, mins: 0, secs: 0, expired: true }
  }

  const days  = Math.floor(diff / (1000 * 60 * 60 * 24))
  const hours = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60))
  const mins  = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60))
  const secs  = Math.floor((diff % (1000 * 60)) / 1000)

  return { days, hours, mins, secs, expired: false }
}

/**
 * Returns a live countdown to `target`, updating every second.
 * Cleans up its interval on unmount.
 *
 * @example
 * const { days, hours, mins, secs, expired } = useCountdown(HACKATHON_START)
 */
export function useCountdown(target: Date): CountdownResult {
  // Extract primitive time to avoid infinite rerenders if target is a new Date reference on every render
  const targetTime = target.getTime()
  const tick = useCallback(() => calculate(new Date(targetTime)), [targetTime])

  const [countdown, setCountdown] = useState<CountdownResult>(tick)

  useEffect(() => {
    // Sync immediately in case of SSR/hydration delta
    setCountdown(tick())

    const id = setInterval(() => setCountdown(tick()), 1000)
    return () => clearInterval(id)
  }, [tick])

  return countdown
}
