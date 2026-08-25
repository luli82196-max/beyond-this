# Phase 10.2 — Preferred Sound Audition & Rough Mix v0.1

Status: blocked at legal source acquisition; actual audition and rough mixes not completed  
Date: 2026-08-22  
Scope: preferred/necessary-alternate acquisition check, production baseline verification, and a reproducible pending audition plan  
Out of scope: production integration, visual changes, chapter-timing changes, new broad asset search, or inferred listening conclusions

## 1. Outcome

Phase 10.2 cannot truthfully progress from metadata screening to actual listening in the current environment. No Phase 10.1 source master is present locally, and the Freesound originals remain gated by an authenticated download flow that was not available in the current browser session. The page access check also did not complete reliably enough to establish a legal download path. No login, payment, download, or browser restriction was bypassed.

Consequently:

- downloaded source audio: **0 files / 0 bytes**;
- technically inspected audio: **0 files**;
- loudness-matched audition copies: **0 files**;
- actual subjective auditions: **0 candidates**;
- rendered rough mixes: **0 files**;
- alternate candidates activated: **none** (an access failure affecting the source service is not an artistic or technical failure of a preferred candidate);
- production audio configuration and URLs: **unchanged; every source remains `null`**;
- `public/` audio additions: **none**.

The word `preferred` below therefore retains the Phase 10.1 meaning “first legal download/audition choice”; it does not mean production-approved.

## 2. Inputs verified

Read before the acquisition check:

- `docs/phase-10-sound-world-design-v0.1.md`;
- `docs/research/phase-10.1-sound-asset-research-offline-audition-v0.1.md`;
- `docs/research/sound-asset-ledger.csv`;
- `src/systems/timeline/chapters.ts`;
- `src/systems/audio/ExperienceAudioDirector.tsx` and the five chapter source maps.

Current overall chapter ranges remain Seed `0–.20`, Forest `.20–.45`, Tree `.45–.65`, Room `.65–.90`, and Light `.90–1`. The prototype director still uses chapter feathering; the Phase 10 design explicitly requires later layer-level continuity instead. No code was changed.

## 3. Acquisition and tool check

The research directories contain no WAV, FLAC, MP3, OGG, M4A, AAC, or Opus source/derivative files. A legal access check was attempted against preferred source A-01 on its original Freesound page. No authenticated, stable original-file download became available. The check stopped there rather than treating a streamed page preview as the original master or claiming it had been auditioned.

The current command-line environment also has no `ffmpeg`/`ffprobe` executable. This is not the primary blocker—source acquisition is—but audio analysis/rendering will require an approved existing DAW or a separately approved offline tool after the originals are supplied. Nothing was installed in this phase.

## 4. Candidate disposition

| Sound group | Preferred | Alternate | Result | Reason |
| --- | --- | --- | --- | --- |
| Seed / ambient | A-01 | A-02 | not-auditioned / access-blocked | No legal local master |
| Forest / wind | B-01 | B-02 | not-auditioned / access-blocked | No legal local master; do not switch to CC BY alternate merely because the service is gated |
| Forest / leaves | C-01 | C-02 | not-auditioned / access-blocked | No legal local master |
| Tree / forest_pause | D-01 (derived from C-01) | D-02 (derived from B-01) | not-auditioned / parent unavailable | Derivative cannot exist before parent audition |
| Tree→Room / threshold air | E-01 | E-02 | not-auditioned / access-blocked | No legal local master; E-01 CC BY obligations remain pending if adopted |
| Room / room_ambience | F-01 | F-02 | not-auditioned / access-blocked | No legal local master |
| Light / outside_world | G-01 (derived from F-01) | G-02 (derived from C-01) | not-auditioned / parents unavailable | No credible separation or distance shaping can be judged without listening |
| Seed / water (P1) | P1-WAT-01 | P1-WAT-02 | not-auditioned / access-blocked | No legal local master |
| Seed / soil (P1) | none | none | reject | Phase 10.1 result retained; purpose-recording required |
| Tree / wood_shift (P1) | P1-WOOD-01 | P1-WOOD-02 | not-auditioned / access-blocked | No legal local master |

No preferred was rejected because no audio was heard. No untested alternate was promoted.

## 5. Required technical and subjective audition log (pending)

For every legally supplied original, preserve an immutable copy under `docs/research/phase-10.2-audition/source/` (or another explicitly approved research-only directory), record SHA-256 and byte size, and create derivatives separately. Do not overwrite masters.

Technical check fields:

- codec/container, sample rate, declared/effective bit depth, channels, duration;
- sample peak and true peak where supported;
- clipped-sample count and suspicious flat-topped peaks;
- integrated/short-term loudness where meaningful;
- DC offset, persistent hum/tonal components, broadband floor, wind/microphone rumble;
- mono fold-down compatibility, event density, clean excerpt availability, and loop feasibility.

Create audition copies at 48 kHz/24-bit WAV, with only transparent gain adjustment initially. Match comparable beds within 0.5 LU, provisionally near `-30 LUFS-I`; very quiet threshold air may begin near `-42 LUFS-I`. Do not normalize one-shots by integrated loudness. Log applied gain and any later filters separately.

Subjective log fields:

- perceived distance and enclosure;
- spectral weight/brightness and transient density;
- natural dynamics and whether the recording is over-dramatic;
- identifiable location, species, season, weather, people, traffic, or domestic events;
- audible repetition/loop seam risk;
- fit with the temperate deciduous, mild, slightly dry early-autumn visual world;
- headphone, laptop-speaker, and phone result;
- final `preferred`, `alternate`, or `reject` decision with exact evidence.

