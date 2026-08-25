# Phase 11: Forest / Tree Production Tree Asset v0.1

Status: **SPEC COMPLETE / PRODUCTION REPLACEMENT NOT STARTED**  
Date: 2026-08-22  
Scope: Forest hero tree and Tree chapter upright-tree continuity only. Seed, Room, Light, sound, resting timber, transport, camera timing, and narrative timing are unchanged.

## 1. Executive decision

**Selected route: hybrid pipeline — self-authored controlled GLB as the target, existing procedural tree retained as fallback.**

The current procedural tree is worth formally replacing, but not in this pass. It is light and narratively correct, yet its cylinder branches, low-poly ellipsoid leaf clusters, sparse branch topology, and duplicated Forest/Tree implementations remain the most visible source of prototype character. A licensed external asset is not selected: no candidate was inspected closely enough to establish authorship, modification rights, visual fit, topology, wind suitability, and web cost. No unknown free model was downloaded and no asset ledger was created.

The correct next asset is a deliberately modest, self-authored temperate deciduous tree exported as GLB. Procedural generation may be used as an authoring method, but the delivered geometry, materials, naming, bounds, license record, and LODs must be deterministic and reviewed offline before production integration.

## 2. Evidence from the current implementation

Reviewed:

- `src/experience/forest/ForestScene.tsx` and `forest.types.ts`
- `src/experience/tree/TreeScene.tsx` and `tree.types.ts`
- `src/experience/SceneHost.tsx`, `chapterLoaders.ts`, `docs/architecture.md`, and package/build configuration
- retained Phase 8.2, 8.3, 9, and 9.1 results from the referenced project conversation

The Phase 7.1, 8.2, 8.3, 9, and 9.1 reports are not present in this repository. Their retained conclusions were cross-checked against current source instead of being treated as files that exist locally.

Current continuity is approximate, not asset-identical:

- Forest and Tree independently build a trunk and branch set using matching dimensions and bark seed.
- Both use leaf seed `814` and the same general palette.
- Forest uses 220/120 leaves; Tree uses 164/92.
- Tree omits one upper branch, changes root group position, leaf positions, opacity behavior, and wind amplitude.
- Both create separate geometries, materials, textures, and per-frame instance matrices.

This is visually related duplication, not one source asset. A formal asset must have one immutable geometry/material identity used by both chapters; chapter-specific differences should be presentation state only (opacity, camera, lighting, wind intensity), never rebuilt topology.

## 3. Art specification

### Tree identity

- Generic temperate deciduous tree; do not identify a country, landmark, or exact protected cultivar.
- Mature but ordinary: approximately 30–50 years in visual character, not ancient, damaged, monumental, pollarded, or ornamental.
- Mid-early autumn in mild, slightly dry weather.
- Crown reads as naturally irregular at human distance, with modest asymmetry and gaps that reveal branch structure.
- Green remains the base impression. Muted yellow-brown, ochre, and dark gold appear as local variation; orange-red must not dominate.
- Bark is legible at the Forest opening distance but never becomes a texture showcase.

### Real-world proportion envelope

Author in metres, Y-up, +Z front, origin at the centre of the trunk base:

| Measure | Target | Acceptable range |
|---|---:|---:|
| Total height | 10.8 m | 9.5–12.0 m |
| Crown maximum diameter | 7.2 m | 6.2–8.0 m |
| Crown depth | 5.4 m | 4.7–6.2 m |
| Trunk DBH (1.3 m height) | 0.52 m | 0.42–0.62 m |
| Clear trunk before strong fork | 2.6 m | 2.2–3.2 m |
| Crown base | 2.4 m | 2.0–3.0 m |
| Crown centre | 6.4 m | 5.8–7.0 m |

The website may apply one scene scale transform, but Forest and Tree must import the same asset scale and pivot. Do not independently “eyeball” chapter scale.

### Branch topology

- One trunk with subtle taper and 2–4 degrees of accumulated lean, never a dramatic S-curve.
- Five to seven primary branches, with no radial starburst and no mirror pairs.
- Each primary supports three to six secondary branches; selected visible secondaries receive tertiary tips.
- First strong fork is off-axis. One side of the upper crown may be 8–14% fuller than the other.
- Branch radius must taper continuously; junctions must avoid obvious cylinder intersections at the hero viewing distances.
- Preserve 12–18% meaningful crown void area in the principal Forest view so the crown can breathe.
- Broken limbs, hollows, exaggerated roots, sculptural deadwood, and story-like scars are excluded.

