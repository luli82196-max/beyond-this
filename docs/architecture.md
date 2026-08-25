# Beyond This Experience Framework v0.2

## Phase 13.8.3 BT-P03 Lightweight Book renderer integration boundary

The renderer prototype can now be consumed by an explicit, opt-in ownership boundary. The boundary maps only renderer identity and current-page metadata into a frozen mount lifecycle model; it neither modifies nor embeds the source model.

```text
BookRendererPrototypeModel or null
  → optional Book Renderer Integration Boundary
  → detached → prepared → mounted → released
  → frozen current mount model or null
  → future lightweight Room renderer (not implemented)
```

A non-null Book prototype prepares and mounts a fresh ownership record. Re-consuming the identical source is idempotent. A page replacement releases and detaches the old mount before preparing a new mount, so only the current page survives. A closed Book or surface switch supplies `null`, releases the active record, and clears current mount output. Disconnect releases ownership, detaches, and clears subscribers; reconnect begins a new monotonic ownership cycle, and repeated connect calls remain idempotent.

This boundary adds no React/R3F component, DOM, geometry, material, shader, 3D Book, page animation, PDF, image, video, Projection, URL, request, texture, decoder, viewer, player, or GPU resource. It is not imported by `RoomScene` or `RoomExperience`, which remain unchanged.

## Phase 13.8.2 BT-P03 Book renderer prototype

The immutable `BookVisualPresentationState` now maps through a stateless resolver into a frozen, renderer-ready model. This layer can describe a static resting Book, an opened current-page structure, or a reading state with complete current-page semantics, without owning or modifying presentation, navigation, or lifecycle state.

```text
BookVisualPresentationState or null
  → resolveBookRendererPrototype()
  → frozen BookRendererPrototypeModel or null
  → future lightweight Room renderer
```

Closed Book state and surface switches resolve to `null`. Each page update creates a fresh renderer model with only the current page; no previous-page cache or stale content is retained. Page transition intent is passed as a frozen `{ intent, execute: false }` hint and does not execute animation.

The prototype adds no React/R3F component, DOM, real 3D Book, geometry, material, shader, page animation, PDF, image, video, Projection, URL, request, texture, decoder, viewer, player, or GPU resource. `RoomScene` and `RoomExperience` remain unchanged.

## Phase 13.8.1 BT-P03 Book visual presentation state

The read-only Room Book mount now maps through one final pure-data boundary into a frozen visual presentation state. This is a director-language contract for a future renderer, not a renderer implementation.

```text
Book navigation + Presentation Connection
  → frozen Book read-only Room mount or null
  → Book visual presentation state resolver
  → spatial state + page state + visual language tokens + page semantics
  → future Book renderer (not implemented)
```

The spatial contract is `closed / resting / opened / reading`. A closed Book or a surface switch has no visual output (`null`); active mount lifecycles map deterministically from `preview → resting`, `focused → opened`, and `deep → reading`. Page state records the one-based current page, total page count, and a descriptive `none / previous / next / replace` transition intent. Transition intent is data only and does not create animation.

The four pages now carry distinct frozen visual semantics. Cover is a minimal warm-grey archive entry built around negative space and time. Visual Rule is a weathered-ivory rule study built around spatial light relations. Rejected Directions is a contrast-led decision edit built around rejection and judgement. Material Memory is an atmospheric smoked-parchment material field built around trace and recollection. These values are semantic tokens, not CSS or shader parameters.

The resolver is stateless and retains no visual output when its mount input becomes `null`. It creates no Book renderer, DOM, React/R3F component, UI, animation, PDF, image, video, Projection integration, URL, request, or media resource. `RoomScene`, `RoomExperience`, Seed, Forest, Tree, and Light remain unchanged.

## Phase 13.7.5 BT-P03 Book derived connection lifecycle audit and integration harness

The pure integration harness composes the existing Interaction Controller, Presentation Connection, Book navigation reducer, Derived Snapshot Connection, and read-only Room mount without importing any scene or rendering module.

```text
Room interaction → Presentation Connection snapshot ─┐
                                                     ├→ Book navigation state
navigation action ───────────────────────────────────┘
  → deterministic derived snapshot connection
  → frozen read-only Room mount snapshot
  → isolated subscribers
```

