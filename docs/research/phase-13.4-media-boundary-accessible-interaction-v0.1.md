# Phase 13.4 — BT-P03 Media Boundary & Accessible Interaction Layer v0.1

## Scope

This phase defines a controlled media-intent lifecycle and a pure Room input adapter. It adds no live listeners, visual behavior, media source, player, viewer, network request, or resource allocation.

## Media boundary

```text
successful Room state transition
  → future orchestration policy
  → MediaIntent { prepare | release, surface, fragmentId }
  → binding validation
  → idle | prepared | released
  → immutable transition / subscriber notification
```

`prepared` means only that preparation intent was recorded. It does not mean an asset was fetched, decoded, mounted, or ready to present. `released` likewise records lifecycle intent; there is no resource in this phase to dispose.

Each intent must match the explicit BT-P03 surface binding. The boundary exposes `dispatch()`, `getState()`, `getSnapshot()`, and `subscribe()` and stores no URL or resource handle.

## Input adapter

The adapter accepts abstract input descriptors and returns existing Room controller events. The caller remains responsible for listener ownership and dispatch order.

| Input | Action | Controller events |
| --- | --- | --- |
| Pointer | enter / move / primary / exit | approach / attend / activate / leave |
| Touch | start / primary / cancel | approach + attend / activate / leave |
| Keyboard | focus / confirm / escape / blur | approach + attend / activate / retreat / leave |

Touch and keyboard focus establish `focus` without requiring pointer precision. Confirm or primary activation can then enter `deep`. Escape retreats exactly one state, preserving the controller's existing guarded return path. Blur and cancellation return to `passing` through `leave`.

The keyboard path is `book → projection → interface`. The adapter exposes `reducedMotion` as presentation policy metadata; semantic events, focus order, and reachable states remain unchanged when reduced motion is enabled.

## Deliberate separation

- The adapter does not attach DOM, React, or React Three Fiber listeners.
- The adapter does not dispatch to the interaction controller itself.
- The interaction controller does not create media intent.
- The media boundary does not interpret input or interaction state.
- RoomScene, RoomExperience, and all five chapter visuals and timelines remain unchanged.

## Non-goals

- No BT-P03 video, PDF, image, poster, thumbnail, or URL.
- No video element, texture, decoder, PDF viewer, player, overlay, or controls.
- No fetch, preload, decode, playback, presentation, or GPU allocation.
- No changes to the current global input system, Canvas, WebGL, or scene graph.

