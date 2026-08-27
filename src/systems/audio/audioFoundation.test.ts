import { strict as assert } from 'node:assert'
import { AudioEventGuard, resolveChapterWeights, resolveWorldWeights } from './audioFoundation'
import { audioAssetManifest } from './audioManifest'
import { ExperienceAudioRuntime, type AudioPlayerLike } from './audioRuntime'

assert.equal(resolveWorldWeights({ seed: 0, forest: 0, tree: 0, room: .4, light: .7 })['room-light'], 1)
assert.equal(resolveWorldWeights(resolveChapterWeights(.9))['room-light'], 1)

let created = 0
const factory = (src: string): AudioPlayerLike => ({ src, loop: false, preload: '', volume: 0, paused: true,
  async play() { this.paused = false }, pause() { this.paused = true }, removeAttribute() { this.src = '' }, load() {} })
const countedFactory = (src: string) => { created += 1; return factory(src) }
const silent = new ExperienceAudioRuntime(audioAssetManifest, countedFactory)
silent.unlockFromUserGesture(); silent.setMuted(false); silent.update(resolveChapterWeights(.7))
assert.equal(created, 0); assert.equal(silent.getSnapshot().playerCount, 0); assert.equal(silent.getSnapshot().unlocked, false)

const futureManifest = [{ ...audioAssetManifest[6], src: '/audio/room-light.ogg' }]
const runtime = new ExperienceAudioRuntime(futureManifest, countedFactory)
runtime.unlockFromUserGesture(); runtime.setMuted(false)
runtime.update({ seed: 0, forest: 0, tree: 0, room: 1, light: 0 }, 1)
runtime.update({ seed: 0, forest: 0, tree: 0, room: 0, light: 1 }, 1)
assert.equal(runtime.getSnapshot().playerCount, 1)
runtime.setVisible(false); runtime.update({ seed: 0, forest: 0, tree: 0, room: 0, light: 1 }, 1)
runtime.setVisible(true); runtime.update({ seed: 0, forest: 0, tree: 0, room: 0, light: 1 }, 1)
assert.equal(runtime.getSnapshot().playerCount, 1)

const guard = new AudioEventGuard(500)
assert.equal(guard.canTrigger('wood', 1000, 'forward'), true)
assert.equal(guard.canTrigger('wood', 1100, 'forward'), false)
assert.equal(guard.canTrigger('wood', 2000, 'reverse'), false)
assert.equal(guard.canTrigger('wood', 2000, 'forward'), true)
assert.equal(guard.canTrigger('drop', 1, 'forward', true), true)
assert.equal(guard.canTrigger('drop', 5000, 'forward', true), false)
console.log('audio foundation tests passed')
