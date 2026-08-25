import type { BookRendererPrototypeModel } from './roomBookRendererPrototype'

export type BookRendererMountLifecycle = 'detached' | 'prepared' | 'mounted' | 'released'

export interface BookRendererMountLifecycleModel {
  readonly kind: 'book-renderer-mount-lifecycle'
  readonly lifecycle: BookRendererMountLifecycle
  readonly ownershipCycle: number
  readonly mountId: number | null
  readonly sourceKind: BookRendererPrototypeModel['sourceKind'] | null
  readonly workId: BookRendererPrototypeModel['workId'] | null
  readonly fragmentId: BookRendererPrototypeModel['fragmentId'] | null
  readonly pageId: string | null
  readonly presentation: BookRendererPrototypeModel['presentation'] | null
}

export type BookRendererMountListener = (
  current: BookRendererMountLifecycleModel,
  previous: BookRendererMountLifecycleModel,
) => void

export interface BookRendererIntegrationBoundary {
  readonly connect: () => BookRendererMountLifecycleModel
  readonly consume: (source: BookRendererPrototypeModel | null) => BookRendererMountLifecycleModel | null
  readonly release: () => BookRendererMountLifecycleModel | null
  readonly disconnect: () => void
  readonly getMount: () => BookRendererMountLifecycleModel | null
  readonly getLifecycle: () => BookRendererMountLifecycleModel
  readonly isConnected: () => boolean
  readonly subscribe: (listener: BookRendererMountListener) => () => void
}

function lifecycleModel(
  lifecycle: BookRendererMountLifecycle,
  ownershipCycle: number,
  mountId: number | null,
  source: BookRendererPrototypeModel | null,
): BookRendererMountLifecycleModel {
  return Object.freeze({
    kind: 'book-renderer-mount-lifecycle' as const,
    lifecycle,
    ownershipCycle,
    mountId,
    sourceKind: source?.sourceKind ?? null,
    workId: source?.workId ?? null,
    fragmentId: source?.fragmentId ?? null,
    pageId: source?.page?.pageId ?? null,
    presentation: source?.presentation ?? null,
  })
}

/**
 * Optional, logic-only ownership boundary between renderer prototype data and
 * a future Room renderer. It owns mount lifecycle records, never source data.
 */
export function createBookRendererIntegrationBoundary(): BookRendererIntegrationBoundary {
  const listeners = new Set<BookRendererMountListener>()
  let connected = false
  let ownershipCycle = 0
  let mountSequence = 0
  let activeSource: BookRendererPrototypeModel | null = null
  let mount: BookRendererMountLifecycleModel | null = null
  let lifecycle = lifecycleModel('detached', ownershipCycle, null, null)

  const publish = (next: BookRendererMountLifecycleModel): void => {
    const previous = lifecycle
    lifecycle = next
    listeners.forEach((listener) => {
      try {
        listener(next, previous)
      } catch {
        // A renderer consumer cannot interrupt lifecycle commits or siblings.
      }
    })
  }

  const detach = (): void => {
    activeSource = null
    mount = null
    publish(lifecycleModel('detached', ownershipCycle, null, null))
  }

  const release = (): BookRendererMountLifecycleModel | null => {
    if (!activeSource || !mount) return null
    const released = lifecycleModel('released', ownershipCycle, mount.mountId, activeSource)
    activeSource = null
    mount = null
    publish(released)
    return released
  }

  const prepareAndMount = (
    source: BookRendererPrototypeModel,
  ): BookRendererMountLifecycleModel => {
    mountSequence += 1
    const mountId = mountSequence
    publish(lifecycleModel('prepared', ownershipCycle, mountId, source))
    const mounted = lifecycleModel('mounted', ownershipCycle, mountId, source)
    activeSource = source
    mount = mounted
    publish(mounted)
    return mounted
  }

  return Object.freeze({
    connect() {
      if (connected) return lifecycle
      connected = true
      ownershipCycle += 1
      activeSource = null
      mount = null
      lifecycle = lifecycleModel('detached', ownershipCycle, null, null)
      return lifecycle
    },
    consume(source: BookRendererPrototypeModel | null) {
      if (!connected) return null
      if (!source) {
        release()
        return null
      }
      if (source === activeSource && mount) return mount
      if (activeSource) {
        release()
        detach()
      }
      return prepareAndMount(source)
    },
    release,
    disconnect() {
      if (!connected) return
      release()
      detach()
      connected = false
      listeners.clear()
    },
    getMount: () => mount,
    getLifecycle: () => lifecycle,
    isConnected: () => connected,
    subscribe(listener: BookRendererMountListener) {
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
