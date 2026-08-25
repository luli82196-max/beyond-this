# Phase 13.6 — BT-P03 Content Presentation Prototype v0.1

## Scope

This phase lets BT-P03 enter the Room presentation boundary for the first time as structured Process data. It adds no rendered viewer and loads no external media.

## Presentation contract

The shared presentation lifecycle is independent of presentation mode:

| Interaction state | Presentation state |
| --- | --- |
| `passing` | `closed` |
| `ambient` | `preview` |
| `focus` | `focused` |
| `deep` | `deep` |

`PresentationModel<TContent>` carries the Room surface, editorial mode, registry work and fragment identity, current state, canonical registry records, and mode-specific structured content. Book and Projection can use the same contract in a future phase.

## BT-P03 Process prototype

The existing `interface → process → bt-p03-creative-decisions` binding resolves through the content registry. The prototype exposes a `Creative Decisions` sequence containing three bounded cases. Every case follows:

`Attempt → Problem → Decision → Rule`

The model reuses the registered BT-P03 work summary, fragment caption, work ID, fragment ID, placement mode, and surface binding. It is immutable and contains text data only.

## Data flow

```text
RoomInteractionTransition
  → Content Presentation Bridge
  → existing Room object binding
  → existing content registry resolver
  → interaction-to-presentation state mapping
  → Process Presentation content factory
  → immutable PresentationModel<ProcessPresentationContent>
```

This path is parallel to, and does not replace or bypass, the existing media policy path:

```text
RoomInteractionTransition
  → Room Interaction Orchestrator
  → MediaIntent
  → MediaBoundary
```

## Boundary

Only Process is implemented. Book and Projection resolve to no presentation model. No video, PDF, image source, URL, fetch, decoder, texture, Viewer, Player, DOM/R3F listener, or React presentation component was added. `RoomScene`, `RoomExperience`, Seed, Forest, Tree, and Light remain unchanged.

## Verification

The pure logic suite verifies all four presentation-state mappings, BT-P03 registry identity, the Creative Decisions schema, closing on leave, and the explicit absence of Book/Projection implementations. TypeScript strict checking and the Vite production build remain release gates.

