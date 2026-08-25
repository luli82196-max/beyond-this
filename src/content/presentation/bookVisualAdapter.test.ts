import { strict as assert } from 'node:assert'
import { test } from 'node:test'
import { resolveRoomPresentation } from '../../experience/room/roomPresentationBridge'
import { adaptBookPresentation } from './bookVisualAdapter'

function resolve(surface: 'book' | 'interface', current: 'focus' | 'deep' | 'passing' = 'deep') {
  return resolveRoomPresentation(Object.freeze({
    event: Object.freeze({ surface, type: 'activate' as const }),
    previous: 'focus' as const,
    current,
    changed: true,
  }))
}

test('maps all four Book pages into lightweight visual data', () => {
  const book = resolve('book')
  const expected = [
    ['cover', 'After the Second Sunset'],
    ['visual-rule', 'Visual Rule'],
    ['rejected-directions', 'Rejected Directions'],
    ['material-memory', 'Material Memory'],
  ] as const

  expected.forEach(([pageId, title], pageIndex) => {
    const visual = adaptBookPresentation(book, pageIndex)
    assert.ok(visual)
    assert.equal(visual.pageId, pageId)
    assert.equal(visual.pageTitle.primary, title)
    assert.equal(visual.bodyBlocks.length, pageIndex === 0 ? 1 : 2)
    assert.equal(visual.mediaSlots[0].kind, 'placeholder')
    assert.equal(visual.mediaSlots[0].source, null)
    assert.equal(visual.emphasisTokens.informationDensity, 'low')
    assert.equal(visual.emphasisTokens.languageHierarchy, 'primary-with-optional-secondary')
  })
})

test('maps page index, progress, and interaction availability', () => {
  const book = resolve('book')
  const first = adaptBookPresentation(book, 0)
  const last = adaptBookPresentation(book, 3)
  assert.ok(first && last)
  assert.deepEqual(first.progress, { current: 1, total: 4, ratio: 0.25, label: '01 / 04' })
  assert.deepEqual(last.progress, { current: 4, total: 4, ratio: 1, label: '04 / 04' })
  assert.equal(first.interactionHints[0].available, false)
  assert.equal(first.interactionHints[1].available, true)
  assert.equal(last.interactionHints[0].available, true)
  assert.equal(last.interactionHints[1].available, false)
})

test('closed Book and invalid page indices return no visual data', () => {
  assert.equal(adaptBookPresentation(resolve('book', 'passing'), 0), null)
  assert.equal(adaptBookPresentation(resolve('book'), -1), null)
  assert.equal(adaptBookPresentation(resolve('book'), 4), null)
})

test('surface switch cannot retain an old Book page model', () => {
  const oldPage = adaptBookPresentation(resolve('book'), 2)
  assert.equal(oldPage?.pageId, 'rejected-directions')
  assert.equal(adaptBookPresentation(resolve('interface'), 2), null)
  assert.equal(adaptBookPresentation(null, 2), null)
})

test('adapter output and nested visual contracts are immutable', () => {
  const visual = adaptBookPresentation(resolve('book'), 1)
  assert.ok(visual)
  assert.equal(Object.isFrozen(visual), true)
  assert.equal(Object.isFrozen(visual.pageTitle), true)
  assert.equal(Object.isFrozen(visual.bodyBlocks), true)
  assert.equal(Object.isFrozen(visual.bodyBlocks[0]), true)
  assert.equal(Object.isFrozen(visual.bodyBlocks[0].text), true)
  assert.equal(Object.isFrozen(visual.emphasisTokens), true)
  assert.equal(Object.isFrozen(visual.mediaSlots), true)
  assert.equal(Object.isFrozen(visual.progress), true)
  assert.equal(Object.isFrozen(visual.interactionHints), true)
})
