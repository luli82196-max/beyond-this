import { strict as assert } from 'node:assert'
import { test } from 'node:test'
import type { RoomInteractionTransition } from '../../content'
import {
  deriveRoomBookMountSnapshot,
  initialBookNavigationState,
  reduceBookNavigation,
  type BookNavigationState,
} from './roomBookNavigationSnapshotDerivation'
import { createPresentationStateContainer } from './roomPresentationStateContainer'

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

function next(state: BookNavigationState, action: 'next' | 'previous' | 'close' | 'reopen') {
  return reduceBookNavigation(state, action, 4)
}

test('navigation changes automatically derive the current immutable mount page', () => {
  const presentation = createPresentationStateContainer().dispatch(transition('book', 'deep'))
  const first = deriveRoomBookMountSnapshot(presentation, initialBookNavigationState)
  const navigation = next(initialBookNavigationState, 'next')
  const second = deriveRoomBookMountSnapshot(presentation, navigation)

  assert.equal(first.mount?.visual.pageId, 'cover')
  assert.equal(second.mount?.visual.pageId, 'visual-rule')
  assert.notEqual(first.mount, second.mount)
  assert.equal(second.mount?.visual.bodyBlocks.some((block) => block.id.startsWith('cover-')), false)
  assert.equal(Object.isFrozen(second), true)
  assert.equal(Object.isFrozen(second.navigation), true)
  assert.equal(Object.isFrozen(second.mount), true)
})

test('the same input deterministically produces equivalent mount snapshots', () => {
  const presentation = createPresentationStateContainer().dispatch(transition('book', 'focus'))
  const navigation = next(initialBookNavigationState, 'next')
  const first = deriveRoomBookMountSnapshot(presentation, navigation)
  const second = deriveRoomBookMountSnapshot(presentation, navigation)

  assert.deepEqual(first, second)
  assert.equal(first.navigation, second.navigation)
})

test('close clears the mount and reopen returns to the same initial page', () => {
  const presentation = createPresentationStateContainer().dispatch(transition('book', 'deep'))
  const pageTwo = next(initialBookNavigationState, 'next')
  const closed = next(pageTwo, 'close')
  const reopened = next(closed, 'reopen')

  assert.equal(deriveRoomBookMountSnapshot(presentation, closed).mount, null)
  assert.equal(reopened, initialBookNavigationState)
  assert.equal(deriveRoomBookMountSnapshot(presentation, reopened).mount?.visual.pageId, 'cover')
})

test('surface switch clears the derived mount without retaining the old page', () => {
  const container = createPresentationStateContainer()
  const book = container.dispatch(transition('book', 'deep'))
  const pageTwo = next(initialBookNavigationState, 'next')
  const before = deriveRoomBookMountSnapshot(book, pageTwo)
  const switched = deriveRoomBookMountSnapshot(
    container.dispatch(transition('interface', 'focus')),
    pageTwo,
  )

  assert.equal(before.mount?.visual.pageId, 'visual-rule')
  assert.equal(switched.mount, null)
})

test('repeated transitions and navigation boundaries are idempotent', () => {
  const container = createPresentationStateContainer()
  const presentation = container.dispatch(transition('book', 'focus'))
  const unchangedPresentation = container.dispatch(Object.freeze({
    ...transition('book', 'focus'),
    changed: false,
  }))
  const start = next(initialBookNavigationState, 'previous')
  const closed = next(start, 'close')

  assert.equal(unchangedPresentation, presentation)
  assert.equal(start, initialBookNavigationState)
  assert.equal(next(closed, 'close'), closed)
  assert.equal(next(closed, 'next'), closed)
  assert.equal(next(initialBookNavigationState, 'reopen'), initialBookNavigationState)
})
