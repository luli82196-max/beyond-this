import { strict as assert } from 'node:assert'
import { test } from 'node:test'
import type { RoomInteractionTransition } from '../../content'
import { createPresentationStateContainer } from './roomPresentationStateContainer'
import { resolveRoomBookReadOnlyMount } from './roomBookReadOnlyMount'
import { resolveBookVisualPresentationState } from './roomBookVisualPresentationState'

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

test('maps a read-only mount into an immutable Room-ready visual state', () => {
  const container = createPresentationStateContainer()
  const mount = resolveRoomBookReadOnlyMount(container.dispatch(transition('book', 'deep')), 1)
  const visual = resolveBookVisualPresentationState(mount)

  assert.ok(visual)
  assert.equal(visual.spatialState, 'reading')
  assert.deepEqual(visual.page, { currentPage: 2, pageCount: 4, transitionIntent: 'none' })
  assert.equal(visual.content.pageId, 'visual-rule')
  assert.equal(Object.isFrozen(visual), true)
  assert.equal(Object.isFrozen(visual.page), true)
})

test('closed Book has no visual output', () => {
  const container = createPresentationStateContainer()
  const mount = resolveRoomBookReadOnlyMount(container.dispatch(transition('book', 'passing')), 0)
  assert.equal(resolveBookVisualPresentationState(mount), null)
})

test('page changes create a new state with directional transition intent', () => {
  const container = createPresentationStateContainer()
  const snapshot = container.dispatch(transition('book', 'deep'))
  const first = resolveBookVisualPresentationState(resolveRoomBookReadOnlyMount(snapshot, 0))
  const next = resolveBookVisualPresentationState(resolveRoomBookReadOnlyMount(snapshot, 1), first)
  const replaced = resolveBookVisualPresentationState(resolveRoomBookReadOnlyMount(snapshot, 3), next)

  assert.ok(first && next && replaced)
  assert.notEqual(first, next)
  assert.equal(next.page.transitionIntent, 'next')
  assert.equal(replaced.page.transitionIntent, 'replace')
  assert.equal(next.content.pageId, 'visual-rule')
})

test('visual language tokens and page semantics are immutable and page-specific', () => {
  const container = createPresentationStateContainer()
  const snapshot = container.dispatch(transition('book', 'focus'))
  const expected = [
    ['archive', 'minimal', 'archive-entry'],
    ['rule-study', 'rule', 'rule-evidence'],
    ['decision-edit', 'contrast', 'editorial-judgement'],
    ['material-study', 'atmospheric', 'material-memory'],
  ] as const

  expected.forEach(([layout, emphasis, role], pageIndex) => {
    const visual = resolveBookVisualPresentationState(
      resolveRoomBookReadOnlyMount(snapshot, pageIndex),
    )
    assert.ok(visual)
    assert.equal(visual.tokens.layout, layout)
    assert.equal(visual.tokens.emphasis, emphasis)
    assert.equal(visual.semantics.role, role)
    assert.equal(Object.isFrozen(visual.tokens), true)
    assert.equal(Object.isFrozen(visual.semantics), true)
  })
})

test('lifecycle maps to resting, opened, and reading spatial states', () => {
  const container = createPresentationStateContainer()
  const preview = resolveBookVisualPresentationState(
    resolveRoomBookReadOnlyMount(container.dispatch(transition('book', 'ambient')), 3),
  )
  const opened = resolveBookVisualPresentationState(
    resolveRoomBookReadOnlyMount(container.dispatch(transition('book', 'focus')), 2),
  )
  const reading = resolveBookVisualPresentationState(
    resolveRoomBookReadOnlyMount(container.dispatch(transition('book', 'deep')), 2),
  )

  assert.equal(preview?.spatialState, 'resting')
  assert.equal(preview?.content.pageId, 'cover')
  assert.equal(opened?.spatialState, 'opened')
  assert.equal(reading?.spatialState, 'reading')
})

test('surface switch clears visual output without retaining the previous page', () => {
  const container = createPresentationStateContainer()
  const book = resolveBookVisualPresentationState(
    resolveRoomBookReadOnlyMount(container.dispatch(transition('book', 'deep')), 3),
  )
  const switchedMount = resolveRoomBookReadOnlyMount(
    container.dispatch(transition('interface', 'focus')),
    3,
  )

  assert.equal(book?.content.pageId, 'material-memory')
  assert.equal(resolveBookVisualPresentationState(switchedMount, book), null)
})
