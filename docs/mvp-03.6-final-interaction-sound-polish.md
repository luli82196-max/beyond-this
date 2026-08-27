# MVP-03.6 — Final Interaction & Sound Polish

Date: 2026-08-27

Scope: final low-risk experience polish over the frozen five-act production visuals, Room content structure, Media Runtime ownership, and MVP-03.5 Forest mix. No new feature, dependency, architecture, work, or sound asset was added.

## Final changes

### Sound and performance

- F1 remains `0.16`, 78 seconds, with the existing 2-second loop crossfade.
- F2 remains `0.035`, 76.999 seconds, with the existing 3-second loop crossfade.
- The 180 ms runtime gain ramp and chapter-weight feathers remain unchanged. Production preview supplied no evidence that a gain, ramp, or crossfade change would improve the approved mix.
- Ambient players are now created only when sound is unlocked, unmuted, visible, and the relevant world target exceeds `0.001`. A fresh muted Seed load therefore makes no Forest audio request; F1/F2 are requested only after the user enables sound and enters the Forest feather.
- A regression assertion covers both the pre-unlock and unlocked-but-zero-world cases.
- Versioned `/audio/*` responses now receive `Cache-Control: public, max-age=31536000, immutable` on Vercel. The public manifest is not included in this immutable rule.
- Seed, Tree, Room, and Light remain intentionally silent. No Tree one-shot source was added.

### Interaction and mobile reachability

- Mobile top-control buttons now expose a minimum 44 × 44 px touch target with `touch-action: manipulation`; typography, visual weight, and placement remain unchanged.
- Room discovery copy, three surface labels, the 180 ms close guard, and boundary detent were retained after pointer, keyboard, touch-sized viewport, open/close, and return-focus checks showed no blocking or sticky behavior.
- Projection ownership and loading/fallback lifecycle were not rewritten. Its current identity-to-video damping, static fallback, visibility release/resume, and close/reopen behavior remained stable in preview and regression tests.
- Reduced-motion remains presentation-only and does not alter mute state or sound semantics.

## Five-act sound continuity

The runtime keeps one persistent owner for both Forest layers. Seed → Forest uses the existing chapter feather plus the 180 ms smoothing ramp; Forest → Tree follows the symmetric falling Forest weight and pauses only after volume is effectively zero. Tree → Room → Light remains silent without changing the user’s SOUND ON state. Reverse Light → Room → Tree → Forest → Seed follows the same envelopes. The prepared Tree event stays forward-only and is a no-op because its source remains `null`.

No master edit or gain changed in this pass, so the approved MVP-03.5 perceptual mix and decoded loop construction remain the listening baseline. Automation verifies ownership, request timing, envelopes, reverse behavior, cooldown, mute, and lifecycle; a calibrated listening environment is still required for a fresh subjective seam or loudness judgment.

## QA

| Check | Result |
| --- | --- |
| 1440 × 900 production preview | Pass: Seed, complete forward path, complete reverse path, SOUND ON/OFF, Room, and Projection states remained legible and unobstructed |
| 1920 × 1080 production preview | Pass: top controls and title composition remained inside the viewport and did not compete with the scene |
| 390 × 844 production preview | Pass: sound, Room entries, and close controls were reachable; Book touch open/close returned cleanly; sound remained enabled across navigation |
| Seed → Forest → Tree → Room → Light | Pass |
| Light → Room → Tree → Forest → Seed | Pass |
| Sound enable / mute / unmute | Pass; no audible autoplay request before explicit enable |
| Forest request and loop ownership | Pass: zero audio requests on fresh muted Seed; exactly the two approved Forest layers observed after enable/Forest entry; one persistent owner per layer |
| Hidden / resume | Pass in runtime automation; a trustworthy physical tab-background gesture is not available in the controlled browser |
| Room keyboard / touch / pointer | Pass; all three entries, close, focus return, and discovery dismissal remained coherent |
| Projection open / close / reopen | Pass in preview and regression; no duplicate active surface or stale ownership |
| Loading / fallback / visibility lifecycle | Pass in regression; no repeated instance or stale source |
| Console | 0 warnings, 0 errors in final preview checks |
| HTTP assets | Both Ogg files return 200 with `audio/ogg`; combined payload remains 3,070,780 bytes |
| TypeScript strict | Pass |
| Sound tests | Pass |
| Core / Room / Media / Projection regression | Pass: all 20 repository `*.test.ts` files |
| Vite production build | Pass: 136 modules; CSS 17.73 kB (4.56 kB gzip); main JS 1,077.92 kB (300.41 kB gzip) |

The existing Rollup warning for the minified main chunk above 500 kB remains. This pass added no dependency or large asset and did not introduce a material bundle increase; architectural code splitting is outside the frozen polish scope.

The local `pnpm` wrapper remains blocked by the machine dependency-build approval policy for `esbuild`. No approval or dependency state was changed. The repository's existing TypeScript, Vite, and Node executables ran the same strict, test, and build logic directly.

## Known limits

- Browser automation cannot replace subjective headphone/speaker listening. F1/F2 keep the user's existing listening approval and unchanged mix parameters.
- The controlled in-app browser cannot provide a trustworthy physical background/foreground gesture. Visibility pause/resume, single ownership, and Projection release/reprepare are covered by automated regression and should receive one deployed-device check.
- Vercel deployment readiness is separate from local build success. A Git push is sufficient to trigger the deployment prerequisite, but production is not called Ready without observing that state.
- Seed, Tree, Room, and Light remain intentionally silent; filling them is not part of MVP-03.6.

## Gate decision

MVP-03 Experience Polish v1.0 meets its implementation and local QA completion gate. The remaining limits are deployment/device sign-off items, not reasons to continue feature development. After the final commit is pushed and deployment is observed separately, the next product phase should be Final Presentation Package rather than another development MVP.
