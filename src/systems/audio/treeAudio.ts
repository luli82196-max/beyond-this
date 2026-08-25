import type { TreeAudioCue } from '../../experience/tree/tree.types'
import type { ChapterAudioController } from './audio.types'

type CueSource = { src: string | null; loop: boolean; volume: number }

export const treeAudioSources: Record<TreeAudioCue, CueSource> = {
  wood_shift: { src: null, loop: false, volume: .14 },
  distant_transport: { src: null, loop: true, volume: .08 },
  forest_pause: { src: null, loop: true, volume: .1 },
}

export function createTreeAudio(): ChapterAudioController {
  let muted = true
  const players = new Map<TreeAudioCue, HTMLAudioElement>()
  const playerFor = (cue: TreeAudioCue) => {
    const source = treeAudioSources[cue]
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
    setMuted(value) { muted = value; players.forEach(player => { player.muted = value }) },
    async enterChapter(chapter) { if (chapter !== 'tree' || muted) return; (Object.keys(treeAudioSources) as TreeAudioCue[]).forEach(cue => { void playerFor(cue)?.play().catch(() => undefined) }) },
    async leaveChapter(chapter) { if (chapter !== 'tree') return; players.forEach(player => { player.pause(); player.currentTime = 0 }) },
    setTransitionProgress(progress) { players.forEach((player, cue) => { player.volume = treeAudioSources[cue].volume * Math.min(1, Math.max(0, progress)) }) },
    dispose() { players.forEach(player => { player.pause(); player.src = '' }); players.clear() },
  }
}
