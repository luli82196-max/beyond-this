import { strict as assert } from 'node:assert'
import { test } from 'node:test'
import type { InteractionState, RoomInteractionTransition, RoomSurface } from '../../content'
import { resolvePresentationState, resolveRoomPresentation } from './roomPresentationBridge'

function transition(
  surface: RoomSurface,
  previous: InteractionState,
  current: InteractionState,
  type: RoomInteractionTransition['event']['type'],
): RoomInteractionTransition {
  return { event: { surface, type }, previous, current, changed: previous !== current }
}

test('interaction states map to the shared presentation lifecycle', () => {
  assert.equal(resolvePresentationState('passing'), 'closed')
  assert.equal(resolvePresentationState('ambient'), 'preview')
  assert.equal(resolvePresentationState('focus'), 'focused')
  assert.equal(resolvePresentationState('deep'), 'deep')
})

test('interface resolves BT-P03 Creative Decisions from the registry', () => {
  const model = resolveRoomPresentation(transition('interface', 'focus', 'deep', 'activate'))
  assert.equal(model?.fragmentId, 'bt-p03-creative-decisions')
  assert.equal(model?.workId, 'bt-p03-after-the-second-sunset')
  assert.equal(model?.mode, 'process')
  assert.equal(model?.state, 'deep')
  assert.equal(model?.content.kind, 'process')
  assert.equal(model?.content.heading, 'Creative Decisions')
  assert.equal(model?.content.decisions.length, 3)
  assert.deepEqual(
    Object.keys(model?.content.decisions[0] ?? {}),
    ['id', 'title', 'attempt', 'problem', 'decision', 'rule'],
  )
})

test('leaving closes the process presentation', () => {
  const model = resolveRoomPresentation(transition('interface', 'deep', 'passing', 'leave'))
  assert.equal(model?.state, 'closed')
})

test('Book resolves four structured local-placeholder pages', () => {
  const model = resolveRoomPresentation(transition('book', 'focus', 'deep', 'activate'))
  assert.equal(model?.mode, 'book')
  assert.equal(model?.state, 'deep')
  assert.equal(model?.content.kind, 'book')
  if (model?.content.kind !== 'book') assert.fail('Expected Book presentation')
  assert.deepEqual(model.content.pages.map(({ id }) => id), [
    'cover', 'visual-rule', 'rejected-directions', 'material-memory',
  ])
  assert.equal(model.content.pages.every((page) => page.placeholder.kind === 'local-placeholder'), true)
})

test('Projection resolves the implemented BT-P03 motion presentation', () => {
  const model = resolveRoomPresentation(transition('projection', 'focus', 'deep', 'activate'))
  assert.equal(model?.fragmentId, 'bt-p03-motion-study')
  assert.equal(model?.workId, 'bt-p03-after-the-second-sunset')
  assert.equal(model?.mode, 'projection')
  assert.equal(model?.state, 'deep')
  assert.equal(model?.content.kind, 'projection')
})
