# Phase 12 — Content Integration Architecture v0.1

Status: **DESIGN COMPLETE / IMPLEMENTATION NOT STARTED**  
Date: 2026-08-22  
Scope: content classification, narrative placement, interaction depth, data contract, loading, audio coexistence, and inventory  
Out of scope: production media integration, new visual assets, a Works page, a fourth medium, Seed/Forest/Tree changes, Blender work, and production sound

> **Route update — 2026-08-23:** the Phase 12.1 next-step route in section 11 is superseded by **Phase 12R: Portfolio Rebuild v0.1**. This architecture, its media responsibilities, and its constraints remain active; only the assumption that existing works should drive the next editorial inventory has changed. Historical text is retained below.

## 0. Decision

Beyond This will not contain a portfolio section. It will contain a small, curated **constellation of traces**. A work is stored once as a content item, then one or more fragments of it can be placed in Book, Projection, or Interface according to the relationship being expressed. The three objects are not category buttons and never open three lists.

The primary narrative remains the five-act scroll. In Room, content first exists without being requested; attention makes it legible, focus makes it inspectable, and an explicitly requested deep state makes selected material viewable. Light does not introduce a second collection: it lets the same traces settle back into the world and reconnects them to the outside.

## 1. Evidence and current constraints

Reviewed in the current repository:

- `docs/architecture.md` and `README.md`.
- `RoomExperience`, `RoomScene`, and `room.types`: Book, Projection, and Interface already exist as spatial objects; scroll attention arrives in that order; pointer movement is observation parallax, not navigation.
- `LightExperience`, `LightScene`, and `light.types`: Light stays in the same room, clarifies the same three objects, and looks back outside. It must not become another content surface.
- `Experience`, `SceneHost`, and `chapterLoaders`: one persistent React Three Fiber Canvas; only the active chapter scene graph is mounted; neighboring chapter JavaScript is idle-preheated; first-frame readiness covers the chapter handoff.
- `ExperienceAudioDirector` and the Phase 10 sound design: chapter ambience is centrally weighted and currently has no assigned production sources.
- Phase 11 and 11.1 records: production tree work is separate and blocked pending a controlled DCC/Blender pipeline.

The requested Phase 8.4, 8.5, Phase 9 full-review, and standalone Phase 9.1 reports are not present in this repository, and this directory has no Git history to recover them from. Their retained conclusions are visible in the current Room/Light source and `architecture.md`; this design uses those sources and does not invent missing reports.

## 2. Final content classification model

Traditional labels such as “director / AI / graphic / code” describe tools or job categories. Beyond This instead classifies each item on two axes: **what human movement it records** and **what relationship it reveals**.

### 2.1 Primary movement (`movement`)

1. **noticing** — observation, research, references, questions, learning, and the details that changed how something was seen.
2. **forming** — an idea taking sensible form through directing, editing, image, sound, typography, motion, or staging.
3. **testing** — prompts, prototypes, workflows, iterations, failures, constraints, and discoveries made with tools.
4. **carrying** — something learned in one field being carried into another, or a completed work continuing to affect later practice.

Every content item has one primary movement and may have secondary movements. “Carrying” is not a miscellaneous bucket: it requires an explicit source-to-destination relation.

### 2.2 Relations (`relations`)

Relations are reusable thematic links rather than menu categories. Initial controlled vocabulary:

- `attention-and-time`
- `human-and-tool`
- `image-and-memory`
- `nature-and-making`
- `system-and-uncertainty`
- `discipline-transfer`

The vocabulary should remain small. A new relation is added only when at least two real items need it and its meaning cannot be expressed by an existing relation.

### 2.3 Storage and reuse rule

- One real work equals one canonical content item.
- A content item may expose several **fragments**: e.g. a quiet 8-second shot, one annotated still, and one iteration trace.
- Each fragment has one primary placement. Other media may reference it through a short echo, not replay the complete presentation.
- Cross-media continuity uses a shared item id and relation; it never duplicates the full video, full case study, or full text.
- Curation is selective. Absence is allowed; category completeness is not a goal.

