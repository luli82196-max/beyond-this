# Phase MVP-01.12.1 — Real Deployment Verification & Launch Evidence v0.1

Date: 2026-08-25

## Scope and release decision

- Seed / Forest / Tree / Room / Light remain frozen.
- BT-P03 Book / Process / Projection and Media Runtime remain frozen.
- No work, architecture, dependency, visual, media, provider result, domain, device result, or audience result is added or inferred by this phase.
- This document is the single evidence record for the exact production candidate. Checkboxes remain open until a real operator attaches evidence from the identified deployment.

**Candidate state: Final Release Candidate — Launch Evidence Ready.**

**Public Launch Approved: no.**

Reason: the local release candidate can be validated, but no real deployment, production-origin, physical-device, Motion, metadata-asset, or audience evidence has been supplied.

## 1. Release and deployment identity

Complete this block immediately after deploying. Do not use a preview URL or a mutable branch name as release identity.

| Field | Required value | Recorded value |
| --- | --- | --- |
| Version | Immutable release version | `1.0.0` |
| Production URL | Stable HTTPS root, including trailing slash policy | Pending real deployment |
| Platform | Provider and product/tier when relevant | Pending selection |
| Deployment ID | Provider-issued immutable deployment identifier | Pending real deployment |
| Build commit | Full commit SHA, or immutable package identifier if no VCS is used | Pending immutable identifier |
| Artifact fingerprint | SHA-256 of an archived release package or manifest | Pending release packaging |
| Deployment time | ISO 8601 timestamp with timezone; prefer UTC | Pending real deployment |
| Deployment operator | Confirmed person/role | Pending assignment |
| Verification owner | Confirmed person/role | Pending assignment |
| Rollback owner | Confirmed person/role | Pending assignment |
| Previous validated target | Deployment/artifact identifier | Pending first deployment policy |
| Environment notes | DNS, root deployment, CDN region/plan, config deviations | Pending platform configuration |

### Environment notes

```text
Production origin:
DNS/certificate:
Platform/project:
Root/base path:
SPA rewrite rule and exclusions:
Cache policy:
Security headers:
Deployment/config deviations:
```

### Evidence conventions

- Every check records `Pass`, `Fail`, `Blocked`, or `Not run`; an empty checkbox never means pass.
- Evidence must identify the production URL, deployment ID, tester, timestamp/timezone, device/browser, and cold/warm cache condition when relevant.
- Store screenshots, videos, exported headers, console/network captures, and audience notes in a durable release folder. Link them from the tables below.
- A fix that changes source or built bytes creates a new candidate: rebuild, redeploy, update identifiers, and rerun affected checks.

## 2. Production verification checklist

### A. Origin, delivery, routing, and metadata

| ID | Verification | Expected result | Status | Evidence / issue |
| --- | --- | --- | --- | --- |
| P-01 | Open the production root over HTTP | Redirects to the approved HTTPS root; valid certificate; no mixed content | Not run | Pending production URL |
| P-02 | Cold-load `/` | App shell and first composition load; no blocking console/network error | Not run | Pending production deployment |
| P-03 | Warm-load `/` and reload after a new deployment | Current HTML revalidates; hashed assets remain safely cacheable | Not run | Pending production deployment |
| P-04 | Inspect representative JS and CSS | Correct MIME; hashed assets use the approved long-lived immutable cache policy | Not run | Pending response headers |
| P-05 | Navigate directly to a non-file application path | Rewrites to `index.html` only where application fallback is intended | Not run | Pending platform rewrite |
| P-06 | Request missing `/assets/does-not-exist.js` | Real 404; does not return HTML with status 200 | Not run | Pending platform rewrite |
| P-07 | Request missing `/media/does-not-exist.mp4` | Real 404; does not return HTML with status 200 | Not run | Pending platform rewrite |
| P-08 | Inspect security headers | Confirmed release policy; headers do not block scripts, local media, WebGL, or required resources | Not run | Pending production headers |
| P-09 | Inspect canonical, `og:url`, favicon, OG image, and author identity | Only approved values/assets are enabled; otherwise they remain absent | Not run | Metadata final gate below |

