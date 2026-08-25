import type { MediaSource } from '../content.types'
import type { MediaLifecycleState } from './media.types'

export interface MediaElementLike {
  src: string
  muted: boolean
  loop: boolean
  preload: string
  playsInline: boolean
  crossOrigin: string | null
  load(): void
  play(): Promise<void>
  pause(): void
  removeAttribute(name: string): void
  addEventListener(type: string, listener: () => void, options?: AddEventListenerOptions): void
  removeEventListener(type: string, listener: () => void): void
}

export interface MediaRuntimeSnapshot {
  readonly lifecycle: MediaLifecycleState
  readonly source: MediaSource | null
  readonly fallback: boolean
  readonly fallbackReason: 'unsupported' | 'load-failed' | 'play-blocked' | null
  readonly ownershipCycle: number
}

export type MediaRuntimeListener = (snapshot: MediaRuntimeSnapshot) => void

export interface MinimalMediaRuntime {
  readonly prepare: (source: MediaSource) => MediaRuntimeSnapshot
  readonly load: () => MediaRuntimeSnapshot
  readonly play: () => Promise<MediaRuntimeSnapshot>
  readonly release: () => MediaRuntimeSnapshot
  readonly getSnapshot: () => MediaRuntimeSnapshot
  readonly getMediaElement: () => MediaElementLike | null
  readonly subscribe: (listener: MediaRuntimeListener) => () => void
}

const browserVideoFactory = (): MediaElementLike | null =>
  typeof document === 'undefined' ? null : document.createElement('video')

/** Owns exactly one on-demand video element for one Projection connection. */
export function createMinimalMediaRuntime(
  createMediaElement: () => MediaElementLike | null = browserVideoFactory,
): MinimalMediaRuntime {
  let lifecycle: MediaLifecycleState = 'idle'
  let source: MediaSource | null = null
  let element: MediaElementLike | null = null
  let fallbackReason: MediaRuntimeSnapshot['fallbackReason'] = null
  let ownershipCycle = 0
  const listeners = new Set<MediaRuntimeListener>()

  const snapshot = (): MediaRuntimeSnapshot => Object.freeze({
    lifecycle,
    source,
    fallback: fallbackReason !== null,
    fallbackReason,
    ownershipCycle,
  })
  const publish = () => {
    const next = snapshot()
    listeners.forEach((listener) => listener(next))
    return next
  }
  const setLifecycle = (next: MediaLifecycleState) => {
    lifecycle = next
    return publish()
  }
  const onReady = () => { if (lifecycle === 'loading') setLifecycle('ready') }
  const onError = () => {
    if (lifecycle === 'released') return
    fallbackReason = 'load-failed'
    setLifecycle('ready')
  }

  return Object.freeze({
    prepare(nextSource: MediaSource) {
      if (element && source?.src === nextSource.src && lifecycle !== 'released') return snapshot()
      if (element) this.release()
      source = Object.freeze({ ...nextSource })
      fallbackReason = null
      element = createMediaElement()
      ownershipCycle += 1
      if (!element) fallbackReason = 'unsupported'
      else {
        element.muted = true
        element.loop = true
        element.preload = 'metadata'
        element.playsInline = true
        element.crossOrigin = 'anonymous'
        element.src = source.src
        element.addEventListener('loadeddata', onReady)
        element.addEventListener('canplay', onReady)
        element.addEventListener('error', onError)
      }
      return setLifecycle('prepared')
    },
    load() {
      if (lifecycle !== 'prepared') return snapshot()
      if (!element) return setLifecycle('ready')
      lifecycle = 'loading'
      const next = publish()
      element.load()
      return next
    },
    async play() {
      if (lifecycle !== 'ready' || !element) return snapshot()
      try {
        await element.play()
        if (lifecycle === 'ready') return setLifecycle('playing')
      } catch {
        fallbackReason = 'play-blocked'
        return publish()
      }
      return snapshot()
    },
    release() {
      if (element) {
        element.pause()
        element.removeEventListener('loadeddata', onReady)
        element.removeEventListener('canplay', onReady)
        element.removeEventListener('error', onError)
        element.removeAttribute('src')
        element.load()
      }
      element = null
      source = null
      fallbackReason = null
      return setLifecycle('released')
    },
    getSnapshot: snapshot,
    getMediaElement: () => element,
    subscribe(listener: MediaRuntimeListener) {
      listeners.add(listener)
      return () => listeners.delete(listener)
    },
  })
}
