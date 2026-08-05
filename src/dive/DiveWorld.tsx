import { useCallback, useEffect, useRef, useState } from 'react'
import { WORLD, PLACES, type Place } from './diveConfig'
import RayLayer from './RayLayer'

type Phase = 'world' | 'launch' | 'diving' | 'room' | 'rising'

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

  /** Schleifen müssen laufen. Autoplay, Hintergrund-Tab und Sparmodus können
      sie anhalten — deshalb bei jedem dieser Anlässe neu anstoßen. */
  useEffect(() => {
    // Nur die Schleifen anstoßen. Tauchgang und Auftauchen laufen genau
    // einmal — würde man sie hier mit anfassen, spielten sie sich nach dem
    // Ende endlos neu ab, weil sie dann „pausiert" sind.
    const kick = () => {
      ;[worldRef, roomRef].forEach((r) => {
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
  const launchGuard = useRef(0)
  const startDiveRef = useRef<(() => void) | null>(null)
  /** Der laufende Ort, damit der Rochen-Rückruf ihn ohne Neubindung findet. */
  const placeRef = useRef<Place | null>(null)
  useEffect(() => {
    placeRef.current = place
  }, [place])

  /**
   * Klick auf einen Ort: Erst fliegt der Rochen hin, dann fährt die Kamera
   * hinterher. Er führt den Tauchgang an, statt daneben zu existieren.
   */
  const dive = useCallback((p: Place) => {
    if (!p.dive || !p.room) return
    setPlace(p)
    setOpenSpot(null)
    setVisited((v) => (v.includes(p.id) ? v : [...v, p.id]))
    setPhase('launch')
    /**
     * Reißleine für den Anflug. Meldet der Rochen sein Ankommen nie — weil
     * `requestAnimationFrame` im Hintergrund-Tab pausiert oder die Grafik
     * hakt —, bliebe der Besucher für immer in der Welt stehen und der Klick
     * hätte nichts bewirkt. Nach gut der doppelten Fluglänge geht es ohnehin
     * weiter.
     */
    window.clearTimeout(launchGuard.current)
    launchGuard.current = window.setTimeout(() => startDiveRef.current?.(), 2000)
  }, [])

  /**
   * Der Rochen ist am Ort angekommen — jetzt übernimmt die Kamera.
   *
   * Der Tauchgang wird erst gezeigt, wenn er wirklich läuft: Vorher wurde die
   * Ebene sofort eingeblendet und das Video parallel gestartet, dann stand für
   * einen Moment ein Standbild im Bild, das nicht zur laufenden Weltschleife
   * passte, und es zuckte sichtbar.
   */
  const startDive = useCallback(() => {
    const p = placeRef.current
    if (!p?.dive) return
    // Ob der Rochen ankommt oder die Reißleine zieht — losfahren darf nur einer.
    window.clearTimeout(launchGuard.current)

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
    v.currentTime = 0
    let started = false
    const once = () => {
      if (started) return
      started = true
      start()
    }
    v.addEventListener('playing', once, { once: true })
    // Falls `playing` ausbleibt, nicht ewig auf der Welt stehen bleiben.
    window.setTimeout(once, 400)
    const pr = v.play()
    if (pr && pr.catch) pr.catch(() => setPhase('room'))
  }, [])

  useEffect(() => {
    startDiveRef.current = startDive
  }, [startDive])

  useEffect(
    () => () => {
      window.clearTimeout(failsafe.current)
      window.clearTimeout(launchGuard.current)
    },
    [],
  )

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
    if (!v) {
      setPhase('world')
      window.setTimeout(() => setPlace(null), 700)
      return
    }
    v.currentTime = 0
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
    window.setTimeout(go, 400)
    const pr = v.play()
    if (pr && pr.catch)
      pr.catch(() => {
        setPhase('world')
        window.setTimeout(() => setPlace(null), 700)
      })
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

          {/* Der Rochen liegt IM Bildrahmen, damit er dieselben Prozentwerte
              benutzt wie die Orte — sonst zielt er daneben, sobald das Fenster
              ein anderes Format hat als der Clip. */}
          <RayLayer
            mode={phase === 'launch' ? 'launch' : phase === 'world' ? 'idle' : 'hidden'}
            target={phase === 'launch' && place ? { x: place.x, y: place.y } : null}
            onArrived={startDive}
          />
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
          src={PLACES[0].dive}
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
          src={PLACES[0].rise}
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
      <div className="d-layer d-layer--room">
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
                autoPlay
                muted
                playsInline
                preload="auto"
              />
              {place.hotspots?.map((h) => (
                <button
                  key={h.id}
                  type="button"
                  className={'t-spot' + (openSpot === h.id ? ' is-open' : '')}
                  style={{ left: `${h.x}%`, top: `${h.y}%` }}
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
          <button type="button" className="t-cham__close d-room__exit" onClick={surface}>
            <span className="t-cham__closeIcon" aria-hidden="true">
              <i />
              <i />
            </span>
            Auftauchen
          </button>

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