### B. Homepage and five-act experience

| ID | Verification | Expected result | Status | Evidence / issue |
| --- | --- | --- | --- | --- |
| E-01 | Cold-load homepage | Loading state, initial composition, first light, input hint, and first interaction are intact | Not run | Pending production deployment |
| E-02 | Complete Seed → Forest → Tree → Room → Light | Continuous path, transitions, inputs, and ending remain reachable | Not run | Pending production deployment |
| E-03 | Resize/orientation and background/resume | No unrecoverable blank state, input trap, or broken composition | Not run | Pending production/device QA |
| E-04 | Keyboard and reduced-motion run | Intended keyboard path, focus visibility, and reduced-motion behavior work | Not run | Pending desktop QA |
| E-05 | Repeat from warm cache | Experience remains complete and uses current release bytes | Not run | Pending production deployment |

### C. Room, Projection, and media lifecycle

| ID | Verification | Expected result | Status | Evidence / issue |
| --- | --- | --- | --- | --- |
| R-01 | Open/close Book | Entry, presentation, focus, close/Escape, and return to Room work | Not run | Pending production deployment |
| R-02 | Open/close Process | Entry, presentation, focus, close/Escape, and return to Room work | Not run | Pending production deployment |
| R-03 | Open/close Projection | Entry, playback surface, focus, close/Escape, and return to Room work | Not run | Pending production deployment |
| R-04 | Use Book → Process → Projection in sequence | Surface switching leaves no stale focus, input lock, or media state | Not run | Pending production deployment |
| M-01 | Full MP4 request | `/media/after_the_second_sunset_motion_blocking_v01.mp4` returns `200`, `video/mp4`, and expected bytes | Not run | Pending production response |
| M-02 | MP4 range request | Valid byte range returns `206`, correct `Content-Range`, and usable seeking | Not run | Pending production response |
| M-03 | Projection playback lifecycle | Playback starts by intended gesture policy, loops, closes/releases, and reopens cleanly | Not run | Pending production/device QA |
| M-04 | Background/resume and repeated open/close | Playback and UI recover without duplicate audio/video, stale frame, or resource leak symptom | Not run | Pending production/device QA |
| M-05 | Motion sign-off | Eight-second seam, final brightness, and color are approved on the production asset | Not run | Pending visual approver |

### D. WebGL loss, fallback, and recovery

| ID | Verification | Expected result | Status | Evidence / issue |
| --- | --- | --- | --- | --- |
| W-01 | Controlled context loss on production or byte-identical production-equivalent build | No unexplained blank screen or input trap; signed-off fallback/recovery appears | Not run | Pending browser/GPU evidence |
| W-02 | Restore context where supported | Experience recovers according to the current design without a release-build debug hook | Not run | Pending browser/GPU evidence |
| W-03 | Refresh after loss | Clean start and usable fallback/experience; console evidence retained | Not run | Pending browser/GPU evidence |

## 3. Device QA evidence

Run on physical phones. Desktop emulation may supplement evidence but cannot replace it.

| Run ID | Required target | Device / hardware | OS | Browser + version | Viewport / orientation | Network | Cache | Deployment ID | Status | Evidence / issues | Tester / time |
| --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- |
| D-IOS-01 | iPhone Safari | Pending | Pending iOS | Pending Safari | Portrait + landscape as applicable | Pending | Cold + warm | Pending | Not run | Touch, gesture media policy, resize, memory pressure, background/resume, WebGL fallback | Pending |
| D-AND-01 | Android Chrome | Pending | Pending Android | Pending Chrome | Portrait + landscape as applicable | Pending | Cold + warm | Pending | Not run | Touch, representative GPU/performance, memory pressure, background/resume, WebGL fallback | Pending |
| D-CHR-01 | Desktop Chrome | Pending desktop/GPU | Pending OS | Pending Chrome | 1920×1080 and 1440×900 | Pending | Cold + warm | Pending | Not run | Full flow, keyboard, reduced motion, media, console/network | Pending |
| D-EDG-01 | Desktop Edge | Pending desktop/GPU | Pending OS | Pending Edge | 1920×1080 and 1440×900 | Pending | Cold + warm | Pending | Not run | Full flow, keyboard, reduced motion, media, console/network | Pending |

