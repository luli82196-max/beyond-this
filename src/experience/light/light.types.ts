const clamp = (value: number) => Math.min(1, Math.max(0, value))
const smooth = (value: number, start: number, end: number) => {
  const t = clamp((value - start) / (end - start))
  return t * t * (3 - 2 * t)
}

export type LightFrame = {
  presence: number
  roomContinuity: number
  naturalLight: number
  artificialLight: number
  lightMaturity: number
  lookBack: number
  outsideConnection: number
  curtainDrift: number
  bookLight: number
  projectionLight: number
  interfaceLight: number
  titleOpacity: number
  finalNote: number
}

export type LightAudioCue = 'light_room' | 'outside_world' | 'final_ambience'

export function resolveLightFrame(progress: number, reduced: boolean): LightFrame {
  const p = clamp(progress)
  const presence = smooth(p, 0, .16)
  const lightMaturity = smooth(p, .12, .76)
  return {
    presence,
    roomContinuity: 1 - smooth(p, .04, .24),
    naturalLight: .78 + smooth(p, .42, .9) * .24,
    artificialLight: .54 + lightMaturity * .5,
    lightMaturity,
    lookBack: reduced ? smooth(p, .48, .86) * .24 : smooth(p, .4, .9) * .78,
    outsideConnection: smooth(p, .46, .96),
    curtainDrift: reduced ? 0 : presence,
    bookLight: smooth(p, .18, .58),
    projectionLight: smooth(p, .28, .7),
    interfaceLight: smooth(p, .4, .82),
    titleOpacity: smooth(p, .12, .28) * (1 - smooth(p, .7, .86)),
    finalNote: smooth(p, .78, .94),
  }
}
