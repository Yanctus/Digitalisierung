import { useEffect, useState } from 'react'
import ScrollWorld from './world/ScrollWorld'
import TreeWorld from './tree/TreeWorld'
import './world/world.css'
import './world/portfolio.css'
import './tree/tree.css'

/**
 * Zwei Welten, eine Seite.
 *
 * `/`      — Die Reise. Eine durchgehende Kamerafahrt vom Ast bis über die
 *            vernetzte Stadt, per Scroll gescrubbt, danach die Landeseite.
 * `/#baum` — Der Baum. Prototyp der begehbaren Welt: Scrollen steigt den
 *            Stamm hoch, Klicken führt seitwärts in eine Kammer.
 *
 * Bewusst über den Hash statt über einen Router: Beides sind eigenständige
 * Vollbild-Erlebnisse ohne gemeinsame Navigation, und der Prototyp soll die
 * bestehende Seite an keiner Stelle anfassen.
 */
export default function App() {
  const [hash, setHash] = useState(() => window.location.hash)

  useEffect(() => {
    const onHash = () => {
      setHash(window.location.hash)
      // Beide Welten fangen oben an — sonst landet man mitten im Film.
      window.scrollTo(0, 0)
    }
    window.addEventListener('hashchange', onHash)
    return () => window.removeEventListener('hashchange', onHash)
  }, [])

  return hash === '#baum' ? <TreeWorld /> : <ScrollWorld />
}
