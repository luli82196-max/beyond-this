# Phase 11.5.1: Hero Tree Branch System Rebuild v0.1

Status: **RESEARCH ASSET CREATED / TECHNICAL GATES PASSED / ART GATE NOT PASSED**  
Date: 2026-08-22  
Scope: research-only reconstruction of the Trunk + Branch system. Production tree, Three.js code, Seed, Room, Light, sound, LOD, and KTX2 are unchanged.

## 1. Outcome

Phase 11.5.1 produced `BeyondTree_v005` by replacing the v003/v004 woody system with a sparse growth-path scaffold: one curved/tapered trunk, ten unequal primary paths, and eighteen secondary paths. The scaffold is converted once into a connected surface skin. It does not use the v004 strategy of stacking exact Boolean repairs on many authored cylinders.

The final candidate is one connected bark component with zero boundary/non-manifold edges. It retains the v003 leaf mesh, leaf palette, bark material channels, two-material contract, cameras, pivot, GLB export path, and GLB-reimport validation path. Total geometry is 19,922 triangles, inside the requested 15k-25k range.

This pass does **not** enter Phase 11.6. The technical result is coherent and budgeted, but the camera review does not establish a reliable visual win over v004. The connected voxel skin removes the obvious round-cylinder cross-sections and gives the trunk a continuous taper, but it introduces small faceted/serrated surface features on several branch silhouettes. The close view is also partly occluded by the retained leaf cards and does not prove that all secondary branches now hold up at stress distance. Calling v005 a production-replacement candidate would therefore overstate the result.

## 2. Files created

- `docs/research/hero-tree-v0.5/BeyondTree_v005.blend`
- `docs/research/hero-tree-v0.5/BeyondTree_LOD0_v005.glb`
- `docs/research/hero-tree-v0.5/BeyondTree_asset_report_v005.json`
- `docs/research/hero-tree-v0.5/glb_reimport_validation_v005.json`
- source renders in `forest_camera_test/`, `tree_camera_test/`, and `tree_close_camera_test/`
- five GLB-reimport renders in `glb_reimport_camera_test/`
- reproducibility scripts in `docs/research/hero-tree-v0.5/scripts/`

## 3. Rebuild method

### Trunk

- 25 growth samples over an 8.85 m authored height;
- nonlinear taper with restrained radius pressure variation;
- low-amplitude X/Y drift rather than a straight vertical cylinder;
- 3- and 5-lobed cross-section variation before surface conversion;
- no buttress, deadwood, monumental twist, or ancient-tree exaggeration.

### Primary system

- ten primary paths at unequal heights and azimuths;
- varied reach, lift, base radius, and load angle;
- branch starts embedded in the trunk volume before the one-time surface skin;
- no repeated Boolean collar or junction shell.

### Secondary system

- eighteen secondary paths rather than a dense uniform branch field;
- one or two unequal supports per primary;
- alternating direction offsets, varied length/lift, and nonlinear taper;
- crown openings and the inherited v003 leaf mass remain visible.

### Surface conversion

The sparse scaffold receives one controlled voxel skin at 0.055 m with 0.68 adaptivity. Intermediate tests were rejected: a 0.068 m skin met the triangle budget but split into eight components; a 0.060 m skin left two components. The retained setting produces one component and 0 non-manifold/boundary edges at 15,954 bark triangles.

## 4. Metrics

| Metric | v003 | v004 | v005 | v005 vs v004 |
|---|---:|---:|---:|---:|
| Total triangles | 7,324 | 17,086 | 19,922 | +2,836 / +16.6% |
| Bark / woody geometry | 3,356 | 13,118 | 15,954 | +2,836 / +21.6% |
| Leaves | 3,968 | 3,968 | 3,968 | unchanged |
| Bark connected components | multiple authored objects | 3 | 1 | improved |
| Bark boundary/non-manifold edges | not a fused mesh | 0 | 0 | maintained |
| Materials | 2 | 2 | 2 | unchanged |
| GLB size | 387,284 B | 684,488 B | 857,256 B | +172,768 B / +25.2% |
| Blend size | 280,436 B | 613,911 B | 671,573 B | +57,662 B / +9.4% |

Texture content is unchanged. v005 reuses the v003/v004 1K bark base-color/normal/roughness channels and the 2048x512 RGBA leaf palette. The new bark surface receives a new UV chart.

## 5. Validation

GLB reimport result: **PASS**.

- imported bark: 15,954 tris;
- imported leaves: 3,968 tris;
- imported total: 19,922 tris;
- materials: two (`MAT_Bark`, `MAT_Leaves`; Blender adds `.001` on reimport);
- leaf UV present: yes;
- bark boundary/non-manifold edges after glTF seam weld: 0.

Source and GLB-reimport versions were rendered from:

- `forest_human_eye`;
- `forest_canopy_lift`;
- `tree_entry_continuity`;
- `tree_returned_silhouette`;
- `tree_close_camera_test`.

Forest and Tree use the same geometry, scale, pivot, and retained leaf asset by construction. These are offline validation views, not production runtime screenshots.

## 6. v003 / v004 / v005 judgement

### Improved in v005

- one continuous growth-derived woody surface replaces the cylinder-plus-repair-shell organization;
- trunk curvature, taper, and cross-section variation are authored as part of the growth path;
- primary branches differ in height, direction, reach, lift, and load angle;
- secondary count is deliberately limited and nonuniform;
- the whole tree stays inside the requested 15k-25k total triangle range;
- source and reimported GLB both pass the manifold/material/UV checks.

### Regressed or unresolved

- v005 costs 2,836 more triangles and 172,768 more GLB bytes than v004;
- adaptive voxel skinning creates localized serrated/faceted highlights on branch silhouettes;
- the inherited bark normal/lighting response does not consistently flatter the new irregular surface;
- the close camera is partially blocked by leaf cards and is not a decisive proof of all secondary branches;
- leaf placement is intentionally inherited, so some sparse new supports do not align as convincingly with every existing cluster as a jointly regenerated crown would;
- no Three.js runtime integration was performed, by scope.

## 7. Art-direction check

The result remains an ordinary mature temperate deciduous tree. It does not add monumental scale, ancient-tree buttressing, ornamental pruning, mystical asymmetry, deadwood, or additional crown mass. The broad leaf palette and density remain those of v003/v004.

## 8. Phase 11.6 decision

**Do not enter Phase 11.6 Production Replacement Evaluation.**

Phase 11.5.1 proves that a sparse growth-path system can meet topology and web triangle targets without repeated Boolean junction repair. It does not yet prove the more important artistic gate: clearly better natural growth at Forest, Tree, and Close distances. The current method trades v004's coarse cylindrical sections for localized voxel faceting and a larger GLB. A credible next attempt would need either controlled quad skinning/retopology around the same growth graph or a jointly regenerated branch-and-leaf support layout, plus a less occluded close camera. Both are new work rather than a safe automatic refinement of v005.

No production tree, Three.js loader, Seed, Room, Light, sound, LOD, or KTX2 work was performed.
