import { createRoomBookEndToEndStabilityHarness } from './roomBookEndToEndStabilityHarness'
import { resolveBookMinimalVisualOutput, type BookMinimalVisualOutput } from './roomBookMinimalVisualRenderer'

/** Creates the Room MVP preview outside the renderer, then releases all ownership. */
export function createRoomBookMinimalVisualPreview(): BookMinimalVisualOutput {
  const harness = createRoomBookEndToEndStabilityHarness()
  harness.connect()
  harness.dispatch('book', 'approach')
  harness.dispatch('book', 'attend')
  const output = resolveBookMinimalVisualOutput(harness.renderer.getMount(), harness.getVisualState())
  harness.disconnect()
  if (!output) throw new Error('Unable to create the Room Book visual preview')
  return output
}
