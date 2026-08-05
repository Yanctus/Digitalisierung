import { useEffect, useRef } from 'react'

/**
 * Der Splitterrochen als Webebene über dem Video.
 *
 * Er ist **nie im Video**. Das ist keine Sparmaßnahme, sondern die Bedingung
 * dafür, dass das Auftauchen funktioniert: Der Rückweg ist derselbe Clip
 * rückwärts, und ein eingebrannter Rochen würde dabei rückwärts schwimmen.
 * Als Ebene fliegt er in beide Richtungen vorwärts.
 *
 * Freigestellt wird er nicht über einen Alphakanal — das Bild liegt auf reinem
 * Schwarz und `mix-blend-mode: screen` löscht Schwarz bei einem leuchtenden
 * Wesen sauberer, als jede Maske es könnte.
 *
 * Drei Zustände:
 *   idle    — kleine, langsame Runde im Hintergrund der Welt
 *   launch  — beschleunigt auf den angeklickten Ort zu und verschwindet dort
 *   hidden  — während Tauchgang, Raum und Auftauchen ist er aus dem Bild
 */

export type RayMode = 'idle' | 'launch' | 'hidden'

type P = { x: number; y: number }

/** Position in Prozent des Videobilds — dieselbe Rechnung wie bei den Orten. */
const IDLE_CENTRE: P = { x: 24, y: 26 }
const IDLE_RADIUS: P = { x: 13, y: 5 }
/** Das Bild zeigt den Rochen mit dem Kopf nach unten. */
const ART_OFFSET_DEG = -90

export default function RayLayer({
  mode,
  target,
  onArrived,
}: {
  mode: RayMode
  /** Ziel in Prozent, wenn `mode === 'launch'`. */
  target: P | null
  onArrived?: () => void
}) {
  const ref = useRef<HTMLImageElement>(null)
  const state = useRef({ x: IDLE_CENTRE.x, y: IDLE_CENTRE.y, deg: 0, scale: 0.34, op: 0 })
  const launch = useRef<{ from: P; ctrl: P; to: P; t0: number } | null>(null)
  const arrived = useRef(false)

  // Den Anflug beim Wechsel nach 'launch' einmal festlegen — nicht in jedem
  // Frame neu, sonst zieht sich die Kurve mit der Bewegung mit.
  useEffect(() => {
    if (mode !== 'launch' || !target) {
      launch.current = null
      arrived.current = false
      return
    }
    const from = { x: state.current.x, y: state.current.y }
    launch.current = {
      from,
      // Kontrollpunkt über der Verbindungslinie: er fällt in einem Bogen ein,
      // statt schnurgerade zu schießen.
      ctrl: { x: (from.x + target.x) / 2, y: Math.min(from.y, target.y) - 14 },
      to: target,
      t0: performance.now(),
    }
    arrived.current = false
  }, [mode, target])

  useEffect(() => {
    const reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches
    let raf = 0
    const t0 = performance.now()

    const step = () => {
      const now = performance.now()
      const s = state.current
      const el = ref.current

      if (mode === 'hidden') {
        s.op += (0 - s.op) * 0.12
      } else if (mode === 'launch' && launch.current) {
        const L = launch.current
        const dur = reduce ? 1 : 950
        const raw = Math.min(1, (now - L.t0) / dur)
        // Langsam anschieben, dann durchziehen — das Tempo entsteht am Ende.
        const t = raw * raw * (3 - 2 * raw) * 0.35 + raw * raw * raw * 0.65
        const inv = 1 - t
        const bx = inv * inv * L.from.x + 2 * inv * t * L.ctrl.x + t * t * L.to.x
        const by = inv * inv * L.from.y + 2 * inv * t * L.ctrl.y + t * t * L.to.y
        const dx = bx - s.x
        const dy = by - s.y
        if (Math.abs(dx) + Math.abs(dy) > 0.01) {
          s.deg = (Math.atan2(dy, dx) * 180) / Math.PI + ART_OFFSET_DEG
        }
        s.x = bx
        s.y = by
        s.scale = 0.34 + t * 0.9
        // Er verschwindet, bevor er ankommt — als tauchte er ins Ziel ein.
        s.op = raw < 0.72 ? Math.min(1, s.op + 0.09) : Math.max(0, s.op - 0.14)
        if (raw >= 1 && !arrived.current) {
          arrived.current = true
          onArrived?.()
        }
      } else {
        // Ruhige Runde im Hintergrund, leicht schwebend.
        const a = (now - t0) / 1000
        const nx = IDLE_CENTRE.x + Math.cos(a * 0.17) * IDLE_RADIUS.x
        const ny = IDLE_CENTRE.y + Math.sin(a * 0.34) * IDLE_RADIUS.y
        const dx = nx - s.x
        const dy = ny - s.y
        if (Math.abs(dx) + Math.abs(dy) > 0.005) {
          s.deg = (Math.atan2(dy, dx) * 180) / Math.PI + ART_OFFSET_DEG
        }
        s.x = nx
        s.y = ny
        s.scale += (0.34 - s.scale) * 0.08
        s.op += (0.62 - s.op) * 0.05
      }

      if (el) {
        el.style.left = s.x.toFixed(3) + '%'
        el.style.top = s.y.toFixed(3) + '%'
        el.style.opacity = s.op.toFixed(3)
        el.style.transform =
          `translate(-50%, -50%) rotate(${s.deg.toFixed(1)}deg) scale(${s.scale.toFixed(3)})`
      }
      raf = requestAnimationFrame(step)
    }

    raf = requestAnimationFrame(step)
    return () => cancelAnimationFrame(raf)
  }, [mode, onArrived])

  return <img ref={ref} className="d-ray" src="/dive/rochen.png" alt="" aria-hidden="true" />
}
