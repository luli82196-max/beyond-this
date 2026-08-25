import { useMemo } from 'react'
import { resolveForestFrame } from './forest.types'
import { useExperienceController } from '../../systems/timeline/ExperienceController'
import SoundControl from '../shared/SoundControl'

export default function ForestExperience() {
  const controller = useExperienceController()
  const reduced = useMemo(() => matchMedia('(prefers-reduced-motion: reduce)').matches, [])
  const frame = resolveForestFrame(controller.chapterProgress, reduced)

  return <main className="experience forest-experience" style={{ opacity: (.16 + frame.scaleReveal * .84) * (1 - frame.exitFade * .82) }}>
    <div className="scene chapter-effects" aria-hidden="true"><div className="forest-atmosphere" /><div className="grain" /><div className="forest-vignette" /></div>
    <header className="controls forest-controls">
      <span className="chapter">II&nbsp;&nbsp;·&nbsp;&nbsp;FOREST</span>
      <div><SoundControl /></div>
    </header>
    <section className="forest-title" style={{ opacity: frame.titleOpacity, transform: `translateY(${(1 - frame.titleOpacity) * 10}px)` }}>
      <p>存在，在关系中显现。</p><small>Presence reveals itself through relation.</small>
    </section>
    <p className="forest-observe" style={{ opacity: Math.max(0, frame.canopyAttention - frame.exitFade) }}>向上观察</p>
  </main>
}
