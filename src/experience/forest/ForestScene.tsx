import { useFrame } from '@react-three/fiber'
import { useEffect, useMemo, useRef } from 'react'
import * as THREE from 'three'
import type { ForestFrame } from './forest.types'

type Props = { frame: ForestFrame; reduced: boolean }
const seededRandom = (seed: number) => { let value = seed; return () => ((value = value * 16807 % 2147483647) - 1) / 2147483646 }

function createTexture(size: number, bark: boolean) {
  const random = seededRandom(bark ? 621 : 941), data = new Uint8Array(size * size * 4)
  for (let y = 0; y < size; y++) for (let x = 0; x < size; x++) {
    const i = (y * size + x) * 4
    const furrow = bark ? Math.abs(Math.sin(x * .29 + Math.sin(y * .055) * 1.8)) ** 6 * 48 : random() > .91 ? -34 : 0
    const value = THREE.MathUtils.clamp((bark ? 145 : 126) + Math.sin(x * .08 + y * .018) * 12 + (random() - .5) * 30 - furrow, 24, 220)
    data.set([value, value, value, 255], i)
  }
  const texture = new THREE.DataTexture(data, size, size, THREE.RGBAFormat)
  texture.wrapS = texture.wrapT = THREE.RepeatWrapping
  texture.repeat.set(bark ? 3 : 7, bark ? 8 : 7)
  texture.anisotropy = 4
  texture.needsUpdate = true
  return texture
}

type LeafData = { position: [number, number, number]; scale: number; rotation: [number, number, number]; color: THREE.Color; phase: number; wind: number }
function makeLeaves(reduced: boolean) {
  const random = seededRandom(814), colors = ['#69532d', '#795d30', '#8c6937', '#997641', '#70542e', '#826438']
  return Array.from({ length: reduced ? 120 : 220 }, (_, i): LeafData => {
    const angle = random() * Math.PI * 2, radius = .24 + Math.sqrt(random()) * 1.75
    return {
      position: [Math.cos(angle) * (radius + Math.sin(angle * 3) * .22) + (random() - .5) * .38, 2.8 + random() * 2.18 - radius * .13, Math.sin(angle) * radius * .7 + (random() - .5) * .34],
      scale: .075 + random() * .115,
      rotation: [(random() - .5) * 1.5, random() * Math.PI, (random() - .5) * 1.5],
      color: new THREE.Color(colors[i % colors.length]).offsetHSL((random() - .5) * .018, (random() - .5) * .05, (random() - .5) * .07),
      phase: random() * Math.PI * 2, wind: .45 + random() * .8,
    }
  })
}

function Branch({ p, r, radius, length, material }: { p: [number, number, number]; r: [number, number, number]; radius: number; length: number; material: THREE.Material }) {
  return <mesh castShadow receiveShadow position={p} rotation={r} material={material}><cylinderGeometry args={[radius * .57, radius, length, 9, 4]} /></mesh>
}

function Floor({ frame, reduced }: Props) {
  const map = useMemo(() => createTexture(128, false), [])
  const details = useMemo(() => { const random = seededRandom(309); return Array.from({ length: reduced ? 22 : 42 }, (_, i) => ({ p: [(random() - .5) * 8, .008, (random() - .5) * 6] as [number, number, number], s: .035 + random() * .09, r: random() * Math.PI, c: i % 5 ? '#36402d' : '#685331' })) }, [reduced])
  return <group>
    <mesh receiveShadow rotation={[-Math.PI / 2, 0, 0]}><circleGeometry args={[8, 64]} /><meshStandardMaterial color="#30392a" bumpMap={map} bumpScale={.075} roughness={.96} /></mesh>
    {details.map((d, i) => <mesh key={i} position={d.p} rotation={[-Math.PI / 2 + .08, d.r, 0]} scale={[d.s * 2.3, d.s, d.s]}><circleGeometry args={[1, 5]} /><meshStandardMaterial color={d.c} roughness={1} side={THREE.DoubleSide} /></mesh>)}
    <mesh rotation={[-Math.PI / 2, 0, 0]} position={[-.25, .012, 1.15]} scale={[1.6, .62, 1]}><circleGeometry args={[1, 40]} /><meshBasicMaterial color="#111710" transparent opacity={.24 + frame.canopyAttention * .07} depthWrite={false} /></mesh>
  </group>
}

