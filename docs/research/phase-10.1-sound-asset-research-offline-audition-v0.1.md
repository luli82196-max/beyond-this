# Phase 10.1 — Sound Asset Research & Offline Audition v0.1

Status: research complete; source-audio audition pending authenticated legal download  
Date: 2026-08-22  
Scope: rights-screened candidates, audition plan, boundary rough-mix design  
Out of scope: production integration, visual/narrative/timing changes, Phase 10.2

## 1. Outcome

The candidate pool is deliberately small and family-oriented. All retained sources are on their original Freesound pages under CC0 or CC BY 4.0. No NC, ND, unclear “free download”, extracted media, or multi-source compilation is retained. The ecological brief is **temperate deciduous forest, mid-early autumn, mild, slightly dry air, light breeze, no clear chill**, without binding the work to a named place.

Freesound requires login for original-file download in the current environment. No restriction was bypassed. Consequently no source files, normalized derivatives, or rendered rough mixes were created in this phase. “Preferred” below means **preferred for first legal download and matched-level audition**, not production-approved.

## 2. Evidence reviewed in the project

- `docs/phase-10-sound-world-design-v0.1.md`: continuity, layer, budget, and boundary requirements.
- Current source maps: `seedAudio.ts`, `forestAudio.ts`, `treeAudio.ts`, `roomAudio.ts`, `lightAudio.ts`; every `src` remains `null`.
- Current crossfade prototype: `ExperienceAudioDirector.tsx` uses one persistent director and smooth chapter-weight feathering. Phase 10 correctly identifies that production needs layer envelopes rather than chapter-wide multiplication.
- Current loading/readiness: `Experience.tsx` warms current and adjacent chapter modules after 250 ms; `SceneHost.tsx` reports readiness after two animation frames. Audio readiness is not yet modeled and must remain independent.
- Repository-history limitation: the supplied project folder has no `.git`, so Phase 7.1/9.1 were verified through the current implementation and Phase 10's explicit integration notes, not historical diffs.

No production source/config file was changed.

## 3. Candidate decisions by P0 group

Full rights and technical fields are in `sound-asset-ledger.csv`.

### A. Seed dark environmental bed

1. **A-01 — Roomtone Bedroom Yew (CC0), preferred for first audition.** Short and lightweight; likely neutral enough after a restrained high/low trim. Reject if the preview reveals identifiable domestic events or a recognizable 31 s repetition.
2. **A-02 — Ambience City Quiet Night Air Tone (CC0).** Useful as a darker, less spatial alternative, but MP3-only and the “city” character may become legible. Do not use if traffic rhythm or tonal noise reads as urban identity.

### B. Forest wind

1. **B-01 — Wind rustling leaves through tree Cardiff (CC0), preferred for first audition.** Autumn, single-tree perspective, 48 kHz/24-bit stereo, and moderate duration fit the brief. The named location is provenance only and must not appear in the experience.
2. **B-02 — Windy Autumn Forest Soundscape 2 (CC BY 4.0).** Good seasonal/format fit and long enough to test internal variation; rain and birds may disqualify it after listening. Attribution is mandatory.

### C. Forest leaves

1. **C-01 — Leaves rustle in the wind (CC0), preferred for first audition.** Strong near/mid foliage candidate. It is tagged with birds, so use only an event-clean excerpt after audition.
2. **C-02 — Wind(leaves).WAV (CC0).** Long, high-sample-rate alternate with no stated species content; audition for excessive broad wind and microphone rumble.

### D. Tree forest continuity stem / `forest_pause`

1. **D-01 — derivative of C-01 (CC0), preferred.** Reuse the same recorded world: choose a quieter excerpt, narrow width modestly, reduce leaf transients and high-frequency detail. This is safer than introducing a new forest identity.
2. **D-02 — derivative of B-01 (CC0).** Alternate continuity family if B-01's wind bed proves cleaner. Avoid obvious low-pass “filter effect”; edit perspective and activity first, EQ second.

### E. Tree → Room neutral threshold air

