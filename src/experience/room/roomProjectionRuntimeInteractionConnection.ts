import type { MediaElementLike, MediaIntent, MinimalMediaRuntime, ProjectionPresentationModel, RoomInteractionEvent, RoomSurface } from '../../content'
import { createMediaBoundary, createMinimalMediaRuntime, getProjectionAsset } from '../../content'
import { createRoomInteractionAdapter, type KeyboardInteraction, type PointerInteraction, type RoomInputKind } from './roomInteractionAdapter'
import { createRoomInteractionController } from './roomInteractionController'
import { createRoomInteractionOrchestrator } from './roomInteractionOrchestrator'
import { createRoomPresentationConnection } from './roomPresentationConnection'
import { resolveRoomProjectionRuntimeOutput, type RoomProjectionRuntimeOutput } from './roomProjectionRuntimeOutput'

export type ProjectionRuntimeListener = (output: RoomProjectionRuntimeOutput | null) => void

export interface ProjectionRuntimeOwnership {
  readonly connected: boolean
  readonly presentationSubscription: boolean
  readonly orchestrationSubscription: boolean
  readonly subscriberCount: number
  readonly connectionCycle: number
}

export interface RoomProjectionRuntimeInteractionConnection {
  readonly connect: () => RoomProjectionRuntimeOutput | null
  readonly disconnect: () => void
  readonly open: (input?: RoomInteractionEvent['input']) => RoomProjectionRuntimeOutput | null
  readonly focus: (input?: RoomInteractionEvent['input']) => RoomProjectionRuntimeOutput | null
  readonly close: (input?: RoomInteractionEvent['input']) => RoomProjectionRuntimeOutput | null
  readonly switchSurface: (surface: Exclude<RoomSurface, 'projection'>) => RoomProjectionRuntimeOutput | null
  readonly handleKeyboard: (key: string) => RoomProjectionRuntimeOutput | null
  readonly getOutput: () => RoomProjectionRuntimeOutput | null
  readonly getMediaElement: () => MediaElementLike | null
  readonly getOwnership: () => ProjectionRuntimeOwnership
  readonly subscribe: (listener: ProjectionRuntimeListener) => () => void
}

/** Owns Projection interaction, presentation, and metadata-only media-intent connections. */
export function createRoomProjectionRuntimeInteractionConnection(
  mediaRuntime: MinimalMediaRuntime = createMinimalMediaRuntime(),
): RoomProjectionRuntimeInteractionConnection {
  const controller = createRoomInteractionController()
  const presentation = createRoomPresentationConnection(controller)
  const adapter = createRoomInteractionAdapter()
  const mediaBoundary = createMediaBoundary()
  const orchestrator = createRoomInteractionOrchestrator(mediaBoundary)
  const listeners = new Set<ProjectionRuntimeListener>()
  let connected = false
  let connectionCycle = 0
  let output: RoomProjectionRuntimeOutput | null = null
  let lastPrepareIntent: MediaIntent | null = null
  let unsubscribePresentation: (() => void) | null = null
  let unsubscribeOrchestration: (() => void) | null = null
  let unsubscribeMediaRuntime: (() => void) | null = null

  const publish = (): RoomProjectionRuntimeOutput | null => {
    const model = presentation.getSnapshot().presentation
    const projection = model?.mode === 'projection' ? model as ProjectionPresentationModel : null
    const asset = projection ? getProjectionAsset(projection.fragmentId) : null
    const next = resolveRoomProjectionRuntimeOutput(projection, lastPrepareIntent, asset?.source ?? null, mediaRuntime.getSnapshot())
    output = next
    listeners.forEach((listener) => listener(output))
    return output
  }

  const dispatch = (
    kind: RoomInputKind,
    action: KeyboardInteraction | PointerInteraction,
    surface: RoomSurface = 'projection',
  ): void => {
    adapter.mapInput(Object.freeze({ kind, action, surface })).forEach(controller.dispatch)
  }

  const focus = (input: RoomInteractionEvent['input'] = 'pointer') => {
    if (!connected) return output
    if (input === 'keyboard') dispatch('keyboard', 'focus')
    else { dispatch('pointer', 'enter'); dispatch('pointer', 'move') }
    return publish()
  }

  const open = (input: RoomInteractionEvent['input'] = 'pointer') => {
    if (!connected) return output
    focus(input)
    dispatch(input === 'keyboard' ? 'keyboard' : 'pointer', input === 'keyboard' ? 'confirm' : 'primary')
    const next = publish()
    const asset = next ? getProjectionAsset(next.fragmentId) : null
    if (next?.mediaBoundaryIntent?.type === 'prepare' && asset) {
      mediaRuntime.prepare(asset.source)
      mediaRuntime.load()
    }
    return publish()
  }

  const close = (input: RoomInteractionEvent['input'] = 'pointer') => {
    if (!connected) return output
    dispatch(input === 'keyboard' ? 'keyboard' : 'pointer', input === 'keyboard' ? 'blur' : 'exit')
    lastPrepareIntent = null
    mediaRuntime.release()
    return publish()
  }

  return Object.freeze({
    connect() {
      if (connected) return output
      connected = true
      connectionCycle += 1
      unsubscribePresentation = presentation.subscribe(publish)
      unsubscribeMediaRuntime = mediaRuntime.subscribe((snapshot) => {
        publish()
        if (snapshot.lifecycle === 'ready' && !snapshot.fallback) void mediaRuntime.play()
      })
      unsubscribeOrchestration = controller.subscribe((transition) => {
        const result = orchestrator.handleTransition(transition)
        if (result.intent?.surface === 'projection') {
          lastPrepareIntent = result.intent.type === 'prepare' ? result.intent : null
        }
      })
      presentation.connect()
      return publish()
    },
    disconnect() {
      if (!connected) return
      close()
      connected = false
      unsubscribeOrchestration?.(); unsubscribeOrchestration = null
      unsubscribePresentation?.(); unsubscribePresentation = null
      unsubscribeMediaRuntime?.(); unsubscribeMediaRuntime = null
      presentation.disconnect()
      output = null
      lastPrepareIntent = null
      listeners.clear()
    },
    open,
    focus,
    close,
    switchSurface(surface: Exclude<RoomSurface, 'projection'>) {
      if (!connected) return output
      close()
      dispatch('pointer', 'enter', surface)
      return publish()
    },
    handleKeyboard(key: string) {
      if (key === 'Enter' || key === ' ') return open('keyboard')
      if (key === 'Escape') return close('keyboard')
      return output
    },
    getOutput: () => output,
    getMediaElement: mediaRuntime.getMediaElement,
    getOwnership: () => Object.freeze({
      connected,
      presentationSubscription: unsubscribePresentation !== null,
      orchestrationSubscription: unsubscribeOrchestration !== null,
      subscriberCount: listeners.size,
      connectionCycle,
    }),
    subscribe(listener: ProjectionRuntimeListener) {
      listeners.add(listener)
      let subscribed = true
      return () => { if (subscribed) { subscribed = false; listeners.delete(listener) } }
    },
  })
}
