import { ExperienceProvider } from './systems/timeline/ExperienceController'
import Experience from './experience/Experience'

export default function App() {
  return <ExperienceProvider><Experience /></ExperienceProvider>
}
