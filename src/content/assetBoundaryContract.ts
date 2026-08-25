import type { PresentationMode } from './content.types'

export type AssetBoundaryKind = 'book' | 'projection-video' | 'image' | '3d-asset'

export interface AssetBoundaryEntry {
  readonly kind: AssetBoundaryKind
  readonly entersThrough: 'presentation-data' | 'media-boundary' | 'asset-registry'
  readonly owner: 'renderer' | 'media-runtime' | 'scene-runtime'
  readonly permittedModes: readonly PresentationMode[]
  readonly phase1384LoadsAsset: false
}

/** Final ownership contract only; it allocates, imports, decodes, and renders nothing. */
export const assetBoundaryContract = Object.freeze({
  book: Object.freeze({
    kind: 'book', entersThrough: 'presentation-data', owner: 'renderer',
    permittedModes: Object.freeze(['book'] as const), phase1384LoadsAsset: false,
  }),
  projectionVideo: Object.freeze({
    kind: 'projection-video', entersThrough: 'media-boundary', owner: 'media-runtime',
    permittedModes: Object.freeze(['projection'] as const), phase1384LoadsAsset: false,
  }),
  image: Object.freeze({
    kind: 'image', entersThrough: 'asset-registry', owner: 'renderer',
    permittedModes: Object.freeze(['book', 'process'] as const), phase1384LoadsAsset: false,
  }),
  threeDimensional: Object.freeze({
    kind: '3d-asset', entersThrough: 'asset-registry', owner: 'scene-runtime',
    permittedModes: Object.freeze(['book', 'projection', 'process'] as const), phase1384LoadsAsset: false,
  }),
} as const satisfies Readonly<Record<string, AssetBoundaryEntry>>)
