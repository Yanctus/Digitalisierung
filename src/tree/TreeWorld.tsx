import { useCallback, useEffect, useRef, useState } from 'react'
import { mountWorld, type WorldState } from '../world/engine'
import { STATIONS, CHAMBERS } from './treeConfig'
import Chamber from './Chamber'
import TrailCursor from '../world/TrailCursor'

/**
 * Der Baum — Prototyp der begehbaren Welt.
 *
 * Scrollen treibt den Stamm (dieselbe Engine wie die Kamerafahrt, sie nimmt
 * beliebige Legs). Klicken führt seitwärts in eine Kammer. Beides bleibt
 * getrennt: Der Stamm ist die Geschichte, die Kammern sind die Tiefe.
 *
 * Wer nur scrollt, bekommt an jeder Mündung den `claim` — den einen Satz, um
 * den es geht. Nichts Wichtiges liegt hinter einem Klick.
 */
export default function TreeWorld() {
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
  const [openChamber, setOpenChamber] = useState<string | null>(null)
  /** Einmal betreten, bleibt hell — dieselbe Regel wie im Film. */
  const [visited, setVisited] = useState<string[]>([])
  /**
   * Die Scrollposition beim Eintritt.
   *
   * `overflow: hidden` am Body reicht NICHT, um sie zu halten — im Test ist
   * sie trotzdem gewandert, und auf iOS ist die Sperre ohnehin undicht. Da
   * das Versprechen der ganzen Welt lautet „du kommst genau dort wieder raus,
   * wo du reingegangen bist", wird die Position gemerkt und beim Verlassen
   * wiederhergestellt. Die Sperre bleibt trotzdem — sie verhindert das
   * Zappeln währenddessen.
   */
  const returnY = useRef(0)

  useEffect(() => {
    if (!stageRef.current || !trackRef.current) return
    const api = mountWorld(
      stageRef.current,
      trackRef.current,
      STATIONS.map((s) => ({
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

  const enter = useCallback((id: string) => {
    returnY.current = window.scrollY
    setOpenChamber(id)
    setVisited((v) => (v.includes(id) ? v : [...v, id]))
  }, [])

  const leave = useCallback(() => {
    setOpenChamber(null)
    // Nach dem Freigeben des Scrollens zurücksetzen, nicht davor — sonst
    // überschreibt die Freigabe die Wiederherstellung.
    requestAnimationFrame(() => window.scrollTo(0, returnY.current))
  }, [])

  const station = STATIONS[st.active]
  const p = st.localProgress
  // Die Mündung öffnet sich genau dort, wo die Kamera ohnehin verweilt.
  const atMouth = !!station?.chamber && p > 0.28 && p < 0.74
  const openStation = STATIONS.find((s) => s.id === openChamber) ?? null

  return (
    <div className="w-root t-root">
      <div className="w-sky" aria-hidden="true">
        <div className="w-sky__grad" />
        <div className="w-sky__glow" />
      </div>

      <div className="w-stage" ref={stageRef} />
      <div className="w-grain" aria-hidden="true" />
      <div className="t-track" ref={trackRef} />

      <TrailCursor />

      <header className="t-top">
        <a className="t-back" href="#">
          <span className="t-back__arrow" aria-hidden="true" />
          Zur Reise
        </a>
        <span className="t-top__title">Der Baum</span>
        <span className="t-top__count">
          <em>{visited.length}</em> / {CHAMBERS.length} Kammern
        </span>
      </header>

      {/* Die Karte: Stationen als Knoten am Stamm. Betretene bleiben hell. */}
      <nav className="t-map" aria-label="Stationen im Baum">
        <span className="t-map__line" aria-hidden="true">
          <i style={{ transform: `scaleY(${st.progress.toFixed(3)})` }} />
        </span>
        {STATIONS.map((s, i) => (
          <button
            key={s.id}
            type="button"
            className={
              't-map__node' +
              (i === st.active ? ' is-active' : '') +
              (visited.includes(s.id) ? ' is-visited' : '') +
              (s.chamber ? ' has-chamber' : '')
            }
            style={{ top: `${((i + 0.5) / STATIONS.length) * 100}%` }}
            onClick={() => apiRef.current?.jumpTo(i)}
          >
            <span className="t-map__dot" aria-hidden="true" />
            <span className="t-map__label">{s.name}</span>
          </button>
        ))}
      </nav>

      {/* Der Pitch am Stamm */}
      <div className="t-copylayer">
        {STATIONS.map((s, i) => {
          const isActive = i === st.active
          const lp = isActive ? st.localProgress : 0
          const op = isActive ? Math.max(0, 1 - Math.abs(lp - 0.5) / 0.52) : 0
          return (
            <article
              className="t-copy"
              key={s.id}
              style={{ opacity: op, pointerEvents: op > 0.5 ? 'auto' : 'none' }}
              aria-hidden={op < 0.05}
            >
              <span className="t-copy__num">
                {String(i + 1).padStart(2, '0')}
                <span> / {String(STATIONS.length).padStart(2, '0')}</span>
              </span>
              <h2 className="t-copy__name">{s.name}</h2>
              <p className="t-copy__claim">{s.claim}</p>

              {s.chamber && (
                <button
                  type="button"
                  className={
                    't-enter' +
                    (atMouth && isActive ? ' is-ready' : '') +
                    (visited.includes(s.id) ? ' is-visited' : '')
                  }
                  onClick={() => enter(s.id)}
                >
                  <span className="t-enter__node" aria-hidden="true" />
                  {visited.includes(s.id) ? 'Nochmal hineingehen' : 'Hineingehen'}
                </button>
              )}
            </article>
          )
        })}
      </div>

      <div
        className="t-hint"
        style={{ opacity: Math.max(0, 1 - st.progress * 12) }}
        aria-hidden="true"
      >
        scrollen, um zu steigen · klicken, um einzutreten
      </div>

      {openStation && <Chamber station={openStation} onClose={leave} />}
    </div>
  )
}
