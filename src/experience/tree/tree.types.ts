export type TreeAudioCue = 'wood_shift' | 'distant_transport' | 'forest_pause'

export type TreeFrame = {
  forestPresence: number
  timeVeil: number
  restingTree: number
  transportPresence: number
  transportTravel: number
  roomThreshold: number
  titleOpacity: number
  exitFade: number
}

const clamp = (value: number) => Math.min(1, Math.max(0, value))
const smooth = (from: number, to: number, value: number) => {
  const t = clamp((value - from) / (to - from))
  return t * t * (3 - 2 * t)
}

export function resolveTreeFrame(progress: number, reducedMotion: boolean): TreeFrame {
  const forestPresence = 1 - smooth(.18, .38, progress)
  const restingTree = smooth(.3, .48, progress) * (1 - smooth(.7, .86, progress))
  const transportPresence = smooth(.55, .7, progress) * (1 - smooth(.86, .97, progress))
  return {
    forestPresence,
    timeVeil: smooth(.2, .31, progress) * (1 - smooth(.38, .49, progress)),
    restingTree,
    transportPresence,
    transportTravel: reducedMotion ? .25 + smooth(.57, .91, progress) * .33 : smooth(.57, .91, progress),
    roomThreshold: smooth(.82, 1, progress),
    titleOpacity: smooth(.05, .16, progress) * (1 - smooth(.3, .44, progress)),
    exitFade: smooth(.94, 1, progress),
  }
}
