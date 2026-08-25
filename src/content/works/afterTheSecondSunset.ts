import type { Work } from '../content.types'

/** Phase 13.1 metadata-only node. Importing it causes no media request. */
export const afterTheSecondSunset = {
  id: 'bt-p03-after-the-second-sunset',
  internalTitle: 'BT-P03 After the Second Sunset',
  publicTitle: 'After the Second Sunset',
  movement: 'forming',
  secondaryMovements: ['noticing', 'testing', 'carrying'],
  relations: ['attention-and-time', 'image-and-memory', 'human-and-tool', 'discipline-transfer'],
  coreIdea: 'A visual-development system built around what remains after a second sunset.',
  relationToWorld: 'Light, material memory, and the absent viewer connect an imagined film to lived experience.',
  summary: 'A fictional-film visual development archive spanning direction, light, material, identity, motion, and creative decisions.',
  fragments: [
    {
      id: 'bt-p03-visual-development-book',
      artifactType: 'image',
      placement: { mode: 'book', slot: 'observation-archive', order: 10, primary: true },
      interactionDepth: 'focus',
      alt: 'Visual development archive for After the Second Sunset.',
      caption: 'Visual rules, light studies, material memory, and the archive system.',
      soundBehavior: 'silent', loadingPriority: 'on-focus', assetPending: true,
    },
    {
      id: 'bt-p03-motion-study',
      artifactType: 'video-excerpt',
      placement: { mode: 'projection', slot: 'experience-screen', order: 10, primary: true },
      interactionDepth: 'deep',
      alt: 'Motion study for After the Second Sunset.',
      caption: 'Eight-second motion blocking study for the projection surface.',
      soundBehavior: 'muted-until-requested', loadingPriority: 'on-deep',
      mobileFallback: { artifactType: 'still', text: 'Motion study poster pending.' },
      assetPending: false,
    },
    {
      id: 'bt-p03-creative-decisions',
      artifactType: 'process-trace',
      placement: { mode: 'process', slot: 'decision-sequence', order: 10, primary: true },
      interactionDepth: 'focus',
      caption: 'Attempt → why it failed → what changed → final rule.',
      soundBehavior: 'silent', loadingPriority: 'on-focus',
      mobileFallback: { artifactType: 'text-fragment', text: 'Three bounded creative-decision cases.' },
      assetPending: true,
    },
  ],
  rights: {
    status: 'pending',
    notes: 'Metadata-only test node. Publication and deep media remain gated until assets and rights are verified.',
  },
  published: false,
} as const satisfies Work
