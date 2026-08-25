import {
  roomSurfaceByMode,
  type FragmentId,
  type PresentationMode,
  type RoomSurface,
} from '../../content'

export interface RoomObjectBinding {
  readonly surface: RoomSurface
  readonly mode: PresentationMode
  readonly fragmentId: FragmentId
}

export const roomObjectBindings = {
  book: {
    surface: 'book',
    mode: 'book',
    fragmentId: 'bt-p03-visual-development-book',
  },
  projection: {
    surface: 'projection',
    mode: 'projection',
    fragmentId: 'bt-p03-motion-study',
  },
  interface: {
    surface: 'interface',
    mode: 'process',
    fragmentId: 'bt-p03-creative-decisions',
  },
} as const satisfies Readonly<Record<RoomSurface, RoomObjectBinding>>

/** Read-only lookup that preserves the process → interface content boundary. */
export function getRoomObjectBinding(surface: RoomSurface): RoomObjectBinding {
  return roomObjectBindings[surface]
}

export function isRoomObjectBindingCompatible(binding: RoomObjectBinding): boolean {
  return roomSurfaceByMode[binding.mode] === binding.surface
}
