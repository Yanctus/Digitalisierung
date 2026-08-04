import { useCallback, useEffect, useRef, useState } from 'react'
import { WORLD, PLACES, type Place } from './diveConfig'

type Phase = 'world' | 'diving' | 'room'

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
  const worldRef = useRef<HTMLVideoElement>(null)
  const roomRef = useRef<HTMLVideoElement>(null)

  /** Schleifen müssen laufen. Autoplay, Hintergrund-Tab und Sparmodus können
      sie anhalten — deshalb bei jedem dieser Anlässe neu anstoßen. */
  useEffect(() => {
    const kick = () => {
      ;[worldRef, roomRef, diveRef].forEach((r) => {
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

  const dive = useCallback((p: Place) => {
    if (!p.dive || !p.room) return
    setPlace(p)
    setOpenSpot(null)
    setVisited((v) => (v.includes(p.id) ? v : [...v, p.id]))
    setPhase('diving')
    const v = diveRef.current
    if (v) {
      v.currentTime = 0
      const pr = v.play()
      if (pr && pr.catch) pr.catch(() => setPhase('room'))
    }
    /**
     * Reißleine. Spielt der Tauchgang nicht ab — Autoplay abgelehnt, Tab im
     * Hintergrund, Datei hängt —, kommt `ended` nie, und der Besucher steht
     * vor einem schwarzen Bild ohne Ausweg. Nach der Cliplänge plus einer
     * Sekunde geht es in jedem Fall weiter.
     */
    window.clearTimeout(failsafe.current)
    const wait = ((v?.duration || 5) + 1) * 1000
    failsafe.current = window.setTimeout(() => setPhase('room'), wait)
  }, [])

  useEffect(() => () => window.clearTimeout(failsafe.current), [])

  const surface = useCallback(() => {
    setPhase('world')
    setOpenSpot(null)
    // Der Ort bleibt noch einen Moment gesetzt, damit der Raum weich ausblendet.
    window.setTimeout(() => setPlace(null), 700)
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

  return (
    <div className={'w-root d-root is-' + phase + (spot ? ' has-panel' : '')}>
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

      {/* ---------- Der Raum ---------- */}
      <div className="d-layer d-layer--room">
        {place?.room && (
          <>
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

            <header className="t-cham__head">
              <span className="t-cham__eyebrow">{place.name}</span>
              <h2 className="t-cham__name">{place.claim}</h2>
            </header>

            <button type="button" className="t-cham__close" onClick={surface}>
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
      </div>

      <a className="d-back" href="#">
        <span className="t-back__arrow" aria-hidden="true" />
        Zur Reise
      </a>
    </div>
  )
}
