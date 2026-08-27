import { useFrame, useThree } from '@react-three/fiber'
import { useEffect, useMemo, useRef, type RefObject } from 'react'
import * as THREE from 'three'
import type { LightFrame } from './light.types'
import type { NormalizedPointer } from '../../systems/camera/camera.types'
import { createWorkedWoodTexture, WOOD_CONTINUITY } from '../materialContinuity'

type Props = { frame: LightFrame; reduced: boolean; pointer: RefObject<NormalizedPointer> }
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
  map.wrapS = map.wrapT = THREE.RepeatWrapping; map.repeat.set(...repeat); map.offset.set(...offset); map.rotation = rotation
  map.center.set(.5, .5); map.needsUpdate = true
  return map
}

function curtainGeometry(width = .92, height = 2.78) {
  const geometry = new THREE.PlaneGeometry(width, height, 18, 7), position = geometry.attributes.position
  for (let i = 0; i < position.count; i++) {
    const x = position.getX(i), y = position.getY(i), falloff = THREE.MathUtils.smoothstep((y + height / 2) / height, 0, 1)
    position.setZ(i, Math.sin((x / width + .5) * Math.PI * 7) * (.035 + falloff * .025) + Math.sin(y * 1.7) * .008)
    position.setX(i, x * (1 - falloff * .05))
  }
  position.needsUpdate = true; geometry.computeVertexNormals()
  return geometry
}

function ExistingMedia({ frame, paperMap }: { frame: LightFrame; paperMap: THREE.Texture }) {
  return <>
    <group position={[-1.3, .05, .42]} rotation={[0, -.18, -.04]}>
      <mesh position={[-.29, .035, 0]} rotation={[0, 0, .07]}><boxGeometry args={[.58, .045, .68]} /><meshStandardMaterial color={new THREE.Color('#b9aa8d').lerp(new THREE.Color('#d0c3a5'), frame.bookLight * .45)} map={paperMap} bumpMap={paperMap} bumpScale={.008} roughness={1} /></mesh>
      <mesh position={[.29, .035, 0]} rotation={[0, 0, -.07]}><boxGeometry args={[.58, .045, .68]} /><meshStandardMaterial color={new THREE.Color('#ad9d80').lerp(new THREE.Color('#c5b697'), frame.bookLight * .42)} map={paperMap} bumpMap={paperMap} bumpScale={.008} roughness={1} /></mesh>
      <mesh position={[0, .008, 0]}><boxGeometry args={[1.2, .045, .75]} /><meshStandardMaterial color="#654a31" roughness={1} /></mesh>
      {[...Array(4)].map((_, line) => <mesh key={line} position={[-.3, .061, -.17 + line * .1]} rotation={[-Math.PI / 2, 0, .07]}><planeGeometry args={[.3 - line * .018, .006]} /><meshBasicMaterial color="#655a48" transparent opacity={frame.bookLight * .16} /></mesh>)}
      <pointLight position={[0, .7, .2]} intensity={frame.bookLight * .18} distance={1.9} color="#d9ad70" />
    </group>
    <group position={[1.38, .45, .22]} rotation={[0, -.08, 0]}>
      <mesh><boxGeometry args={[1.04, .68, .055]} /><meshStandardMaterial color="#24231f" roughness={.72} /></mesh>
      <mesh position={[0, 0, .031]}><planeGeometry args={[.92, .56]} /><meshBasicMaterial color={new THREE.Color('#293336').lerp(new THREE.Color('#68736d'), frame.interfaceLight * .38)} toneMapped={false} /></mesh>
      <mesh position={[0, -.49, 0]}><boxGeometry args={[.08, .3, .07]} /><meshStandardMaterial color="#36342d" /></mesh>
      <mesh position={[0, -.65, 0]}><boxGeometry args={[.52, .035, .25]} /><meshStandardMaterial color="#36342d" /></mesh>
    </group>
    <group position={[0, 1.55, -2.42]}>
      <mesh><planeGeometry args={[2.3, 1.35]} /><meshStandardMaterial color="#c4bcaa" roughness={.92} /></mesh>
      <mesh position={[0, 0, .006]}><planeGeometry args={[2.05, 1.12]} /><meshBasicMaterial color="#77796f" transparent opacity={.2 + frame.projectionLight * .1} toneMapped={false} /></mesh>
      <mesh position={[.18, -.08, .012]}><planeGeometry args={[.9, .43]} /><meshBasicMaterial color="#92856f" transparent opacity={.12 + frame.projectionLight * .08} toneMapped={false} /></mesh>
      <spotLight position={[0, -.1, 3.2]} intensity={.12 + frame.projectionLight * .16} distance={5.8} angle={.36} penumbra={.92} color="#c4ae85" />
    </group>
  </>
}

