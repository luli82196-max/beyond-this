import type { PresentationMode, RoomContentPlacement, RoomSurface, WorkFragment } from './content.types'
import { contentRegistry } from './content.registry'

export const roomSurfaceByMode = {
  book: 'book', projection: 'projection', process: 'interface',
} as const satisfies Record<PresentationMode, RoomSurface>

export function getRoomContentPlacements(): readonly RoomContentPlacement[] {
  return contentRegistry.flatMap((work) => work.fragments.map((fragment) => ({
    workId: work.id,
    fragmentId: fragment.id,
    mode: fragment.placement.mode,
    surface: roomSurfaceByMode[fragment.placement.mode],
    slot: fragment.placement.slot,
    order: fragment.placement.order ?? 0,
  }))).sort((a, b) => a.order - b.order)
}

export function getFragmentsForMode(mode: PresentationMode): readonly WorkFragment[] {
  return contentRegistry.flatMap((work) => work.fragments)
    .filter((fragment) => fragment.placement.mode === mode)
    .sort((a, b) => (a.placement.order ?? 0) - (b.placement.order ?? 0))
}
