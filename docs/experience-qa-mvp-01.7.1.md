# Phase MVP-01.7.1 — Public Presentation & First-Visit Experience v0.1

Date: 2026-08-25

## Scope and decision

This phase changes public presentation only. Seed, Forest, Tree, Room, and Light artistic logic remains frozen. BT-P03 Book, Process, Projection, and the Content / Presentation / Lifecycle architecture remain unchanged. No work, media, navigation system, or tutorial modal was added.

## First-visit issues

| Issue | Before | Decision |
| --- | --- | --- |
| Work identity | The opening frame exposed only a chapter label; the work title arrived without a public-facing category. | Add a quiet opening identity: title plus “interactive work”. |
| Positioning | The central theme was inferable only after progressing. | State the work's focus on cross-disciplinary learning and the relation between seeing and making. |
| Input discovery | Scroll/touch was implemented but not named on first arrival. | Add one line: scroll or swipe upward to enter the five-act experience. |
| First-frame wait | The transition bridge covered WebGL preparation without explaining the wait. | Reuse the same opening layer to show a restrained first-light loading message until the scene reports ready. |
| Completion | Light remained aesthetically open, but gave no confirmation that the authored path was complete. | Add a small completion marker at the end of Light, with an optional work note and invitation to scroll back. |

## Fixed issues

- First visible presentation now identifies “Beyond This / 不止于此” as an interactive work.
- Chinese and English positioning copy establishes the subject without explaining the narrative or adding a tutorial.
- The initial gesture is explicit for mouse, trackpad, and touch audiences.
- Loading and ready states share one visual hierarchy, preventing a separate UI system.
- The first-visit layer dissolves through existing Seed progress and does not gate interaction.
- Light gains a late, low-emphasis completion signal and optional “About” disclosure while preserving the open composition.
- Page title, description, Open Graph text, and X/Twitter text now match the public positioning.

## Presentation decisions

- Public positioning: “关于跨领域学习，以及观看与创造如何彼此发生。”
- English support: “An interactive work on learning across disciplines, and the relation between seeing and making.”
- Primary entry instruction: “滚动或向上滑动，进入五幕体验”.
- Completion language confirms the five-act path but avoids a conventional end page or restart button.
- Author identity is not invented. The About disclosure describes the work only until an approved author credit and destination are supplied.
- No Open Graph image or favicon was invented because no approved brand mark or social-preview asset exists in the current project.

## Deferred issues

- Approved author name, biography, contact destination, and external portfolio link.
- Approved favicon and branded 1200×630 social-preview image; add `og:image` only with a stable public origin.
- Physical-device first-visit timing, safe-area, touch discoverability, and Light completion review remain part of the existing iOS/Android QA blockers.
- Final Motion loop seam and color review remain unchanged from MVP-01.6.2.

## Verification

- TypeScript strict: passed (`tsc -b`).
- Vite production build: passed; `dist` regenerated.
- Full regression suite: passed, 19/19 test files.
- Main entry: 1,073.52 kB, gzip 298.90 kB. The existing 500 kB warning remains deferred; no request-topology or architecture change was introduced.
- Room chunk: 42.82 kB, gzip 13.89 kB (unchanged).
- Source-level presentation review: passed. The opening layer is non-blocking, fades through existing Seed progress, clears pointer input, respects safe-area positioning, and disables its loading pulse under reduced motion.
- Automated browser visual inspection: unavailable in this run because the required controlled-browser interface was not exposed to the session. Desktop and 390×844 final composition review remains manual required; the previous MVP-01.6.2 first-frame and responsive gates remain the latest completed browser evidence.

## Public Presentation Candidate threshold

This build reaches the **Public Presentation Candidate** threshold. A first-time visitor is now given work identity, thematic positioning, entry input, loading feedback, and an open completion signal without changing the five-act narrative or Room content architecture.

Physical-mobile and final Motion blockers remain separate and prevent an unconditional full public release. Before public deployment, manually review the final desktop and 390×844 composition, then complete the existing iOS/Android device checklist.