Example without inventing a work: one future directing item may place an annotated observation still in Book, a short scene fragment in Projection, and a compact edit/process trace in Interface. Only Projection owns deeper viewing of the finished moving image.

## 3. The three media

### 3.1 Book — traces of attention

**Responsibility:** thought, learning, prior observation, and what remained after looking. Book answers: “What was noticed, and what changed the maker’s way of seeing?”

Suitable fragments:

- short notes and incomplete sentences;
- contact-sheet selections, location or composition observations;
- sketches, diagrams, margin marks, image crops, and film stills with a reason for inclusion;
- a brief quote only when rights are clear and the response to it matters more than the quotation;
- a still or silent micro-loop used as a memory trace, not as a miniature player;
- cross-disciplinary transfers stated as relationships: “reading about X changed the pacing of Y,” not “skills: philosophy, literature, photography.”

Presentation:

- At ambient depth, the open spread already contains one legible image/mark and a few lines; no interaction knowledge is required.
- During the existing Book attention window, light, page separation, and limited text legibility increase with scroll.
- Focus permits a small number of deliberate page turns or spread changes. Page turns are discrete, reversible, and do not consume vertical wheel input.
- Deep inspection may lift a spread into a quiet reading plane, but it stays visually anchored above the physical book and returns to the same page.
- A spread should express one relation, not summarize a career. Recommended size: one anchor image, 20–80 Chinese characters (or equivalent), and at most two supporting marks.

Book is not About, Resume, Blog, chronology, bibliography, or a learning log. No biography paragraph, dates-as-timeline, proficiency claims, or exhaustive notes archive belongs here.

### 3.2 Projection — image presently happening

**Responsibility:** viewing and expression. Projection answers: “What image is alive in this room now?” It is the primary home for directing, video, AI moving-image, and selected motion-design outcomes.

Three depths are necessary because they separate discoverability from user intent and network cost:

1. **Ambient fragment** — a 4–12 second silent or inaudible loop/sequence, low contrast, edited to tolerate entry at any point. It exists in the room without controls or title cards. Where video cost is inappropriate, a poster plus restrained temporal treatment is acceptable.
2. **Focus state** — an explicit tap/click/keyboard action stabilizes the camera/attention, increases projection clarity, reveals a restrained title/context line and a clear “watch” affordance. The fragment remains muted; the main scroll is paused only after focus is explicitly entered.
3. **Deeper viewing** — a second deliberate action loads and plays a selected excerpt or full piece if rights and duration permit. It is not a generic modal: the picture remains aligned with the projection plane, while a minimal DOM control layer supplies accessibility, captions, progress, sound choice, credits, and exit. Background room visibility is retained.

Rules:

- Ambient playback never autoplays audible sound.
- Focus is not triggered merely by passing the scroll window.
- Deeper viewing always has Escape, visible close/back, playback-ended, and mobile back actions; exit returns to the same Room progress and focus target.
- The wheel is never used for video seeking. In deep viewing it may be ignored or interpreted as an exit-intent only after a threshold, never forwarded simultaneously to the chapter controller.
- One projection item is active at a time. Ambient rotation, if used later, changes only at calm narrative boundaries and never resembles a carousel.
- Fullscreen may be offered as a native secondary action, not imposed.

### 3.3 Interface — evidence of inquiry

**Responsibility:** tools, AI, experiments, systems, uncertainty, and learning through iteration. Interface answers: “What changed between attempt and understanding?”

Suitable traces:

- prompt/input → selected intermediate → observation, with sensitive content removed;
- two or three meaningful iterations showing what changed and why;
- a workflow dependency or decision path;
- a failed test and the constraint it revealed;
- a small live or pre-recorded behavior trace from this website’s making;
- connections between directing judgment and technical experimentation.

Presentation:

- Ambient state shows one slowly changing trace: cursor residue, node/path transition, before/after crop, or a concise status line. It must be readable as activity, not as fake terminal decoration.
- Focus expands one process thread into 2–5 steps. Each step contains evidence plus a one-sentence observation.
- Deep state, used rarely, supports a bounded comparison or replay. It does not expose a repository dashboard or a full technical case study.