Derived diagnostics now retain frozen, monotonic navigation and mount-derivation sequences. Every entry is associated with the active connection epoch; teardown records the completed ownership cycle, final sequence positions, and cleanup outcome. The epoch guard invalidates captured upstream callbacks before release, so an old callback cannot derive or publish into a later reconnect cycle. Navigation after teardown is inert, surface switches publish `mount: null`, subscriber failures remain isolated, and each reconnect increments the ownership cycle.

The harness and audit remain pure TypeScript logic. They create no Book visual layer, UI, DOM or React/R3F component, animation, PDF, image, video, media request, viewer/player, or Projection integration. `RoomScene`, `RoomExperience`, Seed, Forest, Tree, and Light remain unchanged.

## Phase 13.7.4 BT-P03 Book derived snapshot connection

The Book Derived Snapshot Connection is the pure runtime boundary between the existing Presentation Connection and Book navigation derivation. On connect it subscribes once upstream and immediately derives the current frozen snapshot. Accepted navigation changes and presentation commits produce a new read-only Room mount snapshot and notify isolated subscribers.

```text
Presentation Connection snapshot ─┐
                                  ├→ Book navigation state
navigation action ────────────────┘  → deterministic derivation
                                     → Book read-only Room mount snapshot
                                     → isolated derived subscribers
```

The connection explicitly owns its upstream subscription, navigation state, and subscriber registry. Disconnect invalidates captured callbacks before releasing the upstream handle and clearing subscribers. `disconnect` and `teardown` are idempotent; reconnect creates a fresh ownership cycle. Frozen diagnostics expose connection state, cycle, ownership, last accepted navigation action, and cleanup failure status. Subscriber and cleanup errors are isolated from state commits and sibling delivery.

A surface switch derives and publishes `mount: null`, preventing stale Book content from surviving outside the Book surface. This connection creates no UI, DOM, React/R3F component, animation, PDF, image, video, Projection integration, viewer, player, request, or media resource. `RoomScene` and `RoomExperience` remain unchanged.

## Phase 13.7.3 BT-P03 Book navigation snapshot derivation contract

Book navigation and Room presentation lifecycle now meet at a pure derivation boundary. A frozen navigation state is reduced independently from the Presentation State Container, then both inputs are passed through the existing visual adapter and read-only mount functions. The same input values produce structurally equivalent frozen mount snapshots, while navigation boundaries and repeated close/reopen actions preserve state identity.

```text
Book navigation action → frozen navigation state ─┐
                                                  ├→ deterministic snapshot derivation
Presentation State Container snapshot ───────────┘  → Book Lightweight Visual Adapter
                                                     → Book Read-only Room Mount
                                                     → frozen mount snapshot or null
```

`next` and `previous` update only the page index within the four-page boundary. `close` suppresses the mount while retaining no visual model, and `reopen` deterministically restores the cover page. Closed navigation, a closed presentation, a non-Book active surface, a missing presentation, or an invalid page produces `mount: null`. Preview continues to force the cover; focused and deep lifecycle states consume the navigation page. Each successful derivation creates fresh frozen adapter and mount data, so no body block or page model can survive a page or surface change.

The contract owns no subscription, handler, DOM, React, R3F, animation, PDF, image, video, Projection, viewer, player, URL, request, or media resource. `RoomScene` and `RoomExperience` remain unchanged.

## Phase 13.7.2 BT-P03 Book read-only Room mount

The Room presentation boundary now exposes a pure read-only Book mount contract. It consumes the current frozen Presentation State Container snapshot and page index, delegates page shaping to the Book Lightweight Visual Adapter, and returns a new immutable view model for a future renderer. It creates no DOM, React, R3F, event, navigation, or media ownership.

```text
Room Interaction
  → Presentation Bridge
  → Presentation State Container
  → Book Lightweight Visual Adapter
  → Book Read-only Room Mount
  → future Room renderer
```

