# MVP-02.1 — Cinematic Visual Bible & Render Quality Audit

Status: audit complete  
Scope: current production source at `d9a2370`; architecture frozen  
Production reference: <https://beyond-this.vercel.app>  
Method: source-level audit of the active five-act WebGL scenes and CSS look layers. Research assets under `docs/research/` are treated as experiments unless imported by `src/`.

## Executive verdict

The current visual ceiling is not caused by one bad effect. It is caused by several individually modest high-frequency or contrast-reducing systems being composited at once: a full-screen animated grain layer, chapter fog, vignette/veil overlays, CSS saturation reduction, low DPR caps, procedural texture noise, transparent particles, and deliberately dark palettes. The result is a frame whose fine structure is busy while its large-form material and lighting information is weak. This reads as dirty, soft and prototype-like rather than quiet and cinematic.

Severity order:

1. **Forest asset language and silhouette are below narrative duty.** The active production tree is still code-built from 9-sided cylinders and 220 low-segment ellipsoids distributed statistically around a crown. The scene has trunks, but not a convincing branch hierarchy, crown mass hierarchy or ecological layering. Existing `BeyondTree_LOD0_*.glb` research assets are not imported by current `src`.
2. **The global look stack adds noise while suppressing useful information.** Every act renders the same `.grain` at `opacity: .055`; Forest, Tree, Room and Light then add act-specific desaturation/contrast filters, fog and vignettes. Seed also uses a substantially stronger global vignette.
3. **Room/Light contain the right narrative nouns but only primitive-grade material differentiation.** Table, chair, monitor, book, projection, window and curtain are present, but most are boxes/planes with repeated 128×128 grayscale procedural maps and near-uniform high roughness. The set reads as a diagram of a room rather than an inhabited creative space.
4. **The five-act palette changes, but the black point, key/fill ratio and color-temperature arc are not governed as one script.** Forest and Tree are close in hue and both desaturated by CSS. Room and Light are also close in background, light colors and geometry. Light matures mainly through scalar intensity and small lerps, so the final act does not acquire a sufficiently distinct cool-outside/warm-inside color relationship.
5. **Material continuity is partial.** Seed shell, Forest bark, Tree bark/end grain and Room wood all use procedural textures, but each is generated independently. Bark is copied conceptually between Forest and Tree; room wood uses a different sinusoidal grayscale texture. There is no shared scale, fiber direction, wear logic or authored seed-shell → bark → cut wood → worked wood genealogy.

Decision: proceed toward **MVP-02.2 Forest Production Rebuild**, but begin it with a short, reversible render-baseline calibration. Do not rebuild Forest under the present unmeasured grain/fog/filter stack.

## Render Quality Audit

### Global render path

