import type { BookPresentationModel, RoomPresentationModel } from '../../content'
import { adaptBookPresentation } from '../../content'
import { mountBookVisualModel, type RoomBookReadOnlyMountModel } from './roomBookReadOnlyMount'
import type { PresentationSnapshot } from './roomPresentationStateContainer'

export type BookNavigationAction = 'next' | 'previous' | 'close' | 'reopen'

export interface BookNavigationState {
  readonly status: 'open' | 'closed'
  readonly pageIndex: number
}

export interface RoomBookMountSnapshot {
  readonly navigation: BookNavigationState
  readonly mount: RoomBookReadOnlyMountModel | null
}

export const initialBookNavigationState: BookNavigationState = Object.freeze({
  status: 'open',
  pageIndex: 0,
})

/** Pure, identity-preserving navigation reducer. Reopen always starts at the cover. */
export function reduceBookNavigation(
  state: BookNavigationState,
  action: BookNavigationAction,
  pageCount: number,
): BookNavigationState {
  if (!Number.isInteger(pageCount) || pageCount < 1) return state

  if (action === 'reopen') {
    return state.status === 'open' && state.pageIndex === 0
      ? state
      : initialBookNavigationState
  }
  if (action === 'close') {
    return state.status === 'closed'
      ? state
      : Object.freeze({ status: 'closed', pageIndex: state.pageIndex })
  }
  if (state.status === 'closed') return state

  const pageIndex = action === 'next'
    ? Math.min(state.pageIndex + 1, pageCount - 1)
    : Math.max(state.pageIndex - 1, 0)
  return pageIndex === state.pageIndex
    ? state
    : Object.freeze({ status: 'open', pageIndex })
}

function isBookPresentation(
  presentation: RoomPresentationModel,
): presentation is BookPresentationModel {
  return presentation.content.kind === 'book'
}

function activeBook(snapshot: PresentationSnapshot): BookPresentationModel | null {
  const presentation = snapshot.presentation
  return snapshot.activeSurface === 'book' &&
    presentation?.surface === 'book' &&
    isBookPresentation(presentation) &&
    presentation.state !== 'closed'
    ? presentation
    : null
}

/**
 * Deterministically derives the current immutable Room mount snapshot from the
 * independent navigation and presentation inputs. It owns no subscriptions,
 * handlers, UI, animation, or media resources.
 */
export function deriveRoomBookMountSnapshot(
  presentationSnapshot: PresentationSnapshot,
  navigation: BookNavigationState,
): RoomBookMountSnapshot {
  const presentation = navigation.status === 'open'
    ? activeBook(presentationSnapshot)
    : null
  const pageIndex = presentation?.state === 'preview' ? 0 : navigation.pageIndex
  const mount = presentation
    ? mountBookVisualModel(adaptBookPresentation(presentation, pageIndex))
    : null

  return Object.freeze({ navigation, mount })
}
