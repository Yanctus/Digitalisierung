import { useEffect, useState } from 'react'
import type { WorldSection } from './worldConfig'

/**
 * Die Kopfzeile als Instrument, nicht als Linkliste.
 *
 * Drei Dinge machen sie zu einem Teil des Films statt zu einer Leiste darüber:
 *
 *  1. Sie ist an den Fortschritt gekoppelt. Der Rahmen lädt sich auf (violett →
 *     orange an der Spitze), und in der Mitte steht, wo man gerade fliegt —
 *     dieselbe Anzeige wie in der Schiene rechts, nur lesbar.
 *  2. „Die Reise" öffnet das Netz. Statt Unterseiten liegen dort die acht Akte
 *     als Knoten; durchflogene sind hell, der aktuelle pulst. Ein Klick springt.
 *  3. Beim Landen wechselt sie den Zustand: Die Akt-Anzeige tritt ab, der
 *     Rahmen wird ruhig, die Leiste gehört ab dann der Seite, nicht dem Film.
 */

type Props = {
  sections: WorldSection[]
  active: number
  /** 0..1 über den Film. */
  progress: number
  /** 0..1 — Übergang in die Landeseite. */
  landed: number
  onJump: (i: number) => void
  onGoto: (id: string) => void
}

export default function TopNav({ sections, active, progress, landed, onJump, onGoto }: Props) {
  const [condensed, setCondensed] = useState(false)
  const [open, setOpen] = useState(false)

  // Die Leiste zieht sich nach den ersten Pixeln zusammen. Bewusst nicht an den
  // Film-Fortschritt gehängt: Sie soll schon reagieren, bevor das erste Leg
  // nennenswert läuft.
  useEffect(() => {
    const onScroll = () => setCondensed(window.scrollY > 40)
    onScroll()
    window.addEventListener('scroll', onScroll, { passive: true })
    return () => window.removeEventListener('scroll', onScroll)
  }, [])

  // Solange das Menü offen ist, darf der Film nicht weiterscrubben.
  useEffect(() => {
    if (!open) return
    const prev = document.body.style.overflow
    document.body.style.overflow = 'hidden'
    const onKey = (e: KeyboardEvent) => e.key === 'Escape' && setOpen(false)
    window.addEventListener('keydown', onKey)
    return () => {
      document.body.style.overflow = prev
      window.removeEventListener('keydown', onKey)
    }
  }, [open])

  const act = sections[active]
  const inFilm = landed < 0.5

  const go = (fn: () => void) => () => {
    setOpen(false)
    fn()
  }

  return (
    <>
      <header
        className={
          'w-top' +
          (condensed ? ' is-condensed' : '') +
          (landed > 0.5 ? ' is-landed' : '') +
          (open ? ' is-open' : '')
        }
        style={{ ['--w-prog' as string]: progress.toFixed(4) }}
      >
        <div className="w-top__bar">
          {/* Marke — der Knoten aus dem Film, in klein */}
          <a
            className="w-brand"
            href="#top"
            onClick={(e) => {
              e.preventDefault()
              go(() => window.scrollTo({ top: 0, behavior: 'smooth' }))()
            }}
          >
            <span className="w-brand__mark" aria-hidden="true">
              <i />
              <i />
              <i />
            </span>
            <span className="w-brand__name">
              Norman <span className="w-brand__last">Nerger</span>
            </span>
          </a>

          {/* Wo bin ich gerade — tritt beim Landen ab */}
          <div
            className="w-top__act"
            style={{ opacity: inFilm ? 1 - landed * 2 : 0 }}
            aria-hidden={!inFilm}
          >
            <span className="w-top__actnum">
              {String(active + 1).padStart(2, '0')}
              <em>/{String(sections.length).padStart(2, '0')}</em>
            </span>
            <span className="w-top__actname" key={act?.id}>
              {act?.label}
            </span>
          </div>

          <nav className="w-nav" aria-label="Hauptnavigation">
            {/* Das Netz als Menü: die acht Akte als Knoten */}
            <div className="w-nav__group">
              <button type="button" className="w-nav__link w-nav__link--has-flyout">
                Die Reise
                <span className="w-nav__caret" aria-hidden="true" />
              </button>

              <div className="w-flyout" role="menu">
                <span className="w-flyout__rail" aria-hidden="true">
                  <i style={{ transform: `scaleX(${progress})` }} />
                </span>
                <div className="w-flyout__acts">
                  {sections.map((s, i) => (
                    <button
                      key={s.id}
                      type="button"
                      role="menuitem"
                      className={
                        'w-flyout__act' +
                        (i <= active ? ' is-lit' : '') +
                        (i === active ? ' is-active' : '')
                      }
                      onClick={go(() => onJump(i))}
                    >
                      <span className="w-flyout__dot" aria-hidden="true" />
                      <span className="w-flyout__num">{String(i + 1).padStart(2, '0')}</span>
                      <span className="w-flyout__label">{s.label}</span>
                      <span className="w-flyout__sec">{s.seconds}s</span>
                    </button>
                  ))}
                </div>
                <p className="w-flyout__foot">
                  Acht Akte, {sections.reduce((a, s) => a + s.seconds, 0)} Sekunden — eine
                  einzige Kamerafahrt ohne Schnitt.
                </p>
              </div>
            </div>

            <button type="button" className="w-nav__link" onClick={go(() => onGoto('projekte'))}>
              Projekte
            </button>
            <button type="button" className="w-nav__link" onClick={go(() => onGoto('kontakt'))}>
              Kontakt
            </button>
          </nav>

          <button
            type="button"
            className="w-top__cta"
            onClick={go(() => onGoto('kontakt'))}
          >
            <span>Gespräch vereinbaren</span>
            <span className="w-top__ctaArrow" aria-hidden="true" />
          </button>

          {/* Mobil: drei Filamente, die zum Kreuz werden */}
          <button
            type="button"
            className="w-burger"
            aria-expanded={open}
            aria-label={open ? 'Menü schließen' : 'Menü öffnen'}
            onClick={() => setOpen((v) => !v)}
          >
            <i />
            <i />
            <i />
          </button>
        </div>

        {/* Fortschritt als Filament unter der Leiste, mit oranger Spitze.
            Die Breite kommt aus --w-prog: eine skalierte Linie würde ihre
            Spitze mitverzerren. */}
        <span className="w-top__filament" aria-hidden="true">
          <i />
        </span>
      </header>

      {/* Mobiles Menü: das Netz auf ganzer Fläche */}
      <div className={'w-menu' + (open ? ' is-open' : '')} aria-hidden={!open}>
        <div className="w-menu__inner">
          <span className="w-menu__eyebrow">Die Reise</span>
          <div className="w-menu__acts">
            {sections.map((s, i) => (
              <button
                key={s.id}
                type="button"
                className={'w-menu__act' + (i <= active ? ' is-lit' : '')}
                style={{ ['--i' as string]: String(i) }}
                onClick={go(() => onJump(i))}
              >
                <span className="w-menu__num">{String(i + 1).padStart(2, '0')}</span>
                <span>{s.label}</span>
              </button>
            ))}
          </div>

          <div className="w-menu__links">
            <button
              type="button"
              style={{ ['--i' as string]: '8' }}
              onClick={go(() => onGoto('projekte'))}
            >
              Projekte
            </button>
            <button
              type="button"
              style={{ ['--i' as string]: '9' }}
              onClick={go(() => onGoto('kontakt'))}
            >
              Kontakt
            </button>
          </div>
        </div>
      </div>
    </>
  )
}
