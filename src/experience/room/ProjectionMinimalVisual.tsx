import { useEffect, useMemo, useRef } from 'react'
import { useFrame } from '@react-three/fiber'
import * as THREE from 'three'
import type { RoomProjectionRuntimeOutput } from './roomProjectionRuntimeOutput'
import type { MediaElementLike } from '../../content'

function createIdentityTexture(output: RoomProjectionRuntimeOutput): THREE.CanvasTexture {
  const canvas = document.createElement('canvas')
  canvas.width = 1024
  canvas.height = 576
  const context = canvas.getContext('2d')
  if (!context) throw new Error('Projection identity requires a 2D canvas context.')
  context.fillStyle = '#30332f'; context.fillRect(0, 0, 1024, 576)
  context.fillStyle = '#bba878'; context.font = '500 25px Arial, sans-serif'; context.fillText('BT-P03  /  PROJECTION', 64, 70)
  context.fillStyle = '#e4ded0'; context.font = '600 58px Georgia, serif'; context.fillText(output.motionIdentity, 64, 178)
  context.fillStyle = '#aaa797'; context.font = '28px Georgia, serif'; context.fillText(output.title, 64, 230)
  context.strokeStyle = '#807252'; context.lineWidth = 3; context.strokeRect(64, 300, 896, 156)
  context.fillStyle = '#b8b3a5'; context.font = '23px Arial, sans-serif'; context.fillText(`PLAYBACK  /  ${output.mediaRuntime.lifecycle.toUpperCase()}`, 96, 365)
  context.fillStyle = '#77796f'; context.font = '20px Arial, sans-serif'; context.fillText(output.mediaRuntime.fallback ? 'MOTION STUDY  /  STATIC FALLBACK' : 'MOTION STUDY  /  READY ON DEEP', 96, 410)
  const texture = new THREE.CanvasTexture(canvas)
  texture.colorSpace = THREE.SRGBColorSpace; texture.needsUpdate = true
  return texture
}

/** Displays Projection identity only; it owns no media source or playback object. */
export default function ProjectionMinimalVisual({ output, attention, mediaElement }: { output: RoomProjectionRuntimeOutput; attention: number; mediaElement: MediaElementLike | null }) {
  const material = useRef<THREE.MeshBasicMaterial>(null)
  const texture = useMemo(() => createIdentityTexture(output), [output])
  useEffect(() => () => texture.dispose(), [texture])
  const videoTexture = useMemo(() => mediaElement instanceof HTMLVideoElement ? new THREE.VideoTexture(mediaElement) : null, [mediaElement])
  useEffect(() => () => videoTexture?.dispose(), [videoTexture])
  const showVideo = Boolean(videoTexture && output.mediaRuntime.lifecycle === 'playing' && !output.mediaRuntime.fallback)
  useFrame((_, delta) => {
    if (material.current) material.current.opacity = THREE.MathUtils.damp(material.current.opacity, showVideo ? .74 : .54, 7, delta)
  })
  return <mesh position={[0, 0, .014]}>
    <planeGeometry args={[2.18, 1.18]} />
    <meshBasicMaterial ref={material} map={showVideo ? videoTexture : texture} transparent opacity={.46 + attention * .08} toneMapped={false} />
  </mesh>
}
