import { strict as assert } from 'node:assert'
import { test } from 'node:test'
import type { PresentationSnapshot } from './roomPresentationStateContainer'
import type { RoomPresentationConnection, PresentationConnectionListener } from './roomPresentationConnection'
import { createRoomBookDerivedSnapshotConnection } from './roomBookDerivedSnapshotConnection'
import { createRoomBookDerivedConnectionIntegrationHarness } from './roomBookDerivedConnectionIntegrationHarness'

function openDeep(harness: ReturnType<typeof createRoomBookDerivedConnectionIntegrationHarness>) {
  harness.dispatch('book', 'approach')
  harness.dispatch('book', 'attend')
  harness.dispatch('book', 'activate')
}

test('integration harness connects Presentation through navigation to a Room mount', () => {
  const harness = createRoomBookDerivedConnectionIntegrationHarness()
  harness.connect()
  openDeep(harness)
  assert.equal(harness.derived.getSnapshot().mount?.visual.pageId, 'cover')
  harness.navigate('next')
  assert.equal(harness.derived.getSnapshot().mount?.visual.pageId, 'visual-rule')
  assert.deepEqual(
    harness.derived.getDiagnostics().mountDerivationSequence.map((entry) => entry.source),
    ['connect', 'presentation', 'presentation', 'presentation', 'navigation'],
  )
})

test('multiple lifecycle cycles increment ownership and preserve monotonic audit sequences', () => {
  const harness = createRoomBookDerivedConnectionIntegrationHarness()
  harness.connect()
  openDeep(harness)
  harness.navigate('next')
  harness.disconnect()
  const first = harness.derived.getDiagnostics()
  assert.equal(first.connectionCycle, 1)
  assert.equal(first.lastTeardown?.cycle, 1)
  harness.connect()
  harness.navigate('previous')
  harness.disconnect()
  const second = harness.derived.getDiagnostics()
  assert.equal(second.connectionCycle, 2)
  assert.equal(second.lastTeardown?.cycle, 2)
  assert.deepEqual(second.navigationSequence.map((entry) => entry.sequence), [1, 2])
  assert.equal(Object.isFrozen(second.navigationSequence), true)
  assert.equal(Object.isFrozen(second.lastTeardown), true)
})

test('navigation is inert after teardown and surface switching clears the mount', () => {
  const harness = createRoomBookDerivedConnectionIntegrationHarness()
  harness.connect()
  openDeep(harness)
  harness.navigate('next')
  harness.dispatch('interface', 'approach')
  assert.equal(harness.derived.getSnapshot().mount, null)
  harness.disconnect()
  const before = harness.derived.getSnapshot()
  const auditLength = harness.derived.getDiagnostics().navigationSequence.length
  assert.equal(harness.navigate('next'), before)
  assert.equal(harness.derived.getDiagnostics().navigationSequence.length, auditLength)
})

test('subscriber failures remain isolated in the complete integration chain', () => {
  const harness = createRoomBookDerivedConnectionIntegrationHarness()
  harness.connect()
  openDeep(harness)
  let delivered = 0
  harness.derived.subscribe(() => { throw new Error('expected integration failure') })
  harness.derived.subscribe(() => { delivered += 1 })
  assert.doesNotThrow(() => harness.navigate('next'))
  assert.equal(delivered, 1)
})

test('a callback captured by an old epoch cannot affect a reconnected connection', () => {
  let snapshot: PresentationSnapshot = Object.freeze({ activeSurface: null, presentation: null })
  const callbacks: PresentationConnectionListener[] = []
  const presentation = {
    connect: () => undefined,
    disconnect: () => undefined,
    getDiagnostics: () => { throw new Error('unused') },
    getSnapshot: () => snapshot,
    getOwnership: () => { throw new Error('unused') },
    isConnected: () => true,
    subscribe(listener: PresentationConnectionListener) {
      callbacks.push(listener)
      return () => undefined
    },
    observeDiagnostics: () => () => undefined,
  } satisfies RoomPresentationConnection
  const derived = createRoomBookDerivedSnapshotConnection(presentation)
  derived.connect()
  const stale = callbacks[0]
  derived.disconnect()
  derived.connect()
  const before = derived.getSnapshot()
  stale(snapshot, snapshot)
  assert.equal(derived.getSnapshot(), before)
  assert.equal(derived.getDiagnostics().mountDerivationSequence.length, 2)
})
