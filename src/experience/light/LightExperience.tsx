import { useMemo } from 'react'
import { resolveLightFrame } from './light.types'
import { useExperienceController } from '../../systems/timeline/ExperienceController'
import SoundControl from '../shared/SoundControl'
import { publicationProfile } from '../../publication'

export default function LightExperience() {
  const controller = useExperienceController()
  const reduced = useMemo(() => matchMedia('(prefers-reduced-motion: reduce)').matches, [])
  const frame = resolveLightFrame(controller.chapterProgress, reduced)
  const publicationLinks = [publicationProfile.portfolio, publicationProfile.resume, publicationProfile.contact]
    .filter((link): link is NonNullable<typeof link> => link !== null)

  return <main className="experience light-experience" style={{ opacity: .28 + frame.presence * .72 }}>
    <div className="scene light-scene" aria-hidden="true">
      <div className="light-room-continuity" style={{ opacity: frame.roomContinuity }} />
      <div className="light-breath" style={{ opacity: frame.lightMaturity * .34 }} />
      <div className="grain" /><div className="light-vignette" />
    </div>
    <header className="controls light-controls">
      <span className="chapter">V&nbsp;&nbsp;·&nbsp;&nbsp;LIGHT</span>
      <div><SoundControl /></div>
    </header>
    <section className="light-title" style={{ opacity: frame.titleOpacity, transform: `translateY(${(1 - frame.titleOpacity) * 8}px)` }}>
      <p>重新观看，世界仍在彼此之中。</p>
      <small>To look again, and find the world still held in relation.</small>
    </section>
    <footer className="experience-complete" style={{ opacity: Math.max(0, (controller.chapterProgress - .84) / .16) }}>
      <p>五幕体验至此完成</p>
      <small>THE EXPERIENCE IS COMPLETE · SCROLL BACK TO REVISIT</small>
      <details>
        <summary>关于作品 · ABOUT</summary>
        <div className="project-note">
          <p>《不止于此》是一件关于跨领域学习、观看与创造关系的五幕交互作品。观众由一颗种子出发，穿过森林、树、房间与光，在观察和参与之间逐步进入作品。</p>
          <dl>
            <div><dt>形式</dt><dd>浏览器端实时交互叙事</dd></div>
            <div><dt>方法</dt><dd>程序化视觉、滚动编排、空间声音与跨媒介内容共同构成体验</dd></div>
            <div><dt>技术</dt><dd>React · TypeScript · WebGL / Three.js · GSAP</dd></div>
            {publicationProfile.authorName && <div><dt>创作者</dt><dd>{publicationProfile.authorName}</dd></div>}
          </dl>
          {publicationLinks.length > 0 && <nav aria-label="作者与项目链接">
            {publicationLinks.map(link => <a key={link.href} href={link.href} target="_blank" rel="noreferrer">{link.label}</a>)}
          </nav>}
        </div>
      </details>
    </footer>
  </main>
}
