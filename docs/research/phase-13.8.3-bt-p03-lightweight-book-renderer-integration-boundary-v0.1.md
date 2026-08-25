# Phase 13.8.3 — BT-P03 Lightweight Book Renderer Integration Boundary v0.1

## Scope

This phase establishes an optional, logic-only consumption boundary between `BookRendererPrototypeModel | null` and a future Room renderer. It does not implement that renderer.

## Data flow

```text
BookVisualPresentationState | null
  → resolveBookRendererPrototype()
  → BookRendererPrototypeModel | null
  → createBookRendererIntegrationBoundary().consume()
  → immutable BookRendererMountLifecycleModel | null
  → future lightweight Room renderer
```

The mount record copies only identity, presentation, and current-page metadata. It does not embed, mutate, navigate, or take ownership of the source model.

## Lifecycle and ownership

Each connected ownership cycle starts at `detached`. A non-null prototype advances through `prepared → mounted`. Closing the Book, switching surface, or disconnecting advances an active mount to `released`; teardown then returns the boundary to `detached`.

Page replacement uses `released → detached → prepared → mounted` with a new monotonic mount id. No old page is present in the current mount. Re-consuming the same prototype is idempotent. Disconnect clears the subscriber registry, so listeners from an older cycle cannot receive notifications after reconnect. Reconnect creates a fresh ownership cycle.

## Exclusions

- No React or React Three Fiber component
- No `RoomScene` or `RoomExperience` modification
- No real 3D Book, geometry, material, shader, or GPU allocation
- No page-turn animation
- No PDF, image, video, Projection, URL, request, decoder, viewer, or player

## Verification contract

Pure logic tests cover prototype mapping, lifecycle order, stale-listener isolation after release/teardown, residue-free page replacement, source immutability, and idempotent reconnect behavior. TypeScript strict checking and the production build remain required.
