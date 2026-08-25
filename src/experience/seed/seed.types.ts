export type SeedSequenceState = {
  observation: number
  seedY: number
  seedRotation: number
  seedVisible: number
  dropletY: number
  dropletVisible: number
  impact: number
  wetness: number
  seedInfluence: number
  environmentFocus: number
  title: number
  ready: number
  transition: number
}

export const createInitialSeedState = (): SeedSequenceState => ({
  observation: 0, seedY: 3.2, seedRotation: -.25, seedVisible: 0,
  dropletY: 2.5, dropletVisible: 0, impact: 0, wetness: 0,
  seedInfluence: 0, environmentFocus: 0, title: 0, ready: 0, transition: 0,
})
