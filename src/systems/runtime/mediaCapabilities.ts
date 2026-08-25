import { useEffect, useState } from 'react'

function readQuery(query: string) { return typeof matchMedia !== 'undefined' && matchMedia(query).matches }

export function useMediaCapabilities() {
  const [state, setState] = useState(() => ({ reducedMotion: readQuery('(prefers-reduced-motion: reduce)'), mobile: readQuery('(max-width: 720px)'), lowPower: typeof navigator !== 'undefined' && navigator.hardwareConcurrency > 0 && navigator.hardwareConcurrency <= 4 }))
  useEffect(() => {
    const reduced = matchMedia('(prefers-reduced-motion: reduce)'), mobile = matchMedia('(max-width: 720px)')
    const update = () => setState({ reducedMotion: reduced.matches, mobile: mobile.matches, lowPower: navigator.hardwareConcurrency > 0 && navigator.hardwareConcurrency <= 4 })
    reduced.addEventListener('change', update); mobile.addEventListener('change', update)
    return () => { reduced.removeEventListener('change', update); mobile.removeEventListener('change', update) }
  }, [])
  return state
}

export function resolveDpr({ reducedMotion, mobile, lowPower }: ReturnType<typeof useMediaCapabilities>): [number, number] {
  if (reducedMotion || lowPower) return [1, 1.15]
  if (mobile) return [1, 1.3]
  return [1, 1.5]
}
