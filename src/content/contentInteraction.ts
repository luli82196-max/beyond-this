import type { InteractionState, InteractionStateDefinition } from './interaction.types'

const interactionStates = {
  passing: { state: 'passing', order: 0, preparesMedia: false, permitsMediaLoad: false },
  ambient: { state: 'ambient', order: 1, preparesMedia: false, permitsMediaLoad: false },
  focus: { state: 'focus', order: 2, preparesMedia: true, permitsMediaLoad: false },
  deep: { state: 'deep', order: 3, preparesMedia: true, permitsMediaLoad: true },
} as const satisfies Readonly<Record<InteractionState, InteractionStateDefinition>>

/** Returns immutable interaction metadata. It does not mutate Room or load assets. */
export function getInteractionState(state: InteractionState = 'passing'): InteractionStateDefinition {
  return interactionStates[state]
}
