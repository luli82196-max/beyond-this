# Phase MVP-01.9.1 — Final Visual & Device Sign-off v0.1

Date: 2026-08-25

## Review boundary

- Seed / Forest / Tree / Room / Light artistic logic, BT-P03 structure, Media Runtime, Motion media, and work architecture remain unchanged.
- This pass records release evidence and does not treat an emulated viewport as a physical-device pass.
- No clear release-blocking implementation defect was established, so no code or media was changed.

## Status legend

- **passed** — repository or browser evidence is sufficient for this gate.
- **manual required** — a person must verify on the named device/display or deployed origin.
- **blocked** — required launch input or approval is absent.
- **deferred** — intentionally outside the launch gate unless target-device evidence makes it blocking.

## Final visual review

| Area | Status | Evidence and decision |
| --- | --- | --- |
| Home, 1440×900 | passed | Running WebGL first frame reviewed. Title, bilingual positioning, entry instruction, negative space, and opening control remain legible without collision or crop. |
| Home, 390×844 responsive viewport | passed | Portrait composition, wrapping, controls, and safe-area-aware offsets render without visible crop. This is responsive evidence only, not iPhone/Android sign-off. |
| Room spatial relationship | passed | Running Room frame reviewed after first-frame readiness. Window, wall projection, Book, Process interface, and foreground furniture remain one room rather than a menu layout. |
| Book / Process / Projection balance | passed | The three surfaces occupy distinct left/center/right and foreground/wall depth zones. Their attention notes remain subordinate and are intentionally hidden at the mobile breakpoint. |
| Projection spatial character | passed | Projection remains a wall-bound, low-opacity image with room light/spill and no player chrome. Media playback failure retains the authored identity surface. |
| Light ending | passed | Settled Light frame preserves Room continuity, clarifies the existing objects, and places the completion/About block quietly at the lower right without adding a reward-like object. |
| Desktop 1920×1080 final capture | manual required | Capture and compare on the approved display before producing release screenshots. |

Browser review produced no console error or warning at the reviewed desktop and portrait states. Temporary loading frames were not treated as final composition evidence; review was repeated after `data-first-frame-ready=true`.

## Device QA contract

### iPhone Safari — manual required

- [ ] Cold load initializes WebGL or shows the intentional fallback without a blank screen.
- [ ] Touch travel works in both directions; opening a Room surface holds chapter travel and closing restores it.
- [ ] Projection begins muted inline playback after explicit interaction; no fullscreen player opens. Rejection retains the static identity surface.
- [ ] Top, side, and bottom controls respect notch/home-indicator safe areas in portrait.
- [ ] Background for 30 seconds, resume, and complete the experience without a stale canvas or stuck video.
- [ ] Revisit/close Projection and leave Room; verify playback stops and memory does not grow continuously.
- [ ] Trigger WebGL context loss/recovery where practical, or record the device limitation.

### Android Chrome — manual required

- [ ] Cold load initializes WebGL or shows the intentional fallback without a blank screen.
- [ ] Touch travel and Room surface gestures do not scroll the browser page or become trapped.
- [ ] Muted inline Projection playback starts after explicit interaction; fallback remains usable after rejection.
- [ ] Resume after tab/background switch without stale canvas, duplicated audio/video, or lost touch input.
- [ ] Complete two full forward/backward passes and check sustained frame rate, heat, memory pressure, and media release.

### Desktop Chrome / Edge — manual required

- [x] Chromium-class local browser pass at 1440×900: WebGL initialization, chapter travel, Room and Light rendering, and console state reviewed.
- [ ] Physical Chrome pass at 1920×1080 and 1440×900, including keyboard-only, focus visibility, reduced motion, WebGL fallback, page hide/resume, and repeat traversal.
- [ ] Physical Edge pass using the production build and final deployed origin.

The CSS uses `viewport-fit=cover`, `100dvh`, and `env(safe-area-inset-*)` at the mobile breakpoint. These implementation checks support, but do not replace, physical-device observation.

## Motion sign-off

| Check | Status | Evidence and decision |
| --- | --- | --- |
| Runtime ownership | passed | Projection uses one muted, inline, looping video, loads on deep entry, and releases playback/source/listeners when closed or unmounted. |
| Eight-second loop seam | manual required | Earlier runtime observation found no flash, layout jump, or reset, but the authored cut remains perceptible by design. First/last-frame and perceived-cut approval is still required on the approved display. |
| Final brightness and color | manual required | Review the Motion against Room dusk on a color-managed representative display. Browser evidence does not establish a grading defect. |
| Room dusk continuity | passed | The current Projection opacity, wall placement, and spill retain Room rather than presenting a detached player. |
| Asset-level modification | deferred | No clear defect was established. Do not alter, re-encode, fade, or replace Motion until visual sign-off identifies a specific seam or grading problem. |

## Release assets

| Asset | Status | Required action |
| --- | --- | --- |
| Favicon package | blocked | Supply and approve the real favicon package, then add references and rebuild. |
| 1200×630 OG image | blocked | Produce from a signed-off native capture, approve it, host it at the final HTTPS origin, and add absolute `og:image`. |
| Stable origin / canonical / `og:url` | blocked | Confirm the production HTTPS origin first; then add matching canonical and `og:url` values. No placeholder is permitted. |
| Screenshot specification | passed | The six-surface, viewport, naming, color, and acceptance contract remains complete in `screenshot-demo-asset-contract-mvp-01.8.md`. |
| Final screenshots | blocked | Capture only after device and Motion/color sign-off. |
| Demo specifications | passed | The 30-second and three-minute routes, formats, audio, performance, and privacy constraints are defined. |
| Final demo videos | blocked | Record only from the signed-off production build. |
| Approved author credit | blocked | `src/publication.ts` correctly keeps identity null; provide an approved public credit for the intended launch surface. Optional résumé/portfolio/contact links may remain null. |

## Automated validation

| Check | Status | Result |
| --- | --- | --- |
| TypeScript strict | passed | `tsc -b` completed with no errors. |
| Vite production build | passed | 135 modules transformed; `dist` regenerated. Main entry 1,073.52 kB / 298.90 kB gzip; Room chunk 42.82 kB / 13.89 kB gzip. |
| Full regression | passed | 19/19 unique test files passed. |
| Projection media copy | passed | The 1,612,523-byte MP4 exists in both `public/media` and `dist/media` at the required root-relative path. |

The existing main-entry warning above 500 kB remains deferred unless physical-device evidence shows a launch-blocking load, memory, or frame-time failure.

## Release decision

**Final Release Candidate: retained.**

**Public Launch Approved: no.**

No confirmed code defect blocks this review, but public launch remains blocked by physical iPhone Safari, Android Chrome, and desktop Chrome/Edge sign-off; Motion seam and final color approval; a stable production origin and routing verification; approved author/favicon/OG assets; and final screenshots/demo recordings. Once those manual and asset gates are completed, rerun the automated validation against the exact release commit and deployed origin before changing the decision to approved.