Do not use software logos, skill meters, GitHub statistics, unedited code walls, prompt dumps, or success-only galleries. Tool names belong in metadata/credits when necessary; judgment and discovery remain foregrounded.

## 4. AE and graphic work

No fourth medium is needed. Placement follows the role of the selected fragment:

- A finished motion-design or compositing sequence whose value is timing and movement belongs primarily in Projection.
- A static composition, style frame, typographic study, visual observation, or annotated still may belong in Book when it reveals attention rather than merely displaying a final image.
- A layer decision, compositing breakdown, iteration, failed treatment, or workflow discovery belongs in Interface.
- One AE/graphic work may cross media through different fragments, but only one medium owns its complete/deeper presentation.
- Purely decorative finals with no meaningful relation to the Beyond This proposition may be omitted. The inventory is not required to represent every capability.

## 5. Interaction depth and scroll coexistence

### 5.1 State model

`passing → ambient → focus → deep`

- **Passing:** the normal Room scroll. All three objects visibly contain traces; no hover is required.
- **Ambient:** the current scroll attention windows improve legibility and may start lightweight motion. The global five-act controller retains the wheel/touch stream.
- **Focus:** entered only by click/tap, Enter/Space on a visible semantic target, or an equivalent mobile control. Chapter progress is held at its current value. Pointer/touch controls the selected object only through bounded actions.
- **Deep:** entered by a second explicit request. A media-specific DOM layer provides accessible controls. Exit restores focus or passing without resetting the journey.

Only one medium can own focus. Moving past Room without focusing remains a complete, coherent experience.

### 5.2 Discoverability

- The room itself shows content at passing depth: a marked Book spread, an image on Projection, and activity on Interface.
- During each existing attention interval, one restrained spatial cue and one short text cue may appear. These cues describe action (“翻看一页 / look closer”), not categories (“作品 / AI / About”).
- Keyboard focus order includes Book, Projection, Interface only while their targets are meaningfully visible.
- A quiet “continue” cue remains available after focus exit; hidden easter eggs may exist, but canonical content cannot depend on them.

### 5.3 Desktop, keyboard, reduced motion, and mobile

- Desktop: pointer selects; wheel continues narrative unless focus/deep has been explicitly entered.
- Keyboard: Tab reaches semantic HTML proxy controls; Enter/Space focuses; arrows/page buttons navigate bounded internal steps; Escape returns one depth.
- Mobile: a tap enters focus; clearly labeled bottom-sheet-like controls are visually anchored to the object while the 3D room remains visible; swipe inside controls changes bounded pages/steps, while vertical page gesture outside continues the narrative. Deep video uses inline playback (`playsInline`) with a visible exit.
- Reduced motion/low power: ambient video may become a poster or sparse still dissolve; no essential content depends on motion, hover, spatial audio, or parallax.

## 6. Content data architecture

Content must live outside `RoomScene`. Scene code consumes resolved placements and current interaction state; it does not own titles, asset URLs, rights, or editorial copy.

### 6.1 Proposed TypeScript contract

