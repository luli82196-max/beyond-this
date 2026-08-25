import type { RoomInteractionEvent, RoomSurface } from '..'

export type ProcessKeyboardAction = 'focus' | 'confirm' | 'escape'

export interface ProcessPresentationAccessibilityContract {
  readonly tabOrder: readonly RoomSurface[]
  readonly mapKeyboardAction: (
    surface: RoomSurface,
    action: ProcessKeyboardAction,
  ) => readonly RoomInteractionEvent[]
}

const tabOrder = Object.freeze(['book', 'projection', 'interface'] as const)
const eventTypesByAction = Object.freeze({
  focus: Object.freeze(['approach', 'attend'] as const),
  confirm: Object.freeze(['activate'] as const),
  escape: Object.freeze(['retreat'] as const),
})

/** Pure keyboard semantics; consumers remain responsible for real listeners. */
export const processPresentationAccessibility: ProcessPresentationAccessibilityContract = Object.freeze({
  tabOrder,
  mapKeyboardAction(surface: RoomSurface, action: ProcessKeyboardAction) {
    return Object.freeze(eventTypesByAction[action].map((type) => Object.freeze({
      surface,
      type,
      input: 'keyboard' as const,
    })))
  },
})
