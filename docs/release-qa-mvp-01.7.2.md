# Phase MVP-01.7.2 — Final Portfolio Integration & Release Packaging v0.1

Date: 2026-08-25

## Frozen scope

Seed, Forest, Tree, Room, and Light artistic and narrative logic is unchanged. BT-P03 Book, Process, and Projection architecture is unchanged. No work, navigation system, media asset, or Media Runtime change was introduced.

## Release-ready items

- First visit identifies the title, format, theme, loading state, and entry gesture.
- Light retains the completion marker and now exposes a restrained project note with form, method, and technology information.
- Author identity and destinations use one typed publication contract; unapproved null values are not rendered.
- Project copy now has short and expanded versions suitable for public pages, HR screening, mentor review, and interviews.
- Page title, description, Open Graph title/description/site name, and X/Twitter text consistently identify the work.
- A three-minute viewing path and interview talking points are documented.
- No favicon or social image is referenced without an approved asset.

## Missing materials before public deployment

- Approved author name and preferred public credit.
- Stable public URL and canonical URL.
- Approved résumé, external portfolio, and contact destinations, if these should appear.
- Approved favicon package.
- Approved 1200×630 social-preview image and its absolute public URL.
- Final screenshots and a short demonstration recording after visual sign-off.

When approved, fill `src/publication.ts`; add `link[rel=canonical]`, `og:url`, and `og:image` only after the final origin is known. Do not commit example domains or placeholder links.

## Manual verification required

- Desktop composition at representative 1440×900 and 1920×1080 viewports.
- Mobile composition at 390×844, including safe areas and expanded About content.
- iPhone Safari: first load, WebGL, touch progression, audio/video policy, background/resume, and memory pressure.
- Android Chrome: first load, GPU/memory behavior, touch progression, media release, and a complete long session.
- Keyboard-only pass and visible focus state for sound, Room content, About, and any configured external links.
- Reduced-motion pass.
- Eight-second Motion loop seam and final color review on a calibrated display.
- Deployed-origin share-card check in at least one Open Graph debugger after approved image and URL are configured.

## Deferred items

- Existing main-entry chunk warning over 500 kB; request topology and runtime architecture are frozen in this phase.
- Physical-device performance tuning until device evidence identifies a specific fault.
- Author biography, awards, press, collaborators, and client information unless approved source material is supplied.
- Additional works, global navigation, CMS, analytics, and new media.

## Automated verification

- TypeScript strict: passed (`tsc -b`).
- Vite production build: passed; `dist` regenerated.
- Full regression suite: passed, 19/19 test files.
- Main entry: 1,073.52 kB, gzip 298.90 kB; the existing 500 kB warning remains deferred.
- Room chunk: 42.82 kB, gzip 13.89 kB (unchanged).
- Browser visual automation: unavailable in this session because no callable browser runtime interface was exposed. Desktop and 390×844 composition therefore remain manual release checks.

## Release gate

The codebase reaches the **Public Release Candidate** threshold: implementation, strict typing, production build, and all 19 regression files pass. Public deployment remains conditional on desktop/mobile composition review, physical-device QA, Motion/color sign-off, and approved identity/share assets. Missing optional résumé or portfolio links do not block the experience itself because null destinations are intentionally omitted.