| Source | Current implementation | Finding | Action |
|---|---|---|---|
| `src/experience/SceneHost.tsx:44-49` | One persistent R3F `Canvas`; `antialias: true`, `alpha: false`, high-performance preference, shadows enabled | MSAA is correctly requested. There is no explicit tone-mapping/exposure/color-management policy in this file, so the project relies on Three/R3F defaults. That is acceptable for MVP-01 but not a controlled cinematic pipeline. | Keep the Canvas architecture. Establish and screenshot-test an explicit tone/exposure baseline before asset relighting; exact values require live device testing. |
| `src/systems/runtime/mediaCapabilities.ts:16-19` | DPR ranges: desktop `[1,1.5]`, mobile `[1,1.3]`, low-power/reduced `[1,1.15]` | Sensible performance policy, but leaf silhouettes, particles and 128 px textures lose stability at the lower end. DPR does not create noise by itself; it turns existing high-frequency detail into shimmer/softness. Coupling reduced motion to low DPR is not visually motivated. | Freeze for the audit. During rebuild, test leaf stability at actual DPR 1.0/1.15/1.3/1.5. Consider separating reduced-motion from low-power only after profiling. |
| `src/styles.css:28` | Global Seed observation blur up to 12 px plus brightness down to `.48`; scale up to `1.025` | Early Seed intentionally obscures the render, but blur + very dark exposure + grain creates a compressed/dirty first impression. | Keep narrative reveal, but measure whether blur should peak below 12 px. Do not tune without screenshots. |
| `src/styles.css:29,106` | Full-screen SVG `fractalNoise`, base frequency `.9`, 3 octaves, element opacity `.055`, moving every `.22s` in two steps | This is the clearest source of the “noise too high” report. Three octaves at high spatial frequency over a 200%-sized animated layer behaves more like digital static than fine film grain. It is applied unchanged to all five acts. | First calibration candidate: target composite grain opacity **0.012–0.025** at 1440p; frequency/scale must be tested visually. Prefer one fine luma grain layer, no coarse octave. |
| `src/styles.css:30` | Seed global vignette reaches `.88` radial black at the edge plus `.36/.44` horizontal side darkening | The layers compound rather than replace each other. Edge black is heavily crushed and obscures the seed/soil environment. | Seed vignette must be recalibrated; target visible edge detail rather than numeric opacity alone. |
| `src/styles.css:49,58,70,83` | Forest/Tree/Room/Light CSS filters all reduce saturation to `.68–.70`, with slight contrast boost | This makes the acts tonally similar and weakens the intended warm transition. It also increases the apparent harshness of grain by reducing chroma/material cues while preserving luminance noise. | Freeze values until a no-grain/no-overlay capture matrix exists; then grade per act, not from a common desaturation assumption. |
| `src/styles.css:50-51,59-61,71-73,84-86` | Screen/multiply overlays, backdrop blur, chapter vignettes and transition veils | These are valid narrative transitions, but several are full-frame looks with no shared exposure budget. Tree can add 5 px backdrop blur; Room adds 4 px at threshold; Light adds 2 px continuity blur. | Treat overlays as transition effects only. At stable act midpoint, blur must resolve to zero and overlays must not replace lighting/material work. |
| `src/experience/*/*Experience.tsx` | `.grain` mounted in Seed, Forest, Tree, Room and Light | Confirms grain is global and constant, not selectively authored. | Central architecture need not change; use one documented intensity contract and per-act exceptions only if justified. |

### Transparency, particles, fog and dark-level interaction

- **Seed**: 150 dust points at `opacity .34` (`SeedScene.tsx:187-199`), transparent shell marks/cracks (`106-117`), wet circles (`154-160`), a highly transmissive droplet (`176-183`) and fog from 3.8 to 8 (`214`) all sit under global animated grain and the strongest vignette. The particles are not individually excessive, but the composite contains many small semi-transparent edges in a nearly black image.
- **Forest**: 220 independent leaf ellipsoids, 76 haze points at `opacity .12–.18`, fog from 5.2 to 15.5 and 14 background trunks (`ForestScene.tsx:25-37,83-102`). At low DPR, small moving leaves plus haze produce unstable high-frequency contrast. Leaves are opaque but double-sided; they overlap densely without authored crown masses.
- **Tree**: leaf material becomes transparent during the crossfade and changes `depthWrite` based on opacity (`TreeScene.tsx:28-43`). This is a reasonable mitigation, but crossfading 164 overlapping leaf instances still risks order/halo artifacts. Haze and fog remain present during the transformation (`60-64`).
- **Room/Light**: 52 dust particles are restrained (`RoomScene.tsx:108,150`; `LightScene.tsx:51,85`), but window/projection/interface accents, curtain, floor seams and interaction hit areas add many transparent surfaces. Invisible hit areas correctly disable `depthWrite`; visible transparent planes mostly do not, which can create compositing ambiguity when coplanar or nearly coplanar.
- **Fog color equals or nearly equals background** in every scene, which is sound for atmospheric continuity. The issue is density/range relative to camera and low-contrast materials, not a hard fog seam.

### Is grain being used to hide CG?

**Functionally, yes—even if not intentionally.** The same grain is placed over every act irrespective of asset scale or lighting, while Forest and Room rely on primitive geometry and low-resolution procedural textures. Grain adds a surface of apparent complexity without adding object-specific information. Because it persists over flat boxes, low-poly trunks and simple leaf ellipsoids, it can momentarily disguise smooth CG surfaces but also announces that the underlying materials are thin. The correct response is not zero grain forever; it is to make the clean render hold up first, then reintroduce subtle grain as a final unifying finish.

Audit gate: every future art pass must be approved once with grain disabled and once at target grain. If the clean frame fails, grain may not be used as acceptance evidence.

## Five-Act Color Script v2.0

Values below are art-direction targets, not immediate code replacements. “Black floor” is the darkest important readable material, not absolute CSS black. Exact display luminance requires screenshot and device measurement.

