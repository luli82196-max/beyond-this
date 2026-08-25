import { useFrame } from '@react-three/fiber'
import { useMemo, useRef } from 'react'
import * as THREE from 'three'
import type { SeedSequenceState } from './seed.types'

type Props = { state: SeedSequenceState; pointer: { x: number; y: number }; reduced: boolean }

function seededRandom(seed: number) {
  let value = seed
  return () => ((value = (value * 16807) % 2147483647) - 1) / 2147483646
}

type SurfaceMaps = { color: THREE.DataTexture; roughness: THREE.DataTexture; bump: THREE.DataTexture }

function createSeedSurfaceMaps(size = 128): SurfaceMaps {
  const random = seededRandom(413)
  const color = new Uint8Array(size * size * 4)
  const roughness = new Uint8Array(size * size * 4)
  const bump = new Uint8Array(size * size * 4)
  for (let y = 0; y < size; y++) for (let x = 0; x < size; x++) {
    const index = (y * size + x) * 4
    const broad = Math.sin(x * .16 + Math.sin(y * .07) * 2.1) * 13
    const fibre = Math.sin(y * .72 + Math.sin(x * .11) * 1.8) * 4
    const pore = random() > .965 ? -24 : 0
    const value = THREE.MathUtils.clamp(78 + broad + fibre + pore + (random() - .5) * 12, 34, 112)
    color.set([value, value * .55, value * .27, 255], index)
    const height = THREE.MathUtils.clamp(128 + fibre * 4 + broad + pore * 2, 18, 235)
    bump.set([height, height, height, 255], index)
    const r = THREE.MathUtils.clamp(218 - broad - pore + (random() - .5) * 18, 150, 250)
    roughness.set([r, r, r, 255], index)
  }
  const make = (data: Uint8Array, colorSpace?: THREE.ColorSpace) => {
    const texture = new THREE.DataTexture(data, size, size, THREE.RGBAFormat)
    texture.wrapS = texture.wrapT = THREE.RepeatWrapping
    texture.anisotropy = 4
    if (colorSpace) texture.colorSpace = colorSpace
    texture.needsUpdate = true
    return texture
  }
  return { color: make(color, THREE.SRGBColorSpace), roughness: make(roughness), bump: make(bump) }
}

function createSoilSurfaceMap(size = 128) {
  const random = seededRandom(821)
  const data = new Uint8Array(size * size * 4)
  for (let i = 0; i < size * size; i++) {
    const grit = random() > .9 ? 62 : random() * 28
    const value = THREE.MathUtils.clamp(78 + (random() - .5) * 42 + grit, 24, 180)
    data.set([value, value, value, 255], i * 4)
  }
  const texture = new THREE.DataTexture(data, size, size, THREE.RGBAFormat)
  texture.wrapS = texture.wrapT = THREE.RepeatWrapping
  texture.repeat.set(3, 2)
  texture.needsUpdate = true
  return texture
}

// Replacement seam: swap this factory for a loaded glTF geometry later while keeping
// the scene choreography and wetness material response unchanged.
function createOrganicSeedGeometry() {
  const geometry = new THREE.SphereGeometry(.62, 72, 52)
  const position = geometry.attributes.position as THREE.BufferAttribute
  const vertex = new THREE.Vector3()
  for (let i = 0; i < position.count; i++) {
    vertex.fromBufferAttribute(position, i)
    const normal = vertex.clone().normalize()
    const longitude = Math.atan2(normal.z, normal.x)
    const latitude = Math.asin(normal.y)
    const fine = Math.sin(longitude * 9 + latitude * 3.4) * .012
    const broad = Math.sin(longitude * 3.1 - latitude * 2.3) * .026
    const dimple = Math.max(0, normal.x * .7 + normal.y * .25 + normal.z * .68) ** 7 * .095
    vertex.multiplyScalar(1 + fine + broad - dimple)
    vertex.x *= .79 + normal.y * .025
    vertex.y *= 1.13
    vertex.z *= .61 - normal.x * .018
    position.setXYZ(i, vertex.x, vertex.y, vertex.z)
  }
  geometry.computeVertexNormals()
  return geometry
}

