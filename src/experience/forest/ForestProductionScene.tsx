import { useFrame } from '@react-three/fiber'
import { useEffect, useMemo, useRef } from 'react'
import * as THREE from 'three'
import type { ForestFrame } from './forest.types'

type Props = { frame: ForestFrame; reduced: boolean }
type Point = [number, number, number]
type GrowthPath = { points: Point[]; radius: number }
type FoliageDatum = { position: Point; scale: Point; rotation: Point; color: THREE.Color; phase: number; amplitude: number }

const seededRandom = (seed: number) => { let value = seed; return () => ((value = value * 16807 % 2147483647) - 1) / 2147483646 }
const leafPalette = ['#596044', '#69704c', '#77734b', '#81744b', '#8c794c', '#6c6240']

function createBarkTexture(size: number, bump = false) {
  const random = seededRandom(bump ? 782 : 621), data = new Uint8Array(size * size * 4)
  for (let y = 0; y < size; y++) for (let x = 0; x < size; x++) {
    const i = (y * size + x) * 4
    const furrow = Math.abs(Math.sin(x * .21 + Math.sin(y * .041) * 2.2)) ** 10
    const fissure = Math.abs(Math.sin(x * .73 + y * .018 + Math.sin(y * .09))) ** 18
    const value = THREE.MathUtils.clamp((bump ? 142 : 126) + Math.sin(y * .055 + Math.sin(x * .08)) * 7 + (random() - .5) * 20 - furrow * 52 - fissure * 25, 22, 210)
    data.set(bump ? [value, value, value, 255] : [value * .9, value * .78, value * .62, 255], i)
  }
  const texture = new THREE.DataTexture(data, size, size, THREE.RGBAFormat)
  texture.colorSpace = bump ? THREE.NoColorSpace : THREE.SRGBColorSpace
  texture.wrapS = texture.wrapT = THREE.RepeatWrapping
  texture.repeat.set(3.2, 7.5); texture.anisotropy = 4; texture.needsUpdate = true
  return texture
}

function createGrowthGeometry(path: GrowthPath) {
  const curve = new THREE.CatmullRomCurve3(path.points.map(point => new THREE.Vector3(...point)), false, 'centripetal', .42)
  const geometry = new THREE.TubeGeometry(curve, Math.max(12, path.points.length * 6), path.radius, path.radius > .2 ? 14 : 10, false)
  const position = geometry.attributes.position
  for (let i = 0; i < position.count; i++) {
    const x = position.getX(i), y = position.getY(i), z = position.getZ(i)
    const pressure = 1 + Math.sin(Math.atan2(z, x) * 3 + y * .35) * .035
    position.setXYZ(i, x * pressure, y, z * pressure)
  }
  geometry.computeVertexNormals()
  return geometry
}

const growthPaths: GrowthPath[] = [
  { radius: .52, points: [[0, 0, 0], [-.05, .75, .02], [.08, 1.55, -.04], [-.02, 2.35, .06], [.12, 3.22, -.02], [.05, 4.25, .04], [.18, 5.2, 0]] },
  { radius: .31, points: [[.02, 1.62, 0], [-.42, 2.02, .02], [-.88, 2.48, -.05], [-1.42, 2.9, -.12], [-1.98, 3.18, -.18]] },
  { radius: .29, points: [[.04, 2.05, .01], [.5, 2.42, -.04], [.98, 2.86, -.13], [1.5, 3.27, -.2], [2.02, 3.48, -.12]] },
  { radius: .25, points: [[.04, 2.58, .03], [-.28, 3.02, .32], [-.57, 3.5, .69], [-.88, 3.9, 1.06]] },
  { radius: .23, points: [[.08, 2.94, 0], [.44, 3.34, .3], [.8, 3.77, .62], [1.16, 4.14, .86]] },
  { radius: .2, points: [[.08, 3.44, 0], [-.24, 3.86, -.28], [-.54, 4.28, -.6], [-.78, 4.68, -.85]] },
  { radius: .16, points: [[-1.08, 2.65, -.08], [-1.36, 3.02, .18], [-1.65, 3.42, .42]] },
  { radius: .14, points: [[-1.42, 2.9, -.12], [-1.66, 3.25, -.46], [-1.88, 3.62, -.72]] },
  { radius: .15, points: [[1.12, 2.98, -.15], [1.34, 3.38, .17], [1.58, 3.78, .38]] },
  { radius: .13, points: [[1.5, 3.27, -.2], [1.74, 3.63, -.48], [1.92, 3.97, -.7]] },
  { radius: .12, points: [[-.55, 3.5, .67], [-.92, 3.85, .84], [-1.2, 4.18, 1.02]] },
  { radius: .12, points: [[.8, 3.77, .62], [1.1, 4.08, .87], [1.34, 4.4, 1.04]] },
  { radius: .11, points: [[-.5, 4.22, -.56], [-.82, 4.54, -.7], [-1.04, 4.88, -.78]] },
  { radius: .12, points: [[.12, 4.18, .02], [.46, 4.48, -.25], [.72, 4.82, -.48]] },
]

