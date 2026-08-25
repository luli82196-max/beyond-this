import { Suspense, useCallback, useEffect, useMemo, useState } from 'react'
import { useExperienceController } from '../systems/timeline/ExperienceController'
import { useScrollExperience } from '../systems/timeline/useScrollExperience'
import { useExperienceAudio } from '../systems/audio/ExperienceAudioDirector'
import { chapterOrder, type ChapterId } from '../systems/timeline/experience.types'
import { LazyExperiences, prepareChapter } from './chapterLoaders'
import SceneHost from './SceneHost'

export default function Experience() {
  const controller = useExperienceController()
  useScrollExperience(controller)
  useExperienceAudio(controller.overallProgress, controller.muted)
  const [renderedChapter, setRenderedChapter] = useState<ChapterId>('seed')
  const [firstFrameReady, setFirstFrameReady] = useState(false)
  useEffect(() => { void prepareChapter('seed') }, [])
  useEffect(() => {
    let current = true
    setFirstFrameReady(false)
    void prepareChapter(controller.currentChapter).then(() => { if (current) setRenderedChapter(controller.currentChapter) })
    return () => { current = false }
  }, [controller.currentChapter])
  useEffect(() => {
    const index = chapterOrder.indexOf(controller.currentChapter)
    const adjacent = [chapterOrder[index - 1], chapterOrder[index + 1]].filter((chapter): chapter is ChapterId => Boolean(chapter))
    const schedule = () => adjacent.forEach(chapter => { void prepareChapter(chapter) })
    const id = window.setTimeout(schedule, 250); return () => clearTimeout(id)
  }, [controller.currentChapter])
  const markReady = useCallback((chapter: ChapterId) => { if (chapter === renderedChapter) setFirstFrameReady(true) }, [renderedChapter])
  const boundaries = [.2, .45, .65, .9]
  const nearest = boundaries.reduce((best, value) => Math.abs(value - controller.overallProgress) < Math.abs(best - controller.overallProgress) ? value : best)
  const bridgeOpacity = Math.max(0, 1 - Math.abs(controller.overallProgress - nearest) / .018)
  const Chapter = LazyExperiences[renderedChapter]
  const renderProgress = renderedChapter === controller.currentChapter ? controller.chapterProgress : chapterOrder.indexOf(renderedChapter) < chapterOrder.indexOf(controller.currentChapter) ? 1 : 0
  const scene = useMemo(() => <SceneHost chapter={renderedChapter} progress={renderProgress} onReady={markReady} />, [markReady, renderProgress, renderedChapter])
  const firstVisitOpacity = controller.currentChapter === 'seed'
    ? Math.max(0, 1 - controller.chapterProgress / .12)
    : 0
  return <div className="experience-stage" data-rendered-chapter={renderedChapter} data-first-frame-ready={firstFrameReady}>
    {scene}
    <Suspense fallback={null}><Chapter /></Suspense>
    <aside
      className={`first-visit ${firstFrameReady ? 'is-ready' : 'is-loading'}`}
      style={{ opacity: firstVisitOpacity }}
      aria-hidden={firstVisitOpacity === 0}
      aria-live="polite"
    >
      <p className="first-visit-kicker">INTERACTIVE WORK · 交互作品</p>
      <h1><span>不止于此</span><small>BEYOND THIS</small></h1>
      <p className="first-visit-positioning">关于跨领域学习，以及观看与创造如何彼此发生。</p>
      <p className="first-visit-positioning-en">An interactive work on learning across disciplines, and the relation between seeing and making.</p>
      <p className="first-visit-status">{firstFrameReady ? '滚动或向上滑动，进入五幕体验' : '正在生成第一束光…'}</p>
    </aside>
    <div className={`transition-bridge bridge-${boundaries.indexOf(nearest)}`} style={{ opacity: Math.max(bridgeOpacity * .34, firstFrameReady ? 0 : 1) }} aria-hidden="true" />
  </div>
}
