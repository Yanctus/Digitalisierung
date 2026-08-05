import { useEffect, useRef } from 'react'

/**
 * Der Splitterrochen — als Lichterscheinung, nicht als Bild.
 *
 * Die erste Fassung war ein PNG mit `mix-blend-mode: screen`, das über das
 * Video geschoben wurde. Das sah billig aus, und zwar aus einem Grund: Ein
 * flaches Bild, das starr über eine bewegte Szene gleitet, ist ein Aufkleber.
 * Keine Verformung, keine Bewegungsunschärfe, keine Reaktion auf Tempo.
 *
 * Jetzt wird er auf einer Canvas **additiv** gezeichnet. Das ändert alles:
 *
 *  - Schwarz trägt beim additiven Zeichnen nichts bei. Es gibt keine Kante und
 *    keinen milchigen Rahmen — er ist reines Licht im Wasser.
 *  - Bei Tempo wird er mehrfach entlang seiner Bahn gestempelt: echte
 *    Bewegungsunschärfe statt eines scharfen Objekts, das durchs Bild schießt.
 *  - Er schlägt mit den Flügeln (Stauchung quer zur Flugrichtung) und **legt
 *    sich in die Kurve**, statt sich nur zu drehen.
 *  - Hinter ihm zerfällt eine Funkenspur. Sie ist es, die die Bewegung lesbar
 *    macht — nicht der Körper.
 *  - Je schneller er fliegt, desto mehr Licht und desto weniger Körper.
 *
 * Er bleibt eine Ebene über dem Video und nie ein Teil davon: Der Rückweg ist
 * derselbe Clip rückwärts, ein eingebrannter Rochen würde dabei rückwärts
 * schwimmen.
 */

export type RayMode = 'idle' | 'launch' | 'hidden'

type P = { x: number; y: number }

/** Ruheplatz und Bahn, in Prozent des Videobilds. */
const IDLE_CENTRE: P = { x: 24, y: 26 }
const IDLE_RADIUS: P = { x: 14, y: 5 }
/** Das Bild zeigt den Rochen mit dem Kopf nach unten. */
const ART_OFFSET = Math.PI / 2

type Spark = { x: number; y: number; vx: number; vy: number; life: number; warm: boolean }

