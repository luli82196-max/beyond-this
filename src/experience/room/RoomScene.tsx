import { useFrame, useThree } from '@react-three/fiber'
import { useEffect, useMemo, useRef, useState, type RefObject } from 'react'
import * as THREE from 'three'
import type { RoomFrame } from './room.types'
import type { NormalizedPointer } from '../../systems/camera/camera.types'
import BookMinimalVisual from './BookMinimalVisual'
import { createRoomBookRuntimeInteractionConnection } from './roomBookRuntimeInteractionConnection'
import ProcessMinimalVisual from './ProcessMinimalVisual'
import { createRoomProcessRuntimeInteractionConnection } from './roomProcessRuntimeInteractionConnection'
import type { RoomProcessVisualOutput } from './roomProcessVisualAdapter'
import ProjectionMinimalVisual from './ProjectionMinimalVisual'
import { createRoomProjectionRuntimeInteractionConnection } from './roomProjectionRuntimeInteractionConnection'
import type { RoomProjectionRuntimeOutput } from './roomProjectionRuntimeOutput'
import type { MediaElementLike } from '../../content'

type Props = { frame: RoomFrame; reduced: boolean; pointer: RefObject<NormalizedPointer> }
const seededRandom = (seed: number) => { let value = seed; return () => ((value = value * 16807 % 2147483647) - 1) / 2147483646 }

function surfaceTexture(kind: 'wood' | 'wall' | 'paper') {
  const size = 128, random = seededRandom(kind === 'wood' ? 417 : kind === 'wall' ? 631 : 947), data = new Uint8Array(size * size * 4)
  for (let y = 0; y < size; y++) for (let x = 0; x < size; x++) {
    const i = (y * size + x) * 4
    const grain = kind === 'wood' ? Math.sin(y * .35 + Math.sin(x * .045) * 2.2) * 20 + Math.sin(y * .08) * 9 : kind === 'wall' ? Math.sin(x * .13) * Math.sin(y * .11) * 11 : Math.sin(y * .55 + x * .025) * 5
    const base = kind === 'wood' ? 124 : kind === 'wall' ? 172 : 206
    const value = THREE.MathUtils.clamp(base + grain + (random() - .5) * (kind === 'paper' ? 12 : 22), 36, 235)
    data.set([value, value, value, 255], i)
  }
  const map = new THREE.DataTexture(data, size, size, THREE.RGBAFormat)
  map.wrapS = map.wrapT = THREE.RepeatWrapping; map.repeat.set(kind === 'wood' ? 1.4 : 4, kind === 'wood' ? 7 : 3); map.anisotropy = 4; map.needsUpdate = true
  return map
}

function Interface({ attention, visual }: { attention: number; visual: RoomProcessVisualOutput | null }) {
  const glow = .1 + attention * .36
  return <group position={[1.42, .57, .17]} rotation={[0, -.1, 0]}>
    <mesh><boxGeometry args={[1.02, .68, .06]} /><meshStandardMaterial color="#292824" roughness={.84} /></mesh>
    {visual ? <ProcessMinimalVisual visual={visual} attention={attention} /> : <>
      <mesh position={[0, 0, .032]}><planeGeometry args={[.9, .55]} /><meshBasicMaterial color={new THREE.Color('#263033').lerp(new THREE.Color('#65716b'), attention * .42)} toneMapped={false} /></mesh>
      {[[-.27, .14, .24], [-.08, .14, .38], [.13, .14, .2], [-.18, -.04, .48], [.12, -.04, .31], [-.04, -.21, .58]].map(([x, y, width], i) => <mesh key={i} position={[x, y, .034]}><planeGeometry args={[width, .012]} /><meshBasicMaterial color={i % 3 ? '#9aa99b' : '#baa778'} transparent opacity={glow * (i === 5 ? .6 : .36)} toneMapped={false} /></mesh>)}
    </>}
    <mesh position={[0, -.49, 0]}><boxGeometry args={[.075, .3, .075]} /><meshStandardMaterial color="#37352f" roughness={.86} /></mesh>
    <mesh position={[0, -.65, 0]}><boxGeometry args={[.5, .035, .24]} /><meshStandardMaterial color="#37352f" roughness={.9} /></mesh>
    <mesh position={[.34, -.405, -.03]} rotation={[-Math.PI / 2, 0, .08]}><planeGeometry args={[.55, .015]} /><meshBasicMaterial color="#25231f" transparent opacity={.52} /></mesh>
  </group>
}

