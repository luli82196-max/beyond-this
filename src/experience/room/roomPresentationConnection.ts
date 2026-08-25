import type { RoomInteractionTransition } from '../../content'
import type { RoomInteractionController } from './roomInteractionController'
import {
  createPresentationStateContainer,
  type PresentationSnapshot,
  type PresentationStateContainer,
} from './roomPresentationStateContainer'

export type PresentationConnectionListener = (
  snapshot: PresentationSnapshot,
  previous: PresentationSnapshot,
) => void

export interface PresentationConnectionOwnership {
  readonly controllerSubscription: boolean
  readonly containerSubscription: boolean
  readonly subscriberCount: number
}

export type PresentationTeardownResource = 'controller' | 'container' | 'subscribers'

const deterministicReleaseOrder = Object.freeze([
  'controller',
  'container',
  'subscribers',
] satisfies PresentationTeardownResource[])

export interface PresentationDisconnectRecord {
  readonly cycle: number
  readonly status: 'complete'
  readonly releaseOrder: readonly PresentationTeardownResource[]
  readonly cleanupErrors: readonly PresentationTeardownResource[]
}

export interface PresentationConnectionDiagnostics {
  readonly connected: boolean
  readonly connectionCycle: number
  readonly ownership: PresentationConnectionOwnership
  readonly subscriberCount: number
  readonly lastTransition: RoomInteractionTransition | null
  readonly lastDisconnect: PresentationDisconnectRecord | null
  readonly auditSequence: number
  readonly auditTrail: readonly PresentationLifecycleAuditEntry[]
}

export type PresentationLifecycleAuditAction =
  | 'connect'
  | 'transition'
  | 'teardown-controller'
  | 'teardown-container'
  | 'teardown-subscribers'
  | 'disconnect'

export interface PresentationLifecycleAuditEntry {
  readonly sequence: number
  readonly cycle: number
  readonly action: PresentationLifecycleAuditAction
}

export type PresentationDiagnosticsObserver = (
  diagnostics: PresentationConnectionDiagnostics,
  previous: PresentationConnectionDiagnostics,
) => void

export interface RoomPresentationConnection {
  readonly connect: () => void
  readonly disconnect: () => void
  readonly getDiagnostics: () => PresentationConnectionDiagnostics
  readonly getSnapshot: () => PresentationSnapshot
  readonly getOwnership: () => PresentationConnectionOwnership
  readonly isConnected: () => boolean
  readonly subscribe: (listener: PresentationConnectionListener) => () => void
  readonly observeDiagnostics: (observer: PresentationDiagnosticsObserver) => () => void
}

/**
 * Explicitly owns the Controller -> Presentation Bridge -> State Container
 * subscription lifecycle. It renders nothing and creates no media resources.
 */
export function createRoomPresentationConnection(
  controller: RoomInteractionController,
  container: PresentationStateContainer = createPresentationStateContainer(),
): RoomPresentationConnection {
  const listeners = new Set<PresentationConnectionListener>()
  const diagnosticsObservers = new Set<PresentationDiagnosticsObserver>()
  let connected = false
  let unsubscribeController: (() => void) | null = null
  let unsubscribeContainer: (() => void) | null = null
  let connectionCycle = 0
  let activeEpoch = 0
  let lastTransition: RoomInteractionTransition | null = null
  let lastDisconnect: PresentationDisconnectRecord | null = null
  let auditSequence = 0
  const auditTrail: PresentationLifecycleAuditEntry[] = []

  const getOwnership = (): PresentationConnectionOwnership => Object.freeze({
    controllerSubscription: unsubscribeController !== null,
    containerSubscription: unsubscribeContainer !== null,
    subscriberCount: listeners.size,
  })

  const release = (
    resource: PresentationTeardownResource,
    unsubscribe: (() => void) | null,
    errors: PresentationTeardownResource[],
  ): void => {
    try {
      unsubscribe?.()
    } catch {
      errors.push(resource)
      // Each owned resource is released independently of cleanup failures.
    }
  }

  const getDiagnostics = (): PresentationConnectionDiagnostics => {
    const ownership = getOwnership()
    return Object.freeze({
      connected,
      connectionCycle,
      ownership,
      subscriberCount: ownership.subscriberCount,
      lastTransition,
      lastDisconnect,
      auditSequence,
      auditTrail: Object.freeze([...auditTrail]),
    })
  }

  let publishedDiagnostics = getDiagnostics()

  const recordAudit = (action: PresentationLifecycleAuditAction): void => {
    const previous = publishedDiagnostics
    auditSequence += 1
    auditTrail.push(Object.freeze({ sequence: auditSequence, cycle: connectionCycle, action }))
    publishedDiagnostics = getDiagnostics()
    diagnosticsObservers.forEach((observer) => {
      try {
        observer(publishedDiagnostics, previous)
      } catch {
        // A diagnostics observer owns neither lifecycle state nor sibling delivery.
      }
    })
  }

  const connect = () => {
    if (connected) return

    connectionCycle += 1
    const epoch = ++activeEpoch

    // Observe completed container commits before accepting controller events.
    unsubscribeContainer = container.subscribe((snapshot, previous) => {
      if (!connected || epoch !== activeEpoch) return
      listeners.forEach((listener) => {
        try {
          listener(snapshot, previous)
        } catch {
          // A connection subscriber cannot interrupt sibling subscribers.
        }
      })
    })
    unsubscribeController = controller.subscribe((transition) => {
      if (!connected || epoch !== activeEpoch) return
      lastTransition = transition
      recordAudit('transition')
      container.dispatch(transition)
    })
    connected = true
    recordAudit('connect')
  }

  const disconnect = () => {
    if (!connected) return

    // Invalidate callbacks before releasing resources in the fixed order.
    connected = false
    activeEpoch += 1
    const releaseController = unsubscribeController
    unsubscribeController = null
    const releaseContainer = unsubscribeContainer
    unsubscribeContainer = null
    const cleanupErrors: PresentationTeardownResource[] = []
    release('controller', releaseController, cleanupErrors)
    recordAudit('teardown-controller')
    release('container', releaseContainer, cleanupErrors)
    recordAudit('teardown-container')
    listeners.clear()
    recordAudit('teardown-subscribers')
    lastDisconnect = Object.freeze({
      cycle: connectionCycle,
      status: 'complete',
      releaseOrder: deterministicReleaseOrder,
      cleanupErrors: Object.freeze(cleanupErrors),
    })
    recordAudit('disconnect')
  }

  return Object.freeze({
    connect,
    disconnect,
    getDiagnostics,
    getSnapshot: container.getSnapshot,
    getOwnership,
    isConnected: () => connected,
    observeDiagnostics(observer: PresentationDiagnosticsObserver) {
      diagnosticsObservers.add(observer)
      return () => diagnosticsObservers.delete(observer)
    },
    subscribe(listener: PresentationConnectionListener) {
      listeners.add(listener)
      return () => listeners.delete(listener)
    },
  })
}
