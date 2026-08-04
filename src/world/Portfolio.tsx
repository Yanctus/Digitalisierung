import { useEffect, useRef, useState } from 'react'
import { PROJECTS, STATS, CONTACT } from './portfolioConfig'

/**
 * Die Landung — was nach dem Film kommt.
 *
 * Der Film endet über der vernetzten Stadt; diese Seite schiebt sich darunter
 * hervor, ohne die Welt zu verlassen. Deshalb ist der obere Rand durchsichtig
 * (der letzte Frame trägt noch), deshalb sind die Projektbilder Standbilder aus
 * dem Film, und deshalb ist die Projektliste ein Netz: eine Leitung, an der die
 * Projekte als Knoten hängen. Wer hineinliest, zündet den Knoten.
 *
 * Die Inhalte sind Platzhalter — siehe Kopf von `portfolioConfig.ts`.
 */
export default function Portfolio({ onReplay }: { onReplay: () => void }) {
  const rootRef = useRef<HTMLElement>(null)
  const listRef = useRef<HTMLDivElement>(null)
  const [openId, setOpenId] = useState<string | null>(null)
  const [peek, setPeek] = useState<{ i: number; x: number; y: number } | null>(null)

  /**
   * Alles mit `data-reveal` blendet einmalig auf, wenn es ins Bild kommt.
   *
   * Bewusst über die Scrollposition und nicht über einen IntersectionObserver:
   * Der Ausgangszustand ist unsichtbar, und ein Beobachter, der aus irgendeinem
   * Grund nicht (mehr) meldet, macht die halbe Seite unsichtbar — genau das ist
   * beim Bauen passiert. Ein Durchlauf über die Rechtecke ist bei knapp zwanzig
   * Elementen ohnehin billiger als die Verwaltung des Beobachters, läuft nur
   * solange noch etwas aussteht, und hat keinen Zustand, der kaputtgehen kann.
   */
  useEffect(() => {
    const root = rootRef.current
    if (!root) return
    let pending = Array.from(root.querySelectorAll<HTMLElement>('[data-reveal]'))
    const showAll = () => pending.forEach((el) => el.classList.add('is-in'))

    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
      showAll()
      return
    }

    let raf = 0
    let alive = true
    const stop = () => {
      alive = false
      if (raf) cancelAnimationFrame(raf)
      window.removeEventListener('scroll', onScroll)
      window.removeEventListener('resize', onScroll)
    }
    const sweep = () => {
      raf = 0
      if (!alive) return
      // 0.88 statt 1.0: Das Element soll ein Stück im Bild stehen, bevor es
      // zündet — sonst blendet alles genau am unteren Rand auf.
      const line = window.innerHeight * 0.88
      pending = pending.filter((el) => {
        const r = el.getBoundingClientRect()
        if (r.top < line && r.bottom > 0) {
          el.classList.add('is-in')
          return false
        }
        return true
      })
      if (!pending.length) stop()
    }
    function onScroll() {
      if (!raf && alive) raf = requestAnimationFrame(sweep)
    }

    window.addEventListener('scroll', onScroll, { passive: true })
    window.addEventListener('resize', onScroll)
    sweep()
    return stop
  }, [])

  return (
    <section className="p-land" id="projekte" ref={rootRef}>
      {/* Der Übergang: oben trägt noch der letzte Frame des Films, unten die Seite. */}
      <div className="p-land__veil" aria-hidden="true" />

      {/* Die Naht. Sie sitzt auf der Oberkante der Seite und fährt deshalb
          genau mit dem Übergang durchs Bild: ein Lichtgrat, der auf halbem
          Weg am hellsten steht — dort, wo der Film sich auflöst und die Seite
          übernimmt. Die Stärke kommt als --w-seam von der Engine. */}
      <div className="p-land__seam" aria-hidden="true" />

      <div className="p-wrap">
        <header className="p-intro">
          <span className="p-eyebrow" data-reveal>
            Angekommen
          </span>
          <h2 className="p-intro__title" data-reveal>
            Was daraus <em>geworden</em> ist.
          </h2>
          <p className="p-intro__lead" data-reveal>
            Die Reise oben ist das Prinzip. Hier stehen die Fälle: gewachsene Betriebe, in
            denen etwas sichtbar gemacht wurde, das ohnehin schon da war. Anonymisiert,
            weil die Zahlen den Kunden gehören.
          </p>
          <dl className="p-intro__meta" data-reveal>
            <div>
              <dt>Auswahl</dt>
              <dd>2023 – 2026</dd>
            </div>
            <div>
              <dt>Projekte</dt>
              <dd>{String(PROJECTS.length).padStart(2, '0')}</dd>
            </div>
            <div>
              <dt>Rolle</dt>
              <dd>Begleitung, nicht Betrieb</dd>
            </div>
          </dl>
        </header>

        {/* ---------- Die Projekte als Netzknoten ---------- */}
        <div
          className="p-list"
          ref={listRef}
          onMouseMove={(e) => {
            if (!peek || !listRef.current) return
            const r = listRef.current.getBoundingClientRect()
            setPeek({ ...peek, x: e.clientX - r.left, y: e.clientY - r.top })
          }}
          onMouseLeave={() => setPeek(null)}
        >
          <span className="p-list__rail" aria-hidden="true" />

          {PROJECTS.map((p, i) => {
            const isOpen = openId === p.id
            return (
              <article
                key={p.id}
                className={'p-proj' + (isOpen ? ' is-open' : '')}
                data-reveal
                onMouseEnter={(e) => {
                  const r = listRef.current?.getBoundingClientRect()
                  if (!r) return
                  setPeek({ i, x: e.clientX - r.left, y: e.clientY - r.top })
                }}
              >
                <button
                  type="button"
                  className="p-proj__head"
                  aria-expanded={isOpen}
                  onClick={() => setOpenId(isOpen ? null : p.id)}
                >
                  <span className="p-proj__node" aria-hidden="true" />
                  <span className="p-proj__idx">{String(i + 1).padStart(2, '0')}</span>

                  <span className="p-proj__main">
                    <span className="p-proj__client">
                      {p.client} <i aria-hidden="true">·</i> {p.year}
                    </span>
                    <h3 className="p-proj__title">{p.title}</h3>
                    <span className="p-proj__lead">{p.lead}</span>
                  </span>

                  <span className="p-proj__metric">
                    <em>{p.metric.value}</em>
                    <span>{p.metric.label}</span>
                  </span>

                  <span className="p-proj__toggle" aria-hidden="true">
                    <i />
                    <i />
                  </span>
                </button>

                {/* 0fr → 1fr: klappt ohne feste Höhe und ohne Messung auf. */}
                <div className="p-proj__panel">
                  <div className="p-proj__panelInner">
                    <div className="p-proj__facets">
                      {p.facets.map((f) => (
                        <div className="p-facet" key={f.label}>
                          <h4>{f.label}</h4>
                          <p>{f.body}</p>
                        </div>
                      ))}
                      <ul className="p-proj__tags">
                        {p.tags.map((t) => (
                          <li key={t}>{t}</li>
                        ))}
                      </ul>
                    </div>
                    <figure className="p-proj__shot">
                      <img src={p.still} alt="" loading="lazy" decoding="async" />
                    </figure>
                  </div>
                </div>
              </article>
            )
          })}

          {/* Bildvorschau am Zeiger — nur da, wo es einen Zeiger gibt (CSS). */}
          <div
            className={'p-peek' + (peek ? ' is-on' : '')}
            aria-hidden="true"
            style={
              peek
                ? { transform: `translate3d(${peek.x}px, ${peek.y}px, 0)` }
                : undefined
            }
          >
            {peek && <img src={PROJECTS[peek.i].still} alt="" />}
          </div>
        </div>

        {/* ---------- Zahlen ---------- */}
        <div className="p-stats">
          {STATS.map((s, i) => (
            <div className="p-stat" key={s.label} data-reveal style={{ ['--i' as string]: String(i) }}>
              <span className="p-stat__value">{s.value}</span>
              <span className="p-stat__label">{s.label}</span>
              <span className="p-stat__note">{s.note}</span>
            </div>
          ))}
        </div>

        {/* ---------- Kontakt ---------- */}
        <section className="p-contact" id="kontakt">
          <span className="p-eyebrow" data-reveal>
            {CONTACT.eyebrow}
          </span>
          <h2 className="p-contact__title" data-reveal>
            {CONTACT.title}
          </h2>
          <p className="p-contact__body" data-reveal>
            {CONTACT.body}
          </p>
          <div className="p-contact__actions" data-reveal>
            <a className="p-btn p-btn--primary" href={`mailto:${CONTACT.mail}`}>
              <span>{CONTACT.mail}</span>
              <span className="p-btn__arrow" aria-hidden="true" />
            </a>
            <button type="button" className="p-btn" onClick={onReplay}>
              Noch einmal fliegen
            </button>
          </div>
        </section>

        {/* ---------- Fuß ---------- */}
        <footer className="p-foot">
          <div className="p-foot__brand">
            {CONTACT.lines.map((l) => (
              <span key={l}>{l}</span>
            ))}
          </div>
          <nav className="p-foot__nav" aria-label="Rechtliches">
            {/* TODO: Seiten anlegen, bevor die Site live geht. */}
            <a href="/impressum">Impressum</a>
            <a href="/datenschutz">Datenschutz</a>
          </nav>
          <span className="p-foot__note">Aus Gewachsenem wird Neues.</span>
        </footer>
      </div>
    </section>
  )
}
