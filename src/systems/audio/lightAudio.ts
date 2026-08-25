import type { LightAudioCue } from '../../experience/light/light.types'
import type { ChapterAudioController } from './audio.types'

type CueSource = { src: string | null; loop: boolean; volume: number }
export const lightAudioSources: Record<LightAudioCue, CueSource> = {
  light_room: { src: null, loop: true, volume: .08 },
  outside_world: { src: null, loop: true, volume: .075 },
  final_ambience: { src: null, loop: true, volume: .06 },
}

export function createLightAudio(): ChapterAudioController {
  let muted = true
  const players = new Map<LightAudioCue, HTMLAudioElement>()
  const playerFor = (cue: LightAudioCue) => {
    const source = lightAudioSources[cue]
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
    async enterChapter(chapter) { if (chapter !== 'light' || muted) return; (Object.keys(lightAudioSources) as LightAudioCue[]).forEach(cue => { void playerFor(cue)?.play().catch(() => undefined) }) },
    async leaveChapter(chapter) { if (chapter !== 'light') return; players.forEach(player => { player.pause(); player.currentTime = 0 }) },
    setTransitionProgress(progress) { players.forEach((player, cue) => { player.volume = lightAudioSources[cue].volume * Math.min(1, Math.max(0, progress)) }) },
    dispose() { players.forEach(player => { player.pause(); player.src = '' }); players.clear() },
  }
}
