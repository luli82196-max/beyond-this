# Phase 10 — Sound World Design v0.1

Status: design specification; awaiting review  
Scope: sound script, layer model, continuity, asset brief, and implementation guidance  
Out of scope: downloading, licensing, recording, mastering, or integrating production audio; visual, narrative, chapter-timing, and portfolio-content changes

## 1. Intent

Sound in Beyond This is not a score and does not explain what the viewer should feel. It makes the five acts inhabit one plausible world through air, material, distance, and the persistence of spaces beyond the frame.

The experience should remain sonically credible when the viewer stops scrolling. Scroll changes relationships—near/far, exposed/occluded, inside/outside—and may reveal a restrained event, but it must not scrub audible waveforms pixel by pixel. Reverse travel must reconstruct the same world without playing recorded actions backward.

The governing continuity is:

> dark environmental air → open air and foliage → a quieter field of relocation → inhabited interior air → the same room reopened toward the outside world

Silence is treated as reduced information, not as a dramatic vacuum.

## 2. Non-negotiable principles

1. No emotional BGM, trailer grammar, advertising polish, or musical resolution.
2. Every layer must have a believable source, distance, material, and acoustic space.
3. Chapter labels do not define audio track boundaries. Important beds may survive across a boundary.
4. Loops must remain convincing during an indefinite pause; avoid short, recognizable repetitions.
5. Scroll controls envelopes and relationships through broad zones with hysteresis. It does not continuously seek audio playback time.
6. One-shots fire only on deliberate threshold crossings, with direction-aware alternatives or suppression. They never reverse-play.
7. Dynamic range stays restrained. Small detail should reward listening without making headphones mandatory.
8. Muting, tab visibility, device limits, and missing files must degrade calmly and must never break chapter continuity.

## 3. Shared listening perspective

- Perspective is observant and human-scale, not omniscient or hyper-cinematic.
- Default output is stereo with conservative width. Essential information remains intelligible in mono.
- Very low frequencies are environmental only; they may not function as suspense cues.
- Near details are sparse and dry enough to locate. Distant beds are softer, less bright, and less transient.
- No chapter should reach conventional commercial loudness. Final loudness is to be established by in-context listening, with headroom for coincident layers and no limiting used to manufacture intensity.

## 4. Audio state model

### 4.1 Layer classes

| Class | Definition | Lifetime | Scroll relationship |
| --- | --- | --- | --- |
| Persistent bed | The continuous air or environmental substrate that makes the world exist while idle | Long loop; may span chapters | Slow gain/tone changes over broad zones |
| Contextual layer | A loop tied to a spatial relationship, object, or distant source | Active only while context is plausible | Enters/exits with wide envelopes; may change perspective |
| One-shot | A discrete, physically motivated event | Plays to completion unless inaudible or superseded | Fires on threshold entry with cooldown and direction rules |
| Continuity tail | The decaying remainder of the previous acoustic space | Boundary-only | Continues into the next chapter before fading naturally |

The production system should describe each layer with: stable id, asset source, class, loop flag, nominal gain, priority, chapter/zone membership, fade-in/out durations, optional low-power exclusion, and optional forward/reverse one-shot variants. Source URLs remain null until assets and rights are approved.

### 4.2 State and envelopes

The director should derive desired layer states from overall progress plus direction, velocity band, muted state, page visibility, and audio readiness. Actual gain follows those targets with time-based smoothing.

- Use equal-power crossfades for two correlated beds where a level dip is audible.
- Use independent S-curves for unrelated layers; their gains need not sum to one.
- Typical bed fades: 2.5–8 seconds.
- Context-layer fades: 1.5–5 seconds.
- Boundary overlap: normally 4–10 seconds of listening time, mapped to a broad progress zone rather than a fixed scroll speed.
- One-shot attack is inherent in the recording; do not make it follow progress after triggering.
- Add a small threshold hysteresis band and a cooldown to prevent wheel jitter from retriggering events.

The current chapter-weight feathering is a valid prototype, but production continuity should use layer-level envelopes rather than multiplying every layer by one chapter gain. This is essential at Tree → Room and Room → Light.

### 4.3 Forward and reverse behavior

