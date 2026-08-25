import type {
  MediaBoundary,
  MediaBoundaryTransition,
  MediaIntent,
  RoomInteractionTransition,
} from '../../content'
import { resolveRoomMediaIntent } from './roomExperiencePolicy'

export interface RoomOrchestrationResult {
  readonly interaction: RoomInteractionTransition
  readonly intent: MediaIntent | null
  readonly media: MediaBoundaryTransition | null
}

export interface RoomInteractionOrchestrator {
  readonly handleTransition: (transition: RoomInteractionTransition) => RoomOrchestrationResult
}

/**
 * Coordinates semantic transitions and the metadata-only media boundary.
 * It owns no input listener, scene integration, source URL, or media resource.
 */
export function createRoomInteractionOrchestrator(
  mediaBoundary: MediaBoundary,
): RoomInteractionOrchestrator {
  return Object.freeze({
    handleTransition(interaction: RoomInteractionTransition) {
      const intent = resolveRoomMediaIntent(interaction)
      const media = intent ? mediaBoundary.dispatch(intent) : null
      return Object.freeze({ interaction, intent, media })
    },
  })
}
