# Beyond This — v1.0 Release Package v0.1

Date: 2026-08-25

## Final presentation flow

1. Open the stable HTTPS root from a cold cache and allow the Home frame to settle.
2. Travel continuously through Seed, Forest, and Tree without opening explanatory material.
3. Enter Room and pause long enough to establish the space.
4. Open Book, Process, and Projection as three views of BT-P03; close each before opening the next.
5. Let Projection read as light on the wall, then close it and return naturally to Room.
6. Complete Light and open About only after the ending settles.
7. For a short demonstration, use the existing 30-second route; for interviews, use the existing three-minute route in `presentation-package-mvp-01.8.md`.

Do not replace the ending with a résumé slide, add unapproved overlays, or claim an identity, role, client, collaborator, award, metric, or public URL that has not been supplied and approved.

## Public release note draft

### Beyond This v1.0

《不止于此 · Beyond This》是一件关于跨领域学习，以及观看与创造如何彼此发生的五幕浏览器交互作品。

体验从 Seed、Forest 与 Tree 展开，在 Room 中通过 Book、Process 与 Projection 呈现同一作品的成品、创作判断与时间性观看，最后在 Light 中收束。它支持滚轮、触控与键盘输入，并包含减少动态效果、WebGL 静态降级及明确的媒体生命周期边界。

本次 v1.0 发布包含完整五幕体验、BT-P03 三个展示入口，以及面向公开部署的元数据、设备验证与发布契约。正式作者署名、公开链接和分享素材只在获得批准后加入。

## Changelog template

```markdown
# Changelog

## [Unreleased]

### Added
- None.

### Changed
- None.

### Fixed
- None.

### Known limitations
- Add only observed, reproducible limitations with affected devices/browsers.

## [1.0.0] - YYYY-MM-DD

### Added
- Five-act Seed / Forest / Tree / Room / Light browser experience.
- BT-P03 Book / Process / Projection presentation surfaces.
- Responsive input, reduced-motion behavior, WebGL fallback, and media lifecycle handling.

### Release validation
- TypeScript strict: passed.
- Production build: passed.
- Full regression: 19/19 unique test files passed.
- Physical-device and deployed-origin sign-off: link to the final evidence record.

### Known limitations
- Record only accepted limitations confirmed at release time.
```

## v1.0 release record structure

Create the final record only after all launch gates pass. It should contain:

1. release version, date, exact source revision or immutable package identifier;
2. production origin and deployment platform;
3. approved author credit and public destinations actually shown;
4. canonical, `og:url`, `og:image`, and favicon evidence;
5. automated validation results and production bundle/media inventory;
6. signed-off iPhone Safari, Android Chrome, desktop Chrome, and Edge evidence;
7. Motion seam/brightness/color approval and the approved display/device;
8. final six screenshots plus 30-second and three-minute recordings;
9. accepted known limitations, rollback package, and post-launch owner;
10. final decision: `Public Launch Approved`, approver, and timestamp.

## Publication procedure

1. Freeze the exact candidate and rerun the automated validation set.
2. Deploy `dist` to the confirmed origin with the required rewrite, MIME, range, and cache behavior.
3. Add only the approved identity, canonical, OG image, and favicon values; rebuild and redeploy if source metadata changes.
4. Complete deployed-origin and physical-device sign-off.
5. Capture the final screenshots and recordings from that exact release.
6. Complete the v1.0 release record and change the decision only when every blocking item has evidence.
7. Announce the release using the approved note and preserve the validated package for rollback.
