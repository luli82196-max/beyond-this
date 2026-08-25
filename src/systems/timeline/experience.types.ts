export const chapterOrder = ['seed', 'forest', 'tree', 'room', 'light'] as const

export type ChapterId = typeof chapterOrder[number]
export type TransitionPhase = 'idle' | 'leaving' | 'entering'

export type ExperienceState = {
  currentChapter: ChapterId
  chapterProgress: number
  overallProgress: number
  transitionPhase: TransitionPhase
  targetChapter: ChapterId | null
  previousChapter: ChapterId | null
  transitionProgress: number
  muted: boolean
}

export type SceneTransitionRequest = {
  to: ChapterId
  duration?: number
}

export type ChapterLifecycle = {
  enterChapter: (chapter: ChapterId) => void
  leaveChapter: (chapter: ChapterId) => void
  setTransitionProgress: (progress: number) => void
}
