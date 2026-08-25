import { Suspense, useEffect } from 'react'
import { Canvas, useThree } from '@react-three/fiber'
import type { ChapterId } from '../systems/timeline/experience.types'
import { useNormalizedPointer } from '../systems/interaction/useNormalizedPointer'
import { useMediaCapabilities, resolveDpr } from '../systems/runtime/mediaCapabilities'
import { resolveForestFrame } from './forest/forest.types'
import { resolveTreeFrame } from './tree/tree.types'
import { resolveRoomFrame } from './room/room.types'
import { resolveLightFrame } from './light/light.types'
import { seedSequence } from './seed/seedRuntime'
import { LazyScenes } from './chapterLoaders'

const cameras: Record<ChapterId, { position: [number, number, number]; fov: number }> = {
  seed: { position: [0, .12, 6.05], fov: 34 }, forest: { position: [0, -.12, 4.8], fov: 36 },
  tree: { position: [0, 3.3, 6.48], fov: 39 }, room: { position: [.18, 1.7, 6.35], fov: 41 },
  light: { position: [.33, 1.7, 5.91], fov: 41 },
}

function CameraReset({ chapter }: { chapter: ChapterId }) {
  const { camera } = useThree()
  useEffect(() => { const preset = cameras[chapter]; camera.position.set(...preset.position); if ('fov' in camera) { camera.fov = preset.fov; camera.updateProjectionMatrix() } }, [camera, chapter])
  return null
}

function FirstFrame({ chapter, onReady }: { chapter: ChapterId; onReady: (chapter: ChapterId) => void }) {
  useEffect(() => {
    let second = 0
    const first = requestAnimationFrame(() => { second = requestAnimationFrame(() => onReady(chapter)) })
    return () => { cancelAnimationFrame(first); cancelAnimationFrame(second) }
  }, [chapter, onReady])
  return null
}

function ActiveScene({ chapter, progress, reduced, onReady }: { chapter: ChapterId; progress: number; reduced: boolean; onReady: (chapter: ChapterId) => void }) {
  const pointer = useNormalizedPointer()
  const content = chapter === 'seed' ? <LazyScenes.seed state={seedSequence} pointer={pointer.current} reduced={reduced} />
    : chapter === 'forest' ? <LazyScenes.forest frame={resolveForestFrame(progress, reduced)} reduced={reduced} />
      : chapter === 'tree' ? <LazyScenes.tree frame={resolveTreeFrame(progress, reduced)} reduced={reduced} />
        : chapter === 'room' ? <LazyScenes.room frame={resolveRoomFrame(progress, reduced)} reduced={reduced} pointer={pointer} />
          : <LazyScenes.light frame={resolveLightFrame(progress, reduced)} reduced={reduced} pointer={pointer} />
  return <><CameraReset chapter={chapter} />{content}<FirstFrame chapter={chapter} onReady={onReady} /></>
}

export default function SceneHost({ chapter, progress, onReady }: { chapter: ChapterId; progress: number; onReady: (chapter: ChapterId) => void }) {
  const media = useMediaCapabilities()
  return <div className={`persistent-scene scene ${chapter}-scene`} aria-hidden="true">
    <Canvas dpr={resolveDpr(media)} shadows gl={{ antialias: true, alpha: false, powerPreference: 'high-performance' }} camera={cameras.seed}>
      <Suspense fallback={null}><ActiveScene chapter={chapter} progress={progress} reduced={media.reducedMotion} onReady={onReady} /></Suspense>
    </Canvas>
  </div>
}
