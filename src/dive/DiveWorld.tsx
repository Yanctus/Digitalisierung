import { useCallback, useEffect, useRef, useState } from 'react'
import { WORLD, PLACES, type Place } from './diveConfig'

/**
 * Der Splitterrochen ist vorerst ausgebaut — `RayLayer.tsx` liegt weiter im
 * Projekt, wird aber nicht eingehängt. Weder als PNG-Ebene noch als
 * Canvas-Lichterscheinung hat er getragen; die Idee bleibt, die Umsetzung ist
 * offen. Mit ihm entfällt auch die Phase `launch`: Ein Klick führt jetzt
 * direkt in den Tauchgang.
 */
type Phase = 'world' | 'diving' | 'room' | 'rising'

/**
 * Die Unterwasserwelt: sehen — hineintauchen — zurück.
 *
 * Drei Zustände, sonst nichts. Die Welt läuft als Schleife und wartet, der
 * Tauchgang läuft genau einmal, der Raum läuft wieder als Schleife.
 *
 * Der Rückweg ist bewusst **kein rückwärts abgespielter Tauchgang**. Das wäre
 * gratis, aber es dreht jede Bewegung im Bild um — dieselbe Falle, in die die
 * Ping-Pong-Schleifen getappt sind. Stattdessen blendet der Raum auf die Welt
 * zurück. Ob das billig wirkt, ist genau die Frage, die dieser Prototyp
 * beantworten soll.
 */
