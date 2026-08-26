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
import { createWorkedWoodTexture, WOOD_CONTINUITY } from '../materialContinuity'

type Props = { frame: RoomFrame; reduced: boolean; pointer: RefObject<NormalizedPointer> }
const seededRandom = (seed: number) => { let value = seed; return () => ((value = value * 16807 % 2147483647) - 1) / 2147483646 }

function surfaceTexture(kind: 'wall' | 'paper') {
  const size = 128, random = seededRandom(kind === 'wall' ? 631 : 947), data = new Uint8Array(size * size * 4)
  for (let y = 0; y < size; y++) for (let x = 0; x < size; x++) {
    const i = (y * size + x) * 4
    const grain = kind === 'wall' ? Math.sin(x * .13) * Math.sin(y * .11) * 11 : Math.sin(y * .55 + x * .025) * 5
    const base = kind === 'wall' ? 172 : 206
    const value = THREE.MathUtils.clamp(base + grain + (random() - .5) * (kind === 'paper' ? 12 : 22), 36, 235)
    data.set([value, value, value, 255], i)
  }
  const map = new THREE.DataTexture(data, size, size, THREE.RGBAFormat)
  map.wrapS = map.wrapT = THREE.RepeatWrapping; map.repeat.set(4, 3); map.anisotropy = 4; map.needsUpdate = true
  return map
}

function cloneWoodTexture(source: THREE.Texture, repeat: [number, number], offset: [number, number], rotation = 0) {
  const map = source.clone()
  map.wrapS = map.wrapT = THREE.RepeatWrapping
  map.repeat.set(...repeat); map.offset.set(...offset); map.rotation = rotation
  map.center.set(.5, .5); map.needsUpdate = true
  return map
}

function curtainGeometry(width = .92, height = 2.78) {
  const columns = 18, rows = 7, geometry = new THREE.PlaneGeometry(width, height, columns, rows)
  const position = geometry.attributes.position
  for (let i = 0; i < position.count; i++) {
    const x = position.getX(i), y = position.getY(i)
    const falloff = THREE.MathUtils.smoothstep((y + height / 2) / height, 0, 1)
    position.setZ(i, Math.sin((x / width + .5) * Math.PI * 7) * (.035 + falloff * .025) + Math.sin(y * 1.7) * .008)
    position.setX(i, x * (1 - falloff * .05))
  }
  position.needsUpdate = true; geometry.computeVertexNormals()
  return geometry
}

function Table({ maps }: { maps: { table: THREE.Texture; worn: THREE.Texture } }) {
  const top = <meshStandardMaterial color={WOOD_CONTINUITY.roomWoodTarget} map={maps.table} bumpMap={maps.table} bumpScale={.019} roughness={.72} />
  const structure = <meshStandardMaterial color="#563d2b" map={maps.worn} bumpMap={maps.worn} bumpScale={.012} roughness={.86} />
  return <group>
    <mesh position={[0, .04, .17]} castShadow receiveShadow><boxGeometry args={[4.42, .19, 1.54, 5, 2, 3]} />{top}</mesh>
    <mesh position={[0, -.105, .17]}><boxGeometry args={[3.82, .12, 1.12]} />{structure}</mesh>
    {[-1.78, 1.78].flatMap(x => [-.42, .73].map(z => <group key={`${x}-${z}`} position={[x, -.43, z]}>
      <mesh castShadow><cylinderGeometry args={[.075, .095, .72, 8]} />{structure}</mesh>
      <mesh position={[0, .34, 0]}><boxGeometry args={[.2, .06, .2]} />{structure}</mesh>
    </group>))}
    {[-.42, .73].map(z => <mesh key={z} position={[0, -.4, z]} rotation={[0, 0, Math.PI / 2]}><cylinderGeometry args={[.045, .055, 3.55, 8]} />{structure}</mesh>)}
    <mesh position={[0, .145, .15]} rotation={[-Math.PI / 2, 0, .015]}><planeGeometry args={[2.2, .56]} /><meshStandardMaterial color="#9a7959" transparent opacity={.13} roughness={.48} depthWrite={false} /></mesh>
  </group>
}

