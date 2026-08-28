# MVP-04.2 — Public Launch Sign-off

Date: 2026-08-28

## Verdict

**Public Launch Candidate — awaiting production-network and real-device sign-off**

`Public Launch Approved` is **not** granted. This run could not obtain live production or Vercel control-plane evidence because HTTPS access to the production domain timed out and GitHub remote verification was reset. Required iPhone and Android checks also remain manual.

## 1. Verified online

No online item is marked verified in this run.

- `https://beyond-this.vercel.app/`: direct HTTPS request timed out; the in-app browser also timed out before the document loaded.
- GitHub `ls-remote`: connection reset, so the remote branch tip was not freshly queried.
- Vercel deployment ID / Ready status: unavailable; no console or API evidence was obtained.
- Production metadata, favicon, OG, MP4, audio, cache headers, Range response, unknown-static 404 behavior, SPA fallback, console output, and the forward/reverse experience path therefore remain unverified online.

These are environment/network failures, not evidence that production is broken or healthy.

## 2. Verified locally / automated, but not real-device

### Git and release commit

- Local `HEAD`: `b64b6524c21cc654b0366f9eafc649d8c162e8ff` (`release: prepare final presentation package`).
- Local remote-tracking `origin/main`: the same full hash.
- `git status --short --branch`: `main...origin/main`; worktree was clean before this document was added.
- `b64b652` contains the README update, metadata update, six screenshots, OG, favicon, demo capture specification, portfolio/interview package, and MVP-04.1 audit.
- This proves local consistency with the last fetched remote-tracking state; it does **not** replace a fresh `ls-remote` or Vercel deployment proof.

### Metadata and release assets

- `index.html` locally contains:
  - canonical `https://beyond-this.vercel.app`
  - `og:title`, `og:description`, and absolute `og:image`
  - `twitter:card=summary_large_image`, Twitter title/description/image
  - homepage title and description
  - `/icons/favicon-64.png`
- No `localhost` or staging URL was found in the inspected metadata.
- `public/og/beyond-this-og.png`: exists, PNG, 1200×630.
- `public/icons/favicon-64.png`: exists, PNG, 64×64.
- Six release screenshot files exist at 1691×1080 and README references resolve. Their internal encoding is JPEG despite the `.png` filenames; browsers render them, but future asset cleanup should either rename them or re-encode them. This is not treated as a launch P0.
- `docs/demo-capture-spec.md` and `docs/portfolio-copy-interview-package.md` exist.

### Media and cache configuration

- Projection source is configured as `/media/after_the_second_sunset_motion_blocking_v01.mp4`.
- Forest audio sources are versioned:
  - `/audio/forest/forest-ambience-loop-v1.ogg`
  - `/audio/forest/autumn-leaves-loop-v1.ogg`
- `vercel.json` locally declares `Cache-Control: public, max-age=31536000, immutable` for `/audio/(.*)`.
- Actual production MIME, status, cache headers, MP4 `200`, and Range `206` / `Content-Range` were not observed and remain online blockers.
- `vercel.json` currently has a broad SPA rewrite. Because production responses could not be inspected, unknown-static 404 behavior is not claimed. Do not change this without a reproduced production contract failure.

### Regression scope

No source or configuration change was made in this stage. The prior MVP-04.1 TypeScript, relevant smoke tests, and production build remain the latest automated validation; they were not repeated merely for formality.

## 3. Remaining manual blockers

### Production / Vercel

1. Open the production URL and confirm the latest deployment is Ready; record deployment ID and commit `b64b652` if the Vercel UI exposes both.
2. Confirm live metadata, favicon, and OG responses.
3. Run the complete forward path `Seed → Forest → Tree → Room → Book → close → Process → close → Projection → close → Light`, then reverse at least `Light → Room → Tree → Forest`.
4. Confirm Room three-entry behavior, MP4 playback, zero serious console warnings/errors, no pre-enable audio request/autoplay, on-demand Forest F1/F2 requests after a gesture, smooth Forest exit, and mute/unmute.
5. Capture HTTP evidence for MP4 full and Range requests, audio MIME/cache headers, unknown-static 404, and intended SPA fallback.

### Five-minute real-device checklist

Run once on **iPhone Safari** and once on **Android Chrome**; target about two minutes per device.

1. Fresh-load Seed with sound off. Confirm silence and no autoplay prompt or unexpected audio.
2. Enable sound, enter Forest, listen for both ambience layers, then move to Tree. Confirm a smooth fade with no click, burst, or stuck loop.
3. Return to Forest; mute and unmute once. Confirm recovery without duplicate or louder overlapping playback.
4. While Forest audio is active, background the browser for 10 seconds and return. Confirm audio lifecycle is sane: no duplicate loop, runaway volume, or permanently dead sound.
5. Open Room → Projection and play/close once. Confirm video works and no white frame or stuck overlay.

Use the phone speaker on one pass and headphones on the other; swap if convenient. Record device model, OS/browser version, pass/fail, and any symptom. Any autoplay, media 404, serious console error, duplicate audio, or unrecoverable background/foreground failure is a P0 blocker.

## Final gate

- **Current status:** Public Launch Candidate — awaiting production-network and real-device sign-off.
- **Approval condition:** all online checks above have direct evidence and both real-device passes are recorded without P0 issues.
- **Current P0 finding:** none reproduced; several P0-sensitive gates are unverified.
