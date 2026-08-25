import type { BookPageKind, BookVisualAdapterModel } from '../../content'
import type { RoomBookReadOnlyMountModel } from './roomBookReadOnlyMount'

export type BookVisualSpatialState = 'closed' | 'resting' | 'opened' | 'reading'
export type BookPageTransitionIntent = 'none' | 'previous' | 'next' | 'replace'

export interface BookVisualPageState {
  readonly currentPage: number
  readonly pageCount: number
  readonly transitionIntent: BookPageTransitionIntent
}

export interface BookVisualLanguageTokens {
  readonly paperTone: 'warm-grey' | 'weathered-ivory' | 'smoked-parchment'
  readonly density: 'low'
  readonly layout: 'archive' | 'rule-study' | 'decision-edit' | 'material-study'
  readonly emphasis: 'minimal' | 'rule' | 'contrast' | 'atmospheric'
}

export interface BookPageVisualSemantics {
  readonly role: 'archive-entry' | 'rule-evidence' | 'editorial-judgement' | 'material-memory'
  readonly composition: 'negative-space' | 'spatial-relation' | 'rejection-sequence' | 'material-field'
  readonly subject: 'time' | 'light' | 'decision' | 'trace'
}

export interface BookVisualPresentationState {
  readonly kind: 'book-visual-presentation-state'
  readonly surface: 'book'
  readonly spatialState: Exclude<BookVisualSpatialState, 'closed'>
  readonly page: BookVisualPageState
  readonly tokens: BookVisualLanguageTokens
  readonly semantics: BookPageVisualSemantics
  readonly content: BookVisualAdapterModel
}

const spatialStateByLifecycle = Object.freeze({
  preview: 'resting',
  focused: 'opened',
  deep: 'reading',
} as const satisfies Readonly<Record<RoomBookReadOnlyMountModel['lifecycle'], Exclude<BookVisualSpatialState, 'closed'>>>)

const visualLanguageByPage = Object.freeze({
  cover: Object.freeze({
    tokens: Object.freeze({
      paperTone: 'warm-grey', density: 'low', layout: 'archive', emphasis: 'minimal',
    }),
    semantics: Object.freeze({
      role: 'archive-entry', composition: 'negative-space', subject: 'time',
    }),
  }),
  'visual-rule': Object.freeze({
    tokens: Object.freeze({
      paperTone: 'weathered-ivory', density: 'low', layout: 'rule-study', emphasis: 'rule',
    }),
    semantics: Object.freeze({
      role: 'rule-evidence', composition: 'spatial-relation', subject: 'light',
    }),
  }),
  'rejected-directions': Object.freeze({
    tokens: Object.freeze({
      paperTone: 'warm-grey', density: 'low', layout: 'decision-edit', emphasis: 'contrast',
    }),
    semantics: Object.freeze({
      role: 'editorial-judgement', composition: 'rejection-sequence', subject: 'decision',
    }),
  }),
  'material-memory': Object.freeze({
    tokens: Object.freeze({
      paperTone: 'smoked-parchment', density: 'low', layout: 'material-study', emphasis: 'atmospheric',
    }),
    semantics: Object.freeze({
      role: 'material-memory', composition: 'material-field', subject: 'trace',
    }),
  }),
} as const satisfies Readonly<Record<BookPageKind, Readonly<{
  tokens: BookVisualLanguageTokens
  semantics: BookPageVisualSemantics
}>>>)

function transitionIntent(
  currentPage: number,
  previous: BookVisualPresentationState | null,
): BookPageTransitionIntent {
  if (!previous) return 'none'
  if (currentPage === previous.page.currentPage) return 'none'
  if (currentPage === previous.page.currentPage + 1) return 'next'
  if (currentPage === previous.page.currentPage - 1) return 'previous'
  return 'replace'
}

/**
 * Converts the read-only Room mount into immutable director-language data for a
 * future renderer. A closed or switched-away Book is represented by no output.
 */
export function resolveBookVisualPresentationState(
  mount: RoomBookReadOnlyMountModel | null,
  previous: BookVisualPresentationState | null = null,
): BookVisualPresentationState | null {
  if (!mount) return null

  const language = visualLanguageByPage[mount.visual.pageKind]
  const currentPage = mount.visual.progress.current
  const page = Object.freeze({
    currentPage,
    pageCount: mount.visual.progress.total,
    transitionIntent: transitionIntent(currentPage, previous),
  })

  return Object.freeze({
    kind: 'book-visual-presentation-state',
    surface: 'book',
    spatialState: spatialStateByLifecycle[mount.lifecycle],
    page,
    tokens: language.tokens,
    semantics: language.semantics,
    content: mount.visual,
  })
}
