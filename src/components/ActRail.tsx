import { useJourneyProgress } from '../lib/journeyProgress'

/**
 * A chapter rail pinned to the right edge. It doubles as a scroll indicator and
 * as the table of contents for the journey — you always know which stage of the
 * transformation you are standing in.
 */
// Die Schwellen folgen der tatsächlichen Kameraposition, nicht dem Textfluss:
// z = -25 + p * 565. Gerüste ab z≈110, Netzeintritt ab z≈300.
const ACTS = [
  { at: 0.0, label: 'Das Feld' },
  { at: 0.16, label: 'Der Keim' },
  { at: 0.36, label: 'Struktur' },
  { at: 0.58, label: 'Das Netz' },
  { at: 0.84, label: 'Horizont' },
]

export default function ActRail() {
  const p = useJourneyProgress()
  const active = ACTS.reduce((acc, a, i) => (p >= a.at ? i : acc), 0)

  return (
    <div className="pointer-events-none fixed right-5 top-1/2 z-40 hidden -translate-y-1/2 lg:block">
      <div className="flex flex-col items-end gap-5">
        {ACTS.map((a, i) => {
          const isActive = i === active
          return (
            <div key={a.label} className="flex items-center gap-3">
              <span
                className={`font-mono text-[10px] uppercase tracking-[0.15em] drop-shadow-md transition-all duration-500 ${
                  isActive
                    ? 'translate-x-0 text-white opacity-100'
                    : 'translate-x-2 text-white/50 opacity-0'
                }`}
              >
                {a.label}
              </span>
              <span
                className={`block rounded-full bg-white transition-all duration-500 ${
                  isActive ? 'h-1.5 w-1.5 opacity-100' : 'h-1 w-1 opacity-35'
                }`}
              />
            </div>
          )
        })}
      </div>
    </div>
  )
}
