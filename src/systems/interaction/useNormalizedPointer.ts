import { useEffect, useRef } from 'react'
import type { NormalizedPointer } from '../camera/camera.types'

export function useNormalizedPointer() {
  const pointer = useRef<NormalizedPointer>({ x: 0, y: 0 })
  useEffect(() => {
    const move = (event: PointerEvent) => {
      pointer.current.x = event.clientX / innerWidth * 2 - 1
      pointer.current.y = -(event.clientY / innerHeight * 2 - 1)
    }
    addEventListener('pointermove', move)
    return () => removeEventListener('pointermove', move)
  }, [])
  return pointer
}