const clusterAnchors: Point[] = [[-2.05, 3.25, -.15], [-1.66, 3.72, .35], [-1.9, 3.68, -.72], [-1.18, 4.25, 1], [-.92, 4.86, -.75], [-.48, 4.68, .42], [.12, 5.12, .02], [.7, 4.84, -.46], [1.32, 4.43, 1], [1.55, 3.8, .38], [1.95, 4.02, -.7], [2.05, 3.5, -.12], [1.25, 4.55, -.1], [-1.3, 4.35, -.08], [.25, 4.48, .82]]

function BarkSystem() {
  const maps = useMemo(() => ({ color: createBarkTexture(192), bump: createBarkTexture(192, true) }), [])
  const material = useMemo(() => new THREE.MeshStandardMaterial({ color: '#b39a78', map: maps.color, bumpMap: maps.bump, bumpScale: .105, roughness: .93 }), [maps])
  const paths = useMemo(() => growthPaths.map(path => createGrowthGeometry(path)), [])
  useEffect(() => () => { paths.forEach(geometry => geometry.dispose()); material.dispose(); maps.color.dispose(); maps.bump.dispose() }, [maps, material, paths])
  return <group>
    {paths.map((geometry, index) => <mesh key={index} geometry={geometry} material={material} castShadow receiveShadow />)}
    <mesh position={[-.04, .16, .02]} scale={[.72, .42, .68]} castShadow receiveShadow material={material}><sphereGeometry args={[1, 14, 9]} /></mesh>
    {[[-.36, .12, .08, .4], [.32, .1, -.06, .36], [.04, .08, .4, .3]].map((root, index) => <mesh key={index} position={[root[0], root[1], root[2]]} rotation={[0, index * 1.8, Math.PI / 2]} scale={[root[3], .95, root[3] * .72]} castShadow receiveShadow material={material}><sphereGeometry args={[1, 12, 7]} /></mesh>)}
  </group>
}

function makeFoliage(reduced: boolean) {
  const random = seededRandom(814), clusters: FoliageDatum[] = [], leaves: FoliageDatum[] = []
  clusterAnchors.forEach((anchor, index) => {
    const lit = index % 3 === 1 ? 1.08 : .94
    clusters.push({ position: anchor, scale: [(.47 + random() * .2) * lit, .27 + random() * .14, .34 + random() * .16], rotation: [(random() - .5) * .25, random() * Math.PI, (random() - .5) * .18], color: new THREE.Color(leafPalette[index % leafPalette.length]).offsetHSL(0, -.03, .025 + (random() - .5) * .035), phase: random() * Math.PI * 2, amplitude: .55 + random() * .45 })
    for (let j = 0; j < (reduced ? 3 : 6); j++) {
      const angle = random() * Math.PI * 2, radius = .28 + random() * .48
      leaves.push({ position: [anchor[0] + Math.cos(angle) * radius, anchor[1] + (random() - .35) * .48, anchor[2] + Math.sin(angle) * radius * .58], scale: [.12 + random() * .07, .045 + random() * .025, .07], rotation: [(random() - .5) * .8, random() * Math.PI, (random() - .5) * .7], color: new THREE.Color(leafPalette[(index + j + 2) % leafPalette.length]).offsetHSL(0, -.04, (random() - .5) * .045), phase: random() * Math.PI * 2, amplitude: .55 + random() * .45 })
    }
  })
  return { clusters, leaves }
}

