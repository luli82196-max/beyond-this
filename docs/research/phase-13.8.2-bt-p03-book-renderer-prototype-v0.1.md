# Phase 13.8.2 — BT-P03 Book Renderer Prototype v0.1

## Scope

This phase adds a pure, stateless mapping from the immutable Book visual-presentation state to a frozen renderer-ready model. It deliberately stops before rendering: there is no React/R3F component, DOM surface, geometry, material, shader, animation, PDF, image, video, Projection integration, or media loading.

## Data flow

```text
BookVisualPresentationState or null
  → resolveBookRendererPrototype(state)
  → frozen BookRendererPrototypeModel or null
  → Future lightweight Room renderer (not implemented)
```

The resolver owns no presentation, navigation, lifecycle, subscription, event, animation, or media state. It derives a fresh snapshot for every call and never writes to its source state.

## Spatial mapping

| Visual state | Renderer output | Page exposure | Semantic exposure |
| --- | --- | --- | --- |
| closed / null | null | none | none |
| resting | static-object | none | none |
| opened | current-page-structure | current page structure | none |
| reading | complete-current-page | current page structure | complete current-page semantics |

`opened` provides identity, text structure, placeholder slots, progress, and visual-language tokens. `reading` adds the complete current-page semantic contract. `resting` represents the Book only as a static spatial object and intentionally retains no page payload.

## Page replacement and transition hints

A page change resolves a new renderer model from the new visual state; the resolver has no cache, previous-page field, or retained model. The existing `none / previous / next / replace` intent is copied into `{ intent, execute: false }`. This is metadata for a future animation layer, not an animation command, duration, timeline, or side effect.

When Book closes or another surface becomes active, the upstream visual state becomes `null`, and the renderer resolver immediately returns `null`.

## Boundaries retained

`RoomScene` and `RoomExperience` are unchanged. The prototype introduces no React/R3F component, real 3D Book, page animation, PDF, image, video, Projection, source URL, request, texture, decoder, viewer, player, or GPU resource.
