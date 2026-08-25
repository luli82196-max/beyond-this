import { useEffect, useMemo } from 'react'
import { forestAudioSources } from './forestAudio'
import { treeAudioSources } from './treeAudio'
import { roomAudioSources } from './roomAudio'
import { lightAudioSources } from './lightAudio'
import { seedAudioSources } from './seedAudio'
import type { ChapterId } from '../timeline/experience.types'

type Source = { src: string | null; loop?: boolean; volume: number }
type Layer = { chapter: ChapterId; source: Source; player: HTMLAudioElement }
const sources: Record<ChapterId, readonly Source[]> = {
  seed: Object.values(seedAudioSources), forest: Object.values(forestAudioSources),
  tree: Object.values(treeAudioSources), room: Object.values(roomAudioSources), light: Object.values(lightAudioSources),
}
export const audioAvailable = Object.values(sources).some(chapter => chapter.some(source => Boolean(source.src)))
const clamp = (value: number) => Math.min(1, Math.max(0, value))
const smooth = (value: number) => { const t = clamp(value); return t * t * (3 - 2 * t) }

class ExperienceAudioDirector {
  private layers: Layer[] = []
  private muted = true
  constructor() {
    for (const [chapter, chapterSources] of Object.entries(sources) as [ChapterId, readonly Source[]][]) {
      for (const source of chapterSources) if (source.src && source.loop) {
        const player = new Audio(source.src); player.loop = source.loop ?? false; player.volume = 0
        this.layers.push({ chapter, source, player })
      }
    }
  }
  update(muted: boolean, weights: Record<ChapterId, number>) {
    this.muted = muted
    for (const layer of this.layers) {
      layer.player.muted = muted
      layer.player.volume = layer.source.volume * smooth(weights[layer.chapter])
      if (!muted && layer.player.volume > .001 && layer.player.paused) void layer.player.play().catch(() => undefined)
      if ((muted || layer.player.volume <= .001) && !layer.player.paused) layer.player.pause()
    }
  }
  dispose() { for (const { player } of this.layers) { player.pause(); player.src = '' }; this.layers = [] }
}

export function useExperienceAudio(overallProgress: number, muted: boolean) {
  const director = useMemo(() => new ExperienceAudioDirector(), [])
  useEffect(() => {
    const envelope = (start: number, end: number, feather = .025) => smooth((overallProgress - start + feather) / feather) * (1 - smooth((overallProgress - end) / feather))
    director.update(muted, {
      seed: envelope(0, .2), forest: envelope(.2, .45), tree: envelope(.45, .65),
      room: envelope(.65, .9, .035), light: smooth((overallProgress - .875) / .025),
    })
  }, [director, muted, overallProgress])
  useEffect(() => () => director.dispose(), [director])
}
