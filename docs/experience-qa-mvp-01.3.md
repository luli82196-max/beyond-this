# Phase MVP-01.3 — Experience QA

## Main chain

Seed → Forest → Tree → Room → Book → close → Process → close → Projection → close → Room → Light

The chapter art logic remains unchanged. Room deep surfaces now retain wheel, touch-move, and directional-key input until close, preventing accidental chapter progress. Escape returns to neutral Room input. Pointer exit and surface switch release local output. Remount begins with no active surface.

## Visible review checklist

- **Book as spatial work:** verify the cover, paper, scale, and desk placement read as an object rather than a floating interface. Current minimal visual is intentionally restrained; final material and typography still require art-direction review.
- **Process as creative evidence:** verify Attempt → Problem → Decision → Rule reads as process, not a developer/debug panel. The current screen-like support is the highest risk of feeling technical.
- **Projection as work entrance:** verify the quiet screen and Motion Study identity suggest viewing without resembling a disabled player. Real playback remains excluded until MVP-01.4.
- **Room density:** check the three discoverable zones at desktop and narrow/mobile aspect ratios. The desk cluster can feel busy while the upper wall can feel empty.
- **Wayfinding:** confirm each zone responds on hover/focus and only one responds deeply at once. Keyboard defaults to Book with Enter/Space; pointer/touch reaches all three spatial targets.
- **Five-act continuity:** confirm opening a surface pauses chapter navigation, closing restores it, and repeated surface visits do not turn Room into a conventional navigation screen.
- **Room → Light:** confirm the transition becomes available immediately after closing deep content and still feels like leaving the room rather than dismissing an overlay.
- **Reduced motion:** confirm motion reduction changes drift/camera response only; surface identity, input, close, and chapter-hold semantics remain unchanged.

## Deferred visual questions

- Whether Process needs a less screen-like material treatment.
- Whether Projection needs a slightly clearer resting-state light cue before media exists.
- Whether Book needs stronger resting silhouette at small viewport sizes.
- Whether touch targets remain comfortably distinct on the narrowest supported viewport.
