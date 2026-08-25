export type PublicationLink = {
  label: string
  href: string
}

export type PublicationProfile = {
  authorName: string | null
  resume: PublicationLink | null
  portfolio: PublicationLink | null
  contact: PublicationLink | null
}

/**
 * Public identity contract. Keep values null until the author has approved the
 * exact credit and stable public destinations; null fields are never rendered.
 */
export const publicationProfile: PublicationProfile = {
  authorName: null,
  resume: null,
  portfolio: null,
  contact: null,
}