## 4. Geometry and foliage specification

### Recommended construction

Use a mixed representation:

- Trunk and primary/secondary branches: authored mesh geometry.
- Fine twigs: simplified geometry only where silhouette or crown gaps expose them.
- Foliage: instanced small leaf clusters or compact alpha-tested cluster cards, not thousands of individually drawn meshes.
- Avoid large billboard planes; they turn visibly as the camera lifts and expose flat crown layers.

Alpha cards versus geometry:

- Fully geometric individual leaves are wasteful at this camera distance.
- A few large alpha cards produce sorting halos and an asset-library look.
- Preferred compromise: 450–750 small cluster instances at desktop LOD0, each containing 3–7 leaves in crossed or shallow volumetric arrangement. LOD1 uses 220–380 clusters; LOD2 uses 80–150 coarser clusters.
- Use `alphaTest`, not blended transparency, for production foliage. This avoids depth sorting and permits depth writing/shadows.

Triangle targets are based on the actual framing rather than scan-level detail:

| LOD | Trunk/branches | Foliage | Total target | Use |
|---|---:|---:|---:|---|
| LOD0 | 22k–34k | 18k–30k | 40k–64k | Desktop Forest and close Tree entry |
| LOD1 | 12k–20k | 9k–17k | 21k–37k | Typical mobile / mid-distance |
| LOD2 | 4k–8k | 3k–7k | 7k–15k | Low-end, reduced-motion, distant fallback |

Hard rejection thresholds: LOD0 above 80k triangles, more than 900 foliage instances, more than three production materials, or more than six draw calls for the tree before shadow passes.

## 5. Materials and textures

### Bark

Required channels:

- Base color: required, authored without baked dramatic lighting.
- Normal: required; it supplies bark legibility more efficiently than dense geometry.
- Roughness: required, but may be packed.
- AO: useful but not a separate texture; pack into ORM/RMA if retained after A/B review.
- Metallic: constant zero; do not allocate meaningful texture data to it.
- Displacement/height: not used at runtime.

Budget: one 2048² bark base-color texture and one 2048² normal, plus one 1024² or 2048² packed roughness/AO texture. A 1024² set is preferred on mobile if the 2K-to-1K difference is not visible in the Forest camera path.

### Leaves

- One material, double-sided for LOD0/1; test single-sided LOD2 only if silhouette survives.
- Alpha-tested (`alphaTest` approximately 0.45–0.6 after mip inspection), depth-write enabled, no transparent blending.
- Base color/alpha atlas required; normal optional and should be kept only if it visibly improves grazing light.
- Roughness may be constant or packed into the atlas; AO is unnecessary for individual leaf cards.
- Vertex color or instance color supplies restrained variation: about 55–65% muted green, 20–28% yellow-brown/dark gold, 10–18% ochre, and at most 5% slightly warmer accents. These are distribution ranges, not hard bands.
- Hue/value changes must occur by cluster, with small within-cluster variance; avoid one random color per leaf confetti.

Budget: one 1024² RGBA atlas. Use 2048² only after a filmed A/B comparison proves a benefit at the actual maximum canopy scale.

### Compression

- KTX2/Basis textures are the intended production format, with a PNG/JPEG development source retained outside `public`.
- Meshopt is preferred over Draco if it produces comparable size and simpler decode/startup behavior in this app; the choice must be measured, not assumed.
- Do not add loaders or decoders until a real prototype is available to measure.

## 6. Wind design

The existing restrained two-layer behavior remains the art target:

1. Slow whole-tree response: trunk nearly static, primary/secondary branch tips moving subtly and asynchronously.
2. Local leaf response: lower-amplitude flutter with per-cluster phase variation.

Recommended implementation: shader deformation driven by authored vertex attributes, not a full skeleton and not CPU updates of hundreds of instance matrices.

- `windWeight`: 0 at trunk base, increasing along branch hierarchy and toward leaf tips.
- `windPhase`: stable per branch/cluster.
- `branchId` or a compact phase band to prevent the whole crown moving as one mass.
- Whole-tree frequency approximately 0.12–0.25 Hz; leaf flutter approximately 0.7–1.4 Hz.
- Maximum visible crown displacement in normal mode should remain near 1–2% of crown diameter.

