import { useEffect, useRef, useState } from 'react'
import type { TreeStation } from './treeConfig'

/**
 * Eine Kammer im Baum.
 *
 * Die Kamera steht, alles im Bild bewegt sich, der Clip läuft endlos. Weil er
 * als Ping-Pong gebaut ist (vorwärts + rückwärts), ist die Schleife nahtlos
 * ohne jede Logik hier — `loop` am Video-Element genügt.
 *
 * Die Kammer ist eine Überlagerung, kein eigener Scrollbereich. Das ist
 * Absicht: Der Besucher behält seine Position am Stamm, und Verlassen bringt
 * ihn exakt dorthin zurück, wo er hineingegangen ist.
 *
 * WICHTIG — die Klickpunkte liegen in Prozent des VIDEOBILDS, nicht des
 * Fensters. Deshalb der `frame`: Er hat das Seitenverhältnis des Clips und ist
 * per CSS auf „cover" gerechnet. Ohne ihn würden die Punkte bei jedem anderen
 * Fensterformat verrutschen, weil das Bild beschnitten wird.
 */
export default function Chamber({
  station,
  onClose,
}: {
  station: TreeStation
  onClose: () => void
}) {
  const [openId, setOpenId] = useState<string | null>(null)
  const [entered, setEntered] = useState(false)
  const videoRef = useRef<HTMLVideoElement>(null)
  const chamber = station.chamber!

  useEffect(() => {
    const raf = requestAnimationFrame(() => setEntered(true))
    const prev = document.body.style.overflow
    document.body.style.overflow = 'hidden'
    const onKey = (e: KeyboardEvent) => {
      if (e.key !== 'Escape') return
      // Erst das Panel, dann die Kammer — sonst fliegt man bei offenem Text
      // sofort ganz raus.
      setOpenId((cur) => {
        if (cur) return null
        onClose()
        return null
      })
    }
    window.addEventListener('keydown', onKey)
    return () => {
      cancelAnimationFrame(raf)
      document.body.style.overflow = prev
      window.removeEventListener('keydown', onKey)
    }
  }, [onClose])

  /**
   * Die Schleife muss laufen — das ist der ganze Punkt der Kammer.
   *
   * Sie kann aus drei Gründen stehen: Autoplay abgelehnt (Sparmodus, iOS ohne
   * Geste), Tab im Hintergrund (der Browser pausiert Medien in versteckten
   * Seiten), oder der Clip war beim ersten Versuch noch nicht bereit. Deshalb
   * wird nicht einmal angestoßen, sondern bei jedem dieser Anlässe erneut.
   * Schlägt alles fehl, steht das Posterbild — nie ein schwarzes Loch.
   */
  useEffect(() => {
    const v = videoRef.current
    if (!v) return
    const kick = () => {
      if (document.hidden || !v.paused) return
      const p = v.play()
      if (p && p.catch) p.catch(() => {})
    }
    kick()
    v.addEventListener('canplay', kick)
    document.addEventListener('visibilitychange', kick)
    window.addEventListener('pointerdown', kick)
    return () => {
      v.removeEventListener('canplay', kick)
      document.removeEventListener('visibilitychange', kick)
      window.removeEventListener('pointerdown', kick)
    }
  }, [])

  const open = chamber.hotspots.find((h) => h.id === openId) ?? null

  return (
    <div className={'t-cham' + (entered ? ' is-in' : '') + (open ? ' has-panel' : '')}>
      <div className="t-cham__frame">
        <video
          ref={videoRef}
          className="t-cham__video"
          src={chamber.loop}
          poster={chamber.poster}
          loop
          autoPlay
          muted
          playsInline
          preload="auto"
        />

        {chamber.hotspots.map((h) => (
          <button
            key={h.id}
            type="button"
            className={'t-spot' + (openId === h.id ? ' is-open' : '')}
            style={{ left: `${h.x}%`, top: `${h.y}%` }}
            onClick={() => setOpenId(openId === h.id ? null : h.id)}
            aria-expanded={openId === h.id}
          >
            <span className="t-spot__ring" aria-hidden="true" />
            <span className="t-spot__dot" aria-hidden="true" />
            <span className="t-spot__label">{h.label}</span>
          </button>
        ))}

        {/* Das Filament vom angeklickten Punkt zum Text. Es sitzt im Frame,
            damit es dem Punkt folgt und nicht dem Fenster. */}
        {open && (
          <span
            className="t-thread"
            style={{ left: `${open.x}%`, top: `${open.y}%` }}
            aria-hidden="true"
          />
        )}
      </div>

      <div className="t-cham__vignette" aria-hidden="true" />

      <header className="t-cham__head">
        <span className="t-cham__eyebrow">{chamber.eyebrow}</span>
        <h2 className="t-cham__name">{station.name}</h2>
        <p className="t-cham__claim">{station.claim}</p>
      </header>

      <button type="button" className="t-cham__close" onClick={onClose}>
        <span className="t-cham__closeIcon" aria-hidden="true">
          <i />
          <i />
        </span>
        Zurück in den Stamm
      </button>

      <aside className={'t-panel' + (open ? ' is-open' : '')} aria-hidden={!open}>
        {open && (
          <>
            <span className="t-panel__label">{open.label}</span>
            <h3 className="t-panel__title">{open.title}</h3>
            <p className="t-panel__body">{open.body}</p>
            <button type="button" className="t-panel__close" onClick={() => setOpenId(null)}>
              schließen
            </button>
          </>
        )}
      </aside>

      {!openId && (
        <span className="t-cham__hint" aria-hidden="true">
          {chamber.hotspots.length} Stellen zum Anklicken
        </span>
      )}
    </div>
  )
}
