import type { ChapterId } from '../timeline/experience.types'

export interface ChapterAudioController {
  setMuted(muted: boolean): void
  enterChapter(chapter: ChapterId): Promise<void>
  leaveChapter(chapter: ChapterId): Promise<void>
  setTransitionProgress(progress: number): void
  dispose(): void
}
