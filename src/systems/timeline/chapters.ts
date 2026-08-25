import type { ChapterId } from './experience.types'

export type ChapterDefinition = {
  id: ChapterId
  index: number
  status: 'implemented' | 'placeholder'
  range: readonly [number, number]
}

export const chapters: readonly ChapterDefinition[] = [
  { id: 'seed', index: 0, status: 'implemented', range: [0, .2] },
  { id: 'forest', index: 1, status: 'implemented', range: [.2, .45] },
  { id: 'tree', index: 2, status: 'implemented', range: [.45, .65] },
  { id: 'room', index: 3, status: 'implemented', range: [.65, .9] },
  { id: 'light', index: 4, status: 'implemented', range: [.9, 1] },
]

export const clampProgress = (value: number) => Math.min(1, Math.max(0, value))

export function resolveExperienceProgress(value: number) {
  const overallProgress = clampProgress(value)
  const chapter = chapters.find(({ range: [start, end] }) => overallProgress >= start && (overallProgress < end || end === 1)) ?? chapters[chapters.length - 1]
  const [start, end] = chapter.range
  return { overallProgress, chapter: chapter.id, chapterProgress: clampProgress((overallProgress - start) / (end - start)) }
}

export function overallProgressFor(chapter: ChapterId, chapterProgress = 0) {
  const definition = chapters.find(item => item.id === chapter)!
  return definition.range[0] + clampProgress(chapterProgress) * (definition.range[1] - definition.range[0])
}