function Foliage({ reduced }: { reduced: boolean }) {
  const clusterMesh = useRef<THREE.InstancedMesh>(null), leafMesh = useRef<THREE.InstancedMesh>(null)
  const foliage = useMemo(() => makeFoliage(reduced), [reduced]), dummy = useMemo(() => new THREE.Object3D(), [])
  const clusterGeometry = useMemo(() => { const g = new THREE.IcosahedronGeometry(1, 2); g.scale(1, .82, .72); return g }, [])
  const leafGeometry = useMemo(() => { const s = new THREE.Shape(); s.moveTo(0, -.55); s.bezierCurveTo(.7, -.25, .65, .4, 0, .72); s.bezierCurveTo(-.65, .4, -.7, -.25, 0, -.55); return new THREE.ShapeGeometry(s, 2) }, [])
  useEffect(() => {
    const write = (mesh: THREE.InstancedMesh | null, data: FoliageDatum[]) => { if (!mesh) return; data.forEach((item, i) => mesh.setColorAt(i, item.color)); if (mesh.instanceColor) mesh.instanceColor.needsUpdate = true }
    write(clusterMesh.current, foliage.clusters); write(leafMesh.current, foliage.leaves)
  }, [foliage])
  useFrame(({ clock }) => {
    const update = (mesh: THREE.InstancedMesh | null, data: FoliageDatum[], local: number) => { if (!mesh) return; const time = reduced ? 0 : clock.elapsedTime; data.forEach((item, i) => { const sway = Math.sin(time * .27 + item.phase) * .018 * item.amplitude, drift = Math.sin(time * .16 + item.phase * .7) * .012 * item.amplitude; dummy.position.set(...item.position); dummy.position.x += sway * .25; dummy.rotation.set(item.rotation[0] + drift * local, item.rotation[1] + sway, item.rotation[2] + sway * local); dummy.scale.set(...item.scale); dummy.updateMatrix(); mesh.setMatrixAt(i, dummy.matrix) }); mesh.instanceMatrix.needsUpdate = true }
    update(clusterMesh.current, foliage.clusters, .35); update(leafMesh.current, foliage.leaves, 1)
  })
  return <group>
    <instancedMesh ref={clusterMesh} args={[clusterGeometry, undefined, foliage.clusters.length]} castShadow receiveShadow frustumCulled={false}><meshStandardMaterial vertexColors roughness={.9} emissive="#171a10" emissiveIntensity={.3} /></instancedMesh>
    <instancedMesh ref={leafMesh} args={[leafGeometry, undefined, foliage.leaves.length]} castShadow frustumCulled={false}><meshStandardMaterial vertexColors roughness={.86} emissive="#16170e" emissiveIntensity={.22} side={THREE.DoubleSide} /></instancedMesh>
  </group>
}

function ForestFloor({ frame, reduced }: Props) {
  const bump = useMemo(() => createBarkTexture(128, true), [])
  const litter = useMemo(() => { const random = seededRandom(309); return Array.from({ length: reduced ? 18 : 34 }, (_, i) => ({ p: [(random() - .5) * 9, .012, (random() - .5) * 7] as Point, s: .035 + random() * .075, r: random() * Math.PI, c: i % 5 ? '#343b2d' : '#665538' })) }, [reduced])
  return <group><mesh receiveShadow rotation={[-Math.PI / 2, 0, 0]}><circleGeometry args={[9, 64]} /><meshStandardMaterial color="#293129" bumpMap={bump} bumpScale={.045} roughness={.98} /></mesh>{litter.map((item, i) => <mesh key={i} position={item.p} rotation={[-Math.PI / 2 + .06, item.r, 0]} scale={[item.s * 2.6, item.s, item.s]}><circleGeometry args={[1, 5]} /><meshStandardMaterial color={item.c} roughness={1} side={THREE.DoubleSide} /></mesh>)}<mesh rotation={[-Math.PI / 2, 0, 0]} position={[-.12, .014, .78]} scale={[1.72, .72, 1]}><circleGeometry args={[1, 40]} /><meshBasicMaterial color="#10150f" transparent opacity={.2 + frame.canopyAttention * .06} depthWrite={false} /></mesh></group>
}

function HeroTree(props: Props) { return <group position={[.12, -1.4, 0]}><BarkSystem /><Foliage reduced={props.reduced} /><ForestFloor {...props} /></group> }

function MidgroundTrees({ reduced }: { reduced: boolean }) {
  const trees = useMemo(() => { const random = seededRandom(117); return Array.from({ length: reduced ? 8 : 12 }, (_, i) => ({ x: (i % 2 ? 1 : -1) * (2.5 + random() * 4.8), z: -1.5 - random() * 5.8, h: 4.3 + random() * 2.5, radius: .16 + random() * .2, lean: (random() - .5) * .16, shade: i % 3 })) }, [reduced])
  return <group>{trees.map((tree, i) => <group key={i} position={[tree.x, -.9, tree.z]} rotation={[0, 0, tree.lean]}><mesh scale={[tree.radius, tree.h, tree.radius]} receiveShadow><cylinderGeometry args={[.58, .9, 1, 10]} /><meshStandardMaterial color={tree.shade === 0 ? '#3e4236' : '#4b4d3d'} roughness={1} /></mesh><mesh position={[0, tree.h * .48, 0]} scale={[1.15 + tree.radius, .7, .78]}><icosahedronGeometry args={[1, 1]} /><meshStandardMaterial color={tree.shade === 0 ? '#515744' : '#5e6048'} roughness={1} /></mesh></group>)}</group>
}