function Chair({ map }: { map: THREE.Texture }) {
  const wood = <meshStandardMaterial color="#4a372b" map={map} bumpMap={map} bumpScale={.014} roughness={.9} />
  return <group position={[2.25, -.31, 1.27]} rotation={[0, -.46, 0]}>
    <mesh position={[0, .23, 0]} castShadow><boxGeometry args={[.84, .095, .76, 3, 1, 3]} />{wood}</mesh>
    {[-.31, .31].flatMap(x => [-.27, .27].map(z => <mesh key={`${x}-${z}`} position={[x, -.18, z]} rotation={[x * .045, 0, z * .05]} castShadow><cylinderGeometry args={[.032, .048, .78, 8]} />{wood}</mesh>))}
    {[-.31, .31].map(x => <mesh key={x} position={[x, .71, .31]} rotation={[-.1, 0, x * .035]}><cylinderGeometry args={[.035, .045, 1.02, 8]} />{wood}</mesh>)}
    {[.48, .68, .87].map((y, i) => <mesh key={y} position={[0, y, .34]} rotation={[-.12, 0, 0]}><boxGeometry args={[.72 - i * .045, .1, .055]} />{wood}</mesh>)}
    <mesh position={[0, -.15, .29]} rotation={[0, 0, Math.PI / 2]}><cylinderGeometry args={[.027, .027, .58, 8]} />{wood}</mesh>
  </group>
}

function Dressing({ paperMap }: { paperMap: THREE.Texture }) {
  const paper = <meshStandardMaterial color="#bdb197" map={paperMap} bumpMap={paperMap} bumpScale={.006} roughness={.76} />
  return <group>
    <mesh position={[-.15, .15, -.15]} rotation={[-Math.PI / 2, 0, .045]}>{<planeGeometry args={[.5, .34]} />}{paper}</mesh>
    <mesh position={[.24, .153, -.02]} rotation={[-Math.PI / 2, 0, -.11]}><planeGeometry args={[.38, .27]} />{paper}</mesh>
    <mesh position={[.08, .17, -.05]} rotation={[0, 0, .22]}><cylinderGeometry args={[.012, .012, .56, 8]} /><meshStandardMaterial color="#3a3027" roughness={.58} /></mesh>
    {[0, 1, 2].map(i => <mesh key={i} position={[.73, .18 + i * .055, .43]} rotation={[0, -.12 + i * .04, .015 * i]}><boxGeometry args={[.56 - i * .035, .05, .38]} /><meshStandardMaterial color={i === 1 ? '#66503b' : '#8c7b61'} map={paperMap} roughness={i === 1 ? .82 : .72} /></mesh>)}
    <group position={[1.2, .22, -.18]}><mesh><cylinderGeometry args={[.105, .09, .2, 20]} /><meshStandardMaterial color="#4b4439" roughness={.64} /></mesh><mesh position={[.12, .02, 0]} rotation={[Math.PI / 2, 0, 0]}><torusGeometry args={[.075, .018, 8, 16, Math.PI * 1.55]} /><meshStandardMaterial color="#4b4439" roughness={.64} /></mesh></group>
  </group>
}

function Interface({ attention, visual }: { attention: number; visual: RoomProcessVisualOutput | null }) {
  const glow = .1 + attention * .36
  return <group position={[1.42, .57, .17]} rotation={[0, -.1, 0]}>
    <mesh><boxGeometry args={[1.06, .72, .075]} /><meshStandardMaterial color="#292824" roughness={.7} /></mesh>
    <mesh position={[0, 0, .031]}><boxGeometry args={[.96, .62, .03]} /><meshStandardMaterial color="#151714" roughness={.62} /></mesh>
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
    <mesh position={[0, 0, -.035]}><boxGeometry args={[2.48, 1.43, .08]} /><meshStandardMaterial color="#8f887b" roughness={.76} /></mesh>
    <mesh position={[0, .75, .02]} rotation={[0, 0, Math.PI / 2]}><cylinderGeometry args={[.026, .026, 2.62, 10]} /><meshStandardMaterial color="#4c4439" roughness={.68} /></mesh>
    {output ? <ProjectionMinimalVisual output={output} attention={attention} mediaElement={mediaElement} /> : <mesh position={[0, 0, .006]}><planeGeometry args={[2.18, 1.18]} /><meshBasicMaterial color="#696b62" transparent opacity={.08 + attention * .17} toneMapped={false} /></mesh>}
    <mesh position={[-.34, .03, .012]}><planeGeometry args={[.8, .54]} /><meshBasicMaterial color="#8c8069" transparent opacity={attention * .14} toneMapped={false} /></mesh>
    <mesh position={[.45, -.24, .013]}><planeGeometry args={[.76, .018]} /><meshBasicMaterial color="#c0ad83" transparent opacity={attention * .16} toneMapped={false} /></mesh>
    <spotLight position={[0, -.1, 3.2]} intensity={attention * .24} distance={5.8} angle={.36} penumbra={.9} color="#c8b184" />
  </group>
}

