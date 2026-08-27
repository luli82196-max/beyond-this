# MVP-04.1 — Final Presentation Package & Release Assets

Date: 2026-08-27

## Release screenshots

Captured from `https://beyond-this.vercel.app/` using a 1920×1080 browser viewport. The in-app browser reserved a 229px side panel, so the actual PNG canvas is **1691×1080**. No browser chrome, developer tools or cursor is present.

- `docs/release-assets/screenshots/01-home-opening.png` — Home / opening — 1691×1080
- `docs/release-assets/screenshots/02-forest.png` — Forest — 1691×1080
- `docs/release-assets/screenshots/03-room.png` — Room — 1691×1080
- `docs/release-assets/screenshots/04-book-open.png` — Book open — 1691×1080
- `docs/release-assets/screenshots/05-projection-open.png` — Projection open / playback-ready identity — 1691×1080
- `docs/release-assets/screenshots/06-light-ending.png` — Light ending — 1691×1080

These are real production captures, not reconstructed mockups. The browser exposed Projection at `PLAYBACK / READY`; because a moving video frame was not reliably captured, the file is explicitly labeled Projection open rather than falsely claimed as playing. A later manual capture may replace it and the set with a full 1920×1080 borderless capture.

## Social preview and favicon

- OG: `public/og/beyond-this-og.png` — 1200×630. Built deterministically from the real Forest capture with restrained grade and exact title typography.
- Favicon: `public/icons/favicon-64.png` — 64×64 abstract seed / circle-light mark.
- `index.html` references both assets and includes large-image OG/Twitter metadata.
- An attempted generative OG background pass failed because the image service connection was unavailable; no generated result was claimed or used.

## README

`README.md` is now an external-facing work archive: concept, live URL, five acts, selected frames, BT-P03 Room entries, creative direction, interaction/sound/architecture, stack, accessibility, licensing and concise build instructions. Internal stage-history language and unverified launch claims were removed.

## Demo package

No reliable screen recorder was available in the current environment, so no MP4 is claimed. `docs/demo-capture-spec.md` contains exact 30-second and three-minute shot lists, timings, operation paths, audio policy, captions and filenames.

## Portfolio and interview copy

`docs/portfolio-copy-interview-package.md` contains the Chinese and English introductions, three creative highlights, three technical highlights, a 30-second interview pitch and a three-minute interview structure.

## Git and deployment status

- Base local commit: `60a11fd polish: finalize interaction and sound experience`.
- Origin verified as `https://github.com/luli82196-max/beyond-this.git`.
- Before this package, `main` was ahead 1 / behind 0 and the worktree was clean.
- Ordinary push of `60a11fd` failed on 2026-08-27: GitHub HTTPS connection was reset.
- Therefore Vercel deployment of `60a11fd` is not claimed Ready. The production URL was reachable for captures, but it represents the latest already-deployed revision, not proof of the pending commit.

## Validation record

- TypeScript strict: passed (`tsc -b`).
- Core smoke tests: passed (audio foundation and Complete Room Experience Integration).
- Production build: passed. The existing main-chunk warning remains; this package did not expand architectural scope.
- Metadata assets exist: passed (1200×630 OG and 64×64 favicon).
- README image and local-document references resolve: passed.

## Remaining public-launch blockers

- Push `60a11fd` and this MVP-04.1 release commit to `origin/main`.
- Verify the latest Vercel deployment is **Ready** and corresponds to the pushed commit.
- Real iPhone and Android background/foreground switching.
- Subjective headphone and speaker review of Forest entry, loop and exit.
- Capture HTTP 206 Range evidence for production media if required by final sign-off.
- Optional borderless 1920×1080 replacement screenshots and actual MP4 demo capture.

## Gate decision

The project reaches **MVP-04.1 Presentation Package Complete** after local validation and commit. It is prepared for **MVP-04.2 Public Launch Sign-off**, but Public Launch Approved remains **No** until the deployment and real-device blockers above are closed.
