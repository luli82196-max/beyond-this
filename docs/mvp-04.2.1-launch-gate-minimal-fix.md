# MVP-04.2.1 — Launch Gate Minimal Fix & Network Evidence Preparation

## Decision

This change fixes two narrow release-contract defects and adds repeatable evidence collection. It does not change the five-act experience, audio behavior, Projection behavior, content, or visual design. Public launch remains a candidate until the production and real-device gates below are actually observed.

## Canonical root cause and fix

The approved production origin and matching `og:url` were present, but `index.html` had no canonical link. The root cause was an incomplete metadata update rather than a runtime defect.

`index.html` now contains exactly one canonical link:

```html
<link rel="canonical" href="https://beyond-this.vercel.app" />
```

Existing Open Graph, Twitter, and favicon metadata is unchanged. `npm run verify:release-config` checks uniqueness and the exact value; the production build must also be inspected before release.

## SPA/static fallback judgment

The existing release contract says that extensionless application navigation may fall back to `index.html`, while missing static files must return a real 404 instead of HTML. The previous `/(.*)` rewrite violated that contract because a missing `.png`, script, audio file, or video could also be rewritten.

The Vercel rewrite is narrowed to extensionless paths:

```json
{ "source": "/((?!.*\\.[^/]+$).*)", "destination": "/index.html" }
```

Vercel checks deployed files before rewrites, so real files continue to be served normally. Missing file-like paths no longer match the SPA fallback and remain 404 candidates. `/experience` is the release verification sentinel for the intended extensionless SPA fallback. This is a routing-configuration change only; it does not introduce an in-app URL router or new experience route.

Production behavior is not marked PASS until the deployed checks return `404` for the missing `.png` and `200 text/html` for `/experience`.

## Repeatable production evidence

No dependency is added. The verifier uses the Node runtime already required by the project and a 15-second timeout per request.

```powershell
npm run verify:production
```

Optional controls:

```powershell
$env:VERIFY_TIMEOUT_MS = '30000'
node scripts/verify-production.mjs --origin=https://beyond-this.vercel.app
npm run verify:release-config
```

The command reports status and relevant headers for:

- homepage and deployed canonical;
- OG image and favicon;
- MP4 `HEAD`, full `GET`, and `Range: bytes=0-1023`, including status, MIME, range, and length headers;
- both Forest OGG files, including status, MIME, cache control, and length;
- a missing `.png` static resource;
- the `/experience` extensionless SPA fallback sentinel.

An HTTP error response that contradicts the contract is `FAIL`. DNS, connection, abort, and timeout errors are `UNVERIFIED`; they are never converted to `FAIL`. Exit code is `0` for all PASS, `1` when any verified check fails, and `2` when there are no failures but at least one check remains UNVERIFIED.

## Remaining sign-off gates

The following remain pending unless separately captured from the deployment after this commit:

- production canonical and routing behavior after Vercel completes the automatic deployment;
- MP4 `200 video/mp4`, byte-range `206`, `Content-Range`, playback, close/reopen, first frame, and overlay cleanup;
- both OGG files' live MIME and cache headers;
- Seed-to-Light forward and reverse experience route;
- initial no-audio-request behavior, Forest demand loading/playback, transition fade, mute, and unmute;
- browser console with no severe errors;
- Vercel Ready state and deployment ID;
- iPhone Safari, Android Chrome, background/resume, speaker, and headphone checks.

No item in this section is implied to PASS by source configuration, a local build, or an unreachable network run.