```ts
export type ContentMovement = 'noticing' | 'forming' | 'testing' | 'carrying'
export type ContentRelation =
  | 'attention-and-time'
  | 'human-and-tool'
  | 'image-and-memory'
  | 'nature-and-making'
  | 'system-and-uncertainty'
  | 'discipline-transfer'

export type Medium = 'book' | 'projection' | 'interface'
export type ArtifactType =
  | 'text-fragment' | 'note' | 'sketch' | 'still' | 'image'
  | 'ambient-video' | 'video-excerpt' | 'process-trace'
  | 'comparison' | 'diagram' | 'micro-interaction'
export type InteractionDepth = 'ambient' | 'focus' | 'deep'
export type LoadingPriority = 'room-critical' | 'ambient-near' | 'on-focus' | 'on-deep'
export type SoundBehavior = 'silent' | 'muted-until-requested' | 'optional-audible'

export interface MediaSource {
  src: string
  type: string
  width?: number
  height?: number
  bytes?: number
  bitrate?: number
}

export interface ContentFragment {
  id: string
  artifactType: ArtifactType
  placement: {
    medium: Medium
    slot: string
    order?: number
    primary: boolean
  }
  interactionDepth: InteractionDepth
  sources?: MediaSource[]
  poster?: MediaSource
  alt?: string
  caption?: string
  durationSeconds?: number
  inSeconds?: number
  outSeconds?: number
  loop?: boolean
  soundBehavior: SoundBehavior
  loadingPriority: LoadingPriority
  mobileFallback?: {
    artifactType: Extract<ArtifactType, 'still' | 'image' | 'text-fragment'>
    source?: MediaSource
    text?: string
  }
}

export interface ContentItem {
  id: string
  internalTitle: string
  publicTitle?: string
  year?: number
  movement: ContentMovement
  secondaryMovements?: ContentMovement[]
  relations: ContentRelation[]
  summary: string
  fragments: ContentFragment[]
  credits?: Array<{ role: string; name: string }>
  rights: {
    status: 'cleared' | 'restricted' | 'pending' | 'unknown'
    territories?: string[]
    expiresOn?: string
    notes?: string
  }
  accessibility?: { transcript?: string; captions?: string }
  published: boolean
}
```

Validation rules should later enforce unique ids, one primary/deep owner per item, a poster/mobile fallback for video, explicit rights status, alt/captions where applicable, and no deep source when rights are not cleared.

### 6.2 Proposed directories

```text
src/content/
  content.types.ts
  content.registry.ts          # curated item imports only
  relations.ts                 # controlled vocabulary and labels
  placements/
    room.ts                    # slots, ordering, ambient selections
  runtime/
    contentLoader.ts           # preheat, acquire, release
    contentState.ts            # passing/ambient/focus/deep
    contentAudioPolicy.ts      # intent and duck requests
public/media/content/
  <item-id>/
    poster/
    ambient/
    deep/
    stills/
docs/research/content-inventory-template.csv
```

Large media should ultimately use a deploy-time asset/CDN manifest rather than JavaScript imports. URLs should be versioned and same-origin/CORS-compatible for video textures.

## 7. Phase 9.1 loading and rendering integration

### 7.1 Budgets and sequence

1. Seed must import neither the content registry’s media bytes nor video runtime code. No content media request is made on the Seed first screen.
2. The existing chapter code preheat remains unchanged. Content readiness is a separate layer from chapter module readiness.
3. When Tree is active and the browser is idle, fetch only the Room content manifest plus small Room-critical posters/stills. This must be capability- and data-saver-aware.
4. Near the Tree→Room boundary, preheat the currently scheduled Projection ambient fragment only if the poster is ready and the device permits it. Use metadata or a short byte-range request where supported; do not fetch every ambient item.
5. On Room mount, Book/Interface lightweight assets and the projection poster may become GPU resources. Ambient video starts only inside its attention window and when visible.
6. Focus may prefetch metadata/poster and the first selected deep candidate. Deep video bytes load only after the user requests “watch.”
7. On deep exit, pause, remove the video texture binding, detach listeners, clear `src`/call `load()` when the asset is not expected again soon, dispose `VideoTexture`, and release any object URL. A small poster/manifest cache may remain; decoded video frames may not.

Suggested initial transfer targets, to be validated with real assets: Room-critical still/poster set ≤ 800 KB desktop and ≤ 450 KB mobile; one ambient fragment ≤ 3 MB desktop and ≤ 1.5 MB mobile. These are design budgets, not measured production results.

### 7.2 HTML video, VideoTexture, and DOM

- **Passing/ambient:** use an `HTMLVideoElement` feeding a Three.js `VideoTexture` only when the moving image must receive room perspective/light context. Keep the element outside React’s scene graph but owned by a chapter-local loader with explicit cleanup.
- **Posters and Book/Interface images:** regular Three.js textures in the spatial object, with capability fallbacks.
- **Focus/deep controls, captions, transcripts, and readable text:** semantic DOM above the persistent Canvas. WebGL text is not the accessibility layer.
- **Deep image:** prefer a DOM `<video playsInline>` geometrically aligned with the projection surface when it improves decoding, controls, captions, and resolution. Preserve enough room around it that it still reads as projection, not a detached portfolio modal.

