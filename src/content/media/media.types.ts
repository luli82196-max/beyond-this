import type { FragmentId, RoomSurface } from '../content.types'

export type MediaIntentType = 'prepare' | 'release'
export type MediaLifecycleState = 'idle' | 'prepared' | 'loading' | 'ready' | 'playing' | 'released'

/** A metadata-only request. It never contains a URL or allocated media resource. */
export interface MediaIntent {
  readonly type: MediaIntentType
  readonly fragmentId: FragmentId
  readonly surface: RoomSurface
}

export interface MediaBoundaryEntry {
  readonly fragmentId: FragmentId
  readonly surface: RoomSurface
  readonly state: MediaLifecycleState
}

export interface MediaBoundaryTransition {
  readonly intent: MediaIntent
  readonly previous: MediaLifecycleState
  readonly current: MediaLifecycleState
  readonly changed: boolean
}

export type MediaBoundarySnapshot = Readonly<Record<RoomSurface, MediaBoundaryEntry>>
export type MediaBoundaryListener = (transition: MediaBoundaryTransition) => void
