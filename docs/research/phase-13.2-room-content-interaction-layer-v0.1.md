# Phase 13.2 — Room Content Interaction Layer v0.1

## Scope

This phase adds a read-only bridge from Room surfaces to the Phase 13.1 content registry. It does not connect that bridge to the rendered Room, implement UI, or load media.

## Data flow

```text
RoomSurface
  → RoomContentPlacement
  → Work
  → WorkFragment
  → ResolvedRoomContent (default interaction: passing)
```

`process` remains the editorial presentation mode. At the content boundary it maps to Room's existing `interface` surface.

## Public interfaces

- `resolveRoomContent(surface)` returns the matching placement, work, fragment, and default interaction metadata.
- `getFragmentBySurface(surface)` returns only the matching fragment.
- `getInteractionState(state?)` returns immutable metadata for `passing`, `ambient`, `focus`, or `deep` and defaults to `passing`.

The resolver selects the first placement in registry order. Placements are already ordered by their explicit `order` field, providing deterministic behavior while preserving a small Phase 13.2 API.

## BT-P03 validation matrix

| Room surface | Editorial mode | Fragment |
| --- | --- | --- |
| `book` | `book` | `bt-p03-visual-development-book` |
| `projection` | `projection` | `bt-p03-motion-study` |
| `interface` | `process` | `bt-p03-creative-decisions` |

All three fragments remain metadata-only with `assetPending: true`. The work remains unpublished and its rights status remains pending.

## Loading boundary

State definitions describe future intent only. `passing` and `ambient` neither prepare nor permit media loading; `focus` may prepare future media metadata but does not permit loading; only `deep` permits a future loader to act. No loader is implemented in this phase.

## Non-goals

- No Room scene or presentation imports.
- No pointer, click, proximity, or keyboard handling.
- No final interaction visuals.
- No video, PDF, image asset, texture, decoder, network request, or additional Canvas/WebGL context.
- No change to Seed, Forest, Tree, Room, or Light timelines and narrative logic.
