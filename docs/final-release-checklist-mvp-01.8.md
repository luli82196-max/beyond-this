# Phase MVP-01.8 — Final Release Checklist v0.1

Date: 2026-08-25

## Frozen scope

- [x] Seed / Forest / Tree / Room / Light artistic and narrative logic remains frozen.
- [x] BT-P03 Book / Process / Projection and Media Runtime remain frozen.
- [x] No work, experience system, navigation layer, or unapproved identity claim was added.

## Completed in the repository

- [x] Strict TypeScript configuration and production build commands are defined.
- [x] The five-act experience and BT-P03 presentation paths are integrated.
- [x] Reduced-motion, keyboard, touch, WebGL fallback, and media lifecycle boundaries exist.
- [x] Public identity destinations are centralized in `src/publication.ts`; null values are omitted from the UI.
- [x] Title, description, Open Graph title/description/site name, and X/Twitter copy are present.
- [x] No canonical URL, `og:url`, `og:image`, favicon, author, award, client, collaborator, or press claim is fabricated.
- [x] Presentation, screenshot/video, deployment, and résumé/portfolio integration contracts are documented.
- [x] Production output is generated in `dist`.

## Manual verification before public launch

- [ ] Review composition at 1440×900 and 1920×1080.
- [ ] Review the complete experience and expanded About at 390×844, including safe areas.
- [ ] Complete an iPhone Safari pass: first load, touch, WebGL, media policy, background/resume, and memory pressure.
- [ ] Complete an Android Chrome pass: first load, touch, GPU/memory behavior, media release, and long-session completion.
- [ ] Complete keyboard-only and visible-focus passes.
- [ ] Complete reduced-motion and WebGL-fallback passes.
- [ ] Confirm the Motion loop seam and final color on the approved display.
- [ ] Verify all configured public links and the deployed-origin 404/fallback behavior.
- [ ] Validate the final share card in an Open Graph debugger.

## Missing release assets

- [ ] Approved author name and public credit.
- [ ] Stable production origin and canonical URL.
- [ ] Approved résumé, external portfolio, and contact destinations, if desired.
- [ ] Approved favicon package.
- [ ] Approved 1200×630 social-preview image.
- [ ] Six signed-off screenshots listed in `screenshot-demo-asset-contract-mvp-01.8.md`.
- [ ] Final 30-second preview and three-minute demonstration recording.

## Public-launch blockers

The repository is a **Final Release Candidate**, but public launch is blocked until:

1. desktop, mobile, and physical-device QA passes;
2. Motion loop/color receives final visual sign-off;
3. a stable production origin is available and deployment routing is verified;
4. approved identity and share assets are supplied where required for the chosen launch surface.

Résumé and external portfolio links are optional. Leaving them null does not block the experience because they are intentionally hidden.

## Automated verification

- [x] TypeScript strict passed (`tsc -b`).
- [x] Vite production build passed and `dist` was regenerated.
- [x] Full regression passed: 19/19 unique test files.
- [x] Projection media is present in both `public/media` and the production `dist/media` output at the required root-relative path.
- [x] Main entry: 1,073.52 kB, gzip 298.90 kB.
- [x] Room chunk: 42.82 kB, gzip 13.89 kB.
- [x] Release metadata contains no invented canonical URL, public URL, share image, favicon, or author identity.

The existing Vite warning for the main entry exceeding 500 kB remains deferred. It is not a failed build and no broad splitting change is justified without target-device evidence.

## Deferred, not blocking this phase

- Existing main-entry chunk warning over 500 kB.
- Broad code splitting or architecture changes without measured device evidence.
- Analytics, CMS, more works, global navigation, or new experience systems.
- Biography, awards, press, collaborators, and client claims without approved source material.
