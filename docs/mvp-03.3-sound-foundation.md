# MVP-03.3 — Sound Foundation

Date: 2026-08-27  
Scope: production-ready sound contracts and lifecycle only. No audio asset, BGM, third-party sound library, visual change, chapter timing change, or Room/Projection behavior change.

## Current silent state

Every asset entry has `src: null`. The public experience therefore remains intentionally silent: the sound control stays hidden, no `Audio` element is created, no loading state is shown, and no audio request can be made. License, source, and author metadata also remain null rather than being inferred or fabricated.

## Architecture contract

`audioManifest.ts` is the single registration boundary for future local masters. Each entry declares a stable id, chapter, acoustic world, ambient/oneshot kind, nullable source, loop behavior, base gain, preload strategy, and explicit license metadata placeholders. An approved asset must be local, auditable, and accompanied by completed rights metadata before its source is made non-null.

`audioFoundation.ts` contains pure chapter envelopes, world mixing, and the future event guard. `audioRuntime.ts` owns playable instances and exposes a small development snapshot. Production receives no debug UI.

## Persistent ambience and mixing

Seed, Forest, and Tree have continuous world beds. Room and Light share the `room-light` world. Its chapter weights are combined and clamped, so crossing `.90` changes the mix target without replacing the underlying `room-light-bed` player or starting a second ownership cycle.

Chapter weights use smoothstep envelopes. Player gain approaches each target over a short 180ms ramp, including mute and unmute, avoiding hard volume cuts. Reduced motion is not consulted by the audio runtime and therefore never means mute.

## Visibility and user gesture

When the page becomes hidden, owned players pause and their target becomes silent. Visibility restoration reuses the same ownership and can resume only when the visitor has previously enabled sound and a source exists. The runtime never unlocks when the manifest is empty. Browser playback rejection degrades silently without duplicate ownership.

The existing sound button remains absent while every source is null. Once an approved source exists, its click is the user gesture that changes mute state and authorizes playback. No eager play occurs before that gesture.

## Future one-shot guard

`AudioEventGuard` provides id-based cooldown, once-only, and direction-aware rules for future water drop, wood shift, curtain, and Room interaction events. Reverse scrolling cannot replay a forward event. No one-shot is wired, loaded, or triggered in this phase.

## Reduced data and preload

Manifest preload policy is conservative: ambient candidates use `metadata`; one-shots use `none`. This is a declarative seam for a later reduced-data policy without coupling it to reduced-motion or adding device-specific branches now. Null sources bypass the policy entirely.

## QA and tests

The audio pure-logic suite covers chapter/world mix resolution, Room-Light shared ownership, visibility pause/resume without duplication, user unlock, null-source no-op, and event cooldown/once/direction behavior. Acceptance also requires TypeScript strict mode, the full core suite, Room/Media/Projection regressions, and the Vite production build.

With all sources null, browser acceptance is: silent output, hidden sound control, zero audio requests, and zero audio-related console warnings/errors. The only expected build advisory remains the existing main-bundle size notice.

## MVP-03.4 Sound Asset Ingest gate

MVP-03.4 may begin only after legal local masters are available with verifiable source, author, and license records. Each master must be loop-edited and loudness-checked, registered through the manifest, listened to across Room → Light continuity, tested on desktop and mobile browsers, and verified under autoplay, visibility, mute, reduced-data, and reverse-scroll conditions. This foundation is ready for that ingest; audible production completion is not claimed here.