function Seed({ state }: Pick<Props, 'state'>) {
  const group = useRef<THREE.Group>(null)
  const shell = useRef<THREE.MeshStandardMaterial>(null)
  const geometry = useMemo(createOrganicSeedGeometry, [])
  const surface = useMemo(createSeedSurfaceMaps, [])
  useFrame((_, dt) => {
    if (!group.current || !shell.current) return
    group.current.visible = state.seedVisible > .02
    group.current.position.y = state.seedY
    group.current.rotation.z = state.seedRotation
    group.current.rotation.y += dt * (state.seedY > -0.72 ? .18 : .015)
    group.current.scale.setScalar(.92 + state.seedInfluence * .009)
    shell.current.roughness = .88 - state.seedInfluence * .035
    shell.current.color.setRGB(.19 + state.seedInfluence * .012, .105 + state.seedInfluence * .006, .048)
  })
  return (
    <group ref={group} position={[.06, 3.2, .25]} rotation={[.22, -.28, -.25]}>
      <mesh geometry={geometry} castShadow>
        <meshStandardMaterial ref={shell} map={surface.color} roughnessMap={surface.roughness} bumpMap={surface.bump} bumpScale={.026} color="#7b5636" roughness={.93} metalness={0} />
      </mesh>
      <mesh position={[.36, .03, .37]} rotation={[.1, -.18, -.32]} scale={[.025, .75, .018]}>
        <capsuleGeometry args={[.04, .68, 5, 12]} />
        <meshStandardMaterial color={state.seedInfluence > .25 ? '#1c120b' : '#25160d'} roughness={1} />
      </mesh>
      {[-.29, -.17, -.04, .09, .22].map((x, i) => (
        <mesh key={x} position={[x, -.02 + Math.sin(i) * .025, .378]} rotation={[0, 0, -.2 + i * .075]} scale={[.008 + (i % 2) * .003, .48 - i * .026, .007]}>
          <capsuleGeometry args={[.025, .58, 4, 8]} />
          <meshBasicMaterial color="#6a4021" transparent opacity={.38} />
        </mesh>
      ))}
      {[[-.17, .28, .385, -.35], [.17, -.19, .39, .42], [.05, .08, .398, .12]].map(([x, y, z, r], i) => (
        <mesh key={`crack-${i}`} position={[x, y, z]} rotation={[0, 0, r]} scale={[.008, .12 + i * .035, .006]}>
          <capsuleGeometry args={[.02, .46, 3, 7]} />
          <meshBasicMaterial color="#120b07" transparent opacity={.72} />
        </mesh>
      ))}
    </group>
  )
}

function Soil({ state }: Pick<Props, 'state'>) {
  const random = useMemo(() => seededRandom(27), [])
  const grains = useMemo(() => Array.from({ length: 74 }, (_, i) => ({
    x: (random() - .5) * 6.4,
    y: -.98 + random() * .24,
    z: (random() - .5) * 2.6,
    s: .035 + random() * .11,
    r: random() * Math.PI,
    i,
  })), [random])
  const surface = useMemo(createSoilSurfaceMap, [])
  return (
    <group>
      <mesh position={[0, -1.2, 0]} receiveShadow>
        <sphereGeometry args={[4.25, 72, 32, 0, Math.PI * 2, 0, Math.PI / 2.8]} />
        <meshStandardMaterial color="#17100b" bumpMap={surface} bumpScale={.085} roughness={.97} />
      </mesh>
      {grains.map(g => {
        const impactDistance = Math.hypot(g.x - .72, g.z - .22)
        const nearSeed = Math.max(0, 1 - Math.hypot(g.x - .06, g.z - .2) / .8)
        const spread = .12 + state.wetness * 1.32
        const localWetness = THREE.MathUtils.smoothstep(spread - impactDistance, -.16, .34) * state.wetness
        const clump = localWetness * (.014 + (g.i % 4) * .003)
        const settle = localWetness * (.008 + (g.i % 3) * .003)
        const dry = g.i % 3 === 0 ? new THREE.Color('#392518') : new THREE.Color('#24180f')
        const wet = new THREE.Color(g.i % 4 === 0 ? '#21160f' : '#17100b')
        const color = dry.lerp(wet, localWetness * .82)
        return <mesh key={g.i} position={[g.x + Math.sign(.72 - g.x) * clump, g.y - settle, g.z + Math.sign(.22 - g.z) * clump * .55]} rotation={[g.r, g.r * .5, 0]} scale={g.s * (1 + localWetness * .07 + nearSeed * state.seedInfluence * .018)}>
          <dodecahedronGeometry args={[1, 0]} />
          <meshStandardMaterial color={color} roughness={1 - localWetness * .17} />
        </mesh>
      })}
      <mesh position={[.72, -.912, .22]} rotation={[-Math.PI / 2, 0, -.18]} scale={[.18 + state.wetness * 1.05, .14 + state.wetness * .72, 1]}>
        <circleGeometry args={[1, 64]} />
        <meshStandardMaterial color="#130d09" transparent opacity={state.wetness * .68} roughness={.53 - state.wetness * .14} />
      </mesh>
      <mesh position={[.58, -.907, .16]} rotation={[-Math.PI / 2, 0, .34]} scale={[.12 + state.wetness * .62, .08 + state.wetness * .38, 1]}>
        <circleGeometry args={[1, 48]} />
        <meshStandardMaterial color="#26170f" transparent opacity={state.wetness * .32} roughness={.46} />
      </mesh>
    </group>
  )
}

