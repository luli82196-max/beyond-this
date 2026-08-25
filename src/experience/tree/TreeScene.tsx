import { useFrame } from '@react-three/fiber'
import { useEffect, useMemo, useRef } from 'react'
import * as THREE from 'three'
import type { TreeFrame } from './tree.types'

type Props = { frame: TreeFrame; reduced: boolean }
type Leaf = { p: [number, number, number]; s: number; r: [number, number, number]; c: THREE.Color; phase: number }
const seededRandom = (seed: number) => { let v = seed; return () => ((v = v * 16807 % 2147483647) - 1) / 2147483646 }

function texture(kind: 'bark' | 'end') {
  const size = 128, random = seededRandom(kind === 'bark' ? 621 : 833), data = new Uint8Array(size * size * 4), center = 63.5
  for (let y = 0; y < size; y++) for (let x = 0; x < size; x++) {
    const i = (y * size + x) * 4, radius = Math.hypot(x - center, y - center)
    const feature = kind === 'bark' ? Math.abs(Math.sin(x * .29 + Math.sin(y * .055) * 1.8)) ** 6 * 48 : (Math.sin(radius * .92 + Math.sin(Math.atan2(y - center, x - center) * 5) * .7) + 1) * 16
    const value = THREE.MathUtils.clamp((kind === 'bark' ? 145 : 126) - feature + (random() - .5) * (kind === 'bark' ? 30 : 18), 24, 220)
    data.set([value, value, value, 255], i)
  }
  const map = new THREE.DataTexture(data, size, size, THREE.RGBAFormat)
  map.wrapS = map.wrapT = THREE.RepeatWrapping; map.repeat.set(kind === 'bark' ? 3 : 1, kind === 'bark' ? 8 : 1); map.anisotropy = 4; map.needsUpdate = true
  return map
}

function useWood() {
  const barkMap = useMemo(() => texture('bark'), []), endMap = useMemo(() => texture('end'), [])
  return useMemo(() => ({ bark: new THREE.MeshStandardMaterial({ color: '#70583d', bumpMap: barkMap, bumpScale: .075, roughness: .98 }), end: new THREE.MeshStandardMaterial({ color: '#9a7951', map: endMap, bumpMap: endMap, bumpScale: .035, roughness: .94 }) }), [barkMap, endMap])
}

function Branch({ p, r, radius, length, material, opacity }: { p: [number, number, number]; r: [number, number, number]; radius: number; length: number; material: THREE.Material; opacity: number }) {
  return <mesh position={p} rotation={r}><cylinderGeometry args={[radius * .57, radius, length, 9, 4]} /><primitive object={material.clone()} attach="material" transparent opacity={opacity} /></mesh>
}

