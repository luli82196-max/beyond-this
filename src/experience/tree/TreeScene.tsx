import { useFrame, useThree } from '@react-three/fiber'
import { useEffect, useMemo, useRef } from 'react'
import * as THREE from 'three'
import type { TreeFrame } from './tree.types'
import { createBarkTexture, createEndGrainTexture, createWorkedWoodTexture, WOOD_CONTINUITY } from '../materialContinuity'

type Props = { frame: TreeFrame; reduced: boolean }
type Maps = { bark: THREE.Texture; barkBump: THREE.Texture; end: THREE.Texture; worked: THREE.Texture }
type Leaf = { p: [number, number, number]; s: [number, number, number]; r: [number, number, number]; c: THREE.Color; phase: number }
const seededRandom = (seed: number) => { let value = seed; return () => ((value = value * 16807 % 2147483647) - 1) / 2147483646 }

function useWoodMaps(): Maps {
  const maps = useMemo(() => ({ bark: createBarkTexture(192), barkBump: createBarkTexture(192, true), end: createEndGrainTexture(), worked: createWorkedWoodTexture() }), [])
  useEffect(() => () => Object.values(maps).forEach(map => map.dispose()), [maps])
  return maps
}

function BarkMaterial({ maps, opacity }: { maps: Maps; opacity: number }) {
  return <meshStandardMaterial color={WOOD_CONTINUITY.barkBase} map={maps.bark} bumpMap={maps.barkBump} bumpScale={WOOD_CONTINUITY.barkBumpScale} roughness={WOOD_CONTINUITY.barkRoughness} transparent opacity={opacity} />
}

function Branch({ p, r, radius, length, maps, opacity }: { p: [number, number, number]; r: [number, number, number]; radius: number; length: number; maps: Maps; opacity: number }) {
  return <mesh position={p} rotation={r} castShadow receiveShadow><cylinderGeometry args={[radius * .58, radius, length, radius > .2 ? 14 : 10, 6]} /><BarkMaterial maps={maps} opacity={opacity} /></mesh>
}

function UprightTree({ opacity, reduced, maps }: { opacity: number; reduced: boolean; maps: Maps }) {
  const mesh = useRef<THREE.InstancedMesh>(null), dummy = useMemo(() => new THREE.Object3D(), [])
  const leaves = useMemo(() => {
    const random = seededRandom(814), colors = ['#596044', '#69704c', '#77734b', '#81744b', '#6c6240']
    const anchors: [number, number, number][] = [[-1.75, 3.45, 0], [-1.2, 4.05, .35], [-.65, 4.55, -.25], [.05, 4.88, .05], [.72, 4.42, .32], [1.35, 3.9, -.18], [1.82, 3.48, -.08], [.3, 4.3, -.45], [-1.25, 3.75, -.45]]
    return anchors.flatMap((anchor, a) => Array.from({ length: reduced ? 2 : 3 }, (_, i): Leaf => ({ p: [anchor[0] + (random() - .5) * .48, anchor[1] + (random() - .5) * .34, anchor[2] + (random() - .5) * .4], s: [.42 + random() * .2, .22 + random() * .12, .28 + random() * .12], r: [(random() - .5) * .2, random() * Math.PI, (random() - .5) * .16], c: new THREE.Color(colors[(a + i) % colors.length]), phase: random() * Math.PI * 2 })))
  }, [reduced])
  const geometry = useMemo(() => new THREE.IcosahedronGeometry(1, 1), [])
  useEffect(() => { leaves.forEach((leaf, i) => mesh.current?.setColorAt(i, leaf.c)); if (mesh.current?.instanceColor) mesh.current.instanceColor.needsUpdate = true }, [leaves])
  useFrame(({ clock }) => { if (!mesh.current) return; leaves.forEach((leaf, i) => { const sway = reduced ? 0 : Math.sin(clock.elapsedTime * .27 + leaf.phase) * .014; dummy.position.set(...leaf.p); dummy.rotation.set(leaf.r[0], leaf.r[1] + sway, leaf.r[2] + sway); dummy.scale.set(...leaf.s); dummy.updateMatrix(); mesh.current!.setMatrixAt(i, dummy.matrix) }); mesh.current.instanceMatrix.needsUpdate = true })
  return <group position={[-.22, -1.42, 0]} visible={opacity > .01}>
    <Branch p={[0, 2.12, 0]} r={[0, 0, -.02]} radius={.52} length={4.3} maps={maps} opacity={opacity} />
    <Branch p={[-.42, 3.02, .02]} r={[.08, -.08, -.5]} radius={.29} length={2.12} maps={maps} opacity={opacity} /><Branch p={[.48, 3.3, -.04]} r={[-.06, .12, .54]} radius={.27} length={1.98} maps={maps} opacity={opacity} />
    <Branch p={[-.85, 3.83, -.04]} r={[-.12, .18, -.76]} radius={.18} length={1.62} maps={maps} opacity={opacity} /><Branch p={[.84, 3.94, .05]} r={[.12, -.14, .75]} radius={.17} length={1.5} maps={maps} opacity={opacity} />
    <instancedMesh ref={mesh} args={[geometry, undefined, leaves.length]} castShadow receiveShadow frustumCulled={false}><meshStandardMaterial vertexColors transparent opacity={opacity} roughness={.9} emissive="#171a10" emissiveIntensity={.18} depthWrite={opacity > .5} /></instancedMesh>
  </group>
}