| Act | Base / environment | Supporting color | Black floor target | Key direction | Temperature relationship | Saturation target | Contrast target |
|---|---|---|---|---|---|---|---|
| I Seed | deep cyan-black `#07100F` mixed with wet soil brown `#21150E` | shell umber `#6B4528`, water cool gray `#B8C3BE` | retain hue in soil; no large region below approximately RGB 8 except true occlusion; **needs live measurement** | upper-left/back-side grazing key, weak warm return from soil | cool ambient / restrained warm earth key | very low globally, but water and shell must separate by hue | low-key, local shell-to-soil contrast 2.5:1–4:1; edges readable |
| II Forest | olive gray-green `#56604A` | bark umber `#59432F`, canopy gold `#B79B63` | deepest foliage remains green-brown, not neutral black | top-left canopy break with dappled shafts; cool side fill | neutral-cool air / warm sun gaps | low–medium; foliage chroma above Tree/Room threshold | broad soft contrast with 3 depth bands; hero silhouette clear at thumbnail size |
| III Tree | desaturated bark brown `#67513B` and lichen gray-green `#68705E` | fresh cut wood `#A77A4D`, transport cool gray `#4D554F` | cut end and bark furrows remain separable | low-angle side/back key revealing cylinders and end grain | warm wood first becomes dominant; environment remains cool | medium on cut wood only | stronger material contrast than Forest; transformation readable without overlays |
| IV Room | amber brown `#5A4431` | paper ivory `#C7B796`, glass blue-gray `#637276`, textile taupe `#817565` | under-table and corners retain brown information | window key from left; practical source from upper-right/interior | cool dusk window / warm interior practical | medium-low, with material-specific hue separation | key/fill hierarchy 3:1–5:1; focal objects one stop above surrounding set (**needs measurement**) |
| V Light | mature warm ivory `#D2C1A2` inside balanced by dusk blue `#596872` outside | muted rose/wood `#9A725D`, green-gray `#707864` | lifted relative to Room; darks colored, not crushed | same Room sources, but window relationship becomes legible and light wraps surfaces | explicit cool exterior / warm remembered interior | medium, controlled; widest hue range of all acts | not simply brighter: fuller midtones, clean separation, soft highlight roll-off |

Continuity rules:

1. Seed is unknown, not death: black must carry wet cyan/earth hue.
2. Forest introduces living green and the first gold light, not a gray fog wash.
3. Tree is the first decisive warm-material turn; the cut surface is the narrative hinge.
4. Room makes warm material human and worked; cool exterior provides counterpoint.
5. Light completes color relationships rather than only increasing intensity.

## Material Language v2.0

### Genealogy

`seed shell → bark/fiber → cut end grain → worked room wood → worn creative surface`

This is one material story with changing scale and intervention:

- **Seed shell**: compressed fibers, pores, wet roughness breakup and one directional seam. Avoid generic rocky noise.
- **Forest bark**: inherit the shell’s brown family and directional fiber logic at a larger scale; add vertical furrows, moss/lichen occupancy and moisture variation tied to orientation.
- **Tree cut wood**: reveal rings, radial checking, sapwood/heartwood difference and tool/transport abrasion. End grain cannot be the bark map with a radial sine alone.
- **Room wood**: visibly milled from the same species family. Grain runs with plank/leg geometry, end grain appears on exposed ends, and contact areas acquire soft wear. Table, chair and floor must not all share identical mapping scale and roughness.
- **Light wood**: same assets as Room; maturity comes from lighting, readable micro-normal and wear, not a new color pasted over them.

### Per-act material set

| Act | Required materials | Current status | v2.0 rule |
|---|---|---|---|
| Seed | wet soil, shell, water | strongest material-specific act; 128 px procedural maps and geometric soil grains | retain choreography and organic seed geometry; author coherent shell/soil maps and reduce unrelated micro-noise |
| Forest | bark, leaf front/back, moss/ground, humid air | grayscale bark bump; untextured colored ellipsoid leaves; simple ground | bark needs scale-correct base/normal/roughness; leaves need grouped translucency/color response; ground needs broad moss/litter masses before detail |
| Tree | bark, end grain, abrasion, vehicle/straps | procedural bark/end maps; no convincing processing trace | preserve narrative staging; rebuild hero wood material and believable transport contact details |
| Room | worked wood, paper, glass/screen, fabric, wall/plaster | wood/wall/paper share 128 px grayscale generation pattern; glass is mostly emissive/basic planes; curtain is a flat transparent plane | each family needs distinct response, UV scale and edge/contact behavior; reserve emissive/basic material for actual display content |
| Light | same Room materials under mature light | duplicates Room generators and geometry rather than sharing authored assets | visually identical objects must remain materially identical; only lighting and state change |