function UprightTree({ opacity, reduced }: { opacity: number; reduced: boolean }) {
  const mesh = useRef<THREE.InstancedMesh>(null), dummy = useMemo(() => new THREE.Object3D(), []), wood = useWood()
  const leaves = useMemo(() => { const random = seededRandom(814), colors = ['#69532d', '#795d30', '#8c6937', '#997641', '#70542e', '#826438']; return Array.from({ length: reduced ? 92 : 164 }, (_, i): Leaf => { const a = random() * Math.PI * 2, d = .28 + Math.sqrt(random()) * 1.72; return { p: [Math.cos(a) * (d + Math.sin(a * 3) * .2) + (random() - .5) * .35, 2.8 + random() * 2.15 - d * .13, Math.sin(a) * d * .69], s: .075 + random() * .11, r: [(random() - .5) * 1.5, random() * Math.PI, (random() - .5) * 1.5], c: new THREE.Color(colors[i % colors.length]), phase: random() * Math.PI * 2 } }) }, [reduced])
  const geometry = useMemo(() => { const g = new THREE.SphereGeometry(1, 6, 4); g.scale(1.65, .72, .32); return g }, [])
  useEffect(() => { leaves.forEach((leaf, i) => mesh.current?.setColorAt(i, leaf.c)); if (mesh.current?.instanceColor) mesh.current.instanceColor.needsUpdate = true }, [leaves])
  useFrame(({ clock }) => { if (!mesh.current) return; leaves.forEach((leaf, i) => { const sway = reduced ? 0 : Math.sin(clock.elapsedTime * .38 + leaf.phase) * .026; dummy.position.set(...leaf.p); dummy.rotation.set(leaf.r[0], leaf.r[1] + sway, leaf.r[2] + sway); dummy.scale.setScalar(leaf.s); dummy.updateMatrix(); mesh.current!.setMatrixAt(i, dummy.matrix) }); mesh.current.instanceMatrix.needsUpdate = true })
  return <group position={[-.25, -1.4, 0]} visible={opacity > .01}>
    <Branch p={[0, 2.16, 0]} r={[0, 0, -.025]} radius={.54} length={4.35} material={wood.bark} opacity={opacity} />
    <Branch p={[-.39, 3.03, .02]} r={[.1, -.08, -.48]} radius={.26} length={2.05} material={wood.bark} opacity={opacity} /><Branch p={[.48, 3.34, -.05]} r={[-.06, .12, .53]} radius={.23} length={1.82} material={wood.bark} opacity={opacity} />
    <Branch p={[-.72, 3.94, -.06]} r={[-.12, .2, -.78]} radius={.16} length={1.48} material={wood.bark} opacity={opacity} /><Branch p={[.74, 4.05, .04]} r={[.15, -.14, .77]} radius={.15} length={1.38} material={wood.bark} opacity={opacity} />
    <instancedMesh ref={mesh} args={[geometry, undefined, leaves.length]} frustumCulled={false}><meshStandardMaterial vertexColors transparent opacity={opacity} roughness={.9} side={THREE.DoubleSide} depthWrite={opacity > .5} /></instancedMesh>
  </group>
}

function RestingTimber({ opacity }: { opacity: number }) {
  const wood = useWood()
  return <group position={[-.42, -.76, .15]} rotation={[0, -.1, Math.PI / 2]} visible={opacity > .01}>
    <mesh scale={[.47, 3.32, .44]}><cylinderGeometry args={[.51, .68, 2, 18, 8]} /><primitive object={wood.bark.clone()} attach="material" transparent opacity={opacity} /></mesh>
    {[-3.33, 3.33].map((y, i) => <group key={y} position={[0, y, 0]} rotation={[i ? -Math.PI / 2 : Math.PI / 2, 0, 0]}><mesh scale={[i ? .48 : .61, i ? .45 : .57, 1]}><circleGeometry args={[1, 32]} /><primitive object={wood.end.clone()} attach="material" transparent opacity={opacity} /></mesh>{[.22, .43, .65].map(r => <mesh key={r} position={[0, 0, .004]} scale={[r, r * .92, 1]}><ringGeometry args={[.95, 1, 32]} /><meshBasicMaterial color="#5f432d" transparent opacity={opacity * .26} /></mesh>)}</group>)}
    <mesh position={[.08, -.45, .4]} rotation={[Math.PI / 2, 0, .18]} scale={[.22, .06, 1]}><circleGeometry args={[1, 18]} /><meshStandardMaterial color="#3e3325" roughness={1} transparent opacity={opacity * .7} /></mesh>
  </group>
}