function EndFace({ position, rotation, scale, opacity, maps }: { position: [number, number, number]; rotation: [number, number, number]; scale: [number, number, number]; opacity: number; maps: Maps }) {
  return <group position={position} rotation={rotation} scale={scale}>
    <mesh position={[0, 0, .006]}><circleGeometry args={[1, 48]} /><meshStandardMaterial color={WOOD_CONTINUITY.endGrainFresh} map={maps.end} bumpMap={maps.end} bumpScale={.045} roughness={.78} transparent opacity={opacity} side={THREE.DoubleSide} polygonOffset polygonOffsetFactor={-1} /></mesh>
    {[.27, .5, .73].map((radius, index) => <mesh key={radius} position={[0, 0, .012 + index * .001]}><ringGeometry args={[radius - .012, radius, 48]} /><meshBasicMaterial color={index === 2 ? WOOD_CONTINUITY.endGrainHeartwood : '#69492f'} transparent opacity={opacity * .34} depthWrite={false} /></mesh>)}
    {[.18, 2.24, 4.36].map((angle, index) => <mesh key={angle} position={[Math.cos(angle) * .31, Math.sin(angle) * .31, .017]} rotation={[0, 0, angle]}><planeGeometry args={[.54 - index * .07, .018]} /><meshBasicMaterial color="#4b3324" transparent opacity={opacity * .55} depthWrite={false} /></mesh>)}
  </group>
}

function RestingTimber({ opacity, maps }: { opacity: number; maps: Maps }) {
  return <group position={[-.38, -.72, .12]} rotation={[0, -.27, Math.PI / 2]} visible={opacity > .01}>
    <mesh scale={[.49, 3.34, .46]} castShadow receiveShadow><cylinderGeometry args={[.53, .69, 2, 20, 10]} /><BarkMaterial maps={maps} opacity={opacity} /></mesh>
    <EndFace position={[0, -3.345, 0]} rotation={[Math.PI / 2, 0, 0]} scale={[.62, .58, 1]} opacity={opacity} maps={maps} /><EndFace position={[0, 3.345, 0]} rotation={[-Math.PI / 2, 0, 0]} scale={[.49, .46, 1]} opacity={opacity} maps={maps} />
    <mesh position={[.08, -.48, .43]} rotation={[Math.PI / 2, 0, .18]} scale={[.24, .07, 1]}><circleGeometry args={[1, 20]} /><meshStandardMaterial color="#3d3225" roughness={1} transparent opacity={opacity * .72} /></mesh>
  </group>
}

