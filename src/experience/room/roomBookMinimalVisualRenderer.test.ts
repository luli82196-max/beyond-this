import assert from 'node:assert/strict'
import { createRoomBookEndToEndStabilityHarness } from './roomBookEndToEndStabilityHarness'
import { resolveBookMinimalVisualOutput } from './roomBookMinimalVisualRenderer'

function open() { const harness = createRoomBookEndToEndStabilityHarness(); harness.connect(); harness.dispatch('book', 'approach'); harness.dispatch('book', 'attend'); return harness }
{
  const harness = open(), source = harness.getVisualState(), sourceSnapshot = JSON.stringify(source)
  const output = resolveBookMinimalVisualOutput(harness.renderer.getMount(), source)
  assert.equal(output?.kind, 'book-minimal-visual-output'); assert.equal(output?.visualMode, 'opened-book'); assert.equal(output?.page?.pageId, 'cover'); assert.equal(Object.isFrozen(output), true); assert.equal(JSON.stringify(source), sourceSnapshot)
  assert.deepEqual(output?.capabilities, { mutatesContent: false, controlsNavigation: false, controlsLifecycle: false, executesPageTransition: false })
  harness.disconnect()
}
{
  const harness = open(), first = resolveBookMinimalVisualOutput(harness.renderer.getMount(), harness.getVisualState())
  harness.navigate('next')
  const next = resolveBookMinimalVisualOutput(harness.renderer.getMount(), harness.getVisualState())
  assert.equal(first?.page?.pageId, 'cover'); assert.equal(next?.page?.pageId, 'visual-rule'); assert.notEqual(next, first)
  harness.dispatch('book', 'leave'); assert.equal(resolveBookMinimalVisualOutput(harness.renderer.getMount(), harness.getVisualState()), null); harness.disconnect()
}
{
  const harness = open(), mount = harness.renderer.getMount(), state = harness.getVisualState(); harness.disconnect()
  assert.equal(resolveBookMinimalVisualOutput(mount, null), null); assert.equal(resolveBookMinimalVisualOutput(null, state), null)
}
console.log('Phase 13.8.5 Book Minimal Visual Renderer tests passed')
