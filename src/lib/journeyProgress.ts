import { useEffect, useState } from 'react'

/**
 * The smoothed scroll progress lives outside React: the render loop writes to it
 * every frame, and React components subscribe at a much coarser granularity so
 * that a 60fps canvas never triggers 60fps re-renders.
 */
let current = 0
const listeners = new Set<(p: number) => void>()

export function setJourneyProgress(p: number) {
  current = p
  for (const fn of listeners) fn(p)
}

export function getJourneyProgress() {
  return current
}

/** Re-renders only when progress moves more than `step`. */
export function useJourneyProgress(step = 0.004) {
  const [p, setP] = useState(current)

  useEffect(() => {
    let last = current
    const fn = (next: number) => {
      if (Math.abs(next - last) < step && next !== 0 && next !== 1) return
      last = next
      setP(next)
    }
    listeners.add(fn)
    return () => {
      listeners.delete(fn)
    }
  }, [step])

  return p
}
