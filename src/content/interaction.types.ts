import type { RoomContentPlacement, RoomSurface, Work, WorkFragment } from './content.types'

export type InteractionState = 'passing' | 'ambient' | 'focus' | 'deep'

export type RoomInteractionEventType = 'approach' | 'attend' | 'activate' | 'retreat' | 'leave'

export interface RoomInteractionEvent {
  readonly type: RoomInteractionEventType
  readonly surface: RoomSurface
  readonly input?: 'pointer' | 'keyboard' | 'touch' | 'proximity' | 'programmatic'
}

export interface RoomInteractionTransition {
  readonly event: RoomInteractionEvent
  readonly previous: InteractionState
  readonly current: InteractionState
  readonly changed: boolean
}

export interface InteractionStateDefinition {
  readonly state: InteractionState
  readonly order: number
  readonly preparesMedia: boolean
  readonly permitsMediaLoad: boolean
}

export interface ResolvedRoomContent {
  readonly surface: RoomSurface
  readonly work: Work
  readonly fragment: WorkFragment
  readonly placement: RoomContentPlacement
  readonly interaction: InteractionStateDefinition
}
