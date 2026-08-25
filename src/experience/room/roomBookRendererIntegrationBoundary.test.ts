import { strict as assert } from 'node:assert'
import { test } from 'node:test'
import type { RoomInteractionTransition } from '../../content'
import { resolveRoomBookReadOnlyMount } from './roomBookReadOnlyMount'
import { createBookRendererIntegrationBoundary } from './roomBookRendererIntegrationBoundary'
import { resolveBookRendererPrototype } from './roomBookRendererPrototype'
import { resolveBookVisualPresentationState } from './roomBookVisualPresentationState'
import { createPresentationStateContainer } from './roomPresentationStateContainer'

function source(pageIndex = 0) {
  const transition = Object.freeze({
    event: Object.freeze({ surface: 'book', type: 'activate' }),
    previous: 'focus',
    current: 'deep',
    changed: true,
  }) as RoomInteractionTransition
  const snapshot = createPresentationStateContainer().dispatch(transition)
  const visual = resolveBookVisualPresentationState(resolveRoomBookReadOnlyMount(snapshot, pageIndex))
  const prototype = resolveBookRendererPrototype(visual)
  assert.ok(prototype)
  return prototype
}

test('maps renderer prototype data into a mounted lifecycle model', () => {
  const boundary = createBookRendererIntegrationBoundary()
  boundary.connect()
  const mounted = boundary.consume(source(1))

  assert.ok(mounted)
  assert.deepEqual(mounted, {
    kind: 'book-renderer-mount-lifecycle', lifecycle: 'mounted', ownershipCycle: 1,
    mountId: 1, sourceKind: 'book-visual-presentation-state',
    workId: 'bt-p03-after-the-second-sunset', fragmentId: 'bt-p03-visual-development-book',
    pageId: 'visual-rule', presentation: 'complete-current-page',
  })
})

test('mount lifecycle follows detached, prepared, mounted, and released order', () => {
  const boundary = createBookRendererIntegrationBoundary()
  const states = ['detached']
  boundary.connect()
  boundary.subscribe((current) => states.push(current.lifecycle))
  boundary.consume(source())
  boundary.release()

  assert.deepEqual(states, ['detached', 'prepared', 'mounted', 'released'])
  assert.equal(boundary.getMount(), null)
})

test('release removes the mount and old subscribers receive no later notifications', () => {
  const boundary = createBookRendererIntegrationBoundary()
  boundary.connect()
  let notifications = 0
  boundary.subscribe(() => { notifications += 1 })
  boundary.consume(source())
  boundary.disconnect()
  const releasedNotifications = notifications
  boundary.connect()
  boundary.consume(source(1))

  assert.equal(notifications, releasedNotifications)
  assert.equal(boundary.getMount()?.ownershipCycle, 2)
})

test('page replacement releases the old mount without retaining its page', () => {
  const boundary = createBookRendererIntegrationBoundary()
  const states: Array<[string, string | null]> = []
  boundary.connect()
  boundary.subscribe((current) => states.push([current.lifecycle, current.pageId]))
  const first = boundary.consume(source(0))
  const next = boundary.consume(source(2))

  assert.ok(first && next)
  assert.notEqual(first.mountId, next.mountId)
  assert.equal(next.pageId, 'rejected-directions')
  assert.equal(JSON.stringify(boundary.getMount()).includes('cover'), false)
  assert.deepEqual(states.slice(-4).map(([state]) => state), [
    'released', 'detached', 'prepared', 'mounted',
  ])
})

test('integration boundary does not modify or own the source model', () => {
  const boundary = createBookRendererIntegrationBoundary()
  const prototype = source(3)
  const before = JSON.stringify(prototype)
  boundary.connect()
  const mounted = boundary.consume(prototype)

  assert.equal(JSON.stringify(prototype), before)
  assert.equal(Object.isFrozen(prototype), true)
  assert.equal(Object.isFrozen(mounted), true)
  assert.equal('source' in (mounted ?? {}), false)
})

test('reconnect creates one fresh ownership cycle and repeated connect is idempotent', () => {
  const boundary = createBookRendererIntegrationBoundary()
  const firstDetached = boundary.connect()
  assert.equal(boundary.connect(), firstDetached)
  const first = boundary.consume(source())
  boundary.disconnect()
  const secondDetached = boundary.connect()
  assert.equal(boundary.connect(), secondDetached)
  const second = boundary.consume(source())

  assert.ok(first && second)
  assert.equal(first.ownershipCycle, 1)
  assert.equal(second.ownershipCycle, 2)
  assert.notEqual(first.mountId, second.mountId)
})
