import { assetBoundaryContract, createProjectionPresentation, createMinimalMediaRuntime, getProjectionAsset, type MediaElementLike } from '../../content'
import { afterTheSecondSunset } from '../../content/works/afterTheSecondSunset'
import { createRoomProjectionRuntimeInteractionConnection } from './roomProjectionRuntimeInteractionConnection'
import { resolveRoomProjectionRuntimeOutput } from './roomProjectionRuntimeOutput'
import { resolveRoomPresentation } from './roomPresentationBridge'

function assert(condition: unknown, message: string): asserts condition {
  if (!condition) throw new Error(message)
}

const fragment = afterTheSecondSunset.fragments.find((candidate) => candidate.id === 'bt-p03-motion-study')
assert(fragment, 'canonical Projection fragment must exist')
const direct = createProjectionPresentation(afterTheSecondSunset, fragment, 'deep')
assert(direct.content.motionIdentity === 'Motion Study', 'Projection content must preserve Motion Study identity')
assert(Object.isFrozen(direct) && Object.isFrozen(direct.content), 'Projection presentation must be immutable')

const transition = Object.freeze({
  event: Object.freeze({ surface: 'projection', type: 'activate', input: 'pointer' }),
  previous: 'focus', current: 'deep', changed: true,
} as const)
const presentation = resolveRoomPresentation(transition)
assert(presentation?.mode === 'projection', 'Projection content must resolve through the presentation bridge')
const intent = Object.freeze({ type: 'prepare', surface: 'projection', fragmentId: fragment.id } as const)
const asset = getProjectionAsset(fragment.id)
assert(asset, 'Projection asset must resolve through the Asset Boundary')
const runtimeSnapshot = Object.freeze({ lifecycle: 'prepared', source: asset.source, fallback: false, fallbackReason: null, ownershipCycle: 1 } as const)
const output = resolveRoomProjectionRuntimeOutput(presentation, intent, asset.source, runtimeSnapshot)
assert(output?.workId === afterTheSecondSunset.id && output.fragmentId === fragment.id, 'runtime output must preserve canonical identity')
assert(output.motionIdentity === 'Motion Study', 'runtime output must expose motion identity')
assert(output.playbackIntent.executePlayback === true && output.mediaSource?.src === asset.source.src, 'runtime output must expose Asset Boundary media to the runtime')
assert(Object.isFrozen(output) && Object.isFrozen(output.playbackIntent) && Object.isFrozen(output.mediaBoundaryIntent), 'runtime output must be immutable')
assert(assetBoundaryContract.projectionVideo.owner === 'media-runtime', 'Projection must retain media-runtime Asset Boundary ownership')

class FakeVideo implements MediaElementLike {
  src = ''; muted = false; loop = false; preload = ''; playsInline = false; crossOrigin: string | null = null
  paused = false; loadCount = 0; playCount = 0
  private listeners = new Map<string, Set<() => void>>()
  load() { this.loadCount += 1; if (this.src) this.emit('loadeddata') }
  async play() { this.playCount += 1 }
  pause() { this.paused = true }
  removeAttribute(name: string) { if (name === 'src') this.src = '' }
  addEventListener(type: string, listener: () => void) { const set = this.listeners.get(type) ?? new Set(); set.add(listener); this.listeners.set(type, set) }
  removeEventListener(type: string, listener: () => void) { this.listeners.get(type)?.delete(listener) }
  emit(type: string) { this.listeners.get(type)?.forEach((listener) => listener()) }
}

let created = 0
const videos: FakeVideo[] = []
const mediaRuntime = createMinimalMediaRuntime(() => { created += 1; const video = new FakeVideo(); videos.push(video); return video })
const prepared = mediaRuntime.prepare(asset.source)
assert(prepared.lifecycle === 'prepared' && prepared.source?.src === asset.source.src, 'asset must prepare the media runtime')
mediaRuntime.load()
assert(mediaRuntime.getSnapshot().lifecycle === 'ready', 'load readiness must advance loading to ready')
await mediaRuntime.play()
assert(mediaRuntime.getSnapshot().lifecycle === 'playing' && videos[0].playCount === 1, 'ready media must play')
mediaRuntime.prepare(asset.source)
assert(created === 1, 'repeated prepare must preserve single instance ownership')
mediaRuntime.release()
assert(mediaRuntime.getSnapshot().lifecycle === 'released' && mediaRuntime.getMediaElement() === null && videos[0].paused && videos[0].src === '', 'release must stop and detach the media instance')

const fallbackRuntime = createMinimalMediaRuntime(() => null)
fallbackRuntime.prepare(asset.source); fallbackRuntime.load()
assert(fallbackRuntime.getSnapshot().lifecycle === 'ready' && fallbackRuntime.getSnapshot().fallback, 'unsupported playback must retain a static fallback')

const connectionMedia = createMinimalMediaRuntime(() => { created += 1; const video = new FakeVideo(); videos.push(video); return video })
const runtime = createRoomProjectionRuntimeInteractionConnection(connectionMedia)
let notifications = 0
runtime.subscribe(() => { notifications += 1 })
runtime.connect()
const focused = runtime.focus()
assert(focused?.lifecycle === 'focused' && focused.playbackIntent.action === 'none' && focused.mediaBoundaryIntent === null, 'focus must expose Projection identity without preparing playback')
assert(runtime.open()?.lifecycle === 'open', 'open must produce prepared playback intent')
await Promise.resolve()
assert(runtime.getOutput()?.mediaRuntime.lifecycle === 'playing', 'open must prepare, load, and play through the media runtime')
assert(runtime.close() === null, 'close must clean runtime output')
assert(connectionMedia.getSnapshot().lifecycle === 'released' && connectionMedia.getMediaElement() === null, 'close must release media ownership')
assert(runtime.open()?.lifecycle === 'open', 'reopen must return to deterministic open state')
const visibleCycle = connectionMedia.getSnapshot().ownershipCycle
runtime.setPageVisible(false)
assert(connectionMedia.getSnapshot().lifecycle === 'released' && connectionMedia.getMediaElement() === null, 'hidden pages must release Projection media')
runtime.setPageVisible(true)
await Promise.resolve()
assert(connectionMedia.getSnapshot().ownershipCycle === visibleCycle + 1, 'visible open Projection must restore exactly one ownership cycle')
assert(connectionMedia.getSnapshot().lifecycle === 'playing', 'visible open Projection must resume through the existing runtime')
assert(runtime.switchSurface('interface') === null, 'surface switch must release Projection output')
assert(connectionMedia.getSnapshot().lifecycle === 'released', 'surface switch must clean media runtime state')
assert(runtime.getOutput() === null, 'surface switch cleanup must persist')
const firstCycle = runtime.getOwnership().connectionCycle
runtime.disconnect()
assert(!runtime.getOwnership().connected && !runtime.getOwnership().presentationSubscription && !runtime.getOwnership().orchestrationSubscription, 'disconnect must release owned subscriptions')
runtime.connect()
assert(runtime.getOwnership().connectionCycle === firstCycle + 1, 'reconnect must create a fresh ownership cycle')
assert(runtime.open()?.fragmentId === fragment.id, 'reconnect must restore canonical Projection ownership')
assert(connectionMedia.getSnapshot().ownershipCycle >= 3, 'reconnect must allocate a fresh media ownership cycle')
runtime.disconnect()
assert(runtime.getOwnership().subscriberCount === 0 && runtime.getOutput() === null, 'final disconnect must release subscribers and state')
assert(notifications > 0, 'connected runtime must publish immutable output changes')

console.log('Phase MVP-01.2.2 Projection Runtime Boundary tests passed.')
