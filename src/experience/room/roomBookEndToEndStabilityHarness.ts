import type { RoomInteractionEvent, RoomSurface } from '../../content'
import { createRoomBookDerivedConnectionIntegrationHarness } from './roomBookDerivedConnectionIntegrationHarness'
import { createBookRendererIntegrationBoundary } from './roomBookRendererIntegrationBoundary'
import { resolveBookRendererPrototype } from './roomBookRendererPrototype'
import {
  resolveBookVisualPresentationState,
  type BookVisualPresentationState,
} from './roomBookVisualPresentationState'
import type { BookNavigationAction } from './roomBookNavigationSnapshotDerivation'

/** Logic-only composition of the complete Book data and mount lifecycle chain. */
export function createRoomBookEndToEndStabilityHarness() {
  const room = createRoomBookDerivedConnectionIntegrationHarness()
  const renderer = createBookRendererIntegrationBoundary()
  let visual: BookVisualPresentationState | null = null
  let unsubscribe: (() => void) | null = null

  const consumeSnapshot = (): void => {
    const next = resolveBookVisualPresentationState(room.derived.getSnapshot().mount, visual)
    visual = next
    renderer.consume(resolveBookRendererPrototype(next))
  }

  return Object.freeze({
    room,
    renderer,
    connect() {
      if (unsubscribe) return renderer.getLifecycle()
      renderer.connect()
      room.connect()
      unsubscribe = room.derived.subscribe(consumeSnapshot)
      consumeSnapshot()
      return renderer.getLifecycle()
    },
    disconnect() {
      if (!unsubscribe) return
      unsubscribe()
      unsubscribe = null
      room.disconnect()
      visual = null
      renderer.disconnect()
    },
    dispatch(surface: RoomSurface, type: RoomInteractionEvent['type']) {
      room.dispatch(surface, type)
    },
    navigate(action: BookNavigationAction) {
      room.navigate(action)
    },
    getVisualState: () => visual,
  })
}