function LightWorld({ frame, reduced, pointer }: Props) {
  const curtain = useRef<THREE.Mesh>(null), dust = useRef<THREE.Points>(null)
  const viewportSize = useThree(state => state.size)
  const portrait = viewportSize.width / Math.max(viewportSize.height, 1) < .75
  const maps = useMemo(() => {
    const source = createWorkedWoodTexture()
    return { source, table: cloneWoodTexture(source, [1.15, 5.6], [.09, .17]), floor: cloneWoodTexture(source, [2.8, 3.1], [.31, .08], Math.PI / 2), chair: cloneWoodTexture(source, [1.8, 8.2], [.57, .23]), window: cloneWoodTexture(source, [2.2, 6.4], [.73, .36]), wall: surfaceTexture('wall'), paper: surfaceTexture('paper') }
  }, [])
  const curtainShape = useMemo(curtainGeometry, [])
  useEffect(() => () => { Object.values(maps).forEach(map => map.dispose()); curtainShape.dispose() }, [maps, curtainShape])
  const dustPositions = useMemo(() => { const random = seededRandom(719); return new Float32Array(Array.from({ length: reduced ? 18 : 38 }, () => [(random() - .5) * 5.2, random() * 3.3 - .25, (random() - .5) * 3.2]).flat()) }, [reduced])
  useFrame(({ camera, clock, size }, dt) => {
    const portraitFrame = size.width / Math.max(size.height, 1) < .75
    const px = reduced ? 0 : pointer.current.x * .06, py = reduced ? 0 : pointer.current.y * .035
    const baseX = portraitFrame ? .05 : .18, distance = portraitFrame ? 8.2 : 6.35
    camera.position.x = THREE.MathUtils.damp(camera.position.x, baseX - frame.lookBack * (portraitFrame ? .18 : .42) + px, 1.35, dt)
    camera.position.y = THREE.MathUtils.damp(camera.position.y, (portraitFrame ? 1.62 : 1.7) + frame.lookBack * .035 + py, 1.35, dt)
    camera.position.z = THREE.MathUtils.damp(camera.position.z, distance - .44 + frame.lookBack * .09, 1.35, dt)
    camera.lookAt(.04 - frame.lookBack * (portraitFrame ? .14 : .38), .92 + frame.lookBack * .1, -.32)
    if (curtain.current && !reduced) curtain.current.rotation.y = -.08 + Math.sin(clock.elapsedTime * .28) * .014 * frame.curtainDrift
    if (dust.current && !reduced) dust.current.rotation.y = Math.sin(clock.elapsedTime * .06) * .025
  })
  const maturity = frame.lightMaturity
  const woodColor = new THREE.Color(WOOD_CONTINUITY.roomWoodTarget).lerp(new THREE.Color('#806244'), maturity * .28)
  return <>
    <fog attach="fog" args={[new THREE.Color('#45423f').lerp(new THREE.Color('#56504a'), maturity * .38), 6.4 + maturity * .25, 12.8 + maturity * .55]} />
    <hemisphereLight args={[new THREE.Color('#82909a').lerp(new THREE.Color('#b2b0a3'), maturity * .46), '#342820', .38 + maturity * .18]} />
    <ambientLight intensity={maturity * .22} color="#c8c0aa" />
    <directionalLight position={[-4.5, 4.8, 4]} intensity={(1.18 + maturity * .14) * frame.naturalLight} color={new THREE.Color('#9fb3c2').lerp(new THREE.Color('#c7c2aa'), maturity * .34)} />
    <pointLight position={[2.15, 2.55, .2]} intensity={frame.artificialLight * (.7 + maturity * .24)} distance={5.4} color={new THREE.Color('#d49a5e').lerp(new THREE.Color('#dfb879'), maturity * .3)} />
    <mesh position={[0, -.72, -1]} rotation={[-Math.PI / 2, 0, 0]}><planeGeometry args={[12, 10]} /><meshStandardMaterial color={new THREE.Color('#463529').lerp(new THREE.Color('#544130'), maturity * .25)} map={maps.floor} bumpMap={maps.floor} bumpScale={.016} roughness={.91 - maturity * .02} /></mesh>
    {[...Array(10)].map((_, i) => <mesh key={i} position={[-4.95 + i * 1.1, -.708, -1]} rotation={[-Math.PI / 2, 0, 0]}><planeGeometry args={[.012, 9.8]} /><meshBasicMaterial color="#241c17" transparent opacity={.2 + frame.lightMaturity * .05} /></mesh>)}
    <mesh position={[0, 2.25, -2.55]}><planeGeometry args={[9, 6]} /><meshStandardMaterial color={new THREE.Color('#62584c').lerp(new THREE.Color('#6a6052'), frame.lightMaturity * .3)} map={maps.wall} bumpMap={maps.wall} bumpScale={.012 + frame.lightMaturity * .007} roughness={1} /></mesh>
    <group position={[-3.2, 1.55, -2.46]}>
      <mesh position={[0, 0, -.07]}><boxGeometry args={[2.05, 3.08, .18]} /><meshStandardMaterial color="#4d4034" map={maps.window} bumpMap={maps.window} bumpScale={.014} roughness={.8} /></mesh>
      <mesh position={[0, 0, .04]}><boxGeometry args={[1.68, 2.7, .12]} /><meshPhysicalMaterial color={new THREE.Color('#778997').lerp(new THREE.Color('#94a0a0'), frame.outsideConnection * .24)} roughness={.2} transmission={.12} transparent opacity={.78} /></mesh>
      <mesh position={[0, 0, .12]}><boxGeometry args={[.09, 2.78, .1]} /><meshStandardMaterial color="#59493a" map={maps.window} roughness={.82} /></mesh>
      <mesh position={[0, 0, .13]}><boxGeometry args={[1.76, .09, .1]} /><meshStandardMaterial color="#59493a" map={maps.window} roughness={.82} /></mesh>
      <mesh position={[0, -1.49, .14]}><boxGeometry args={[2.15, .18, .38]} /><meshStandardMaterial color="#66503d" map={maps.window} roughness={.76} /></mesh>
    </group>
    <mesh ref={curtain} geometry={curtainShape} position={[-2.23, 1.54, -2.2]}><meshStandardMaterial color={new THREE.Color('#777164').lerp(new THREE.Color('#817d70'), maturity * .18)} roughness={.72} side={THREE.DoubleSide} /></mesh>
    <mesh position={[-2.18, 1.54, -2.235]} scale={[1.05, 1, 1]} geometry={curtainShape}><meshStandardMaterial color="#55514a" transparent opacity={.38} roughness={.88} side={THREE.BackSide} /></mesh>
    <mesh position={[0, -.03, .2]}><boxGeometry args={[4.35, .16, 1.5]} /><meshStandardMaterial color={woodColor} map={maps.table} bumpMap={maps.table} bumpScale={.019} roughness={.72 - maturity * .05} /></mesh>
    {[-1.78, 1.78].flatMap(x => [-.42, .73].map(z => <mesh key={`${x}-${z}`} position={[x, -.44, z]}><cylinderGeometry args={[.075, .095, .75, 8]} /><meshStandardMaterial color="#49372a" map={maps.table} roughness={.86} /></mesh>))}
    <group position={portrait ? [.55, 0, 0] : [0, 0, 0]}><ExistingMedia frame={frame} paperMap={maps.paper} /></group>
    <group position={[2.25, -.38, 1.2]} rotation={[0, -.34, 0]}>
      <mesh position={[0, .22, 0]}><boxGeometry args={[.8, .08, .75]} /><meshStandardMaterial color="#594837" map={maps.chair} bumpMap={maps.chair} bumpScale={.014} roughness={.9} /></mesh>
      {[-.28, .28].flatMap(x => [-.27, .27].map(z => <mesh key={`${x}-${z}`} position={[x, -.18, z]} rotation={[x * .045, 0, z * .05]}><cylinderGeometry args={[.032, .048, .75, 8]} /><meshStandardMaterial color="#3e342b" map={maps.chair} roughness={.9} /></mesh>))}
      {[-.28, .28].map(x => <mesh key={x} position={[x, .72, .32]} rotation={[-.1, 0, x * .035]}><cylinderGeometry args={[.035, .045, 1.02, 8]} /><meshStandardMaterial color="#5a4938" map={maps.chair} roughness={.88} /></mesh>)}
      {[.48, .68, .87].map((y, i) => <mesh key={y} position={[0, y, .34]} rotation={[-.12, 0, 0]}><boxGeometry args={[.72 - i * .045, .1, .055]} /><meshStandardMaterial color="#5a4938" map={maps.chair} roughness={.88} /></mesh>)}
    </group>
    <points ref={dust}><bufferGeometry><bufferAttribute attach="attributes-position" args={[dustPositions, 3]} /></bufferGeometry><pointsMaterial color="#dfc99e" size={.016} transparent opacity={.055 + maturity * .02} depthWrite={false} /></points>
  </>
}

export default function LightScene(props: Props) {
  return <><color attach="background" args={[new THREE.Color('#4b4137').lerp(new THREE.Color('#554b41'), props.frame.lightMaturity * .35)]} /><LightWorld {...props} /></>
}