A skeleton is rejected for v0.1: it raises export, skinning, and LOD complexity without a narrative benefit. CPU instance-matrix animation is acceptable only as fallback/prototype behavior. Production should update shared shader uniforms per frame, not every leaf transform.

Reduced-motion is not “wind at half speed.” It uses a stable pose with either no motion or a barely perceptible uniform drift; local flutter is disabled.

## 7. LOD and device policy

LOD selection is capability-based at chapter mount, not constantly switched during the short camera move:

- Desktop, normal motion: LOD0 unless measured GPU time exceeds budget.
- Typical mobile or low concurrency: LOD1, 1024 bark maps, reduced shadow map/casting foliage.
- Reduced-motion: LOD1 geometry with static pose; low-end reduced-motion uses LOD2.
- Emergency fallback: current procedural tree, selected on asset/decode failure or explicit low-memory policy.

Avoid visible distance popping during Forest camera lift. If LOD must change, do it behind the existing chapter boundary/readiness cover or with a short material-neutral crossfade proven not to create double GPU peaks.

## 8. GLB contract

One tree asset family, one versioned manifest, shared by Forest and Tree:

```text
BT_Tree_MatureDeciduous_v001
├─ TRUNK_LOD0
├─ BRANCHES_LOD0
├─ FOLIAGE_LOD0
├─ TRUNK_LOD1
├─ BRANCHES_LOD1
├─ FOLIAGE_LOD1
├─ TRUNK_LOD2
├─ BRANCHES_LOD2
├─ FOLIAGE_LOD2
└─ SOCKETS
   ├─ crown_focus
   ├─ trunk_dbh
   └─ future_timber_alignment
```

Contract:

- GLB 2.0, metres, Y-up, base-centred pivot, transforms applied, no negative scale.
- Stable node names; no exporter-generated duplicates such as `.001`.
- Two materials preferred (`MAT_Bark`, `MAT_Leaves`); three maximum only if twig material separation demonstrates a real benefit.
- One primitive per material per LOD where practical.
- Bounding box, triangle count, vertex count, material count, texture dimensions, encoded byte size, and license provenance recorded in a sidecar manifest.
- `future_timber_alignment` is metadata only. The existing horizontal log remains unchanged in Phase 11; future work can test whether a branch-free trunk segment or a separate derived timber asset provides a believable correspondence without literalizing manufacture.

Do not store all three uncompressed LOD texture duplicates in the GLB. Shared external KTX2 textures are preferable if cache reuse and lifecycle are verified; otherwise use one compact GLB per LOD and accept controlled duplication only after measuring downloads.

## 9. Web performance budget

Production target for the first loaded tree variant:

- Compressed geometry: 350–700 KB.
- GPU vertex/index buffers: 1.5–3.5 MB.
- KTX2 bark + foliage textures: 1.2–2.4 MB download; approximately 5–12 MB GPU depending on negotiated format/mips.
- Total first tree request: 1.8–3.2 MB target, 4.0 MB hard ceiling.
- Runtime tree GPU allocation: 8–18 MB target, 24 MB hard ceiling excluding renderer shadow maps.
- Draw calls: 2–4 normal pass, no more than 6; foliage shadow casting may be disabled on mobile.
- Added steady-state CPU frame work: under 0.3 ms desktop and under 0.6 ms typical mobile for wind/update orchestration.
- Added GPU frame time at the most expensive Forest frame: under 1.5 ms desktop and under 2.5 ms typical mobile relative to current scene.

These are acceptance budgets, not claims about an asset that does not yet exist. Measure using the production build on at least one integrated-GPU laptop and one mid-range phone.

## 10. Phase 9.1 loading and readiness integration

Current Phase 9.1 preheats JavaScript modules only. A GLB import would therefore still begin after Forest mounts unless an explicit asset preloader is added.

Required integration sequence:

1. Seed runs without importing GLTF loaders, decoders, tree data, or textures into its initial path.
2. When the existing adjacent-chapter idle preheat prepares Forest, it may also begin a low-priority tree asset fetch.
3. Code readiness and asset readiness remain separately observable.
4. The old chapter boundary frame remains visible until the selected tree LOD is decoded, materials are compiled, and at least one R3F frame has rendered.
5. Tree reuses the already loaded asset/cache entry; it must not download or decode a second copy.
6. Resource ownership is reference-counted across the Forest-to-Tree boundary or deliberately kept in a bounded asset cache. Do not let automatic Forest unmount disposal invalidate Tree resources.
7. On failure, mount the procedural fallback and mark readiness true; never expose an empty Forest.

