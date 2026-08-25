import { strict as assert } from 'node:assert'
import { test } from 'node:test'
import { createRoomInteractionController } from './roomInteractionController'
import { createRoomPresentationConnection } from './roomPresentationConnection'
import { createRoomBookDerivedSnapshotConnection } from './roomBookDerivedSnapshotConnection'

function setup() {
  const controller = createRoomInteractionController()
  const presentation = createRoomPresentationConnection(controller)
  presentation.connect()
  const derived = createRoomBookDerivedSnapshotConnection(presentation)
  return { controller, presentation, derived }
}

function openDeep(controller: ReturnType<typeof createRoomInteractionController>) {
  controller.dispatch(Object.freeze({ surface: 'book', type: 'approach' }))
  controller.dispatch(Object.freeze({ surface: 'book', type: 'attend' }))
  controller.dispatch(Object.freeze({ surface: 'book', type: 'activate' }))
}

test('connect derives the current immutable Book mount', () => {
  const { controller, derived } = setup()
  openDeep(controller)
  const snapshot = derived.connect()
  assert.equal(snapshot.mount?.visual.pageId, 'cover')
  assert.equal(Object.isFrozen(snapshot), true)
  assert.deepEqual(derived.getOwnership(), { presentationSubscription: true, subscriberCount: 0 })
})

test('navigation updates derive and notify the next page', () => {
  const { controller, derived } = setup()
  openDeep(controller)
  derived.connect()
  const pages: Array<string | undefined> = []
  derived.subscribe((snapshot) => pages.push(snapshot.mount?.visual.pageId))
  derived.navigate('next')
  assert.deepEqual(pages, ['visual-rule'])
  assert.equal(derived.getDiagnostics().lastNavigationAction, 'next')
})

test('disconnect stops navigation and upstream notifications', () => {
  const { controller, derived } = setup()
  openDeep(controller)
  derived.connect()
  let notifications = 0
  derived.subscribe(() => { notifications += 1 })
  const before = derived.getSnapshot()
  derived.disconnect()
  derived.navigate('next')
  controller.dispatch(Object.freeze({ surface: 'book', type: 'retreat' }))
  assert.equal(notifications, 0)
  assert.equal(derived.getSnapshot(), before)
  assert.deepEqual(derived.getOwnership(), { presentationSubscription: false, subscriberCount: 0 })
})

test('subscriber errors are isolated from sibling subscribers', () => {
  const { controller, derived } = setup()
  openDeep(controller)
  derived.connect()
  let delivered = 0
  derived.subscribe(() => { throw new Error('subscriber failure') })
  derived.subscribe(() => { delivered += 1 })
  assert.doesNotThrow(() => derived.navigate('next'))
  assert.equal(delivered, 1)
  assert.equal(derived.getSnapshot().mount?.visual.pageId, 'visual-rule')
})

test('surface switch publishes a null mount without stale Book content', () => {
  const { controller, derived } = setup()
  openDeep(controller)
  derived.connect()
  derived.navigate('next')
  const mounts: Array<string | null> = []
  derived.subscribe((snapshot) => mounts.push(snapshot.mount?.visual.pageId ?? null))
  controller.dispatch(Object.freeze({ surface: 'interface', type: 'approach' }))
  assert.deepEqual(mounts, [null])
  assert.equal(derived.getSnapshot().mount, null)
})

test('teardown is idempotent and reconnect creates fresh ownership', () => {
  const { controller, derived } = setup()
  openDeep(controller)
  derived.connect()
  derived.teardown()
  assert.doesNotThrow(() => derived.teardown())
  assert.equal(derived.getDiagnostics().connectionCycle, 1)
  derived.connect()
  assert.equal(derived.getDiagnostics().connectionCycle, 2)
  assert.equal(derived.getDiagnostics().connected, true)
  assert.equal(derived.getOwnership().presentationSubscription, true)
})
