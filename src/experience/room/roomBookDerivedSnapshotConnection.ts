import type { RoomPresentationConnection } from './roomPresentationConnection'
import {
  deriveRoomBookMountSnapshot,
  initialBookNavigationState,
  reduceBookNavigation,
  type BookNavigationAction,
  type BookNavigationState,
  type RoomBookMountSnapshot,
} from './roomBookNavigationSnapshotDerivation'

export type RoomBookDerivedSnapshotListener = (
  snapshot: RoomBookMountSnapshot,
  previous: RoomBookMountSnapshot,
) => void

export interface RoomBookDerivedConnectionOwnership {
  readonly presentationSubscription: boolean
  readonly subscriberCount: number
}

export interface RoomBookDerivedConnectionDiagnostics {
  readonly connected: boolean
  readonly connectionCycle: number
  readonly connectionEpoch: number
  readonly ownership: RoomBookDerivedConnectionOwnership
  readonly lastNavigationAction: BookNavigationAction | null
  readonly lastDisconnectCleanupFailed: boolean
  readonly navigationSequence: readonly RoomBookNavigationAuditEntry[]
  readonly mountDerivationSequence: readonly RoomBookMountDerivationAuditEntry[]
  readonly lastTeardown: RoomBookTeardownRecord | null
}

export interface RoomBookNavigationAuditEntry {
  readonly sequence: number
  readonly epoch: number
  readonly action: BookNavigationAction
  readonly pageIndex: number
  readonly status: BookNavigationState['status']
}

export interface RoomBookMountDerivationAuditEntry {
  readonly sequence: number
  readonly epoch: number
  readonly source: 'connect' | 'navigation' | 'presentation'
  readonly mountPageId: string | null
}

export interface RoomBookTeardownRecord {
  readonly epoch: number
  readonly cycle: number
  readonly navigationSequence: number
  readonly mountDerivationSequence: number
  readonly cleanupFailed: boolean
}

export interface RoomBookDerivedSnapshotConnection {
  readonly connect: () => RoomBookMountSnapshot
  readonly disconnect: () => void
  readonly teardown: () => void
  readonly navigate: (action: BookNavigationAction) => RoomBookMountSnapshot
  readonly getSnapshot: () => RoomBookMountSnapshot
  readonly getDiagnostics: () => RoomBookDerivedConnectionDiagnostics
  readonly getOwnership: () => RoomBookDerivedConnectionOwnership
  readonly isConnected: () => boolean
  readonly subscribe: (listener: RoomBookDerivedSnapshotListener) => () => void
}

/**
 * Connects Presentation snapshots to Book navigation derivation. It owns only
 * one upstream subscription, local navigation state, and its subscriber set.
 */
export function createRoomBookDerivedSnapshotConnection(
  presentation: RoomPresentationConnection,
): RoomBookDerivedSnapshotConnection {
  const listeners = new Set<RoomBookDerivedSnapshotListener>()
  let connected = false
  let connectionCycle = 0
  let activeEpoch = 0
  let navigation: BookNavigationState = initialBookNavigationState
  let snapshot = deriveRoomBookMountSnapshot(presentation.getSnapshot(), navigation)
  let unsubscribePresentation: (() => void) | null = null
  let lastNavigationAction: BookNavigationAction | null = null
  let lastDisconnectCleanupFailed = false
  let navigationAuditSequence = 0
  let mountDerivationAuditSequence = 0
  const navigationSequence: RoomBookNavigationAuditEntry[] = []
  const mountDerivationSequence: RoomBookMountDerivationAuditEntry[] = []
  let lastTeardown: RoomBookTeardownRecord | null = null

  const getOwnership = (): RoomBookDerivedConnectionOwnership => Object.freeze({
    presentationSubscription: unsubscribePresentation !== null,
    subscriberCount: listeners.size,
  })

  const publish = (next: RoomBookMountSnapshot): RoomBookMountSnapshot => {
    const previous = snapshot
    snapshot = next
    if (next === previous) return snapshot
    listeners.forEach((listener) => {
      try {
        listener(snapshot, previous)
      } catch {
        // Derived subscribers cannot interrupt sibling delivery or state commits.
      }
    })
    return snapshot
  }

  const derive = (
    source: RoomBookMountDerivationAuditEntry['source'],
  ): RoomBookMountSnapshot => {
    const next = deriveRoomBookMountSnapshot(presentation.getSnapshot(), navigation)
    mountDerivationAuditSequence += 1
    mountDerivationSequence.push(Object.freeze({
      sequence: mountDerivationAuditSequence,
      epoch: activeEpoch,
      source,
      mountPageId: next.mount?.visual.pageId ?? null,
    }))
    return next
  }

  const connect = (): RoomBookMountSnapshot => {
    if (connected) return snapshot
    connected = true
    connectionCycle += 1
    lastDisconnectCleanupFailed = false
    const epoch = ++activeEpoch
    unsubscribePresentation = presentation.subscribe((presentationSnapshot) => {
      if (!connected || epoch !== activeEpoch) return
      if (
        presentationSnapshot.activeSurface !== 'book' ||
        presentationSnapshot.presentation?.surface !== 'book'
      ) {
        navigation = initialBookNavigationState
      }
      const next = deriveRoomBookMountSnapshot(presentationSnapshot, navigation)
      mountDerivationAuditSequence += 1
      mountDerivationSequence.push(Object.freeze({
        sequence: mountDerivationAuditSequence,
        epoch,
        source: 'presentation',
        mountPageId: next.mount?.visual.pageId ?? null,
      }))
      publish(next)
    })
    snapshot = derive('connect')
    return snapshot
  }

  const disconnect = (): void => {
    if (!connected) return
    const disconnectedEpoch = activeEpoch
    connected = false
    activeEpoch += 1
    const release = unsubscribePresentation
    unsubscribePresentation = null
    lastDisconnectCleanupFailed = false
    try {
      release?.()
    } catch {
      lastDisconnectCleanupFailed = true
    }
    listeners.clear()
    lastTeardown = Object.freeze({
      epoch: disconnectedEpoch,
      cycle: connectionCycle,
      navigationSequence: navigationAuditSequence,
      mountDerivationSequence: mountDerivationAuditSequence,
      cleanupFailed: lastDisconnectCleanupFailed,
    })
  }

  return Object.freeze({
    connect,
    disconnect,
    teardown: disconnect,
    navigate(action: BookNavigationAction) {
      if (!connected) return snapshot
      const nextNavigation = reduceBookNavigation(navigation, action, 4)
      if (nextNavigation === navigation) return snapshot
      navigation = nextNavigation
      lastNavigationAction = action
      navigationAuditSequence += 1
      navigationSequence.push(Object.freeze({
        sequence: navigationAuditSequence,
        epoch: activeEpoch,
        action,
        pageIndex: navigation.pageIndex,
        status: navigation.status,
      }))
      return publish(derive('navigation'))
    },
    getSnapshot: () => snapshot,
    getDiagnostics: () => Object.freeze({
      connected,
      connectionCycle,
      connectionEpoch: activeEpoch,
      ownership: getOwnership(),
      lastNavigationAction,
      lastDisconnectCleanupFailed,
      navigationSequence: Object.freeze([...navigationSequence]),
      mountDerivationSequence: Object.freeze([...mountDerivationSequence]),
      lastTeardown,
    }),
    getOwnership,
    isConnected: () => connected,
    subscribe(listener: RoomBookDerivedSnapshotListener) {
      if (!connected) return () => undefined
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
