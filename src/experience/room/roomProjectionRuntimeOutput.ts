import type { MediaIntent, MediaRuntimeSnapshot, MediaSource, ProjectionPresentationModel } from '../../content'

export interface RoomProjectionRuntimeOutput {
  readonly kind: 'room-projection-runtime-output'
  readonly surface: 'projection'
  readonly workId: ProjectionPresentationModel['workId']
  readonly fragmentId: ProjectionPresentationModel['fragmentId']
  readonly title: string
  readonly motionIdentity: string
  readonly caption: string
  readonly lifecycle: 'open' | 'focused'
  readonly playbackIntent: Readonly<{ readonly action: 'none' | 'prepare'; readonly executePlayback: boolean }>
  readonly mediaSource: MediaSource | null
  readonly mediaRuntime: MediaRuntimeSnapshot
  readonly mediaBoundaryIntent: MediaIntent | null
  readonly capabilities: Readonly<{
    readonly createVideoElement: true
    readonly loadMedia: true
    readonly controlPlayback: true
    readonly mutatePresentation: false
  }>
}

const capabilities = Object.freeze({
  createVideoElement: true,
  loadMedia: true,
  controlPlayback: true,
  mutatePresentation: false,
} as const)

/** Pure Projection mapping: describes future playback but cannot execute it. */
export function resolveRoomProjectionRuntimeOutput(
  presentation: ProjectionPresentationModel | null,
  mediaBoundaryIntent: MediaIntent | null,
  mediaSource: MediaSource | null,
  mediaRuntime: MediaRuntimeSnapshot,
): RoomProjectionRuntimeOutput | null {
  if (!presentation || presentation.state === 'closed') return null
  if (presentation.surface !== 'projection' || presentation.mode !== 'projection') return null

  if (mediaBoundaryIntent && (
    mediaBoundaryIntent.type !== 'prepare' ||
    mediaBoundaryIntent.surface !== 'projection' ||
    mediaBoundaryIntent.fragmentId !== presentation.fragmentId
  )) return null

  return Object.freeze({
    kind: 'room-projection-runtime-output',
    surface: 'projection',
    workId: presentation.workId,
    fragmentId: presentation.fragmentId,
    title: presentation.content.title,
    motionIdentity: presentation.content.motionIdentity,
    caption: presentation.content.caption,
    lifecycle: presentation.state === 'deep' ? 'open' : 'focused',
    playbackIntent: Object.freeze({ action: mediaBoundaryIntent ? 'prepare' : 'none', executePlayback: Boolean(mediaBoundaryIntent && mediaSource) }),
    mediaSource: mediaSource ? Object.freeze({ ...mediaSource }) : null,
    mediaRuntime,
    mediaBoundaryIntent: mediaBoundaryIntent ? Object.freeze({ ...mediaBoundaryIntent }) : null,
    capabilities,
  })
}