- Beds and contextual loops use the same plausible continuous playback in both directions; only target gains and filtering change.
- Crossing backward restores prior layers through normal fades. Playback is never reversed.
- A one-shot may have: a dedicated reverse-direction recording, a neutral alternative, or `reverse: suppress`. Suppression is preferred when no real reverse event exists.
- Seed soil impact, water drop, and wet-soil details do not replay repeatedly while hovering around thresholds. After a meaningful retreat beyond hysteresis, a later forward crossing may re-arm them.
- `wood_shift` must be a small settling/weight-transfer family, not one fixed sync hit. Forward and reverse choose separate plausible variants or suppress.
- Fast chapter jumps skip low-priority one-shots and converge beds to the destination over a short safe fade.

### 4.4 Paused scroll

When progress is stationary, all currently valid beds continue. Contextual layers settle at their current target. There is no periodic embellishment added merely to prevent silence. Long loops must contain internal natural variation, and sparse environmental events should be baked or scheduled with sufficiently irregular timing only after listening tests.

### 4.5 Mute, unlock, visibility, and focus

- Start muted. The first explicit SOUND ON gesture unlocks/resumes audio and fades the current world in over roughly 0.8–1.5 seconds; do not begin from the start of a chapter track.
- Muting ramps the master gain down over roughly 100–250 ms before pausing or suspending. Preserve logical layer state and, where practical, loop position.
- Unmuting recalculates from current progress and fades in; it must not replay missed one-shots.
- When `document.hidden`, ramp down then suspend the AudioContext after a short grace period. Do not leave environmental sound playing in the background.
- On focus/visibility return, recalculate current targets, resume only after the context is allowed, then fade in over roughly 0.8–1.5 seconds. Do not catch up or replay events that occurred while hidden.
- If every approved source is absent, retain the current behavior: omit SOUND entirely.
- If only some sources are available, SOUND may appear, but missing layers must be treated as an intentional degraded mix and reported in diagnostics—not replaced by arbitrary sounds.

## 5. Five-act sound script

### 5.1 Seed — unknown, macro, observation

The opening is close and dark but not ominous. The listener senses a small, bounded environment whose exterior remains undefined.

| Existing cue | Class | Treatment and progress relationship |
| --- | --- | --- |
| `ambient` | Persistent bed | Extremely quiet dark environmental/room tone; no musical pitch or pulsing. Present from unlock and stable during pauses. In the late act, gently opens in bandwidth and width so it can become the air beneath Forest. |
| `soil` | One-shot | One restrained granular contact aligned with the existing seed landing at about 7.88 s. Short, dry, close, and materially small; not a cinematic impact. Forward only or use a separate neutral settling variant in reverse. |
| `water` | One-shot | A single small drop aligned with the existing event at about 9.28 s. The sound must fit the visible scale and must not be glossy, cavernous, or symbolically amplified. |
| `wet_soil` | One-shot / short texture | Very quiet absorption and granular moisture change near 11.76 s, only if a real recording reads naturally. Prefer omission to an invented squelch. |
| `subtle_environment_change` | Contextual transition | Not a “life awakens” cue. Use only a nearly imperceptible change in air, moisture detail, or high-frequency openness around 12.62 s. This may ultimately be implemented as bed automation rather than a separate file. |

Mix shape: the bed holds the act. Discrete details briefly become perceptible then return attention to air. The final portion introduces no reward chord or biological sound.

### 5.2 Forest — air, wind, and leaves in relation

Forest is spatially layered, never a wall of generic nature. The primary story is how the same air reads differently across distance and canopy.

| Existing cue | Spatial role | Treatment and progress relationship |
| --- | --- | --- |
| `wind` | Mid/far persistent bed | Broad, soft air movement without gust clichés. It grows from Seed's opened air during the first 20% of Forest, then changes height/perspective with camera lift rather than simply getting louder. |
| `leaves` | Near/mid contextual layer | Selective leaf movement with gaps and restrained stereo detail. It becomes clearer as scale is established, then slightly more diffuse as attention lifts toward the canopy. |
| `distant_nature` | Far contextual bed | A thin, indistinct horizon: perhaps sparse insects or very distant habitat, dependent on actual setting. No species showcase and no obvious repeating bird calls. It remains below wind/leaves. |