function BackgroundForest({ reduced }: { reduced: boolean }) {
  const trees = useMemo(() => { const random = seededRandom(441), count = reduced ? 12 : 18; return Array.from({ length: count }, (_, i) => ({ x: -10 + i * (20 / (count - 1)) + (random() - .5) * .4, y: 1.4 + random() * .8, z: -8.2 - random() * 2.4, s: .55 + random() * .55 })) }, [reduced])
  return <group>{trees.map((tree, i) => <mesh key={i} position={[tree.x, tree.y, tree.z]} scale={[tree.s, 3.4 + tree.s, tree.s * .55]}><coneGeometry args={[1, 1, 7]} /><meshBasicMaterial color={i % 3 ? '#606554' : '#555c4e'} fog /></mesh>)}</group>
}

function ForegroundFrame({ reduced }: { reduced: boolean }) {
  const geometry = useMemo(() => new THREE.IcosahedronGeometry(1, 1), []), material = useMemo(() => new THREE.MeshStandardMaterial({ color: '#20271f', roughness: 1 }), [])
  return <group><mesh position={[-4.45, 1.45, 1.8]} rotation={[0, 0, -.22]} scale={[.28, 4.8, .28]} material={material}><cylinderGeometry args={[.7, 1, 1, 9]} /></mesh><mesh position={[4.7, 2.05, 1.4]} rotation={[0, 0, .18]} scale={[.22, 4.9, .22]} material={material}><cylinderGeometry args={[.7, 1, 1, 9]} /></mesh>{[-1, 1].map(side => <instancedMesh key={side} args={[geometry, material, reduced ? 3 : 5]} position={[side * 4.2, 2.2, 1.2]} ref={mesh => { if (!mesh) return; const d = new THREE.Object3D(); for (let i = 0; i < mesh.count; i++) { d.position.set(side * (.2 + i * .12), i * .72 - 1.3, -.15 * i); d.scale.set(.75 + i * .08, .42 + i * .04, .45); d.updateMatrix(); mesh.setMatrixAt(i, d.matrix) } mesh.instanceMatrix.needsUpdate = true }} />)}</group>
}

function World(props: Props) {
  const { frame, reduced } = props
  useFrame(({ camera, size }, dt) => { const lift = frame.cameraLift, reveal = frame.scaleReveal, aspect = size.width / size.height, portraitOffset = THREE.MathUtils.clamp((.82 - aspect) * 13.5, 0, 5); camera.position.y = THREE.MathUtils.damp(camera.position.y, THREE.MathUtils.lerp(-.12, 1.05 + lift * 2.25, reveal), 1.25, dt); camera.position.z = THREE.MathUtils.damp(camera.position.z, THREE.MathUtils.lerp(4.8, 7.2 - lift * .72, reveal) + portraitOffset, 1.25, dt); camera.lookAt(.1, THREE.MathUtils.lerp(-.62, 1.55 + lift * 2.65, reveal), 0) })
  return <><fog attach="fog" args={['#747b6b', 7.4, 18]} /><ambientLight intensity={.68} color="#aaa88d" /><hemisphereLight args={['#c6c2a5', '#323a30', 1.12]} /><directionalLight castShadow position={[-4.5, 8.5, -2.8]} intensity={2.15 + frame.lightShift * .28} color="#d1bf8d" shadow-mapSize={[reduced ? 512 : 1024, reduced ? 512 : 1024]} shadow-camera-left={-6} shadow-camera-right={6} shadow-camera-top={7} shadow-camera-bottom={-2} shadow-bias={-.0005} /><directionalLight position={[4, 4, 5]} intensity={1.08} color="#aeb49f" /><BackgroundForest reduced={reduced} /><MidgroundTrees reduced={reduced} /><HeroTree {...props} /><ForegroundFrame reduced={reduced} /></>
}

export default function ForestProductionScene(props: Props) { return <><color attach="background" args={['#747b6b']} /><World {...props} /></> }
