export type WorkId = string
export type FragmentId = string

export type WorkMovement = 'noticing' | 'forming' | 'testing' | 'carrying'
export type WorkRelation =
  | 'attention-and-time'
  | 'human-and-tool'
  | 'image-and-memory'
  | 'nature-and-making'
  | 'system-and-uncertainty'
  | 'discipline-transfer'

/** Editorial names. `process` replaces the former public name `interface`. */
export type PresentationMode = 'book' | 'projection' | 'process'
/** Existing spatial object names in Room. */
export type RoomSurface = 'book' | 'projection' | 'interface'

export type ArtifactType =
  | 'text-fragment' | 'note' | 'sketch' | 'still' | 'image'
  | 'ambient-video' | 'video-excerpt' | 'process-trace'
  | 'comparison' | 'diagram' | 'micro-interaction'
export type InteractionDepth = 'ambient' | 'focus' | 'deep'
export type LoadingPriority = 'room-critical' | 'ambient-near' | 'on-focus' | 'on-deep'
export type SoundBehavior = 'silent' | 'muted-until-requested' | 'optional-audible'
export type RightsStatus = 'cleared' | 'restricted' | 'pending' | 'unknown'

export interface MediaSource {
  readonly src: string
  readonly type: string
  readonly width?: number
  readonly height?: number
  readonly bytes?: number
  readonly bitrate?: number
}

export interface FragmentPlacement {
  readonly mode: PresentationMode
  readonly slot: string
  readonly order?: number
  readonly primary: boolean
}

export interface WorkFragment {
  readonly id: FragmentId
  readonly artifactType: ArtifactType
  readonly placement: FragmentPlacement
  readonly interactionDepth: InteractionDepth
  readonly sources?: readonly MediaSource[]
  readonly poster?: MediaSource
  readonly alt?: string
  readonly caption?: string
  readonly durationSeconds?: number
  readonly inSeconds?: number
  readonly outSeconds?: number
  readonly loop?: boolean
  readonly soundBehavior: SoundBehavior
  readonly loadingPriority: LoadingPriority
  readonly mobileFallback?: {
    readonly artifactType: Extract<ArtifactType, 'still' | 'image' | 'text-fragment'>
    readonly source?: MediaSource
    readonly text?: string
  }
  /** Deliberately metadata-only in the current phase. */
  readonly assetPending?: boolean
}

export interface Work {
  readonly id: WorkId
  readonly internalTitle: string
  readonly publicTitle?: string
  readonly year?: number
  readonly movement: WorkMovement
  readonly secondaryMovements?: readonly WorkMovement[]
  readonly relations: readonly WorkRelation[]
  readonly coreIdea: string
  readonly relationToWorld: string
  readonly summary: string
  readonly fragments: readonly WorkFragment[]
  readonly credits?: ReadonlyArray<{ readonly role: string; readonly name: string }>
  readonly rights: {
    readonly status: RightsStatus
    readonly territories?: readonly string[]
    readonly expiresOn?: string
    readonly notes?: string
  }
  readonly accessibility?: { readonly transcript?: string; readonly captions?: string }
  readonly published: boolean
}

export interface RoomContentPlacement {
  readonly workId: WorkId
  readonly fragmentId: FragmentId
  readonly mode: PresentationMode
  readonly surface: RoomSurface
  readonly slot: string
  readonly order: number
}
