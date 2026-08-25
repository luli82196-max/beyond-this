import type { RoomInteractionEvent, RoomSurface } from '../../content'
import { createRoomInteractionController } from './roomInteractionController'
import { createRoomPresentationConnection } from './roomPresentationConnection'
import {
  createRoomBookDerivedSnapshotConnection,
  type RoomBookDerivedSnapshotConnection,
} from './roomBookDerivedSnapshotConnection'
import type { BookNavigationAction, RoomBookMountSnapshot } from './roomBookNavigationSnapshotDerivation'

export interface RoomBookDerivedConnectionIntegrationHarness {
  readonly derived: RoomBookDerivedSnapshotConnection
  readonly connect: () => RoomBookMountSnapshot
  readonly disconnect: () => void
  readonly navigate: (action: BookNavigationAction) => RoomBookMountSnapshot
  readonly dispatch: (surface: RoomSurface, type: RoomInteractionEvent['type']) => void
}

/**
 * Pure integration harness for the complete controller-to-Book-mount chain.
 * It creates no UI, renderer, DOM listener, media request, or Projection path.
 */
export function createRoomBookDerivedConnectionIntegrationHarness(): RoomBookDerivedConnectionIntegrationHarness {
  const controller = createRoomInteractionController()
  const presentation = createRoomPresentationConnection(controller)
  const derived = createRoomBookDerivedSnapshotConnection(presentation)

  return Object.freeze({
    derived,
    connect() {
      presentation.connect()
      return derived.connect()
    },
    disconnect() {
      derived.disconnect()
      presentation.disconnect()
    },
    navigate: derived.navigate,
    dispatch(surface: RoomSurface, type: RoomInteractionEvent['type']) {
      controller.dispatch(Object.freeze({ surface, type }))
    },
  })
}