Lifecycle presentation is explicit: `closed` produces no mount, `preview` produces the cover in a lightweight `cover-preview` layout, `focused` produces a `page` layout, and `deep` produces an `expanded-page` layout. Preview deliberately resolves the cover regardless of retained navigation index. Focused and deep mounts consume the requested current page. Every resolution creates a new frozen mount and adapter model, so page changes cannot retain prior page blocks.

The resolver requires both the active surface and presentation surface to be `book`. A closed Book, a switched surface, a missing presentation, or an invalid page returns `null`, clearing stale Book output by construction. Placeholder media remains `source: null`; this phase adds no PDF, image loading, page animation, Book UI, Projection, video, viewer, player, DOM component, or R3F component. `RoomScene` and `RoomExperience` remain unchanged.

## Phase 13.7.1 BT-P03 Book lightweight visual adapter

The frozen Book presentation now maps through a stateless, pure visual adapter into renderer-ready data. The adapter accepts only the current presentation model and page index; it owns no state and returns `null` for a missing model, a closed Book, a non-Book surface, or an invalid page. This makes a surface switch discard the previous page representation by construction.

```text
Presentation State Container snapshot
  → active frozen Book PresentationModel + pageIndex
  → Book lightweight visual adapter
  → frozen title / body blocks / emphasis tokens
  → placeholder media slots / progress / interaction hints
  → future read-only Room presentation layer
```

All four prototype pages—Cover, Visual Rule, Rejected Directions, and Material Memory—use the same low-density visual grammar. Its structured tokens specify expansive whitespace, display and reading hierarchy, optional primary/secondary language hierarchy, and restrained placeholder media treatment without encoding CSS, DOM, React, or R3F decisions. Interaction hints are descriptive data only and do not install handlers.

Media slots preserve the existing local-placeholder metadata and always expose `source: null`. The adapter creates no URL, request, image, PDF, video, texture, decoder, viewer, player, DOM component, or R3F component. `RoomScene`, `RoomExperience`, Seed, Forest, Tree, Light, Projection, and the existing runtime ownership contracts remain unchanged.

## Phase 13.7 BT-P03 Book presentation prototype

The Room `book` surface now resolves the canonical `bt-p03-visual-development-book` fragment into a frozen `BookPresentationModel`. The factory reuses the shared presentation identity and lifecycle (`closed / preview / focused / deep`), while the existing Presentation State Container and Connection Contract remain the runtime owners.

```text
Room book transition
  → Content Presentation Bridge
  → canonical Work + Book fragment
  → Book presentation factory
  → frozen four-page structured content
  → Presentation State Container
  → existing Connection Contract
```

The v0.1 archive contains four lightweight pages: Cover, Visual Rule, Rejected Directions, and Material Memory. Each page is structured text plus frozen local-placeholder metadata; there is no source URL, request, image asset, PDF, texture, decoder, viewer, or player. Pure logic navigation exposes `pageIndex`, `next`, `previous`, and `close`; inputs at page boundaries and repeated close calls preserve snapshot identity.

Switching away from Book closes it through the existing atomic container behavior. Projection remains unimplemented. No DOM, React, or R3F listener is installed, and `RoomScene`, `RoomExperience`, Seed, Forest, Tree, Light, Projection, and all visual rendering remain unchanged.

## Phase 13.6.5 Presentation diagnostics observation and lifecycle audit

The Room Presentation Connection now exposes an explicit `observeDiagnostics()` contract. Diagnostics observers receive immutable current and previous snapshots after each accepted lifecycle audit event. Observer ownership is limited to its registration handle: unsubscribe is idempotent, and an observer failure cannot interrupt sibling observers, connection state, teardown, or presentation commits.

```text
connect / accepted transition / teardown step / disconnect
  → append frozen lifecycle audit entry
  → increment global audit sequence
  → create immutable diagnostics snapshot
  → isolated diagnostics observers
```

Each frozen audit entry records a globally monotonic `sequence`, the monotonic `connectionCycle`, and an action. Actions make accepted transitions traceable and preserve the deterministic lifecycle order `connect → transition* → teardown-controller → teardown-container → teardown-subscribers → disconnect`. Multiple connect/disconnect cycles append to one audit trail, making cycle boundaries and teardown consistency observable without owning or mutating presentation state.