1. **E-01 — still air tone carpeted room (CC BY 4.0), preferred for first audition.** Mono, very long, neutral enclosed-air material; its lack of width is useful at the threshold. Attribution is mandatory. Reject if it feels studio-dead.
2. **E-02 — Room Tone.wav (CC0).** Neutral stereo room tone and easier licensing. Audition for a hard indoor identity or tonal hum that makes the boundary feel like a file switch.

### F. Room ambience

1. **F-01 — Room Tone_Silent room.wav (CC0), preferred for first audition.** Explicit faint outside leakage and plausible lived-in space match the brief. Cars, birds, or neighbours must remain indistinct; otherwise reject or select a clean excerpt.
2. **F-02 — bedroom roomtone evening (CC0).** Long, quiet interior with closed-window exterior leakage. Strong compatibility candidate, but identifiable birds and the long 265.3 MB master increase editing cost.

### G. Light outside-world layer

1. **G-01 — derivative/excerpt from the exterior residue in F-01 (CC0), preferred.** This best preserves “same room, newly legible outside”; use mid/side or complementary filtering only if source separation is credible.
2. **G-02 — restrained derivative of C-01 (CC0).** A fallback outside-family stem, kept far below the room bed. It must not make Light sound as though the window suddenly opened or return to a full forest.

No separate `final_ambience` candidate was researched: it should remain a mix state.

## 4. Limited P1 findings

- **Single water drop:** P1-WAT-01, “Single Water Drop” by paespedro, CC0, 0.471 s WAV, is the first audition choice. It is mouth/hand-made, so it must be rejected if it reads synthetic or glossy. P1-WAT-02, “water drop” by IRF1010N, CC0, 0.557 s mono FLAC, is a lightweight alternate with the same realism caveat.
- **Falling soil:** no qualified candidate retained. Search results were either semantically wrong, insufficiently documented, or likely to read as a generic impact. Recording a small dry-soil contact specifically for the visible scale is preferable.
- **`wood_shift`:** P1-WOOD-01, “wood creaks” by seth-m, CC0, contains editable clean interims and is preferred for audition. P1-WOOD-02, “Objects_WoodCreak_1.wav” by SilentStrikeZ, CC0, is an alternate. Both can easily become haunted-house grammar; retain only tiny weight-transfer fragments and suppress reverse playback.

## 5. Normalized audition protocol

When authenticated downloads are available, place immutable originals under `research/audition/source/` and derivatives under `research/audition/normalized/`; never use `public/`.

1. Verify the downloaded file against the ledger page, record byte size and SHA-256, and save a license-page snapshot or text note.
2. Convert working copies to 48 kHz/24-bit WAV without changing originals.
3. For long beds, measure integrated LUFS over a representative 60–90 s section. Create audition copies at **-30 LUFS-I**, true peak at or below **-6 dBTP**, with no limiter. For sparse one-shots, match perceived foreground level in context rather than forcing integrated loudness; begin around **-26 LUFS short-term** and retain at least 9 dB peak headroom.
4. Loudness-match A/B candidates within 0.5 LU before judging. Listen on headphones, laptop speakers, and a phone. Log exact gain in the ledger; never infer quality from source loudness.
5. Test 2 minutes of stationary playback and all boundary mixes in both directions. One-shots never reverse.

The ledger's current gain recommendations are starting points only because normalized derivatives were not rendered.

## 6. Offline rough-mix designs and current audition result

### Tree → Room — priority 1

Proposed 28 s review render centered on the `.65` overall boundary:

| Time | Forest continuity | Threshold air | Room bed | Notes |
| --- | --- | --- | --- | --- |
| 0–8 s | D-01 at -30 LUFS-I reference | inaudible → -42 LUFS | inaudible | Forest activity already reduced; no transport bridge. |
| 8–14 s | -1.5 dB, width 90→70% | -42→-34 LUFS | enters below -44 LUFS | Change begins in Tree's final ~18%. |
| 14–20 s | -3→-9 dB, width 70→45%, gentle HF loss | holds near -34 LUFS | -44→-31 LUFS | Boundary occurs near 16 s; no door, whoosh, or obvious filter sweep. |
| 20–28 s | -9→-18 dB / below perception | merges into room | F-01 stable near -30 LUFS-I | Forest remains perceptible through early Room, then yields. |

