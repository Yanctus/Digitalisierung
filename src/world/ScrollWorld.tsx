import { useEffect, useRef, useState } from 'react'
import { mountWorld, type WorldState } from './engine'
import { SECTIONS } from './worldConfig'
import IgnitionText from './IgnitionText'
import NetworkRail from './NetworkRail'
import TrailCursor from './TrailCursor'

/**
 * Die Seite als Kamerafahrt: Scrollen treibt die Zeit, die Kamera fliegt.
 *
 * Die Copy liegt fest über dem Video und wird pro Akt ein- und ausgeblendet.
 * Der erste Akt begrüßt beim Landen, der letzte hält seinen CTA — dazwischen
 * hat jeder Akt seinen Höhepunkt in der Mitte seines Scrollwegs.
 */
export default function ScrollWorld() {
  const stageRef = useRef<HTMLDivElement>(null)
  const apiRef = useRef<ReturnType<typeof mountWorld> | null>(null)
  const [st, setSt] = useState<WorldState>({
    progress: 0,
    active: 0,
    localProgress: 0,
    velocity: 0,
  })
  /**
   * Der erste Akt zündet beim Laden von selbst durch. Ohne das stünde die
   * Hauptüberschrift auf der Startansicht gedämpft da und würde erst beim
   * Scrollen hell — für die erste Bildschirmseite die falsche Wirkung.
   */
  const [intro, setIntro] = useState(0)
  useEffect(() => {
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
      setIntro(1)
      return
    }
    let raf = 0
    const t0 = performance.now()
    const step = () => {
      const p = Math.min(1, (performance.now() - t0 - 260) / 1400)
      setIntro(Math.max(0, p))
      if (p < 1) raf = requestAnimationFrame(step)
    }
    raf = requestAnimationFrame(step)
    return () => cancelAnimationFrame(raf)
  }, [])

  useEffect(() => {
    if (!stageRef.current) return
    const api = mountWorld(
      stageRef.current,
      SECTIONS.map((s) => ({
        clip: s.clip,
        still: s.still,
        scroll: s.scroll,
        linger: s.linger,
      })),
      setSt,
    )
    apiRef.current = api
    return () => api.destroy()
  }, [])

  return (
    <div
      className="w-root"
      style={{ ['--w-heat' as string]: st.velocity.toFixed(3) }}
    >
      {/* Atmosphäre: Grundglut, die auf die Scrollgeschwindigkeit reagiert */}
      <div className="w-sky" aria-hidden="true">
        <div className="w-sky__grad" />
        <div className="w-sky__glow" />
      </div>

      {/* Die Bühne — hier hängt die Engine ihre Szenen ein */}
      <div className="w-stage" ref={stageRef} />

      <TrailCursor />

      <header className="w-top">
        <a className="w-brand" href="#top">
          <span className="w-brand__mark" aria-hidden="true" />
          <span className="w-brand__name">Norman Nerger</span>
        </a>
        <a className="w-top__cta" href="#kontakt">
          Gespräch vereinbaren
        </a>
      </header>

      <NetworkRail
        sections={SECTIONS}
        active={st.active}
        progress={st.progress}
        onJump={(i) => apiRef.current?.jumpTo(i)}
      />

      {/* Copy-Ebene */}
      <div className="w-copylayer">
        {SECTIONS.map((s, i) => {
          const isActive = i === st.active
          const p = isActive ? st.localProgress : i < st.active ? 1 : 0

          // Sichtbarkeit: erster Akt begrüßt, letzter hält, Rest hat seinen
          // Höhepunkt in der Mitte.
          let op: number
          if (i === 0) op = isActive ? Math.max(0, 1 - p / 0.6) : 0
          else if (i === SECTIONS.length - 1) op = isActive ? Math.min(1, p / 0.35) : 0
          else op = isActive ? Math.max(0, 1 - Math.abs(p - 0.5) / 0.5) : 0

          // Die Lichtwelle in der Überschrift läuft in der ersten Hälfte des
          // Akts durch. Der erste Akt zündet stattdessen beim Laden.
          const ignite =
            i === 0 ? intro : Math.max(0, Math.min(1, p / 0.55))

          return (
            <article
              className="w-copy"
              key={s.id}
              style={{
                opacity: op,
                transform: `translateY(${((0.5 - p) * 3).toFixed(2)}vh)`,
                pointerEvents: op > 0.5 ? 'auto' : 'none',
              }}
              aria-hidden={op < 0.05}
            >
              <span className="w-copy__num">
                {String(i + 1).padStart(2, '0')}
                <span className="w-copy__of"> / {String(SECTIONS.length).padStart(2, '0')}</span>
              </span>
              <span className="w-copy__eyebrow">{s.eyebrow}</span>

              <IgnitionText
                text={s.title}
                progress={ignite}
                as={i === 0 ? 'h1' : 'h2'}
                className="w-copy__title"
              />

              <p className="w-copy__body">{s.body}</p>

              {s.tags && (
                <ul className="w-copy__tags">
                  {s.tags.map((t) => (
                    <li key={t}>{t}</li>
                  ))}
                </ul>
              )}

              {s.cta && (
                <div className="w-copy__cta">
                  <a className="w-btn w-btn--primary" href={s.cta.primary.href}>
                    {s.cta.primary.label}
                  </a>
                  {s.cta.secondary && (
                    <a className="w-btn" href={s.cta.secondary.href}>
                      {s.cta.secondary.label}
                    </a>
                  )}
                </div>
              )}
            </article>
          )
        })}
      </div>

      <div
        className="w-hint"
        style={{ opacity: Math.max(0, 1 - st.progress * 14) }}
        aria-hidden="true"
      >
        <span>scrollen, um zu fliegen</span>
        <span className="w-hint__line" />
      </div>
    </div>
  )
}
