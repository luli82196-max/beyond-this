# MVP-02.3 — Tree Material Continuity & Transition Art Pass

Status: implementation, local visual QA and engineering validation complete

Baseline: `b7860da visual: rebuild forest production scene`

Scope: Tree production art, shared wood-material contract, and the minimum Forest/Room material references required for continuity. ExperienceController, chapter boundaries, narrative timing, Room interaction systems, Book/Process/Projection, Media Runtime, audio, DPR and deployment structure are unchanged.

## Before

- Tree used an unrelated 128 px bark texture, a darker brown palette and 9-sided upright branches, so the entrance tree did not convincingly inherit the Forest hero tree.
- The resting log used a simple radial sine map plus overlay rings. Sapwood/heartwood, rays, radial checking and a fresh cut response were not materially coherent.
- The transport log remained bark-only. It communicated relocation, but not the quiet transition from natural tree to usable material.
- Tree fog and ground moved from gray-green to brown abruptly near the chapter exit. Room wood used an independent sinusoidal grayscale generator, so the material genealogy existed only in the visual bible.
- Tree haze points added small transparent detail without supporting the wood transformation.

## Material continuity contract

`src/experience/materialContinuity.ts` is the reusable contract for the sequence:

| Stage | Contract |
|---|---|
| Forest / Tree bark | Base `#b39a78`, roughness `.93`, bump `.105`, repeat `3.2 × 7.5`; warm umber color response, longitudinal furrows, fine fissures and low-frequency age bands. |
| Tree end grain | Heartwood `#8f6845`, sapwood `#b89262`, fresh surface `#c3a06d`; irregular rings, medullary rays, three non-uniform radial checks and lower `.78` roughness on the fresh face. |
| Worked / transported wood | Base `#765638`, restrained wear target `#987552`; fibers retain the bark direction after partial debarking, with reduced relief and `.84` roughness. |
| Room wood target | `#735438`, roughness `.88`; the same fiber generator at a milled scale, finer bump and less random noise. |

Forest now imports the bark generator and constants instead of owning a private copy. Room imports the worked-wood generator and target values. No texture file, binary asset, dependency or network request was added.

## Tree art changes

- Rebuilt the entrance tree with 14/10-sided structural branches, Forest bark scale and the Forest olive/gray restrained-gold foliage palette.
- Replaced 92/164 scattered leaf ellipsoids with 18 reduced-motion or 27 regular endpoint-oriented icosahedral crown masses in one instanced draw. Sway is slower and lower amplitude; reduced motion resolves time to zero.
- The resting log retains the entrance trunk diameter, taper and bark mapping. A slight perspective angle exposes the cut face while preserving the lateral falling-tree silhouette.
- Both cut ends use a generated color/bump texture with irregular growth rings and rays. Three restrained geometry checks are offset above the face to avoid coplanar flicker; double-sided cut material keeps reverse traversal stable.
- The transport stage keeps the muted existing carrier silhouette but adds only two understated straps and a partial debarked/worked face. It avoids saws, machinery, signage or modern industrial iconography.
- Removed Tree haze particles. Added no new scene system and did not change `tree.types.ts` timing.

## Color, light and transition

- Forest → Tree begins at `#737b6d` with olive foliage and the exact Forest bark family, so the entrance reads as the same organism under a closer, lower-angle view.
- Tree is the hinge, not an amber chapter: cool gray-green air and a warm grazing key coexist while the cut face carries the first concentrated warm material.
- During `roomThreshold`, background/fog interpolate toward `#55483c`, ground toward `#4b392b`, the cool fill moves toward muted warm brown, and the worked surface approaches the Room wood target.
- Tree darks are opened with scene-local hemisphere/fill light. No global exposure, tone mapping, CSS grain, vignette or baseline dark-level value changed.
- Room table/chair wood now uses the same worked-fiber logic with a smaller bump and `.88` roughness. Room lighting and interaction behavior are unchanged.

## QA

Local production preview was rebuilt and inspected on 2026-08-26.

- 1440×900: Tree entrance, resting/transport material stages and Room threshold inspected. Bark direction remains stable, transport remains readable in darks, and the Room wood arrival is a continuation rather than a brown color cut.
- 390×844: entrance tree trunk/crown identity and title composition pass with scene-local camera distance compensation.
- Forest → Tree forward and Tree → Forest reverse: normal scroll traversal reached and remounted both chapters without stuck state or console output.
- Tree → Room forward and Room → Tree reverse: normal scroll traversal reached and remounted both chapters; the shared wood relation and late warm-light transition remain visible in both directions.
- Reduced motion: deterministic source path verified. Crown animation time resolves to zero, counts reduce from 27 to 18 and shadow size remains 512. The available browser did not expose OS media-feature emulation, so no reduced-motion screenshot is claimed.
- Console warnings/errors: 0.
- No cut-face flicker was observed. Face layers use explicit Z offsets, depth-write restraint and polygon offset. Generated textures are deterministic, directional and combine features at different frequencies to avoid obvious square/random repetition.

## Performance and build delta

No dependency or binary asset was added. Tree removes one points draw, keeps one instanced crown draw, and adds cut-face/strap detail only while the relevant stage is visible. Draw calls are not materially increased across a stable stage; no historical GPU timing baseline exists, so no timing claim is made.

Comparison against the checked-in `dist` from `b7860da`:

| Artifact | Baseline | MVP-02.3 | Change |
|---|---:|---:|---:|
| Tree scene chunk | 7,168 B | 7,339 B | +171 B |
| Tree scene gzip | not recorded | 2.63 kB | current only |
| Shared material contract | 0 B | 1,844 B | +1,844 B |
| Forest scene chunk | 9,557 B | 9,124 B | -433 B |
| Room scene chunk | 42,819 B | 42,774 B | -45 B |
| Main JS bundle | 1,073,577 B | 1,073,782 B | +205 B |

The existing Vite `>500 kB` main-chunk advisory remains. Production build completed with Vite 7.3.6 and 136 transformed modules.

## Engineering validation

- TypeScript strict (`tsc -b`): passed.
- Existing aggregate suite: passed, 81 assertions across 14 bundled test files.
- Additional Book minimal renderer/runtime, Process runtime, Projection runtime, complete Room integration and Media Runtime scripts: passed.
- Vite production build: passed.
- pnpm preflight still exits on the existing `esbuild@0.28.2` ignored-build policy. No approval, dependency or lockfile change was made; the identical package scripts were executed directly with the existing local Node/Vite dependencies.

## Known limits

- The Tree entrance preserves the Forest identity through shared proportions, palette and exact material logic, but is not the same manifold geometry as the Forest growth-path mesh.
- Cut checks are shallow layered geometry, not cuts carved into a watertight log. This is adequate at the approved camera but not for an extreme macro shot.
- The carrier remains an intentionally abstract narrative device inherited from the existing scene. A future pass should not add industrial detail unless the narrative direction changes.
- Reduced-motion behavior was verified from the deterministic code path rather than an emulated screenshot.

## Gate and next step

The local MVP-02.3 art and engineering gate is passed. Forest bark → Tree bark/end grain → worked wood → Room wood now forms a consistent material chain without changing the chapter architecture or pacing. The next recommended pass is **MVP-02.4 Room Production Art Pass**: improve table joinery, chair silhouette, curtain thickness/folds, wall/window response and object-specific wood mapping while preserving the shared material contract. A Light Final Grade should follow Room production art rather than precede it.
