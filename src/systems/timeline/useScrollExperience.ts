import { useEffect, useRef } from 'react'
import type { ExperienceState } from './experience.types'

type Options = Pick<ExperienceState, 'overallProgress'> & { setOverallProgress: (progress: number) => void }

export function useScrollExperience({ overallProgress, setOverallProgress }: Options) {
  const progress = useRef(overallProgress)
  const touchY = useRef<number | null>(null)
  useEffect(() => { progress.current = overallProgress }, [overallProgress])
  useEffect(() => {
    const move = (delta: number) => {
      progress.current = Math.min(1, Math.max(0, progress.current + delta))
      setOverallProgress(progress.current)
    }
    const wheel = (event: WheelEvent) => { event.preventDefault(); move(event.deltaY * .00045) }
    const key = (event: KeyboardEvent) => {
      if (['ArrowDown', 'PageDown'].includes(event.key)) { event.preventDefault(); move(.035) }
      if (['ArrowUp', 'PageUp'].includes(event.key)) { event.preventDefault(); move(-.035) }
    }
    const start = (event: TouchEvent) => { touchY.current = event.touches[0]?.clientY ?? null }
    const touch = (event: TouchEvent) => {
      const y = event.touches[0]?.clientY
      if (y == null || touchY.current == null) return
      event.preventDefault(); move((touchY.current - y) / Math.max(innerHeight, 1)); touchY.current = y
    }
    addEventListener('wheel', wheel, { passive: false })
    addEventListener('keydown', key)
    addEventListener('touchstart', start, { passive: true })
    addEventListener('touchmove', touch, { passive: false })
    return () => { removeEventListener('wheel', wheel); removeEventListener('keydown', key); removeEventListener('touchstart', start); removeEventListener('touchmove', touch) }
  }, [setOverallProgress])
}
