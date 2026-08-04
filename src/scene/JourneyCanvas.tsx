import { useEffect, useRef } from 'react'
import { clamp } from '../lib/rng'
import { setJourneyProgress } from '../lib/journeyProgress'
import { buildSceneModel } from './sceneModel'
import { renderJourney } from './renderJourney'

/**
 * Fixed full-bleed scene layer. Scroll drives the timeline; a lerp smooths it so
 * that flicking the wheel glides instead of snapping.
 *
 * This is the same architecture as a scroll-scrubbed video background — scroll →
 * progress → smoothing → draw — except the frames are generated rather than
 * decoded. To switch to real video frames later, replace the `renderJourney`
 * call with a blit of the cached frame at `smoothed`; nothing else changes.
 */
export default function JourneyCanvas() {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const hostRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const canvas = canvasRef.current
    const host = hostRef.current
    if (!canvas || !host) return
    const ctx = canvas.getContext('2d', { alpha: false })
    if (!ctx) return

    const model = buildSceneModel()
    const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches

    let width = 0
    let height = 0
    let target = 0
    let smoothed = 0
    let raf = 0
    const start = performance.now()

    // Measure the host element rather than the window: it reports correct
    // dimensions even when the page mounts into a not-yet-laid-out container,
    // and it also picks up mobile browser-chrome collapse and scrollbar shifts
    // that never fire a window resize event.
    const resize = () => {
      const rect = host.getBoundingClientRect()
      const w = Math.round(rect.width)
      const h = Math.round(rect.height)
      if (w === width && h === height) return
      width = w
      height = h
      if (width === 0 || height === 0) return
      const dpr = Math.min(window.devicePixelRatio || 1, 2)
      canvas.width = Math.round(width * dpr)
      canvas.height = Math.round(height * dpr)
      canvas.style.width = `${width}px`
      canvas.style.height = `${height}px`
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0)
    }

    const readScroll = () => {
      const max = document.documentElement.scrollHeight - window.innerHeight
      target = max > 0 ? clamp(window.scrollY / max) : 0
    }

    const frame = () => {
      if (width === 0 || height === 0) {
        resize()
        raf = requestAnimationFrame(frame)
        return
      }

      // Identical smoothing constant to the reference spec — slow enough to feel
      // cinematic, fast enough not to lag behind a deliberate scroll.
      smoothed += (target - smoothed) * 0.12
      if (Math.abs(target - smoothed) < 0.0002) smoothed = target
      setJourneyProgress(smoothed)

      // Frozen clock under reduced-motion: scroll still scrubs, but nothing
      // sways, drifts or pulses on its own.
      const time = reduced ? 0 : (performance.now() - start) / 1000

      renderJourney(ctx, width, height, smoothed, time, model)
      raf = requestAnimationFrame(frame)
    }

    resize()
    readScroll()
    smoothed = target
    frame()

    const ro = new ResizeObserver(resize)
    ro.observe(host)
    window.addEventListener('scroll', readScroll, { passive: true })

    return () => {
      cancelAnimationFrame(raf)
      ro.disconnect()
      window.removeEventListener('scroll', readScroll)
    }
  }, [])

  return (
    <div
      ref={hostRef}
      className="pointer-events-none fixed inset-0 z-0 overflow-hidden bg-[#050a12]"
      aria-hidden="true"
    >
      <canvas ref={canvasRef} className="h-full w-full" />
    </div>
  )
}
