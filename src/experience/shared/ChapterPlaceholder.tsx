import type { ChapterId } from '../../systems/timeline/experience.types'

export default function ChapterPlaceholder({ chapter }: { chapter: Exclude<ChapterId, 'seed'> }) {
  return <main className="chapter-placeholder" data-chapter={chapter} aria-label={`${chapter} chapter placeholder`} />
}