Near/mid/far contract:

- Near: occasional individual leaf friction, low density, modest width.
- Mid: coherent canopy movement that links multiple trees.
- Far: diffuse exterior continuity with reduced brightness and transients.

The late Forest mix thins rather than crescendos. Some wind and foliage survive into Tree as evidence that location does not vanish at the chapter label.

### 5.3 Tree — migration of relation, not destruction

Tree moves from forest familiarity toward relocation and an interior threshold. The negative space between environments is central, but it must remain acoustically inhabited.

| Existing cue | Class | Treatment and progress relationship |
| --- | --- | --- |
| `forest_pause` | Persistent continuity bed | A quieter continuation/alternate perspective of Forest air and foliage. Strongest at entry; gradually occluded between roughly 18–49% as `forestPresence` falls. “Pause” means reduced activity, not digital silence. |
| `wood_shift` | Sparse one-shot family | Small weight settling, fibre/wood tension, or surface contact around the resting-tree relationship (roughly 30–48%). Never chop, saw, crack-as-climax, or sync-heavy impact. Direction-specific variants or reverse suppression. |
| `distant_transport` | Far contextual layer | A remote, partially masked low-detail transport presence emerging around 55–70%, travelling without crossing close to the listener, and receding before 97%. It is spatial evidence, not narrative spectacle. |

During 82–100%, a neutral enclosed-air component begins beneath the forest remainder. The transport clue recedes; it must not become the bridge into Room. The true bridge is the gradual change from open air to bounded air.

### 5.4 Room — human trace and creative space

Room is occupied by evidence, not chatter. It has window leakage, soft mechanical presence, and material reflections; it is neither studio-dead nor café-busy.

| Existing cue | Class | Treatment and progress relationship |
| --- | --- | --- |
| `room_ambience` | Persistent bed | Bounded evening air with subtle exterior leakage and credible low-level building presence. Begins before Tree ends, becomes primary through Room's first 20%, and continues unchanged into Light. |
| `curtain_move` | Contextual layer | Irregular, extremely light fabric movement associated with air at the window. It must not be a short obvious loop. Gain follows the broad curtain/air relationship, not every rendered movement. |
| `projector_hum` | Contextual layer | Low, restrained mechanical/electrical texture that becomes legible as projection attention develops around 40–63%. Avoid a strong pure tone; it must not dominate laptop or phone speakers. |

An extremely weak exterior residue—derived from the prior outside-world family rather than a new generic track—remains filtered through the window. Book and interface attention do not require literal page turns, typing, UI sounds, or notification cues.

### 5.5 Light — re-hearing the existing world

Light stays in the same room. The sonic event is a shift of attention and permeability, not a new soundtrack and not a switch click.

| Existing cue | Class | Treatment and progress relationship |
| --- | --- | --- |
| `light_room` | Persistent bed alias/continuation | Prefer the same running `room_ambience` instance with adjusted mix, not a second near-identical room file. Room continuity remains clear through at least the first 24%. |
| `outside_world` | Contextual persistent layer | The already-present exterior leakage becomes more perceptible from roughly 46–96% as the camera looks back. Increase clarity/width modestly; do not imply a window suddenly opens unless the picture says so. |
| `final_ambience` | Final mix state, not necessarily an asset | Prefer a state composed from room air plus outside world. If a separate file is used, it must share the same acoustic identity and enter invisibly. No finale swell. |

The final pause should feel sustainable indefinitely: room air remains, the exterior is newly legible, and nothing announces completion.

## 6. Chapter-boundary continuity

Boundary percentages below are design zones around the existing overall ranges (`.20`, `.45`, `.65`, `.90`), not new chapter timing. Final seconds depend on user speed, so envelopes must also be time-smoothed.

### 6.1 Seed → Forest (`.20`)

- In late Seed, widen and brighten `ambient` subtly; introduce a barely detectable far-air component.
- Across the boundary, let Forest `wind` inherit that air rather than start at zero as a recognizable loop.
- Introduce `leaves` after air continuity is established; `distant_nature` arrives last and remains faint.
- Seed one-shots leave no theatrical tail. Reverse travel closes the air and removes leaf detail without reverse-playing any event.

