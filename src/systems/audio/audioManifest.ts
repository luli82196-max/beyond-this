import type { ChapterId } from '../timeline/experience.types'

export type AudioWorld = ChapterId | 'room-light'
export type AudioAssetKind = 'ambient' | 'oneshot'
export type AudioPreloadStrategy = 'none' | 'metadata' | 'auto'
export interface AudioLicenseMetadata {
  license: string | null
  source: string | null
  author: string | null
  sourceSha256: string | null
  derivativeSha256: string | null
  notes: string | null
}
export interface AudioAssetDefinition { id: string; chapter: ChapterId; world: AudioWorld; kind: AudioAssetKind; src: string | null; loop: boolean; baseGain: number; preload: AudioPreloadStrategy; license: AudioLicenseMetadata }
const pendingLicense: AudioLicenseMetadata = { license: null, source: null, author: null, sourceSha256: null, derivativeSha256: null, notes: null }
const forestAmbienceLicense: AudioLicenseMetadata = {
  license: 'Public domain',
  source: 'https://commons.wikimedia.org/wiki/File:20090610_0_ambience.ogg',
  author: 'nille',
  sourceSha256: '43848c3eda5f42829f1033112c2a91ba3e5c91b79a0532fda264c9f59856d431',
  derivativeSha256: '6d888851dd76af1df1855d86d52187856403783e268e477d2187c019142c6c76',
  notes: 'Production loop derivative; 20-100 s source region with a 2 s wrap crossfade and -4 dB gain.',
}
const autumnLeavesLicense: AudioLicenseMetadata = {
  license: 'CC0 1.0',
  source: 'https://commons.wikimedia.org/wiki/File:Leaves_falling_from_the_trees_during_autumn_in_the_forest.wav',
  author: 'Wilfredor',
  sourceSha256: '858d8965c77ec52b975d8d077728e874b79522c4815cbdcd83556447d66e508a',
  derivativeSha256: 'f1d7d91c120238ab12007a710eda7b2bdffd68371c5a5fc40e76ef2702d0ea4a',
  notes: 'Production loop derivative; 30-110 s source region with a 3 s wrap crossfade and -7 dB gain.',
}
export const audioAssetManifest = [
  { id: 'seed-bed', chapter: 'seed', world: 'seed', kind: 'ambient', src: null, loop: true, baseGain: .22, preload: 'metadata', license: pendingLicense },
  { id: 'seed-soil', chapter: 'seed', world: 'seed', kind: 'oneshot', src: null, loop: false, baseGain: .5, preload: 'none', license: pendingLicense },
  { id: 'seed-water-drop', chapter: 'seed', world: 'seed', kind: 'oneshot', src: null, loop: false, baseGain: .58, preload: 'none', license: pendingLicense },
  { id: 'forest-bed', chapter: 'forest', world: 'forest', kind: 'ambient', src: '/audio/forest/forest-ambience-loop-v1.ogg', loop: true, baseGain: .16, preload: 'metadata', license: forestAmbienceLicense },
  { id: 'forest-leaves', chapter: 'forest', world: 'forest', kind: 'ambient', src: '/audio/forest/autumn-leaves-loop-v1.ogg', loop: true, baseGain: .035, preload: 'metadata', license: autumnLeavesLicense },
  { id: 'tree-bed', chapter: 'tree', world: 'tree', kind: 'ambient', src: null, loop: true, baseGain: .1, preload: 'metadata', license: pendingLicense },
  { id: 'tree-wood-shift', chapter: 'tree', world: 'tree', kind: 'oneshot', src: null, loop: false, baseGain: .14, preload: 'none', license: pendingLicense },
  { id: 'room-light-bed', chapter: 'room', world: 'room-light', kind: 'ambient', src: null, loop: true, baseGain: .09, preload: 'metadata', license: pendingLicense },
  { id: 'room-curtain', chapter: 'room', world: 'room-light', kind: 'oneshot', src: null, loop: false, baseGain: .045, preload: 'none', license: pendingLicense },
  { id: 'room-interaction', chapter: 'room', world: 'room-light', kind: 'oneshot', src: null, loop: false, baseGain: .055, preload: 'none', license: pendingLicense },
  { id: 'outside-world', chapter: 'light', world: 'room-light', kind: 'ambient', src: null, loop: true, baseGain: .075, preload: 'metadata', license: pendingLicense },
] as const satisfies readonly AudioAssetDefinition[]
export const audioAvailable = audioAssetManifest.some(asset => asset.src !== null)
