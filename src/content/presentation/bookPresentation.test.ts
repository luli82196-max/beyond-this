import { strict as assert } from 'node:assert'
import { test } from 'node:test'
import { createBookPresentationNavigation } from './bookPresentationNavigation'
import { resolveRoomPresentation } from '../../experience/room/roomPresentationBridge'

function bookModel() {
  const model = resolveRoomPresentation(Object.freeze({
    event: Object.freeze({ surface: 'book' as const, type: 'activate' as const }),
    previous: 'focus' as const,
    current: 'deep' as const,
    changed: true,
  }))
  if (!model || model.content.kind !== 'book') throw new Error('Expected Book model')
  return model
}

test('Book page navigation follows page index and bounds', () => {
  const navigation = createBookPresentationNavigation(bookModel())
  assert.equal(navigation.getSnapshot().page.id, 'cover')
  assert.equal(navigation.next().page.id, 'visual-rule')
  assert.equal(navigation.next().page.id, 'rejected-directions')
  assert.equal(navigation.next().page.id, 'material-memory')
  const end = navigation.getSnapshot()
  assert.equal(navigation.next(), end)
  assert.equal(navigation.previous().page.id, 'rejected-directions')
})

test('repeated boundary and close inputs are idempotent', () => {
  const navigation = createBookPresentationNavigation(bookModel())
  const start = navigation.getSnapshot()
  assert.equal(navigation.previous(), start)
  const closed = navigation.close()
  assert.equal(closed.presentation.state, 'closed')
  assert.equal(navigation.close(), closed)
  assert.equal(navigation.next(), closed)
  assert.equal(navigation.previous(), closed)
})

test('Book models are deeply immutable at the content boundary', () => {
  const model = bookModel()
  assert.equal(Object.isFrozen(model), true)
  assert.equal(Object.isFrozen(model.content), true)
  assert.equal(Object.isFrozen(model.content.pages), true)
  assert.equal(Object.isFrozen(model.content.pages[0]), true)
  assert.equal(Object.isFrozen(model.content.pages[0].body), true)
  assert.equal(Object.isFrozen(model.content.pages[0].placeholder), true)
})
