# MVP-03.4 — Legal Sound Candidate Ingest & Audition Pack

Date: 2026-08-27

Scope: legal candidate acquisition, provenance, technical QC, and local audition only. No candidate is connected to the production experience.

## Production safety gate

All production audio sources remain `null`. `src/systems/audio/audioManifest.ts` and the Seed, Forest, Tree, Room, and Light source maps were not edited. The public experience remains silent, the sound control remains hidden, and no candidate path is exposed through `public/` or a public route.

Originals and processed audition files live under gitignored `work/audio-candidates/`. Only this audit document is committed.

## Acquired originals and rights evidence

| ID | Intended use | Original file | Commons page and original media | Author / uploader | Rights status | Size | SHA-256 |
| --- | --- | --- | --- | --- | --- | ---: | --- |
| F1 | Forest ambient-bed candidate | `20090610 0 ambience.ogg` | [description](https://commons.wikimedia.org/wiki/File:20090610_0_ambience.ogg) / [media](https://upload.wikimedia.org/wikipedia/commons/0/0a/20090610_0_ambience.ogg) | author: nille; transferred by uploader Fæ | Public domain release by author; Commons page states unrestricted use worldwide, with fallback permission for any purpose where dedication is not legally possible | 3,467,115 bytes | `43848c3eda5f42829f1033112c2a91ba3e5c91b79a0532fda264c9f59856d431` |
| F2 | Forest leaves-layer candidate | `Leaves falling from the trees during autumn in the forest.wav` | [description](https://commons.wikimedia.org/wiki/File:Leaves_falling_from_the_trees_during_autumn_in_the_forest.wav) / [media](https://upload.wikimedia.org/wikipedia/commons/1/1b/Leaves_falling_from_the_trees_during_autumn_in_the_forest.wav) | author/uploader: Wilfredor; embedded artist metadata: Wilfredo Rodriguez | Creative Commons CC0 1.0 Universal Public Domain Dedication; own work | 121,316,676 bytes | `858d8965c77ec52b975d8d077728e874b79522c4815cbdcd83556447d66e508a` |
| T-ref | Tree/wood reference only | `Bones breaking wood fire ice crackling.ogg` | [description](https://commons.wikimedia.org/wiki/File:Bones_breaking_wood_fire_ice_crackling.ogg) / [media](https://upload.wikimedia.org/wikipedia/commons/8/80/Bones_breaking_wood_fire_ice_crackling.ogg) | author: stephan; transferred by uploader Fæ | Public domain release by author; Commons page states unrestricted use worldwide, with fallback permission for any purpose where dedication is not legally possible | 2,401,748 bytes | `b226630ca2a7454ef49093e8a635eedabbb4b20009e23f31722ddc85a9333cc2` |

Rights were checked against the live Commons description pages on 2026-08-27. The downloaded byte sizes and Commons SHA-1 values also match the MediaWiki API records: F1 `981f161f9e1a5749bf5da8e37c7f37b892afe7cc`; F2 `b10826f1c65d4c1bea131fc93592baf6e4829fe6`; T-ref `a265c0c465658795001b3c001668dfa17acc6149`.

T-ref is not promoted merely because its license is acceptable. Its description explicitly groups bones, wood, fire, ice, cracking, crushing, and splintering. It remains a reference pending human listening and should be rejected if the mixed sources read as theatrical or non-wood.

## Original technical QC

| ID | Decode | Duration | Codec | Sample rate / channels | Peak | RMS | DC offset | Samples at or above -0.000265 dBFS | Loop feasibility |
| --- | --- | ---: | --- | --- | ---: | ---: | ---: | ---: | --- |
| F1 | pass | 123.43 s | Ogg Vorbis | 44.1 kHz / stereo | +0.059 dBFS decoded | -24.99 dBFS | +0.00000795 | 9 / 10,886,784 (0.000083%) | technically editable, but not loop-ready; crows/wind/noise and seam continuity require listening and a dedicated loop edit |
| F2 | pass | 157.96 s | PCM signed 32-bit WAV | 96 kHz / stereo | -0.00007 dBFS | -21.31 dBFS | -0.00003664 | 1 / 30,329,088 (0.000003%) | technically editable, but not loop-ready; endpoints and background events require listening before choosing a seam |
| T-ref | pass | 74.11 s | Ogg Vorbis | 44.1 kHz / stereo | +0.438 dBFS decoded | -31.69 dBFS | -0.00026740 | 111 / 6,537,856 (0.001698%) | unsuitable as an ambient loop without substantial editorial selection; only a possible one-shot source reference |

Peak, RMS, DC, and threshold counts were measured from decoded 32-bit floating-point sample values. Positive decoded peaks in Vorbis sources can arise from codec overshoot; the counts above therefore indicate peak-risk samples, not proof that the pre-encode master was hard-clipped. No audible-clipping judgment is claimed without listening.

Integrated LUFS is intentionally not reported: the available offline FFmpeg build is `N-62439-g5e379cd` (2014) and has neither `ebur128` nor `loudnorm`. RMS is not substituted for LUFS. A later mix pass must measure integrated/short-term loudness with a current BS.1770-capable meter.

## Processed audition copies

The originals were not overwritten. Full-duration Ogg Vorbis audition copies were generated with only:

1. regenerated continuous audio timestamps;
2. conservative peak attenuation (F1 -3.059 dB, F2 -3.000 dB, T-ref -3.438 dB);
3. short linear fades (0.5 s at both ends, except T-ref 0.25 s fade-in);
4. F2 resampling from 96 kHz to 48 kHz for a lighter audition copy;
5. Ogg Vorbis quality setting 5; no EQ, reverb, denoise, compression, or creative sweetening.

| File | Size | Decode | Peak | RMS | DC offset | Clipped threshold samples | SHA-256 |
| --- | ---: | --- | ---: | ---: | ---: | ---: | --- |
| `forest-ambience-audition.ogg` | 2,173,252 bytes | pass | -2.87 dBFS | -28.15 dBFS | +0.00001176 | 0 | `b0a785411518c59304419bf6bc1a0392704b2b61a1ef52ec1ad583dac9c53043` |
| `autumn-leaves-audition.ogg` | 3,121,298 bytes | pass | -4.05 dBFS | -24.30 dBFS | -0.00002218 | 0 | `32ae1ae419f00186d730e7a3273eeb9a224679fb015b68f5883471411709fb70` |
| `wood-crackle-reference-audition.ogg` | 1,174,660 bytes | pass | -2.68 dBFS | -35.37 dBFS | -0.00017969 | 0 | `447b9f1ba2af163f17be60c7151dc7f9239cca603551537c567894a31f3ca036` |

All three processed files passed a complete decode after timestamp regeneration. These are audition copies, not production masters or final loop edits.

## Local audition pack

Open `work/audio-candidates/index.html` directly in a browser. Its three audio controls reference only sibling files under `work/audio-candidates/auditions/`; it has no network script, upload, production import, or public route. Radio choices and notes are intentionally not persisted, so copy final observations into the sign-off record.

Suggested listening order:

1. F1 Forest ambience: decide whether the microphone noise, wind, and prominent crows support or distract from the Forest visuals.
2. F2 Autumn leaves: decide whether it works as a quiet texture beneath F1, as a replacement direction, or should be rejected.
3. T-ref wood/fire/ice: listen only to decide whether any material is worth extracting later. Reject it if bones/fire/ice associations or theatrical transients are apparent.

Use the same playback device and fixed system volume. Listen to each file once without scrubbing, then compare at low level. Do not select based on loudness alone; these copies have conservative peak safety but are not perceptually loudness-matched.

## Coverage and gaps

| Chapter/world | Status after MVP-03.4 |
| --- | --- |
| Seed | empty; no legally verified suitable candidate ingested |
| Forest | F1 ambient-bed candidate and F2 leaves-layer candidate available for human audition |
| Tree | no accepted candidate; T-ref is a mixed-source reference only |
| Room-Light shared world | empty; no legally verified suitable candidate ingested |

## Human listening sign-off gate

For each candidate, record `keep`, `reject`, or `re-audition`, plus a short reason and the playback device. A `keep` decision authorizes only the next mastering/integration preparation step; it does not authorize changing any production `src`. Before MVP-03.5 activation, selected material still needs a deliberate loop/one-shot edit, current-tool LUFS measurement, mix-context listening, browser/device QA, and a separate explicit production sign-off.

MVP-03.4 is complete when this legal/technical package is reviewed. Audible production remains gated.