Diagnostics observation remains pure connection logic. It adds no Book or Projection presentation, source URL, request, image, PDF, video, decoder, texture, viewer, player, DOM listener, React listener, R3F listener, or media resource. `RoomScene`, `RoomExperience`, Seed, Forest, Tree, and Light remain unchanged.

## Phase 13.6.4 Presentation connection diagnostics and deterministic teardown

The Room Presentation Connection now exposes a frozen `getDiagnostics()` snapshot containing connection state, connection cycle, immutable ownership, subscriber count, the most recently accepted transition, and the most recently completed disconnect record. Diagnostics observe the existing pure connection lifecycle only; they install no listener and own no presentation or media state.

```text
Controller transition
  → active connection epoch guard
  → lastTransition diagnostic record
  → Presentation State Container commit
  → immutable snapshot
  → current connection subscribers

disconnect
  → invalidate active epoch
  → release controller subscription
  → release container subscription
  → clear subscriber registry
  → publish immutable lastDisconnect record
```

Teardown uses the fixed `controller → container → subscribers` order on every connection cycle. Cleanup failures are isolated and recorded by resource without interrupting later release steps. Invalidating the active connection epoch before cleanup prevents captured callbacks from an older cycle from dispatching state or publishing notifications during teardown or after reconnect. Repeated connect/disconnect cycles end with no owned subscriptions or connection subscribers, while the independently owned Presentation State Container snapshot remains intact.

This contract adds no Book or Projection presentation, source URL, request, image, PDF, video, decoder, texture, viewer, player, DOM listener, React listener, R3F listener, or media resource. `RoomScene`, `RoomExperience`, Seed, Forest, Tree, and Light remain unchanged.

## Phase 13.6.3 Presentation connection ownership and fault isolation

The opt-in Room Presentation Connection explicitly owns its controller subscription, container subscription, and connection-subscriber registry. `getOwnership()` exposes an immutable diagnostic snapshot. Disconnect first marks the connection inactive and detaches both runtime handles, then releases each handle independently and clears all connection subscribers. A failure in one cleanup step cannot retain or block release of another owned resource; reconnect creates fresh runtime subscriptions while preserving the independently owned container snapshot.

```text
Controller subscription ─┐
Container subscription  ─┼→ Room Presentation Connection ownership
Subscriber registry     ─┘
                          ↓ disconnect
                 all handles released
                 subscriber registry cleared
                 container snapshot preserved
```

State commits and subscriber delivery are fault-isolated. The Presentation State Container treats bridge resolution as a transaction: if resolution fails, the existing immutable snapshot and its identity are preserved and no notification is published. Container and connection subscribers are invoked independently, so one callback failure cannot prevent sibling callbacks or roll back a completed commit. No UI, Book presentation, Projection presentation, source URL, request, image, PDF, video, decoder, texture, viewer, player, or media resource is introduced. `RoomScene`, `RoomExperience`, Seed, Forest, Tree, and Light remain unchanged.

## Phase 13.6.2 Process presentation orchestration connection

An explicit, opt-in connection now owns the full runtime subscription path from the Room Interaction Controller to the Presentation State Container. `connect()` installs the downstream container observer before accepting controller transitions. `disconnect()` stops the controller transition source first and then releases the container observer, preventing trailing notifications during cleanup. Repeated connect and disconnect calls are idempotent.

```text
Interaction Controller transition
  → Room Presentation Connection
  → unchanged Content Presentation Bridge
  → Presentation State Container commit
  → immutable snapshot
  → connection subscribers
```

Subscribers observe only completed container commits. A transition to another surface closes the current Process presentation and publishes one final snapshot, so no intermediate state with two active surfaces or mismatched surface/model identity is visible. Book and Projection presentation models remain unimplemented; the connection introduces no content rendering, media intent, URL, request, image, PDF, video, decoder, texture, viewer, player, DOM listener, React listener, or R3F listener. `RoomScene`, `RoomExperience`, Seed, Forest, Tree, and Light remain outside this opt-in connection.

## Phase 13.6.1 Process presentation state and accessibility

