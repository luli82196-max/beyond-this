import type { MediaIntent, RoomInteractionTransition } from '../../content'
import { getRoomObjectBinding } from './roomObjectBindings'

/**
 * Converts semantic Room transitions into metadata-only media intent.
 * Reduced motion is deliberately absent: it may affect presentation timing,
 * never the meaning of an interaction or its media policy.
 */
export function resolveRoomMediaIntent(
  transition: RoomInteractionTransition,
): MediaIntent | null {
  if (!transition.changed) return null

  const { event } = transition
  const binding = getRoomObjectBinding(event.surface)

  if (event.type === 'leave') {
    return Object.freeze({
      type: 'release',
      surface: event.surface,
      fragmentId: binding.fragmentId,
    })
  }

  if (transition.current === 'deep') {
    return Object.freeze({
      type: 'prepare',
      surface: event.surface,
      fragmentId: binding.fragmentId,
    })
  }

  return null
}
