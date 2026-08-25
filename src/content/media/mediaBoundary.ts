import type { RoomSurface } from '../content.types'
import { roomObjectBindings } from '../../experience/room/roomObjectBindings'
import type {
  MediaBoundaryEntry,
  MediaBoundaryListener,
  MediaBoundarySnapshot,
  MediaBoundaryTransition,
  MediaIntent,
  MediaLifecycleState,
} from './media.types'

const surfaces = ['book', 'projection', 'interface'] as const satisfies readonly RoomSurface[]

export interface MediaBoundary {
  readonly dispatch: (intent: MediaIntent) => MediaBoundaryTransition
  readonly getState: (surface: RoomSurface) => MediaBoundaryEntry
  readonly getSnapshot: () => MediaBoundarySnapshot
  readonly subscribe: (listener: MediaBoundaryListener) => () => void
}

function freezeEntry(surface: RoomSurface, state: MediaLifecycleState): MediaBoundaryEntry {
  return Object.freeze({ surface, fragmentId: roomObjectBindings[surface].fragmentId, state })
}

/**
 * Records preparation and release intent only. No branch creates media elements,
 * decoders, textures, source requests, or other resource-owning objects.
 */
export function createMediaBoundary(): MediaBoundary {
  const states: Record<RoomSurface, MediaLifecycleState> = {
    book: 'idle',
    projection: 'idle',
    interface: 'idle',
  }
  const listeners = new Set<MediaBoundaryListener>()

  const getState = (surface: RoomSurface) => freezeEntry(surface, states[surface])
  const getSnapshot = (): MediaBoundarySnapshot => Object.freeze(
    Object.fromEntries(surfaces.map((surface) => [surface, getState(surface)])) as Record<RoomSurface, MediaBoundaryEntry>,
  )

  return Object.freeze({
    dispatch(intent: MediaIntent) {
      const binding = roomObjectBindings[intent.surface]
      if (binding.fragmentId !== intent.fragmentId) {
        throw new Error(`Media intent fragment does not match Room surface: ${intent.surface}`)
      }

      const previous = states[intent.surface]
      const current: MediaLifecycleState = intent.type === 'prepare' ? 'prepared' : 'released'
      const transition: MediaBoundaryTransition = Object.freeze({
        intent: Object.freeze({ ...intent }),
        previous,
        current,
        changed: previous !== current,
      })

      if (transition.changed) {
        states[intent.surface] = current
        listeners.forEach((listener) => listener(transition))
      }
      return transition
    },
    getState,
    getSnapshot,
    subscribe(listener: MediaBoundaryListener) {
      listeners.add(listener)
      return () => listeners.delete(listener)
    },
  })
}

