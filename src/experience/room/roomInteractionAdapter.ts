import type {
  RoomInteractionEvent,
  RoomInteractionEventType,
  RoomSurface,
} from '../../content'

export type RoomInputKind = 'pointer' | 'keyboard' | 'touch'
export type PointerInteraction = 'enter' | 'move' | 'primary' | 'exit'
export type TouchInteraction = 'start' | 'primary' | 'cancel'
export type KeyboardInteraction = 'focus' | 'confirm' | 'escape' | 'blur'

export interface RoomInteractionAccessibility {
  readonly reducedMotion: boolean
  readonly keyboardOrder: readonly RoomSurface[]
}

export interface RoomInputDescriptor {
  readonly kind: RoomInputKind
  readonly action: PointerInteraction | TouchInteraction | KeyboardInteraction
  readonly surface: RoomSurface
}

export interface RoomInteractionAdapter {
  readonly accessibility: RoomInteractionAccessibility
  readonly mapInput: (input: RoomInputDescriptor) => readonly RoomInteractionEvent[]
  readonly getKeyboardPath: () => readonly RoomSurface[]
}

const defaultKeyboardOrder = Object.freeze(['book', 'projection', 'interface'] as const)

const eventsByInput = {
  pointer: {
    enter: ['approach'],
    move: ['attend'],
    primary: ['activate'],
    exit: ['leave'],
  },
  touch: {
    start: ['approach', 'attend'],
    primary: ['activate'],
    cancel: ['leave'],
  },
  keyboard: {
    focus: ['approach', 'attend'],
    confirm: ['activate'],
    escape: ['retreat'],
    blur: ['leave'],
  },
} as const satisfies Record<RoomInputKind, Readonly<Record<string, readonly RoomInteractionEventType[]>>>

function eventTypesFor(input: RoomInputDescriptor): readonly RoomInteractionEventType[] {
  const mappings = eventsByInput[input.kind] as Readonly<Record<string, readonly RoomInteractionEventType[]>>
  const eventTypes = mappings[input.action]
  if (!eventTypes) throw new Error(`Unsupported ${input.kind} Room action: ${input.action}`)
  return eventTypes
}

/**
 * Pure input translation. Consumers decide how and when to attach DOM, R3F, or
 * assistive-technology listeners and then dispatch the returned controller event.
 */
export function createRoomInteractionAdapter(
  options: Partial<RoomInteractionAccessibility> = {},
): RoomInteractionAdapter {
  const keyboardOrder = Object.freeze([...(options.keyboardOrder ?? defaultKeyboardOrder)])
  const accessibility: RoomInteractionAccessibility = Object.freeze({
    reducedMotion: options.reducedMotion ?? false,
    keyboardOrder,
  })

  return Object.freeze({
    accessibility,
    mapInput(input: RoomInputDescriptor) {
      return Object.freeze(eventTypesFor(input).map((type) => Object.freeze({
        type,
        surface: input.surface,
        input: input.kind,
      } satisfies RoomInteractionEvent)))
    },
    getKeyboardPath: () => keyboardOrder,
  })
}
