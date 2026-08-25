import { useFrame } from '@react-three/fiber'
import { useMemo, useRef, type RefObject } from 'react'
import * as THREE from 'three'
import type { LightFrame } from './light.types'
import type { NormalizedPointer } from '../../systems/camera/camera.types'

type Props = { frame: LightFrame; reduced: boolean; pointer: RefObject<NormalizedPointer> }
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
  const maps = useMemo(() => ({ wood: surfaceTexture('wood'), wall: surfaceTexture('wall'), paper: surfaceTexture('paper') }), [])
  const dustPositions = useMemo(() => { const random = seededRandom(719); return new Float32Array(Array.from({ length: reduced ? 24 : 52 }, () => [(random() - .5) * 5.2, random() * 3.3 - .25, (random() - .5) * 3.2]).flat()) }, [reduced])
  useFrame(({ camera, clock }, dt) => {
    const px = reduced ? 0 : pointer.current.x * .075
    const py = reduced ? 0 : pointer.current.y * .04
    camera.position.x = THREE.MathUtils.damp(camera.position.x, .33 - frame.lookBack * .54 + px, 1.35, dt)
    camera.position.y = THREE.MathUtils.damp(camera.position.y, 1.7 + frame.lookBack * .06 + py, 1.35, dt)
    camera.position.z = THREE.MathUtils.damp(camera.position.z, 5.91 + frame.lookBack * .14, 1.35, dt)
    camera.lookAt(.04 - frame.lookBack * .58, .92 + frame.lookBack * .16, -.32)
    if (curtain.current && !reduced) curtain.current.rotation.y = -.08 + Math.sin(clock.elapsedTime * .28) * .014 * frame.curtainDrift
    if (dust.current && !reduced) dust.current.rotation.y = Math.sin(clock.elapsedTime * .06) * .025
  })
  const woodColor = new THREE.Color('#6d5037').lerp(new THREE.Color('#76583d'), frame.lightMaturity * .35)
  return <>
    <fog attach="fog" args={['#4d4238', 6.3 + frame.lightMaturity * .35, 12.5 + frame.lightMaturity * .8]} />
    <hemisphereLight args={['#a99d88', '#30251e', .3 + frame.lightMaturity * .08]} />
    <directionalLight position={[-4.5, 4.8, 4]} intensity={1.35 * frame.naturalLight} color="#d2a46d" />
    <pointLight position={[2.15, 2.55, .2]} intensity={frame.artificialLight * .78} distance={5.2} color="#d59b59" />
    <mesh position={[0, -.72, -1]} rotation={[-Math.PI / 2, 0, 0]}><planeGeometry args={[12, 10]} /><meshStandardMaterial color={woodColor} map={maps.wood} bumpMap={maps.wood} bumpScale={.018 + frame.lightMaturity * .008} roughness={.97 - frame.lightMaturity * .03} /></mesh>
    {[...Array(10)].map((_, i) => <mesh key={i} position={[-4.95 + i * 1.1, -.708, -1]} rotation={[-Math.PI / 2, 0, 0]}><planeGeometry args={[.012, 9.8]} /><meshBasicMaterial color="#241c17" transparent opacity={.2 + frame.lightMaturity * .05} /></mesh>)}
    <mesh position={[0, 2.25, -2.55]}><planeGeometry args={[9, 6]} /><meshStandardMaterial color={new THREE.Color('#62584c').lerp(new THREE.Color('#6a6052'), frame.lightMaturity * .3)} map={maps.wall} bumpMap={maps.wall} bumpScale={.012 + frame.lightMaturity * .007} roughness={1} /></mesh>
    <mesh position={[-3.18, 1.55, -2.48]}><planeGeometry args={[1.8, 2.85]} /><meshBasicMaterial color="#948875" /></mesh>
    <mesh position={[-3.18, 1.55, -2.42]}><planeGeometry args={[1.48, 2.5]} /><meshBasicMaterial color={new THREE.Color('#b27e52').lerp(new THREE.Color('#a99370'), frame.outsideConnection * .52)} toneMapped={false} /></mesh>
    <mesh position={[-3.18, 1.52, -2.405]}><planeGeometry args={[1.27, 2.24]} /><meshBasicMaterial color="#6f6958" transparent opacity={frame.outsideConnection * .16} toneMapped={false} /></mesh>
    {[...Array(5)].map((_, i) => <mesh key={i} position={[-3.7 + i * .26, .68 + (i % 2) * .1, -2.39]} rotation={[0, 0, -.2 + i * .09]}><circleGeometry args={[.12 + (i % 2) * .045, 8]} /><meshBasicMaterial color={i % 2 ? '#756947' : '#665b40'} transparent opacity={frame.outsideConnection * .3} toneMapped={false} /></mesh>)}
    <mesh ref={curtain} position={[-2.25, 1.55, -2.26]}><planeGeometry args={[.72, 2.75, 10, 1]} /><meshStandardMaterial color="#847a68" transparent opacity={.76} roughness={1} side={THREE.DoubleSide} /></mesh>
    <mesh position={[0, -.03, .2]}><boxGeometry args={[4.35, .16, 1.5]} /><meshStandardMaterial color={woodColor} map={maps.wood} bumpMap={maps.wood} bumpScale={.02 + frame.lightMaturity * .01} roughness={.94 - frame.lightMaturity * .04} /></mesh>
    <mesh position={[-1.8, -.44, .2]}><boxGeometry args={[.15, .75, 1.25]} /><meshStandardMaterial color="#49372a" roughness={1} /></mesh>
    <mesh position={[1.8, -.44, .2]}><boxGeometry args={[.15, .75, 1.25]} /><meshStandardMaterial color="#49372a" roughness={1} /></mesh>
    <ExistingMedia frame={frame} paperMap={maps.paper} />
    <group position={[2.25, -.38, 1.2]} rotation={[0, -.34, 0]}>
      <mesh position={[0, .22, 0]}><boxGeometry args={[.8, .08, .75]} /><meshStandardMaterial color="#594837" roughness={1} /></mesh>
      {[-.28, .28].map(x => <mesh key={x} position={[x, -.18, 0]}><boxGeometry args={[.07, .75, .07]} /><meshStandardMaterial color="#3e342b" /></mesh>)}
      <mesh position={[0, .72, .32]} rotation={[-.16, 0, 0]}><boxGeometry args={[.8, .75, .07]} /><meshStandardMaterial color="#5a4938" /></mesh>
    </group>
    <points ref={dust}><bufferGeometry><bufferAttribute attach="attributes-position" args={[dustPositions, 3]} /></bufferGeometry><pointsMaterial color="#dfc99e" size={.018} transparent opacity={.07 + frame.lightMaturity * .045} depthWrite={false} /></points>
  </>
}

export default function LightScene(props: Props) {
  return <><color attach="background" args={['#4d4238']} /><LightWorld {...props} /></>
}
