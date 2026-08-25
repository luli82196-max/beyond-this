import type { Work, WorkId } from './content.types'
import { afterTheSecondSunset } from './works/afterTheSecondSunset'

export const contentRegistry = [afterTheSecondSunset] as const satisfies readonly Work[]

export function getWorkById(id: WorkId): Work | undefined {
  return contentRegistry.find((work) => work.id === id)
}

export function getPublishedWorks(): readonly Work[] {
  return contentRegistry.filter((work) => work.published)
}
