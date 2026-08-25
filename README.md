# 《不止于此 Beyond This》

一件关于跨领域学习，以及观看与创造如何彼此发生的五幕浏览器交互作品。

## 运行

需要 Node.js 20.19+ 或 22.12+。

```bash
pnpm install
pnpm dev
pnpm typecheck
pnpm build
```

## 作品结构

- Seed / Forest / Tree / Room / Light 构成连续五幕体验。
- Room 中的 Book / Process / Projection 呈现 BT-P03 的跨媒介内容。
- React、TypeScript、Three.js / WebGL 与 GSAP 负责实时场景、输入和叙事时间轴。
- 支持滚轮、触控、键盘、减少动态效果与 WebGL 静态降级。

## 发布资料

- 最终发布清单：`docs/final-release-checklist-mvp-01.8.md`
- 最终视觉与设备签收：`docs/final-visual-device-signoff-mvp-01.9.1.md`
- 公共发布准备与部署门禁：`docs/public-launch-preparation-mvp-01.10.md`
- v1.0 发布包与模板：`docs/release-package-mvp-01.10.md`
- 生产部署与真实观众门禁：`docs/production-deployment-real-audience-gate-mvp-01.11.md`
- 真实部署验证与 Launch Evidence：`docs/real-deployment-verification-launch-evidence-mvp-01.12.1.md`
- v1.0 正式发布说明模板：`docs/release-notes-v1.0-template.md`
- Demo 与面试展示包：`docs/presentation-package-mvp-01.8.md`
- 截图与视频素材规范：`docs/screenshot-demo-asset-contract-mvp-01.8.md`
- 部署准备契约：`docs/deployment-readiness-mvp-01.8.md`
- 系统边界：`docs/architecture.md`

作者署名、简历、外部作品集与联系地址统一由 `src/publication.ts` 管理。未经确认时保持 `null`，页面不会显示虚构占位内容。

当前版本达到 **Final Release Candidate — Launch Evidence Ready**。生产契约、真实部署验证清单及单一 Launch Evidence 记录模板已经就绪；由于尚无已确认的生产域、平台部署证据、真机签收及经批准的署名/favicon/分享素材，Public Launch Approved 仍为否。
