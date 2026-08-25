export type SeedAudioCue = 'ambient' | 'soil' | 'water' | 'wet_soil' | 'subtle_environment_change'
type CueSource = { src: string | null; loop?: boolean; volume: number }

export const seedAudioSources: Record<SeedAudioCue, CueSource> = {
  ambient: { src: null, loop: true, volume: .22 },
  soil: { src: null, volume: .5 },
  water: { src: null, volume: .58 },
  wet_soil: { src: null, volume: .34 },
  subtle_environment_change: { src: null, volume: .16 },
}

export function createSeedAudio() {
  let muted = true
  const players = new Map<SeedAudioCue, HTMLAudioElement>()
  const playerFor = (cue: SeedAudioCue) => {
    const source = seedAudioSources[cue]
    if (!source.src) return null
    if (!players.has(cue)) {
      const audio = new Audio(source.src)
      audio.loop = source.loop ?? false
      audio.volume = source.volume
      players.set(cue, audio)
    }
    return players.get(cue)!
  }
  return {
    setMuted(value: boolean) { muted = value; players.forEach(player => { player.muted = value }) },
    play(cue: SeedAudioCue) { const player = playerFor(cue); if (!player || muted) return; if (cue !== 'ambient') player.currentTime = 0; void player.play().catch(() => undefined) },
    stop(cue: SeedAudioCue) { const player = players.get(cue); if (player) { player.pause(); player.currentTime = 0 } },
    dispose() { players.forEach(player => { player.pause(); player.src = '' }); players.clear() },
  }
}
