# Phase 11.5: Hero Tree Final Sculpt Pass v0.1

Status: **RESEARCH ASSET CREATED / TARGET JUNCTION TOPOLOGY PASSED / CLOSE-RANGE AND COST GATE NOT PASSED**  
Date: 2026-08-22  
Scope: research-only modelling of `BeyondTree_v003`. Production tree, loading code, Seed, Room, Light, sound, LOD1/LOD2, and KTX2 are unchanged.

## 1. Outcome

Phase 11.5 produced `BeyondTree_v004` and a new LOD0 GLB. The two requested junctions are no longer transition shells: the authored trunk, primary branches, secondary branches, and junction volumes were combined using Blender's exact Boolean union and exported as one bark mesh. The source bark mesh has zero boundary/non-manifold edges, and GLB reimport also returns zero after welding the vertex splits that glTF correctly creates at UV and normal seams.

This pass does **not** enter Phase 11.6. The topology problem is solved, but the result costs 17,086 triangles versus 7,324 in v003, and the new close-pressure camera still exposes coarse branch cross-sections and a simplified bark response. Calling this a production-replacement candidate would therefore be premature.

## 2. Files created

- `docs/research/hero-tree-v0.4/BeyondTree_v004.blend`
- `docs/research/hero-tree-v0.4/BeyondTree_LOD0_v004.glb`
- `docs/research/hero-tree-v0.4/BeyondTree_asset_report_v004.json`
- `docs/research/hero-tree-v0.4/glb_reimport_validation_v004.json`
- source renders in `forest_camera_test/`, `tree_camera_test/`, and `tree_close_camera_test/`
- five GLB-reimport renders in `glb_reimport_camera_test/`
- reproducibility scripts in `docs/research/hero-tree-v0.4/scripts/`

The rejected full-skeleton voxel-remesh experiment was not retained as an asset. It produced disconnected fine-branch fragments and was overwritten before the final v004 save.

## 3. Task 1 — real junction fusion

The final method is sequential exact Boolean union on the existing bark volumes. It retains the authored branch paths while deleting internal overlap surfaces wherever volumes intersect. No transition shell remains as an independently exported object.

Target sites:

1. trunk to primary branch;
2. primary to secondary branch.

Validation:

- Boolean failures: 0;
- exported bark objects: 1 (`Bark_Fused_LOD0`);
- source boundary/non-manifold edges: 0;
- GLB-reimport boundary/non-manifold edges after seam weld: 0;
- source connected components: 3. This is expected because a small number of authored distal pieces do not physically intersect; the two target forks are in the fused component.

The distinction matters: v003 hid insertions with overlapping shoulder meshes; v004 contains shared surface topology at the target intersections.

## 4. Task 2 — silhouette and close structure

The pass avoids subdivision. It adds:

- restrained angle-limited micro-beveling to reduce mechanical radial facets;
- a small, deterministic pressure variation on the lower trunk;
- smooth shading plus weighted normals;
- a new UV unwrap required by the fused topology.

The new `tree_close_camera_test` uses a 62 mm lens and looks through the two target junction elevations from a closer position than the chapter cameras. It confirms that the trunk-to-primary shoulder now reads as a continuous mass, but also reveals that several branch cross-sections remain coarse and that the bark does not yet carry enough geometric/material agreement at stress-test distance.

## 5. Camera tests

Source `.blend` renders:

- `forest_camera_test/forest_human_eye.png`
- `forest_camera_test/forest_canopy_lift.png`
- `tree_camera_test/tree_entry_continuity.png`
- `tree_camera_test/tree_returned_silhouette.png`
- `tree_close_camera_test/tree_close_camera_test.png`

The same five views were rendered after GLB reimport under `glb_reimport_camera_test/`. Forest and Tree continue to use the same geometry, scale, and pivot. These are offline validation views, not production runtime screenshots.

## 6. Metrics

| Metric | v003 | v004 | Change |
|---|---:|---:|---:|
| Total triangles | 7,324 | 17,086 | +9,762 / +133.3% |
| Bark / woody geometry | 3,356 | 13,118 | +9,762 |
| Leaves | 3,968 | 3,968 | unchanged |
| Materials | 2 | 2 | unchanged |
| GLB size | 387,284 bytes | 684,488 bytes | +297,204 / +76.8% |
| Blend size | 280,436 bytes | 613,911 bytes | +333,475 / +118.9% |

Texture changes: none. The v003 bark base-color/normal/roughness 1K channels and the 2048×512 RGBA leaf palette remain. Only bark UVs changed because Boolean fusion created new topology.

## 7. v003 / v004 A/B judgement

### Improved in v004

- the two priority forks have real shared topology rather than overlapping transition shells;
- insertion seams and collar-like shells are removed;
- lower trunk silhouette has restrained asymmetry;
- five source and five GLB-reimport camera renders exist;
- GLB reimport preserves 17,086 triangles, two materials, leaf UVs, and geometric watertightness after seam welding.

### Regressed or unresolved

- triangle count is 2.33 times v003 and is not a defensible low-cost fusion result;
- the close camera still exposes coarse cross-sections on secondary branches;
- bark response remains visually simpler than the geometric stress view demands;
- leaf cluster repetition is unchanged by design;
- this pass does not prove Three.js runtime integration, which is explicitly out of scope.

## 8. Art-direction check

The crown density, leaf count, palette, overall height, branch count, and broad silhouette remain inherited from v003. No monumental buttress, deadwood, exaggerated twist, extra crown mass, or ornamental pruning was added. The tree remains an ordinary mature temperate deciduous tree in mid-early autumn rather than an ancient, sacred, heroic, or landscape specimen.

## 9. Phase 11.6 decision

**Do not enter Phase 11.6 Production Replacement Evaluation.**

The topology blocker is closed, but the pass fails the combined efficiency and close-range credibility gate. A further automatic whole-asset remesh is specifically rejected because it damaged disconnected fine branches. Any next attempt should be a manual/local retopology of only the two target neighborhoods plus selective reconstruction of camera-visible branch rings, with a hard target materially below the current 13,118 bark triangles. Until that exists, v004 remains a documented research result, not a production candidate.

No production tree, Three.js loader, Seed, Room, Light, sound, LOD1/LOD2, or KTX2 work was performed.