Process presentation runtime state now lives in an isolated container after the unchanged Content Presentation Bridge. The container consumes semantic `RoomInteractionTransition` values, retains an immutable snapshot, and exposes explicit `subscribe` / `unsubscribe` lifecycle ownership. Unchanged transitions return the existing snapshot and emit no notification. A leave transition closes Process, and attention moving to another Room surface closes the previous Process presentation before any future surface presentation can become active.

The keyboard accessibility contract is logic-only: focus maps to `approach → attend`, confirm maps to `activate`, Escape maps to `retreat`, and tab order remains `book → projection → interface`. It installs no DOM, React, or R3F listener. The Room controller and Interaction Orchestrator remain the owners of semantic transitions and media intent respectively; the state container neither bypasses them nor connects to Media Boundary.

```text
RoomInteractionTransition
  → unchanged Content Presentation Bridge
  → immutable Process PresentationModel
  → Presentation State Container
  → immutable snapshot
  → subscribers
```

Book and Projection remain unimplemented. No source URL, fetch, image, PDF, video, decoder, texture, viewer, player, media intent, or media resource is introduced.

## Phase 13.6 BT-P03 content presentation prototype

Room now has an opt-in Content Presentation Bridge that converts a semantic `RoomInteractionTransition` into an immutable, media-free presentation model. Interaction states map consistently to presentation states: `passing → closed`, `ambient → preview`, `focus → focused`, and `deep → deep`.

The first implementation is limited to the existing `interface → process → bt-p03-creative-decisions` binding. It resolves the canonical BT-P03 work and fragment through the content registry, then produces a structured Creative Decisions sequence using `Attempt → Problem → Decision → Rule`. The shared `PresentationModel<TContent>` contract keeps surface, mode, work, fragment, and state identity mode-neutral so Book and Projection can adopt it later.

This presentation path remains parallel to the Phase 13.5 orchestration/media-intent path. It does not dispatch media intent or change the interaction controller, orchestrator, or media boundary. It is not imported by `RoomScene` or `RoomExperience`; Book and Projection deliberately return no presentation model. No external source, video, PDF, image, viewer, player, request, decoder, texture, DOM listener, or R3F listener is present.

## Phase 13.5 Room interaction orchestration

Room now has an opt-in policy and orchestration layer between semantic interaction transitions and the Phase 13.4 media boundary:

`RoomInteractionTransition → resolveRoomMediaIntent() → MediaIntent → MediaBoundary`

Only a changed transition into `deep` produces `prepare`; a changed `leave` transition produces `release`. This applies to the explicitly bound Book/archive, Projection/motion, and Interface/process fragments. `passing`, `ambient`, and `focus` produce no intent. The policy does not accept `reducedMotion`, so accessibility presentation preferences cannot change semantic state or content eligibility.

`createRoomInteractionOrchestrator()` records a policy result through the metadata-only boundary and returns an immutable orchestration result for inspection. It is not connected to `RoomScene` or `RoomExperience` and owns no listener, URL, request, decoder, texture, viewer, player, or media resource.

## Phase 13.4 media and accessible-input boundaries

Room now has two additional opt-in, non-rendering boundaries. `createRoomInteractionAdapter()` translates pointer, touch, and keyboard descriptors into the existing controller events without attaching listeners or changing the current input system. Keyboard focus and touch start produce the guarded `approach → attend` path; confirm/primary activation produces `activate`; Escape produces one `retreat`; blur, pointer exit, and touch cancellation produce `leave`. The adapter exposes a stable `book → projection → interface` keyboard order and a `reducedMotion` capability flag. Reduced motion changes no semantic state or keyboard reachability; future presentation code must use the flag only to suppress or shorten motion.

`createMediaBoundary()` records `prepare` and `release` intent for each bound BT-P03 fragment. Its lifecycle is metadata-only: `idle → prepared → released`, with immutable transitions, snapshots, and subscription notifications. An intent is rejected when its fragment does not match the explicit Room surface binding. The boundary contains no source URL and cannot create a video element, PDF viewer, image, texture, decoder, player, network request, or GPU resource.

The intended future orchestration remains external to both boundaries: a successful Room transition may be interpreted as a media intent, but neither the interaction controller nor adapter dispatches media work directly. These modules are not imported by `RoomScene` or `RoomExperience`, so Seed, Forest, Tree, Room, and Light retain their current visuals, timelines, input behavior, and resource lifecycle.