function Tree(props: Props) {
  const { reduced } = props, mesh = useRef<THREE.InstancedMesh>(null), leaves = useMemo(() => makeLeaves(reduced), [reduced]), dummy = useMemo(() => new THREE.Object3D(), [])
  const barkMap = useMemo(() => createTexture(128, true), [])
  const bark = useMemo(() => new THREE.MeshStandardMaterial({ color: '#766044', bumpMap: barkMap, bumpScale: .075, roughness: .98 }), [barkMap])
  const geometry = useMemo(() => { const g = new THREE.SphereGeometry(1, 6, 4); g.scale(1.65, .72, .32); return g }, [])
  useEffect(() => { if (!mesh.current) return; leaves.forEach((l, i) => mesh.current!.setColorAt(i, l.color)); mesh.current.instanceColor!.needsUpdate = true }, [leaves])
  useFrame(({ clock }) => {
    if (!mesh.current) return
    const time = reduced ? 0 : clock.elapsedTime
    leaves.forEach((leaf, i) => {
      const sway = Math.sin(time * .38 + leaf.phase) * .035 * leaf.wind, flutter = Math.sin(time * 1.13 + leaf.phase * 1.7) * .016 * leaf.wind
      dummy.position.set(...leaf.position); dummy.position.x += sway * .35
      dummy.rotation.set(leaf.rotation[0] + flutter, leaf.rotation[1] + sway, leaf.rotation[2] + sway + flutter)
      dummy.scale.setScalar(leaf.scale); dummy.updateMatrix(); mesh.current!.setMatrixAt(i, dummy.matrix)
    })
    mesh.current.instanceMatrix.needsUpdate = true
  })
  return <group position={[.18, -1.4, 0]}>
    <Branch p={[0, 2.16, 0]} r={[0, 0, -.025]} radius={.54} length={4.35} material={bark} />
    <Branch p={[-.39, 3.03, .02]} r={[.1, -.08, -.48]} radius={.26} length={2.05} material={bark} />
    <Branch p={[.48, 3.34, -.05]} r={[-.06, .12, .53]} radius={.23} length={1.82} material={bark} />
    <Branch p={[-.72, 3.94, -.06]} r={[-.12, .2, -.78]} radius={.16} length={1.48} material={bark} />
    <Branch p={[.74, 4.05, .04]} r={[.15, -.14, .77]} radius={.15} length={1.38} material={bark} />
    <Branch p={[-.16, 4.24, -.13]} r={[.34, .05, -.23]} radius={.13} length={1.3} material={bark} />
    <instancedMesh ref={mesh} args={[geometry, undefined, leaves.length]} castShadow frustumCulled={false}><meshStandardMaterial vertexColors roughness={.88} side={THREE.DoubleSide} /></instancedMesh>
    <Floor {...props} />
  </group>
}

function DepthTrees({ reduced }: { reduced: boolean }) {
  const trunks = useMemo(() => { const random = seededRandom(117); return Array.from({ length: reduced ? 9 : 14 }, (_, i) => { const near = i < 2; return { p: [(i % 2 ? 1 : -1) * (near ? 3.1 + random() * 1.3 : 2.2 + random() * 5.2), 1.5, near ? 2 + random() * 1.6 : -2.5 - random() * 5.5] as [number, number, number], s: [near ? .4 : .18 + random() * .22, near ? 6.2 : 4.5 + random() * 2.2, near ? .38 : .17 + random() * .19] as [number, number, number], c: near ? '#332f24' : '#5a5a43' } }) }, [reduced])
  return <group>{trunks.map((t, i) => <mesh key={i} position={t.p} scale={t.s}><cylinderGeometry args={[.45, .63, 1, 7]} /><meshStandardMaterial color={t.c} roughness={1} /></mesh>)}</group>
}

function World(props: Props) {
  const { frame, reduced } = props, haze = useRef<THREE.Points>(null)
  const positions = useMemo(() => { const random = seededRandom(177); return new Float32Array(Array.from({ length: reduced ? 32 : 76 }, () => [(random() - .5) * 9, random() * 6 - .4, (random() - .5) * 5]).flat()) }, [reduced])
  useFrame(({ camera, clock }, dt) => {
    const lift = frame.cameraLift, reveal = frame.scaleReveal
    camera.position.y = THREE.MathUtils.damp(camera.position.y, THREE.MathUtils.lerp(-.12, 1.05 + lift * 2.25, reveal), 1.25, dt)
    camera.position.z = THREE.MathUtils.damp(camera.position.z, THREE.MathUtils.lerp(4.8, 7.2 - lift * .72, reveal), 1.25, dt)
    camera.lookAt(.1, THREE.MathUtils.lerp(-.62, 1.55 + lift * 2.65, reveal), 0)
    if (haze.current && !reduced) haze.current.position.x = Math.sin(clock.elapsedTime * .12) * .1
  })
  return <>
    <fog attach="fog" args={['#828575', 5.2, 15.5]} /><hemisphereLight args={['#d5ceb3', '#293225', .92]} />
    <directionalLight castShadow position={[-3.5, 7, 4]} intensity={1.75 + frame.lightShift * .3} color="#dec99a" shadow-mapSize={[reduced ? 512 : 1024, reduced ? 512 : 1024]} shadow-camera-left={-6} shadow-camera-right={6} shadow-camera-top={7} shadow-camera-bottom={-2} />
    <directionalLight position={[4, 2, -3]} intensity={.2} color="#91a08f" /><DepthTrees reduced={reduced} /><Tree {...props} />
    <points ref={haze}><bufferGeometry><bufferAttribute attach="attributes-position" args={[positions, 3]} /></bufferGeometry><pointsMaterial color="#ddd3ae" size={.022} transparent opacity={.12 + frame.lightShift * .06} depthWrite={false} /></points>
  </>
}

export default function ForestScene(props: Props) {
  return <><color attach="background" args={['#828575']} /><World {...props} /></>
}
