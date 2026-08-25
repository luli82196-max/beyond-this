import type { BookPage, BookPresentationModel, PresentationState } from './presentation.types'

export interface BookNavigationSnapshot {
  readonly presentation: BookPresentationModel
  readonly pageIndex: number
  readonly page: BookPage
}

export interface BookPresentationNavigation {
  readonly getSnapshot: () => BookNavigationSnapshot
  readonly next: () => BookNavigationSnapshot
  readonly previous: () => BookNavigationSnapshot
  readonly close: () => BookNavigationSnapshot
}

function withState(model: BookPresentationModel, state: PresentationState): BookPresentationModel {
  return model.state === state ? model : Object.freeze({ ...model, state })
}

export function createBookPresentationNavigation(
  presentation: BookPresentationModel,
): BookPresentationNavigation {
  if (presentation.content.pages.length === 0) throw new Error('Book requires at least one page')
  let snapshot = freezeSnapshot(presentation, 0)

  function freezeSnapshot(model: BookPresentationModel, pageIndex: number): BookNavigationSnapshot {
    return Object.freeze({ presentation: model, pageIndex, page: model.content.pages[pageIndex] })
  }

  function move(pageIndex: number): BookNavigationSnapshot {
    if (snapshot.presentation.state === 'closed' || pageIndex === snapshot.pageIndex) return snapshot
    snapshot = freezeSnapshot(snapshot.presentation, pageIndex)
    return snapshot
  }

  return Object.freeze({
    getSnapshot: () => snapshot,
    next: () => move(Math.min(snapshot.pageIndex + 1, presentation.content.pages.length - 1)),
    previous: () => move(Math.max(snapshot.pageIndex - 1, 0)),
    close() {
      const closed = withState(snapshot.presentation, 'closed')
      if (closed === snapshot.presentation) return snapshot
      snapshot = freezeSnapshot(closed, snapshot.pageIndex)
      return snapshot
    },
  })
}
