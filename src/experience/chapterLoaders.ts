import { lazy } from 'react'
import type { ChapterId } from '../systems/timeline/experience.types'

export const experienceLoaders = {
  seed: () => import('./seed/SeedExperience'), forest: () => import('./forest/ForestExperience'), tree: () => import('./tree/TreeExperience'),
  room: () => import('./room/RoomExperience'), light: () => import('./light/LightExperience'),
} as const
export const sceneLoaders = {
  seed: () => import('./seed/SeedScene'), forest: () => import('./forest/ForestScene'), tree: () => import('./tree/TreeScene'),
  room: () => import('./room/RoomScene'), light: () => import('./light/LightScene'),
} as const
const prepared = new Map<ChapterId, Promise<unknown>>()
export function prepareChapter(chapter: ChapterId) {
  const pending = prepared.get(chapter) ?? Promise.all([experienceLoaders[chapter](), sceneLoaders[chapter]()])
  prepared.set(chapter, pending); return pending
}
export const LazyExperiences = { seed: lazy(experienceLoaders.seed), forest: lazy(experienceLoaders.forest), tree: lazy(experienceLoaders.tree), room: lazy(experienceLoaders.room), light: lazy(experienceLoaders.light) }
export const LazyScenes = { seed: lazy(sceneLoaders.seed), forest: lazy(sceneLoaders.forest), tree: lazy(sceneLoaders.tree), room: lazy(sceneLoaders.room), light: lazy(sceneLoaders.light) }
