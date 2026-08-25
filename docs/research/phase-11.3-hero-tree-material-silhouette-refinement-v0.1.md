# Phase 11.3: Hero Tree Material & Silhouette Refinement v0.1

Status: **RESEARCH ASSET CREATED / PRODUCTION REPLACEMENT GATE NOT PASSED**  
Date: 2026-08-22  
Scope: research-only refinement of the shared Forest/Tree tree. Production tree, procedural fallback, Seed, Room, Light, loading modules, sound, LOD1/LOD2, and KTX2 are unchanged.

## 1. Outcome

Phase 11.3 produced and reviewed a new independent research version from `hero-tree-v0.1/BeyondTree_v001.blend`. It is a genuine material and silhouette iteration, but it does **not** yet justify production replacement evaluation.

The pass improves the research baseline in three measurable ways:

- bark now has separate base-color, tangent-style normal, and roughness maps with deliberately longitudinal structure;
- foliage is one batched mesh built from compact crossed, six-vertex leaf silhouettes rather than rectangular cards;
- five primary junctions receive small shoulder volumes to reduce the most obvious insertion read.

The camera review also exposes remaining defects clearly: foliage is still too dense and visually repetitive in the lifted view, trunk/primary geometry remains visibly faceted at Tree distance, and the current generated bark is a controlled procedural study rather than a final believable oak surface.

## 2. Files created

Research source and export:

- `docs/research/hero-tree-v0.2/BeyondTree_v002.blend`
- `docs/research/hero-tree-v0.2/BeyondTree_LOD0_v002.glb`
- `docs/research/hero-tree-v0.2/BeyondTree_asset_report_v002.json`

Development textures:

- `textures/bark_basecolor_1k.png` — 1024 × 1024, PNG RGBA, 20,726 bytes
- `textures/bark_normal_1k.png` — 1024 × 1024, PNG RGBA, 20,726 bytes
- `textures/bark_roughness_1k.png` — 1024 × 1024, PNG RGBA, 20,726 bytes
- `textures/leaves_rgba_512.png` — 512 × 512, PNG RGBA, 5,807 bytes

Review renders:

- `hero-tree-test/forest_human_eye.png`
- `hero-tree-test/forest_canopy_lift.png`
- `hero-tree-test/tree_entry_continuity.png`
- `hero-tree-test/tree_returned_silhouette.png`

All paths above are under `docs/research/hero-tree-v0.2/`. Version v0.1 was not overwritten.

## 3. A — Bark material upgrade

`MAT_Bark` uses a two-material asset contract shared by trunk, main branches, secondary branches, and junction shoulders. The base color avoids baked directional light. The procedural source is dominated by vertical furrows with slower longitudinal drift, fine secondary variation, and restrained contrast. The normal response is deliberately softer than the color structure; roughness remains mostly between approximately 0.55 and 0.98 to avoid plastic highlights.

Texture mapping uses a 3 × 8 generated-coordinate repeat in the Blender research source, with the long repeat aligned to tree growth. The test does not use displacement. The three 1K development maps total 62,178 bytes on disk because the deterministic source is highly compressible; this is not a KTX2 or GPU-memory claim.

Review result: the new bark responds to grazing light and is materially better than v0.1's flat colors. It remains too uniform and the underlying trunk facets are still obvious in the Tree camera. The material is therefore suitable as a channel/UV-direction proof, not final bark art.

## 4. B — Foliage upgrade

The old `Leaves` mesh was replaced by one batched object containing 620 compact crossed clusters. Each card uses a pointed six-vertex outline and a 512² RGBA leaf map. This removes the explicit rectangle boundary and keeps draw-call intent WebGL-friendly: one foliage object and one foliage material, not hundreds of independent objects.

The Blender preview uses a dithered surface. The intended Three.js research setting is:

```text
alphaTest: 0.5
transparent: false
depthWrite: true
side: DoubleSide
```

Green remains the intended majority, with smaller yellow-green, ochre, and dark-gold groups. However, Blender 5.2's glTF exporter emitted a warning that the active vertex color was not exported from the current node graph. Consequently the GLB cannot yet be claimed to preserve the authored cluster color distribution. This is a concrete production blocker: the leaf node graph or export attribute contract must be corrected and the reimported GLB visually verified.

Review result: silhouette edges are more leaf-like than v0.1 rectangular research cards and penetrated light remains visible, but cluster repetition and density are too high in the lifted Forest view. A next pass should remove roughly 15–25% of clusters in the central crown, create several cluster shapes, and preserve larger negative spaces instead of adding geometry.

