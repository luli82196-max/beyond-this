import {
  adaptBookPresentation,
  type BookVisualAdapterModel,
  type PresentationState,
} from '../../content'
import type { PresentationSnapshot } from './roomPresentationStateContainer'

export type RoomBookMountLayout = 'cover-preview' | 'page' | 'expanded-page'

export interface RoomBookReadOnlyMountModel {
  readonly kind: 'room-book-read-only-mount'
  readonly surface: 'book'
  readonly lifecycle: Exclude<PresentationState, 'closed'>
  readonly layout: RoomBookMountLayout
  readonly expanded: boolean
  readonly visual: BookVisualAdapterModel
}

const layoutByLifecycle = Object.freeze({
  preview: 'cover-preview',
  focused: 'page',
  deep: 'expanded-page',
} as const satisfies Readonly<Record<Exclude<PresentationState, 'closed'>, RoomBookMountLayout>>)

/**
 * Converts visual-adapter data into the read-only contract a future Room renderer can consume.
 * It owns no state, handlers, UI, or media resources.
 */
export function mountBookVisualModel(
  visual: BookVisualAdapterModel | null,
): RoomBookReadOnlyMountModel | null {
  if (!visual) return null

  return Object.freeze({
    kind: 'room-book-read-only-mount',
    surface: 'book',
    lifecycle: visual.state,
    layout: layoutByLifecycle[visual.state],
    expanded: visual.state === 'deep',
    visual,
  })
}

/**
 * Resolves one immutable mount from the current Room snapshot. Preview always
 * uses the cover; focused and deep states use the requested navigation page.
 */
export function resolveRoomBookReadOnlyMount(
  snapshot: PresentationSnapshot,
  pageIndex: number,
): RoomBookReadOnlyMountModel | null {
  if (
    snapshot.activeSurface !== 'book' ||
    snapshot.presentation?.surface !== 'book' ||
    snapshot.presentation.state === 'closed'
  ) return null

  const mountedPageIndex = snapshot.presentation.state === 'preview' ? 0 : pageIndex
  return mountBookVisualModel(adaptBookPresentation(snapshot.presentation, mountedPageIndex))
}