Result: scale expands from a bounded micro-environment into air moving through vegetation.

### 6.2 Forest → Tree (`.45`)

- Carry a stem or compatible alternate of `wind`/`leaves` into `forest_pause` with no phase-obvious hard switch.
- Reduce activity and high-frequency leaf detail as `forestPresence` declines; do not mute the forest at Tree entry.
- Introduce `wood_shift` only in its plausible resting zone, independent of the label transition.
- `distant_transport` emerges later from the far field and never replaces the environmental bed.
- Reverse restores canopy detail progressively; transport recedes normally or stays absent depending on its event state.

Result: the relation changes while the previous place remains acoustically behind it.

### 6.3 Tree → Room (`.65`) — highest priority

- Begin bounded neutral air during Tree's `roomThreshold` rise (roughly its final 18%), before the visible chapter handoff.
- Keep a filtered, distant remainder of `forest_pause` across the boundary. Its loss of brightness and width suggests enclosure without a door-slam cue.
- Bring `room_ambience` to stable presence through Room's first 20%; only then let the forest residue fall below perception.
- The transport clue must recede before or at the boundary and must not sound as though it enters the room.
- `curtain_move` may connect exterior airflow to interior evidence after the room is established. `projector_hum` arrives later with projection attention, not at chapter entry.
- Reverse travel restores exterior width first, then forest detail; room air remains as a tail until the open environment is convincing.

Result: the listener crosses an acoustic threshold gradually. No moment should read as one audio file stopping and another starting.

### 6.4 Room → Light (`.90`)

- Do not crossfade between two complete room tracks. Keep the same room bed running.
- Preserve projector/fabric layers only while their sources remain plausible; adjust them gently rather than resetting.
- Raise exterior clarity from an already-audible leakage as `outsideConnection` grows around 46–96% of Light.
- The final state is a rebalance: slightly more outside definition, still anchored by interior air.
- Reverse simply restores the earlier inside/outside balance.

Result: the world has not changed; attention to the world has.

## 7. Recommended technical architecture

### 7.1 Web Audio API as the production mixer

Use Web Audio API for routing and gain control, while allowing `HTMLAudioElement` as a decoding/streaming source where useful:

```text
approved asset
  → HTMLAudioElement or AudioBufferSourceNode
  → per-layer GainNode
  → optional conservative filter / StereoPannerNode
  → ambience bus / detail bus
  → master GainNode
  → destination
```

Why: the production design needs click-free gain ramps, persistent sources across chapter boundaries, bus-level mute/focus behavior, and controlled overlapping layers. Independent `HTMLAudioElement.volume` can prototype this but is less suitable for precise scheduling and smooth multi-layer transitions.

- Use `GainNode` for every layer and the master.
- Use a small number of buses, not one graph per chapter.
- `StereoPannerNode` is optional for sparse near detail only. Do not continuously pan with camera motion in v0.1.
- Full `PannerNode` 3D spatialization is not needed unless later listening tests prove a specific diegetic source benefits; it can create headphone/speaker inconsistency and unnecessary CPU cost.
- Avoid convolution reverb initially. Prefer source recordings and edits that already embody the intended distance/space.
- Keep one AudioContext for the entire Experience lifetime, matching the persistent Canvas/director lifetime.

### 7.2 Integration with Phase 9.1 preheating

Code preparation and audio preparation are related but separate:

- Seed code remains requested immediately; audio must not fetch aggressively before consent unless policy and product choice allow it.
- After audio unlock, prepare the current chapter's P0 bed, then previous/next P0 beds during the existing adjacent-chapter idle window.
- Preload metadata or fetch/decode only the minimum adjacent assets. Do not instantiate audible nodes or start all chapter loops merely because modules are warm.
- Cache decoded short one-shots within a strict memory budget. Prefer streamed media elements for long beds on constrained devices.
- A chapter's visual `data-first-frame-ready` must not wait for optional audio. Audio readiness should be separately observable so a missing sound cannot block the picture.
- If the next bed is not ready at a boundary, retain and reshape the current continuity bed, then fade the next bed in when ready. Never insert silence as a loading indicator.

