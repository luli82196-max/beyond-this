# MVP-02.4 — Room Production Art Pass

Status: implementation, local visual QA and engineering validation complete

Baseline: `f9a855c61b47eb896c131ae63d9590cf88aaec72`

Scope: Room scene production art and the minimum material treatment on its three existing physical entry surfaces. ExperienceController, chapter timing/boundaries, Book/Process/Projection content and runtime, Media Runtime, DPR, audio, deployment structure, Forest/Tree art logic and Light grade are unchanged.

## Before

- The table was a top slab and two rectangular side blocks; it had no apron, four-leg logic, bracing or readable joinery.
- The chair was a seat box, four box legs and one back slab, so its silhouette read as placeholder geometry.
- The window and curtain were front-facing planes. The wall opening had no reveal, sill, glazing depth or sash hierarchy; the curtain had no cloth volume or folds.
- Floor, table and chair reused the same worked-wood texture at effectively the same scale and direction.
- Wall, paper, curtain and projection carrier clustered near uniformly matte roughness values.
- Dressing consisted of one paper-like plane and one circular object, which did not establish a recently occupied creative workspace.

## Model changes

### Table

The table retains the approved footprint and interaction layout, but now has a thicker five-segment top, recessed apron, four tapered octagonal legs, visible leg blocks and two restrained long braces. A broad, low-opacity polished-use region breaks the untouched procedural surface without adding a decal asset. The construction reads as older workshop furniture rather than a modern office desk.

### Chair

The chair now uses a separate seat, four slightly splayed tapered legs, two back uprights, three diminishing back slats and a lower brace. Complexity stays low and all parts use built-in primitives, but load paths and silhouette are legible from the approved camera.

### Window and curtain

The window is built as a wall-set outer frame, recessed glass volume, vertical and horizontal sash, and projecting sill. Glass has a distinct low-roughness/transmission response while the frame uses a weathered wood variant.

The curtain uses one shared low-resolution displaced plane geometry (18 by 7 subdivisions) with seven vertical folds, mild variation down the drop, a contracted upper fall and a darker back layer. It reads as cloth with thickness rather than a transparent card; motion remains governed by the existing `curtainDrift` and reduced-motion path.

### Projection and physical entry carriers

The Projection carrier is now a shallow box with a top hanging rod and a lower-roughness wall/screen response. Process gains an inset dark bezel inside its existing body and stand. Book keeps the same renderer/runtime geometry, but its cover response and small resting fill make the closed physical book readable at portrait size. No content adapter, media ownership or interaction state changed.

## Narrative dressing

The room adds only a working pair of loose papers, one pencil, three small stacked books/paper objects and one ceramic cup. They are clustered around the table's center-right working zone so the impression is “the creator just stepped away.” They remain lower contrast and smaller than Book, Process and Projection, and no person, camera, computer clutter or overt industrial prop was added.

## Material differentiation

- Table: shared MVP-02.3 worked-wood source, long directional repeat, `.72` roughness, fine bump and a restrained polished-use patch.
- Floor: the same material genealogy rotated 90 degrees, enlarged in scale and shifted in phase; `.91` roughness and smaller bump keep it broader and older than the desktop.
- Chair: darker/older wood, denser repeat, independent offset and `.90` roughness.
- Window: separate scale/offset, weathered color and `.76–.82` roughness across frame and sill.
- Structural table wood: darker offset wood with `.86` roughness, separating joinery from the handled top.
- Paper: directional fiber map, `.76` roughness and fine bump.
- Curtain: `.72` front response and darker `.88` back layer with geometry-driven folds.
- Wall: reduced from uniform full matte to `.84`, with lower bump so grazing light can describe it without looking glossy.
- Glass: `.20` roughness with restrained transmission/opacity.
- Projection carrier/bezel: `.76` and `.62–.70` responses, distinct from wall and cloth.

All wood maps are deterministic clones of the shared contract with object-specific repeat, offset and rotation. No texture file, binary asset, dependency or network request was added.

## Color and lighting

Room remains a dusk chapter. The window-side directional light moves to a muted cool blue-gray and the hemisphere sky becomes cooler, while the existing interior point source remains restrained amber. Book receives a small warm resting fill so it stays a physical object instead of an emissive UI. The three entries gain hierarchy through local material/light response, not self-lit labels. Fog is slightly cooler and farther, preserving foreground/midground/background separation.

