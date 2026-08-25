import type { Work, WorkFragment } from '../content.types'
import type { ProcessPresentationContent } from './presentation.types'

const creativeDecisions = Object.freeze([
  Object.freeze({
    id: 'double-sunset-test',
    title: 'Double Sunset Test',
    attempt: 'Treat the second sunset as a repeated visual event.',
    problem: 'Repetition explained the idea but removed uncertainty and emotional residue.',
    decision: 'Keep the first sunset absent and let its effects remain in light and material memory.',
    rule: 'Show the consequence, not the repeated event.',
  }),
  Object.freeze({
    id: 'material-memory-test',
    title: 'Material Memory Test',
    attempt: 'Use pristine surfaces to make the fictional world feel designed and controlled.',
    problem: 'The clean surfaces carried no evidence of time, touch, or an absent viewer.',
    decision: 'Introduce restrained wear and light response as traces rather than decoration.',
    rule: 'Material detail must carry time or human presence.',
  }),
  Object.freeze({
    id: 'tool-visibility-test',
    title: 'Tool Visibility Test',
    attempt: 'Present every production step as proof of the tools used.',
    problem: 'The process became a software demonstration instead of a creative argument.',
    decision: 'Retain only steps where a changed choice altered the final visual system.',
    rule: 'Show decisions, not tool activity.',
  }),
])

/** Builds a media-free process narrative from the canonical registry record. */
export function createProcessPresentationContent(
  work: Work,
  fragment: WorkFragment,
): ProcessPresentationContent {
  if (fragment.placement.mode !== 'process') {
    throw new Error(`Process presentation requires a process fragment: ${fragment.id}`)
  }

  return Object.freeze({
    kind: 'process',
    heading: 'Creative Decisions',
    summary: work.summary,
    sequenceLabel: fragment.caption ?? 'Attempt → Problem → Decision → Rule',
    decisions: creativeDecisions,
  })
}