### 7.3 Mobile autoplay and interaction

- The initial state remains muted and does not call `play()` repeatedly before permission.
- SOUND ON is the explicit user gesture that creates/resumes AudioContext and starts the current mix.
- iOS/Safari behavior must be tested on real devices. Treat a rejected resume/play promise as locked state and leave UI truthful.
- On failed unlock, keep SOUND OFF or show a non-intrusive unavailable state; do not imply that sound is active.
- Do not bind unlock to passive scroll because it is inconsistent across browsers and surprises users.

### 7.4 Formats

- Production delivery: AAC-LC in `.m4a` plus Opus in `.webm` where the tested browser matrix justifies dual sources.
- Provide one broadly supported fallback when needed; do not ship uncompressed WAV to users.
- Source/master archive: 24-bit WAV, ideally 48 kHz, retained outside the web bundle.
- Web assets: 48 kHz stereo for spatial beds when stereo information matters; mono for truly point-like details. Avoid fake stereo.
- Create seamless loops with tested edit points and no DC offset/click. Loudness metadata alone is not a substitute for in-context gain matching.

## 8. Budgets and degradation

### 8.1 Simultaneous playback

| Device class | Target audible layers | Hard guidance |
| --- | ---: | --- |
| Desktop / capable mobile | 4–6 continuous layers plus at most 1–2 brief one-shots | Rare peaks may reach 7–8 nodes, but only after profiling |
| Low-power / data-conscious | 2–3 continuous layers plus 1 one-shot | Keep one bed, one relationship layer, and one essential contextual clue |
| Extreme fallback | 1 continuous bed | Preserve chapter-boundary continuity; omit details first |

Priority order is continuity bed → boundary-defining relationship → essential contextual source → decorative detail. No asset should be kept merely because a cue name exists.

### 8.2 Transfer and memory budget

Initial recommendations, to be validated against actual duration and codec tests:

- Do not fetch audio before explicit enable beyond negligible metadata.
- First SOUND ON current-world payload: target ≤ 600 KB; hard ceiling about 1 MB.
- Adjacent-chapter P0 preload: target ≤ 700 KB per adjacent chapter.
- Complete five-act compressed audio v0.1: target 3–5 MB; hard ceiling 6 MB.
- Individual long bed: normally 250–700 KB, approximately 45–90 seconds before a seamless loop depending on codec/bitrate.
- Individual one-shot: normally 15–120 KB.
- Decoded-buffer memory: target ≤ 16 MB on capable devices and ≤ 8 MB on low-power devices; stream long beds when decode cost exceeds this.

Suggested starting encodes: Opus around 64–96 kbps for stereo ambience and 40–64 kbps for mono/simple details; AAC around 96–128 kbps stereo and 64–96 kbps mono. These are audition points, not automatic settings: low-bitrate wind, leaves, water, and fabric can produce conspicuous artifacts.

### 8.3 Low-end adaptation

- Use the existing low-power signal only as a conservative hint; also respond to decode/playback failures and measured conditions.
- Drop `distant_nature`, secondary fabric detail, and redundant final layers before continuity beds.
- Prefer mono alternates or narrower mixes if provided; do not synthesize heavy real-time effects.
- Limit adjacent decoded cache to one next bed. Release non-adjacent buffers and media sources explicitly.
- Reduced motion does not automatically mean reduced audio. Keep sound behavior calm and independent unless the user mutes it.

## 9. Production asset brief

No item is approved for use until provenance, license, edit rights, attribution requirements, and project redistribution rights are recorded.

### P0 — continuity-critical

1. Seed dark environmental bed, neutral and non-musical.
2. Forest air/wind bed with natural internal variation.
3. Forest foliage layer suitable for near/mid relationship.
4. Tree `forest_pause` continuity stem or compatible alternate derived from the Forest family.
5. Neutral threshold/enclosed-air material that can bridge Tree into Room.
6. Room ambience with subtle exterior leakage and no identifiable venue chatter.
7. Outside-world layer compatible with the Room bed for the Light rebalance.

P0 recordings should be auditioned as families, not individually. Forest/Tree and Room/Light compatibility is more important than finding the most impressive isolated clip.