No global exposure, grain, tone mapping, vignette or Light-scene value changed. Room's terminal state remains materially darker and cooler than Light, leaving both brightness and chroma headroom for MVP-02.5.

## Interaction and frozen systems

Book, Process and Projection retain their original groups, hit volumes, pointer handlers, keyboard routing, mutual exclusion and close behavior. Projection still receives the existing media element and owns no new playback source. Portrait group offsets and the existing scene-local camera compensation remain unchanged. ExperienceController, chapter mapping, presentation adapters/containers, media lifecycle, audio, DPR and deployment were not modified.

## Performance and build delta

No heavy dependency or binary asset was added. The pass uses low-segment cylinders, boxes and one shared 18 by 7 curtain geometry. Wood variations clone one generated source texture instead of generating or downloading separate images.

Comparison against the checked-in `dist` from `f9a855c`:

| Artifact | Baseline | MVP-02.4 | Change |
|---|---:|---:|---:|
| Room scene chunk | 42,774 B | 47,011 B | +4,237 B |
| Room scene gzip | not recorded | 15.02 kB | current only |
| Main JS bundle | 1,073,782 B | 1,073,800 B | +18 B |

The existing Vite `>500 kB` advisory remains. Production build completed with 136 transformed modules. No historical GPU timing baseline exists, so no timing claim is made.

## QA

Local production preview was rebuilt and inspected on 2026-08-26.

- 1440×900: passed. Window/curtain form the background layer, Projection occupies the wall middle layer, and table/Book/Process/dressing/chair build the foreground without crowding the three entry zones.
- 390×844: passed after a second entry-readability correction. Projection, Process and the Book working zone remain distinguishable within the existing portrait camera compensation; furniture does not cover their hit volumes.
- Tree → Room and Room → Tree: passed through normal scroll traversal. The shared wood genealogy remains readable in both directions and remounting produced no console output.
- Room → Light and Light → Room: passed through normal scroll traversal. Light remains visibly brighter and more resolved; reverse traversal restores Room without stuck state.
- Book / Process / Projection: complete automated renderer/runtime/integration regressions passed, including open, navigation, mutual exclusion, close, Projection playback intent and release. Portrait pointer/keyboard smoke checks produced no console output.
- Reduced motion: deterministic source path verified. Curtain animation is skipped, dust is static with reduced count, and existing camera-pointer motion remains disabled. The available browser did not expose OS media-feature emulation, so no emulated screenshot is claimed.
- Hotspots: existing transparent hit volumes and scene-local portrait offsets are unchanged and remain aligned with their physical carriers.
- Console warnings/errors: 0 at inspected desktop, portrait and interaction states.

## Engineering validation

- Strict TypeScript (`tsc -b`): passed.
- Existing aggregate suite: passed, including the 14 bundled policy/presentation/Book files.
- Additional Book minimal renderer/runtime, Process runtime, Projection runtime, complete Room integration and Media Runtime scripts: passed.
- Vite production build: passed with Vite 7.3.6, 136 modules transformed.
- The environment's pnpm preflight still attempts its known dependency status/install path and cannot write its temporary file under the managed sandbox. No dependency or lockfile changed; the identical package commands were executed directly with the existing local Node/Vite dependencies.

## Known limits

- Furniture remains lightweight runtime primitive modeling rather than authored bevel/subdivision assets. Silhouettes and joinery pass the approved cameras but are not intended for macro inspection.
- The curtain has modeled folds and a back layer, but not cloth simulation or true solid side walls. Its tested view does not expose the open edge.
- Dressing is deliberately sparse and non-interactive. A later content pass should not turn it into generic asset-pack clutter.
- Room and Light intentionally do not share identical geometry implementations. MVP-02.5 must grade their transition without importing Room's new production geometry wholesale or erasing the current brightness gap.
- Reduced-motion visual behavior was verified from its deterministic code path rather than an emulated OS screenshot.

## MVP-02.5 entry gate

MVP-02.4 meets the local art and engineering gate for **MVP-02.5 — Light Final Grade**. Room now has credible spatial construction, restrained occupation evidence, object-specific material response, a controlled dusk cool/warm relationship, intact interaction behavior, clean desktop/portrait previews and sufficient luminance/color headroom for the final Light transformation. MVP-02.5 should preserve these Room values as its incoming baseline and change the Light chapter's maturity, atmosphere and final-state hierarchy rather than globally lifting exposure.
