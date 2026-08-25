import type { ProcessPresentationModel, RoomInteractionEvent, RoomSurface } from '../../content'
import {
  createRoomInteractionAdapter,
  type KeyboardInteraction,
  type PointerInteraction,
  type RoomInputKind,
  type TouchInteraction,
} from './roomInteractionAdapter'
import { createRoomInteractionController } from './roomInteractionController'
import { createRoomPresentationConnection } from './roomPresentationConnection'
import {
  resolveRoomProcessVisualOutput,
  type RoomProcessVisualOutput,
} from './roomProcessVisualAdapter'

export type ProcessRuntimeListener = (visual: RoomProcessVisualOutput | null) => void

export interface RoomProcessRuntimeInteractionConnection {
  readonly connect: () => RoomProcessVisualOutput | null
  readonly disconnect: () => void
  readonly open: (input?: RoomInteractionEvent['input']) => RoomProcessVisualOutput | null
  readonly focus: (input?: RoomInteractionEvent['input']) => RoomProcessVisualOutput | null
  readonly close: (input?: RoomInteractionEvent['input']) => RoomProcessVisualOutput | null
  readonly switchSurface: (surface: Exclude<RoomSurface, 'interface'>) => RoomProcessVisualOutput | null
  readonly next: () => RoomProcessVisualOutput | null
  readonly previous: () => RoomProcessVisualOutput | null
  readonly handleKeyboard: (key: string) => RoomProcessVisualOutput | null
  readonly getVisual: () => RoomProcessVisualOutput | null
  readonly subscribe: (listener: ProcessRuntimeListener) => () => void
}

/** Connects existing Room interaction and presentation contracts to Process visual data. */
export function createRoomProcessRuntimeInteractionConnection(): RoomProcessRuntimeInteractionConnection {
  const controller = createRoomInteractionController()
  const presentation = createRoomPresentationConnection(controller)
  const adapter = createRoomInteractionAdapter()
  const listeners = new Set<ProcessRuntimeListener>()
  let connected = false
  let activeDecisionIndex = 0
  let visual: RoomProcessVisualOutput | null = null
  let unsubscribePresentation: (() => void) | null = null

  const publish = (): RoomProcessVisualOutput | null => {
    const model = presentation.getSnapshot().presentation
    const processModel = model?.mode === 'process' ? model as ProcessPresentationModel : null
    const next = resolveRoomProcessVisualOutput(processModel, activeDecisionIndex)
    if (next === visual) return visual
    visual = next
    listeners.forEach((listener) => listener(visual))
    return visual
  }

  const dispatch = (
    kind: RoomInputKind,
    action: KeyboardInteraction | PointerInteraction | TouchInteraction,
    surface: RoomSurface = 'interface',
  ): void => {
    adapter.mapInput(Object.freeze({ kind, action, surface })).forEach(controller.dispatch)
  }

  const focus = (input: RoomInteractionEvent['input'] = 'pointer') => {
    if (!connected) return visual
    if (input === 'keyboard') dispatch('keyboard', 'focus')
    else { dispatch('pointer', 'enter'); dispatch('pointer', 'move') }
    return publish()
  }

  const open = (input: RoomInteractionEvent['input'] = 'pointer') => {
    if (!connected) return visual
    activeDecisionIndex = 0
    focus(input)
    dispatch(input === 'keyboard' ? 'keyboard' : 'pointer', input === 'keyboard' ? 'confirm' : 'primary')
    return publish()
  }

  const close = (input: RoomInteractionEvent['input'] = 'pointer') => {
    if (!connected) return visual
    activeDecisionIndex = 0
    dispatch(input === 'keyboard' ? 'keyboard' : 'pointer', input === 'keyboard' ? 'blur' : 'exit')
    return publish()
  }

  return Object.freeze({
    connect() {
      if (connected) return visual
      connected = true
      unsubscribePresentation = presentation.subscribe(publish)
      presentation.connect()
      return publish()
    },
    disconnect() {
      if (!connected) return
      close()
      connected = false
      unsubscribePresentation?.()
      unsubscribePresentation = null
      presentation.disconnect()
      visual = null
      activeDecisionIndex = 0
      listeners.clear()
    },
    open,
    focus,
    close,
    switchSurface(surface: Exclude<RoomSurface, 'interface'>) {
      if (!connected) return visual
      activeDecisionIndex = 0
      dispatch('pointer', 'enter', surface)
      return publish()
    },
    next() {
      if (!visual || activeDecisionIndex >= visual.decisionCount - 1) return visual
      activeDecisionIndex += 1
      return publish()
    },
    previous() {
      if (!visual || activeDecisionIndex === 0) return visual
      activeDecisionIndex -= 1
      return publish()
    },
    handleKeyboard(key: string) {
      if (key === 'Enter' || key === ' ') return open('keyboard')
      if (key === 'Escape') return close('keyboard')
      if (key === 'ArrowDown' || key === 'ArrowRight') return this.next()
      if (key === 'ArrowUp' || key === 'ArrowLeft') return this.previous()
      return visual
    },
    getVisual: () => visual,
    subscribe(listener: ProcessRuntimeListener) {
      listeners.add(listener)
      let subscribed = true
      return () => { if (subscribed) { subscribed = false; listeners.delete(listener) } }
    },
  })
}
