import type { WorldSection } from './worldConfig'

/**
 * Die Navigation ist das Netz.
 *
 * Statt eines Fortschrittsbalkens stehen hier acht Knoten — einer je Akt. Beim
 * Scrollen wächst eine Lichtlinie von Knoten zu Knoten und zündet sie der Reihe
 * nach. Am Ende der Seite ist die Navigation selbst ein vollständiges Netz.
 *
 * Das ist dieselbe Mechanik wie im Film: Die Knoten sind von Anfang an da, nur
 * dunkel. Was durchlaufen wurde, bleibt hell — nichts fällt zurück.
 */
export default function NetworkRail({
  sections,
  active,
  progress,
  landed,
  onJump,
}: {
  sections: WorldSection[]
  active: number
  /** 0..1 über die gesamte Fahrt. */
  progress: number
  /** 0..1 — beim Landen tritt die Schiene ab, die Seite übernimmt. */
  landed: number
  onJump: (i: number) => void
}) {
  // Position jedes Knotens auf der Schiene, gewichtet nach Scrollweg —
  // so sitzt der Knoten dort, wo der Akt tatsächlich liegt.
  const weights = sections.map((s) => s.scroll)
  const total = weights.reduce((a, b) => a + b, 0)
  let acc = 0
  const positions = weights.map((w) => {
    const p = (acc + w / 2) / total
    acc += w
    return p
  })

  return (
    <nav
      className="w-rail"
      aria-label="Akte der Reise"
      style={{
        opacity: 1 - landed,
        pointerEvents: landed > 0.4 ? 'none' : 'auto',
        transform: `translateY(-50%) translateX(${(landed * 46).toFixed(1)}px)`,
      }}
      aria-hidden={landed > 0.6}
    >
      <span className="w-rail__line" aria-hidden="true" />
      <span
        className="w-rail__line w-rail__line--lit"
        style={{ transform: `scaleY(${progress})` }}
        aria-hidden="true"
      />

      {sections.map((s, i) => {
        const lit = progress >= positions[i] - 0.005
        return (
          <button
            key={s.id}
            type="button"
            className={
              'w-rail__node' +
              (lit ? ' is-lit' : '') +
              (i === active ? ' is-active' : '')
            }
            style={{ top: `${positions[i] * 100}%` }}
            onClick={() => onJump(i)}
            aria-current={i === active ? 'true' : undefined}
          >
            <span className="w-rail__dot" aria-hidden="true" />
            <span className="w-rail__label">
              <span className="w-rail__num">{String(i + 1).padStart(2, '0')}</span>
              {s.label}
            </span>
          </button>
        )
      })}
    </nav>
  )
}
