import { createContext, useCallback, useContext, useMemo, useState, type ReactNode } from 'react'
import { chapterOrder, type ChapterId, type ExperienceState, type SceneTransitionRequest } from './experience.types'
import { overallProgressFor, resolveExperienceProgress } from './chapters'

type ExperienceControllerValue = ExperienceState & {
  setChapterProgress: (progress: number) => void
  setOverallProgress: (progress: number) => void
  enterChapter: (chapter: ChapterId) => void
  leaveChapter: (chapter: ChapterId) => void
  setTransitionProgress: (progress: number) => void
  transitionTo: (request: SceneTransitionRequest) => Promise<void>
  advance: (duration?: number) => Promise<void>
  setMuted: (muted: boolean) => void
}

const initialState: ExperienceState = {
  currentChapter: 'seed', chapterProgress: 0, overallProgress: 0,
  transitionPhase: 'idle', targetChapter: null, previousChapter: null, transitionProgress: 0, muted: true,
}

const ExperienceContext = createContext<ExperienceControllerValue | null>(null)
const clamp = (value: number) => Math.min(1, Math.max(0, value))
const delay = (duration: number) => new Promise<void>(resolve => window.setTimeout(resolve, duration * 1000))

export function ExperienceProvider({ children }: { children: ReactNode }) {
  const [state, setState] = useState(initialState)

  const setChapterProgress = useCallback((progress: number) => {
    setState(current => {
      const normalized = clamp(progress)
      return { ...current, chapterProgress: normalized, overallProgress: overallProgressFor(current.currentChapter, normalized) }
    })
  }, [])

  const setOverallProgress = useCallback((progress: number) => {
    setState(current => {
      const resolved = resolveExperienceProgress(progress)
      if (resolved.chapter === current.currentChapter) return { ...current, currentChapter: resolved.chapter, chapterProgress: resolved.chapterProgress, overallProgress: resolved.overallProgress, transitionPhase: 'idle', targetChapter: null, transitionProgress: 0 }
      return { ...current, currentChapter: resolved.chapter, chapterProgress: resolved.chapterProgress, overallProgress: resolved.overallProgress, previousChapter: current.currentChapter, targetChapter: resolved.chapter, transitionPhase: 'entering', transitionProgress: resolved.chapterProgress }
    })
  }, [])

  const enterChapter = useCallback((chapter: ChapterId) => setState(current => ({ ...current, currentChapter: chapter, targetChapter: chapter, transitionPhase: 'entering', transitionProgress: 0 })), [])
  const leaveChapter = useCallback((chapter: ChapterId) => setState(current => current.currentChapter === chapter ? { ...current, previousChapter: chapter, transitionPhase: 'leaving', transitionProgress: 0 } : current), [])
  const setTransitionProgress = useCallback((progress: number) => setState(current => ({ ...current, transitionProgress: clamp(progress) })), [])
  const setMuted = useCallback((muted: boolean) => setState(current => ({ ...current, muted })), [])

  const transitionTo = useCallback(async ({ to, duration = 0 }: SceneTransitionRequest) => {
    if (!chapterOrder.includes(to)) return
    setState(current => current.transitionPhase === 'idle'
      ? { ...current, transitionPhase: 'leaving', targetChapter: to }
      : current)
    if (duration > 0) await delay(duration)
    setState(current => ({ ...current, currentChapter: to, chapterProgress: 0, overallProgress: overallProgressFor(to), transitionPhase: 'entering', targetChapter: to, previousChapter: current.currentChapter, transitionProgress: 0 }))
    requestAnimationFrame(() => setState(current => ({ ...current, transitionPhase: 'idle' })))
  }, [])

  const advance = useCallback(async (duration?: number) => {
    const index = chapterOrder.indexOf(state.currentChapter)
    const next = chapterOrder[index + 1]
    if (next && state.transitionPhase === 'idle') await transitionTo({ to: next, duration })
  }, [state.currentChapter, state.transitionPhase, transitionTo])

  const value = useMemo(() => ({ ...state, setChapterProgress, setOverallProgress, enterChapter, leaveChapter, setTransitionProgress, transitionTo, advance, setMuted }), [state, setChapterProgress, setOverallProgress, enterChapter, leaveChapter, setTransitionProgress, transitionTo, advance, setMuted])
  return <ExperienceContext.Provider value={value}>{children}</ExperienceContext.Provider>
}

export function useExperienceController() {
  const controller = useContext(ExperienceContext)
  if (!controller) throw new Error('useExperienceController must be used within ExperienceProvider')
  return controller
}
