import { useMemo } from 'react'
import { resolveRoomFrame } from './room.types'
import { useExperienceController } from '../../systems/timeline/ExperienceController'
import SoundControl from '../shared/SoundControl'

export default function RoomExperience() {
  const controller = useExperienceController()
  const reduced = useMemo(() => matchMedia('(prefers-reduced-motion: reduce)').matches, [])
  const frame = resolveRoomFrame(controller.chapterProgress, reduced)

  return <main className="experience room-experience" style={{ opacity: (.22 + frame.roomPresence * .78) * (1 - frame.exitFade * .72) }}>
    <div className="scene room-scene" aria-hidden="true">
      <div className="room-tree-threshold" style={{ opacity: frame.threshold }} />
      <div className="room-dusk" style={{ opacity: frame.roomPresence }} />
      <div className="grain" /><div className="room-vignette" />
    </div>
    <header className="controls room-controls">
      <span className="chapter">IV&nbsp;&nbsp;·&nbsp;&nbsp;ROOM</span>
      <div><SoundControl /></div>
    </header>
    <section className="room-title" style={{ opacity: frame.titleOpacity, transform: `translateY(${(1 - frame.titleOpacity) * 10}px)` }}>
      <p>进入生活，意义由此延续。</p><small>Entering life, meaning continues through relation.</small>
    </section>
    <div className="room-medium-notes" aria-hidden="true">
      <span className="book-note" style={{ opacity: frame.bookAttention * (1 - frame.projectionAttention) }}>思想留下的页</span>
      <span className="projection-note" style={{ opacity: frame.projectionAttention * (1 - frame.interfaceAttention) }}>观看成为表达</span>
      <span className="interface-note" style={{ opacity: frame.interfaceAttention * (1 - frame.exitFade) }}>向未知继续</span>
    </div>
  </main>
}