For every device run, attach at minimum: homepage, Room, Projection, and Light captures; a complete-flow result; console/network evidence where tooling permits; each issue ID and disposition.

## 4. Release evidence package

### Required v1.0 evidence inventory

| Package item | Required content | State | Durable location |
| --- | --- | --- | --- |
| Release identity | Version, production URL, deployment ID, immutable source/package identifier, artifact fingerprint, deployment time | Pending | Pending |
| Local validation logs | TypeScript strict, production build, all regression gates, `dist` inventory, media size/hash | Passed and refreshed on 2026-08-25; summary below | `dist/` and `work/` local outputs; durable release archive still pending |
| Production delivery | Root, JS/CSS, MP4 full/range, SPA fallback, missing-static 404, cache and security headers | Pending real deployment | Pending |
| Experience QA | Homepage, five acts, Room three entries, Projection lifecycle | Pending real deployment | Pending |
| Device QA | iPhone Safari, Android Chrome, desktop Chrome and Edge | Pending physical/desktop runs | Pending |
| Resilience QA | WebGL loss/fallback/recovery and background/resume | Pending real test | Pending |
| Visual sign-off | Motion eight-second seam, brightness, color; six final screenshots | Pending approval/assets | Pending |
| Presentation evidence | 30-second demo and three-minute walkthrough from the approved deployment | Pending capture | Pending |
| Audience evidence | Small real-audience run, observations, blockers, disposition | Pending real audience | Pending |
| Approval record | Approver, decision, timestamp/timezone, accepted limitations | Pending all blocking evidence | Pending |

### Known limitations register

Record only observed, reproducible behavior. Enhancement requests are not automatically limitations.

| ID | Environment | Reproduction / evidence | User impact | Accepted mitigation | Owner | Approver | Decision |
| --- | --- | --- | --- | --- | --- | --- | --- | --- |
| None recorded | — | No production/device observations supplied yet | — | — | — | — | Pending evidence |

The existing Vite main-entry size warning is a previously deferred engineering warning, not by itself a newly observed production limitation. Do not use this register to silently accept launch-blocking failures.

### Rollback record

```text
Rollback trigger/incident ID:
Failing production deployment ID:
Last validated deployment/artifact ID:
Rollback owner:
Provider procedure or runbook link:
Configuration/data implications:
Rollback started at (timezone):
Rollback completed at (timezone):
Post-rollback smoke result and evidence:
Audience/status communication owner:
```

Rollback is required for an unresolved launch-blocking failure in origin delivery, required assets/media, complete navigation, Projection lifecycle, required-device usability, WebGL fallback, metadata identity, or release traceability. Do not hot-patch the frozen artistic runtime; a source-byte change creates a new candidate.

### Post-launch monitoring record

| Window | Owner | Checks | Result | Evidence / issue |
| --- | --- | --- | --- | --- |
| Launch + 0–1 hour | Pending | HTTPS/root availability, JS/CSS/MP4 errors, range/seeking, console-blocking failures, CDN propagation | Not scheduled | Pending launch |
| Launch + 24 hours | Pending | Availability, cache/revalidation, media failures, device reports, audience blockers | Not scheduled | Pending launch |
| Launch + 7 days | Pending | Recurring errors, accepted limitations, audience findings, rollback readiness, v1.1 candidates | Not scheduled | Pending launch |

