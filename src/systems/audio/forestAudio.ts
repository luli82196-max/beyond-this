import type { ForestAudioCue } from '../../experience/forest/forest.types'
import type { ChapterAudioController } from './audio.types'

type CueSource = { src: string | null; loop: boolean; volume: number }

export const forestAudioSources: Record<ForestAudioCue, CueSource> = {
  wind: { src: null, loop: true, volume: .18 },
  leaves: { src: null, loop: true, volume: .12 },
  distant_nature: { src: null, loop: true, volume: .08 },
}

export function createForestAudio(): ChapterAudioController {
  let muted = true
  const players = new Map<ForestAudioCue, HTMLAudioElement>()
  const playerFor = (cue: ForestAudioCue) => {
    const source = forestAudioSources[cue]
    if (!source.src) return null
    if (!players.has(cue)) {
      const audio = new Audio(source.src)
      audio.loop = source.loop
      audio.volume = source.volume
      players.set(cue, audio)
    }
    return players.get(cue)!
  }
  return {
    setMuted(value: boolean) { muted = value; players.forEach(player => { player.muted = value }) },
    async enterChapter(chapter) { if (chapter !== 'forest' || muted) return; (Object.keys(forestAudioSources) as ForestAudioCue[]).forEach(cue => { void playerFor(cue)?.play().catch(() => undefined) }) },
    async leaveChapter(chapter) { if (chapter !== 'forest') return; players.forEach(player => { player.pause(); player.currentTime = 0 }) },
    setTransitionProgress(progress: number) { players.forEach((player, cue) => { player.volume = forestAudioSources[cue].volume * Math.min(1, Math.max(0, progress)) }) },
    dispose() { players.forEach(player => { player.pause(); player.src = '' }); players.clear() },
  }
}
