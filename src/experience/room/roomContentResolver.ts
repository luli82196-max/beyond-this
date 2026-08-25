import {
  getInteractionState,
  getRoomContentPlacements,
  getWorkById,
  type ResolvedRoomContent,
  type RoomSurface,
  type WorkFragment,
} from '../../content'

/** Resolves the first ordered fragment attached to an existing Room surface. */
export function getFragmentBySurface(surface: RoomSurface): WorkFragment | undefined {
  return resolveRoomContent(surface)?.fragment
}

/**
 * Read-only bridge between Room's spatial names and the content registry.
 * Resolution is metadata-only and defaults to the non-interactive passing state.
 */
export function resolveRoomContent(surface: RoomSurface): ResolvedRoomContent | undefined {
  const placement = getRoomContentPlacements().find((candidate) => candidate.surface === surface)
  if (!placement) return undefined

  const work = getWorkById(placement.workId)
  const fragment = work?.fragments.find((candidate) => candidate.id === placement.fragmentId)
  if (!work || !fragment) return undefined

  return {
    surface,
    work,
    fragment,
    placement,
    interaction: getInteractionState(),
  }
}