Material acceptance rules:

- Base color, roughness and normal/bump must describe the same physical feature.
- Texture scale is specified in world terms and checked at hero camera distance.
- No random noise layer may be added solely to make a flat material look “detailed.”
- Roughness must have a plausible range; avoid setting nearly every object to `.9–1.0`.
- Material identity must remain readable with grain disabled.
- Color is not a substitute for material separation.

## Modeling / Asset Quality Standard

### Must be redone

1. **Forest hero tree geometry and crown**: replace current 9-sided branch stack and statistical ellipsoid cloud (`ForestScene.tsx:40-78`) with the production specification below.
2. **Forest environment composition**: replace isolated background cylinders (`83-85`) with authored foreground/midground/background systems and recognizable canopy/understory masses.
3. **Hero bark and leaf materials**: current 128×128 grayscale bump plus vertex color is insufficient at production camera distance.
4. **Room hero focal objects and material pass**: table edges/joinery, chair silhouette, curtain folds/thickness, window/frame, book/paper, projection surface and interface housing need asset-specific modeling/material response.
5. **Tree cut/end-grain moment**: resting timber and transported log need physically legible end grain, checks, bark transition and contact/handling evidence.

### May be retained

- One persistent Canvas, chapter loading architecture, camera/timeline contracts and reduced-motion branches.
- Seed timeline, droplet choreography, organic seed geometry and wetness-state logic.
- Forest camera lift/reveal idea and top-left key-light intent.
- Tree narrative beats: upright tree → resting timber → transport → Room threshold.
- Room interaction bindings and Book/Process/Projection presentation/runtime systems.
- Room/Light broad layout and cool-window/warm-interior concept.
- Deterministic seeded randomness where it supports reproducibility rather than composition.

### Quality bar

- Hero silhouettes must read at 320 px-wide capture and full desktop frame.
- Primary forms, secondary forms and tertiary detail must be identifiable in that order.
- Hero assets require authored UVs/material zones or a documented procedural mapping with stable scale.
- Circular hero branches/logs should not reveal faceting at the approved camera; segment count is selected from screen-space evidence, not a universal number.
- Asset transitions may crossfade only when transparency artifacts are absent at DPR 1.0 and 1.5.
- Every hero material is reviewed under neutral diagnostic light before cinematic grading.

## Forest Rebuild Specification v0.1

### Production tree structure

The hero tree is one authored organism, not a trunk plus scattered leaves:

1. Root flare and lower trunk with asymmetry, compression and ground contact.
2. One dominant trunk axis with visible taper and controlled lean.
3. Five to eight primary branches with believable attachment, taper and directional response to light/space.
4. Secondary branches that visibly continue each primary branch.
5. Selected tertiary/twig structures at the crown boundary and near-camera silhouette; do not model uniform twig density everywhere.
6. Crown clusters attached to branch endpoints so leaf mass explains branch structure.

The latest approved research GLB may be evaluated as a starting asset, but it is not production merely because it exists under `docs/research/`. Integration requires scale, normals, UV/material, camera silhouette and performance validation in the active scene.

### Leaf groups

- Compose 7–12 major crown masses, each with 2–4 secondary clumps.
- Leaf cards/meshes align statistically to local branch direction and light, not a uniform sphere.
- Separate exterior light-catching leaves from dark interior mass. Interior mass should be broad and quiet, not hundreds of equally salient pieces.
- Use limited hue/value families: deep olive interior, mid olive, restrained warm edge. Brown/gold is an accent, not the entire crown.
- Alpha-tested leaf cards, if used, must be validated for edge shimmer at DPR 1.0. Avoid large fields of blended transparency.

### Spatial layers

Minimum four readable layers at the main camera:

1. foreground framing vegetation/trunks, partially cropped;
2. hero tree and immediate ground plane;
3. midground tree groups/understory with lower contrast;
4. background canopy/atmospheric field with controlled fog convergence.

