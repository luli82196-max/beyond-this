# Phase MVP-01.6.1 — Beyond This Full Experience Release QA & Performance Audit v0.1

Date: 2026-08-25

## Scope and release boundary

This pass audits the existing BT-P03 Exhibition Prototype for public-preview readiness. BT-P03 structure and the Seed, Forest, Tree, Room, and Light artistic logic remain frozen. No new content, presentation, lifecycle, media, or renderer layer was added.

## Passed checks

- Desktop browser path completed: Seed → Forest → Tree → Room → Book → Process → Projection → Room → Light.
- Every chapter reported its first WebGL frame ready after transition; one persistent canvas remained mounted throughout.
- Book, Process, and Projection remained mutually exclusive. Escape closed active Room content and chapter input resumed, allowing Room → Light.
- Keyboard navigation and pointer/tap entry remained functional. The reduced-motion semantic mapping regression passed and the existing media-query paths remain in place.
- Desktop 1280 × 720 and portrait 390 × 844 runs completed without console warnings or errors.
- Portrait Room entry targets were reachable, switchable, closable, and did not trap chapter navigation.
- Projection remained a wall surface without player controls. Media is created only on deep Projection entry and released on close, surface switch, or Room teardown.
- Book retained tabletop scale; Process retained the director-notes visual language; the three Room surfaces did not become overlay interfaces.
- TypeScript strict check passed.
- Vite production build passed.
- All 19 test files passed, including current Process, Projection/media, Book, and Complete Room integration regressions.

## Fixed issues

1. Room's generated wood, wall, and paper `DataTexture` resources were not explicitly disposed when Room unmounted. A scoped cleanup now disposes all three maps without changing rendering behavior.
2. Historical Presentation Bridge and State Container tests still asserted that Projection was unimplemented. Their assertions now describe the implemented Projection presentation and atomic surface switching, restoring a truthful full regression baseline.

## Performance audit

- Production entry chunk: 1,072.69 kB minified / 298.38 kB gzip.
- CSS: 12.08 kB minified / 3.32 kB gzip.
- Room scene chunk: 42.82 kB minified / 13.89 kB gzip.
- Seed experience chunk: 73.99 kB minified / 29.23 kB gzip; other chapter chunks are approximately 0.27–7.79 kB before gzip.
- Projection MP4: approximately 1,574.7 kB. It is not fetched on first paint by the application runtime; the video element is created on Projection deep entry with `preload="metadata"`.
- Adjacent chapters are prepared after a 250 ms idle window, reducing transition stalls without eagerly loading the entire chapter set at startup.
- Mobile/low-power DPR is already bounded to 1.0–1.3; desktop is bounded to 1.5. Reduced motion and low-power modes cap DPR at 1.15.
- Projection video listeners, source, playback, and texture are released. Process, Projection fallback, and Room procedural textures now all have explicit disposal paths.
- Vite still reports the >500 kB entry-chunk warning. Most of that chunk is the shared React/Three/WebGL runtime required by the persistent canvas. Artificial vendor splitting would change request topology but not reduce transferred code, so it was not introduced in this no-architecture-change pass.

## Deferred issues

- Physical iOS Safari and Android Chrome testing remains required for autoplay policy, safe areas, thermal behavior, sustained frame rate, and WebGL context recovery.
- Reduced-motion behavior is covered by source inspection and semantic regression, but a dedicated browser run with OS-level reduced motion should be included in device QA.
- The eight-second Projection loop still needs final authored-motion/color judgment. Runtime effects were not added to hide the edit point.
- Book long-form copy remains intentionally limited at Room distance on phones; a dedicated reader would be a product expansion.
- The entry chunk warning remains a performance risk on slow devices. A later measured optimization pass may evaluate Three.js tree-shaking/vendor caching using real network and CPU profiles.
- Audio assets are still placeholders, so final audio decode, network, and memory cost cannot yet be audited.

## Release risks

- Highest: unverified physical mobile-browser autoplay, heat, safe-area, and WebGL recovery behavior.
- Medium: 298.38 kB gzip application entry plus WebGL parse/compile cost on low-end phones.
- Medium: final Projection asset grading and loop authorship are not locked.
- Low for desktop preview: no runtime errors, stale media ownership, trapped input, or failed current regression was observed.

## Release threshold

The build reaches the **public desktop/responsive preview candidate** threshold. It should not yet be labeled fully public-device-ready until physical iOS Safari and Android Chrome QA and the final Projection motion/color review pass.

