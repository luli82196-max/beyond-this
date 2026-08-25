export type ForestAudioCue = 'wind' | 'leaves' | 'distant_nature'

export type ForestFrame = {
  scaleReveal: number
  cameraLift: number
  canopyAttention: number
  lightShift: number
  titleOpacity: number
  exitFade: number
}

export function resolveForestFrame(progress: number, reducedMotion: boolean): ForestFrame {
  const clamp = (value: number) => Math.min(1, Math.max(0, value))
  const smooth = (from: number, to: number, value: number) => {
    const t = clamp((value - from) / (to - from))
    return t * t * (3 - 2 * t)
  }
  const lift = smooth(.32, .82, progress)
  return {
    scaleReveal: smooth(0, .2, progress),
    cameraLift: reducedMotion ? lift * .72 : lift,
    canopyAttention: smooth(.42, .88, progress),
    lightShift: smooth(.18, .72, progress),
    titleOpacity: smooth(.08, .22, progress) * (1 - smooth(.42, .58, progress)),
    exitFade: smooth(.9, 1, progress),
  }
}
