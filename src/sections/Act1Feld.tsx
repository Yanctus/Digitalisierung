import { ChevronRight } from 'lucide-react'
import { Act, Badge, Reveal } from '../components/ui'

const SERVICES = ['/ Prozessanalyse', '/ Automatisierung', '/ KI-Integration']

export default function Act1Feld() {
  return (
    <Act id="feld">
      {/* -------------------------------------------------- top row */}
      <div className="flex flex-col gap-8 sm:flex-row sm:justify-between">
        <div className="flex flex-col gap-2">
          {SERVICES.map((s, i) => (
            <Reveal key={s} delay={150 + i * 120}>
              <span className="font-mono text-xs uppercase tracking-[0.15em] text-white/90 drop-shadow-md">
                {s}
              </span>
            </Reveal>
          ))}
        </div>

        <Reveal delay={300} className="max-w-xs sm:text-right">
          <p className="text-lg leading-relaxed text-white drop-shadow-md sm:text-xl">
            Ich begleite gewachsene Unternehmen in die Digitalisierung — ohne den
            Boden zu verlieren, auf dem sie gewachsen sind.
          </p>
        </Reveal>
      </div>

      {/* -------------------------------------------------- bottom row */}
      <div className="flex flex-col gap-8 md:flex-row md:items-end md:justify-between">
        <div>
          <Reveal delay={150} className="mb-5">
            <Badge>Digitalisierung mit Bodenhaftung</Badge>
          </Reveal>
          <Reveal delay={280}>
            <h1 className="text-5xl font-normal leading-[1.05] tracking-tight text-white drop-shadow-lg sm:text-6xl lg:text-7xl">
              Aus gewachsen
              <br />
              wird vernetzt.
            </h1>
          </Reveal>
        </div>

        <Reveal delay={420}>
          <div className="flex items-center gap-4 rounded-xl bg-white/15 p-3 backdrop-blur-md">
            {/* TODO(norman): Porträtfoto einsetzen — bis dahin Monogramm-Kachel. */}
            <div className="flex h-24 w-20 shrink-0 items-center justify-center rounded-lg border border-white/20 bg-white/10">
              <span className="font-mono text-lg tracking-[0.1em] text-white/70">
                NN
              </span>
            </div>
            <div className="flex flex-col gap-1.5 pr-2">
              <span className="text-sm font-medium text-white">
                Sprich mit Norman
              </span>
              <span className="font-mono text-[10px] uppercase tracking-[0.15em] text-white/60">
                Digitalisierungsbegleiter
              </span>
              <a
                href="#kontakt"
                className="mt-1.5 inline-flex items-center gap-1 self-start rounded-full bg-white px-4 py-2 text-xs font-medium text-black transition-colors duration-300 hover:bg-white/85"
              >
                15-Min-Call buchen
                <ChevronRight size={14} />
              </a>
            </div>
          </div>
        </Reveal>
      </div>
    </Act>
  )
}
