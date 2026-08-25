# Phase 13.1 — Content Registry & Integration Architecture v0.1

Status: **IMPLEMENTED — DATA AND INTERFACES ONLY**  
Date: 2026-08-23

## Decision

Content now lives in `src/content`, outside Room scene code. A canonical `Work` owns editorial metadata, rights, and fragments. Each `WorkFragment` has exactly one presentation placement: Book, Projection, or Process.

`Process` is the public/editorial replacement for the former name `Interface`. The existing Room mesh remains named `interface`; `roomSurfaceByMode` is the compatibility boundary that maps `process → interface`. This phase does not rename or edit any scene object.

## Files and responsibilities

- `content.types.ts`: strict contracts for Work, WorkFragment, placement, rights, loading, accessibility, and Room mapping.
- `content.registry.ts`: curated canonical registry and read-only lookup functions.
- `works/afterTheSecondSunset.ts`: BT-P03 metadata-only test node.
- `roomContent.ts`: presentation-mode-to-Room-surface mapping and selectors consumable by a future Room integration.
- `index.ts`: stable public API for later consumers.

## Work and Fragment model

`Work` answers what the project is, how it relates to the world, which movements/relations it carries, whether it may be published, and which fragments it owns. `WorkFragment` answers what trace appears, where it belongs, how deeply it may be opened, how it behaves sonically, and when its asset may load.

Media sources are optional. `assetPending: true` identifies deliberate metadata-only records. This allows editorial integration before any production asset exists without placeholder network requests.

## BT-P03 mapping

| Fragment | Mode | Existing Room surface | Depth | Loading |
|---|---|---|---|---|
| Visual Development Book | Book | book | focus | on-focus |
| Motion Study | Projection | projection | deep | on-deep |
| Creative Decisions | Process | interface | focus | on-focus |

BT-P03 remains `published: false` with `rights.status: pending`. No fragment contains a media URL, so importing or querying the registry cannot load video, images, or other large resources.

## Room consumption boundary

Future Room code should import only from `src/content` and call:

- `getRoomContentPlacements()` for ordered spatial placement descriptors;
- `getFragmentsForMode(mode)` for mode-specific editorial traces;
- `getWorkById(id)` for canonical work metadata.

Selectors return read-only data. They do not create DOM media elements, Three.js textures, decoders, requests, or interaction state.

## Preserved invariants

- Seed, Forest, Tree, Room, and Light source files are unchanged.
- Chapter ranges, scroll progress, attention windows, camera, lighting, audio, and scene lifecycle are unchanged.
- No video is loaded and no large resource is added.
- The registry is not yet rendered, so this phase cannot alter the current visual experience.

## Next phase boundary

The next safe step is Phase 13.2: connect the three selectors to Room interaction state using semantic proxy controls and metadata-only labels, while keeping media acquisition behind explicit focus/deep intent. Do not add BT-P01 or BT-P02 and do not begin a visual redesign.