function Projection({ attention, output, mediaElement }: { attention: number; output: RoomProjectionRuntimeOutput | null; mediaElement: MediaElementLike | null }) {
  return <group position={[0, 1.62, -2.5]}>
    <mesh><planeGeometry args={[2.45, 1.4]} /><meshStandardMaterial color="#a99f8c" roughness={.98} /></mesh>
    {output ? <ProjectionMinimalVisual output={output} attention={attention} mediaElement={mediaElement} /> : <mesh position={[0, 0, .006]}><planeGeometry args={[2.18, 1.18]} /><meshBasicMaterial color="#696b62" transparent opacity={.08 + attention * .17} toneMapped={false} /></mesh>}
    <mesh position={[-.34, .03, .012]}><planeGeometry args={[.8, .54]} /><meshBasicMaterial color="#8c8069" transparent opacity={attention * .14} toneMapped={false} /></mesh>
    <mesh position={[.45, -.24, .013]}><planeGeometry args={[.76, .018]} /><meshBasicMaterial color="#c0ad83" transparent opacity={attention * .16} toneMapped={false} /></mesh>
    <spotLight position={[0, -.1, 3.2]} intensity={attention * .24} distance={5.8} angle={.36} penumbra={.9} color="#c8b184" />
  </group>
}

function RoomWorld({ frame, reduced, pointer }: Props) {
  const curtain = useRef<THREE.Mesh>(null), dust = useRef<THREE.Points>(null)
  const activeSurface = useRef<'book' | 'process' | 'projection' | null>(null)
  const maps = useMemo(() => ({ wood: surfaceTexture('wood'), wall: surfaceTexture('wall'), paper: surfaceTexture('paper') }), [])
  useEffect(() => () => Object.values(maps).forEach((map) => map.dispose()), [maps])
  const bookRuntime = useMemo(createRoomBookRuntimeInteractionConnection, [])
  const processRuntime = useMemo(createRoomProcessRuntimeInteractionConnection, [])
  const projectionRuntime = useMemo(createRoomProjectionRuntimeInteractionConnection, [])
  const [bookVisual, setBookVisual] = useState(bookRuntime.getVisual)
  const [processVisual, setProcessVisual] = useState(processRuntime.getVisual)
  const [projectionOutput, setProjectionOutput] = useState(projectionRuntime.getOutput)
  const viewportSize = useThree(state => state.size)
  const portrait = viewportSize.width / Math.max(viewportSize.height, 1) < .75
  useEffect(() => {
    const unsubscribeBook = bookRuntime.subscribe(setBookVisual)
    const unsubscribeProcess = processRuntime.subscribe(setProcessVisual)
    const unsubscribeProjection = projectionRuntime.subscribe(setProjectionOutput)
    bookRuntime.connect()
    processRuntime.connect()
    projectionRuntime.connect()
    const closeAll = () => {
      bookRuntime.close(); processRuntime.close(); projectionRuntime.close()
      activeSurface.current = null
    }
    const keyboard = (event: KeyboardEvent) => {
      if (!['Enter', ' ', 'Escape', 'ArrowLeft', 'ArrowRight', 'ArrowUp', 'ArrowDown'].includes(event.key)) return
      const active = activeSurface.current
      if (!active && !['Enter', ' '].includes(event.key)) return
      event.preventDefault(); event.stopImmediatePropagation()
      if (active === 'projection') projectionRuntime.handleKeyboard(event.key)
      else if (active === 'process') processRuntime.handleKeyboard(event.key)
      else bookRuntime.handleKeyboard(event.key)
      if (event.key === 'Escape') activeSurface.current = null
      else if (!active) activeSurface.current = 'book'
    }
    const holdChapter = (event: WheelEvent | TouchEvent) => {
      if (!activeSurface.current) return
      event.preventDefault(); event.stopImmediatePropagation()
    }
    window.addEventListener('keydown', keyboard, true)
    window.addEventListener('wheel', holdChapter, { capture: true, passive: false })
    window.addEventListener('touchmove', holdChapter, { capture: true, passive: false })
    return () => {
      window.removeEventListener('keydown', keyboard, true)
      window.removeEventListener('wheel', holdChapter, true)
      window.removeEventListener('touchmove', holdChapter, true)
      closeAll()
      unsubscribeBook(); unsubscribeProcess(); unsubscribeProjection()
      bookRuntime.disconnect(); processRuntime.disconnect(); projectionRuntime.disconnect()
    }
  }, [bookRuntime, processRuntime, projectionRuntime])
  const dustPositions = useMemo(() => { const random = seededRandom(719); return new Float32Array(Array.from({ length: reduced ? 24 : 52 }, () => [(random() - .5) * 5.2, random() * 3.3 - .25, (random() - .5) * 3.2]).flat()) }, [reduced])
  useFrame(({ camera, clock, size }, dt) => {
    const px = reduced ? 0 : pointer.current.x * .1, py = reduced ? 0 : pointer.current.y * .045
    const portraitFrame = size.width / Math.max(size.height, 1) < .75
    const roomDistance = portraitFrame ? 8.2 : 6.35
    camera.position.x = THREE.MathUtils.damp(camera.position.x, (portraitFrame ? .05 : .18) + frame.interfaceAttention * .15 + px, 1.6, dt); camera.position.y = THREE.MathUtils.damp(camera.position.y, (portraitFrame ? 1.62 : 1.7) + py, 1.6, dt); camera.position.z = THREE.MathUtils.damp(camera.position.z, roomDistance - frame.roomPresence * .44, 1.6, dt); camera.lookAt(.04, .92, -.32)
    if (curtain.current && !reduced) curtain.current.rotation.y = -.08 + Math.sin(clock.elapsedTime * .3) * .015 * frame.curtainDrift
    if (dust.current && !reduced) dust.current.rotation.y = Math.sin(clock.elapsedTime * .06) * .025
  })
  const woodMaterial = <meshStandardMaterial color="#735438" map={maps.wood} bumpMap={maps.wood} bumpScale={.028} roughness={.9} />
  return <>
    <fog attach="fog" args={['#4b4137', 6.2, 12.4]} /><hemisphereLight args={['#a99d88', '#30251e', .3]} />
    <directionalLight position={[-4.5, 4.8, 4]} intensity={1.35 * frame.naturalLight} color="#d2a46d" /><pointLight position={[2.15, 2.55, .2]} intensity={frame.artificialLight * .78} distance={5} color="#d59b59" />
    <mesh position={[0, -.72, -1]} rotation={[-Math.PI / 2, 0, 0]}><planeGeometry args={[12, 10]} /><meshStandardMaterial color="#4c382a" map={maps.wood} bumpMap={maps.wood} bumpScale={.022} roughness={.96} /></mesh>
    {[...Array(10)].map((_, i) => <mesh key={i} position={[-4.95 + i * 1.1, -.708, -1]} rotation={[-Math.PI / 2, 0, 0]}><planeGeometry args={[.012, 9.8]} /><meshBasicMaterial color="#241c17" transparent opacity={.25} /></mesh>)}
    <mesh position={[0, 2.24, -2.57]}><planeGeometry args={[9, 6]} /><meshStandardMaterial color="#665c4f" map={maps.wall} bumpMap={maps.wall} bumpScale={.018} roughness={1} /></mesh>
    <mesh position={[-3.2, 1.55, -2.5]}><planeGeometry args={[1.82, 2.88]} /><meshStandardMaterial color="#756c5c" roughness={1} /></mesh><mesh position={[-3.2, 1.55, -2.44]}><planeGeometry args={[1.5, 2.52]} /><meshBasicMaterial color="#b27e52" toneMapped={false} /></mesh>
    <mesh ref={curtain} position={[-2.25, 1.55, -2.28]}><planeGeometry args={[.76, 2.75, 12, 1]} /><meshStandardMaterial color="#807665" transparent opacity={.82} roughness={1} side={THREE.DoubleSide} /></mesh>
    <mesh position={[0, .04, .17]}><boxGeometry args={[4.4, .17, 1.52]} />{woodMaterial}</mesh>{[-1.82, 1.82].map(x => <mesh key={x} position={[x, -.37, .17]}><boxGeometry args={[.14, .75, 1.24]} />{woodMaterial}</mesh>)}
    <mesh position={[-.08, .148, -.12]} rotation={[-Math.PI / 2, 0, .05]}><planeGeometry args={[.46, .3]} /><meshStandardMaterial color="#827662" roughness={1} /></mesh><mesh position={[.5, .15, .5]} rotation={[-Math.PI / 2, 0, -.09]}><circleGeometry args={[.12, 24]} /><meshStandardMaterial color="#433a30" roughness={.75} /></mesh>
    <group position={portrait ? [.55, 0, 0] : [0, 0, 0]} onPointerEnter={() => { processRuntime.close(); projectionRuntime.close(); bookRuntime.open(); activeSurface.current = 'book' }} onPointerLeave={() => { bookRuntime.close(); activeSurface.current = null }} onClick={(event) => { event.stopPropagation(); processRuntime.close(); projectionRuntime.close(); bookRuntime.open(); activeSurface.current = 'book' }}>
      <mesh position={[-1.28, .18, .37]}><boxGeometry args={[1.45, .3, 1]} /><meshBasicMaterial transparent opacity={0} depthWrite={false} /></mesh>
      {bookVisual && <BookMinimalVisual visual={bookVisual} attention={frame.bookAttention} paperMap={maps.paper} />}
    </group>
    <group
      position={portrait ? [-.55, 0, 0] : [0, 0, 0]}
      onPointerEnter={() => { bookRuntime.close(); projectionRuntime.close(); processRuntime.open(); activeSurface.current = 'process' }}
      onPointerLeave={() => { processRuntime.close(); activeSurface.current = null }}
      onClick={(event) => { event.stopPropagation(); bookRuntime.close(); projectionRuntime.close(); processRuntime.open(); activeSurface.current = 'process' }}
    >
      <mesh position={[1.42, .57, .2]} rotation={[0, -.1, 0]}><boxGeometry args={[1.18, .82, .12]} /><meshBasicMaterial transparent opacity={0} depthWrite={false} /></mesh>
      <Interface attention={frame.interfaceAttention} visual={processVisual} />
    </group>
    <group
      onPointerEnter={() => { bookRuntime.close(); processRuntime.close(); projectionRuntime.open(); activeSurface.current = 'projection' }}
      onPointerLeave={() => { projectionRuntime.close(); activeSurface.current = null }}
      onClick={(event) => { event.stopPropagation(); bookRuntime.close(); processRuntime.close(); projectionRuntime.open(); activeSurface.current = 'projection' }}
    >
      <mesh position={[0, 1.62, -2.46]}><boxGeometry args={[2.6, 1.55, .12]} /><meshBasicMaterial transparent opacity={0} depthWrite={false} /></mesh>
      <Projection attention={frame.projectionAttention} output={projectionOutput} mediaElement={projectionRuntime.getMediaElement()} />
    </group>
    <group position={[2.25, -.3, 1.27]} rotation={[0, -.46, 0]}><mesh position={[0, .22, 0]}><boxGeometry args={[.82, .09, .76]} />{woodMaterial}</mesh>{[-.29, .29].flatMap(x => [-.25, .25].map(z => <mesh key={`${x}-${z}`} position={[x, -.18, z]} rotation={[.02, 0, x * .05]}><boxGeometry args={[.065, .76, .065]} /><meshStandardMaterial color="#40352b" roughness={.96} /></mesh>))}<mesh position={[0, .73, .34]} rotation={[-.14, 0, 0]}><boxGeometry args={[.82, .76, .075]} />{woodMaterial}</mesh></group>
    <points ref={dust}><bufferGeometry><bufferAttribute attach="attributes-position" args={[dustPositions, 3]} /></bufferGeometry><pointsMaterial color="#dfc99e" size={.018} transparent opacity={.11 * frame.naturalLight} depthWrite={false} /></points>
  </>
}

export default function RoomScene(props: Props) { return <><color attach="background" args={['#4b4137']} /><RoomWorld {...props} /></> }