## Phase 13.2 Room content interaction boundary

Room now has a metadata-only resolver for its existing `book`, `projection`, and `interface` surfaces. `resolveRoomContent()` joins a surface placement to its registered work and fragment, while `getFragmentBySurface()` exposes the fragment alone. The editorial `process` mode continues to resolve to the existing `interface` surface; no Room object is renamed.

Phase 13.3 adds an isolated runtime interaction controller for each Room surface. Typed events advance `passing → ambient → focus → deep`, while guarded retreat and leave events move attention back without rendering UI or loading media. Explicit BT-P03 bindings keep the `book`, `projection`, and `process → interface` relationships inspectable at the Room boundary.

The interaction contract defines the ordered states `passing`, `ambient`, `focus`, and `deep`. `getInteractionState()` returns immutable state metadata, and Room resolution defaults to `passing`. Only the `deep` definition permits a future media load; Phase 13.2 contains no state store, event handler, UI, player, PDF reader, media source, or resource request.

This bridge is intentionally not imported by the current Room scene. Seed, Forest, Tree, Room, and Light therefore retain their existing visuals, timelines, and narrative behavior.

## Phase 13.1 content boundary

Canonical portfolio metadata now lives in `src/content`, outside chapter presentation and scene code. `Work` records own project meaning, relations, rights, publication state, and fragments; `WorkFragment` records own one Book, Projection, or Process placement plus interaction and loading intent. The first metadata-only node is BT-P03, After the Second Sunset.

Room can later consume the registry through read-only selectors. Editorial `process` maps to the existing spatial `interface` surface at this boundary, so the public naming can evolve without changing Room geometry or its current visual timeline. The registry contains no production media URLs in Phase 13.1 and performs no loading or resource allocation.

The experience is one continuous five-act system: Seed, Forest, Tree, Room, and Light.

- `experience/` owns chapter composition and chapter-local presentation.
- `systems/timeline/` owns chapter state, normalized progress, and transition interfaces.
- `systems/camera/`, `audio/`, and `interaction/` own reusable runtime concerns.
- All five chapters are implemented: Seed v1.2 and Forest, Tree, Room, and Light v0.1.

`chapters.ts` is the single source of truth for the five normalized chapter ranges. The controller maps overall progress to chapter-local progress and exposes lifecycle-neutral enter, leave, and transition progress interfaces.

`useScrollExperience` is the first input adapter. Wheel, keyboard, and touch gestures write normalized overall progress without page navigation. Future pointer, autoplay, and accessibility adapters can target the same controller API.

Camera and chapter-audio contracts deliberately describe capability rather than visual or sonic treatment. Seed, Forest, and Tree are scrubbed by chapter progress. Forest owns a restrained human-scale-to-canopy camera move and placeholder wind, leaves, and distant-nature audio sources without changing the shared controller.

Tree is a bridge rather than a production-process scene. Its reversible progress moves from the familiar upright tree through an occluded time transition, to resting timber and a minimal transport silhouette, then toward a warmer interior threshold. Placeholder `wood_shift`, `distant_transport`, and `forest_pause` cues remain silent until sources are assigned.

Room continues that threshold without identifying a location or explaining manufacture. Its reversible progress reveals a dusk interior through natural window light, restrained artificial warmth, wooden architectural surfaces, and traces of an absent person. A book, paused projection, and active interface remain spatial presences rather than navigation or portfolio UI. Pointer input supplies only slight observation parallax. Placeholder `room_ambience`, `curtain_move`, and `projector_hum` cues remain silent until sources are assigned; the artificial light stays below the final Light chapter's narrative event.

Light remains in the same room and completes the five-act loop without becoming a reward or spectacle. Reversible progress lets the room's existing artificial light mature, quietly clarifies the book, projection, interface, and wooden surfaces, then turns the camera slightly back toward the window so the interior reconnects with the outside world. No new narrative object appears. Placeholder `light_room`, `outside_world`, and `final_ambience` cues remain silent until sources are assigned, with no strong music layer.

