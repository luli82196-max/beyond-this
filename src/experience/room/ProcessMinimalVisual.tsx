import { useEffect, useMemo } from 'react'
import * as THREE from 'three'
import type { RoomProcessVisualOutput } from './roomProcessVisualAdapter'

type Props = { visual: RoomProcessVisualOutput; attention: number }

function wrapText(context: CanvasRenderingContext2D, text: string, maxWidth: number): string[] {
  const words = text.split(' ')
  const lines: string[] = []
  let line = ''
  words.forEach((word) => {
    const candidate = line ? `${line} ${word}` : word
    if (context.measureText(candidate).width > maxWidth && line) {
      lines.push(line)
      line = word
    } else line = candidate
  })
  if (line) lines.push(line)
  return lines
}

function createProcessTexture(visual: RoomProcessVisualOutput): THREE.CanvasTexture {
  const canvas = document.createElement('canvas')
  canvas.width = 1024
  canvas.height = 720
  const context = canvas.getContext('2d')
  if (!context) throw new Error('Process visual requires a 2D canvas context.')

  context.fillStyle = '#242925'
  context.fillRect(0, 0, canvas.width, canvas.height)
  const wash = context.createLinearGradient(0, 0, canvas.width, canvas.height)
  wash.addColorStop(0, 'rgba(178, 153, 105, .10)')
  wash.addColorStop(.55, 'rgba(68, 83, 74, .04)')
  wash.addColorStop(1, 'rgba(10, 12, 11, .22)')
  context.fillStyle = wash
  context.fillRect(0, 0, canvas.width, canvas.height)
  context.fillStyle = '#b9aa82'
  context.font = '500 25px Georgia, serif'
  context.fillText(visual.heading.toUpperCase(), 58, 62)
  context.fillStyle = '#718078'
  context.font = '18px Georgia, serif'
  context.fillText(`NOTE ${String(visual.activeDecisionIndex + 1).padStart(2, '0')}  /  ${String(visual.decisionCount).padStart(2, '0')}`, 826, 61)
  context.fillStyle = '#e0dacb'
  context.font = '600 38px Georgia, serif'
  context.fillText(visual.decisionTitle, 58, 120)

  visual.sections.forEach((section, index) => {
    const y = 176 + index * 129
    context.strokeStyle = index === 3 ? '#9b8355' : '#465149'
    context.lineWidth = index === 3 ? 3 : 1
    context.beginPath(); context.moveTo(58, y + 5); context.lineTo(58, y + 91); context.stroke()
    context.fillStyle = index === 3 ? '#d1bb83' : '#9fada4'
    context.font = '600 16px Arial, sans-serif'
    context.fillText(section.label.toUpperCase(), 88, y + 22)
    context.fillStyle = '#d7d4ca'
    context.font = index === 3 ? 'italic 21px Georgia, serif' : '20px Georgia, serif'
    wrapText(context, section.body, 850).slice(0, 3).forEach((line, lineIndex) => {
      context.fillText(line, 88, y + 52 + lineIndex * 25)
    })
  })

  const texture = new THREE.CanvasTexture(canvas)
  texture.colorSpace = THREE.SRGBColorSpace
  texture.anisotropy = 4
  texture.needsUpdate = true
  return texture
}

/** Read-only Room surface for the Process adapter output. */
export default function ProcessMinimalVisual({ visual, attention }: Props) {
  const texture = useMemo(() => createProcessTexture(visual), [visual])
  useEffect(() => () => texture.dispose(), [texture])

  return <mesh position={[0, 0, .034]}>
    <planeGeometry args={[.9, .63]} />
    <meshBasicMaterial map={texture} color={new THREE.Color('#bfc6c0').lerp(new THREE.Color('#ffffff'), attention * .18)} toneMapped={false} />
  </mesh>
}
