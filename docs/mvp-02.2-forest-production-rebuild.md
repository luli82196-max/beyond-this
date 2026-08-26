# MVP-02.2 — Forest Production Rebuild

Status: implementation and local QA complete

Baseline: `72ec17050c92366613ceca6e2aadb9b372747c4a`

Scope: Forest scene art and scene-local camera composition only

## Decision

The production Forest uses a lightweight runtime growth-path tree rather than importing any research GLB. The v006 research supplied the useful structural model (one trunk, unequal primary paths, sparse secondary support and foliage placed at branch terminals), but its 29 independently capped overlapping components remain visibly assembled at junctions. The production version therefore uses fewer, longer centripetal Catmull-Rom paths, deeper branch embed points, concealed bases and a restrained three-lobe silhouette pressure. This is a new, simpler production tree informed by the research rather than a claim that v006 passed its rejected art gate.

## Research asset disposition

- `hero-tree-v0.6/BeyondTree_LOD0_v006.glb` and `.blend`: not shipped. Kept as research evidence for smooth low-cost sweeps, supported endpoints and the 7,164-triangle budget; rejected for visible inserted-branch seams/end-cap contacts.
- v006 leaf palette and terminal-cluster logic: conceptually retained. The production palette is regraded to olive, muted autumn and restrained gold; terminal anchors organize both mass clusters and sparse local leaves.
- `hero-tree-v0.5/BeyondTree_LOD0_v005.glb` and `.blend`: not shipped. Its single connected skin is useful topology evidence, but voxel serration, leaf/support mismatch and 19,922-triangle cost do not justify runtime integration.
- v001-v004: retained only as historical research. Their cylinder/repair-shell, faceting and earlier crown issues are superseded.
- v002 bark base-color/normal/roughness textures: not copied into production. Their visual principle is retained with a generated two-scale longitudinal furrow/fissure texture so this pass adds no network request or binary payload.

## Production Forest structure

### Hero tree

- 1 curved/tapered trunk path, 5 unequal primary paths and 8 visible secondary supports.
- Trunk/primary/secondary radii step down from `0.52` through `0.31–0.20` to `0.16–0.11` scene units.
- 14 radial segments on structural paths and 10 on small supports replace the former 9-sided cylinders.
- Centripetal curves, buried origins, unequal reach/lift/azimuth and base/root volumes preserve a stable mature-tree silhouette without repeated modular collars.

### Bark and material continuity

- Bark base color: `#b39a78` multiplied by a warm umber procedural color map; roughness `0.93`, metalness `0`.
- Bump scale: `0.105`; texture repeat `3.2 × 7.5`; 192-square deterministic DataTextures.
- Detail combines long vertical furrows, fine fissures and low-frequency age bands. The reusable Tree continuity rule is warm umber base + long grain/furrow direction + fine dark fissures + high roughness. A later Tree Material Continuity pass can reuse these functions/values and reinterpret the same grain direction as end-grain rings on cut faces. Tree is intentionally unchanged here.

### Leaf canopy

- 15 endpoint-oriented mass clusters replace 120/220 random ellipsoids.
- Each cluster is one instanced low-frequency icosahedral mass; 45 reduced-motion/mobile or 90 regular local leaf cards add edge detail.
- Palette: `#596044`, `#69704c`, `#77734b`, `#81744b`, `#8c794c`, `#6c6240`.
- Motion is coherent and low frequency: cluster/local sway at `0.27 Hz` plus slower drift at `0.16 Hz`, maximum positional sway about `0.018` scene units. Reduced motion fixes time at zero.

### Four spatial layers

1. Foreground framing: near-black side trunks and instanced vegetation silhouettes; lowest detail and no motion.
2. Hero tree: highest contrast, bark detail, cast/receive shadows and restrained foliage motion.
3. Midground: 8 reduced or 12 regular secondary trees with lower contrast, simple shared primitive language and no local foliage flutter.
4. Background: 12 reduced or 18 muted silhouettes beyond the fog start, lowest saturation/contrast and no motion.

### Lighting and atmosphere

