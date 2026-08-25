export type NormalizedPointer = { x: number; y: number }

export type CameraPose = { position: readonly [number, number, number]; target: readonly [number, number, number]; rotation?: readonly [number, number, number]; fieldOfView?: number }
export type CameraTransition = { from: CameraPose; to: CameraPose; progress: number }
export interface CameraController {
  setChapter(chapter: import('../timeline/experience.types').ChapterId): void
  setPose(pose: CameraPose): void
  push(distance: number): void
  rotate(rotation: CameraPose['rotation']): void
  transition(transition: CameraTransition): void
  dispose(): void
}

export const neutralPointer: NormalizedPointer = { x: 0, y: 0 }
