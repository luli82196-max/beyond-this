# Phase MVP-01.11 — Production Deployment & Real Audience Gate v0.1

Date: 2026-08-25

## Scope and decision

- Seed / Forest / Tree / Room / Light remain frozen.
- BT-P03 Book / Process / Projection and Media Runtime remain frozen.
- No work, system, dependency, artwork, identity, domain, or provider result was added or invented.
- This phase makes the production contract executable and records the acceptance procedure. It cannot claim deployed-origin or real-device evidence until those checks happen.

**Candidate state: Final Release Candidate — Production Contract Ready.**

**Public Launch Approved: no.**

## 1. Production deployment contract

### Recommended configuration

Use a static host/CDN that supports all requirements below. A root-domain deployment on Cloudflare Pages, Vercel, or Netlify is a suitable configuration class, but no provider is selected or validated by this repository.

| Concern | Required production behavior |
| --- | --- |
| Artifact | Deploy only the freshly validated contents of `dist/`; do not serve source files or `work/`. Preserve an immutable copy of the deployed artifact for rollback. |
| Origin | Serve from the root of one stable HTTPS origin. HTTP must redirect to HTTPS without mixed content. Preview/branch URLs are not canonical. |
| Base path | The current Vite default base and root-relative media URL require `/`. Subpath deployment such as `/beyond-this/` is unsupported without a separate code/configuration change and full regression. |
| SPA rewrite | `/` serves `index.html`. A route that is not a real file may rewrite to `/index.html`. Requests under `/assets/*` and `/media/*` must never be rewritten to HTML; missing files must return 404. |
| Static paths | Hashed build output is served at `/assets/*`. Projection media is served at `/media/after_the_second_sunset_motion_blocking_v01.mp4`. Filenames and case must be preserved. |
| MIME and range | HTML: `text/html`; CSS: `text/css`; JavaScript: a valid JavaScript MIME; MP4: `video/mp4`. The MP4 must support byte ranges: a valid `Range: bytes=...` request returns `206`, a correct `Content-Range`, and `Accept-Ranges: bytes` or equivalent confirmed seeking behavior. |
| Cache | Hashed `/assets/*`: `public, max-age=31536000, immutable`. `index.html`: revalidate (`no-cache` or short TTL with revalidation). MP4: cacheable with a deliberate release TTL; do not use `immutable` unless its URL changes when the bytes change. Purge/invalidate HTML and changed non-hashed media during release. |
| Security | Enable HSTS only after HTTPS is proven. Use `nosniff`, a conservative referrer policy, and clickjacking protection appropriate to the intended embedding policy. A CSP must be tested against the exact build and must not block its scripts, local media, blob/data resources actually used, WebGL, or workers. |
| Delivery | Compression may be enabled for text assets. Do not transform the MP4 in a way that breaks range requests. CDN error pages must not replace valid SPA/static responses. |

### Reference rewrite logic

The provider configuration must express this order:

1. serve an existing file from `dist`;
2. return a real 404 for missing `/assets/*` or `/media/*` requests;
3. rewrite only remaining application navigation requests to `/index.html`.

Do not commit a provider-specific file until the platform is selected. A generic rewrite that maps every 404 to HTML is not acceptable because it can hide missing JavaScript or media behind a 200 HTML response.

## 2. Production environment checklist

### Before deployment

- [ ] Confirm stable production origin, DNS ownership, provider, deployment owner, and rollback owner.
- [ ] Freeze the source revision/package identifier and confirm the change set contains no unapproved core-experience changes.
- [ ] Run `pnpm typecheck`, `pnpm build`, and the complete regression command set; retain logs and the `dist` inventory.
- [ ] Confirm the public and built Projection MP4 byte size and SHA-256 match.
- [ ] Configure root deployment, HTTPS redirect, SPA rewrite exclusions, MIME, range, cache, and tested security headers.
- [ ] Keep canonical, `og:url`, `og:image`, favicon, and author identity disabled until exact approved values/assets exist.
- [ ] Preserve the previously validated package and document the one-step provider rollback procedure.

### Immediately after deployment

- [ ] Record production URL, deployment ID, source revision/package hash, UTC time, operator, and rollback target.
- [ ] Verify HTTP redirects to HTTPS and the certificate chain is valid.
- [ ] Verify `/`, `/assets/*`, and `/media/after_the_second_sunset_motion_blocking_v01.mp4` status, content type, content length, and absence of mixed content.
- [ ] Verify a byte-range request to the MP4 returns usable partial content and seeking works.
- [ ] Verify an application navigation path falls back to the app, while deliberately missing asset/media URLs return 404 rather than HTML.
- [ ] Inspect `Cache-Control`, CDN cache state, revalidation after redeploy, and propagation from a cold cache.
- [ ] Complete the Public Launch Validation below on production, then capture evidence from that exact deployment.

### Rollback conditions

Rollback to the last validated artifact when any of these is confirmed and cannot be corrected solely by safe provider configuration:

- root or required hashed assets fail, return HTML, or remain inconsistent across CDN edges;
- Projection MP4 has the wrong bytes/MIME, cannot seek, or repeatedly fails to load;
- navigation becomes blocked, the complete experience cannot be traversed, or the ending cannot be reached;
- a reproducible blank canvas/crash has no functioning static WebGL fallback on a required launch device;
- production metadata exposes an incorrect domain, identity, or unapproved share asset;
- HTTPS, mixed-content, caching, or security-header behavior creates a launch-blocking failure;
- the deployed artifact cannot be tied to the signed-off source/package.

Do not hot-patch the frozen artistic runtime in production. Record evidence, roll back, and reopen a scoped candidate only if provider configuration cannot resolve the failure.

## 3. Domain and metadata readiness