- Warm side/back key at `[-4.5, 8.5, -2.8]`, intensity `2.15 + lightShift × 0.28`.
- Cool-soft front fill at `[4, 4, 5]`, intensity `1.08`, plus restrained ambient/hemisphere support so bark remains readable in the clean dark baseline.
- Fog moved from `5.2–15.5` to `7.4–18`; it separates distant layers instead of washing the hero asset.
- Particle haze was removed. Existing DPR, shadow-map policy (512 reduced / 1024 regular), global low-grain baseline and chapter effects remain unchanged.

### Camera and timeline continuity

The existing Forest inputs and mappings (`scaleReveal`, `cameraLift`, `canopyAttention`, `lightShift`, title and exit fade) are untouched. Desktop camera positions and look targets remain the same. A scene-local aspect-ratio offset adds up to 5 units of camera distance below aspect `0.82`, keeping the tree hierarchy in the 390×844 portrait frame without changing progress, duration or chapter boundaries.

## Performance and build delta

No dependency or binary asset was added. Hero foliage uses two instanced draws; foreground foliage is instanced; materials and geometry are shared within each system. The hero woody system uses 14 draw calls to retain independent curve construction, while the previous prototype used 6 branch draws. This is the principal known draw-call tradeoff and a future merge candidate.

Production build comparison against the checked-in baseline `dist`:

| Artifact | Baseline | MVP-02.2 | Change |
|---|---:|---:|---:|
| Forest scene chunk | 5,604 B | 9,557 B | +3,953 B |
| Forest scene gzip | not recorded in the baseline listing | 3.79 kB | current value only |
| Main JS bundle | 1,073,519 B | 1,073,577 B | +58 B |

The existing Vite `>500 kB` main-chunk advisory remains. No historical draw-call/GPU timing capture exists, so none is invented.

## QA record

Local production preview was rebuilt and inspected on 2026-08-26.

- Desktop 1440×900: passed at Forest stable mid-frame. Trunk/primary/secondary hierarchy, bark relief, canopy masses, midground trunks and background silhouettes remain distinct.
- Portrait 390×844: passed after scene-local aspect compensation; hero structure and title remain in frame without changing the timeline.
- Static/reduced-motion: source path verified — all foliage time resolves to zero, foreground/midground/background are already static, and reduced counts/shadow policy remain active. The browser control available in this environment could not emulate the OS media feature, so no reduced-motion screenshot is claimed.
- Motion: two captures separated in live runtime showed coherent cluster sway; no scatter, explosive displacement or point-particle haze remains.
- Forward and reverse chapter traversal: Seed → Forest → Tree and Tree → Forest both reached through normal scroll; Forest remounted without console output or stuck transition.
- Console: 0 warnings and 0 errors at desktop and portrait Forest states.
- Strict TypeScript: passed (`tsc -b`).
- Existing core suite: passed, including the aggregate 12-file suite plus Book renderer/runtime, Process runtime, Projection runtime, complete Room integration and media runtime scripts.
- Vite production build: passed with Vite 7.3.6, 135 modules transformed.

## Known issues

- Separate growth-path meshes are visually buried at branch origins but are not a single manifold authored skin. No exposed cap was observed at the tested framing; a future close-camera use would require authored union/retopology.
- Bark is generated at runtime and intentionally graphic at this stage. The later continuity pass should validate its scale against Tree close views before sharing it verbatim.
- Hero woody geometry remains 14 draws. Merging static geometry would lower draws but should be done only after preserving per-path UV scale and shadows.
- Reduced-motion visual behavior was verified from the deterministic code path rather than a browser-emulated screenshot because the available browser surface did not expose media-feature emulation.

## Gate and next step

MVP-02.2 meets the engineering and local visual gate for MVP-02.3: the Forest now reads as a layered discovery scene, the hero tree has an explicit growth hierarchy and bark language, the canopy reads mass-first, desktop/portrait and reverse traversal pass, and tests/build/console are clean. Recommended next step: **Tree Material Continuity**, using the documented bark direction, roughness and palette before the wider Room Production Art Pass.
