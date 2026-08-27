import type { ChapterId } from '../timeline/experience.types'
import type { AudioWorld } from './audioManifest'
export type ChapterWeights = Record<ChapterId, number>
export type WorldWeights = Record<AudioWorld, number>
export type ScrollDirection = 'forward' | 'reverse'
const clamp = (value: number) => Math.min(1, Math.max(0, value))
export const smoothstep = (value: number) => { const t = clamp(value); return t * t * (3 - 2 * t) }
export function resolveChapterWeights(overallProgress: number): ChapterWeights {
  const envelope = (start: number, end: number, feather = .025) => smoothstep((overallProgress - start + feather) / feather) * (1 - smoothstep((overallProgress - end) / feather))
  return { seed: envelope(0, .2), forest: envelope(.2, .45), tree: envelope(.45, .65), room: envelope(.65, .9, .035), light: smoothstep((overallProgress - .875) / .025) }
}
export function resolveWorldWeights(weights: ChapterWeights): WorldWeights {
  return { seed: weights.seed, forest: weights.forest, tree: weights.tree, room: 0, light: 0, 'room-light': clamp(weights.room + weights.light) }
}
export class AudioEventGuard {
  private records = new Map<string, { time: number; direction: ScrollDirection }>()
  constructor(private readonly cooldownMs = 900) {}
  canTrigger(id: string, now: number, direction: ScrollDirection, once = false) {
    const record = this.records.get(id)
    if (record && (once || record.direction !== direction || now - record.time < this.cooldownMs)) return false
    this.records.set(id, { time: now, direction }); return true
  }
  reset(id?: string) { if (id) this.records.delete(id); else this.records.clear() }
}
