import { audioAssetManifest, type AudioAssetDefinition, type AudioWorld } from './audioManifest'
import { AudioEventGuard, resolveWorldWeights, type ChapterWeights } from './audioFoundation'
export interface AudioPlayerLike { src: string; loop: boolean; preload: string; volume: number; paused: boolean; currentTime: number; play(): Promise<void>; pause(): void; removeAttribute(name: string): void; load(): void }
export type AudioPlayerFactory = (src: string) => AudioPlayerLike
export type AudioRuntimeSnapshot = { available: boolean; unlocked: boolean; muted: boolean; visible: boolean; playerCount: number; worlds: Record<AudioWorld, number> }
const ramp = (current: number, target: number, amount: number) => current + (target - current) * Math.min(1, Math.max(0, amount))
export class ExperienceAudioRuntime {
  private players = new Map<string, AudioPlayerLike>(); private unlocked = false; private muted = true; private visible = true
  private readonly eventGuard = new AudioEventGuard(3500)
  private previousProgress: number | null = null
  private worlds: Record<AudioWorld, number> = { seed: 0, forest: 0, tree: 0, room: 0, light: 0, 'room-light': 0 }
  constructor(private readonly manifest: readonly AudioAssetDefinition[] = audioAssetManifest, private readonly createPlayer: AudioPlayerFactory = src => new Audio(src)) {}
  get available() { return this.manifest.some(asset => asset.src !== null) }
  getSnapshot(): AudioRuntimeSnapshot { return { available: this.available, unlocked: this.unlocked, muted: this.muted, visible: this.visible, playerCount: this.players.size, worlds: { ...this.worlds } } }
  unlockFromUserGesture() { if (this.available) this.unlocked = true }
  setMuted(muted: boolean) { this.muted = muted }
  setVisible(visible: boolean) { this.visible = visible; if (!visible) for (const player of this.players.values()) player.pause() }
  update(weights: ChapterWeights, deltaSeconds = 1 / 60, overallProgress?: number, now = Date.now()) {
    this.worlds = resolveWorldWeights(weights)
    for (const asset of this.manifest) {
      if (asset.kind !== 'ambient' || !asset.src) continue
      const target = this.unlocked && !this.muted && this.visible ? asset.baseGain * this.worlds[asset.world] : 0
      const existing = this.players.get(asset.id)
      if (!existing && target <= .001) continue
      const player = existing ?? this.playerFor(asset)
      player.volume = ramp(player.volume, target, deltaSeconds / .18)
      if (target > .001 && player.paused) void player.play().catch(() => undefined)
      if ((!this.visible || (target === 0 && player.volume < .001)) && !player.paused) player.pause()
    }
    if (overallProgress !== undefined) {
      const previous = this.previousProgress
      this.previousProgress = overallProgress
      const crossedWoodShift = previous !== null && previous < .54 && overallProgress >= .54
      if (crossedWoodShift && this.unlocked && !this.muted && this.visible && this.eventGuard.canTrigger('tree-wood-shift', now, 'forward')) {
        this.playOneShot('tree-wood-shift')
      }
    }
  }
  private playOneShot(id: string) {
    const asset = this.manifest.find(candidate => candidate.id === id && candidate.kind === 'oneshot')
    if (!asset?.src) return
    const player = this.playerFor(asset)
    player.currentTime = 0
    player.volume = asset.baseGain
    void player.play().catch(() => undefined)
  }
  private playerFor(asset: AudioAssetDefinition) {
    const existing = this.players.get(asset.id); if (existing) return existing
    if (!asset.src) throw new Error('Cannot create an audio player without a source')
    const player = this.createPlayer(asset.src); player.loop = asset.loop; player.preload = asset.preload; player.volume = 0; this.players.set(asset.id, player); return player
  }
  dispose() { for (const player of this.players.values()) { player.pause(); player.removeAttribute('src'); player.load() }; this.players.clear() }
}
