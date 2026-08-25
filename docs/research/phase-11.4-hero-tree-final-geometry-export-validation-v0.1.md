# Phase 11.4: Hero Tree Final Geometry & Export Validation v0.1

Status: **RESEARCH ASSET CREATED / COLOR PIPELINE PASSED / PRODUCTION REPLACEMENT EVALUATION GATE NOT PASSED**  
Date: 2026-08-22  
Scope: research-only refinement of `BeyondTree_v002`. Production tree and procedural fallback, Seed, Room, Light, loading modules, sound, LOD1/LOD2, and KTX2 are unchanged.

## 1. Outcome

Phase 11.4 created `BeyondTree_v003` as a new independent research version. It closes the leaf-color export blocker and performs the requested 20% central-crown reduction. Two prominent junctions receive redesigned low-cost transition geometry and read less like simple cylinder insertions in silhouette.

The pass is not promoted to Phase 11.5. The two junction improvements are still overlapping transition shells rather than a single manifold retopology, and the close Tree view continues to expose coarse trunk/branch geometry. This is documented as an unresolved geometry gate, not presented as completed topology fusion.

## 2. Files created

- `docs/research/hero-tree-v0.3/BeyondTree_v003.blend`
- `docs/research/hero-tree-v0.3/BeyondTree_LOD0_v003.glb`
- `docs/research/hero-tree-v0.3/BeyondTree_asset_report_v003.json`
- `docs/research/hero-tree-v0.3/glb_reimport_validation_v003.json`
- `docs/research/hero-tree-v0.3/threejs_color_pipeline_validation_v003.json`
- `docs/research/hero-tree-v0.3/textures/leaves_palette_rgba_2048x512.png`
- Blender renders under `docs/research/hero-tree-v0.3/hero-tree-test/`
- Reimported-GLB renders under `docs/research/hero-tree-v0.3/hero-tree-test/glb-import/`
- Reproducibility scripts under `docs/research/hero-tree-v0.3/scripts/`

The v0.2 source and all production files were retained unchanged.

## 3. Task 1 — GLB leaf-color pipeline

### Chosen data contract

v002 used a point-domain `BYTE_COLOR` attribute named `Color` and an older Blender vertex-color material node. Blender 5.2 warned that this color was not exported from the active node graph, so viewport appearance could not prove runtime correctness.

v003 removes that dependency. Leaf variation is baked into one RGBA palette atlas (`2048 × 512`) containing four restrained green/yellow-green/ochre/dark-green bands. Every leaf cluster is assigned to one band by UV remapping. The asset still has one foliage object and one foliage material.

```text
Blender RGBA palette atlas
→ per-cluster UV band
→ glTF baseColorTexture
→ GLB reimport
→ Three.js GLTFLoader / MeshStandardMaterial.map
```

No vertex-color attribute is required in v003.

### Verification evidence

Blender 5.2 GLB reimport:

- result: PASS;
- leaf triangles: 3,968, matching the source;
- UV range: U 0–1, V 0–1;
- image: `leaves_palette_rgba_2048x512`, 2048 × 512;
- color attribute after import: absent, as intended;
- four reimport camera renders were generated, not just inspected in the source viewport.

Three.js 0.179.1 (`REVISION 179`) using the project's actual `GLTFLoader`:

- result: PASS;
- material: `MeshStandardMaterial`;
- `map: true`, map size 2048 × 512;
- `uv: true`;
- `vertexColors: false`;
- geometry color attribute: absent;
- leaf triangles: 3,968;
- imported glTF material is double-sided and transparent.

The loader reports `alphaTest: 0` because Blender exported alpha blending. For any future research integration, Three.js should explicitly set `alphaTest = 0.5`, `transparent = false`, `depthWrite = true`, and `side = DoubleSide`. This runtime override was verified as a material contract only; production integration was intentionally not performed.

### A/B color judgement

v002: Blender-only palette appearance; exporter warning; GLB leaf palette not defensibly verified.  
v003: texture/UV-based palette survives Blender GLB reimport and the actual Three.js loader. **The color export blocker is closed.**

## 4. Task 2 — Crown reconstruction

