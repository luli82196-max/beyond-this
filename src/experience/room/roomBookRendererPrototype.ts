import type {
  BookPageTransitionIntent,
  BookPageVisualSemantics,
  BookVisualLanguageTokens,
  BookVisualPresentationState,
} from './roomBookVisualPresentationState'

export interface BookRendererTransitionHint {
  readonly intent: BookPageTransitionIntent
  readonly execute: false
}

export interface BookRendererPageStructure {
  readonly pageId: BookVisualPresentationState['content']['pageId']
  readonly pageKind: BookVisualPresentationState['content']['pageKind']
  readonly currentPage: number
  readonly pageCount: number
  readonly eyebrow: BookVisualPresentationState['content']['eyebrow']
  readonly title: BookVisualPresentationState['content']['pageTitle']
  readonly bodyBlocks: BookVisualPresentationState['content']['bodyBlocks']
  readonly mediaSlots: BookVisualPresentationState['content']['mediaSlots']
  readonly tokens: BookVisualLanguageTokens
}

interface BookRendererModelBase {
  readonly kind: 'book-renderer-prototype'
  readonly surface: 'book'
  readonly sourceKind: BookVisualPresentationState['kind']
  readonly workId: BookVisualPresentationState['content']['workId']
  readonly fragmentId: BookVisualPresentationState['content']['fragmentId']
  readonly transition: BookRendererTransitionHint
}

export interface RestingBookRendererModel extends BookRendererModelBase {
  readonly spatialState: 'resting'
  readonly presentation: 'static-object'
  readonly page: null
  readonly semantics: null
}

export interface OpenedBookRendererModel extends BookRendererModelBase {
  readonly spatialState: 'opened'
  readonly presentation: 'current-page-structure'
  readonly page: BookRendererPageStructure
  readonly semantics: null
}

export interface ReadingBookRendererModel extends BookRendererModelBase {
  readonly spatialState: 'reading'
  readonly presentation: 'complete-current-page'
  readonly page: BookRendererPageStructure
  readonly semantics: BookPageVisualSemantics
}

export type BookRendererPrototypeModel =
  | RestingBookRendererModel
  | OpenedBookRendererModel
  | ReadingBookRendererModel

function transitionHint(intent: BookPageTransitionIntent): BookRendererTransitionHint {
  return Object.freeze({ intent, execute: false })
}

function pageStructure(state: BookVisualPresentationState): BookRendererPageStructure {
  return Object.freeze({
    pageId: state.content.pageId,
    pageKind: state.content.pageKind,
    currentPage: state.page.currentPage,
    pageCount: state.page.pageCount,
    eyebrow: state.content.eyebrow,
    title: state.content.pageTitle,
    bodyBlocks: state.content.bodyBlocks,
    mediaSlots: state.content.mediaSlots,
    tokens: state.tokens,
  })
}

/**
 * Derives renderer-ready data without retaining state or gaining ownership of
 * presentation, navigation, lifecycle, animation, or media behavior.
 */
export function resolveBookRendererPrototype(
  state: BookVisualPresentationState | null,
): BookRendererPrototypeModel | null {
  if (!state) return null

  const base = {
    kind: 'book-renderer-prototype' as const,
    surface: 'book' as const,
    sourceKind: state.kind,
    workId: state.content.workId,
    fragmentId: state.content.fragmentId,
    transition: transitionHint(state.page.transitionIntent),
  }

  if (state.spatialState === 'resting') {
    return Object.freeze({
      ...base,
      spatialState: 'resting',
      presentation: 'static-object',
      page: null,
      semantics: null,
    })
  }

  const page = pageStructure(state)
  if (state.spatialState === 'opened') {
    return Object.freeze({
      ...base,
      spatialState: 'opened',
      presentation: 'current-page-structure',
      page,
      semantics: null,
    })
  }

  return Object.freeze({
    ...base,
    spatialState: 'reading',
    presentation: 'complete-current-page',
    page,
    semantics: state.semantics,
  })
}