function Transport({ frame, maps }: { frame: TreeFrame; maps: Maps }) {
  const x = THREE.MathUtils.lerp(-4.7, 5.2, frame.transportTravel), opacity = frame.transportPresence, worked = THREE.MathUtils.smoothstep(frame.roomThreshold, .05, .82)
  return <group position={[x, -.91, .35]} visible={opacity > .01} scale={[.9, .9, .9]}>
    <mesh position={[.18, .43, 0]} scale={[2.7, .11, .69]}><boxGeometry /><meshStandardMaterial color="#454b43" transparent opacity={opacity} roughness={.94} /></mesh><mesh position={[-1.62, .77, 0]}><boxGeometry args={[1.02, .68, 1.25]} /><meshStandardMaterial color="#50564e" transparent opacity={opacity} roughness={.92} /></mesh>
    {[-1.52, 1.45].flatMap(a => [-.58, .58].map(z => <mesh key={`${a}-${z}`} position={[a, .08, z]} rotation={[Math.PI / 2, 0, 0]}><cylinderGeometry args={[.31, .31, .16, 14]} /><meshStandardMaterial color="#252720" transparent opacity={opacity} roughness={1} /></mesh>))}
    <group position={[.47, .91, 0]} rotation={[0, 0, Math.PI / 2]}><mesh scale={[.27, 1.78, .27]} castShadow><cylinderGeometry args={[.72, .84, 2, 16]} /><BarkMaterial maps={maps} opacity={opacity * (1 - worked * .48)} /></mesh><mesh position={[0, 0, .255]} scale={[.22, 1.7, .035]}><boxGeometry /><meshStandardMaterial color={WOOD_CONTINUITY.workedWoodBase} map={maps.worked} bumpMap={maps.worked} bumpScale={.02} roughness={.84} transparent opacity={opacity * (.22 + worked * .72)} /></mesh><EndFace position={[0, -1.785, 0]} rotation={[Math.PI / 2, 0, 0]} scale={[.56, .5, 1]} opacity={opacity} maps={maps} /></group>
    {[-.72, .92].map(y => <mesh key={y} position={[.47, .91 + y, .31]} rotation={[0, 0, Math.PI / 2]}><boxGeometry args={[.055, .82, .045]} /><meshStandardMaterial color="#746b56" roughness={.82} transparent opacity={opacity * .8} /></mesh>)}
  </group>
}

function World({ frame, reduced }: Props) {
  const maps = useWoodMaps(), { size } = useThree()
  useFrame(({ camera }, dt) => { const leave = 1 - frame.forestPresence, portrait = size.width / Math.max(size.height, 1) < .75, distance = portrait ? 8.6 : 6.48; camera.position.x = THREE.MathUtils.damp(camera.position.x, frame.roomThreshold * .12, 1.2, dt); camera.position.y = THREE.MathUtils.damp(camera.position.y, THREE.MathUtils.lerp(3.3, 1.14, leave) + frame.roomThreshold * .48, 1.2, dt); camera.position.z = THREE.MathUtils.damp(camera.position.z, THREE.MathUtils.lerp(distance, portrait ? 8.25 : 7.3, leave) - frame.roomThreshold * .6, 1.2, dt); camera.lookAt(.08, THREE.MathUtils.lerp(4.1, 1.08, leave), -frame.roomThreshold * .2) })
  const threshold = frame.roomThreshold, ground = new THREE.Color('#293126').lerp(new THREE.Color('#4b392b'), threshold), fog = new THREE.Color('#737b6d').lerp(new THREE.Color('#55483c'), threshold)
  return <><fog attach="fog" args={[fog, 6.7, 14]} /><hemisphereLight args={[new THREE.Color('#c8c9b8').lerp(new THREE.Color('#ad9d87'), threshold), '#242b20', .92]} /><directionalLight castShadow position={[-3.8, 6.5, 3.6]} intensity={1.78 - threshold * .34} color={new THREE.Color('#d2bf91').lerp(new THREE.Color('#d2a46d'), threshold)} shadow-mapSize={[reduced ? 512 : 1024, reduced ? 512 : 1024]} /><directionalLight position={[4, 2.4, -3]} intensity={.5 + threshold * .28} color={new THREE.Color('#8f9b8f').lerp(new THREE.Color('#b78358'), threshold)} /><UprightTree opacity={frame.forestPresence} reduced={reduced} maps={maps} /><RestingTimber opacity={frame.restingTree} maps={maps} /><Transport frame={frame} maps={maps} /><mesh receiveShadow rotation={[-Math.PI / 2, 0, 0]} position={[0, -1, 0]}><planeGeometry args={[18, 14]} /><meshStandardMaterial color={ground} roughness={1} /></mesh></>
}

export default function TreeScene(props: Props) { const background = new THREE.Color('#737b6d').lerp(new THREE.Color('#55483c'), props.frame.roomThreshold); return <><color attach="background" args={[background]} /><World {...props} /></> }
