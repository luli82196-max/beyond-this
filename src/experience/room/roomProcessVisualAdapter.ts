import type { ProcessPresentationModel } from '../../content'

export type ProcessVisualSectionKind = 'attempt' | 'problem' | 'decision' | 'rule'

export interface ProcessVisualSection {
  readonly kind: ProcessVisualSectionKind
  readonly label: string
  readonly body: string
}

export interface RoomProcessVisualOutput {
  readonly kind: 'room-process-visual'
  readonly surface: 'interface'
  readonly workId: ProcessPresentationModel['workId']
  readonly fragmentId: ProcessPresentationModel['fragmentId']
  readonly heading: string
  readonly sequenceLabel: string
  readonly activeDecisionIndex: number
  readonly decisionCount: number
  readonly decisionTitle: string
  readonly sections: readonly ProcessVisualSection[]
  readonly capabilities: Readonly<{
    mutateContent: false
    controlState: false
    loadMedia: false
  }>
}

const capabilities = Object.freeze({
  mutateContent: false,
  controlState: false,
  loadMedia: false,
} as const)

/** Pure, read-only mapping from Process presentation state to Room visual data. */
export function resolveRoomProcessVisualOutput(
  presentation: ProcessPresentationModel | null,
  activeDecisionIndex = 0,
): RoomProcessVisualOutput | null {
  if (!presentation || presentation.state === 'closed') return null
  if (presentation.surface !== 'interface' || presentation.mode !== 'process') return null

  const decisions = presentation.content.decisions
  if (decisions.length === 0) return null
  const index = Math.min(Math.max(activeDecisionIndex, 0), decisions.length - 1)
  const active = decisions[index]

  return Object.freeze({
    kind: 'room-process-visual',
    surface: 'interface',
    workId: presentation.workId,
    fragmentId: presentation.fragmentId,
    heading: presentation.content.heading,
    sequenceLabel: presentation.content.sequenceLabel,
    activeDecisionIndex: index,
    decisionCount: decisions.length,
    decisionTitle: active.title,
    sections: Object.freeze([
      Object.freeze({ kind: 'attempt', label: 'Attempt', body: active.attempt }),
      Object.freeze({ kind: 'problem', label: 'Problem', body: active.problem }),
      Object.freeze({ kind: 'decision', label: 'Decision', body: active.decision }),
      Object.freeze({ kind: 'rule', label: 'Rule', body: active.rule }),
    ]),
    capabilities,
  })
}
