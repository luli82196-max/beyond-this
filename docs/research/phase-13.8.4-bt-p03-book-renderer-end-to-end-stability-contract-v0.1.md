# Phase 13.8.4 — BT-P03 Book Renderer End-to-End Stability Contract v0.1

## Decision

Phase 13.8.4 is the final engineering-stability pass before Book Visual Renderer implementation. The v1 target remains one complete work: Beyond This + BT-P03, *After the Second Sunset*. This phase adds no runtime visual architecture.

## Verified data chain

```text
BT-P03 Book Content
  → Book Presentation
  → Book Navigation Snapshot
  → Read-only Book Mount
  → Book Visual Presentation State
  → Book Renderer Prototype
  → Renderer Integration Boundary
  → Mount Lifecycle
```

`createRoomBookEndToEndStabilityHarness()` composes existing boundaries solely for pure-logic verification. It owns no UI, scene, media, or animation implementation.

## User-flow contract

- Open: `passing → ambient → focus`; the Book moves from no mount to resting/opened presentation.
- Enter deep: `focus → deep`; the complete current page is mounted.
- Next/previous: current source is released and detached before a new monotonic mount is prepared and mounted.
- Close: `leave` removes visual state and releases the mount.
- Reopen: navigation returns to the cover and transition intent starts at `none`, with no prior-page residue.
- Surface switch: Projection (`projection`) and Process (`interface`) remain placeholders; either switch clears Book visual state and releases its mount.
- Reconnect: upstream subscription and renderer ownership are recreated once in a fresh cycle. Old renderer subscribers are cleared.

## Final Asset Boundary Contract

| Asset | Entry boundary | Runtime owner | Phase 13.8.4 behavior |
|---|---|---|---|
| Book | Presentation data | Future Book renderer | Contract data only; no visual renderer |
| Projection/video | Media boundary | Future media runtime | Placeholder only; no URL/load/player |
| Image | Asset registry | Renderer | Metadata boundary only; no import/decode |
| 3D asset | Asset registry | Scene runtime | Metadata boundary only; no model/GPU allocation |

The executable contract is `src/content/assetBoundaryContract.ts`. Asset identity and metadata may cross the listed entry boundary; allocated resources stay owned by the listed runtime and must be released by it. Content, navigation, and presentation layers never own decoded media or scene resources.

## Stability gate

The Book Visual Renderer phase may begin only when all of the following pass:

1. TypeScript strict checking.
2. Complete pure-logic suite, including end-to-end chain and lifecycle assertions.
3. Vite production build.
4. No change to `RoomScene` or `RoomExperience` and no React/R3F renderer, asset load, or Projection implementation introduced by this phase.

## Frozen exclusions

- No new architecture layer beyond the verification harness and final asset contract.
- No visual renderer, React/R3F component, page animation, PDF, image, video, 3D load, or Projection implementation.
- No modification to RoomScene or RoomExperience.
