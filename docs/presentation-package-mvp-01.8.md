# Beyond This — Demo & Interview Presentation Package v0.1

Date: 2026-08-25

## 30-second route

| Time | Screen / action | Message |
| --- | --- | --- |
| 0:00–0:05 | Seed title and first response | A portfolio can begin as an experience, not a project index. |
| 0:05–0:11 | Forest → Tree transition | One continuous gesture becomes authored narrative time. |
| 0:11–0:22 | Room; reveal Book, Process, then Projection | One work is understood through artifact, decision process, and moving image. |
| 0:22–0:27 | Projection moment | Media behaves as an event inside the room, not a detached player. |
| 0:27–0:30 | Light completion frame | The experience resolves from learning into a changed way of seeing. |

Keep overlays minimal. Use the work's own sound only after an explicit user gesture. End on the Light frame, not a résumé slide.

## Three-minute route

**0:00–0:25 — Premise**  
“Beyond This is a five-act browser-native interactive work about cross-disciplinary learning and the relationship between seeing and making. I designed the portfolio itself to behave like a work rather than a list of cards.”

**0:25–1:10 — Seed, Forest, Tree**  
Move continuously through the first three acts. Explain that scroll, touch, and keyboard input control pace while thresholds, transitions, sound, and visual focus remain authored.

**1:10–2:15 — Room and BT-P03**  
Pause in Room. Open Book, Process, and Projection in sequence. Describe them as three views of the same project: resolved artifact, creative decisions, and time-based viewing. Point out that content, presentation, interaction, rendering, and media lifecycle are separate responsibilities.

**2:15–2:45 — Production choices**  
Mention React and strict TypeScript for orchestration, Three.js/WebGL for real-time scenes, GSAP for authored time, responsive input, reduced-motion support, static fallback, lazy chapter loading, and explicit media ownership.

**2:45–3:00 — Resolution**  
Complete Light and open About only after the experience settles. End with the combined outcome: creative direction, interaction design, real-time image-making, and production engineering form one coherent piece.

## Interview technical highlights

- A single experience controller maps normalized input into a five-act timeline.
- Chapter loading and one shared WebGL host contain startup and runtime cost without changing narrative continuity.
- Content registry, presentation models, interaction connections, renderers, and Media Runtime have explicit boundaries.
- BT-P03 surfaces remain mutually exclusive and release ownership when closed or unmounted.
- Strict TypeScript and 19 regression files protect Room, Book, Process, Projection, and integration behavior.
- Reduced-motion, keyboard, touch, DPR policy, and static fallback are treated as product behavior rather than add-ons.

## Director / creator highlights

- The five-act structure turns an abstract learning idea into a spatial and temporal arc.
- The viewer participates through pace and attention without being asked to learn a complex interface.
- Room changes the rhythm from traversal to close reading; Light supplies the final memory rather than a conventional portfolio footer.
- Book, Process, and Projection show one work at different epistemic distances: outcome, reasoning, and lived duration.
- Explanation is deliberately delayed until About so interpretation follows experience.

## Architecture in one minute

```text
approved content and assets
          ↓
content registry + presentation models
          ↓
experience controller + Room interaction connections
          ↓
React UI + Three.js/WebGL renderers
          ↓
explicit media lifecycle and accessibility fallbacks
```

The separation keeps project meaning independent from how it is opened, animated, rendered, or played. This is why Book, Process, and Projection can share one canonical work identity without becoming separate applications.

## Presentation discipline

- Do not claim a role, client, award, collaborator, metric, or technical result that has not been approved and evidenced.
- Do not lead with the stack. Lead with the work's premise, then use the architecture to explain how the experience was made reliable.
- Do not open About before Light unless the audience explicitly asks for context.