export default function RayLayer({
  mode,
  target,
  onArrived,
}: {
  mode: RayMode
  target: P | null
  onArrived?: () => void
}) {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const modeRef = useRef(mode)
  const targetRef = useRef(target)
  const arrivedRef = useRef(false)
  const cbRef = useRef(onArrived)

  useEffect(() => {
    cbRef.current = onArrived
  }, [onArrived])

  // Beim Wechsel in den Anflug die Bahn einmal festlegen — nicht in jedem
  // Frame neu, sonst zieht sich die Kurve mit der Bewegung mit.
  const flight = useRef<{ from: P; ctrl: P; to: P; t0: number } | null>(null)
  const posRef = useRef({ x: IDLE_CENTRE.x, y: IDLE_CENTRE.y })

  useEffect(() => {
    modeRef.current = mode
    targetRef.current = target
    if (mode === 'launch' && target) {
      const from = { ...posRef.current }
      flight.current = {
        from,
        // Kontrollpunkt oberhalb der Verbindung: er fällt im Bogen ein,
        // statt schnurgerade zu schießen.
        ctrl: { x: (from.x + target.x) / 2, y: Math.min(from.y, target.y) - 16 },
        to: target,
        t0: performance.now(),
      }
      arrivedRef.current = false
    } else {
      flight.current = null
      arrivedRef.current = false
    }
  }, [mode, target])

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return
    const ctx = canvas.getContext('2d')
    if (!ctx) return

    const reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches
    const img = new Image()
    let ready = false
    img.onload = () => (ready = true)
    img.src = '/dive/rochen.png'

    let dpr = 1
    const fit = () => {
      dpr = Math.min(2, window.devicePixelRatio || 1)
      const r = canvas.getBoundingClientRect()
      canvas.width = Math.max(1, Math.round(r.width * dpr))
      canvas.height = Math.max(1, Math.round(r.height * dpr))
    }
    fit()
    const ro = new ResizeObserver(fit)
    ro.observe(canvas)

    const sparks: Spark[] = []
    let px = IDLE_CENTRE.x
    let py = IDLE_CENTRE.y
    let heading = 0
    let bank = 0
    let opacity = 0
    let size = 0.34
    let speed = 0
    const t0 = performance.now()
    let raf = 0

    const step = () => {
      const now = performance.now()
      const W = canvas.width
      const H = canvas.height
      ctx.clearRect(0, 0, W, H)

      const m = modeRef.current
      let nx = px
      let ny = py
      let wantOp = 0
      let wantSize = 0.34

      if (m === 'launch' && flight.current) {
        const F = flight.current
        const dur = reduce ? 1 : 1050
        const raw = Math.min(1, (now - F.t0) / dur)
        // Langsam anschieben, dann durchziehen — das Tempo entsteht am Ende.
        const t = raw * raw * (3 - 2 * raw) * 0.3 + raw * raw * raw * 0.7
        const inv = 1 - t
        nx = inv * inv * F.from.x + 2 * inv * t * F.ctrl.x + t * t * F.to.x
        ny = inv * inv * F.from.y + 2 * inv * t * F.ctrl.y + t * t * F.to.y
        wantSize = 0.34 + t * 1.0
        // Er löst sich auf, bevor er ankommt — als tauchte er ins Ziel ein.
        wantOp = raw < 0.7 ? 1 : Math.max(0, 1 - (raw - 0.7) / 0.3)
        if (raw >= 1 && !arrivedRef.current) {
          arrivedRef.current = true
          cbRef.current?.()
        }
      } else if (m === 'hidden') {
        wantOp = 0
      } else {
        const a = (now - t0) / 1000
        nx = IDLE_CENTRE.x + Math.cos(a * 0.16) * IDLE_RADIUS.x
        ny = IDLE_CENTRE.y + Math.sin(a * 0.33) * IDLE_RADIUS.y
        wantOp = 0.7
        wantSize = 0.34
      }

      // Geschwindigkeit in Prozentpunkten je Frame — treibt Unschärfe,
      // Flügelschlag, Funken und Helligkeit.
      const vx = nx - px
      const vy = ny - py
      speed = Math.hypot(vx, vy)
      px = nx
      py = ny
      posRef.current = { x: px, y: py }

      if (speed > 0.0015) {
        const want = Math.atan2(vy, vx)
        // Kurzer Weg um den Kreis, sonst schlägt er bei ±180° um.
        let d = want - heading
        while (d > Math.PI) d -= Math.PI * 2
        while (d < -Math.PI) d += Math.PI * 2
        heading += d * 0.25
        // In die Kurve legen: je schärfer die Drehung, desto stärker.
        bank += (Math.max(-0.55, Math.min(0.55, d * 7)) - bank) * 0.12
      } else {
        bank += (0 - bank) * 0.06
      }

      opacity += (wantOp - opacity) * 0.1
      size += (wantSize - size) * 0.14

      const X = (px / 100) * W
      const Y = (py / 100) * H
      const w = W * 0.22 * size
      const h = w * (img.height / (img.width || 1) || 0.55)

      // ---- Funkenspur ----
      if (opacity > 0.05 && speed > 0.02 && !reduce) {
        for (let i = 0; i < 3; i++) {
          const spread = (Math.random() - 0.5) * w * 0.5
          sparks.push({
            x: X - (vx / 100) * W * 0.6 + Math.cos(heading + Math.PI / 2) * spread,
            y: Y - (vy / 100) * H * 0.6 + Math.sin(heading + Math.PI / 2) * spread,
            vx: -(vx / 100) * W * 0.12 + (Math.random() - 0.5) * 0.6,
            vy: -(vy / 100) * H * 0.12 + (Math.random() - 0.5) * 0.6,
            life: 1,
            warm: Math.random() < 0.35,
          })
        }
      }
      ctx.globalCompositeOperation = 'lighter'
      for (let i = sparks.length - 1; i >= 0; i--) {
        const s = sparks[i]
        s.x += s.vx
        s.y += s.vy
        s.life -= 0.022
        if (s.life <= 0) {
          sparks.splice(i, 1)
          continue
        }
        const r = 6 * dpr * s.life
        const g = ctx.createRadialGradient(s.x, s.y, 0, s.x, s.y, r)
        const col = s.warm ? '255,170,90' : '190,140,255'
        g.addColorStop(0, `rgba(${col},${(s.life * 0.75 * opacity).toFixed(3)})`)
        g.addColorStop(1, `rgba(${col},0)`)
        ctx.fillStyle = g
        ctx.beginPath()
        ctx.arc(s.x, s.y, r, 0, Math.PI * 2)
        ctx.fill()
      }

      // ---- Der Rochen ----
      if (ready && opacity > 0.01) {
        // Flügelschlag: Stauchung quer zur Flugrichtung, im Ruheflug langsam,
        // beim Beschleunigen schneller.
        const beat = 1 + Math.sin((now / 1000) * (2.2 + speed * 40)) * 0.11
        // Bei Tempo mehrfach entlang der Bahn stempeln — echte Unschärfe.
        const stamps = reduce ? 1 : Math.min(6, 1 + Math.round(speed * 26))
        for (let i = 0; i < stamps; i++) {
          const back = i / Math.max(1, stamps)
          const a = (opacity * (1 - back) ** 1.7) / (i === 0 ? 1 : 1.5)
          if (a < 0.01) continue
          ctx.save()
          ctx.globalAlpha = a
          ctx.translate(X - (vx / 100) * W * back * 2.2, Y - (vy / 100) * H * back * 2.2)
          ctx.rotate(heading + ART_OFFSET)
          ctx.scale(1 + bank * 0.35, beat * (1 - Math.abs(bank) * 0.3))
          ctx.drawImage(img, -w / 2, -h / 2, w, h)
          ctx.restore()
        }
        // Kern-Glut: macht ihn zu Licht statt zu einem Foto.
        const gr = ctx.createRadialGradient(X, Y, 0, X, Y, w * 0.45)
        gr.addColorStop(0, `rgba(255,180,110,${(0.32 * opacity).toFixed(3)})`)
        gr.addColorStop(0.5, `rgba(170,110,255,${(0.16 * opacity).toFixed(3)})`)
        gr.addColorStop(1, 'rgba(170,110,255,0)')
        ctx.fillStyle = gr
        ctx.beginPath()
        ctx.arc(X, Y, w * 0.45, 0, Math.PI * 2)
        ctx.fill()
      }

      ctx.globalCompositeOperation = 'source-over'
      raf = requestAnimationFrame(step)
    }

    raf = requestAnimationFrame(step)
    return () => {
      cancelAnimationFrame(raf)
      ro.disconnect()
    }
  }, [])

  return <canvas ref={canvasRef} className="d-ray" aria-hidden="true" />
}
