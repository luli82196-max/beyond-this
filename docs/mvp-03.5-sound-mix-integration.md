# MVP-03.5 — Sound Mix Integration

Date: 2026-08-27

Scope: first production sound mix using only the three Commons candidates approved by the user after listening. No BGM, remote runtime audio, unclear-source material, or production use of the originals was added.

## User listening sign-off

The user listened to F1, F2, and T-ref and reported that the audio was acceptable. This authorizes production editing, not indiscriminate use. F1 and F2 are promoted as restrained Forest layers. T-ref remains subject to the stricter requirement that a Tree derivative must be recognizably wood-only.

## Production result

| World | Result |
| --- | --- |
| Forest | Two production loops connected: F1 main ambience and F2 low-weight leaves |
| Tree | Silent; no one-shot promoted from the mixed T-ref |
| Seed | Silent; all sources remain `null` |
| Room-Light | Silent; the shared-world contract remains intact and all sources remain `null` |

The sound control now appears because valid Forest sources exist. The experience still begins muted. The first transition to SOUND ON is an explicit button gesture; media elements are created and played only after that action and only when a non-zero world envelope requires them.

## Forest two-layer mix

F1 is the spatial bed. The production derivative uses source 20–100 s, rotates the circular edit to begin at 22 s, and crossfades source 98–100 s into 20–22 s over 2 s. It receives only -4 dB gain, resampling, and Vorbis encoding. No denoise, EQ, compression, limiter, or synthetic ambience was applied. Runtime base gain is `0.16`.

F2 is a deliberately subordinate continuous texture. The derivative uses source 30–110 s, rotates the circular edit to begin at 33 s, and crossfades source 107–110 s into 30–33 s over 3 s. It receives -7 dB gain, resampling from 96 kHz to 48 kHz, and Vorbis encoding. Runtime base gain is `0.035`, about 13.2 dB below the F1 player gain, so it reads as sparse texture instead of an ASMR/footstep foreground.

Both players share the broad Forest world envelope. Forest fades across the Seed/Forest and Forest/Tree feathers defined by the existing chapter-weight foundation. Actual player volume follows the existing 180 ms time-smoothed ramp. The result is a two-layer space rather than a featured sound cue.

## Tree one-shot decision

No production Tree one-shot was created. T-ref is one continuous mixed-source recording explicitly containing bones, wood, fire, and ice. The available approval covers the candidate as a whole but supplies no audited wood-only timecodes, and this pass has no defensible way to prove that an extracted transient avoids the prohibited associations. Shipping a guessed slice would violate the source-specific constraint.

The forward-only production event path remains prepared at overall progress `0.54`: it uses a 3.5 s cooldown, does not trigger on reverse travel, does not replay missed events after unmute, and no-ops while `tree-wood-shift.src` is `null`. Automated tests exercise threshold crossing, reverse travel, cooldown, and later forward re-entry with a synthetic test source. A future signed-off wood-only master can therefore be attached without changing event semantics.

## Asset ingest and rights metadata

Production files live under `public/audio/forest/`; originals remain in gitignored `work/audio-candidates/originals/` and are not runtime assets. `public/audio/manifest.json` is the machine-readable derivative ledger. The TypeScript audio manifest also records author, license, source page, source SHA-256, derivative SHA-256, and processing notes.

| Production derivative | Duration | Codec | Rate / channels | Integrated loudness | True peak | RMS | Loop crossfade | Bytes | SHA-256 |
| --- | ---: | --- | --- | ---: | ---: | ---: | ---: | ---: | --- |
| `forest-ambience-loop-v1.ogg` | 78.000 s | Vorbis | 48 kHz / stereo | -26.7 LUFS | -5.1 dBFS | -29.73 dBFS | 2.0 s | 1,916,409 | `6d888851dd76af1df1855d86d52187856403783e268e477d2187c019142c6c76` |
| `autumn-leaves-loop-v1.ogg` | 76.999 s | Vorbis | 48 kHz / stereo | -38.1 LUFS | -7.8 dBFS | -27.78 dBFS | 3.0 s | 1,154,371 | `f1d7d91c120238ab12007a710eda7b2bdffd68371c5a5fc40e76ef2702d0ea4a` |

Loudness was measured with the available 2023 FFmpeg EBU R128 scanner. RMS and decoded sample peak were also retained; RMS is not presented as a substitute for LUFS. Total production audio transfer is 3,070,780 bytes (about 2.93 MiB), below the 3–5 MB complete-experience target even though only Forest is currently populated.

## Lifecycle and interaction

- Starts muted; no audible autoplay and no production audio play request before user enable.
- SOUND ON/OFF uses the existing 180 ms gain ramp.
- `document.hidden` immediately pauses owned players; visible resume reuses the same player instances and current world envelope.
- Forest layers are owned once by the persistent `ExperienceAudioRuntime`; no chapter-local duplicate is created.
- Tree reverse travel is silent and cannot trigger the prepared one-shot path.
- Room and Light map to one future `room-light` world and remain a no-op with `src: null`.
- Projection media ownership and muted-content behavior are unchanged.

## Verification

- TypeScript project references / strict check: pass.
- Sound foundation tests: pass, including availability, user unlock, shared Room-Light ownership, visibility, forward-only events, cooldown, and no-source no-op.
- All repository `*.test.ts` regression tests: pass, including Room, Book, Process, Projection, and media runtime boundaries.
- Production Vite build: pass.
- Desktop 1440×900 production preview: pass. SOUND OFF is visible at initial load; enable, Forest entry, Forest → Tree, Tree → Forest, mute, and unmute all pass. The control occupies a 58 × 22 px rendered box at x=1325.98, y=56 and stays inside the viewport without overlapping narrative content.
- Mobile 390×844 production preview: pass. SOUND OFF remains visible, its accessible tap changes it to SOUND ON, and the control remains available after scrolling into Forest without masking the chapter copy.
- Initial state: pass. No audio element is playing before enable and no autoplay warning is emitted.
- Asset serving: pass. Both Ogg files and `public/audio/manifest.json` return HTTP 200; audio responses use `audio/ogg`; no audio 404 is present.
- Console: 0 warnings and 0 errors throughout desktop and mobile runs.
- Visibility: the in-app browser keeps controlled tabs visibly active and cannot generate a trustworthy hidden state by opening a second tab. The runtime `setVisible(false)` pause and visible-resume/single-owner path passes automated tests; a physical background/foreground check remains part of post-deploy device sign-off.

The local `pnpm` wrapper remains blocked by the machine's dependency-build approval policy (`esbuild` ignored build scripts). As in MVP-03.4, the same repository Vite/Node test and build entrypoints are executed directly; no dependency install or approval mutation is made.

## Known limits and next gate

The loop edit is technically continuous by construction and decodes cleanly, but final perceptual seam confirmation should still be repeated on representative headphones/speakers after deployment. Browser automation can validate requests, state, interaction, layout, and console health; it cannot replace a calibrated human mix review. A real browser background/foreground gesture also remains a device sign-off item because the automation surface does not make a controlled tab hidden. Tree, Seed, and Room-Light remain intentional gaps.

MVP-03.6 Final Interaction Polish is unblocked once desktop/mobile browser QA below passes. Filling Seed or Room-Light and promoting Tree remain separate licensed-candidate tasks and are not required to begin the visual/interaction polish pass.
