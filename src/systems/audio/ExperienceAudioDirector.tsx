import { useEffect, useMemo } from 'react'
import { audioAvailable } from './audioManifest'
import { resolveChapterWeights } from './audioFoundation'
import { ExperienceAudioRuntime } from './audioRuntime'

export { audioAvailable }

export function useExperienceAudio(overallProgress: number, muted: boolean) {
  const director = useMemo(() => new ExperienceAudioRuntime(), [])
  const weights = resolveChapterWeights(overallProgress)
  useEffect(() => {
    director.setMuted(muted)
    if (!muted) director.unlockFromUserGesture()
    director.update(weights)
  }, [director, muted, overallProgress])

  useEffect(() => {
    if (!audioAvailable) return
    let frame = 0; let previous = performance.now()
    const tick = (now: number) => { director.update(resolveChapterWeights(overallProgress), Math.min(.05, (now - previous) / 1000)); previous = now; frame = requestAnimationFrame(tick) }
    frame = requestAnimationFrame(tick)
    return () => cancelAnimationFrame(frame)
  }, [director, overallProgress])

  useEffect(() => {
    const unlock = (event: Event) => {
      const nextMuted = (event as CustomEvent<{ muted: boolean }>).detail.muted
      director.unlockFromUserGesture(); director.setMuted(nextMuted); director.update(resolveChapterWeights(overallProgress))
    }
    document.addEventListener('beyond-audio-user-setting', unlock)
    return () => document.removeEventListener('beyond-audio-user-setting', unlock)
  }, [director, overallProgress])
  useEffect(() => () => director.dispose(), [director])
  useEffect(() => {
    const visibility = () => { director.setVisible(document.visibilityState === 'visible'); director.update(resolveChapterWeights(overallProgress)) }
    document.addEventListener('visibilitychange', visibility)
    return () => document.removeEventListener('visibilitychange', visibility)
  }, [director, overallProgress])
  if (typeof window !== 'undefined' && (window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1')) {
    (globalThis as typeof globalThis & { __BEYOND_AUDIO__?: unknown }).__BEYOND_AUDIO__ = director.getSnapshot()
  }
}