Only the active Room scene owns Room GPU textures. Light receives small continuity posters or its own explicitly declared lightweight textures; it must not keep the Room video decoder alive. The persistent Canvas does not imply persistent content resources.

Readiness must distinguish `chapterCodeReady`, `roomCriticalReady`, `firstFrameReady`, and optional `ambientReady`. Chapter entry waits only for critical poster/still assets and a rendered frame; ambient/deep media failure falls back locally and never blocks the five-act journey.

## 8. Sound coexistence policy

No sound sources are added in this phase. The future contract is:

- Ambient and focus fragments are always muted.
- Deep video remains muted when the global experience sound has never been enabled. It may show an explicit “开启作品声音” action; opening content must never silently opt the whole site into sound.
- If global sound is enabled, deep video still begins muted unless the user’s watch action explicitly communicates that sound will play. A separate sound toggle is always available.
- Audible content requests a duck envelope from the central audio director: Room/Light ambience target approximately −10 to −14 dB over 250–400 ms; projector mechanical hum may remain at a very low contextual level if it does not mask the work. Final values require audition with real masters.
- Content audio is the foreground bus; chapter ambience is never independently muted and forgotten. Pause, end, error, focus exit, deep exit, chapter leave, tab hide, and component unmount all cancel the request and restore the chapter envelope over roughly 500–900 ms.
- Rapid re-entry must cancel the previous ramp cleanly. Two audible content sources can never overlap.
- If the user globally mutes while content is playing, both buses mute immediately; unmuting does not automatically resume content sound without renewed intent.

The future audio director should expose intent-based methods such as `requestContentForeground(id)`, `releaseContentForeground(id)`, and global sound state, rather than allowing Projection to set Room volume directly.

## 9. Editorial limits and acceptance criteria

Phase 12 implementation is acceptable only if:

- a non-interacting visitor sees at least one real trace in each medium;
- a visitor can complete Room and Light without focusing anything;
- Book does not read as biography/resume/blog, Projection does not read as a video gallery, and Interface does not read as a skills dashboard;
- no work’s full presentation is duplicated across media;
- focus/deep exit restores exact Room progress and input ownership;
- keyboard, mobile, reduced-motion, and silent use preserve the same meaning;
- missing or failed media degrades to a poster/still without blocking chapter readiness;
- rights status gates publication and deep playback;
- Seed requests no portfolio media;
- only the active scene owns GPU media resources and video decoders are released after use.

## 10. Required real-content inputs

The repository currently contains no identifiable portfolio media or reliable work metadata, so no example item is populated. Before implementation, collect:

1. A rough list of real works/experiments (working titles are enough).
2. For each, source files or review links and permission to extract short fragments/stills.
3. The particular moment/process worth showing, not merely the full deliverable.
4. A one- or two-sentence account of why it belongs in Beyond This and what changed through making it.
5. Date, role, collaborators/credits, client restrictions, music/footage/model licenses, and publication territory/expiry.
6. Available master resolution, aspect ratio, duration, audio/caption/transcript status, and mobile-safe crop.
7. For AI work: tool/model if disclosure is needed, source-material rights, meaningful iterations, and what was learned or rejected.
8. For AE/graphic work: whether its strongest evidence is motion, a static decision, or process.

The accompanying CSV is the intake tool. One row represents one candidate work, not every potential fragment. Fragment selection happens during curation.

## 11. Next phase — one recommendation

**Phase 12.1: Real Content Inventory and Editorial Curation v0.1 — SUPERSEDED BY PHASE 12R.**

Fill the inventory with 6–12 genuine candidates, verify rights, and select a minimal first constellation: approximately 2–3 Book spreads, 2 Projection items with one ambient fragment each, and 2 Interface process traces. Produce an editorial placement map and asset preparation list only. Do not implement the runtime until real fragments, rights, aspect ratios, durations, and mobile fallbacks make the schema testable.