Optional fifth layer: high canopy/light opening that motivates the key light. Layers must be created by scale, overlap, value, color and fog—not particles alone.

### Ground and ecology

- Broad ground forms first: soil/moss zones, root contact, leaf-litter masses, path or compressed area.
- Secondary props cluster according to moisture/light, never uniform random scatter.
- Hero tree must visibly belong to the ground through roots, contact shadow and material transition.

### Motion

- Establish a low-frequency trunk/primary-branch response only if physically plausible and extremely small.
- Crown masses move coherently; secondary clumps lag slightly; individual leaf flutter is sparse and localized.
- Preserve reduced-motion behavior.
- Camera lift remains the principal narrative movement. Wind must not compete with it.

### Lighting

- One motivated canopy key from upper-left/back, warm-neutral.
- One cool ambient/sky fill preserving bark shadow color.
- Optional restrained rim breaks crown silhouette; no unmotivated multi-directional fill.
- Dappled light is broad and slow. Do not simulate it with fast particle flicker.
- Fog supports depth layers but may not erase midground structure.

### Forbidden

- trunk + random radial leaf cloud;
- equally sized/equally contrasted leaves across the whole crown;
- free-floating leaf fragments used as the main vegetation language;
- particle haze used as a substitute for background composition;
- uniform sway on every leaf;
- black leaf interiors with no green/brown hue information;
- heavy grain used to hide faceting, alpha edges or sparse assets;
- shipping a research GLB without active-scene camera and performance validation.

## Room / Light Art Pass brief

### Narrative goal

Room must feel like the place where natural material becomes human practice. Light must revisit exactly that space and make relationships legible: exterior/interior, memory/presence, looking/making. Light is not a brighter duplicate.

### Geometry and set dressing

- Keep the current composition and interaction zones, but rebuild the hero table with bevels, believable thickness, joinery and grain direction.
- Give the chair a more specific silhouette and wear/contact logic; current box construction is only blocking.
- Build a window frame/reveal and a source outside the window. The current flat warm plane does not establish an exterior world.
- Curtain requires folds, thickness/edge and transmission; the current subdivided plane with `.82/.76` opacity reads as a translucent card.
- Book requires page block, cover/spine, page curvature and a few authored marks. Paper needs fiber/roughness without random grit.
- Interface needs casing edges, screen glass response and restrained emitted light. Projection needs wall/screen texture and falloff tied to actual content.
- Add 5–9 purposeful life traces: moved chair, stacked/loose papers, cup/stain, tool/cable, pin/clip, worn table edge, curtain handling crease. Each must support the maker narrative; avoid clutter scattering.

### Material and light hierarchy

- Wood, paper, glass/screen, fabric and plaster must remain separable in a grayscale capture by roughness/highlight shape.
- Room: cool window key + warm practical, with focal hierarchy table/book → projection → interface as the timeline advances.
- Light: retain source positions but open colored midtones, reveal exterior dusk blue and allow warmer surfaces to reflect/interact. Avoid increasing all light scalars together.
- Dust is an accent visible only in motivated beams; it cannot be a constant texture layer.

## Before / After measurable targets

