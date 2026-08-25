import type { Work, WorkFragment } from '../content.types'
import type { PresentationState, ProjectionPresentationModel } from './presentation.types'

/** Builds a media-free Projection identity from the canonical registry record. */
export function createProjectionPresentation(
  work: Work,
  fragment: WorkFragment,
  state: PresentationState,
): ProjectionPresentationModel {
  if (fragment.placement.mode !== 'projection') {
    throw new Error(`Projection presentation requires a projection fragment: ${fragment.id}`)
  }

  return Object.freeze({
    surface: 'projection',
    mode: 'projection',
    workId: work.id,
    fragmentId: fragment.id,
    state,
    work,
    fragment,
    content: Object.freeze({
      kind: 'projection',
      title: work.publicTitle ?? work.internalTitle,
      motionIdentity: 'Motion Study',
      caption: fragment.caption ?? 'Motion study',
    }),
  })
}
