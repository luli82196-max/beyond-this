# MVP-02.5 — Light Final Grade & Five-Act Color Closure

Status: implementation, local visual QA and engineering validation complete

Baseline: `391a7ee0e79d8408e25aed9057606f1337d21455`

Scope: Light final photography/color grade, Room-to-Light spatial/material continuity, final UI hierarchy and five-act color closure. ExperienceController, chapter boundaries, Room/Book/Process/Projection runtime, Media Runtime, DPR, audio and deployment architecture are unchanged.

## Before

- Light used an older simplified copy of the room. The window, curtain, table and chair fell back to planar or placeholder geometry immediately after the Room production pass.
- Light generated its own grayscale wood texture instead of inheriting the shared worked-wood contract and Room object-specific texture directions.
- The opening directional light was warm gold, while Room ends with muted cool window light and restrained amber interior light. The transition therefore read as a lighting reset rather than maturation.
- The final frame remained dark in structural areas, while Book, Process and Projection used comparatively flat basic-light responses. Wood, paper, cloth, wall and glass did not retain Room's differentiated response.
- Completion/About UI retained more contrast and width than the final image needed, especially in portrait.

## Final Light and color parameters

Light now starts from Room's terminal dusk baseline: fog `#45423f`, cool sky `#82909a`, ground `#2c211b`, cool window key `#9fb3c2`, amber practical `#d49a5e`, and the same initial camera targets/distances used by the production Room.

As `lightMaturity` resolves, the scene changes through relationships rather than global exposure:

- fog moves only 38% toward `#56504a` and its range opens by `.25 / .55`;
- hemisphere sky moves 46% toward neutral warm ivory `#b2b0a3`, while its intensity grows from `.38` to `.56`;
- a restrained ivory ambient fill grows from `0` to `.22` so completed wood, paper, cloth and frame detail return from black without flattening the Room entry state;
- cool window key shifts only 34% toward `#c7c2aa`, preserving dusk blue;
- amber practical shifts 30% toward `#dfb879` and gains local reach, without bloom or an exposure change;
- floor/table tones mature by 25–28% toward warmer worked wood rather than becoming yellow;
- camera look-back amplitude is reduced and has a separate portrait limit, preserving the existing narrative gesture while keeping the room readable.

The global canvas filter remains `saturate(.7) contrast(1.035) brightness(.98)`. No renderer exposure, tone mapping, saturation maximum, bloom or post-processing library was added.

## Material and spatial continuity

Light now imports `createWorkedWoodTexture` and `WOOD_CONTINUITY`. Its floor, desktop, chair and window use the same repeat, offset and rotation families approved in Room: broad floor grain rotated 90 degrees, directional tabletop grain, denser old chair grain and independently weathered window grain.

The Light room retains the same production silhouettes for the wall-set window, glass depth, sash, sill and folded two-layer curtain. Table legs are restored to four tapered supports and the chair returns to four splayed legs, uprights and three back slats. These are scene-local Light objects, so Room runtime ownership and interaction handlers remain untouched.

Paper remains fiber-mapped and matte, curtain remains geometry-driven cloth, wall retains bump/roughness, glass retains low roughness/transmission, and wood retains object-specific response. Book, Process and Projection remain physical carriers; their maturity values alter restrained material/color response rather than turning them into emissive UI.

## Room → Light continuity

At Light progress zero, camera distance/target, fog, hemisphere colors, cool window key, amber practical, window construction, curtain folds and wood map genealogy match the Room terminal composition. Light then opens shadow separation, slightly neutralizes the key and lets ivory/low-gold fill mature. It does not begin with a warm studio key or a new room.

Reverse traversal remounts Room's unchanged production scene and restores its dusk values without persistent Light material or color state. Browser traversal Light → Room → earlier acts produced no stuck UI/runtime state or console output.

## Final five-act Color Script

| Act | Final stable palette | Narrative function |
|---|---|---|
| Seed | deep cyan-black / wet earth / restrained cool gray | latent relation and observation in darkness |
| Forest | olive / gray / restrained gold | natural systems become spatially legible |
| Tree | olive → fresh-cut warm focus → worked warm brown | material transformation without losing origin |
| Room | dusk blue × amber wood | nature enters a human making space |
| Light | warm ivory × retained dusk blue / low-saturation gold | the same world becomes newly readable rather than simply brighter |

Forest, Tree and Room production assets were not reworked. Their stable parameters remain the approved production results; the closure is completed at the Light endpoint.

## Noise and contrast control

