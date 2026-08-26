import * as THREE from 'three'

export const WOOD_CONTINUITY = Object.freeze({
  barkBase: '#b39a78',
  barkRoughness: .93,
  barkBumpScale: .105,
  barkRepeat: [3.2, 7.5] as const,
  endGrainHeartwood: '#8f6845',
  endGrainSapwood: '#b89262',
  endGrainFresh: '#c3a06d',
  workedWoodBase: '#765638',
  workedWoodWear: '#987552',
  roomWoodTarget: '#735438',
  roomWoodRoughness: .88,
})

const seededRandom = (seed: number) => { let value = seed; return () => ((value = value * 16807 % 2147483647) - 1) / 2147483646 }

export function createBarkTexture(size: number, bump = false) {
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
  texture.repeat.set(...WOOD_CONTINUITY.barkRepeat); texture.anisotropy = 4; texture.needsUpdate = true
  return texture
}

export function createEndGrainTexture(size = 192) {
  const random = seededRandom(833), data = new Uint8Array(size * size * 4), center = (size - 1) / 2
  for (let y = 0; y < size; y++) for (let x = 0; x < size; x++) {
    const i = (y * size + x) * 4, dx = x - center, dy = y - center
    const radius = Math.hypot(dx * 1.04, dy), angle = Math.atan2(dy, dx)
    const rings = Math.sin(radius * .43 + Math.sin(angle * 5) * .75 + Math.sin(radius * .08) * 1.2)
    const ray = Math.abs(Math.sin(angle * 13 + radius * .018)) ** 16
    const check = Math.abs(Math.sin(angle * 3.05 + .7)) < .035 && radius > size * .16 ? Math.min(1, (radius - size * .16) / 18) : 0
    const value = THREE.MathUtils.clamp(154 + rings * 19 - ray * 10 - check * 76 + (random() - .5) * 8, 38, 214)
    data.set([value, value * .86, value * .66, 255], i)
  }
  const texture = new THREE.DataTexture(data, size, size, THREE.RGBAFormat)
  texture.colorSpace = THREE.SRGBColorSpace; texture.anisotropy = 4; texture.needsUpdate = true
  return texture
}

export function createWorkedWoodTexture(size = 128) {
  const random = seededRandom(417), data = new Uint8Array(size * size * 4)
  for (let y = 0; y < size; y++) for (let x = 0; x < size; x++) {
    const i = (y * size + x) * 4
    const fiber = Math.sin(y * .32 + Math.sin(x * .04) * 2.1) * 15 + Math.sin(y * .075) * 7
    const pore = Math.abs(Math.sin(y * .91 + x * .035)) ** 12 * 9
    const value = THREE.MathUtils.clamp(132 + fiber - pore + (random() - .5) * 10, 48, 220)
    data.set([value, value * .87, value * .7, 255], i)
  }
  const texture = new THREE.DataTexture(data, size, size, THREE.RGBAFormat)
  texture.colorSpace = THREE.SRGBColorSpace; texture.wrapS = texture.wrapT = THREE.RepeatWrapping
  texture.repeat.set(1.4, 7); texture.anisotropy = 4; texture.needsUpdate = true
  return texture
}
