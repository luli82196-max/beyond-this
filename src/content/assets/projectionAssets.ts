import type { MediaSource } from '../content.types'

export interface ProjectionAssetEntry {
  readonly fragmentId: 'bt-p03-motion-study'
  readonly source: MediaSource
  readonly fallbackText: string
}

/** Read-only Asset Boundary entry. Presentation and visual code never own this URL. */
export const afterTheSecondSunsetMotionAsset = Object.freeze({
  fragmentId: 'bt-p03-motion-study',
  source: Object.freeze({
    src: '/media/after_the_second_sunset_motion_blocking_v01.mp4',
    type: 'video/mp4',
    width: 960,
    height: 540,
    bytes: 1612523,
    bitrate: 1610000,
  }),
  fallbackText: 'Motion study unavailable. The projection remains as a still surface.',
} as const satisfies ProjectionAssetEntry)

export function getProjectionAsset(fragmentId: string): ProjectionAssetEntry | null {
  return fragmentId === afterTheSecondSunsetMotionAsset.fragmentId
    ? afterTheSecondSunsetMotionAsset
    : null
}
