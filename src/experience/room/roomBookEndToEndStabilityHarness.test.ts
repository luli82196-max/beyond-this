import { strict as assert } from 'node:assert'
import { test } from 'node:test'
import { createRoomBookEndToEndStabilityHarness } from './roomBookEndToEndStabilityHarness'

function openDeep(harness: ReturnType<typeof createRoomBookEndToEndStabilityHarness>) {
  harness.dispatch('book', 'approach')
  harness.dispatch('book', 'attend')
  harness.dispatch('book', 'activate')
}

test('runs Book content through presentation, navigation, visual state, prototype and mount', () => {
  const harness = createRoomBookEndToEndStabilityHarness()
  harness.connect()
  openDeep(harness)
  assert.equal(harness.renderer.getMount()?.pageId, 'cover')
  assert.equal(harness.renderer.getMount()?.presentation, 'complete-current-page')
  harness.navigate('next')
  assert.equal(harness.getVisualState()?.page.transitionIntent, 'next')
  assert.equal(harness.renderer.getMount()?.pageId, 'visual-rule')
  harness.navigate('previous')
  assert.equal(harness.getVisualState()?.page.transitionIntent, 'previous')
  assert.equal(harness.renderer.getMount()?.pageId, 'cover')
})

test('keeps lifecycle order deterministic and page replacement residue-free', () => {
  const harness = createRoomBookEndToEndStabilityHarness()
  const events: Array<[string, string | null]> = []
  harness.connect()
  harness.renderer.subscribe((current) => events.push([current.lifecycle, current.pageId]))
  openDeep(harness)
  const coverMountId = harness.renderer.getMount()?.mountId
  harness.navigate('next')
  assert.deepEqual(events.slice(-4).map(([lifecycle]) => lifecycle), [
    'released', 'detached', 'prepared', 'mounted',
  ])
  assert.notEqual(harness.renderer.getMount()?.mountId, coverMountId)
  assert.equal(JSON.stringify(harness.renderer.getMount()).includes('cover'), false)
})

test('close and reopen produce a clean Book mount', () => {
  const harness = createRoomBookEndToEndStabilityHarness()
  harness.connect()
  openDeep(harness)
  harness.navigate('next')
  harness.dispatch('book', 'leave')
  assert.equal(harness.renderer.getMount(), null)
  assert.equal(harness.getVisualState(), null)
  openDeep(harness)
  assert.equal(harness.renderer.getMount()?.pageId, 'cover')
  assert.equal(harness.getVisualState()?.page.transitionIntent, 'none')
})

test('Projection and Process placeholder switches clean up the Book mount', () => {
  for (const surface of ['projection', 'interface'] as const) {
    const harness = createRoomBookEndToEndStabilityHarness()
    harness.connect()
    openDeep(harness)
    harness.dispatch(surface, 'approach')
    assert.equal(harness.renderer.getMount(), null)
    assert.equal(harness.getVisualState(), null)
    assert.equal(harness.renderer.getLifecycle().lifecycle, 'released')
  }
})

test('disconnect and reconnect transfer ownership without stale subscribers', () => {
  const harness = createRoomBookEndToEndStabilityHarness()
  harness.connect()
  openDeep(harness)
  const first = harness.renderer.getMount()
  let staleNotifications = 0
  harness.renderer.subscribe(() => { staleNotifications += 1 })
  harness.disconnect()
  const notificationsAfterDisconnect = staleNotifications
  harness.connect()
  const secondCycle = harness.renderer.getLifecycle().ownershipCycle
  openDeep(harness)
  assert.equal(staleNotifications, notificationsAfterDisconnect)
  assert.equal(first?.ownershipCycle, 1)
  assert.equal(secondCycle, 2)
  assert.equal(harness.room.derived.getOwnership().presentationSubscription, true)
  assert.equal(harness.room.derived.getOwnership().subscriberCount, 1)
})