The production tree must remain inside Forest/Tree lazy chunks or their asset preloader. It must not increase Seed’s initial network or GPU allocation. Decoder code also stays out of the Seed critical path.

## 11. Proposed module boundary (not implemented)

```text
src/experience/shared/tree/
├─ ProductionTree.tsx          # one rendering API used by Forest and Tree
├─ ProceduralTreeFallback.tsx  # extracted current implementation
├─ treeAsset.ts                # URLs, version, preload and cache policy
├─ treeAsset.types.ts          # LOD, presentation and readiness contract
└─ shaders/treeWind.*          # shared two-layer wind deformation

public/assets/tree/v001/
├─ tree-lod0.glb
├─ tree-lod1.glb
├─ tree-lod2.glb
├─ bark-*.ktx2
├─ leaves-*.ktx2
└─ manifest.json
```

Both scenes pass presentation parameters to the same component:

- Forest: `state="observed"`, normal opacity, full restrained wind.
- Tree entrance: `state="observed"`, same scale/pivot/material identity, chapter opacity envelope, slightly quieter wind only if demanded by the story.

No chapter may override topology, leaf distribution, seed, bark set, or asset version.

## 12. Acceptance tests

Art and continuity:

- Capture the last stable Forest tree view and first Tree upright-tree view; trunk fork, crown asymmetry, major negative spaces, bark value, and leaf-color grouping must unmistakably match.
- The chapter boundary may change camera, fog, and lighting, but not tree identity or scale.
- A neutral viewer should describe the tree as ordinary/mature, not ancient, magical, ornamental, or “the hero object.”
- Tree’s later log may remain only materially related in v0.1; do not fabricate a literal one-to-one trunk cut.

Technical:

- TypeScript strict and Vite production build pass.
- Seed output/chunk and first request do not acquire tree bytes.
- Forest idle preheat fetches only the selected LOD and necessary decoder/material resources.
- Forest-to-Tree network panel shows no duplicate tree asset download.
- One persistent Canvas remains mounted.
- Decoder/asset failure displays the procedural fallback.
- Reverse traversal Tree-to-Forest preserves identity and does not flash an unloaded/default material.
- No significant CPU per-leaf matrix loop in the production path.
- GPU memory returns to the documented cache baseline when leaving the Forest/Tree asset family, subject to the chosen bounded cache policy.

## 13. Why no production prototype was integrated

The installed project contains Three.js/R3F but no GLTF helper, mesh/texture compression pipeline, modelling/generation tool, or source tree asset. Creating a “GLB” from the existing cylinders and ellipsoids would merely repackage the current procedural prototype and falsely imply visual replacement. Adding loaders before an asset exists would add bundle and lifecycle complexity with nothing meaningful to validate.

An external search was intentionally not performed in this pass: the preferred route is self-authored and no small, rights-clear candidate could be fully inspected, downloaded, and technically audited without expanding the task into an asset-acquisition stage. Consequently:

- no external candidate is promoted;
- no production asset ledger is necessary yet;
- no production code, public assets, chunk graph, or runtime behavior was changed;
- no build-output claim is made.

## 14. Shortest next step (do not start automatically)

Phase 11 is complete as a specification and decision gate. The shortest next action, if separately approved, is:

1. Author one deterministic LOD0 tree in Blender or an equivalent controlled offline tool using the dimensions and topology above.
2. Export an uncompressed review GLB plus provenance/metrics manifest into a research-only candidate directory, not `public`.
3. Render the candidate from the exact Forest and Tree entry cameras and audit ordinary-tree character, crown gaps, scale, triangle count, material count, and wind attribute feasibility.
4. Only after that review, create LOD1/LOD2, KTX2 textures, and the shared production module with procedural fallback.
5. Run strict typecheck, production build, chunk comparison, duplicate-fetch check, readiness test, and device GPU measurements before enabling the asset by default.

## 15. Final judgement

**Yes, the current procedural main tree is worth formally replacing.** It is the correct asset to replace first because it appears in two consecutive narrative states and its simplified structure is conspicuous during sustained observation. However, replacement is justified only by one shared, measured, rights-controlled asset that preserves the current restraint. The present implementation remains the correct production fallback until that asset passes the acceptance gate above.
