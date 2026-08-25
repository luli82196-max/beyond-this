# Phase MVP-01.10 — Public Launch Preparation & Deployment Gate v0.1

Date: 2026-08-25

## Review boundary

- Seed / Forest / Tree / Room / Light remain frozen.
- BT-P03 Book / Process / Projection and Media Runtime remain frozen.
- No work, visual logic, runtime behavior, dependency, identity, URL, or release asset was added.
- This phase records the release contract and verifies the existing candidate; it does not substitute simulated checks for physical-device or deployed-origin evidence.

## Deployment gate result

| Check | Status | Evidence and deployment requirement |
| --- | --- | --- |
| Production output | passed | Vite emits the release package to `dist`; the final validation regenerated it from the current source. |
| Static asset output | passed | Hashed JS/CSS chunks are emitted under `dist/assets`; the host must preserve filenames and serve them from `/assets/...`. |
| Projection media | passed | `public/media/after_the_second_sunset_motion_blocking_v01.mp4` is copied to `dist/media` with the expected 1,612,523-byte size. The host must serve `/media/...mp4` as `video/mp4` with byte-range support. |
| Base path | root-only contract | `vite.config.ts` uses Vite's default `/` base, `index.html` loads `/src/main.tsx` before build rewriting, and Projection uses a root-relative `/media/...` URL. Deploy at an HTTPS origin root. Subpath deployment is unsupported until configuration and root-relative assets are deliberately revised and fully retested. |
| SPA fallback | required | This is a client-rendered single-entry application. The host must serve built `index.html` at `/` and rewrite unknown navigation requests to `/index.html` while excluding real `/assets/*` and `/media/*` files. |
| Platform compatibility | conditional pass | Any static host/CDN is compatible if it supports HTTPS, SPA rewrites, correct MIME types, MP4 range requests, immutable caching for hashed assets, and revalidation for HTML. No provider-specific configuration is committed because no deployment platform has been selected. |
| Deployed-origin acceptance | manual required | Verify status codes, fallback behavior, caching, security headers, cold/repeat loads, share metadata, and the complete experience on the final production origin. |

### Host acceptance contract

1. `/` returns the current built `index.html` over HTTPS.
2. Every referenced `/assets/*` file and `/media/after_the_second_sunset_motion_blocking_v01.mp4` returns 200 without redirects to HTML.
3. The MP4 response has `Content-Type: video/mp4`; seeking/range requests work.
4. A non-file path returns the app entry, while a missing static asset returns a genuine error rather than `index.html`.
5. Hashed assets use long-lived immutable caching; HTML is revalidated so a new deployment can be discovered.
6. Content Security Policy and related headers do not block local media, WebGL, workers, or behavior required by the signed-off build.
7. Cold-cache and repeat-cache runs complete on the target devices without provider error pages or mixed content.

## Metadata final review

| Field | Status | Current decision |
| --- | --- | --- |
| HTML title | passed | `不止于此 · Beyond This — 五幕交互作品` |
| Description | passed | Present and aligned with the five-act interactive work. |
| Open Graph text | passed | Type, site name, locale, title, and description are present. |
| X/Twitter text | passed | Summary card type, title, and description are present. |
| Canonical URL | waiting for user | Not configured. Add only after the stable HTTPS production origin is confirmed. |
| `og:url` | waiting for user | Not configured; it must exactly match the approved canonical URL. |
| `og:image` | waiting for user | Not configured; it requires an approved 1200×630 image at an absolute HTTPS URL. |
| Favicon | waiting for user | No favicon package or reference is configured. Do not generate or invent one during deployment. |
| Author identity | waiting for user | `src/publication.ts` intentionally remains `null`; no credit is rendered. |

The metadata is safe for a release candidate because it contains no invented public identity, origin, or asset. It is not complete for public sharing until the waiting items required by the chosen launch surface are supplied and validated.

## Public launch checklist

### Completed

- [x] Frozen-scope contract retained; no core code, visual logic, Media Runtime, Motion asset, or dependency changed.
- [x] Production directory, static paths, media path, base-path constraint, SPA fallback, and host requirements documented.
- [x] Title, description, OG text, and X/Twitter text reviewed.
- [x] Missing canonical, share image, favicon, and author data remain absent rather than fabricated.
- [x] Final presentation route, release note, changelog template, and v1.0 structure are documented in `release-package-mvp-01.10.md`.
- [x] TypeScript strict, production build, and the full 19-file regression set passed for this phase.

### Waiting for user-provided or approved input

- [ ] Stable HTTPS production origin and selected deployment platform.
- [ ] Exact approved public author credit.
- [ ] Approved favicon package.
- [ ] Approved 1200×630 OG image and its final absolute HTTPS URL.
- [ ] Optional approved résumé, external portfolio, and contact destinations; these may remain absent.
- [ ] Six final screenshots and the 30-second / three-minute demo recordings after visual/device sign-off.

### Manual verification

- [ ] Deploy the exact validated `dist` package and complete the host acceptance contract above.
- [ ] Complete iPhone Safari and Android Chrome physical-device QA.
- [ ] Complete desktop Chrome and Edge at 1920×1080, plus the final 1440×900 comparison.
- [ ] Complete keyboard-only, focus, reduced-motion, WebGL fallback, background/resume, and repeat-traversal checks on the deployed origin.
- [ ] Approve the eight-second Motion loop seam and final brightness/color on the representative display.
- [ ] Inspect final page source and validate canonical, `og:url`, `og:image`, favicon, and share-card rendering after real values are added.
- [ ] Capture final screenshots and recordings only from the signed-off production deployment.

### Observe after launch

- [ ] Watch cold-load failures, blank-canvas/WebGL fallback frequency, media start/rejection, and resume failures using privacy-appropriate evidence.
- [ ] Check 404/rewrite, asset MIME, range requests, cache behavior, and CDN propagation after each deployment.
- [ ] Record target-device heat, memory pressure, sustained frame behavior, and user-reported navigation confusion.
- [ ] Treat the existing main-entry size warning as a measured v1.1 candidate, not an automatic architecture rewrite.
- [ ] Roll back to the last validated package if a launch-blocking regression is confirmed; do not patch core artistic behavior directly in production.

## Automated validation

| Check | Status | Result |
| --- | --- | --- |
| TypeScript strict | passed | `pnpm typecheck` completed with no errors. |
| Vite production build | passed | `pnpm build` completed and regenerated `dist`. |
| Full regression | passed | 19/19 unique test files passed. |
| Projection media copy | passed | The expected MP4 exists in both `public/media` and `dist/media` with matching size. |

The Vite warning for the main entry exceeding 500 kB remains deferred. It does not fail the build; device evidence is required before it can justify a core loading or splitting change.

## Release decision

**Final Release Candidate: retained and deployment-prepared.**

**Public Launch Approved: no.**

The repository has reached the final preparation state before approval. Public launch remains blocked by a real production origin/platform and deployed-origin acceptance, physical-device/desktop QA, Motion seam and color sign-off, and approved identity/favicon/OG assets. Final screenshots and demo recordings must follow those gates.
