'use client'

import { useState, useEffect } from 'react'

export interface LeaderboardEntry {
  studentId: string
  name:      string
  city:      string
  xp:        number
  rank:      number
  badges:    string[]
}

type SSEMessage =
  | { type: 'init';   data: LeaderboardEntry[] }
  | { type: 'update'; data: LeaderboardEntry[] }

/**
 * Subscribes to /api/leaderboard/stream (SSE) and returns a live-updating
 * top-50 leaderboard array. Closes the EventSource on unmount.
 *
 * Rendering strategy: SSR provides initial data, this hook takes over
 * for live updates during the hackathon (Jun 7–8).
 */
export function useLeaderboard(initialData: LeaderboardEntry[] = []): LeaderboardEntry[] {
  const [board, setBoard] = useState<LeaderboardEntry[]>(initialData)

  useEffect(() => {
    const es = new EventSource('/api/leaderboard/stream')

    es.onmessage = (event: MessageEvent<string>) => {
      const msg = JSON.parse(event.data) as SSEMessage
      if (msg.type === 'init' || msg.type === 'update') {
        setBoard(msg.data)
      }
    }

    es.onerror = () => {
      // Connection dropped — EventSource auto-reconnects after ~3s.
      // No explicit handling needed unless we want to show a stale indicator.
    }

    return () => es.close()
  }, [])

  return board
}
