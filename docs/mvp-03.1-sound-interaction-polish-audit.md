# MVP-03.1 — Sound & Interaction Polish Audit

Date: 2026-08-27  
Scope: audit only. No audio assets, dependencies, interaction systems, or production behavior were added.

## 1. Executive conclusion

MVP-02 Visual Reconstruction v1.0 has a coherent five-act visual path, but the current sound experience is intentionally silent and the Room interaction layer is more technically complete than perceptually discoverable.

The highest-value MVP-03 work is therefore not a new system or visual rebuild. It is a small interaction pass that makes the three Room surfaces understandable and consistent across pointer, touch, and keyboard; makes deep-content ownership visible; and removes lifecycle discontinuities around Projection and Room → Light. Production sound should remain gated on approved, locally available masters.

## 2. Prioritized current-experience issues

### P0 — blocks a truthful sound experience

1. **All declared audio sources are null.** Seed, Forest, Tree, Room, and Light contain cue registries and playback interfaces, but no playable source is connected. `audioAvailable` is therefore false and `SoundControl` renders nothing. The public experience is fully silent by design, not merely muted.
2. **The active director is only a chapter-weight prototype.** If files are attached, loop layers are created per chapter and their `HTMLAudioElement.volume` follows progress envelopes. It does not implement the production contract already described in Phase 10: persistent cross-chapter beds, time-smoothed gain, visibility/focus suspension, one-shot hysteresis/cooldowns, direction-aware events, or a true Room → Light shared bed.
3. **Legal masters are not present.** The asset ledger records candidates and access constraints, but not approved local masters ready for shipping. No sound should be fabricated or wired to remote candidate URLs.

### P1 — highest-value code-only interaction polish

1. **Room entry discoverability is implicit.** Book, Process, and Projection are transparent 3D hit areas. Pointer hover opens content immediately, but there is no persistent affordance, cursor change, focus ring, semantic label, or short first-entry hint tied to those surfaces. The existing poetic notes are `aria-hidden`, pointer-inert, progress-driven, and hidden on mobile.
2. **Keyboard selection is incomplete.** With no active surface, Enter/Space always opens Book. There is no keyboard route to select Process or Projection, no DOM focus targets for the three surfaces, and no announced active/deep state. Arrow keys only reach an already-active runtime; they do not navigate among Room surfaces.
3. **Hover and deep-open are conflated.** `onPointerEnter` calls each runtime's `open()`, so merely crossing a hit area can allocate/load/play Projection media. Pointer leave closes and releases it. This makes preview, commitment, and dismissal feel identical and can cause rapid media churn when the pointer crosses the projection edge.
4. **Touch has no explicit selected/open distinction.** Tap invokes the same `open()` path as hover. Once active, captured `touchmove` suppresses chapter scrolling until the surface is closed, but the scene does not provide an obvious touch close affordance. Escape works only for hardware keyboards.
5. **Input restoration is technically immediate but not communicated.** While a surface is active, wheel and touchmove are captured. Close/release restores chapter input by clearing `activeSurface`, yet there is no visible exit state, “continue scrolling” acknowledgement, or brief guard against the gesture that closes content also moving the chapter.

### P2 — continuity and finish

1. **Projection lifecycle can read as a discontinuity.** The video is correctly created only on open, muted, inline, looped, and released on close/switch/teardown. However, playback begins automatically as soon as ready, with no explicit loading/ready/play transition for the visitor. Repeated hover can repeatedly prepare and release the element. A blocked or failed play falls back safely, but the perceptual handoff can still feel abrupt.
2. **Chapter pacing is uniform at the input layer.** Wheel uses a constant multiplier, keyboard uses fixed progress jumps, and touch maps one viewport of travel directly to overall progress. Chapter ranges differ, but there are no threshold detents, velocity shaping, or deliberate dwell windows at the four transitions. Visual bridge opacity is narrow and progress-driven, so fast input can pass it quickly.
3. **Enter/leave feedback is mostly visual interpolation.** The controller records transition metadata, but scroll-driven chapter changes immediately resolve to the destination chapter. There is no interaction-level acknowledgement of direction, arrival, or pause beyond each chapter's visuals.
4. **Room → Light has visual closure but no interaction closure.** Scrolling can move directly out of Room whenever no deep surface is active. There is no final Room release cue, input softening, or persistent sonic bed; Light begins silently.
5. **Reduced-motion is sampled once per chapter mount.** Motion is correctly reduced in scene animation and CSS, and interaction semantics are intentionally unchanged. A preference change while mounted is not observed. Reduced motion also does not currently imply reduced scroll sensitivity or a clearer non-motion state transition.

## 3. Sound status: assets, silence, and interfaces

| Area | Current state | Audit judgement |
| --- | --- | --- |
| Seed cues | `ambient`, `soil`, `water`, `wet_soil`, `subtle_environment_change`; every `src` is null | Interface exists; silent; one-shot path is separate from the active director and is not currently integrated into the five-act runtime |
| Forest cues | `wind`, `leaves`, `distant_nature`; every `src` is null | Interface exists; silent |
| Tree cues | `wood_shift`, `distant_transport`, `forest_pause`; every `src` is null | Interface exists; silent |
| Room cues | `room_ambience`, `curtain_move`, `projector_hum`; every `src` is null | Interface exists; silent; cues are not yet driven independently by Room attention states |
| Light cues | `light_room`, `outside_world`, `final_ambience`; every `src` is null | Interface exists; silent; separate chapter sources would conflict with the desired shared Room bed unless reconciled |
| Global control | Starts muted; hidden when no source exists | Correct truthful degradation for the current asset state |
| Current director | Loop-only `HTMLAudioElement` layers with smooth progress weights | Useful prototype, not the Phase 10 production mixer |
| Asset research | Candidate ledger and sound-world design exist | Research is not equivalent to approved, downloaded, audited masters |

