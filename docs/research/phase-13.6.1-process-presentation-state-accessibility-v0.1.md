# Phase 13.6.1 — Process Presentation State Container & Accessibility Contract v0.1

## Scope

This phase adds runtime ownership and keyboard semantics around the Phase 13.6 Process model. The Content Presentation Bridge remains unchanged; Book, Projection, rendering, media, and real input listeners remain outside scope.

## State flow

```text
RoomInteractionTransition
  → Content Presentation Bridge
  → immutable Process PresentationModel
  → Presentation State Container
  → immutable snapshot
  → subscribed consumers
```

The lifecycle remains `closed → preview → focused → deep`, with `leave → closed`. An unchanged transition is idempotent: it preserves snapshot identity and emits no subscriber notification. Moving interaction to another Room surface closes the current Process model; it does not create a Book or Projection model.

## Accessibility contract

| Keyboard action | Semantic Room events |
| --- | --- |
| `focus` | `approach → attend` |
| `confirm` | `activate` |
| `escape` | `retreat` |

Stable tab order is `book → projection → interface`. The contract is a pure mapping and installs no listener.

## Boundary

The interaction controller and orchestrator are not bypassed or modified. Media Boundary is not connected. There are no media sources, requests, decoders, textures, viewers, players, DOM/R3F listeners, or Room rendering changes.
