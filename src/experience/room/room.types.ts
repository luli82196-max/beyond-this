const clamp = (value: number) => Math.min(1, Math.max(0, value))
const range = (value: number, start: number, end: number) => clamp((value - start) / (end - start))
const smooth = (value: number, start: number, end: number) => {
  const t = range(value, start, end)
  return t * t * (3 - 2 * t)
}

export type RoomFrame = {
  threshold: number
  roomPresence: number
  naturalLight: number
  artificialLight: number
  curtainDrift: number
  bookAttention: number
  projectionAttention: number
  interfaceAttention: number
  titleOpacity: number
  exitFade: number
}

export type RoomAudioCue = 'room_ambience' | 'curtain_move' | 'projector_hum'

export function resolveRoomFrame(progress: number, reduced: boolean): RoomFrame {
  const p = clamp(progress)
  const roomPresence = smooth(p, 0, .2)
  return {
    threshold: 1 - smooth(p, .03, .2),
    roomPresence,
    naturalLight: 1 - smooth(p, .48, .9) * .18,
    artificialLight: smooth(p, .2, .82) * .58,
    curtainDrift: reduced ? 0 : smooth(p, .08, .72),
    bookAttention: smooth(p, .2, .42) * (1 - smooth(p, .52, .66) * .28),
    projectionAttention: smooth(p, .4, .63),
    interfaceAttention: smooth(p, .6, .82),
    titleOpacity: smooth(p, .08, .2) * (1 - smooth(p, .3, .43)),
    exitFade: smooth(p, .91, 1),
  }
}