Record monitoring source and observation method. Absence of analytics is not evidence of absence; direct smoke runs remain required. Privacy-respecting monitoring must be approved before any service is added, and this phase adds no monitoring dependency.

## 5. Metadata final gate

| Item | Current source state | Exact activation gate | Evidence required before approval |
| --- | --- | --- | --- |
| Canonical | Disabled / absent | Stable approved HTTPS root is deployed; exact root/trailing-slash policy is final | Live HTML and canonical target response |
| `og:url` | Disabled / absent | Same approved absolute URL as canonical | Live HTML and share-debugger/crawler evidence |
| Favicon | Disabled / absent | Approved asset package, filenames, sizes, and MIME exist | Live icon responses plus browser capture |
| OG image | Disabled / absent | Approved 1200×630 image exists at a stable absolute HTTPS URL with correct image MIME | Live image response plus share preview evidence |
| Author identity and public links | Intentionally `null` in `src/publication.ts` | Exact credit and destinations receive approval | Live UI/metadata review, or explicit decision to omit |

No eligible domain, favicon, OG image, or author identity was supplied for this phase, so all entries must remain disabled. Enabling any item changes source/build output and requires a new build, deployment, and affected verification rerun.

## 6. Local automated validation

These checks validate the local candidate only. They do not satisfy any real deployment, device, Motion, metadata-asset, or audience gate.

| Check | Status | Result |
| --- | --- | --- |
| TypeScript strict | Passed | `tsc -b` completed with no errors. |
| Vite production build | Passed | 135 modules transformed; `dist/` regenerated. Main entry: 1,073.52 kB (gzip 298.90 kB). Room chunk: 42.82 kB (gzip 13.89 kB). |
| Full regression | Passed | All 20 configured test-file/script gates passed, including Book, Process, Projection, complete Room, and Media Runtime coverage. |
| Projection media copy | Passed | `public` and `dist` MP4 files are both 1,612,523 bytes with SHA-256 `79F9CAD70BA4489CF3166F2B131A0F8163195BEDCDA4CD449315E8CEFDF226A3`. |
| Metadata disabled state | Passed | Canonical, `og:url`, `og:image`, and favicon references remain absent from source and built HTML. |

The existing Vite warning for the main entry exceeding 500 kB remains deferred under the frozen architecture boundary. This phase does not authorize code splitting or another loading/architecture change.

## 7. Approval gate

Public Launch Approved may be set to `yes` only when:

- the exact deployment is tied to immutable source/package and artifact identifiers;
- every launch-blocking production, experience, media, device, WebGL, Motion, and metadata check is passed with durable evidence;
- failures are fixed and retested or explicitly accepted only when non-blocking;
- rollback ownership/procedure and post-launch monitoring are ready;
- real-audience blockers are resolved or correctly dispositioned;
- the final approver records name/role and an approval timestamp.

```text
Decision: Public Launch Approved — NO
Reason: Required real deployment and launch evidence is pending.
Approver: Pending
Decision time and timezone: Pending
Evidence package location: Pending
```

## 8. Current remaining blockers

- Stable HTTPS production URL, selected platform, DNS/certificate, deployment ID, immutable build identifier, owners, and environment notes.
- Production rewrite, missing-static 404, MIME, MP4 Range, cache, propagation, and security-header evidence.
- Homepage, full five-act, Room/Projection, media lifecycle, reduced-motion, background/resume, and WebGL loss/fallback evidence.
- Physical iPhone Safari and Android Chrome runs; desktop Chrome and Edge runs.
- Motion eight-second seam, brightness, and color sign-off.
- Approved canonical/`og:url`, author decision, favicon, and 1200×630 OG image, or an explicit launch decision to omit optional metadata where allowed.
- Final screenshots, two demo videos, audience record, known-limitations disposition, rollback target/procedure, monitoring owners, and final approval.

Until this evidence exists, the correct release decision remains **Public Launch Approved: no**.
