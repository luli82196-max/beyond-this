# MVP-02.1.1 — Render Baseline Calibration

Date: 2026-08-26  
Scope: production render baseline only; no feature work, scene rebuild, dependency change, or timeline change.

## Purpose

Remove global visual contamination that hides asset quality before MVP-02.2. The baseline should remain cinematic, but grain must read as a finishing texture rather than the first visible event. Important dark forms should remain legible without raising global exposure.

## Baseline and calibrated values

| Surface | Previous value | Calibrated value | Reason |
|---|---|---|---|
| Grain composite opacity | `.055` | `.018` | Places the shared full-screen grain inside the audit target of `.012–.025`; `.018` is deliberately conservative because the layer covers 200% of the viewport and is present in all five acts. |
| Grain spatial construction | SVG `fractalNoise`, `baseFrequency=.9`, `numOctaves=3` | Same base frequency, `numOctaves=1` | Removes coarse multi-octave accumulation while retaining fine luminance texture. |
| Grain cadence | `.22s steps(2)` | `1.2s steps(4)` | Reduces rapid electronic-static cadence without adding a post-processing dependency. |
| Grain displacement | up to `3%` per keyframe | up to `.35%` per keyframe | Keeps subtle frame variation while preventing large jumps from becoming a visible event. |
| Seed vignette radial mid/edge | `.30 / .88` | `.24 / .72` | Relieves the clearest stable-frame black crush while retaining the low-key Seed composition. |
| Seed vignette side darkening | `.36 / .44` | `.24 / .30` | Reduces compounded edge contamination; the center, exposure, lights, fog, and narrative reveal remain unchanged. |

## Reviewed and intentionally unchanged

- Forest, Tree, Room, and Light canvas saturation/contrast/brightness filters remain unchanged. Their current values are part of the act-level color treatment and should not be regraded without controlled captures.
- Forest atmosphere and vignette, Tree veil/threshold/vignette, Room threshold/dusk/vignette, and Light continuity/breath/vignette remain unchanged. Several are progress-driven transition effects rather than constant stable-frame pollution.
- Scene fog remains unchanged. Changing fog range without stable-state visual evidence risks altering depth and the five-act color script.
- Seed reveal blur/brightness remains unchanged because it is timeline-driven and resolves at full observation.
- DPR, shadows, scene geometry, materials, animation, timeline, interaction, media runtime, audio, deployment, and dependencies are unchanged.
- In particular, `ForestScene` geometry is untouched. The cleaner baseline is expected to expose its current prototype quality more honestly.

## Visual target and before/after judgment

The code-level before/after is deterministic: the global grain contribution is reduced from `.055` with three noise octaves to `.018` with one octave; motion changes from rapid, multi-percent two-step jumps to sub-percent four-step variation. Seed edge black is also reduced without changing exposure.

Expected visual result:

- grain remains perceptible on inspection but is no longer the first reading of a frame;
- dark silhouettes and material boundaries, especially at Seed edges, retain more separation;
- Forest leaves, primitive trunks, and sparse depth become easier to judge rather than being cosmetically hidden;
- chapter pacing, camera, interaction, and color relationships remain the same.

Automated browser captures are accepted only if all five stable states can be reached repeatably at fixed progress and viewport. Local production-preview navigation reached all five acts through the normal Skip/Continue/scroll path and produced after-only reference frames. No matching pre-calibration frames existed, so these are not represented as controlled before/after pairs; the manual matrix remains the comparison authority.

## Manual five-act acceptance matrix

Use one calibrated desktop display at 1920×1080 or 1440p, browser zoom 100%, and one representative mobile viewport. Disable extensions that alter color. For each act, pause at a stable midpoint rather than a transition and compare the parent commit `d9a2370e57c14b0aa939666050b9e50749f5dba1` with this calibration.

For every frame, inspect normal grain and a temporary DevTools override of `.grain { opacity: 0 }`. The clean frame must remain acceptable; the grain-on frame may add cohesion but may not hide defects.

| Act | Stable-state acceptance |
|---|---|
| Seed | Seed shell, soil boundary, wet marks, and edge environment remain separable; corners stay dark but do not collapse into a single black mass; reveal blur resolves normally. |
| Forest | Trunk/branch silhouette remains readable against fog; leaf clusters do not acquire a dancing static layer; current geometric roughness is plainly visible and logged for MVP-02.2. |
| Tree | Bark, cut face, straps/transport silhouette, and background remain separable; time veil is judged only after it resolves. |
| Room | Table, chair, book, window, projection surface, and interaction labels remain locatable in shadow; threshold blur is not mistaken for the stable state. |
| Light | Room continuity remains intact; ivory/warm light and dusk-blue relationship is preserved; the final frame is clearer rather than globally brighter. |

Across all acts, reject the calibration if grain reads as flicker, crawling digital static, or a mask over flat materials; reject it if any interaction target, chapter transition, media behavior, or timing differs from the parent commit.

## Rollback

- Pre-calibration code point: `d9a2370e57c14b0aa939666050b9e50749f5dba1`.
- The implementation change is isolated to `.grain`, the Seed `.vignette`, and `@keyframes grain` in `src/styles.css`.
- Revert the calibration commit to restore all previous render parameters. Do not copy individual values across later art passes unless the later baseline is also documented.

## Validation record

Validation completed on 2026-08-26:

- Strict TypeScript: passed (`tsc -b`, via the existing project script).
- Aggregate regression suite: passed, 70 tests across the 12 bundled test files.
- Additional regressions: passed — Book minimal renderer, Book runtime interaction, Process runtime, Projection runtime, complete Room integration, and media runtime.
- Production build: passed with Vite `7.3.6`; 135 modules transformed. The existing `>500 kB` chunk-size advisory remains; no new build failure or calibration-specific warning appeared.
- Package-manager note: the environment's pnpm preflight exits on the already-known `esbuild@0.28.2` ignored-build policy. No dependency script was approved and no dependency or lockfile was changed. The same package scripts were run against the existing local dependencies using the bundled Node runtime.
- Local production preview: Seed, Forest, Tree, Room, and Light were reached through normal user navigation. Console warning/error count at the inspected stable states: 0.
- After-only frames: `mvp-02.1.1-seed-after.png`, `mvp-02.1.1-forest-after.png`, `mvp-02.1.1-tree-after.png`, `mvp-02.1.1-room-after.png`, and `mvp-02.1.1-light-after.png` were captured outside the repository as QA deliverables.
- Controlled before/after screenshot pair: not available. The parent commit had no fixed-progress baseline captures, so no comparison pair is claimed.

## Gate decision

The engineering and local-runtime gate for beginning MVP-02.2 is **passed**: the change is isolated, tests/build pass, the five-act path remains intact, grain is visually secondary in the after frames, and Forest's prototype geometry is more plainly exposed. Final calibrated-display and physical-mobile comparison remains a manual visual sign-off item; it does not block beginning the Forest asset rebuild, but it should be completed before treating this baseline as the final five-act grade.

## MVP-02.2 entry gate

MVP-02.2 Forest Production Rebuild may start when:

1. strict TypeScript, the complete relevant regression set, and production build pass;
2. local runtime shows no new warning/error attributable to this change;
3. manual or reliable automated five-act QA confirms unchanged pacing and interaction;
4. grain is secondary at desktop and mobile viewports, with no obvious stepped jump;
5. Seed dark-edge readability improves without a global exposure lift;
6. Forest prototype limitations are visible and can be evaluated with grain both off and on;
7. the commit is pushed to `origin/main`; production deployment is claimed only after Vercel is independently confirmed Ready.
