import { strict as assert } from 'node:assert'
import { test } from 'node:test'
import type { RoomInteractionTransition } from '../../content'
import { resolveRoomBookReadOnlyMount } from './roomBookReadOnlyMount'
import { resolveBookRendererPrototype } from './roomBookRendererPrototype'
import { resolveBookVisualPresentationState } from './roomBookVisualPresentationState'
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

function visual(
  lifecycle: 'ambient' | 'focus' | 'deep',
  pageIndex: number,
  previous = null as ReturnType<typeof resolveBookVisualPresentationState>,
) {
  const container = createPresentationStateContainer()
  const mount = resolveRoomBookReadOnlyMount(
    container.dispatch(transition('book', lifecycle)),
    pageIndex,
  )
  return resolveBookVisualPresentationState(mount, previous)
}

test('maps Visual State into renderer-ready spatial models', () => {
  const resting = resolveBookRendererPrototype(visual('ambient', 3))
  const opened = resolveBookRendererPrototype(visual('focus', 1))
  const reading = resolveBookRendererPrototype(visual('deep', 2))

  assert.ok(resting && opened && reading)
  assert.equal(resting.presentation, 'static-object')
  assert.equal(resting.page, null)
  assert.equal(opened.presentation, 'current-page-structure')
  assert.equal(opened.page.pageId, 'visual-rule')
  assert.equal(opened.semantics, null)
  assert.equal(reading.presentation, 'complete-current-page')
  assert.equal(reading.page.pageId, 'rejected-directions')
  assert.equal(reading.semantics.role, 'editorial-judgement')
})

test('closed Book and a surface switch have no renderer output', () => {
  assert.equal(resolveBookRendererPrototype(null), null)

  const container = createPresentationStateContainer()
  const book = visual('deep', 1)
  const switchedMount = resolveRoomBookReadOnlyMount(
    container.dispatch(transition('interface', 'focus')),
    1,
  )
  const switchedVisual = resolveBookVisualPresentationState(switchedMount, book)
  assert.equal(resolveBookRendererPrototype(switchedVisual), null)
})

test('page updates replace the renderer model without retaining the old page', () => {
  const firstVisual = visual('deep', 0)
  assert.ok(firstVisual)
  const nextVisual = visual('deep', 1, firstVisual)
  const first = resolveBookRendererPrototype(firstVisual)
  const next = resolveBookRendererPrototype(nextVisual)

  assert.ok(first && next)
  assert.notEqual(first, next)
  assert.equal(first.page.pageId, 'cover')
  assert.equal(next.page.pageId, 'visual-rule')
  assert.equal(next.page.currentPage, 2)
  assert.equal(JSON.stringify(next).includes('cover'), false)
})

test('renderer derivation does not modify or take ownership of source state', () => {
  const source = visual('deep', 3)
  assert.ok(source)
  const before = JSON.stringify(source)
  const renderer = resolveBookRendererPrototype(source)

  assert.ok(renderer)
  assert.equal(JSON.stringify(source), before)
  assert.equal(Object.isFrozen(source), true)
  assert.equal(Object.isFrozen(renderer), true)
  assert.equal(Object.isFrozen(renderer.page), true)
  assert.equal(Object.isFrozen(renderer.transition), true)
})

test('transition intent is passed as a non-executing future animation hint', () => {
  const first = visual('deep', 0)
  assert.ok(first)
  const next = visual('deep', 1, first)
  const renderer = resolveBookRendererPrototype(next)

  assert.ok(renderer)
  assert.deepEqual(renderer.transition, { intent: 'next', execute: false })
  assert.equal('duration' in renderer.transition, false)
  assert.equal('animation' in renderer.transition, false)
})
