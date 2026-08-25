import type { Work, WorkFragment } from '../content.types'
import type {
  BookPresentationContent,
  BookPresentationModel,
  PresentationState,
} from './presentation.types'

const placeholder = (label: string, aspectRatio: '4:3' | '3:2' = '3:2') =>
  Object.freeze({ kind: 'local-placeholder' as const, label, aspectRatio })

const pages = Object.freeze([
  Object.freeze({
    id: 'cover',
    kind: 'cover' as const,
    title: 'After the Second Sunset',
    eyebrow: 'Visual Development Archive',
    body: Object.freeze(['A fictional film remembered through light, absence, and material trace.']),
    placeholder: placeholder('Restrained cover field', '4:3'),
  }),
  Object.freeze({
    id: 'visual-rule',
    kind: 'visual-rule' as const,
    title: 'Visual Rule',
    eyebrow: '01 / Consequence before event',
    body: Object.freeze([
      'The first sunset remains absent; only its effects are allowed to persist.',
      'Light reveals memory through residue, not repetition.',
    ]),
    placeholder: placeholder('Light and silhouette study'),
  }),
  Object.freeze({
    id: 'rejected-directions',
    kind: 'rejected-directions' as const,
    title: 'Rejected Directions',
    eyebrow: '02 / What the system refused',
    body: Object.freeze([
      'A literal second sun explained the premise too quickly.',
      'Pristine surfaces removed time, touch, and the absent viewer.',
    ]),
    placeholder: placeholder('Rejected composition matrix'),
  }),
  Object.freeze({
    id: 'material-memory',
    kind: 'material-memory' as const,
    title: 'Material Memory',
    eyebrow: '03 / Trace as evidence',
    body: Object.freeze([
      'Wear is used only when it carries time or human presence.',
      'Reflections remain incomplete so the world feels recalled rather than displayed.',
    ]),
    placeholder: placeholder('Surface response study'),
  }),
])

export function createBookPresentationContent(
  work: Work,
  fragment: WorkFragment,
): BookPresentationContent {
  if (fragment.placement.mode !== 'book') {
    throw new Error(`Book presentation requires a book fragment: ${fragment.id}`)
  }
  return Object.freeze({
    kind: 'book',
    title: work.publicTitle ?? work.internalTitle,
    subtitle: fragment.caption ?? work.summary,
    pageCount: pages.length,
    pages,
  })
}

export function createBookPresentation(
  work: Work,
  fragment: WorkFragment,
  state: PresentationState,
): BookPresentationModel {
  return Object.freeze({
    surface: 'book',
    mode: 'book',
    workId: work.id,
    fragmentId: fragment.id,
    state,
    work,
    fragment,
    content: createBookPresentationContent(work, fragment),
  })
}
