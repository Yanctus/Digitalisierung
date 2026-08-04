import { useCallback, useEffect, useRef, useState } from 'react'
import { mountWorld, type WorldState } from './engine'
import { SECTIONS } from './worldConfig'
import IgnitionText from './IgnitionText'
import NetworkRail from './NetworkRail'
import TrailCursor from './TrailCursor'
import TopNav from './TopNav'
import Portfolio from './Portfolio'

/**
 * Die Seite als Kamerafahrt: Scrollen treibt die Zeit, die Kamera fliegt.
 *
 * Die Copy liegt fest über dem Video und wird pro Akt ein- und ausgeblendet.
 * Der erste Akt begrüßt beim Landen, der letzte hält seinen CTA — dazwischen
 * hat jeder Akt seinen Höhepunkt in der Mitte seines Scrollwegs.
 *
 * Nach dem letzten Leg endet der Film nicht, er übergibt: Über die letzte
 * Viewport-Höhe der Scrollstrecke schiebt sich die Landeseite (`Portfolio`)
 * unter dem Film hervor, während Bühne, Copy und Schiene abblenden. Der Wert
 * dafür ist `landed` aus der Engine.
 */
export default function ScrollWorld() {
  const stageRef = useRef<HTMLDivElement>(null)
  const trackRef = useRef<HTMLDivElement>(null)
  const apiRef = useRef<ReturnType<typeof mountWorld> | null>(null)
  const [st, setSt] = useState<WorldState>({
    progress: 0,
    active: 0,
    localProgress: 0,
    velocity: 0,
    landed: 0,
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
    if (!stageRef.current || !trackRef.current) return
    const api = mountWorld(
      stageRef.current,
      trackRef.current,
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

  const goto = useCallback((id: string) => {
    const el = document.getElementById(id)
    if (!el) return
    const reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches
    el.scrollIntoView({ behavior: reduce ? 'auto' : 'smooth', block: 'start' })
  }, [])

  const replay = useCallback(() => {
    const reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches
    window.scrollTo({ top: 0, behavior: reduce ? 'auto' : 'smooth' })
  }, [])

  // Der Film tritt ab, während die Landeseite hochkommt: eine Größe, überall
  // gleich verwendet — Bühne, Himmel, Copy und Schiene hängen daran.
  const filmOut = 1 - st.landed

  /**
   * Die Copy geht deutlich früher als das Bild.
   *
   * Beides gleich schnell auszublenden war der Fehler: Die Oberkante der
   * Landeseite ist durchsichtig (dort trägt noch der letzte Frame), und
   * halbdurchsichtige Schrift stand dann mitten in der anfahrenden Seite.
   * Die Schrift muss weg sein, bevor die Seite über sie hinwegzieht — das
   * Bild darf sich Zeit lassen.
   */
  const copyOut = Math.max(0, 1 - st.landed * 3.2)

  /** Der Lichtgrat an der Naht: 0 am Rand, am hellsten auf halbem Weg. */
  const seam = Math.max(0, 1 - Math.abs(st.landed - 0.5) / 0.5)

  return (
    <div
      className={'w-root' + (st.landed > 0.98 ? ' is-landed' : '')}
      style={{
        ['--w-heat' as string]: st.velocity.toFixed(3),
        ['--w-land' as string]: st.landed.toFixed(3),
        ['--w-seam' as string]: seam.toFixed(3),
      }}
    >
      {/* Atmosphäre: Grundglut, die auf die Scrollgeschwindigkeit reagiert */}
      <div className="w-sky" aria-hidden="true">
        <div className="w-sky__grad" />
        <div className="w-sky__glow" />
      </div>

      {/* Die Bühne — hier hängt die Engine ihre Szenen ein */}
      <div className="w-stage" ref={stageRef} />

      {/* Feines Korn über allem: nimmt dem Video die digitale Glätte */}
      <div className="w-grain" aria-hidden="true" />

      {/* Scrollstrecke des Films. Die Engine setzt nur ihre Höhe. */}
      <div className="w-track" ref={trackRef} />

      {/* Danach: die Seite */}
      <Portfolio onReplay={replay} />

      <TrailCursor />

      <TopNav
        sections={SECTIONS}
        active={st.active}
        progress={st.progress}
        landed={st.landed}
        onJump={(i) => apiRef.current?.jumpTo(i)}
        onGoto={goto}
      />

      <NetworkRail
        sections={SECTIONS}
        active={st.active}
        progress={st.progress}
        landed={st.landed}
        onJump={(i) => apiRef.current?.jumpTo(i)}
      />

      {/* Copy-Ebene. Sie löst sich beim Landen auf, statt einfach zu
          verschwinden: sie steigt, wird weich und verliert das Licht. */}
      <div
        className="w-copylayer"
        style={{
          opacity: copyOut,
          transform: `translateY(${(st.landed * -7).toFixed(2)}vh) scale(${(
            1 -
            st.landed * 0.06
          ).toFixed(3)})`,
          // Weichzeichner nur, solange überhaupt etwas zu sehen ist — er ist
          // teuer und über einer ganzen Bildschirmfläche nicht umsonst.
          filter: copyOut > 0.01 ? `blur(${(st.landed * 18).toFixed(1)}px)` : 'none',
        }}
      >
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
          //
          // Beim Landen läuft sie wieder heraus: Das Licht verlässt die
          // Schrift, bevor die Schrift geht. Dieselbe Mechanik wie im Film,
          // nur rückwärts — das Geschriebene bleibt, das Licht zieht weiter.
          const ignite =
            (i === 0 ? intro : Math.max(0, Math.min(1, p / 0.55))) * copyOut

          return (
            <article
              className="w-copy"
              key={s.id}
              style={{
                opacity: op,
                transform: `translateY(${((0.5 - p) * 3).toFixed(2)}vh)`,
                pointerEvents: op > 0.5 && filmOut > 0.5 ? 'auto' : 'none',
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
                  <button
                    type="button"
                    className="w-btn w-btn--primary"
                    onClick={() => goto('kontakt')}
                  >
                    {s.cta.primary.label}
                  </button>
                  {s.cta.secondary && (
                    <button
                      type="button"
                      className="w-btn"
                      onClick={() => goto('projekte')}
                    >
                      {s.cta.secondary.label}
                    </button>
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
