import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import gsap from 'gsap'
import { createSeedAudio } from '../../systems/audio/seedAudio'
import { useExperienceController } from '../../systems/timeline/ExperienceController'
import { useExperienceInput } from '../../systems/interaction/useExperienceInput'
import { seedSequence } from './seedRuntime'
import SoundControl from '../shared/SoundControl'
import { createSeedTimeline } from './createSeedTimeline'

export default function SeedExperience() {
  const sequence = useRef(seedSequence)
  const timeline = useRef<gsap.core.Timeline | null>(null)
  const [frame, setFrame] = useState(0)
  const [fallback, setFallback] = useState(false)
  const reduced = useMemo(() => matchMedia('(prefers-reduced-motion: reduce)').matches, [])
  const audio = useMemo(() => createSeedAudio(), [])
  const controller = useExperienceController()

  useEffect(() => {
    try { const canvas = document.createElement('canvas'); setFallback(!canvas.getContext('webgl2') && !canvas.getContext('webgl')) } catch { setFallback(true) }
    const tick = () => setFrame(value => value + 1)
    timeline.current = createSeedTimeline({ state: sequence.current, reducedMotion: reduced, audio, onUpdate: tick, onProgress: () => undefined }).pause()
    return () => { timeline.current?.kill() }
  }, [audio, controller.setChapterProgress, reduced])

  useEffect(() => { timeline.current?.progress(controller.chapterProgress, false); setFrame(value => value + 1) }, [controller.chapterProgress])

  useEffect(() => { audio.setMuted(controller.muted) }, [audio, controller.muted])
  useEffect(() => () => audio.dispose(), [audio])

  const skip = useCallback(() => {
    controller.setOverallProgress(.199999)
    Object.assign(sequence.current, { observation: 1, seedY: -.68, dropletVisible: 0, wetness: 1, seedInfluence: 1, environmentFocus: 1, title: 1, ready: 1 })
    setFrame(value => value + 1)
  }, [controller])

  const continueScene = useCallback(() => {
    if (sequence.current.ready < .9 || sequence.current.transition > 0) return
    gsap.to(sequence.current, {
      transition: 1, duration: 2.3, ease: 'power2.inOut',
      onUpdate: () => setFrame(value => value + 1),
      onComplete: () => controller.setOverallProgress(.2),
    })
  }, [controller])

  useExperienceInput({ enabled: true, onContinue: continueScene })
  const state = sequence.current
  return <main className={state.transition > .65 ? 'experience leaving' : 'experience'} onClick={continueScene} data-frame={frame}>
    <div className="scene" aria-hidden="true" style={{ '--observation': state.observation } as React.CSSProperties}>
      {fallback && <div className="fallback-seed"><i /></div>}
      <div className="grain" /><div className="vignette" /><div className="root-trace" style={{ opacity: state.transition }} />
    </div>
    <header className="controls">
      <span className="chapter">I&nbsp;&nbsp;·&nbsp;&nbsp;SEED</span>
      <div>
        <SoundControl />
        {state.ready < .9 && <button onClick={event => { event.stopPropagation(); skip() }}>跳过开场</button>}
      </div>
    </header>
    <section className="title" style={{ opacity: state.title, transform: `translateY(${(1 - state.title) * 14}px)` }} aria-live="polite">
      <p>未知本身，<br />就是创造的开始。</p><small>Unknown itself is the beginning of creation.</small>
    </section>
    <button className="continue" style={{ opacity: state.ready }} onClick={event => { event.stopPropagation(); continueScene() }} disabled={state.ready < .9}>
      <span>继续探索</span><i />
    </button>
    <p className="next-hint" style={{ opacity: state.transition }}>土壤深处，某种关系正在延伸。</p>
  </main>
}
