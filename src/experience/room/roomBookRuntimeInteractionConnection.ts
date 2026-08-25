import type { RoomInteractionEvent } from '../../content'
import { createRoomInteractionAdapter, type KeyboardInteraction } from './roomInteractionAdapter'
import { createRoomBookEndToEndStabilityHarness } from './roomBookEndToEndStabilityHarness'
import { resolveBookMinimalVisualOutput, type BookMinimalVisualOutput } from './roomBookMinimalVisualRenderer'

export type BookRuntimeKeyboardKey = 'Enter' | ' ' | 'Escape' | 'ArrowLeft' | 'ArrowRight'
export type BookRuntimeListener = (visual: BookMinimalVisualOutput | null) => void

export interface RoomBookRuntimeInteractionConnection {
  readonly connect: () => BookMinimalVisualOutput | null
  readonly disconnect: () => void
  readonly open: (input?: RoomInteractionEvent['input']) => BookMinimalVisualOutput | null
  readonly close: (input?: RoomInteractionEvent['input']) => BookMinimalVisualOutput | null
  readonly next: () => BookMinimalVisualOutput | null
  readonly previous: () => BookMinimalVisualOutput | null
  readonly handleKeyboard: (key: string) => BookMinimalVisualOutput | null
  readonly getVisual: () => BookMinimalVisualOutput | null
  readonly subscribe: (listener: BookRuntimeListener) => () => void
}

const keyboardActionByKey: Readonly<Record<string, KeyboardInteraction | undefined>> = Object.freeze({
  Enter: 'confirm',
  ' ': 'confirm',
  Escape: 'escape',
})

/** Runtime orchestration only: it owns inputs and subscriptions, never visual rendering. */
export function createRoomBookRuntimeInteractionConnection(): RoomBookRuntimeInteractionConnection {
  const harness = createRoomBookEndToEndStabilityHarness()
  const adapter = createRoomInteractionAdapter()
  const listeners = new Set<BookRuntimeListener>()
  let connected = false
  let visual: BookMinimalVisualOutput | null = null
  let unsubscribeRenderer: (() => void) | null = null

  const resolve = (): BookMinimalVisualOutput | null =>
    resolveBookMinimalVisualOutput(harness.renderer.getMount(), harness.getVisualState())

  const publish = (): BookMinimalVisualOutput | null => {
    const next = resolve()
    if (next === visual) return visual
    visual = next
    listeners.forEach((listener) => listener(visual))
    return visual
  }

  const dispatchKeyboard = (action: KeyboardInteraction): void => {
    adapter.mapInput(Object.freeze({ kind: 'keyboard', action, surface: 'book' }))
      .forEach((event) => harness.dispatch(event.surface, event.type))
  }

  const open = (input: RoomInteractionEvent['input'] = 'pointer'): BookMinimalVisualOutput | null => {
    if (!connected) return visual
    if (input === 'keyboard') {
      dispatchKeyboard('focus')
      dispatchKeyboard('confirm')
    } else {
      harness.dispatch('book', 'approach')
      harness.dispatch('book', 'attend')
      harness.dispatch('book', 'activate')
    }
    harness.navigate('reopen')
    return publish()
  }

  const close = (input: RoomInteractionEvent['input'] = 'pointer'): BookMinimalVisualOutput | null => {
    if (!connected) return visual
    harness.navigate('close')
    harness.dispatch('book', 'leave')
    return publish()
  }

  return Object.freeze({
    connect() {
      if (connected) return visual
      connected = true
      harness.connect()
      unsubscribeRenderer = harness.renderer.subscribe(publish)
      return publish()
    },
    disconnect() {
      if (!connected) return
      connected = false
      unsubscribeRenderer?.()
      unsubscribeRenderer = null
      harness.disconnect()
      visual = null
      listeners.clear()
    },
    open,
    close,
    next() {
      if (!connected || !visual) return visual
      harness.navigate('next')
      return publish()
    },
    previous() {
      if (!connected || !visual) return visual
      harness.navigate('previous')
      return publish()
    },
    handleKeyboard(key: string) {
      if (key === 'ArrowRight') return this.next()
      if (key === 'ArrowLeft') return this.previous()
      const action = keyboardActionByKey[key]
      if (action === 'confirm') return open('keyboard')
      if (action === 'escape') return close('keyboard')
      return visual
    },
    getVisual: () => visual,
    subscribe(listener: BookRuntimeListener) {
      listeners.add(listener)
      let subscribed = true
      return () => {
        if (!subscribed) return
        subscribed = false
        listeners.delete(listener)
      }
    },
  })
}