The v002 foliage mesh contained 620 clusters. v003 removes 124 centrally weighted clusters: exactly 20.0%, inside the requested 15–25% range. The removal score prioritizes low radial distance and mid-crown depth, with deterministic modulation to avoid carving a regular spherical hole.

- v002 clusters: 620;
- v003 clusters: 496;
- removed: 124 / 20.0%;
- palette distribution: 125 / 124 / 126 / 121 clusters;
- foliage triangles: 4,960 → 3,968;
- outer silhouette clusters are preferentially retained;
- camera-visible internal gaps and light paths are larger;
- overall bounds and shared Forest/Tree camera identity remain unchanged.

The crown is more breathable than v002, but the repeated pointed crossed-cluster language is still visible at close range. No extra leaf geometry was added.

## 5. Task 3 — Two junctions

Only two high-visibility sites were changed:

1. trunk → primary branch (`Junction_01`);
2. primary → secondary branch (`Junction_03`).

Each old symmetric 120-triangle shoulder was replaced by a directionally aligned, six-ring organic transition with restrained three-lobe irregularity. Each new transition is 140 triangles. The combined cost is +40 triangles over v002. The longer axial transition and asymmetric cross-section reduce the abrupt collar/insertion read and improve the camera-facing silhouette.

Limitation: these remain overlapping transition meshes. They are not a unified manifold retopology of the trunk and branch surfaces. The requested visual improvement is present, but the stronger “true topology fusion” standard inherited from the Phase 11.3 review is not met.

## 6. Metrics

| Metric | v002 | v003 | Change |
|---|---:|---:|---:|
| Total triangles | 8,276 | 7,324 | -952 / -11.5% |
| Trunk | 304 | 304 | unchanged |
| Main branches | 576 | 576 | unchanged |
| Secondary branches | 1,836 | 1,836 | unchanged |
| Foliage | 4,960 | 3,968 | -992 |
| Five junction transitions | 600 | 640 | +40 |
| Materials | 2 | 2 | unchanged |
| Referenced texture channels | 4 | 4 | unchanged count |
| GLB size | 533,664 bytes | 387,284 bytes | -146,380 / -27.4% |
| Blend size | 308,990 bytes | 280,436 bytes | -28,554 / -9.2% |

v003 textures used by the asset contract:

- bark base color: 1024²;
- bark normal: 1024²;
- bark roughness: 1024²;
- leaf RGBA palette atlas: 2048 × 512.

## 7. Camera A/B review

The same four source-derived cameras were retained:

- `forest_human_eye`;
- `forest_canopy_lift`;
- `tree_entry_continuity`;
- `tree_returned_silhouette`.

Forest lift and Tree entry remain the same asset, scale, pivot, and adjacent pose. v003 preserves the outer identity while opening the center. The Blender and reimported-GLB leaf palette distribution is visibly consistent. The reimported bark is darker because Blender's richer source material graph is simplified to glTF PBR on import; this does not invalidate the leaf-color result but remains relevant to any later full-material production evaluation.

## 8. v002 vs v003

### Improvements

- exported leaf color is now a verified texture/UV contract rather than an unverified vertex-color path;
- the actual project Three.js loader reads the expected leaf map and UVs;
- central foliage is reduced exactly 20%, improving internal air and light paths;
- total triangles and GLB size both decrease;
- two target junctions gain longer, direction-aware transitions for better silhouette;
- no production or unrelated chapter code changed.

### Remaining limitations

- the two junctions are not single-manifold fused topology;
- trunk and main branches still expose low radial segmentation in close Tree views;
- leaf-cluster repetition remains noticeable despite the density improvement;
- glTF alpha imports as blend; an eventual research runtime must apply the documented alpha-test settings;
- full bark appearance is not identical after glTF reimport.

## 9. Phase 11.5 gate

**Decision: not reached. Do not replace or integrate the production tree.**

The highest-priority export blocker is resolved and the crown target is met. However, a Phase 11.5 production replacement evaluation would still be premature until the two target junctions are genuinely fused/retopologized and the close Tree view no longer exposes the insertion/faceted structure. The shortest next pass should be a localized manifold retopology of only those two connections, followed by the same source/GLB/Three.js and four-camera checks.

No LOD1/LOD2, KTX2, production loader, production replacement, Seed/Room/Light change, or sound work was performed.
