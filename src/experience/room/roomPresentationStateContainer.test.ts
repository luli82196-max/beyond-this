import { strict as assert } from 'node:assert'
import { test } from 'node:test'
import {
  processPresentationAccessibility,
  type InteractionState,
  type RoomInteractionTransition,
  type RoomSurface,
} from '../../content'
import { createPresentationStateContainer } from './roomPresentationStateContainer'

function transition(
  surface: RoomSurface,
  previous: InteractionState,
  current: InteractionState,
  type: RoomInteractionTransition['event']['type'],
): RoomInteractionTransition {
  return Object.freeze({
    event: Object.freeze({ surface, type }),
    previous,
    current,
    changed: previous !== current,
  })
}

test('container follows the Process lifecycle with immutable snapshots', () => {
  const container = createPresentationStateContainer()
  assert.equal(container.getSnapshot().presentation, null)

  const preview = container.dispatch(transition('interface', 'passing', 'ambient', 'approach'))
  const focused = container.dispatch(transition('interface', 'ambient', 'focus', 'attend'))
  const deep = container.dispatch(transition('interface', 'focus', 'deep', 'activate'))

  assert.equal(preview.presentation?.state, 'preview')
  assert.equal(focused.presentation?.state, 'focused')
  assert.equal(deep.presentation?.state, 'deep')
  assert.equal(Object.isFrozen(deep), true)
  assert.equal(Object.isFrozen(deep.presentation), true)
})

test('duplicate transitions are idempotent and do not notify subscribers', () => {
  const container = createPresentationStateContainer()
  let notifications = 0
  const unsubscribe = container.subscribe(() => { notifications += 1 })

  container.dispatch(transition('interface', 'passing', 'ambient', 'approach'))
  const beforeDuplicate = container.getSnapshot()
  const duplicate = container.dispatch(transition('interface', 'ambient', 'ambient', 'approach'))

  assert.equal(duplicate, beforeDuplicate)
  assert.equal(notifications, 1)
  unsubscribe()
  container.dispatch(transition('interface', 'ambient', 'focus', 'attend'))
  assert.equal(notifications, 1)
})

test('leave closes Process and switching surface replaces the previous presentation', () => {
  const leaveContainer = createPresentationStateContainer()
  leaveContainer.dispatch(transition('interface', 'focus', 'deep', 'activate'))
  const left = leaveContainer.dispatch(transition('interface', 'deep', 'passing', 'leave'))
  assert.equal(left.activeSurface, null)
  assert.equal(left.presentation?.state, 'closed')

  const switchContainer = createPresentationStateContainer()
  switchContainer.dispatch(transition('interface', 'focus', 'deep', 'activate'))
  const switched = switchContainer.dispatch(transition('projection', 'passing', 'ambient', 'approach'))
  assert.equal(switched.activeSurface, 'projection')
  assert.equal(switched.presentation?.surface, 'projection')
  assert.equal(switched.presentation?.state, 'preview')
})

test('keyboard accessibility contract is deterministic and listener-free', () => {
  assert.deepEqual(processPresentationAccessibility.tabOrder, ['book', 'projection', 'interface'])
  assert.deepEqual(
    processPresentationAccessibility.mapKeyboardAction('interface', 'focus').map(({ type }) => type),
    ['approach', 'attend'],
  )
  assert.deepEqual(
    processPresentationAccessibility.mapKeyboardAction('interface', 'confirm').map(({ type }) => type),
    ['activate'],
  )
  assert.deepEqual(
    processPresentationAccessibility.mapKeyboardAction('interface', 'escape').map(({ type }) => type),
    ['retreat'],
  )
})

test('surface switching replaces an active Book presentation atomically', () => {
  const container = createPresentationStateContainer()
  const book = container.dispatch(transition('book', 'passing', 'ambient', 'approach'))
  assert.equal(book.activeSurface, 'book')
  assert.equal(book.presentation?.mode, 'book')
  assert.equal(book.presentation?.state, 'preview')

  const switched = container.dispatch(transition('projection', 'passing', 'ambient', 'approach'))
  assert.equal(switched.activeSurface, 'projection')
  assert.equal(switched.presentation?.surface, 'projection')
  assert.equal(switched.presentation?.state, 'preview')
})
