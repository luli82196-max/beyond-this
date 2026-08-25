import { createInitialSeedState } from './seed.types'

// The mutable choreography state survives DOM overlay and WebGL scene ownership.
export const seedSequence = createInitialSeedState()
