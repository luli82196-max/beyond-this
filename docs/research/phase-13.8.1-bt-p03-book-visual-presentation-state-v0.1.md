# Phase 13.8.1 — BT-P03 Book Visual Layer Data Contract & Spatial Presentation Design v0.1

## Scope

This phase converts the existing Book read-only Room mount into immutable visual-presentation data. It stops before rendering: there is no React/R3F component, DOM surface, animation, media source, PDF, image, video, Projection integration, or resource loading.

## Data flow

```text
Presentation Connection snapshot + Book navigation
  → Book read-only Room mount or null
  → resolveBookVisualPresentationState(mount, previousState)
  → frozen BookVisualPresentationState or null
```

The optional previous state is used only to describe page-transition intent. The resolver owns no runtime state, subscription, event handler, or resource.

## Contract

- Spatial vocabulary: `closed / resting / opened / reading`.
- Active lifecycle mapping: `preview → resting`, `focused → opened`, `deep → reading`.
- Closed navigation, closed presentation, or another active surface produces `null`; `closed` therefore has no visual output.
- Page state: one-based current page, page count, and `none / previous / next / replace` transition intent.
- Visual language: paper tone, low density, editorial layout, and emphasis.
- Page semantics: editorial role, composition rule, and subject.
- Content remains the already-frozen lightweight adapter model with placeholder media sources fixed at `null`.

## Four-page semantic map

| Page | Paper tone | Layout | Emphasis | Semantic role | Composition | Subject |
| --- | --- | --- | --- | --- | --- | --- |
| Cover | warm-grey | archive | minimal | archive-entry | negative-space | time |
| Visual Rule | weathered-ivory | rule-study | rule | rule-evidence | spatial-relation | light |
| Rejected Directions | warm-grey | decision-edit | contrast | editorial-judgement | rejection-sequence | decision |
| Material Memory | smoked-parchment | material-study | atmospheric | material-memory | material-field | trace |

These tokens express visual direction without prescribing CSS, geometry, materials, shaders, typography implementation, or animation timing.

## Cleanup and immutability

Every active result freezes its page state and top-level state. Page tokens and semantics are shared frozen constants. A page change creates a new visual state and derives direction from the previous one. A surface switch supplies a null mount and immediately returns `null`, so prior page content is not retained.

## Boundaries retained

`RoomScene` and `RoomExperience` are unchanged. The phase does not implement Book Renderer, UI, DOM, React/R3F, PDF, images, video, Projection, media requests, or media loading.
