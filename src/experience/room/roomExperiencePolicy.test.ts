import { strict as assert } from 'node:assert'
import { test } from 'node:test'
import type { RoomInteractionTransition, RoomSurface } from '../../content'
import { createMediaBoundary } from '../../content'
import { createRoomInteractionAdapter } from './roomInteractionAdapter'
import { createRoomInteractionOrchestrator } from './roomInteractionOrchestrator'
import { resolveRoomMediaIntent } from './roomExperiencePolicy'

function transition(
  surface: RoomSurface,
  previous: RoomInteractionTransition['previous'],
  current: RoomInteractionTransition['current'],
  type: RoomInteractionTransition['event']['type'],
): RoomInteractionTransition {
  return { event: { surface, type }, previous, current, changed: previous !== current }
}

test('passing, ambient, and focus transitions produce no media intent', () => {
  assert.equal(resolveRoomMediaIntent(transition('projection', 'passing', 'ambient', 'approach')), null)
  assert.equal(resolveRoomMediaIntent(transition('projection', 'ambient', 'focus', 'attend')), null)
})

test('deep prepares the fragment bound to each Room surface', () => {
  for (const surface of ['book', 'projection', 'interface'] as const) {
    const result = createRoomInteractionOrchestrator(createMediaBoundary())
      .handleTransition(transition(surface, 'focus', 'deep', 'activate'))
    assert.equal(result.intent?.type, 'prepare')
    assert.equal(result.intent?.surface, surface)
    assert.equal(result.media?.current, 'prepared')
  }
})

test('leave releases the fragment bound to each Room surface', () => {
  for (const surface of ['book', 'projection', 'interface'] as const) {
    const intent = resolveRoomMediaIntent(transition(surface, 'deep', 'passing', 'leave'))
    assert.equal(intent?.type, 'release')
    assert.equal(intent?.surface, surface)
  }
})

test('reduced motion changes no semantic input mapping', () => {
  const regular = createRoomInteractionAdapter({ reducedMotion: false })
  const reduced = createRoomInteractionAdapter({ reducedMotion: true })
  const input = { kind: 'keyboard', action: 'confirm', surface: 'book' } as const
  assert.deepEqual(reduced.mapInput(input), regular.mapInput(input))
})
