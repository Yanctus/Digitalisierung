import ScrollWorld from './world/ScrollWorld'
import './world/world.css'

/**
 * Eine durchgehende Kamerafahrt vom Ast bis über die vernetzte Stadt.
 *
 * Die acht Legs liegen als vorgerendertes Video in public/world/vid und werden
 * per Scrollposition gescrubbt — die Kamera bewegt sich wirklich, Scrollen
 * treibt nur die Zeit. Der frühere Canvas-Ansatz (src/scene/, src/sections/)
 * ist damit abgelöst; die Dateien bleiben vorerst liegen, falls etwas daraus
 * gebraucht wird.
 */
export default function App() {
  return <ScrollWorld />
}
