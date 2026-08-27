# MVP-03.2 — Room Interaction & Media Polish

Date: 2026-08-27  
Scope: Room discovery, input semantics, Projection lifecycle, and conservative chapter-boundary input guards. No audio assets, dependencies, chapter ranges, visual systems, or media ownership rules were added or replaced.

## Interaction state semantics

Room now exposes one shared session snapshot with three independent meanings:

- `hoveredSurface`: transient pointer preview only.
- `focusedSurface`: the semantic DOM control currently selected by keyboard focus.
- `activeSurface`: the single committed deep presentation, opened only by click, tap, Enter, or Space.

Book, Process, and Projection remain mutually exclusive. Hover and focus update discoverability feedback but never call a presentation runtime's `open()` method. Switching the active surface closes the previous runtime before opening the next one.

## Discovery and input paths

Three ordered native buttons overlay the corresponding room objects. They expose English identity, a restrained Chinese note, `aria-expanded`, an associated live status, visible focus treatment, and at least a 48px touch target. A one-time room hint invites Tab, click, or touch and disappears after the first committed open.

- Keyboard: Tab/Shift+Tab selects Book, Process, and Projection. Enter or Space activates the focused native button. Escape closes active content.
- Pointer: hover previews identity and local emphasis; click commits.
- Touch: each entry is directly tappable without hover. A persistent 48px close control remains reachable in portrait layout.

Closing by Escape or the close button uses the same session action. Focus returns to the launcher that opened the content with `preventScroll`. Wheel and touch movement are suppressed while deep content is open and for 180ms after close, preventing the dismissal gesture from leaking into chapter navigation.

## Projection lifecycle

Projection preparation remains inside the existing runtime and begins only when `activeSurface` becomes `projection`. Hovering either the 3D hit area or the semantic Projection control does not create, load, or play a video element.

The visible surface reports its existing loading/fallback identity while media is prepared. A video texture replaces the static identity only once playback reaches `playing`; opacity is damped into the first frame. Unsupported media, load failure, and blocked autoplay preserve the static fallback.

On `visibilitychange` to hidden, the owned media element is paused, detached, and released. If Projection is still the committed surface when the page becomes visible, the same runtime connection creates exactly one fresh ownership cycle and resumes its normal prepare/load/play path. Close, surface switch, Room teardown, and disconnect still fully release ownership.

## Boundary input guard

The global scroll mapping and chapter ranges are unchanged. Forward and reverse crossings at `.65` (Tree/Room) and `.90` (Room/Light) receive one conservative 180ms detent at the exact boundary. Subsequent input continues normally; no snap scrolling, fixed chapter lock, duration change, or direction asymmetry was introduced.

## Reduced motion and mobile

Reduced motion retains every semantic state, control, loading label, fallback, and focus path. Existing scene animation reduction remains intact. At 390×844, all three surface buttons and the explicit close target remain within safe-area-aware bounds and do not depend on hover.

## QA and performance

Automated verification covers TypeScript strict mode, the existing Room/Book/Process/Projection suite, Projection visibility release/resume ownership, and a Vite production build. Manual browser checks target 1440×900 and 390×844, keyboard-only traversal/open/close/focus restoration, pointer hover without media allocation, touch entry/exit, first-frame/fallback presentation, visibility transitions, and forward/reverse Tree↔Room↔Light travel. Console warnings and errors are expected to remain at zero.

The pass adds no package, network request, persistent media instance, audio file, or audio framework. Runtime cost is one small external-store snapshot and three DOM buttons while Room is mounted. Projection retains one-at-a-time media ownership.

## Known limits and next gate

- The 180ms boundary detent is intentionally subtle and may require real-device tuning after broad audience observation.
- Browser autoplay policy can still reject video playback; the static fallback is the intended truthful degradation.
- Production sound remains blocked on legal, locally available, audited masters and real-device listening.

MVP-03.3 Sound Foundation can begin after this interaction pass clears desktop, portrait, keyboard-only, visibility, console, and reverse-scroll QA. That phase must not claim audible completion until approved masters exist.
