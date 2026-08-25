import type { RoomAudioCue } from '../../experience/room/room.types'
import type { ChapterAudioController } from './audio.types'

type CueSource = { src: string | null; loop: boolean; volume: number }

export const roomAudioSources: Record<RoomAudioCue, CueSource> = {
  room_ambience: { src: null, loop: true, volume: .09 },
  curtain_move: { src: null, loop: true, volume: .045 },
  projector_hum: { src: null, loop: true, volume: .055 },
}

export function createRoomAudio(): ChapterAudioController {
  let muted = true
  const players = new Map<RoomAudioCue, HTMLAudioElement>()
  const playerFor = (cue: RoomAudioCue) => {
    const source = roomAudioSources[cue]
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
    async enterChapter(chapter) { if (chapter !== 'room' || muted) return; (Object.keys(roomAudioSources) as RoomAudioCue[]).forEach(cue => { void playerFor(cue)?.play().catch(() => undefined) }) },
    async leaveChapter(chapter) { if (chapter !== 'room') return; players.forEach(player => { player.pause(); player.currentTime = 0 }) },
    setTransitionProgress(progress) { players.forEach((player, cue) => { player.volume = roomAudioSources[cue].volume * Math.min(1, Math.max(0, progress)) }) },
    dispose() { players.forEach(player => { player.pause(); player.src = '' }); players.clear() },
  }
}
