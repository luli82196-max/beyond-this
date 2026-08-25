# Phase MVP-01.5 — BT-P03 Artistic QA & Experience Polish v0.1

Date: 2026-08-24

## Scope and boundary

This pass evaluates the existing BT-P03 as a viewer experience. It adds no content, presentation, lifecycle, media, or renderer abstraction. Seed, Forest, Tree, and Light narrative logic remain unchanged.

## Confirmed issues

1. The full-screen Room narrative layer sat above the WebGL canvas and intercepted pointer input. The three Room works looked available but could not be opened by a viewer.
2. The desktop camera composition was reused in portrait view. Book was almost entirely outside the left edge and Process was clipped at the right edge, leaving Projection as the only legible invitation.
3. Projection approached a luminous screen at peak attention. Its untone-mapped video surface competed with the wall and weakened the feeling of a projection inside the room.
4. Process used four equal UI-like panels. The hierarchy read closer to a specification sheet than a director's working archive.
5. Open Book remained materially convincing but visually small. Its page hierarchy needed slightly more presence without becoming an overlay reader.

## Fixed in v0.1

- Allowed Room pointer input to pass through the narrative layer to the existing WebGL interaction targets; Sound remains independently clickable.
- Added a portrait-only camera distance correction inside the existing Room camera update so Book, Process, and Projection remain in one spatial composition.
- Reduced Projection surface opacity while retaining its wall, spill light, and static fallback. Entry and exit now preserve more of the room's dusk value.
- Reworked the existing Process canvas styling: paper-like tonal wash, note numbering, ruled vertical marks, serif body copy, and an italic Rule conclusion. The Attempt → Problem → Decision → Rule content and runtime are unchanged.
- Increased only the opened Book's spatial scale and strengthened its restrained ink hierarchy. It remains a physical tabletop object.

## Artistic QA results

### Projection

- Scale: reads as a wall projection rather than a player or full-screen video.
- Light: after the opacity correction, the projected image no longer lifts the whole room value.
- Continuity: open, playback, Escape/pointer leave, and return preserve the Room composition.
- Loop: the eight-second blocking loop was observed across its wrap. No flash, layout jump, or runtime reset was visible. The content cut remains intentionally perceptible and should be judged again with final motion grading.
- Runtime atmosphere: no controls, chrome, or persistent playback appeared; no browser warnings or errors were observed.

### Book

- Reads as a book on a shared table, not a detached reading interface.
- Closed/open proportions remain subordinate to the Room.
- The open state now has enough presence for page hierarchy to register while preserving object scale.
- Page content is deliberately represented at Room distance. Full editorial reading treatment is outside this pass.

### Process

- The display still belongs to the desk object.
- Decision titles and the four-step argument are readable in sequence.
- The revised texture reads closer to a working director's note than a software dashboard.
- The existing three decisions form a narrative progression: event repetition → material memory → tool visibility.

### Viewing rhythm

Tested path: Room → Book → Process → Projection → Room.

- Discovery: all three objects can now be entered from their spatial position.
- Curiosity: Book establishes evidence, Process explains changed choices, Projection supplies the perceived result.
- Mutual explanation: the three surfaces support the same work without duplicating one another.
- Room continuity: each surface stays embedded in the same camera and lighting context; switching remains exclusive.
- Next step clarity remains intentionally ambient rather than instructional. Keyboard arrows and Escape work, but there is no visible interaction legend.

### Mobile preliminary QA

- Portrait composition now retains all three entry objects instead of cropping Book and Process out of the experience.
- Existing world-space hit targets remain larger than their visible objects and are usable by tap.
- Tap opens a surface; tapping another surface switches ownership; Escape remains available to hardware keyboards.
- Projection remains spatial rather than expanding into a player.
- Book hierarchy registers, but long-form reading at Room distance is intentionally limited. A dedicated readable mobile treatment would expand product behavior and is not introduced here.

## Later visual recommendations

- Judge the exact eight-second edit point after final motion grading; use an asset-level ambient hold or dissolve only if the authored cut still calls attention to itself.
- Consider subtle authored page graphics for Book when final archive imagery exists, using the existing asset boundary.
- Revisit Process typography only after final copy length is locked; avoid adding scrolling panels.
- Run device QA on a physical iOS Safari and Android Chrome device before public launch, especially autoplay policy, safe-area placement, and thermal load.

## Intentionally not handled

- No player UI, interaction tutorial, new close control, sound system, media, content registry, presentation mode, or mobile-specific reader.
- No changes to Seed, Forest, Tree, or Light core narrative.
- No BT-P04 work.
- No attempt to hide the authored loop with runtime effects.

## Release threshold

BT-P03 meets the internal showcase-version threshold for desktop and responsive preview after automated verification passes. Public-release readiness still requires physical-device QA and final motion/color review.

## Verification

- TypeScript project build (`tsc -b`): passed.
- Vite production build: passed; MP4 remains emitted under `dist/media`.
- MVP-01.2.1 Process runtime: passed.
- MVP-01.2.2 Projection runtime boundary: passed.
- MVP-01.3 Complete Room integration: passed.
- MVP-01.4 media runtime regression: passed.
- Browser QA at 1280 × 720 and 390 × 844: no console warnings or errors.
- The legacy aggregate `test` command stops at `roomPresentationBridge.test.ts` because its old assertion still expects Projection to be unimplemented. That expectation predates MVP-01.4 and conflicts with the now-intentional Projection implementation; the current MVP Projection and Complete Room regressions pass. This QA pass does not rewrite historical phase expectations.