| Item | Integration location | Current state | Activation gate |
| --- | --- | --- | --- |
| Canonical | `index.html`, inside `<head>` as `<link rel="canonical" href="https://…/">` | absent | Stable approved HTTPS root is live. |
| `og:url` | `index.html`, inside `<head>` as `<meta property="og:url" content="https://…/">` | absent | Must exactly match canonical. |
| OG image | Put the approved 1200×630 asset under `public/` (final name chosen with the asset), then add absolute HTTPS `og:image` in `index.html`; add width/height/type when confirmed. | absent | Approved image exists and its final production URL returns the correct image MIME. |
| Favicon | Put the approved favicon files under `public/`, then add the corresponding `<link rel="icon" ...>` references in `index.html`. | absent | Approved package, sizes, MIME, and filenames exist. |
| Author/public links | `src/publication.ts` | intentionally `null` | Exact author credit and destinations are approved. |

Metadata edits alter source HTML and therefore require a new build, deployment, and final validation. Do not use a preview URL, placeholder identity, generated placeholder artwork, or an unverified absolute URL.

## 4. Public Launch Validation

Record pass/fail, device/browser/version, network condition, cold/warm cache, deployment ID, evidence link, tester, and time for each run.

### Homepage and continuous experience

- [ ] Open the HTTPS root from a cold cache with no console-blocking or network-blocking error.
- [ ] Check the initial composition, loading state, input hint, scroll/touch/keyboard entry, focus visibility, and reduced-motion behavior.
- [ ] Traverse Seed → Forest → Tree → Room → Light continuously; confirm transitions, resize/orientation behavior, back/refresh behavior actually supported by the app, and completion.
- [ ] Repeat once from a warm cache and once after backgrounding/resuming the browser.

### Room and Projection media

- [ ] Open and close Book, Process, and Projection independently and in sequence; confirm focus and escape/close behavior.
- [ ] In Projection, confirm the expected MP4 identity, first frame, playback lifecycle, eight-second seam, final brightness/color, repeat open/close, and surface switching.
- [ ] Inspect the MP4 network response for `video/mp4`, partial-content behavior, byte count/hash when available, and absence of an HTML fallback response.

### Required devices

- [ ] iPhone Safari physical device: portrait/landscape as applicable, touch, autoplay/user-gesture behavior, memory pressure, background/resume, and WebGL fallback.
- [ ] Android Chrome physical device: touch, representative GPU/performance, memory pressure, background/resume, and WebGL fallback.
- [ ] Chrome and Edge at 1920×1080; compare at 1440×900 and complete keyboard-only/reduced-motion checks.

### WebGL loss and recovery

- [ ] On a controlled production or production-equivalent run, trigger/simulate context loss using browser tooling or the `WEBGL_lose_context` extension when available.
- [ ] Confirm the UI does not trap input or remain as an unexplained blank screen; verify the signed-off static fallback/recovery behavior.
- [ ] Refresh after loss and confirm a clean start. Record browser/GPU and console evidence. Do not introduce a debug hook into the release build for this test.

### Real audience gate

- [ ] Conduct a small approved audience run on the exact candidate without coaching beyond the intended entry prompt.
- [ ] Record whether viewers can enter, reach Room, discover/exit the three BT-P03 surfaces, understand Projection playback, and reach Light.
- [ ] Log observed blockers separately from subjective enhancement requests. Only launch-blocking reproducible failures reopen v1.0; enhancements move to evidence-led v1.1 consideration.

## 5. Evidence record

For approval, attach one record containing:

- immutable release/source identifier, deployment ID, production origin, provider, timestamp, operator, and rollback artifact;
- response/header evidence for root, representative hashed JS/CSS, MP4 full and range responses, navigation fallback, and missing-static 404;
- cold/warm cache and CDN propagation results;
- completed desktop and physical-device matrix with screenshots/video and issue disposition;
- WebGL loss/fallback evidence, Motion seam/color sign-off, metadata/share-card validation;
- real-audience gate observations and accepted known limitations;
- final approver and explicit `Public Launch Approved` timestamp.

## Automated validation for this phase

| Check | Status | Result |
| --- | --- | --- |
| TypeScript strict | passed | Project TypeScript build completed with no errors. |
| Vite production build | passed | 135 modules transformed; `dist` regenerated. Main entry: 1,073.52 kB (gzip 298.90 kB). Room chunk: 42.82 kB (gzip 13.89 kB). |
| Full regression | passed | All 19 test-file/script gates passed, including Book, Process, Projection, complete Room, and Media Runtime coverage. |
| Projection media copy | passed | `public` and `dist` MP4 files are both 1,612,523 bytes with SHA-256 `79F9CAD70BA4489CF3166F2B131A0F8163195BEDCDA4CD449315E8CEFDF226A3`. |
| Metadata disabled state | passed | Canonical, `og:url`, `og:image`, and favicon references remain absent from source and built HTML. |

The existing Vite warning for the main entry exceeding 500 kB remains deferred as previously accepted; this phase does not authorize an architecture or loading change. Passing local automation retains the candidate but does not satisfy production, device, Motion, metadata, or audience gates.

## Remaining launch blockers

- Stable HTTPS production origin, selected provider, DNS, deployment owner, and real deployment evidence.
- Production response/rewrite/MIME/range/cache/security-header acceptance.
- iPhone Safari, Android Chrome, Chrome/Edge desktop, reduced-motion, background/resume, and WebGL loss/fallback sign-off.
- Motion eight-second seam and brightness/color approval.
- Approved author identity, favicon, and 1200×630 OG image if required for launch.
- Six final screenshots, 30-second demo, three-minute demo, and real-audience evidence from the signed-off deployment.

Until these have evidence, the correct decision remains **Public Launch Approved: no**.
