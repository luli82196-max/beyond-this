import { useEffect } from 'react'

type Options = { enabled: boolean; onContinue: () => void }

export function useExperienceInput({ enabled, onContinue }: Options) {
  useEffect(() => {
    if (!enabled) return
    const key = (event: KeyboardEvent) => {
      if (['Enter', ' '].includes(event.key)) onContinue()
    }
    addEventListener('keydown', key)
    return () => {
      removeEventListener('keydown', key)
    }
  }, [enabled, onContinue])
}
