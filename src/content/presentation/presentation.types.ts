import type {
  FragmentId,
  PresentationMode,
  RoomSurface,
  Work,
  WorkFragment,
} from '../content.types'

export type PresentationState = 'closed' | 'preview' | 'focused' | 'deep'

export interface PresentationIdentity {
  readonly surface: RoomSurface
  readonly mode: PresentationMode
  readonly workId: Work['id']
  readonly fragmentId: FragmentId
}

export interface PresentationModel<TContent = unknown> extends PresentationIdentity {
  readonly state: PresentationState
  readonly work: Work
  readonly fragment: WorkFragment
  readonly content: TContent
}

export interface ProcessDecision {
  readonly id: string
  readonly title: string
  readonly attempt: string
  readonly problem: string
  readonly decision: string
  readonly rule: string
}

export interface ProcessPresentationContent {
  readonly kind: 'process'
  readonly heading: string
  readonly summary: string
  readonly sequenceLabel: string
  readonly decisions: readonly ProcessDecision[]
}

export type ProcessPresentationModel = PresentationModel<ProcessPresentationContent>

export interface ProjectionPresentationContent {
  readonly kind: 'projection'
  readonly title: string
  readonly motionIdentity: string
  readonly caption: string
}

export type ProjectionPresentationModel = PresentationModel<ProjectionPresentationContent>

export type BookPageKind = 'cover' | 'visual-rule' | 'rejected-directions' | 'material-memory'

export interface BookPage {
  readonly id: string
  readonly kind: BookPageKind
  readonly title: string
  readonly eyebrow: string
  readonly body: readonly string[]
  readonly placeholder: Readonly<{
    kind: 'local-placeholder'
    label: string
    aspectRatio: '4:3' | '3:2'
  }>
}

export interface BookPresentationContent {
  readonly kind: 'book'
  readonly title: string
  readonly subtitle: string
  readonly pageCount: number
  readonly pages: readonly BookPage[]
}

export type BookPresentationModel = PresentationModel<BookPresentationContent>
export type RoomPresentationModel = ProcessPresentationModel | BookPresentationModel | ProjectionPresentationModel
