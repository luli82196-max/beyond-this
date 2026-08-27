import { audioAvailable } from '../../systems/audio/ExperienceAudioDirector'
import { useExperienceController } from '../../systems/timeline/ExperienceController'

export default function SoundControl() {
  const controller = useExperienceController()
  if (!audioAvailable) return null
  return <button onClick={event => {
    event.stopPropagation()
    const muted = !controller.muted
    document.dispatchEvent(new CustomEvent('beyond-audio-user-setting', { detail: { muted } }))
    controller.setMuted(muted)
  }} aria-label={controller.muted ? '开启声音' : '静音'}>{controller.muted ? 'SOUND OFF' : 'SOUND ON'}</button>
}
