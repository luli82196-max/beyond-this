import { strict as assert } from 'node:assert'
import { test } from 'node:test'
import type { RoomInteractionTransition } from '../../content'
import { createPresentationStateContainer } from './roomPresentationStateContainer'
import { resolveRoomBookReadOnlyMount } from './roomBookReadOnlyMount'

function transition(
  surface: 'book' | 'interface',
  current: 'ambient' | 'focus' | 'deep' | 'passing',
): RoomInteractionTransition {
  return Object.freeze({
    event: Object.freeze({ surface, type: current === 'passing' ? 'leave' : 'activate' }),
    previous: current === 'ambient' ? 'passing' : 'focus',
    current,
    changed: true,
  })
}

test('generates an immutable Room Book mount from visual-adapter output', () => {
  const container = createPresentationStateContainer()
  const snapshot = container.dispatch(transition('book', 'focus'))
  const mount = resolveRoomBookReadOnlyMount(snapshot, 1)

  assert.ok(mount)
  assert.equal(mount.kind, 'room-book-read-only-mount')
  assert.equal(mount.surface, 'book')
  assert.equal(mount.visual.pageId, 'visual-rule')
  assert.equal(mount.visual.mediaSlots[0].source, null)
  assert.equal(Object.isFrozen(mount), true)
  assert.equal(Object.isFrozen(mount.visual), true)
  assert.equal(Object.isFrozen(mount.visual.bodyBlocks), true)
})

test('maps preview, focused, and deep lifecycle states to read-only layouts', () => {
  const container = createPresentationStateContainer()

  const preview = resolveRoomBookReadOnlyMount(container.dispatch(transition('book', 'ambient')), 2)
  const focused = resolveRoomBookReadOnlyMount(container.dispatch(transition('book', 'focus')), 2)
  const deep = resolveRoomBookReadOnlyMount(container.dispatch(transition('book', 'deep')), 2)

  assert.ok(preview && focused && deep)
  assert.equal(preview.layout, 'cover-preview')
  assert.equal(preview.visual.pageId, 'cover')
  assert.equal(preview.expanded, false)
  assert.equal(focused.layout, 'page')
  assert.equal(focused.visual.pageId, 'rejected-directions')
  assert.equal(focused.expanded, false)
  assert.equal(deep.layout, 'expanded-page')
  assert.equal(deep.visual.pageId, 'rejected-directions')
  assert.equal(deep.expanded, true)
})

test('page changes create a new mount with no previous page residue', () => {
  const container = createPresentationStateContainer()
  const snapshot = container.dispatch(transition('book', 'deep'))
  const first = resolveRoomBookReadOnlyMount(snapshot, 0)
  const next = resolveRoomBookReadOnlyMount(snapshot, 1)

  assert.ok(first && next)
  assert.notEqual(first, next)
  assert.notEqual(first.visual, next.visual)
  assert.equal(first.visual.pageId, 'cover')
  assert.equal(next.visual.pageId, 'visual-rule')
  assert.equal(next.visual.bodyBlocks.some((block) => block.id.startsWith('cover-')), false)
})

test('surface switching clears the old Book mount', () => {
  const container = createPresentationStateContainer()
  const book = resolveRoomBookReadOnlyMount(container.dispatch(transition('book', 'deep')), 3)
  const switched = resolveRoomBookReadOnlyMount(
    container.dispatch(transition('interface', 'focus')),
    3,
  )

  assert.equal(book?.visual.pageId, 'material-memory')
  assert.equal(switched, null)
})

test('closed and non-Book snapshots produce no mount', () => {
  const container = createPresentationStateContainer()
  const closed = container.dispatch(transition('book', 'passing'))
  const nonBook = container.dispatch(transition('interface', 'focus'))

  assert.equal(resolveRoomBookReadOnlyMount(closed, 0), null)
  assert.equal(resolveRoomBookReadOnlyMount(nonBook, 0), null)
})
