import { useEffect, useMemo, useRef } from 'react'
import { resolveRoomFrame } from './room.types'
import { useExperienceController } from '../../systems/timeline/ExperienceController'
import SoundControl from '../shared/SoundControl'
import { roomInteractionSession, type RoomSurfaceId, useRoomInteractionSession } from './roomInteractionSession'

const surfaces: ReadonlyArray<{ id: RoomSurfaceId; label: string; note: string }> = [
  { id: 'book', label: 'Book', note: '思想留下的页' },
  { id: 'process', label: 'Process', note: '过程成为方法' },
  { id: 'projection', label: 'Projection', note: '观看成为表达' },
]

export default function RoomExperience() {
  const controller = useExperienceController()
  const reduced = useMemo(() => matchMedia('(prefers-reduced-motion: reduce)').matches, [])
  const frame = resolveRoomFrame(controller.chapterProgress, reduced)
  const session = useRoomInteractionSession()
  const launchers = useRef<Partial<Record<RoomSurfaceId, HTMLButtonElement | null>>>({})
  const previousActive = useRef<RoomSurfaceId | null>(null)
  useEffect(() => () => roomInteractionSession.reset(), [])
  useEffect(() => {
    if (previousActive.current && !session.activeSurface) launchers.current[previousActive.current]?.focus({ preventScroll: true })
    previousActive.current = session.activeSurface
  }, [session.activeSurface])

  const open = (surface: RoomSurfaceId) => roomInteractionSession.open(surface)
  const close = () => roomInteractionSession.close()

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
    <nav className="room-surface-nav" aria-label="Room works">
      {surfaces.map(surface => <button
        key={surface.id}
        ref={node => { launchers.current[surface.id] = node }}
        type="button"
        className={`room-surface-trigger room-surface-${surface.id}`}
        aria-expanded={session.activeSurface === surface.id}
        aria-controls="room-deep-content-status"
        onPointerEnter={() => roomInteractionSession.hover(surface.id)}
        onPointerLeave={() => roomInteractionSession.hover(null)}
        onFocus={() => roomInteractionSession.focus(surface.id)}
        onBlur={() => roomInteractionSession.focus(null)}
        onKeyDown={event => {
          if (!['Enter', ' '].includes(event.key)) return
          event.preventDefault()
          open(surface.id)
        }}
        onClick={() => open(surface.id)}
      ><span>{surface.label}</span><small>{surface.note}</small></button>)}
    </nav>
    {!session.hintDismissed && <p className="room-discovery-hint">选择一件作品 · Tab / 点击 / 轻触</p>}
    <div id="room-deep-content-status" className={`room-deep-status ${session.activeSurface ? 'is-open' : ''}`} aria-live="polite">
      {session.activeSurface && <><p>{surfaces.find(surface => surface.id === session.activeSurface)?.label} 已打开</p><button type="button" onClick={close} aria-label={`Close ${session.activeSurface}`}>关闭 <span aria-hidden="true">×</span></button></>}
    </div>
  </main>
}
