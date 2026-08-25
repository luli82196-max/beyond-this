import gsap from 'gsap'
import type { SeedSequenceState } from './seed.types'
import type { createSeedAudio } from '../../systems/audio/seedAudio'

type Options = {
  state: SeedSequenceState
  reducedMotion: boolean
  audio: ReturnType<typeof createSeedAudio>
  onUpdate: () => void
  onProgress: (progress: number) => void
}

export function createSeedTimeline({ state, reducedMotion, audio, onUpdate, onProgress }: Options) {
  const timeline = gsap.timeline({
    defaults: { ease: 'power2.inOut' },
    onUpdate: () => { onUpdate(); onProgress(timeline.progress()) },
  })
  if (reducedMotion) {
    timeline.set(state, { observation: 1, seedY: -.69, seedVisible: 1, wetness: .82, seedInfluence: .58, environmentFocus: 1, title: 1, ready: 1 }).call(onUpdate)
    return timeline
  }
  timeline.to(state, { seedVisible: .5, duration: 1.7 }, 1.4)
    .to(state, { observation: .55, seedVisible: 1, duration: 2.7, ease: 'sine.inOut' }, 2.0)
    .to(state, { observation: 1, duration: 2.2, ease: 'sine.out' }, 4.5)
    .to(state, { seedY: -.68, seedRotation: .16, duration: 3.15, ease: 'power1.in' }, 4.8)
    .call(() => audio.play('soil'), [], 7.88)
    .to(state, { impact: 1, duration: .22, ease: 'power2.out' }, 7.9)
    .to(state, { impact: 0, duration: .75 }, 8.12)
    .call(() => audio.play('water'), [], 9.28)
    .to(state, { dropletVisible: 1, duration: .24 }, 9.48)
    .to(state, { dropletY: -.57, duration: 2.12, ease: 'power2.in' }, 9.62)
    .to(state, { environmentFocus: .68, duration: 1.05, ease: 'sine.inOut' }, 10.72)
    .to(state, { dropletVisible: 0, duration: .12 }, 11.72)
    .call(() => audio.play('wet_soil'), [], 11.76)
    .to(state, { wetness: 1, duration: 2.55, ease: 'sine.inOut' }, 11.76)
    .call(() => audio.play('subtle_environment_change'), [], 12.62)
    .to(state, { seedInfluence: 1, environmentFocus: 1, duration: 1.55, ease: 'sine.inOut' }, 12.88)
    .to(state, { title: 1, duration: 1.55 }, 14.18)
    .to(state, { ready: 1, duration: 1.1 }, 15.72)
  return timeline
}
