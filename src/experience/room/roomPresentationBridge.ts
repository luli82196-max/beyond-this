import {
  createProcessPresentationContent,
  createBookPresentation,
  createProjectionPresentation,
  type InteractionState,
  type PresentationState,
  type RoomPresentationModel,
  type RoomInteractionTransition,
} from '../../content'
import { resolveRoomContent } from './roomContentResolver'
import { getRoomObjectBinding } from './roomObjectBindings'

const presentationStateByInteraction = {
  passing: 'closed',
  ambient: 'preview',
  focus: 'focused',
  deep: 'deep',
} as const satisfies Readonly<Record<InteractionState, PresentationState>>

export function resolvePresentationState(interaction: InteractionState): PresentationState {
  return presentationStateByInteraction[interaction]
}

/**
 * Converts Room semantics into an immutable presentation model. It does not
 * dispatch media intent, own state, render UI, or allocate a media resource.
 */
export function resolveRoomPresentation(
  transition: RoomInteractionTransition,
): RoomPresentationModel | null {
  const binding = getRoomObjectBinding(transition.event.surface)

  const resolved = resolveRoomContent(binding.surface)
  if (!resolved || resolved.fragment.id !== binding.fragmentId) return null

  const state = resolvePresentationState(transition.current)
  if (binding.mode === 'book') return createBookPresentation(resolved.work, resolved.fragment, state)
  if (binding.mode === 'projection') return createProjectionPresentation(resolved.work, resolved.fragment, state)

  return Object.freeze({
    surface: binding.surface,
    mode: binding.mode,
    workId: resolved.work.id,
    fragmentId: resolved.fragment.id,
    state,
    work: resolved.work,
    fragment: resolved.fragment,
    content: createProcessPresentationContent(resolved.work, resolved.fragment),
  })
}
