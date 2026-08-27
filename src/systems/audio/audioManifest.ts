import type { ChapterId } from '../timeline/experience.types'

export type AudioWorld = ChapterId | 'room-light'
export type AudioAssetKind = 'ambient' | 'oneshot'
export type AudioPreloadStrategy = 'none' | 'metadata' | 'auto'
export interface AudioLicenseMetadata { license: string | null; source: string | null; author: string | null; notes: string | null }
export interface AudioAssetDefinition { id: string; chapter: ChapterId; world: AudioWorld; kind: AudioAssetKind; src: string | null; loop: boolean; baseGain: number; preload: AudioPreloadStrategy; license: AudioLicenseMetadata }
const pendingLicense: AudioLicenseMetadata = { license: null, source: null, author: null, notes: null }
export const audioAssetManifest = [
  { id: 'seed-bed', chapter: 'seed', world: 'seed', kind: 'ambient', src: null, loop: true, baseGain: .22, preload: 'metadata', license: pendingLicense },
  { id: 'seed-soil', chapter: 'seed', world: 'seed', kind: 'oneshot', src: null, loop: false, baseGain: .5, preload: 'none', license: pendingLicense },
  { id: 'seed-water-drop', chapter: 'seed', world: 'seed', kind: 'oneshot', src: null, loop: false, baseGain: .58, preload: 'none', license: pendingLicense },
  { id: 'forest-bed', chapter: 'forest', world: 'forest', kind: 'ambient', src: null, loop: true, baseGain: .18, preload: 'metadata', license: pendingLicense },
  { id: 'tree-bed', chapter: 'tree', world: 'tree', kind: 'ambient', src: null, loop: true, baseGain: .1, preload: 'metadata', license: pendingLicense },
  { id: 'tree-wood-shift', chapter: 'tree', world: 'tree', kind: 'oneshot', src: null, loop: false, baseGain: .14, preload: 'none', license: pendingLicense },
  { id: 'room-light-bed', chapter: 'room', world: 'room-light', kind: 'ambient', src: null, loop: true, baseGain: .09, preload: 'metadata', license: pendingLicense },
  { id: 'room-curtain', chapter: 'room', world: 'room-light', kind: 'oneshot', src: null, loop: false, baseGain: .045, preload: 'none', license: pendingLicense },
  { id: 'room-interaction', chapter: 'room', world: 'room-light', kind: 'oneshot', src: null, loop: false, baseGain: .055, preload: 'none', license: pendingLicense },
  { id: 'outside-world', chapter: 'light', world: 'room-light', kind: 'ambient', src: null, loop: true, baseGain: .075, preload: 'metadata', license: pendingLicense },
] as const satisfies readonly AudioAssetDefinition[]
export const audioAvailable = audioAssetManifest.some(asset => asset.src !== null)
