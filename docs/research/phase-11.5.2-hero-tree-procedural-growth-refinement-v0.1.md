# Phase 11.5.2: Hero Tree Procedural Growth Refinement v0.1

Status: **RESEARCH ASSET CREATED / TECHNICAL EXPORT GATES PASSED / ART GATE NOT PASSED / ITERATION STOPPED**  
Date: 2026-08-23  
Scope: research-only procedural growth refinement. Production tree, Three.js, Seed, Room, Light, sound, LOD, and KTX2 are unchanged.

## 1. Outcome

Phase 11.5.2 produced `BeyondTree_v006` by replacing the v005 voxel skin with direct sampled-Bezier sweeps. Each growth segment uses shared cross-section rings, parallel-transported frames, restrained three-lobe radius pressure, nonlinear taper, and explicit closed caps. No voxel remesh, decimation, or post-hoc Boolean repair is used.

The inherited v005 leaf object was removed. v006 regenerates 936 leaf cards from the 18 secondary endpoints and 10 primary endpoints. Terminal clusters are anisotropic, biased outward/upward, and leave the crown interior open. The existing initial-autumn palette and two-material contract are retained.

This method removes the localized voxel serration seen in v005 and is substantially cheaper. It does not solve the decisive art problem: the 29 independently closed growth segments overlap rather than share a fused junction surface. Several primary-to-trunk and secondary-to-primary contacts expose inserted-branch seams or end-cap-like transitions in Forest, Tree, and Close views. The result is smoother but still reads as assembled tubes at stress distance.

**Do not enter Phase 11.6. Stop this asset iteration here.** The curve/sweep experiment is informative, but it is not a clear visual replacement for v005 and does not justify another version-number iteration without a genuinely new junction-skinning method.

## 2. Files created

- `docs/research/hero-tree-v0.6/BeyondTree_v006.blend`
- `docs/research/hero-tree-v0.6/BeyondTree_LOD0_v006.glb`
- `docs/research/hero-tree-v0.6/BeyondTree_asset_report_v006.json`
- `docs/research/hero-tree-v0.6/glb_reimport_validation_v006.json`
- source renders under `forest_camera_test/`, `tree_camera_test/`, and `tree_close_camera_test/`
- five GLB-reimport renders under `glb_reimport_camera_test/`
- reproducibility scripts under `docs/research/hero-tree-v0.6/scripts/`

## 3. Mesh generation changes

### Woody system

- 1 trunk, 10 unequal primary paths, and 18 secondary paths;
- sampled cubic Bezier centerlines instead of voxel surface conversion;
- parallel-transported section frames reduce abrupt ring rotation;
- nonlinear radius taper and restrained three-lobe pressure variation;
- 16/14/12-sided authored section budgets for trunk/primary/secondary intent;
- explicit shared rings and closed caps per path;
- no voxel skin, adaptivity, decimation, or Boolean repair.

The final bark object contains 29 individually closed, spatially overlapping components. This is technically closed (0 boundary/non-manifold edges) but not a single fused biological skin. That distinction is central to the rejection decision.

### Leaf/support system

- inherited v005 leaves were removed;
- 936 new leaf cards are attached around supported primary and secondary endpoints;
- clusters are ellipsoidal rather than spherical;
- placement is biased outward and upward;
- the crown interior is intentionally sparse to preserve air and branch readability;
- the initial-autumn leaf material/palette is retained, with a valid UV map.

### Close view

`tree_close_camera_test` was moved farther from the trunk and aimed at the main trunk/primary-branch zone. It is less leaf-occluded than v005, and therefore reveals the remaining junction weakness more reliably.

## 4. Metrics

| Metric | v005 | v006 | Change |
|---|---:|---:|---:|
| Total triangles | 19,922 | 7,164 | -12,758 / -64.0% |
| Bark triangles | 15,954 | 5,292 | -10,662 / -66.8% |
| Leaf triangles | 3,968 | 1,872 | -2,096 / -52.8% |
| Leaf cards | inherited | 936 | regenerated |
| Bark components | 1 voxel-fused skin | 29 closed overlapping paths | regression in junction continuity |
| Bark boundary/non-manifold edges | 0 | 0 | maintained |
| Materials | 2 | 2 | unchanged |
| GLB size | 857,256 B | 387,004 B | -470,252 B / -54.9% |
| Blend size | 671,573 B | 277,623 B | -393,950 B / -58.7% |

The preferred 20k-30k range was not used as a quota. v006 is below it because adding rings or leaf cards would not repair the visible junction logic; more triangles would increase cost without resolving the rejection reason.

## 5. Validation

GLB reimport result: **PASS**.

- imported bark: 5,292 tris;
- imported leaves: 1,872 tris;
- imported total: 7,164 tris;
- two materials (`MAT_Bark`, `MAT_Leaves`; `.001` suffix after reimport);
- leaf UV present: yes;
- bark boundary/non-manifold edges after glTF seam weld: 0.

Source and reimported GLB were rendered from:

- `forest_human_eye`;
- `forest_canopy_lift`;
- `tree_entry_continuity`;
- `tree_returned_silhouette`;
- revised `tree_close_camera_test`.

These are offline validation views, not production runtime screenshots.

## 6. v005 versus v006

### Demonstrated gains

- voxel-created serration and small faceted silhouette noise are removed;
- trunk and long branch centerlines have more continuous curvature;
- taper is predictable and economical;
- leaves now originate from explicit branch support zones;
- internal crown air space and branch visibility improve;
- total triangles and GLB bytes drop substantially;
- source and GLB reimport pass topology/material/UV checks.

### Regressions and unresolved issues

- independently swept segments do not form a continuous load-bearing junction skin;
- inserted-branch seams and cap-like contacts remain visible;
- several branch transitions still read as low-cost tubes despite smoother curves;
- the regenerated crown is support-aware but visually sparser and less color-rich than v005;
- the close view proves the weakness rather than validating production quality;
- raising the triangle count would not fix the connection model.

## 7. Phase 11.6 decision

**Do not enter Phase 11.6 Production Replacement Evaluation.**

v006 answers the research question: curve-driven sweeps are clearly better than voxel remeshing for continuous silhouette curvature and asset cost, but curve paths alone are not sufficient. A production candidate would require a different junction solution—such as controlled branch-union quad skinning or authored retopology around the same growth graph—followed by jointly art-directed crown generation. That is a new modeling program, not a safe refinement of v006.

Per the phase constraint, work stops here rather than creating v007 for incremental smoothing or density changes.

No production tree, Three.js loader, Seed, Room, Light, sound, LOD, or KTX2 work was performed.
