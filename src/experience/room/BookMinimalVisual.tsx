import type { BookMinimalVisualOutput } from './roomBookMinimalVisualRenderer'
import type * as THREE from 'three'

export default function BookMinimalVisual({ visual, attention, paperMap }: { visual: BookMinimalVisualOutput; attention: number; paperMap: THREE.Texture }) {
  const { layout, placement, paper, roomLight, typography } = visual
  const isOpen = visual.visualMode === 'opened-book'
  const pageLines = visual.page ? [visual.page.eyebrow, visual.page.title, ...visual.page.bodyBlocks].filter(Boolean) : []
  return <group position={placement.position} rotation={placement.rotation} scale={placement.scale * (isOpen ? 1.14 : 1)}>
    <mesh position={[0, -layout.coverThickness * .3, 0]}><boxGeometry args={[layout.spreadWidth, layout.coverThickness, layout.spreadDepth]} /><meshStandardMaterial color="#654a34" roughness={.78} /></mesh>
    {(isOpen ? [-.25, .25] : [0]).map((x, index) => <group key={x} position={[x, layout.pageThickness * 1.4, 0]} rotation={[0, 0, isOpen ? (index ? -placement.openAngle : placement.openAngle) : 0]}>
      <mesh><boxGeometry args={[isOpen ? layout.spreadWidth / 2 - layout.gutterWidth : layout.spreadWidth * .94, layout.pageThickness, layout.spreadDepth * .94]} /><meshStandardMaterial color={paper.baseColor} map={paperMap} bumpMap={paperMap} bumpScale={.008} roughness={paper.roughness} /></mesh>
      {isOpen && pageLines.slice(0, typography.maxBodyLines).map((_, line) => <mesh key={line} position={[index ? -.025 : .025, layout.pageThickness * .58, -.22 + line * typography.lineGap]} rotation={[-Math.PI / 2, 0, 0]}><planeGeometry args={[line === 1 ? .34 : .27 - line * .01, line === 1 ? .011 : .005]} /><meshBasicMaterial color={paper.inkColor} transparent opacity={line === 1 ? .48 : .28} /></mesh>)}
    </group>)}
    <pointLight position={[0, .72, .22]} intensity={.075 + attention * roomLight.fillLightFactor} distance={1.8} color="#d9ad70" />
  </group>
}