Use independent S-curves; do not force equal-power summing between unrelated air layers. Reverse restores width before leaf detail. **Current result:** design passes continuity logic; sonic pass/fail is pending legal source download and matched-level render.

### Room → Light — priority 2

Proposed 26 s render centered on `.90`:

- F-01 remains one uninterrupted instance at the same nominal level throughout.
- G-01 begins as already-present exterior leakage around -43 LUFS-I; from Light 46–96% it rises only 4–6 dB and gains modest clarity/width.
- Projector/fabric are omitted from this P0-only render unless required for source plausibility; no new room track and no `final_ambience` asset.
- Reverse simply returns G-01 to leakage level.

**Current result:** architecture passes the “same room” test on paper; a rendered audition is pending. The critical failure condition is any audible change of room floor at the chapter label.

### Seed → Forest — optional third render

Use A-01 continuously, opening bandwidth/width late in Seed. Bring B-01 in under it first; delay C-01 until air continuity is established. No one-shot tail crosses the boundary. Pending source download.

## 7. Rights risk and attribution obligations

- **CC0 candidates:** commercial use and modification are permitted; attribution is not legally required. Retain provenance credits voluntarily in project documentation.
- **CC BY 4.0 candidates B-02 and E-01:** commercial use and adaptation are permitted, but creator credit, license link, and an indication of changes are required. Keep an attribution block ready before any production approval.
- Freesound account/login availability is an access constraint, not a license defect. Do not scrape or bypass the download gate.
- Source-page descriptions can include place names; those are provenance only. Do not expose them as fictional setting canon.
- Audio content has not yet been fully monitored. Embedded speech, identifiable calls, traffic, rain, loop defects, or tonal artifacts may still cause rejection.
- Any derivative must keep a traceable parent ID and exact edit notes. CC BY obligations survive edits.

Provisional attribution wording if later approved:

> “Windy Autumn Forest Soundscape 2” by Porphyr, licensed under CC BY 4.0; edited for duration, level, and tonal balance. “still air tone carpeted room.WAV” by Geoff Bremner Audio, licensed under CC BY 4.0; edited for duration and level.

## 8. Size and production-budget impact

- Downloaded in this phase: **0 bytes**.
- Unique retained source masters represented by P0 rows: **9**, approximately **627.9 MB** if every original master is later downloaded (ledger metadata; derivatives reuse parents). This is an offline research/archive cost, not web payload.
- Unique retained P1 masters: approximately **2.7 MB**.
- A practical first audition batch should download preferred unique parents only: A-01, B-01, C-01, E-01, F-01 plus the three P1 preferred items, approximately **187.0 MB** of masters.
- Proposed production encoding remains within Phase 10's 3–5 MB target: reuse can reduce the seven P0 uses to roughly five unique compressed families. At 64–96 kbps, carefully chosen 45–90 s stems should remain around 2.5–4.5 MB before optional alternates. Do not ship the research WAV masters.

## 9. Reject log

- tim.kahn “2015-11-20 wind and leaves in a forest.wav” and Akacie “Autumn Forest Wind”: CC BY-NC 4.0, so commercial use is prohibited.
- “Forest Ambient LOOP” by Imjeax: CC BY 4.0 but assembled from many sources and contains birds/insects/river; provenance and aesthetic burden are unnecessary.
- “Dungeon Air” by Flamiffer: CC0 but processed with stretch, reverb, and increased bass; fails neutral threshold aesthetics.
- Breviceps “Creaking Wood” and adharca “creaky wooden door”: clear door/haunted semantics; wrong for `wood_shift`.
- Lab/server/air-conditioner-heavy room tones: too mechanical and insufficiently lived-in for Room.

## 10. Next step (requires review; do not start automatically)

Approve or amend the **first-download shortlist**. Then, in a separate reviewed continuation of Phase 10.1, authenticate to the source site, download only those originals, capture license evidence, create matched-level derivatives, render the two priority transitions, and conduct headphone/laptop/phone review. Only after preferred stems survive that process should Phase 10.2 define production metadata and integration.

## 11. Evidence links

- Freesound candidate pages are listed in the ledger.
- CC0 legal code: https://creativecommons.org/publicdomain/zero/1.0/
- CC BY 4.0 legal code: https://creativecommons.org/licenses/by/4.0/