function Droplet({ state }: Pick<Props, 'state'>) {
  const mesh = useRef<THREE.Mesh>(null)
  useFrame(() => {
    if (!mesh.current) return
    mesh.current.position.y = state.dropletY
    mesh.current.visible = state.dropletVisible > .02
    const proximity = THREE.MathUtils.smoothstep(state.dropletY, -.57, .18)
    mesh.current.scale.set(.105 + proximity * .028, .145 + Math.max(0, state.dropletY) * .012 - proximity * .035, .105 + proximity * .028)
  })
  return <group>
    <mesh ref={mesh} position={[.72, 2.5, .42]}>
      <sphereGeometry args={[1, 32, 24]} />
      <meshPhysicalMaterial color="#d8d0c6" transparent opacity={.52} transmission={.94} roughness={.018} thickness={.28} ior={1.33} clearcoat={.35} clearcoatRoughness={.08} />
    </mesh>
    <mesh position={[.72, -.57, .22]} rotation={[-Math.PI / 2, 0, 0]} scale={[.035 + state.wetness * .045, .028 + state.wetness * .032, 1]}>
      <circleGeometry args={[1, 32]} />
      <meshPhysicalMaterial color="#3a3028" transparent opacity={state.wetness * .24} transmission={.18} roughness={.28} thickness={.05} />
    </mesh>
  </group>
}

function Dust({ reduced }: { reduced: boolean }) {
  const points = useRef<THREE.Points>(null)
  const positions = useMemo(() => {
    const random = seededRandom(73)
    return new Float32Array(Array.from({ length: reduced ? 54 : 150 }, () => [
      (random() - .5) * 8, (random() - .25) * 5, (random() - .5) * 5,
    ]).flat())
  }, [reduced])
  useFrame((_, dt) => { if (points.current) points.current.rotation.y += dt * .012 })
  return <points ref={points}>
    <bufferGeometry><bufferAttribute attach="attributes-position" args={[positions, 3]} /></bufferGeometry>
    <pointsMaterial color="#9a7652" size={.018} transparent opacity={.34} depthWrite={false} />
  </points>
}

function World({ state, pointer, reduced }: Props) {
  const root = useRef<THREE.Group>(null)
  useFrame(({ camera }, dt) => {
    const targetX = pointer.x * .09
    const targetY = .12 + pointer.y * .045 - state.transition * .34
    const soilAttention = Math.sin(state.environmentFocus * Math.PI)
    camera.position.x = THREE.MathUtils.damp(camera.position.x, targetX + soilAttention * .12, 2.2, dt)
    camera.position.y = THREE.MathUtils.damp(camera.position.y, targetY, 2.2, dt)
    camera.position.z = THREE.MathUtils.damp(camera.position.z, 6.05 - state.observation * .9 - state.ready * .14 - state.transition * 1.3, 1.4, dt)
    camera.lookAt(soilAttention * .34, -.08 - soilAttention * .16, 0)
  })
  return <group ref={root}>
    <fog attach="fog" args={['#080604', 3.8, 8]} />
    <ambientLight intensity={.04 + state.observation * .025} color="#8b6745" />
    <directionalLight position={[-2.4, 3.4, 2.4]} intensity={.48 + state.observation * .68} color="#aa7748" castShadow />
    <pointLight position={[1.1, -.55, 1.3]} intensity={.34 + state.wetness * .08} distance={3.1} color="#7a4828" />
    <pointLight position={[.84, -.34, .72]} intensity={state.wetness * .12} distance={1.65} decay={2} color="#9a6c48" />
    <Dust reduced={reduced} />
    <Soil state={state} />
    <Seed state={state} />
    <Droplet state={state} />
  </group>
}

export default function SeedScene(props: Props) {
  return <><color attach="background" args={['#080604']} /><World {...props} /></>
}