## Phase 9.1 rendering and loading

`Experience` now owns one persistent React Three Fiber `Canvas` through `SceneHost`. Chapter changes replace only the scene graph under that renderer; the canvas element, WebGL context, input controller, and audio director remain mounted for the full experience.

Chapter presentation and Three.js scene modules are separate dynamic imports. Seed is requested immediately. While a chapter runs, its previous and next module pairs are prepared after a short idle delay. Preparation caches JavaScript modules only: adjacent Three.js scene graphs are not mounted and do not allocate their geometry, materials, textures, lights, or animation loops until they become active.

On a boundary request, the currently rendered chapter remains at its appropriate boundary frame until the requested presentation and scene modules resolve. `SceneHost` then mounts the requested scene and reports readiness from its first React Three Fiber frame. The existing transition bridge covers only this handoff; it is not a new loading interface. The stage exposes `data-rendered-chapter` and `data-first-frame-ready` for diagnostics.

Only the active chapter scene graph is mounted. React Three Fiber disposes declaratively owned geometries and materials when that graph unmounts; chapter effects must keep GPU resources local to the scene and must not place them in permanent global caches. The persistent renderer and its WebGL context are disposed only when the complete Experience unmounts. Future loaded models, video textures, render targets, and non-declarative Three.js resources must add explicit local cleanup before entering this lifecycle.

Device capability is centralized in `systems/runtime/mediaCapabilities.ts`. The single canvas uses DPR 1–1.5 on desktop, 1–1.3 on mobile, and 1–1.15 for reduced-motion or low-concurrency devices. This includes Seed and replaces chapter-specific DPR values.

Audio availability is derived from assigned source URLs. When every source is null, the sound control is omitted, so the interface cannot advertise a non-functional SOUND ON state.
# Phase 13.8.4 stability gate

The BT-P03 Book path is now verified end to end through content, presentation, navigation, visual state, renderer prototype, integration boundary, and mount lifecycle. See `research/phase-13.8.4-bt-p03-book-renderer-end-to-end-stability-contract-v0.1.md` for the lifecycle rules, surface isolation, final asset boundary, and the gate for starting the visual renderer.
# Phase 13.8.5 — BT-P03 Book Minimal Visual Renderer v0.1

The first Room Book visual layer now consumes the frozen lifecycle and visual presentation contracts through a stateless resolver:

```text
Book content
→ Presentation / navigation
→ BookVisualPresentationState
→ BookRendererMountLifecycleModel
→ resolveBookMinimalVisualOutput(mount, state)
→ immutable layout, typography, paper, placement and Room-light tokens
→ BookMinimalVisual (R3F)
```

`resolveBookMinimalVisualOutput` returns output only for a matching mounted lifecycle/state pair. A release, missing source, or mismatched page returns `null`, so stale visuals cannot survive a source replacement. The output advertises its deliberately absent capabilities: it cannot mutate content, control navigation, control lifecycle, or execute page transitions.

The Room integration is intentionally minimal. `RoomScene` replaces its previous hand-authored Book geometry with `BookMinimalVisual`, using a read-only preview composed from the real BT-P03 cover data. The preview composition owns and releases the stability harness outside the renderer. Seed, Forest, Tree, Light, Interface, Projection, camera behavior, and Room lighting remain unchanged. This phase adds no complex model, animation, paper physics, PDF, image, video, asset request, or Projection runtime.

# Phase 13.8.6 — BT-P03 Book Runtime Interaction Connection v0.1

The Room Book now uses an owned runtime connection instead of a fixed preview:

```text
Room pointer / keyboard input
→ Room Interaction Adapter and Controller
→ Book Navigation
→ BookVisualPresentationState
→ renderer mount lifecycle
→ resolveBookMinimalVisualOutput
→ BookMinimalVisual
```

Pointer entry opens the Book and pointer leave releases it. Enter or Space opens the Book, Escape closes it, and the Left/Right Arrow keys move to the previous/next page. Closing, leaving the surface, or unmounting Room clears the visual and releases subscriptions. Reopening always starts from the cover with deterministic transition state.