export default function DiveWorld() {
  const [phase, setPhase] = useState<Phase>('world')
  const [place, setPlace] = useState<Place | null>(null)
  const [openSpot, setOpenSpot] = useState<string | null>(null)
  const [visited, setVisited] = useState<string[]>([])
  const diveRef = useRef<HTMLVideoElement>(null)
  const riseRef = useRef<HTMLVideoElement>(null)
  const worldRef = useRef<HTMLVideoElement>(null)
  const roomRef = useRef<HTMLVideoElement>(null)
  const roomLayerRef = useRef<HTMLDivElement>(null)

  /** Schleifen müssen laufen. Autoplay, Hintergrund-Tab und Sparmodus können
      sie anhalten — deshalb bei jedem dieser Anlässe neu anstoßen. */
  useEffect(() => {
    // Nur die Schleifen anstoßen. Tauchgang und Auftauchen laufen genau
    // einmal — würde man sie hier mit anfassen, spielten sie sich nach dem
    // Ende endlos neu ab, weil sie dann „pausiert" sind.
    const kick = () => {
      // Die Hallenschleife darf NUR laufen, wenn man auch drin ist. Sonst
      // spielt sie waehrend des Tauchgangs unsichtbar mit, ist beim Ankommen
      // schon Sekunden weit, und die Fische stehen ploetzlich woanders —
      // genau der Sprung, der wie ein Schnitt aussieht.
      const loops = phase === 'room' ? [worldRef, roomRef] : [worldRef]
      loops.forEach((r) => {
        const v = r.current
        if (!v || document.hidden || !v.paused) return
        const p = v.play()
        if (p && p.catch) p.catch(() => {})
      })
    }
    kick()
    const t = setInterval(kick, 1200)
    document.addEventListener('visibilitychange', kick)
    window.addEventListener('pointerdown', kick)
    return () => {
      clearInterval(t)
      document.removeEventListener('visibilitychange', kick)
      window.removeEventListener('pointerdown', kick)
    }
  }, [phase])

  const failsafe = useRef(0)
  /** Der aktuelle Ort für `surface`, das ohne Neubindung darauf zugreifen muss. */
  const placeRefForRise = useRef<Place | null>(null)
  useEffect(() => {
    placeRefForRise.current = place
  }, [place])

  /**
   * Klick auf einen Ort — die Kamera fährt hinein.
   *
   * Der Tauchgang wird erst gezeigt, wenn er wirklich läuft: Vorher wurde die
   * Ebene sofort eingeblendet und das Video parallel gestartet, dann stand für
   * einen Moment ein Standbild im Bild, das nicht zur laufenden Weltschleife
   * passte, und es zuckte sichtbar.
   */
  const dive = useCallback((p: Place) => {
    if (!p.dive || !p.room) return
    setPlace(p)
    setOpenSpot(null)
    setVisited((v) => (v.includes(p.id) ? v : [...v, p.id]))

    const v = diveRef.current
    const start = () => {
      setPhase('diving')
      // Reißleine: Kommt `ended` nie (Autoplay abgelehnt, Datei hängt), steht
      // der Besucher sonst vor einem schwarzen Bild ohne Ausweg.
      window.clearTimeout(failsafe.current)
      failsafe.current = window.setTimeout(
        () => setPhase('room'),
        ((v?.duration || 5) + 1) * 1000,
      )
    }

    if (!v) {
      setPhase('room')
      return
    }
    /**
     * Drei Wege können den Tauchgang auslösen — `playing`, die Notbremse und
     * die Ablehnung von `play()`. Ohne diesen Riegel liefen zwei davon: die
     * Ablehnung schaltete sofort in den Raum, der Timer kurz darauf in den
     * Tauchgang. Ergebnis war eine Seite, die erst ankommt und dann losfliegt.
     */
    let claimed = false
    const claim = (fn: () => void) => () => {
      if (claimed) return
      claimed = true
      fn()
    }
    const go = claim(start)
    v.addEventListener('playing', go, { once: true })

    const play = () => {
      v.currentTime = 0
      const pr = v.play()
      if (pr && pr.catch) pr.catch(claim(() => setPhase('room')))
    }

    /**
     * Die Quelle direkt setzen, nicht auf React warten: `place` wird erst im
     * nächsten Render zum `src`-Attribut, `play()` liefe aber sofort und
     * spielte den Clip des vorigen Ortes.
     *
     * Danach MUSS auf `loadeddata` gewartet werden. `load()` bricht ein direkt
     * folgendes `play()` ab — real passiert: der Tauchgang wurde abgelehnt und
     * die Seite sprang ohne Fahrt in den Raum.
     */
    if (v.getAttribute('src') !== p.dive) {
      v.setAttribute('src', p.dive)
      v.addEventListener('loadeddata', play, { once: true })
      v.load()
      // Falls die Datei hakt, nicht ewig in der Welt stehen bleiben.
      window.setTimeout(go, 2500)
    } else {
      play()
      window.setTimeout(go, 400)
    }
  }, [])

  /**
   * Klickpunkte schwingen mit dem Bild mit.
   *
   * Ein fertiges Video liefert keine Trackingdaten. Aber die Schleife ist
   * periodisch — sie beginnt und endet auf demselben Bild —, also lässt sich
   * die Bewegung als Sinus nachbilden, der an `currentTime` gekoppelt ist.
   * Solange die Amplitude klein bleibt, klebt der Punkt am Halm statt daneben.
   *
   * Geschrieben wird direkt auf die Elemente, nicht über React: Ein
   * Zustandswechsel je Bild bei 60 Hz würde die ganze Ebene neu rendern.
   */
  useEffect(() => {
    if (phase !== 'room') return
    const v = roomRef.current
    const root = roomLayerRef.current
    if (!v || !root) return
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return

    let raf = 0
    const step = () => {
      const dur = v.duration || 0
      if (dur > 0) {
        const t = (v.currentTime / dur) * Math.PI * 2
        root.querySelectorAll<HTMLElement>('.t-spot[data-sway-x]').forEach((el) => {
          const ax = parseFloat(el.dataset.swayX || '0')
          const ay = parseFloat(el.dataset.swayY || '0')
          if (!ax && !ay) return
          const ph = parseFloat(el.dataset.swayPhase || '0') * Math.PI * 2
          const k = parseFloat(el.dataset.swayPeriods || '1')
          const bx = parseFloat(el.dataset.baseX || '0')
          const by = parseFloat(el.dataset.baseY || '0')
          el.style.left = (bx + Math.sin(t * k + ph) * ax).toFixed(3) + '%'
          el.style.top = (by + Math.cos(t * k + ph) * ay).toFixed(3) + '%'
        })
      }
      raf = requestAnimationFrame(step)
    }
    raf = requestAnimationFrame(step)
    return () => cancelAnimationFrame(raf)
  }, [phase, place])

  /**
   * Beim Betreten der Halle die Schleife auf Frame 0 setzen.
   *
   * Der Tauchgang endet exakt auf diesem Frame — nur wenn die Schleife auch
   * dort beginnt, ist die Uebergabe unsichtbar. Ohne das Zuruecksetzen zeigt
   * sie die Stelle, an der sie zuletzt stand.
   */
  useEffect(() => {
    if (phase !== 'room') return
    const v = roomRef.current
    if (!v) return
    try {
      v.currentTime = 0
    } catch {
      /* egal */
    }
    const p = v.play()
    if (p && p.catch) p.catch(() => {})
  }, [phase])

  useEffect(() => () => window.clearTimeout(failsafe.current), [])

  /**
   * Auftauchen: derselbe Weg rückwärts.
   *
   * Nicht das Video rückwärts *abspielen* — das ruckelt, weil Browser dafür
   * nicht gebaut sind. Stattdessen liegt der Tauchgang ein zweites Mal als
   * fertig umgekehrte Datei bereit (ffmpeg, kostet nichts). Dass dabei Blasen
   * und Partikel rückwärts laufen, fällt bei dem Tempo und der
   * Bewegungsunschärfe nicht auf — anders als in einer ruhigen Schleife.
   */
  const surface = useCallback(() => {
    // Die Reißleine MUSS hier weg. Sonst schaltet sie Sekunden später zurück
    // in einen Raum, den es nicht mehr gibt — schwarzes Bild ohne Ausweg.
    window.clearTimeout(failsafe.current)
    setOpenSpot(null)

    const v = riseRef.current
    const rise = placeRefForRise.current?.rise
    if (!v || !rise) {
      setPhase('world')
      window.setTimeout(() => setPlace(null), 700)
      return
    }
    let started = false
    const go = () => {
      if (started) return
      started = true
      setPhase('rising')
      window.clearTimeout(failsafe.current)
      failsafe.current = window.setTimeout(() => {
        setPhase('world')
        setPlace(null)
      }, ((v.duration || 5) + 1) * 1000)
    }
    v.addEventListener('playing', go, { once: true })

    const play = () => {
      v.currentTime = 0
      const pr = v.play()
      if (pr && pr.catch)
        pr.catch(() => {
          setPhase('world')
          window.setTimeout(() => setPlace(null), 700)
        })
    }
    // Wie beim Eintauchen: erst laden lassen, sonst bricht `load()` das
    // `play()` ab und man landet ohne Fahrt wieder in der Welt.
    if (v.getAttribute('src') !== rise) {
      v.setAttribute('src', rise)
      v.addEventListener('loadeddata', play, { once: true })
      v.load()
      window.setTimeout(go, 2500)
    } else {
      play()
      window.setTimeout(go, 400)
    }
  }, [])

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key !== 'Escape') return
      if (openSpot) setOpenSpot(null)
      else if (phase === 'room') surface()
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [openSpot, phase, surface])

  const spot = place?.hotspots?.find((h) => h.id === openSpot) ?? null

  /**
   * Ohne Ort gibt es keinen Raum. Ein Zustand „im Raum, aber nirgends" wäre
   * ein schwarzes Bild ohne Ausweg — er darf gar nicht erst darstellbar sein.
   */
  const shown: Phase = (phase === 'room' || phase === 'diving') && !place ? 'world' : phase

  return (
    <div className={'w-root d-root is-' + shown + (spot ? ' has-panel' : '')}>
      {/* ---------- Die Welt ---------- */}
      <div className="d-layer d-layer--world">
        <div className="d-frame">
          <video
            ref={worldRef}
            className="d-video"
            src={WORLD.clip}
            poster={WORLD.poster}
            loop
            autoPlay
            muted
            playsInline
            preload="auto"
          />
          {PLACES.map((p) => (
            <button
              key={p.id}
              type="button"
              className={
                'd-place' +
                (p.dive ? '' : ' is-soon') +
                (visited.includes(p.id) ? ' is-visited' : '')
              }
              style={{ left: `${p.x}%`, top: `${p.y}%` }}
              onClick={() => dive(p)}
              disabled={!p.dive}
              title={p.dive ? undefined : 'Noch nicht gerendert'}
            >
              <span className="d-place__ring" aria-hidden="true" />
              <span className="d-place__dot" aria-hidden="true" />
              <span className="d-place__card">
                <span className="d-place__name">{p.name}</span>
                <span className="d-place__claim">{p.claim}</span>
                <span className="d-place__go">
                  {p.dive ? 'Hineintauchen' : 'Noch nicht gerendert'}
                </span>
              </span>
            </button>
          ))}
        </div>
        <div className="d-vignette" aria-hidden="true" />

        <header className="d-intro">
          <span className="d-eyebrow">{WORLD.eyebrow}</span>
          <h1 className="d-title">{WORLD.title}</h1>
          <p className="d-body">{WORLD.body}</p>
        </header>
      </div>

      {/* ---------- Der Tauchgang ---------- */}
      <div className="d-layer d-layer--dive">
        <video
          ref={diveRef}
          className="d-video d-video--full"
          /* Der Clip des angeklickten Ortes, nicht ein fester — sonst fliegt
             man ab dem zweiten Ort immer in denselben Raum. */
          src={place?.dive}
          muted
          playsInline
          preload="auto"
          onEnded={() => {
            window.clearTimeout(failsafe.current)
            setPhase('room')
          }}
        />
      </div>

      {/* ---------- Das Auftauchen: derselbe Weg rückwärts ---------- */}
      <div className="d-layer d-layer--rise">
        <video
          ref={riseRef}
          className="d-video d-video--full"
          src={place?.rise}
          muted
          playsInline
          preload="auto"
          onEnded={() => {
            window.clearTimeout(failsafe.current)
            setPhase('world')
            setPlace(null)
          }}
        />
      </div>

      {/* ---------- Der Raum ----------
          Die Schleife ist der Kopf einer echten Seite: Sie bleibt stehen
          (sticky), und wer weiterscrollt, zieht den Text darüber. Die
          Bedienelemente liegen bewusst AUSSERHALB des Scrollbereichs, sonst
          wandern sie beim Scrollen mit weg. */}
      <div className="d-layer d-layer--room" ref={roomLayerRef}>
        {place?.room && (
          <div className="d-room">
            <div className="d-room__hero">
            <div className="d-frame">
              <video
                ref={roomRef}
                className="d-video"
                src={place.room}
                poster={place.poster}
                loop
                muted
                playsInline
                preload="auto"
                /* Kein autoPlay: Das Element haengt schon beim Klick im DOM,
                   wuerde also waehrend des Tauchgangs unsichtbar mitlaufen und
                   waere beim Ankommen Sekunden weit. Gestartet wird es genau
                   dann, wenn man die Halle betritt — von Frame 0. */
              />
              {place.hotspots?.map((h) => (
                <button
                  key={h.id}
                  type="button"
                  className={'t-spot' + (openSpot === h.id ? ' is-open' : '')}
                  style={{ left: `${h.x}%`, top: `${h.y}%` }}
                  /* Die Schwingung schreibt die rAF-Schleife direkt auf das
                     Element. React bleibt aus der 60-Hz-Schleife heraus. */
                  data-sway-x={h.sway?.x ?? 0}
                  data-sway-y={h.sway?.y ?? 0}
                  data-sway-phase={h.sway?.phase ?? 0}
                  data-sway-periods={h.sway?.periods ?? 1}
                  data-base-x={h.x}
                  data-base-y={h.y}
                  onClick={() => setOpenSpot(openSpot === h.id ? null : h.id)}
                  aria-expanded={openSpot === h.id}
                >
                  <span className="t-spot__ring" aria-hidden="true" />
                  <span className="t-spot__dot" aria-hidden="true" />
                  <span className="t-spot__label">{h.label}</span>
                </button>
              ))}
              {spot && (
                <span
                  className="t-thread"
                  style={{ left: `${spot.x}%`, top: `${spot.y}%` }}
                  aria-hidden="true"
                />
              )}
            </div>
            <div className="d-vignette" aria-hidden="true" />

            </div>

            {/* Überschrift und Hinweis liegen bewusst NICHT im klebenden Kopf:
                Sie sollen wegscrollen, sonst laufen sie in den Text hinein.
                Nur das Bild bleibt stehen. */}
            <header className="d-room__head">
              <span className="t-cham__eyebrow">{place.name}</span>
              <h2 className="t-cham__name">{place.claim}</h2>
            </header>

            <span className="d-room__more" aria-hidden="true">
              weiterlesen
            </span>

            {place.page && (
              <section className="d-page">
                <p className="d-page__lead">{place.page.lead}</p>
                {place.page.blocks.map((b) => (
                  <article className="d-page__block" key={b.title}>
                    <h3>{b.title}</h3>
                    <p>{b.body}</p>
                  </article>
                ))}
                <div className="d-page__end">
                  <button type="button" className="p-btn p-btn--primary" onClick={surface}>
                    <span>Zurück ins Riff</span>
                    <span className="p-btn__arrow" aria-hidden="true" />
                  </button>
                </div>
              </section>
            )}
          </div>
        )}
      </div>

      {/* Bedienelemente des Raums — fest, außerhalb des Scrollbereichs */}
      {shown === 'room' && place && (
        <>
          {/* Die Navigation des Ortes. Unten mittig statt oben rechts: Dort
              sucht man sie, dort verdeckt sie nichts, und sie bleibt beim
              Weiterlesen stehen. */}
          <nav className="d-nav" aria-label={place.name}>
            <button type="button" className="d-nav__up" onClick={surface}>
              <span className="d-nav__arrow" aria-hidden="true" />
              Auftauchen
            </button>
            <span className="d-nav__sep" aria-hidden="true" />
            <span className="d-nav__here">{place.name}</span>
            <span className="d-nav__count">
              {PLACES.filter((x) => x.dive).findIndex((x) => x.id === place.id) + 1}
              <em>/{PLACES.filter((x) => x.dive).length}</em>
            </span>
          </nav>

          <aside className={'t-panel' + (spot ? ' is-open' : '')} aria-hidden={!spot}>
            {spot && (
              <>
                <span className="t-panel__label">{spot.label}</span>
                <h3 className="t-panel__title">{spot.title}</h3>
                <p className="t-panel__body">{spot.body}</p>
                <button
                  type="button"
                  className="t-panel__close"
                  onClick={() => setOpenSpot(null)}
                >
                  schließen
                </button>
              </>
            )}
          </aside>
        </>
      )}

      <a className="d-back" href="#">
        <span className="t-back__arrow" aria-hidden="true" />
        Zur Reise
      </a>
    </div>
  )
}
