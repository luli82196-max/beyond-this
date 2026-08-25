# Phase 13.5 — Room Interaction Orchestrator v0.1

## Scope

This phase adds the missing policy between successful Room interaction transitions and metadata-only media intent. It does not present or load real media.

## Policy

| Interaction result | Book | Projection | Interface |
| --- | --- | --- | --- |
| passing / ambient / focus | no intent | no intent | no intent |
| changed transition into deep | prepare archive fragment | prepare motion fragment | prepare process fragment |
| changed leave transition | release archive fragment | release motion fragment | release process fragment |

Each intent uses the fragment already declared by the explicit Room object binding. The media boundary remains responsible for validating that binding and recording only `prepared` or `released` lifecycle state.

## Data flow

```text
successful Room interaction transition
  → pure experience policy
  → MediaIntent or no intent
  → Room Interaction Orchestrator
  → metadata-only Media Boundary
  → immutable orchestration result
```

Reduced motion is an input/presentation capability only. It is not a policy input and does not change event mapping, semantic interaction state, or media eligibility.

## Boundary

The new modules are not imported by `RoomScene` or `RoomExperience`. No video, PDF, image, URL, fetch, decoder, texture, viewer, player, DOM listener, React component, or R3F integration was added. Seed, Forest, Tree, Room, and Light remain unchanged.

## Verification

The pure logic suite covers non-deep transitions, deep preparation for all three surfaces, leave release for all three surfaces, and reduced-motion semantic equivalence. TypeScript strict checking and the Vite production build remain the release gates.
