# Phase MVP-01.6.2 — Device & Final Motion QA v0.1

Date: 2026-08-25

## Release decision

**Conditional Public Release Candidate.** Desktop and responsive-browser release gates pass. Public release to physical mobile devices remains blocked until the manual iOS Safari, Android Chrome, and authored Motion checks below are completed on target hardware.

This phase freezes Content, Presentation, Interaction, and Media Runtime architecture. Seed, Forest, Tree, and Light narrative behavior was not changed. No new work, media system, or system layer was introduced.

## Automated and browser QA results

| Area | Status | Evidence |
| --- | --- | --- |
| TypeScript strict | passed | `tsc -b` completed without errors. |
| Production build | passed | Vite production build completed; generated `dist`. |
| Full regression | passed | All 19 `*.test.ts` files passed. |
| Desktop first frame | passed | 1280×720: one WebGL canvas, Seed first-frame-ready, zero browser warnings/errors. |
| Responsive first frame | passed | 390×844: one WebGL canvas, first-frame-ready, no horizontal overflow, zero browser warnings/errors. |
| Safe-area contract | passed | `viewport-fit=cover` and `env(safe-area-inset-*)` placement are present for mobile controls, titles, and the continue action. Physical notch/dynamic-island inspection remains manual required. |
| Reduced-motion semantics | passed | Regression confirms identical semantic input mapping; CSS removes grain/breathe animation and near-eliminates transitions; scene motion and DPR are reduced by the runtime capability query. |
| OS reduced-motion setting | manual required | Recheck with Reduce Motion enabled on physical iOS and Remove animations/Reduce motion enabled on Android. |

## Physical device contract

Record device model, OS/browser version, orientation, power mode, network profile, result, and notes for every run. A manual item must not be promoted to passed without a physical-device observation.

### iOS Safari

- [ ] manual required — Cold launch reaches Seed without a persistent black frame or WebGL error.
- [ ] manual required — Complete Seed → Forest → Tree → Room → Book → Process → Projection → Room → Light using touch only.
- [ ] manual required — Projection begins muted inline playback after the explicit tap; no fullscreen player opens and autoplay rejection retains the static fallback.
- [ ] manual required — Portrait and landscape controls/titles clear the notch, Dynamic Island, home indicator, and browser chrome.
- [ ] manual required — Touch move is held while Room content is open and chapter navigation resumes after close.
- [ ] manual required — Background for 10 seconds and return; the page remains usable, Projection does not duplicate audio/video ownership, and reopening creates one clean playback cycle.
- [ ] manual required — Reload and Safari back/forward restore a usable page without stale Room content.
- [ ] manual required — Force a WebGL context loss/reload scenario where practical and confirm recovery through reload.

### Android Chrome

- [ ] manual required — Cold launch and first WebGL frame complete without a persistent black frame.
- [ ] manual required — Complete the full chapter and Room-content path using touch only.
- [ ] manual required — Muted inline Projection playback succeeds after tap; fallback remains legible if playback is rejected.
- [ ] manual required — Repeated Projection open/close (10 cycles) does not create overlapping playback or steadily increasing retained media elements.
- [ ] manual required — Background/foreground and browser back/forward leave the page usable; reopening Projection creates one clean ownership cycle.
- [ ] manual required — Run Room/Projection continuously for 10 minutes and record sustained frame rate, thermal behavior, and any GPU reset.

### Low-performance device

- [ ] manual required — Record navigation start to first meaningful Seed frame and first ready WebGL frame on a throttled or entry-level device.
- [ ] manual required — Confirm no persistent black screen during WebGL initialization.
- [ ] manual required — Confirm mobile DPR remains within 1.0–1.3; reduced-motion or low-concurrency mode remains within 1.0–1.15.
- [ ] manual required — Observe Room and Projection for visible stutter, thermal throttling, context loss, and memory pressure.

## Final Motion review

| Check | Status | Result |
| --- | --- | --- |
| Projection remains spatial | passed | It stays on the wall plane with no player controls. Surface opacity is 0.46–0.74, with restrained spill light (maximum intensity 0.24), so the existing presentation remains subordinate to the Room. |
| Room dusk continuity | passed | Projection uses transparency over the existing dusk room rather than replacing the Room composition; closing releases the surface and returns to the unchanged Room state. |
| Playback behavior | passed | Video is created only on deep Projection entry, muted, inline, looping, and metadata-preloaded. Load/play rejection retains the identity fallback. Close, surface switch, and Room teardown release it. |
| Eight-second loop edit | manual required | Review the authored first/last frames and the perceived cut on a color-managed display. Current runtime intentionally adds no fade or edit-hiding effect. |
| Final brightness/color | manual required | Review the actual decoded MP4 inside Room on a calibrated/representative display and on physical iOS/Android. Do not tune opacity from the standalone asset alone. |
| “Projection, not player” on device | manual required | Confirm inline playback and spatial reading on physical Safari and Chrome, including browser UI changes and orientation rotation. |

No Motion parameter was changed in this phase because the available evidence did not establish a visual defect. Any later adjustment must be limited to Projection opacity/spill, authored loop treatment, or playback fallback behavior.

## Performance recheck

- Main entry: 1,072.69 kB, gzip 298.38 kB.
- Room chunk: 42.82 kB, gzip 13.89 kB.
- Projection MP4: 1,612,523 bytes (about 1.54 MiB / 1.61 MB).
- Projection media remains absent from first paint and is created only on deep entry with `preload="metadata"`.
- Release pauses playback, removes listeners and `src`, calls `load()`, and drops the element reference.
- Projection `VideoTexture`, Book/Process textures, Room wood/wall/paper procedural textures, and local visual textures have explicit disposal paths.
- DPR remains capped at 1.5 desktop, 1.3 mobile, and 1.15 for reduced-motion or low-concurrency devices.
- The Vite 500 kB chunk warning remains deferred. Artificial vendor splitting is outside this risk-only phase because it would change request topology without reducing transferred application code.

## Risk register

### Passed

- TypeScript strict, production build, and 19-file regression suite.
- Desktop and responsive-browser WebGL first frame.
- Responsive viewport sizing, no horizontal overflow, and safe-area implementation contract.
- Reduced-motion semantic equivalence and static fallback path.
- On-demand media ownership and explicit media/GPU cleanup contracts.
- Projection remains visually embedded in Room by implementation review.

### Failed

- None observed in the available desktop/responsive environment.

### Manual required — release blockers

- Physical iOS Safari autoplay/inline playback, safe area, touch, background recovery, heat, sustained frame rate, and WebGL recovery.
- Physical Android Chrome playback, repeated ownership cycles, background/back-forward recovery, memory pressure, heat, sustained frame rate, and GPU stability.
- OS-level reduced-motion verification on both platforms.
- Authored eight-second loop seam and final Motion brightness/color review on representative displays.

### Deferred — non-blocking for the conditional candidate

- Vite main-chunk warning and any larger code-splitting strategy.
- Book long-form mobile reading improvements.
- New sound, loading, SEO/share packaging, other works, or any architectural expansion.

## Public Release Candidate threshold

The build reaches the **conditional Public Release Candidate** threshold for desktop and responsive preview. It does **not** reach unconditional physical-mobile public release readiness until every release-blocking manual item is executed and no failed result remains. A physical-device failure should reopen only the smallest affected Projection visual/playback, safe-area, input, or capability rule; architecture remains frozen.
