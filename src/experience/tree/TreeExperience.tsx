import { useMemo } from 'react'
import { resolveTreeFrame } from './tree.types'
import { useExperienceController } from '../../systems/timeline/ExperienceController'
import SoundControl from '../shared/SoundControl'

export default function TreeExperience() {
  const controller = useExperienceController()
  const reduced = useMemo(() => matchMedia('(prefers-reduced-motion: reduce)').matches, [])
  const frame = resolveTreeFrame(controller.chapterProgress, reduced)

  const entry = Math.min(1, controller.chapterProgress / .08)
  return <main className="experience tree-experience" style={{ opacity: (.2 + entry * .8) * (1 - frame.exitFade * .78) }}>
    <div className="scene tree-scene" aria-hidden="true">
      <div className="tree-time-veil" style={{ opacity: frame.timeVeil }} />
      <div className="tree-room-threshold" style={{ opacity: frame.roomThreshold }} />
      <div className="grain" /><div className="tree-vignette" />
    </div>
    <header className="controls tree-controls">
      <span className="chapter">III&nbsp;&nbsp;·&nbsp;&nbsp;TREE</span>
      <div><SoundControl /></div>
    </header>
    <section className="tree-title" style={{ opacity: frame.titleOpacity, transform: `translateY(${(1 - frame.titleOpacity) * 10}px)` }}>
      <p>离开原处，进入新的关系。</p><small>Leaving one place, entering another relation.</small>
    </section>
    <p className="tree-transition-note" style={{ opacity: Math.max(0, frame.roomThreshold - frame.exitFade) }}>向另一处延续</p>
  </main>
}
