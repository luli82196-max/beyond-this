import type { BookPage, BookPresentationModel, RoomPresentationModel } from './presentation.types'

export type BookVisualEmphasis = 'quiet' | 'standard' | 'key'

export interface BookVisualTextLayer {
  readonly primary: string
  readonly secondary?: string
}

export interface BookVisualBodyBlock {
  readonly id: string
  readonly text: BookVisualTextLayer
  readonly emphasis: BookVisualEmphasis
}

export interface BookVisualMediaSlot {
  readonly id: string
  readonly kind: 'placeholder'
  readonly label: string
  readonly aspectRatio: '4:3' | '3:2'
  readonly source: null
}

export interface BookVisualProgress {
  readonly current: number
  readonly total: number
  readonly ratio: number
  readonly label: string
}

export interface BookVisualInteractionHint {
  readonly action: 'previous' | 'next' | 'close'
  readonly label: string
  readonly available: boolean
}

export interface BookVisualStyleTokens {
  readonly informationDensity: 'low'
  readonly whitespace: 'expansive'
  readonly titleHierarchy: 'display'
  readonly bodyHierarchy: 'reading'
  readonly languageHierarchy: 'primary-with-optional-secondary'
  readonly mediaTreatment: 'restrained-placeholder'
}

export interface BookVisualAdapterModel {
  readonly kind: 'book-visual-adapter'
  readonly workId: BookPresentationModel['workId']
  readonly fragmentId: BookPresentationModel['fragmentId']
  readonly state: Exclude<BookPresentationModel['state'], 'closed'>
  readonly pageId: BookPage['id']
  readonly pageKind: BookPage['kind']
  readonly eyebrow: BookVisualTextLayer
  readonly pageTitle: BookVisualTextLayer
  readonly bodyBlocks: readonly BookVisualBodyBlock[]
  readonly emphasisTokens: BookVisualStyleTokens
  readonly mediaSlots: readonly BookVisualMediaSlot[]
  readonly progress: BookVisualProgress
  readonly interactionHints: readonly BookVisualInteractionHint[]
}

const emphasisTokens: BookVisualStyleTokens = Object.freeze({
  informationDensity: 'low',
  whitespace: 'expansive',
  titleHierarchy: 'display',
  bodyHierarchy: 'reading',
  languageHierarchy: 'primary-with-optional-secondary',
  mediaTreatment: 'restrained-placeholder',
})

function text(primary: string, secondary?: string): BookVisualTextLayer {
  return Object.freeze(secondary ? { primary, secondary } : { primary })
}

function mapPage(
  presentation: BookPresentationModel,
  page: BookPage,
  pageIndex: number,
): BookVisualAdapterModel {
  const total = presentation.content.pageCount
  const current = pageIndex + 1
  const bodyBlocks = Object.freeze(page.body.map((body, index) => Object.freeze({
    id: `${page.id}-body-${index + 1}`,
    text: text(body),
    emphasis: index === 0 ? 'key' as const : 'standard' as const,
  })))
  const mediaSlots = Object.freeze([Object.freeze({
    id: `${page.id}-media-primary`,
    kind: 'placeholder' as const,
    label: page.placeholder.label,
    aspectRatio: page.placeholder.aspectRatio,
    source: null,
  })])
  const progress = Object.freeze({
    current,
    total,
    ratio: current / total,
    label: `${String(current).padStart(2, '0')} / ${String(total).padStart(2, '0')}`,
  })
  const interactionHints = Object.freeze([
    Object.freeze({ action: 'previous' as const, label: 'Previous page', available: pageIndex > 0 }),
    Object.freeze({ action: 'next' as const, label: 'Next page', available: pageIndex < total - 1 }),
    Object.freeze({ action: 'close' as const, label: 'Close book', available: true }),
  ])

  return Object.freeze({
    kind: 'book-visual-adapter',
    workId: presentation.workId,
    fragmentId: presentation.fragmentId,
    state: presentation.state as Exclude<BookPresentationModel['state'], 'closed'>,
    pageId: page.id,
    pageKind: page.kind,
    eyebrow: text(page.eyebrow),
    pageTitle: text(page.title),
    bodyBlocks,
    emphasisTokens,
    mediaSlots,
    progress,
    interactionHints,
  })
}

function isBookPresentation(
  presentation: RoomPresentationModel,
): presentation is BookPresentationModel {
  return presentation.content.kind === 'book'
}

/**
 * Maps the active Book model to renderer-ready data without creating UI or media resources.
 * A missing, closed, non-Book, or invalid-page input has no visual representation.
 */
export function adaptBookPresentation(
  presentation: RoomPresentationModel | null,
  pageIndex: number,
): BookVisualAdapterModel | null {
  if (
    !presentation ||
    !isBookPresentation(presentation) ||
    presentation.state === 'closed' ||
    !Number.isInteger(pageIndex) ||
    pageIndex < 0 ||
    pageIndex >= presentation.content.pages.length
  ) return null

  return mapPage(presentation, presentation.content.pages[pageIndex], pageIndex)
}
