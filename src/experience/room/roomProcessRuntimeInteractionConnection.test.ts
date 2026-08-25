import { afterTheSecondSunset } from '../../content/works/afterTheSecondSunset'
import { createRoomProcessRuntimeInteractionConnection } from './roomProcessRuntimeInteractionConnection'
import { resolveRoomProcessVisualOutput } from './roomProcessVisualAdapter'
import { resolveRoomPresentation } from './roomPresentationBridge'

function assert(condition: unknown, message: string): asserts condition {
  if (!condition) throw new Error(message)
}

const transition = Object.freeze({
  event: Object.freeze({ surface: 'interface', type: 'attend', input: 'pointer' }),
  previous: 'ambient',
  current: 'focus',
  changed: true,
} as const)

const presentation = resolveRoomPresentation(transition)
assert(presentation?.mode === 'process', 'content must resolve to a Process presentation')
assert(presentation.content.decisions.length === 3, 'all Creative Decisions must be consumed')
assert(presentation.content.decisions[0].attempt.length > 0, 'Attempt must be present')
assert(presentation.content.decisions[0].problem.length > 0, 'Problem must be present')
assert(presentation.content.decisions[0].decision.length > 0, 'Decision must be present')
assert(presentation.content.decisions[0].rule.length > 0, 'Rule must be present')

const output = resolveRoomProcessVisualOutput(presentation, 0)
assert(output?.sections.map((section) => section.kind).join(',') === 'attempt,problem,decision,rule', 'visual output must preserve the Process sequence')
assert(Object.isFrozen(output) && Object.isFrozen(output.sections), 'visual output must be immutable')
assert(Object.isFrozen(presentation.content.decisions), 'source decisions must remain immutable')
assert(output?.workId === afterTheSecondSunset.id, 'visual identity must match the canonical work')
assert(output?.capabilities.mutateContent === false && output.capabilities.controlState === false, 'adapter must expose no source or state control')

const runtime = createRoomProcessRuntimeInteractionConnection()
runtime.connect()
const first = runtime.open()
assert(first?.activeDecisionIndex === 0, 'open must start deterministically at the first decision')
assert(runtime.next()?.activeDecisionIndex === 1, 'next must replace the active decision output')
assert(runtime.close() === null, 'close must clean up Process visual output')
assert(runtime.open()?.activeDecisionIndex === 0, 'reopen must return to the first decision')
assert(runtime.switchSurface('book') === null, 'surface switch must release Process output')
assert(runtime.getVisual() === null, 'surface switch cleanup must persist')
runtime.disconnect()
assert(runtime.getVisual() === null, 'disconnect must release runtime visual state')

console.log('Phase MVP-01.2.1 Process Runtime Interaction tests passed.')
