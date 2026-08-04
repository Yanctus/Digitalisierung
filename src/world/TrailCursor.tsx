import { useEffect, useRef } from 'react'

/**
 * Der Zeiger zieht einen Schweif hinter sich her — dieselbe Leuchtspur mit
 * Knoten, die die Libelle im Film hinterlässt. Der Besucher wird für einen
 * Moment selbst zu ihr.
 *
 * Nur auf feinen Zeigern (Maus/Trackpad) und nur ohne prefers-reduced-motion.
 * Auf Touchgeräten und bei Bewegungsreduktion passiert hier gar nichts.
 */

type P = { x: number; y: number; life: number; node: boolean }

export default function TrailCursor() {
  const ref = useRef<HTMLCanvasElement>(null)

  useEffect(() => {
    const fine = window.matchMedia('(hover: hover) and (pointer: fine)').matches
    const reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches
    if (!fine || reduce) return

    const canvas = ref.current
    if (!canvas) return
    const ctx = canvas.getContext('2d')
    if (!ctx) return

    let dpr = Math.min(2, window.devicePixelRatio || 1)
    const resize = () => {
      dpr = Math.min(2, window.devicePixelRatio || 1)
      canvas.width = window.innerWidth * dpr
      canvas.height = window.innerHeight * dpr
      canvas.style.width = window.innerWidth + 'px'
      canvas.style.height = window.innerHeight + 'px'
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0)
    }
    resize()

    const pts: P[] = []
    let mx = -1
    let my = -1
    let last = { x: -1, y: -1 }
    let sinceNode = 0

    const onMove = (e: MouseEvent) => {
      mx = e.clientX
      my = e.clientY
      if (last.x < 0) last = { x: mx, y: my }
      const d = Math.hypot(mx - last.x, my - last.y)
      if (d > 5) {
        sinceNode += d
        // Alle ~46px ein Knoten — wie die Perlen auf ihrer Spur.
        const node = sinceNode > 46
        if (node) sinceNode = 0
        pts.push({ x: mx, y: my, life: 1, node })
        if (pts.length > 44) pts.shift()
        last = { x: mx, y: my }
      }
    }

    let raf = 0
    const draw = () => {
      ctx.clearRect(0, 0, window.innerWidth, window.innerHeight)
      for (let i = 0; i < pts.length; i++) pts[i].life -= 0.022
      while (pts.length && pts[0].life <= 0) pts.shift()

      // Die Spur selbst
      ctx.lineCap = 'round'
      ctx.lineJoin = 'round'
      for (let i = 1; i < pts.length; i++) {
        const a = pts[i - 1]
        const b = pts[i]
        const l = Math.max(0, Math.min(a.life, b.life))
        if (l <= 0) continue
        ctx.strokeStyle = `rgba(169,112,255,${(l * 0.5).toFixed(3)})`
        ctx.lineWidth = 1 + l * 1.6
        ctx.beginPath()
        ctx.moveTo(a.x, a.y)
        ctx.lineTo(b.x, b.y)
        ctx.stroke()
      }

      // Die Knoten
      for (const p of pts) {
        if (!p.node || p.life <= 0) continue
        const r = 1.4 + p.life * 2.2
        const g = ctx.createRadialGradient(p.x, p.y, 0, p.x, p.y, r * 3.4)
        g.addColorStop(0, `rgba(226,208,255,${(p.life * 0.85).toFixed(3)})`)
        g.addColorStop(1, 'rgba(169,112,255,0)')
        ctx.fillStyle = g
        ctx.beginPath()
        ctx.arc(p.x, p.y, r * 3.4, 0, Math.PI * 2)
        ctx.fill()
      }

      raf = requestAnimationFrame(draw)
    }
    raf = requestAnimationFrame(draw)

    window.addEventListener('mousemove', onMove, { passive: true })
    window.addEventListener('resize', resize)
    return () => {
      cancelAnimationFrame(raf)
      window.removeEventListener('mousemove', onMove)
      window.removeEventListener('resize', resize)
    }
  }, [])

  return <canvas ref={ref} className="w-trail" aria-hidden="true" />
}
