# Phase 11.1: Production Tree LOD0 Prototype v0.1

Status: **BLOCKED AT ASSET AUTHORING / NO FALSE COMPLETION**  
Date: 2026-08-22  
Scope: research-only LOD0 candidate and Forest/Tree offline review. No production replacement was made.

## 1. Executive result

Phase 11.1 does **not** pass the LOD0 aesthetic or technical gate in this environment because no defensible production-quality GLB or camera review renders could be created. The repository contains Three.js/R3F runtime code but no Blender (or equivalent controlled modeller), no editable tree source, no bark/leaf source textures, no baking pipeline, and no reliable offline renderer. Re-exporting the current cylinder-and-ellipsoid procedural tree would preserve the exact shortcomings Phase 11 is meant to replace and would falsely label a prototype as a refined asset.

The production procedural tree remains untouched and is still the fallback. Seed, Room, Light, sound, `public`, build configuration, and production scene code were not changed.

## 2. Evidence reviewed

- `docs/research/phase-11-forest-tree-production-asset-v0.1.md`
- `src/experience/forest/ForestScene.tsx` and `forest.types.ts`
- `src/experience/tree/TreeScene.tsx` and `tree.types.ts`
- `package.json`

The requested Phase 7.1 and Phase 9.1 reports are not present in the repository. This matches the Phase 11 record, which states that their retained conclusions were cross-checked against current source. No missing document was invented.

## 3. Actual camera review contract extracted from source

### Forest

The current Forest camera begins near `(0, -0.12, 4.8)` and, after reveal/lift damping, approaches approximately `(0, 3.30, 6.48)`. Its look target moves from roughly `(0.1, -0.62, 0)` to `(0.1, 4.20, 0)`. The current procedural tree root group is at `(0.18, -1.4, 0)`.

Required candidate stills:

1. `forest-human-eye-full-tree`: early stable full-tree view.
2. `forest-canopy-upward`: late lifted view aimed near crown height.
3. `forest-transmitted-light`: same late view with the current key direction `(-3.5, 7, 4)` and Forest fog `(5.2, 15.5)`.

### Tree

Tree starts near `(0, 3.3, 6.48)`, looking at approximately `(0.08, 4.2, 0)`, which intentionally matches the end of Forest. As `forestPresence` leaves, the camera approaches approximately `(0, 1.14, 7.3)`. The current upright-tree root is `(-0.25, -1.4, 0)`, confirming that current continuity is only approximate.

Required candidate stills:

1. `tree-entry-continuity`: exact Tree entry pose, compared side by side with Forest end.
2. `tree-returned-silhouette`: lower camera after forest presence begins to recede.
3. `tree-before-time-veil`: last clearly readable upright-tree frame before the occlusion/transformation interval.

The candidate must use one GLB, one scale, one base-centred pivot, one material set, and one version for all six views. Chapter lighting/fog may differ; topology and leaf distribution may not.

## 4. Refined LOD0 authoring target

The user-requested “more refined” treatment should be spent on believable structure and silhouette, not spectacle:

- 10.8 m nominal height, 7.2 m crown width, 0.52 m DBH, crown base near 2.4 m.
- Five to seven non-radial primary branches; each carries three to six secondaries, with tertiary twigs only where gaps expose them.
- Continuous taper, mild accumulated trunk lean, asymmetric fork placement, gravity-aware branch arcs, and junctions that do not read as intersecting cylinders.
- 12–18% meaningful crown void in the principal Forest view.
- Green-dominant middle-early-autumn foliage with restrained muted yellow-brown, ochre, and dark-gold groups; no orange-red overall read.
- Small alpha-tested volumetric clusters, not large billboards or high-cost blended transparency.

Working geometry target remains 40k–64k triangles. A controlled exception up to 70k is acceptable only if comparison renders show a visible improvement to near/mid-distance branch roundness or exposed fork continuity. It must not be used to increase leaf density. Above 70k should return to topology revision; 80k remains a hard rejection.

## 5. Required candidate structure

Research candidate path:

`docs/research/candidates/tree/v001/`

Expected deliverables:

```text
BT_Tree_MatureDeciduous_v001_lod0.blend (or equivalent editable source)
BT_Tree_MatureDeciduous_v001_lod0.glb
manifest.json
textures/source/bark_basecolor.*
textures/source/bark_normal.*
textures/source/bark_roughness.*
textures/source/leaves_basecolor_alpha.*
reviews/forest-human-eye-full-tree.png
reviews/forest-canopy-upward.png
reviews/forest-transmitted-light.png
reviews/tree-entry-continuity.png
reviews/tree-returned-silhouette.png
reviews/tree-before-time-veil.png
reviews/forest-tree-entry-comparison.png
```

GLB nodes must at minimum be `TRUNK_LOD0`, `BRANCHES_LOD0`, and `FOLIAGE_LOD0`. Preferred materials are `MAT_Bark` and `MAT_Leaves`. The base pivot is at the trunk/root ground contact, metres, Y-up, transforms applied, with no negative scale.

Wind preparation must be authored and audited as vertex/instance data: `windWeight`, stable `windPhase`, and a branch grouping identifier or equivalent derivable hierarchy. Trunk base weights must be zero; leaf/twig tips carry the highest weights. No per-leaf CPU animation is accepted as the production design.

## 6. Metrics that cannot truthfully be reported yet

No GLB exists, so the following values are intentionally recorded as **not measured**, not estimated facts:

| Metric | Result |
|---|---|
| GLB full path | Not created |
| Encoded GLB bytes | Not measured |
| Triangles / vertices | Not measured |
| Nodes / primitives | Not measured |
| Materials / draw calls | Not measured |
| Texture dimensions | Not created |
| GPU buffer memory | Not measured |
| GPU texture memory | Not measured |
| Forest review renders | Not created |
| Tree review renders | Not created |

Once a candidate exists, GPU buffer memory must be calculated from actual index width and every exported vertex attribute, including wind data. Texture GPU memory must be reported for the intended KTX2 target with mip overhead, not inferred from PNG/JPEG file size.

## 7. Production-quality versus placeholder

Production-quality completed in this pass: the shared-asset identity rule, exact source-derived camera review poses, art constraints, geometry exception rule, node/material/pivot contract, wind-data contract, and measurable acceptance checklist.

Still placeholder or absent: all geometry, bark and leaf textures, alpha atlas/mip inspection, material response, wind attribute values, GLB packaging, offline renders, triangle/byte/GPU measurements, and device performance evidence.

No part of the existing procedural tree is reclassified as production-quality.

## 8. Loading/readiness assessment

The candidate remains conceptually compatible with Phase 9.1 only if the first selected LOD stays within the Phase 11 request/GPU budgets and is fetched during adjacent-chapter idle preheat. Code readiness and asset readiness must remain separate; Seed must not import the GLTF loader, decoder, tree bytes, or textures. Forest must wait behind the existing readiness cover until decode, material compilation, and one rendered frame complete. Tree must reuse the same cached resource, while failure resolves readiness through the procedural fallback.

Compatibility cannot be marked proven until a real GLB is measured. No loading code should be added before that.

## 9. Gate decision

**Aesthetic gate: NOT PASSED — no candidate imagery exists.**  
**Technical gate: NOT PASSED — no GLB or measurements exist.**

Therefore it is not yet justified to produce LOD1, LOD2, KTX2 delivery textures, or the shared runtime loading module. Those steps would freeze decisions that have not been visually validated.

## 10. Shortest next step

Use Blender or an equivalent controlled modelling environment to author only LOD0 plus editable source and temporary controlled 1K–2K textures. Export the research GLB and render the seven review images above from the extracted camera poses. Then run a single gate review focused on:

1. ordinary mature-tree character rather than hero-tree staging;
2. crown voids and layered depth;
3. fork/junction/taper credibility at Forest human-eye and lifted views;
4. cluster repetition, alpha edges, and transmitted-light behavior;
5. unmistakable identity across Forest-end and Tree-entry images;
6. actual GLB, triangle, draw-call, texture, and GPU budgets.

If that gate passes, Phase 11.2 may create LOD1/LOD2 and compare them against LOD0 before KTX2 and runtime integration. If it fails, the minimum revision should target only the failing silhouette, branch junctions, or repeated foliage clusters—not add global density or ornamental character.