- Shared grain remains frozen at `.018`, one octave and the calibrated `1.2s steps(4)` cadence.
- The brighter Light chapter uses a scene-local `.014` grain opacity so the same full-screen texture does not become visible dirt in opened midtones.
- Light vignette edge opacity is reduced from `.54` to `.42`, side darkening from `.20/.22` to `.14/.16`, and its clear center opens from 25% to 28%.
- Dust count drops from 52 to 38 in motion and from 24 to 18 in reduced motion; opacity is capped at `.075` instead of `.115`.
- Black detail is recovered by in-scene ivory fill and light-source balance, not a global brightness/exposure lift.

## UI hierarchy

Completion UI width decreases from 330 to 310 pixels and its primary/secondary contrast is reduced. At `max-width: 720px`, it becomes a 260-pixel block with smaller completion text, tighter About spacing and 24/22-pixel safe offsets. The final title has already faded before completion information arrives, so the two messages do not compete. Existing completion and About functions remain; no footer/navbar was added or removed.

At 390×844 the completion block occupies the lower-right quiet area and does not cover the projection/book focal region. Expanding About remains an intentional user action and therefore may overlay more of the scene temporarily.

## QA

Local production preview was rebuilt and inspected on 2026-08-27.

- 1440×900: passed after one black-level correction. Window/cool exterior, folded curtain, projection wall, physical work surface and completion information retain separate hierarchy.
- 1920×1080: passed. The composition retains a left window anchor, central wall/projection field, lower work surface and right-side quiet area. Completion UI bounds remain inside the viewport.
- 390×844: passed. Portrait camera compensation keeps the projection and open-book zone visible; completion/About summary sits below the core image rather than covering it.
- Room → Light: passed through normal forward scrolling. Entry lighting and geometry no longer reset to the pre-production room.
- Light → Room: passed through reverse scrolling. Room remounts without a persistent Light grade, media/UI residue or console output.
- Five-act traversal: Seed → Forest → Tree → Room → Light reached through normal Skip/Continue/scroll input; the palette reads as dark cool origin, olive natural system, warm material transformation, dusk making space and ivory/dusk closure.
- Reduced motion: deterministic code path verified. Pointer camera motion, curtain animation and dust rotation remain disabled; the Light static camera uses the bounded look-back path and the reduced dust count. The browser did not expose OS media-feature emulation, so no emulated reduced-motion screenshot is claimed.
- Console warning/error: 0 at inspected final desktop and portrait states.
- Book/Process/Projection/Media: complete existing aggregate and additional renderer/runtime/integration regressions passed.

## Engineering validation and performance

- Strict TypeScript (`tsc -b`): passed.
- Existing core Room/Book suite: passed.
- Additional Book minimal renderer/runtime, Process runtime, Projection runtime and complete Room/Media integration: passed.
- Vite production build: passed with Vite 7.3.6 and 136 transformed modules.
- No dependency, lockfile, binary asset or post-processing library was added.
- The known package-manager preflight still cannot create its temporary status file under the managed environment; validation used the existing local Node/TypeScript/Vite dependencies, as in the previous pass.

Build delta against the checked-in MVP-02.4 production output:

| Artifact | MVP-02.4 | MVP-02.5 | Change |
|---|---:|---:|---:|
| Light scene chunk | 7,792 B | 9,508 B | +1,716 B |
| Light scene gzip | not recorded | 3.06 kB | current only |
| Main JS bundle | 1,073,798 B | 1,073,851 B | +53 B |
| Main CSS | 14,966 B | 15,238 B | +272 B |

The added GPU work is limited to production-continuity primitive segments, four cloned procedural wood maps, one low-resolution shared curtain geometry and one ambient light. Dust count is reduced. No heavy pass, dynamic shadow source or new texture download was added. The existing `>500 kB` advisory remains.

## Known limits

- Light duplicates the approved production silhouettes locally rather than mounting Room's interactive runtime. This avoids cross-chapter media ownership but means later Room geometry changes must be consciously mirrored if visual reconstruction continues.
- Light remains deliberately low-key. The final state opens material separation without becoming a daylight room; display black-level calibration can still affect perceived shadow detail.
- Reduced-motion behavior is source-path verified, not an OS-emulated screenshot.
- No independent Vercel Ready verification is claimed.

## MVP-02 Visual Reconstruction v1.0 gate

The local visual and engineering gate is met. Forest production reconstruction, Tree material continuity, Room production art and Light/five-act closure now form one continuous visual genealogy, while the calibrated noise baseline and all frozen runtime systems remain intact.

The formal remote gate requires this commit and the existing local Room commit to reach `origin/main`. After push, the next recommended phase is a short visual review on a calibrated desktop and physical mobile device, followed by sound/interaction polish. A second broad visual reconstruction pass is not recommended unless that review identifies a concrete cross-act discontinuity.