The runtime connection owns input translation and subscriptions only. Interaction never mutates visual output, navigation never controls renderer lifecycle, and the stateless visual renderer retains no navigation or lifecycle capability. Page changes replace immutable visual output directly, without animation. No PDF, image, video, complex 3D, Projection runtime, or changes to Seed, Forest, Tree, or Light are introduced.

# Phase MVP-01.2.1 — BT-P03 Process Presentation Runtime Integration v0.1

The existing Creative Decisions presentation is now connected to the Room interface as BT-P03's second runnable entry:

```text
Room interface pointer / keyboard input
→ existing Room Interaction Adapter and Controller
→ existing Process Presentation State Container
→ resolveRoomProcessVisualOutput
→ immutable Attempt / Problem / Decision / Rule tokens
→ ProcessMinimalVisual
```

Open and focus expose the Process surface, close and a switch to Book or Projection release it, and reopening deterministically returns to the first of the three decisions. Arrow keys replace the active decision without animation. The Process source stays frozen and read-only; the visual adapter cannot mutate content or control presentation state, and Room interaction never creates visual output directly.

The visible interface uses a locally generated text texture from immutable presentation strings. It performs no network or asset request and loads no image, PDF, video, audio, model, or Projection runtime. Texture disposal is owned by the visual component. Seed, Forest, Tree, Light, Projection, and the canonical content record remain unchanged.

# Phase MVP-01.2.2 — BT-P03 Projection Runtime Boundary v0.1

BT-P03's third Room entry now resolves the canonical Motion Study through the existing content, presentation, media, and asset contracts:

```text
Room Projection pointer / keyboard input
→ Room Interaction Adapter and Controller
→ Projection Presentation State
→ metadata-only Media Boundary Intent
→ immutable Projection Runtime Output
→ ProjectionMinimalVisual identity surface
```

Open produces a deep Projection presentation and a `prepare` intent without executing playback. Focus exposes the Motion Study identity, while close, surface switch, and Room unmount publish no output and release the runtime's presentation and orchestration subscriptions. Reopen and reconnect deterministically restore the canonical `bt-p03-motion-study` identity.

The output contains `workId`, `fragmentId`, Motion Study identity, a non-executing playback intent, and a `null` future media-source slot. The existing Asset Boundary Contract keeps future projection video under `media-runtime` ownership. This phase creates no video element, player, decoder, media request, media texture, or source URL and changes no Seed, Forest, Tree, or Light behavior.

## Phase MVP-01.4 — BT-P03 Minimal Media Runtime v0.1

The confirmed eight-second Motion Blocking MP4 enters through a read-only Projection Asset Boundary entry. Projection presentation and visual code contain no source path:

```text
Projection asset registry
→ existing Media Boundary prepare intent
→ Projection-local Minimal Media Runtime
→ immutable runtime snapshot
→ ProjectionMinimalVisual video texture or static fallback
```

The runtime owns at most one muted, inline, looping video element. Deep/open performs `idle → prepared → loading → ready → playing`; close, pointer leave, surface switch, Room unmount, and disconnect perform `released`, pause playback, detach the source, and drop the element reference. Reopen creates a fresh ownership cycle. Unsupported environments, load failure, and autoplay rejection retain the identity surface as a static fallback without adding player controls.

The visual borrows the runtime-owned element only to create a local `VideoTexture`, which it disposes on replacement or unmount. It cannot prepare, load, play, pause, or release media. No manager, coordinator, player UI, other media source, or change to Seed, Forest, Tree, or Light is introduced.
## Phase MVP-01.3 — BT-P03 Complete Room Experience Integration v0.1

RoomScene now coordinates the existing Book, Process, and Projection runtime connections directly. Opening one surface closes the other two; close, pointer leave, Escape, unmount, and remount clear runtime output and local state deterministically. No manager, coordinator, or shared architecture layer was added.

While a Room surface is active, wheel, touch-move, and directional-key input remains owned by that surface so deep content cannot accidentally advance the five-act timeline. Closing returns those inputs to the existing global experience timeline. The resting Book, Interface, and Projection objects retain the existing light/attention language as the minimal discoverability contract. Seed, Forest, Tree, Light, reduced-motion art semantics, and the metadata-only Projection boundary remain unchanged.
