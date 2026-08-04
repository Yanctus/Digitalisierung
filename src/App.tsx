import ActRail from './components/ActRail'
import Navbar from './components/Navbar'
import { Spacer } from './components/ui'
import JourneyCanvas from './scene/JourneyCanvas'
import Act1Feld from './sections/Act1Feld'
import Act2Keim from './sections/Act2Keim'
import Act3Struktur from './sections/Act3Struktur'
import Act4Netz from './sections/Act4Netz'
import Act5Horizont from './sections/Act5Horizont'

/**
 * One continuous scroll from a field at dawn to a lit network at night.
 * The spacers are load-bearing: they give the scene room to animate between
 * acts, so the journey reads as travel rather than as five separate screens.
 */
export default function App() {
  return (
    <div className="relative">
      <JourneyCanvas />

      <div className="relative z-10">
        <Navbar />
        <ActRail />

        <main>
          <Act1Feld />
          <Spacer />
          <Act2Keim />
          <Spacer />
          <Act3Struktur />
          <Spacer />
          <Act4Netz />
          <Spacer />
          <Act5Horizont />
        </main>
      </div>
    </div>
  )
}
