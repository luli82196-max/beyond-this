# Phase 13.3 — BT-P03 Room Integration Prototype v0.1

## Scope

This phase adds a runtime-only interaction controller and explicit BT-P03 Room object bindings. It does not connect media, render a viewer, alter Room art, or change any chapter timeline.

## Runtime flow

```text
Room input event
  → explicit Room object binding
  → per-surface interaction state
  → read-only transition result / subscriber notification
```

The forward path is deliberately sequential:

```text
passing --approach--> ambient --attend--> focus --activate--> deep
```

`retreat` steps backward by one state. `leave` returns `ambient`, `focus`, or `deep` to `passing`. Events that do not apply to the current state are ignored and return a transition with `changed: false`.

## Public runtime interfaces

- `createRoomInteractionController()` creates isolated state for the three Room surfaces.
- `dispatch(event)` applies a guarded transition and returns its immutable result.
- `getState(surface)` returns the existing immutable state definition.
- `getSnapshot()` returns a frozen copy of all surface states.
- `subscribe(listener)` observes successful state transitions and returns an unsubscribe function.
- `getRoomObjectBinding(surface)` resolves the explicit BT-P03 binding.
- `isRoomObjectBindingCompatible(binding)` verifies the editorial-to-spatial boundary.

## BT-P03 bindings

| Room surface | Editorial mode | Fragment |
| --- | --- | --- |
| `book` | `book` | `bt-p03-visual-development-book` |
| `projection` | `projection` | `bt-p03-motion-study` |
| `interface` | `process` | `bt-p03-creative-decisions` |

The content boundary remains `process → interface`; neither the content mode nor the existing Room object is renamed.

## Media boundary

The controller only reports state. Although Phase 13.2 metadata describes future preparation and load permission, this controller does not interpret that permission, issue a request, preload an asset, or create a player/viewer.

## Non-goals

- No video, PDF, image, decoder, network request, or asset URL.
- No player, Book Viewer, overlay, modal, or deep-content UI.
- No pointer/keyboard/touch listeners yet; event sources are typed for later adapters.
- No changes to RoomScene, RoomExperience, Canvas, WebGL, or the Seed/Forest/Tree/Light timelines and visuals.