function RoomWorld({ frame, reduced, pointer }: Props) {
  const curtain = useRef<THREE.Mesh>(null), dust = useRef<THREE.Points>(null)
  const activeSurface = useRef<'book' | 'process' | 'projection' | null>(null)
  const maps = useMemo(() => {
    const source = createWorkedWoodTexture()
    return { source, table: cloneWoodTexture(source, [1.15, 5.6], [.09, .17]), floor: cloneWoodTexture(source, [2.8, 3.1], [.31, .08], Math.PI / 2), chair: cloneWoodTexture(source, [1.8, 8.2], [.57, .23]), window: cloneWoodTexture(source, [2.2, 6.4], [.73, .36]), worn: cloneWoodTexture(source, [1.6, 6.8], [.42, .61]), wall: surfaceTexture('wall'), paper: surfaceTexture('paper') }
  }, [])
  const curtainShape = useMemo(curtainGeometry, [])
  useEffect(() => () => { Object.values(maps).forEach((map) => map.dispose()); curtainShape.dispose() }, [maps, curtainShape])
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
  return <>
    <fog attach="fog" args={['#45423f', 6.4, 12.8]} /><hemisphereLight args={['#82909a', '#2c211b', .34]} />
    <directionalLight position={[-4.5, 4.8, 4]} intensity={1.18 * frame.naturalLight} color="#9fb3c2" /><pointLight position={[2.15, 2.55, .2]} intensity={frame.artificialLight * .7} distance={5} color="#d49a5e" />
    <spotLight position={[-1.25, 2.8, 1.8]} target-position={[-1.2, .1, .35]} intensity={.23 * frame.bookAttention} distance={5} angle={.34} penumbra={.92} color="#d6ae76" />
    <mesh position={[0, -.72, -1]} rotation={[-Math.PI / 2, 0, 0]} receiveShadow><planeGeometry args={[12, 10]} /><meshStandardMaterial color="#463529" map={maps.floor} bumpMap={maps.floor} bumpScale={.016} roughness={.91} /></mesh>
    {[...Array(10)].map((_, i) => <mesh key={i} position={[-4.95 + i * 1.1, -.708, -1]} rotation={[-Math.PI / 2, 0, 0]}><planeGeometry args={[.012, 9.8]} /><meshBasicMaterial color="#241c17" transparent opacity={.25} /></mesh>)}
    <mesh position={[0, 2.24, -2.57]} receiveShadow><planeGeometry args={[9, 6]} /><meshStandardMaterial color="#625d55" map={maps.wall} bumpMap={maps.wall} bumpScale={.012} roughness={.84} /></mesh>
    <group position={[-3.2, 1.55, -2.46]}>
      <mesh position={[0, 0, -.07]}><boxGeometry args={[2.05, 3.08, .18]} /><meshStandardMaterial color="#4d4034" map={maps.window} bumpMap={maps.window} bumpScale={.014} roughness={.8} /></mesh>
      <mesh position={[0, 0, .04]}><boxGeometry args={[1.68, 2.7, .12]} /><meshPhysicalMaterial color="#778997" roughness={.2} transmission={.12} transparent opacity={.78} /></mesh>
      <mesh position={[0, 0, .12]}><boxGeometry args={[.09, 2.78, .1]} /><meshStandardMaterial color="#59493a" map={maps.window} roughness={.82} /></mesh>
      <mesh position={[0, 0, .13]}><boxGeometry args={[1.76, .09, .1]} /><meshStandardMaterial color="#59493a" map={maps.window} roughness={.82} /></mesh>
      <mesh position={[0, -1.49, .14]}><boxGeometry args={[2.15, .18, .38]} /><meshStandardMaterial color="#66503d" map={maps.window} roughness={.76} /></mesh>
    </group>
    <mesh ref={curtain} geometry={curtainShape} position={[-2.23, 1.54, -2.2]}><meshStandardMaterial color="#777164" roughness={.72} side={THREE.DoubleSide} /></mesh>
    <mesh position={[-2.18, 1.54, -2.235]} scale={[1.05, 1, 1]} geometry={curtainShape}><meshStandardMaterial color="#55514a" transparent opacity={.38} roughness={.88} side={THREE.BackSide} /></mesh>
    <Table maps={{ table: maps.table, worn: maps.worn }} />
    <Dressing paperMap={maps.paper} />
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
    <Chair map={maps.chair} />
    <points ref={dust}><bufferGeometry><bufferAttribute attach="attributes-position" args={[dustPositions, 3]} /></bufferGeometry><pointsMaterial color="#dfc99e" size={.018} transparent opacity={.11 * frame.naturalLight} depthWrite={false} /></points>
  </>
}

export default function RoomScene(props: Props) { return <><color attach="background" args={['#4b4137']} /><RoomWorld {...props} /></> }