## 5. C — Branch junction and silhouette refinement

Five low-cost shoulder volumes were added at major primary junctions, totaling 600 triangles. Their purpose is only to soften the most visible insertion transitions. They do not add scars, hollows, large roots, or ornamental asymmetry.

The shoulders help at medium distance, but the review renders still show the original coarse trunk/branch topology, abrupt taper in places, and some disconnected-looking secondary tips. Full junction fusion was not attempted because it would require a controlled retopology pass rather than more overlapping primitives.

The overall asset bounds are approximately 6.895 × 5.111 × 9.084 m (Blender X/Y/Z). It remains inside the intended ordinary mature-tree scale and does not read as ancient, monumental, or landscape-sculptural.

## 6. Camera test contract

The Blender file contains the requested collection structure:

```text
hero-tree-test
├── forest_camera_test
│   ├── forest_human_eye
│   └── forest_canopy_lift
└── tree_camera_test
    ├── tree_entry_continuity
    └── tree_returned_silhouette
```

The positions were extracted from the current Forest and Tree source and converted from Three.js Y-up to Blender Z-up:

| Review | Three.js position | Look target | Lens |
|---|---:|---:|---:|
| Forest human-eye | `(0, 1.15, 7.3)` | `(0.1, 3.4, 0)` | 48 mm |
| Forest canopy lift | `(0, 3.30, 6.48)` | `(0.1, 4.20, 0)` | 50 mm |
| Tree entry continuity | `(0, 3.30, 6.48)` | `(0.08, 4.20, 0)` | 50 mm |
| Tree returned silhouette | `(0, 1.14, 7.3)` | `(0.08, 1.08, 0)` | 52 mm |

The Forest-end and Tree-entry images use the same asset, scale, pivot, and nearly identical pose, so shared identity is preserved. These are offline neutral test renders with source-derived camera and approximate key direction, not screenshots from an integrated production runtime. No production scene was changed.

## 7. Metrics and budget change

| Metric | v0.1 | v0.2 | Change |
|---|---:|---:|---:|
| Total triangles | 5,750 | 8,276 | +2,526 / +43.9% |
| Trunk | 304 | 304 | unchanged |
| Main branches | 576 | 576 | unchanged |
| Secondary branches | 1,836 | 1,836 | unchanged |
| Foliage | 3,034 | 4,960 | +1,926 |
| Junction shoulders | 0 | 600 | +600 |
| Materials | 7 | 2 | -5 |
| External development textures | 0 | 4 | +4 |
| GLB size | 222,432 bytes | 533,664 bytes | +311,232 / +139.9% |
| Blend size | 266,059 bytes | 308,990 bytes | +42,931 / +16.1% |

The triangle increase is still below the Phase 11 production LOD0 target, but that does not imply readiness: the geometry remains a lightweight research mesh and quality, export correctness, and integrated GPU cost are separate gates. The GLB remains below 1 MB, but it has not been mesh-compressed and this phase intentionally did not add KTX2.

## 8. A/B judgement

### What v0.2 improves over v0.1

- bark now has actual color, normal, and roughness channels and responds to directional light;
- foliage no longer presents explicit rectangular cards;
- material count falls from seven to two;
- primary branch insertion is softened at five important junctions;
- exact shared-asset camera evidence now exists for Forest end and Tree entry.

### What remains worse than or insufficient versus the target

- the central crown is denser and more repetitive than the 12–18% meaningful-void target;
- close Tree views expose faceted trunk geometry and incomplete junction fusion;
- generated bark lacks the irregular scale hierarchy of believable mature bark;
- the exported GLB did not preserve the intended vertex-color leaf palette according to the exporter warning;
- the alpha-test recommendation has not yet been verified inside the actual Three.js renderer.

## 9. Production replacement evaluation gate

**Decision: not reached. Keep the procedural tree as the production fallback and do not integrate this GLB.**

Before a production replacement evaluation, the shortest defensible follow-up is another research-only refinement that:

1. fixes leaf color export and proves it by reimporting the GLB;
2. thins and reshapes the central crown while preserving larger camera-visible voids;
3. retopologizes the trunk and the two most visible primary junctions instead of adding more collars;
4. verifies bark UV direction and alpha-test edges in a small Three.js research viewer using the actual Forest fog, lights, and tone mapping;
5. repeats the same four camera renders and rejects the pass if Forest-end / Tree-entry identity diverges.

No LOD1/LOD2, KTX2, formal loader, production replacement, Seed/Room/Light change, or sound work was performed.
