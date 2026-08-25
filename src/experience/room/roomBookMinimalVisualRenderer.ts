import type { BookRendererMountLifecycleModel } from './roomBookRendererIntegrationBoundary'
import type { BookVisualPresentationState } from './roomBookVisualPresentationState'

export interface BookMinimalVisualOutput {
  readonly kind: 'book-minimal-visual-output'
  readonly mountId: number
  readonly ownershipCycle: number
  readonly workId: string
  readonly fragmentId: string
  readonly visualMode: 'static-book' | 'opened-book'
  readonly page: null | Readonly<{
    pageId: string
    currentPage: number
    pageCount: number
    eyebrow: BookVisualPresentationState['content']['eyebrow']
    title: BookVisualPresentationState['content']['pageTitle']
    bodyBlocks: BookVisualPresentationState['content']['bodyBlocks']
  }>
  readonly layout: Readonly<{ spreadWidth: number; spreadDepth: number; coverThickness: number; pageThickness: number; gutterWidth: number; contentInset: number }>
  readonly typography: Readonly<{ eyebrowScale: number; titleScale: number; bodyScale: number; lineGap: number; maxBodyLines: number }>
  readonly paper: Readonly<{ baseColor: string; edgeColor: string; inkColor: string; roughness: number }>
  readonly placement: Readonly<{ position: readonly [number, number, number]; rotation: readonly [number, number, number]; scale: number; openAngle: number }>
  readonly roomLight: Readonly<{ response: 'room-light-reactive'; keyLightFactor: number; fillLightFactor: number; paperReflectance: number }>
  readonly capabilities: Readonly<{ mutatesContent: false; controlsNavigation: false; controlsLifecycle: false; executesPageTransition: false }>
}

const layout = Object.freeze({ spreadWidth: 1.24, spreadDepth: .82, coverThickness: .06, pageThickness: .025, gutterWidth: .02, contentInset: .12 })
const typography = Object.freeze({ eyebrowScale: .42, titleScale: 1, bodyScale: .54, lineGap: .105, maxBodyLines: 4 })
const placement = Object.freeze({ position: Object.freeze([-1.28, .14, .37] as const), rotation: Object.freeze([0, -.18, -.035] as const), scale: 1, openAngle: .075 })
const roomLight = Object.freeze({ response: 'room-light-reactive' as const, keyLightFactor: .82, fillLightFactor: .24, paperReflectance: .38 })
const capabilities = Object.freeze({ mutatesContent: false as const, controlsNavigation: false as const, controlsLifecycle: false as const, executesPageTransition: false as const })
const paperByTone = Object.freeze({
  'warm-grey': Object.freeze({ baseColor: '#c8b99b', edgeColor: '#8f8068', inkColor: '#625847', roughness: 1 }),
  'weathered-ivory': Object.freeze({ baseColor: '#d1c4a7', edgeColor: '#97866c', inkColor: '#5e5547', roughness: .98 }),
  'smoked-parchment': Object.freeze({ baseColor: '#b8a889', edgeColor: '#796c58', inkColor: '#554c40', roughness: 1 }),
} as const)

/** Stateless, read-only mapping from an owned mount and presentation state to visual data. */
export function resolveBookMinimalVisualOutput(mount: BookRendererMountLifecycleModel | null, state: BookVisualPresentationState | null): BookMinimalVisualOutput | null {
  if (!mount || mount.lifecycle !== 'mounted' || mount.mountId === null || !state) return null
  if (mount.sourceKind !== state.kind || mount.workId !== state.content.workId || mount.fragmentId !== state.content.fragmentId || mount.pageId !== state.content.pageId) return null
  const opened = state.spatialState !== 'resting'
  const page = opened ? Object.freeze({ pageId: state.content.pageId, currentPage: state.page.currentPage, pageCount: state.page.pageCount, eyebrow: state.content.eyebrow, title: state.content.pageTitle, bodyBlocks: state.content.bodyBlocks }) : null
  return Object.freeze({ kind: 'book-minimal-visual-output' as const, mountId: mount.mountId, ownershipCycle: mount.ownershipCycle, workId: state.content.workId, fragmentId: state.content.fragmentId, visualMode: opened ? 'opened-book' as const : 'static-book' as const, page, layout, typography, paper: paperByTone[state.tokens.paperTone], placement, roomLight, capabilities })
}
