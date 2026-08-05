import { useEffect, useRef } from 'react'
import type { DivePageContent } from './diveConfig'

type Props = {
  page: DivePageContent
  onSurface: () => void
  surfacePending: boolean
}

const NAV = [
  { id: 'dive-diagnose', label: 'Signal' },
  { id: 'dive-system', label: 'System' },
  { id: 'dive-method', label: 'Methode' },
  { id: 'dive-outcome', label: 'Wirkung' },
]

/**
 * Der redaktionelle Innenraum der Kuppelhalle.
 *
 * Das Video ist der atmosphärische Kopf; darunter wird aus derselben Welt ein
 * präzises Interface. Die Reveal-Logik beobachtet bewusst den internen
 * Scrollcontainer der Tauchwelt und nicht das Dokument.
 */
export default function DivePage({ page, onSurface, surfacePending }: Props) {
  const rootRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const root = rootRef.current
    if (!root) return
    const items = Array.from(root.querySelectorAll<HTMLElement>('[data-dive-reveal]'))
    const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches

    if (reduced || !('IntersectionObserver' in window)) {
      items.forEach((item) => item.classList.add('is-visible'))
      return
    }

    const scroller = root.closest('.d-layer--room')
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (!entry.isIntersecting) return
          ;(entry.target as HTMLElement).classList.add('is-visible')
          observer.unobserve(entry.target)
        })
      },
      { root: scroller, rootMargin: '0px 0px -12% 0px', threshold: 0.12 },
    )

    items.forEach((item) => observer.observe(item))
    return () => observer.disconnect()
  }, [])

  const goTo = (id: string) => {
    document.getElementById(id)?.scrollIntoView({ behavior: 'smooth', block: 'start' })
  }

  return (
    <div className="dp-page" ref={rootRef}>
      <nav className="dp-nav" aria-label="Inhalt der Kuppelhalle">
        <span className="dp-nav__track" aria-hidden="true">
          <i />
        </span>
        {NAV.map((item, index) => (
          <button type="button" onClick={() => goTo(item.id)} key={item.id}>
            <span>{String(index + 1).padStart(2, '0')}</span>
            {item.label}
          </button>
        ))}
      </nav>

      <div className="dp-descent" aria-hidden="true">
        <span>− 18 m</span>
        <i />
        <span>Signaltiefe erreicht</span>
      </div>

      <section className="dp-section dp-diagnose" id="dive-diagnose">
        <header className="dp-heading" data-dive-reveal>
          <span className="dp-kicker">{page.eyebrow}</span>
          <h2>{page.title}</h2>
          <p>{page.intro}</p>
        </header>

        <div className="dp-signals">
          {page.signals.map((signal, index) => (
            <article
              className="dp-signal"
              key={signal.label}
              data-dive-reveal
              style={{ ['--dp-i' as string]: String(index) }}
            >
              <div className="dp-signal__sonar" aria-hidden="true">
                <i />
                <i />
                <i />
                <b />
              </div>
              <span className="dp-signal__index">S-{String(index + 1).padStart(2, '0')}</span>
              <strong>{signal.value}</strong>
              <h3>{signal.label}</h3>
              <p>{signal.body}</p>
              <span className="dp-signal__status">Signal erkannt</span>
            </article>
          ))}
        </div>
      </section>

      <section className="dp-section dp-system" id="dive-system">
        <div className="dp-system__visual" data-dive-reveal aria-hidden="true">
          <div className="dp-orbit dp-orbit--outer" />
          <div className="dp-orbit dp-orbit--inner" />
          <div className="dp-system__core">
            <span>Prozess</span>
            <b>sichtbar</b>
          </div>
          <span className="dp-system__node dp-system__node--a">Mensch</span>
          <span className="dp-system__node dp-system__node--b">Daten</span>
          <span className="dp-system__node dp-system__node--c">Entscheidung</span>
          <span className="dp-system__node dp-system__node--d">Werkzeug</span>
        </div>

        <div className="dp-system__copy">
          <header className="dp-heading" data-dive-reveal>
            <span className="dp-kicker">Was die Halle erzählt / 02</span>
            <h2>Ein Prozess ist kein Flussdiagramm.</h2>
            <p>Er ist ein lebendes System. Jeder Eingriff bewegt Menschen, Wissen und Verantwortung zugleich.</p>
          </header>

          <div className="dp-principles">
            {page.principles.map((principle, index) => (
              <article key={principle.label} data-dive-reveal>
                <span>{String(index + 1).padStart(2, '0')} / {principle.label}</span>
                <h3>{principle.title}</h3>
                <p>{principle.body}</p>
              </article>
            ))}
          </div>
        </div>
      </section>

      <div className="dp-current" aria-hidden="true">
        <div>
          <span>Sichtbar machen</span>
          <i>•</i>
          <span>Verstehen</span>
          <i>•</i>
          <span>Verbinden</span>
          <i>•</i>
          <span>Übergeben</span>
          <i>•</i>
          <span>Sichtbar machen</span>
          <i>•</i>
          <span>Verstehen</span>
        </div>
      </div>

      <section className="dp-section dp-method" id="dive-method">
        <header className="dp-heading dp-heading--wide" data-dive-reveal>
          <span className="dp-kicker">Die Expedition / 03</span>
          <h2>Vier Bewegungen.<br />Kein großer Knall.</h2>
          <p>Die Veränderung bleibt kontrollierbar, weil jeder Schritt ein sichtbares Ergebnis hinterlässt.</p>
        </header>

        <div className="dp-steps">
          {page.steps.map((step, index) => (
            <article key={step.title} data-dive-reveal>
              <span className="dp-step__num">0{index + 1}</span>
              <div className="dp-step__copy">
                <h3>{step.title}</h3>
                <p>{step.body}</p>
              </div>
              <span className="dp-step__result">→ {step.result}</span>
            </article>
          ))}
        </div>
      </section>

      <section className="dp-section dp-outcome" id="dive-outcome">
        <header className="dp-heading" data-dive-reveal>
          <span className="dp-kicker">Arbeitsprinzip / 04</span>
          <h2>Die Technik darf gehen. Das Können bleibt.</h2>
        </header>

        <div className="dp-metrics">
          {page.metrics.map((metric, index) => (
            <article key={metric.unit} data-dive-reveal>
              <span className="dp-metric__ghost">0{index + 1}</span>
              <div>
                <strong>{metric.value}</strong>
                <em>{metric.unit}</em>
              </div>
              <p>{metric.label}</p>
            </article>
          ))}
        </div>

        <blockquote data-dive-reveal>
          <span aria-hidden="true">“</span>
          <p>Eine Begleitung ist dann gelungen, wenn sie nicht mehr gebraucht wird.</p>
          <cite>Norman Nerger / Digitalisierungsbegleitung</cite>
        </blockquote>
      </section>

      <section className="dp-final" data-dive-reveal>
        <div className="dp-final__glow" aria-hidden="true" />
        <span className="dp-kicker">{page.closing.eyebrow}</span>
        <h2>{page.closing.title}</h2>
        <p>{page.closing.body}</p>
        <div className="dp-final__actions">
          <button
            type="button"
            className="dp-surface"
            onClick={onSurface}
            disabled={surfacePending}
          >
            <span>{surfacePending ? 'Aufstieg wird vorbereitet' : 'Auftauchen'}</span>
            <i aria-hidden="true">↑</i>
          </button>
          <a href="mailto:norman.nerger@gmail.com">Eigenen Prozess ansehen</a>
        </div>
      </section>
    </div>
  )
}