### P1 — narrative/material definition

1. Seed small soil contact variants.
2. Seed single water drop at believable macro scale.
3. Wet-soil absorption/material detail, only if naturally readable.
4. Sparse Forest far-habitat layer with no dominant species calls.
5. Small `wood_shift` forward/reverse-neutral variant family.
6. Distant transport presence with no close pass, horn, alarm, or dramatic acceleration.
7. Irregular subtle curtain/fabric movement.
8. Restrained projector/electrical hum without an intrusive tonal peak.

### P2 — optional after mix tests

1. Alternate bed segments to reduce loop recognition during very long pauses.
2. Mono/low-bandwidth alternates for constrained devices.
3. Additional sparse soil or leaf variants for threshold re-arming.
4. A separate `final_ambience` only if the Room + outside stems cannot achieve the final state through mixing.
5. Carefully chosen subtle building/exterior micro-detail, only if Room feels unnaturally empty in context.

## 10. Sounds that must not be added

- Emotional score, ambient music pad, piano, strings, drones with musical function, finale chord, or crescendo.
- Heartbeat, womb-like pulse, suspense sub-bass, “mystery” rumble, magical shimmer, awakening bloom, or fantasy growth sounds.
- Exaggerated seed impact, glossy water-drop logo sound, wet squelch, body-like organic effects.
- Birdsong compilation, dense dawn chorus, zoo-like species montage, tourism nature wall, or conspicuous looped calls.
- Axe, saw, chopping, tree-fall crash, construction montage, collision climax, or grief-signaling music.
- Close truck pass, horn, reversing alarm, engine rev, industrial spectacle, or transport used as menace.
- Café chatter, keyboard performance, notification sounds, page-turn literalism, vinyl crackle used as taste shorthand, or recording-studio dead silence.
- Light-switch click as climax, electrical power-up sweep, reveal whoosh, sparkle, applause, or end-card sound.
- Reverse-played impacts, drops, fabric, engines, or other obvious backward recordings during reverse scroll.
- Any unverified, unlicensed, attribution-incompatible, or AI-generated asset whose usage rights and provenance are not explicitly accepted.

## 11. Implementation map and acceptance criteria

No code change is required in Phase 10 v0.1. Existing cue names remain useful placeholders. Before production integration, consolidate duplicate chapter-local players behind the persistent director and add layer-level metadata only after assets have been auditioned.

Acceptance tests for the future integration phase:

1. Enable sound in the middle of every chapter: current ambience fades in correctly and no missed one-shot plays.
2. Pause for at least two minutes in every chapter: no obvious loop seam, repetition, or collapse into implausible silence.
3. Traverse all four boundaries slowly, quickly, and with jitter in both directions: no hard reset, gap, double trigger, or reverse playback.
4. Give Tree → Room extra headphone, laptop-speaker, and phone-speaker review; natural exterior must survive long enough for bounded room air to take over.
5. Room → Light must sound like one continuing room, not two similar files crossfading.
6. Mute/unmute repeatedly near boundaries; gains remain click-free and state resumes at the current world.
7. Hide and restore the tab in each chapter; no background playback, catch-up event, or sudden full-volume return.
8. Throttle network and deny one adjacent asset; picture readiness is unaffected and audio retains the previous continuity bed until safe handoff.
9. Verify SOUND is absent when all sources are null and truthful when unlock fails.
10. Profile node count, transfer, decoded memory, and CPU on representative desktop, iOS, Android, and low-power hardware.

## 12. Recommended next step after review

Proceed to a separate asset-audition phase, not direct integration:

1. Approve this sound script and decide the intended geographic/seasonal specificity of Forest and the exterior world.
2. Build a rights-tracked candidate sheet with 2–3 options per P0 family.
3. Audition P0 families against captured chapter video, focusing first on Forest → Tree, Tree → Room, and Room → Light compatibility.
4. Create a temporary offline five-act rough mix and validate pauses, reverse travel, and speaker translation.
5. Only after approval, define production config/types, encode selected derivatives, and integrate the persistent Web Audio director in a separately reviewed phase.

Until that review, source URLs remain null and no production audio is added to the repository.