## 6. Rough-mix specifications and actual conclusions

The following are reproducible pending render sheets, not claims about heard results. Use 48 kHz/24-bit WAV intermediates; a small 192–256 kbps AAC/MP3 or 160–192 kbps Opus listening copy may accompany each WAV. Preserve natural dynamics, do not limit or master, and retain at least 6 dB sample-peak headroom at the mix bus.

### A. Tree → Room rough mix v0.1

Actual listening conclusion: **未完成**. No actual source was available; no file was rendered or heard.

Pending 30-second audition map centered on the `.65` boundary:

- `0–12 s`: D-01 forest remainder establishes the same Forest/Tree family;
- `8–18 s`: E-01 bounded neutral air enters on an independent S-curve, beginning very low;
- `10–26 s`: D-01 gradually loses width and 2–6 kHz detail without an audible filter sweep;
- boundary at `15 s`;
- `12–24 s`: F-01 room bed rises and reaches stable presence by the equivalent of Room's first 20%;
- `15–27 s`: forest residue continues across the boundary and falls below perception only after Room is established;
- no door, whoosh, impact, transport bridge, reverb reveal, or mastered loudness.

Every rendered revision must log source excerpt timecodes, gain keyframes, channel-width operation, filter type/frequency/Q, fade curve, and parent/internal IDs.

### B. Room → Light rough mix v0.1

Actual listening conclusion: **未完成**. No actual source was available; no file was rendered or heard.

Pending 30-second audition map centered on the `.90` boundary:

- F-01 remains one continuous Room bed for the entire render; do not restart or replace it at `15 s`;
- G-01 must be a traceable derivative/residue from the same F-01 recording if separation is credible;
- `0–15 s`: maintain the Room balance with exterior residue already barely audible;
- `15–29 s`: increase outside clarity/width gradually, with the meaningful rise delayed to correspond to Light `46–96%`;
- outside derivative rises only about 4–6 dB and remains subordinate to Room;
- no light switch, musical close, reveal hit, new full-room track, or finale swell.

If F-01 does not contain separable but plausible exterior information, reject G-01 rather than manufacture it; then test G-02 at very low, distant perspective.

### C. Seed → Forest rough mix v0.1

Actual listening conclusion: **未完成**. No actual source was available; no file was rendered or heard.

Pending 30-second optional audition map centered on the `.20` boundary:

- A-01 remains very quiet and slowly opens in bandwidth/width in late Seed;
- B-01 air enters beneath it before the boundary and becomes primary during early Forest;
- C-01 leaves enter later, only after air continuity is established;
- no Seed one-shot tail crosses the boundary and no nature “reveal” is created.

This render remains third priority and should not delay the two required boundary mixes.

## 7. Generated files

No audio files were generated. Therefore there are no paths, formats, durations, or file sizes to report for rough mixes or audition copies.

## 8. CC BY 4.0 obligations

No CC BY asset was downloaded, modified, rendered, or adopted in this phase. If later used:

- **E-01:** “still air tone carpeted room.WAV” by Geoff-Bremner-Audio, original page `https://freesound.org/people/Geoff-Bremner-Audio/sounds/707054/`, CC BY 4.0 `https://creativecommons.org/licenses/by/4.0/`. Credit the creator, link the original and license, and state all edits (excerpt, gain, EQ, channel/perspective treatment, fades, and mix use).
- **B-02 (alternate only):** “Windy Autumn Forest Soundscape 2” by Porphyr, original page `https://freesound.org/people/Porphyr/sounds/209339/`, CC BY 4.0. Apply the same credit, link, and change-notice requirements if it is ever activated.

CC0 provenance should still be retained voluntarily. Any derivative row must preserve its parent internal ID.

## 9. Shortest manual acquisition checklist

1. Sign in to Freesound in a browser you control and download only the unique preferred parents: **A-01, B-01, C-01, E-01, F-01, P1-WAT-01, and P1-WOOD-01**. Do not download D-01 or G-01 separately; they are planned derivatives. Do not download alternates yet.
2. For each file, save the original unchanged and save/print the source page plus visible license information. Keep the original filename and map it to the internal ID.
3. Place the seven originals in a research-only handoff folder outside `public`, ideally `docs/research/phase-10.2-audition/incoming/`, or provide that folder path. Expected preferred batch is approximately 187 MB from Phase 10.1 metadata.
4. Confirm an existing offline audio tool/DAW is available, or explicitly approve installing/providing one. The environment currently has no `ffmpeg`/`ffprobe` command.
5. Resume Phase 10.2. First verify hashes/metadata and render matched copies; audition/reject preferreds; download a group's single existing alternate only when its preferred actually fails.

## 10. Missing before production integration

- legal local source masters and license evidence;
- objective technical inspection and loudness-matched copies;
- real headphone, laptop, and phone listening notes;
- preferred/alternate/reject decisions based on heard audio;
- actual Tree→Room and Room→Light rough mixes, plus Seed→Forest if feasible;
- traceable source excerpt and processing logs;
- resolved CC BY attribution text for every adopted CC BY source;
- final approved stems, loop points, production encoding tests, payload budget confirmation, and a separate review authorizing production integration.

Phase 10.3 or production integration was not started.