function Transport({ frame }: { frame: TreeFrame }) {
  const x = THREE.MathUtils.lerp(-4.7, 5.2, frame.transportTravel), wood = useWood(), o = frame.transportPresence
  return <group position={[x, -.91, .35]} visible={o > .01} scale={[.9, .9, .9]}><mesh position={[.18, .43, 0]} scale={[2.7, .11, .69]}><boxGeometry /><meshStandardMaterial color="#45483e" transparent opacity={o} roughness={.92} /></mesh><mesh position={[-1.62, .77, 0]}><boxGeometry args={[1.02, .68, 1.25]} /><meshStandardMaterial color="#505349" transparent opacity={o} roughness={.9} /></mesh><mesh position={[-1.75, 1.16, 0]} rotation={[0, 0, -.08]}><boxGeometry args={[.7, .25, 1.18]} /><meshStandardMaterial color="#55594f" transparent opacity={o} roughness={.9} /></mesh>{[-1.52, 1.45].flatMap(a => [-.58, .58].map(z => <mesh key={`${a}-${z}`} position={[a, .08, z]} rotation={[Math.PI / 2, 0, 0]}><cylinderGeometry args={[.31, .31, .16, 14]} /><meshStandardMaterial color="#25261f" transparent opacity={o} roughness={1} /></mesh>))}<group position={[.47, .91, 0]} rotation={[0, 0, Math.PI / 2]}><mesh scale={[.25, 1.78, .25]}><cylinderGeometry args={[.7, .82, 2, 12]} /><primitive object={wood.bark.clone()} attach="material" transparent opacity={o} /></mesh></group><mesh position={[.22, .02, -.02]} rotation={[-Math.PI / 2, 0, 0]} scale={[2.5, .65, 1]}><circleGeometry args={[1, 32]} /><meshBasicMaterial color="#171814" transparent opacity={o * .18} depthWrite={false} /></mesh></group>
}

function World({ frame, reduced }: Props) {
  const haze = useRef<THREE.Points>(null), positions = useMemo(() => { const random = seededRandom(291); return new Float32Array(Array.from({ length: reduced ? 28 : 68 }, () => [(random() - .5) * 10, random() * 4.5 - 1, (random() - .5) * 5]).flat()) }, [reduced])
  useFrame(({ camera, clock }, dt) => { const leave = 1 - frame.forestPresence; camera.position.x = THREE.MathUtils.damp(camera.position.x, frame.roomThreshold * .14, 1.2, dt); camera.position.y = THREE.MathUtils.damp(camera.position.y, THREE.MathUtils.lerp(3.3, 1.14, leave) + frame.roomThreshold * .54, 1.2, dt); camera.position.z = THREE.MathUtils.damp(camera.position.z, THREE.MathUtils.lerp(6.48, 7.3, leave) - frame.roomThreshold, 1.2, dt); camera.lookAt(.08, THREE.MathUtils.lerp(4.2, 1.08, leave), -frame.roomThreshold * .2); if (haze.current && !reduced) haze.current.position.x = Math.sin(clock.elapsedTime * .08) * .08 })
  const ground = new THREE.Color('#293126').lerp(new THREE.Color('#493a2e'), frame.roomThreshold)
  return <><fog attach="fog" args={[frame.roomThreshold > .5 ? '#786c5e' : '#7b7f70', 6, 13.5]} /><hemisphereLight args={['#d8ceb3', '#242b20', .92]} /><directionalLight castShadow position={[-3, 7, 4]} intensity={1.6 - frame.roomThreshold * .18} color="#dcc28f" shadow-mapSize={[reduced ? 512 : 1024, reduced ? 512 : 1024]} /><directionalLight position={[4, 2, -3]} intensity={.2 + frame.roomThreshold * .3} color="#b88a5e" /><UprightTree opacity={frame.forestPresence} reduced={reduced} /><RestingTimber opacity={frame.restingTree} /><Transport frame={frame} /><mesh receiveShadow rotation={[-Math.PI / 2, 0, 0]} position={[0, -1, 0]}><planeGeometry args={[18, 14]} /><meshStandardMaterial color={ground} roughness={1} /></mesh><points ref={haze}><bufferGeometry><bufferAttribute attach="attributes-position" args={[positions, 3]} /></bufferGeometry><pointsMaterial color="#ded0aa" size={.024} transparent opacity={.12 * (1 - frame.roomThreshold)} depthWrite={false} /></points></>
}

export default function TreeScene(props: Props) { return <><color attach="background" args={['#7b7f70']} /><World {...props} /></> }
