import type {
  RoomPresentationModel,
  RoomInteractionTransition,
  RoomSurface,
} from '../../content'
import { resolveRoomPresentation } from './roomPresentationBridge'

export interface PresentationSnapshot {
  readonly activeSurface: RoomSurface | null
  readonly presentation: RoomPresentationModel | null
}

export type PresentationStateListener = (
  snapshot: PresentationSnapshot,
  previous: PresentationSnapshot,
) => void

export interface PresentationStateContainer {
  readonly dispatch: (transition: RoomInteractionTransition) => PresentationSnapshot
  readonly getSnapshot: () => PresentationSnapshot
  readonly subscribe: (listener: PresentationStateListener) => () => void
}

function notifyListeners(
  listeners: ReadonlySet<PresentationStateListener>,
  snapshot: PresentationSnapshot,
  previous: PresentationSnapshot,
): void {
  listeners.forEach((listener) => {
    try {
      listener(snapshot, previous)
    } catch {
      // A presentation observer never owns the state commit or another observer.
    }
  })
}

const initialSnapshot: PresentationSnapshot = Object.freeze({
  activeSurface: null,
  presentation: null,
})

function closePresentation(model: RoomPresentationModel): RoomPresentationModel {
  if (model.state === 'closed') return model
  return Object.freeze({ ...model, state: 'closed' })
}

/**
 * Owns Room presentation state. It consumes semantic Room transitions,
 * installs no listeners, and never dispatches media work.
 */
export function createPresentationStateContainer(): PresentationStateContainer {
  let snapshot = initialSnapshot
  const listeners = new Set<PresentationStateListener>()

  return Object.freeze({
    dispatch(transition: RoomInteractionTransition) {
      if (!transition.changed) return snapshot

      let resolved: RoomPresentationModel | null
      try {
        resolved = resolveRoomPresentation(transition)
      } catch {
        // Resolution is transactional: a failed bridge read cannot mutate state.
        return snapshot
      }
      let next = snapshot

      if (resolved) {
        next = Object.freeze({
          activeSurface: resolved.state === 'closed' ? null : resolved.surface,
          presentation: resolved,
        })
      } else if (
        snapshot.presentation &&
        snapshot.activeSurface !== null &&
        transition.event.surface !== snapshot.activeSurface
      ) {
        next = Object.freeze({
          activeSurface: null,
          presentation: closePresentation(snapshot.presentation),
        })
      }

      if (
        next.activeSurface === snapshot.activeSurface &&
        next.presentation === snapshot.presentation
      ) return snapshot

      const previous = snapshot
      snapshot = next
      notifyListeners(listeners, snapshot, previous)
      return snapshot
    },
    getSnapshot: () => snapshot,
    subscribe(listener: PresentationStateListener) {
      listeners.add(listener)
      return () => listeners.delete(listener)
    },
  })
}
