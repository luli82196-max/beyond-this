# Beyond This — Screenshot & Demo Asset Contract v0.1

Date: 2026-08-25

This document specifies future captures only. It does not authorize generated, composited, or fictional project imagery.

## Shared capture rules

- Capture the production build after desktop/mobile and Motion/color sign-off.
- Use only frames produced by the running experience; do not add UI, awards, quotes, partners, or unverified copy.
- Hide browser chrome and developer overlays. Preserve the work's native aspect ratio; do not stretch.
- Keep a lossless PNG master in sRGB. Derive compressed web copies from the master.
- Use consistent final color, grain, and exposure across the set.
- Record viewport, browser, build identifier/date, chapter position, and any active surface beside each master.

## Required screenshot set

| Asset | Required state | Composition check |
| --- | --- | --- |
| Home / Seed | Title legible; initial image settled; entry cue visible if it belongs to the native frame | Immediate identity and negative space |
| Room | Room established before an object takes over | Spatial proportion, window light, object hierarchy |
| Book | Canonical Book surface open on a representative spread | Text legibility, page edges, surrounding room continuity |
| Process | Representative creative-decisions sequence visible | Attempt → Problem → Decision → Rule hierarchy |
| Projection | Motion Study active at an approved representative frame | Projection belongs to the room; no player-like chrome |
| Light | Completion image fully settled; About closed for the hero capture | Final luminosity, title balance, emotional resolution |

Preferred editorial master: 1920×1080. Also capture Home, Room, and Light at 1440×900 and 390×844 for QA evidence. Crop derivatives only after the master set is approved.

## Social-preview derivative

- Canvas: exactly 1200×630, sRGB.
- Use one approved native capture, normally Seed or Light.
- Keep essential title/detail inside a 96 px safe margin.
- Do not add author identity until approved.
- Export an optimized JPG/PNG and verify it from its final absolute HTTPS URL.

## Demo video specification

### 30-second preview

- Duration: 30 seconds target; maximum 35 seconds.
- Master: 1920×1080, 16:9, 30 fps, H.264 high-quality delivery plus a mezzanine master if available.
- Route: Seed → Forest/Tree → Room surfaces → Projection → Light.
- Audio: native mix only, captured after explicit activation; also provide a version that communicates without sound.
- No speed ramp that misrepresents interaction or runtime performance.
- Add captions only for explanatory voice/text; preserve the work's own typography.

### Three-minute demonstration

- Duration: 2:45–3:15.
- Master: 1920×1080, 16:9, 30 fps; clear voice at consistent level if narration is used.
- Follow `presentation-package-mvp-01.8.md` and show all three Room surfaces.
- Include at least one visible input response and a natural transition into Light.
- Do not expose local paths, developer tools, test fixtures, or unapproved personal data.

## Acceptance

- Each still matches the signed-off production build.
- Text is legible at delivery size and no frame contains loading/fallback errors.
- Video has no cursor noise, dropped-frame section, clipped audio, Motion-loop seam, or false performance acceleration.
- File names use `beyond-this_<surface>_<viewport>_<version>.<ext>`.

