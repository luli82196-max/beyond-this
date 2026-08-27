import { useSyncExternalStore } from 'react'

export type RoomSurfaceId = 'book' | 'process' | 'projection'

export interface RoomInteractionSessionSnapshot {
  readonly hoveredSurface: RoomSurfaceId | null
  readonly focusedSurface: RoomSurfaceId | null
  readonly activeSurface: RoomSurfaceId | null
  readonly hintDismissed: boolean
  readonly scrollGuardUntil: number
}

let snapshot: RoomInteractionSessionSnapshot = Object.freeze({
  hoveredSurface: null,
  focusedSurface: null,
  activeSurface: null,
  hintDismissed: false,
  scrollGuardUntil: 0,
})
const listeners = new Set<() => void>()

function update(next: Partial<RoomInteractionSessionSnapshot>) {
  snapshot = Object.freeze({ ...snapshot, ...next })
  listeners.forEach(listener => listener())
}

export const roomInteractionSession = Object.freeze({
  getSnapshot: () => snapshot,
  subscribe(listener: () => void) { listeners.add(listener); return () => listeners.delete(listener) },
  hover(surface: RoomSurfaceId | null) { update({ hoveredSurface: surface }) },
  focus(surface: RoomSurfaceId | null) { update({ focusedSurface: surface }) },
  open(surface: RoomSurfaceId) { update({ activeSurface: surface, focusedSurface: surface, hintDismissed: true }) },
  close() { update({ activeSurface: null, scrollGuardUntil: performance.now() + 180 }) },
  reset() { update({ hoveredSurface: null, focusedSurface: null, activeSurface: null, scrollGuardUntil: 0 }) },
})

export function useRoomInteractionSession() {
  return useSyncExternalStore(roomInteractionSession.subscribe, roomInteractionSession.getSnapshot)
}
