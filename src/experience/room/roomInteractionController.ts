import {
  getInteractionState,
  type InteractionState,
  type InteractionStateDefinition,
  type RoomInteractionEvent,
  type RoomInteractionTransition,
  type RoomSurface,
} from '../../content'
import { getRoomObjectBinding } from './roomObjectBindings'

export type RoomInteractionSnapshot = Readonly<Record<RoomSurface, InteractionState>>
export type RoomInteractionListener = (transition: RoomInteractionTransition) => void

const surfaces = ['book', 'projection', 'interface'] as const satisfies readonly RoomSurface[]

const nextState: Readonly<Record<InteractionState, Partial<Record<RoomInteractionEvent['type'], InteractionState>>>> = {
  passing: { approach: 'ambient' },
  ambient: { attend: 'focus', retreat: 'passing', leave: 'passing' },
  focus: { activate: 'deep', retreat: 'ambient', leave: 'passing' },
  deep: { retreat: 'focus', leave: 'passing' },
}

export interface RoomInteractionController {
  readonly dispatch: (event: RoomInteractionEvent) => RoomInteractionTransition
  readonly getState: (surface: RoomSurface) => InteractionStateDefinition
  readonly getSnapshot: () => RoomInteractionSnapshot
  readonly subscribe: (listener: RoomInteractionListener) => () => void
}

/**
 * Runtime-only state controller. It does not render UI, request assets, or act on
 * the media-permission metadata exposed by an interaction state.
 */
export function createRoomInteractionController(): RoomInteractionController {
  const states: Record<RoomSurface, InteractionState> = {
    book: 'passing',
    projection: 'passing',
    interface: 'passing',
  }
  const listeners = new Set<RoomInteractionListener>()

  const getSnapshot = (): RoomInteractionSnapshot => Object.freeze({ ...states })

  return Object.freeze({
    dispatch(event: RoomInteractionEvent) {
      // Fail early when a surface is not part of the explicit BT-P03 binding layer.
      getRoomObjectBinding(event.surface)

      const previous = states[event.surface]
      const current = nextState[previous][event.type] ?? previous
      const transition: RoomInteractionTransition = Object.freeze({
        event: Object.freeze({ ...event }),
        previous,
        current,
        changed: current !== previous,
      })

      if (transition.changed) {
        states[event.surface] = current
        listeners.forEach((listener) => listener(transition))
      }

      return transition
    },
    getState(surface: RoomSurface) {
      getRoomObjectBinding(surface)
      return getInteractionState(states[surface])
    },
    getSnapshot,
    subscribe(listener: RoomInteractionListener) {
      listeners.add(listener)
      return () => listeners.delete(listener)
    },
  })
}