## 4. Interaction polish targets

### Five-act pacing

- Preserve the existing chapter ranges and visual timelines.
- Add small, reversible input easing zones around `.20`, `.45`, `.65`, and `.90` rather than scroll snapping.
- Give Tree → Room and Room → Light the longest perceptual dwell because they carry material/spatial continuity.
- Keep reverse travel symmetrical and avoid lockouts at boundaries.

### Room surface discovery

- Introduce one restrained first-arrival hint naming Book / Process / Projection; dismiss it after the visitor engages a surface.
- Separate `focus/preview` from `open/deep`: hover or keyboard focus should raise attention; click, tap, Enter, or Space should commit.
- Provide semantic DOM controls aligned with the three 3D surfaces, with labels, focus-visible styling, `aria-pressed` or expanded state, and predictable tab order.
- Use a subtle pointer cursor or local highlight only over actionable hit areas; do not turn the room into a conventional dashboard.

### Deep content ownership and exit

- While deep content is open, maintain current chapter-input suppression, but expose a restrained close action usable by pointer and touch as well as Escape.
- Announce the opened surface and the available exit method to assistive technology.
- On close, return focus to the surface that launched the content and restore scrolling after a one-frame or short gesture guard so the dismissal gesture cannot accidentally advance the chapter.
- Make Book, Process, and Projection mutually exclusive through one shared active-surface state instead of three scene-local close sequences.

### Projection lifecycle

- Prepare media only on committed open, not hover preview.
- Retain the existing on-demand ownership and release guarantees.
- Add a quiet loading state and a short opacity ramp when the first video frame is ready; use the existing still fallback on load/play failure.
- Pause/release on close, surface switch, Room teardown, and page visibility loss. Resume only after a valid user/session state.
- Keep Projection video muted; it is content media, not a substitute for the environmental sound system.

### Room → Light closure

- Close/release any deep Room surface before chapter departure and make the restored room state perceptible.
- Add slight input easing through the final Room zone, without forcing a stop.
- When licensed sound exists, keep the exact Room ambience instance alive into Light and rebalance the outside layer; do not restart a second room loop.

### Mobile, keyboard, and reduced motion

- Mobile: minimum reliable touch targets, explicit tap-to-open and tap-to-close, no hover dependency, and no permanent scroll trap.
- Keyboard: Tab selects all three surfaces; Enter/Space opens; arrows operate only inside the selected presentation; Escape closes and restores focus.
- Reduced motion: preserve all semantic states and content; replace camera/curtain/dust movement with opacity/material-state feedback; observe preference changes while mounted where practical.

## 5. Low-risk improvements that do not add a large system

### Pure-code work now

1. Add a shared Room active-surface state and distinguish preview/focus from committed deep open.
2. Add three accessible DOM interaction targets plus a restrained, one-time Room discovery hint.
3. Add an explicit close control and focus restoration; protect against close-gesture scroll leakage.
4. Move Projection prepare/load from pointer enter to committed open; add ready/fallback opacity treatment.
5. Add visibility-driven Projection pause/release and tests for hover, commit, close, switch, teardown, and restoration.
6. Add gentle boundary input easing/detents without changing chapter ranges or introducing snap scrolling.
7. Subscribe to reduced-motion preference changes and verify pointer, touch, keyboard, and reverse-scroll parity.
8. Add automated regressions for keyboard traversal, touch close, input suppression/restoration, and Room → Light teardown.

### Must wait for licensed/approved audio masters

1. Audible five-act ambience, Seed material one-shots, `wood_shift`, curtain movement, projector hum, and outside-world layers.
2. Loop editing, loudness matching, mono checks, artifact review, and attribution/change notices.
3. Perceptual tuning of actual crossfades, EQ/width changes, and device translation.
4. Final judgement of Tree → Room and Room → Light acoustic continuity.

### Code preparation allowed before masters, but validate only after assets arrive

- Define stable layer metadata, persistent bed ownership, visibility/focus handling, master unlock/mute ramps, and diagnostics for missing sources.
- Do not claim the production sound mix complete until approved masters are present and listened to in context.

## 6. Recommended MVP-03.2 implementation order

1. **Room interaction semantics:** shared active state; preview versus deep open; three accessible surface controls.
2. **Exit and input restoration:** close UI, Escape parity, focus return, touch/wheel guard, reverse-scroll regression.
3. **Projection continuity:** committed-load policy, ready fade, fallback state, visibility and teardown lifecycle tests.
4. **Discoverability and feedback:** one-time Room hint, local hover/focus treatment, active/deep acknowledgement.
5. **Five-act pacing:** conservative boundary easing, with emphasis on Tree → Room and Room → Light; validate desktop, mobile, keyboard, and reduced motion.
6. **Audio architecture preparation:** only the minimal persistent-layer/unlock/visibility foundation that can be tested without inventing content.
7. **Licensed sound integration:** after masters and rights records are available, implement and audition Seed → Forest → Tree → Room → Light continuity, then tune on calibrated desktop, iPhone Safari, and Android Chrome.

## 7. Acceptance boundary for MVP-03.2

MVP-03.2 should be considered successful when every Room surface is discoverable and operable by pointer, touch, and keyboard; deep content cannot trap or leak input; Projection media has a calm and deterministic lifecycle; reduced-motion preserves meaning; and Room → Light closes cleanly. Sound completion remains a separate gate requiring approved local audio masters and real-device listening.
