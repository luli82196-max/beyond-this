# Beyond This — Deployment Readiness Contract v0.1

Date: 2026-08-25

## Current build contract

- Runtime requirement: Node.js 20.19+ or 22.12+ and pnpm.
- Install: `pnpm install --frozen-lockfile`.
- Verification: `pnpm typecheck`, `pnpm test` plus the five additional phase scripts listed in the validation section below, then `pnpm build`.
- Publish directory: `dist`.
- The site is a client-rendered single entry. The host must serve `index.html` at the public root and use HTTPS.

## Environment variables

The current release reads **no environment variables**. Author name and public links remain explicit approved values in `src/publication.ts`; unconfigured values are `null` and are not rendered. Do not inject secrets into Vite client variables or the static bundle.

If deployment-specific variables are introduced later, document them, expose only non-secret `VITE_` values, validate them during build, and keep identity/link fields absent rather than using example values.

## Static and media paths

- Vite currently uses its root base (`/`). Deploy at an origin root unless `vite.config.ts` and all root-relative assets are deliberately revised and retested.
- Projection media resolves from `/media/after_the_second_sunset_motion_blocking_v01.mp4` and must exist at the same root-relative path in the deployed output.
- Audio sources are currently unassigned; `public/audio/README.md` is a contract, not a production audio asset.
- The host must serve MP4 with the correct content type and byte-range support.
- Do not rename, re-encode, or replace approved media during deployment without rerunning visual/media QA.

## Domain and sharing activation

No domain placeholder is committed as a URL. Once the stable HTTPS origin and approved assets exist:

1. configure the host/domain and verify root routing;
2. add the exact canonical URL and matching `og:url` to `index.html`;
3. add the absolute HTTPS `og:image` URL for the approved 1200×630 image;
4. add the approved favicon package and references;
5. rebuild, deploy, inspect page source, and validate the share card.

Canonical, `og:url`, and `og:image` must describe the same production origin. Preview or branch URLs must not become canonical.

## Host acceptance checks

- Direct root request returns the built `index.html` over HTTPS.
- JS/CSS chunks, fonts/assets, and `/media/...mp4` return 200 without mixed content.
- Compression and long-lived immutable caching are enabled for hashed build assets; HTML is revalidated.
- MP4 seeking works and byte-range requests are supported.
- Unknown paths have the chosen intentional behavior; no provider-branded error page interrupts the experience.
- Security headers do not block required local media, WebGL, workers, or inline behavior used by the final build.
- A cold-cache full run and a repeat-cache full run both complete on target devices.

## Validation command set

`pnpm test` currently covers 14 core regression files. The full 19-file release pass also requires:

```bash
pnpm test:phase-13.8.5
pnpm test:phase-13.8.6
pnpm test:phase-mvp-01.2.1
pnpm test:phase-mvp-01.2.2
pnpm test:phase-mvp-01.3
```

`test:phase-mvp-01.4` repeats the Projection test for its Media Runtime phase and may be run as an additional historical check; it is not a twentieth unique test file.