| Measure | Current | Target / acceptance |
|---|---|---|
| Full-screen grain | CSS opacity `.055`, 3-octave fractal noise, `.22s` stepped animation | target composite opacity `.012–.025` at 1440p; one fine scale; exact value **requires live testing** at 1080p/1440p and mobile |
| Grain acceptance | always present | every art review includes grain-off and grain-on captures; clean render must pass |
| DPR | 1.0–1.5 depending on device | retain range initially; zero unacceptable leaf shimmer/fog banding at 1.0, 1.15, 1.3, 1.5 |
| Forest depth | hero + simple cylinder background + ground; haze points | minimum 4 readable spatial layers; silhouettes separable at midpoint capture |
| Hero branch hierarchy | trunk + 5–6 explicit branch cylinders, no visible secondary system | trunk/root + 5–8 primaries + visible secondaries + selective tertiaries |
| Crown organization | 120/220 independently placed ellipsoids | 7–12 primary crown masses, each 2–4 secondary clumps, attached to branch endpoints |
| Forest motion | every leaf receives sine sway/flutter every frame | coherent mass motion; individual flutter affects no more than a visually estimated 15–25% at once; exact shader/instance method **TBD** |
| Background vegetation | 9/14 simple trunks | at least 2 authored group types across mid/background plus foreground framing |
| Fog readability | Forest 5.2–15.5; Tree 6–13.5; Room 6.2–12.4; Light 6.3+ | midground edge contrast remains visible; numeric density/range **requires screenshot testing** |
| Shadow map | 512 reduced / 1024 normal in Forest/Tree | retain until profiling; hero contact and primary branch shadows stable with no obvious crawling |
| Texture resolution | major procedural maps generally 128×128, anisotropy 4 | hero authored maps chosen from screen-space need; expected 1K minimum for hero bark/wood, but final budget **requires profiling** |
| Material information | many objects use color + uniform roughness `.9–1` | each hero family has at least base-color + coherent roughness + normal/bump information; glass uses a distinct response |
| Dark readability | no current measurement; strong edge vignettes and low-key fog | important form retains hue and edge separation on calibrated desktop/mobile; waveform/luminance target **requires capture tooling** |
| Room life traces | approximately two small tabletop props plus main media objects | 5–9 authored, narratively motivated traces; no random filler |
| Light differentiation | near-identical room, small color/intensity lerps | visible cool exterior/warm interior split in midpoint still; Room vs Light identifiable without UI text |
| Performance | current production passes | no regression against current interaction stability; frame-time budget and GPU tiers **require live profiling** |

## Implementation order

1. **Render baseline capture and calibration — highest return, low risk.** Capture all five act midpoints at desktop DPR 1.5 and mobile/low DPR. Produce grain-off, overlay-off and normal matrices. Calibrate grain first, then stable-act vignette/blur, then fog. Keep changes small and reversible.
2. **MVP-02.2 Forest production asset integration/rebuild — highest narrative return, medium risk.** Validate the best research tree against the specification; rebuild what fails. Establish branch/crown/material system and four spatial layers before fine foliage.
3. **Tree continuity pass — high return, medium risk.** Reuse the approved Forest species/material, then author cut end, abrasion and transport contact. Preserve timeline contracts.
4. **Room hero art pass — high return, medium/high scope risk.** Rebuild table/window/curtain/book/chair and material families while retaining interaction boundaries and layout.
5. **Light art/grade pass — medium return after Room, low architectural risk.** Reuse Room assets exactly; complete cool-outside/warm-inside relationship and midtone maturity.
6. **Seed continuity polish — targeted return, low/medium risk.** Preserve the strongest current scene; align shell fibers/soil wetness with approved bark genealogy and reduce particle/noise competition.
7. **Five-act final grade and device QA — final integration gate.** Tune color script, fog, exposure and grain only after asset passes. Validate transitions, reduced motion, low DPR and performance.

## Priority change / freeze register

### Change first

- `.grain` intensity/frequency/animation, after controlled captures (`src/styles.css:29,106`).
- Stable-act vignette/veil and saturation filters (`src/styles.css:49-86`).
- Forest hero geometry, crown grouping, background layers and bark/leaf materials (`src/experience/forest/ForestScene.tsx`).
- Tree end grain and its continuity with Forest bark (`src/experience/tree/TreeScene.tsx`).
- Room/Light hero material maps and focal geometry (`RoomScene.tsx`, `LightScene.tsx`).

### Freeze temporarily

- Experience/timeline/controller architecture and chapter boundaries.
- Room interaction, media runtime and Book/Process/Projection behavior.
- Camera choreography until replacement asset scale is validated; adjust only as part of framed asset acceptance.
- DPR policy and shadow-map sizes until controlled visual/performance tests exist.
- Seed narrative timeline and droplet/wetness logic.
- Audio, publication UI, deployment configuration and second-work scope.

## Exit criteria for MVP-02.1

- Current sources and parameters are recorded with actionable locations.
- Five-act color and material rules exist independently of present implementation shortcuts.
- Forest rebuild has a production specification and forbidden-pattern list.
- Room/Light have a bounded art-pass brief that preserves interaction architecture.
- Measurable targets distinguish source-known values from items requiring live testing.
- No Forest rebuild or core visual-code change is included in this phase.

MVP-02.1 conclusion: **approved as an audit and visual-direction gate. Proceed to MVP-02.2 after the render-baseline capture/calibration substep.**
