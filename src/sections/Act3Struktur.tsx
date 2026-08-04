import { ChevronRight } from 'lucide-react'
import { Act, Badge, Reveal } from '../components/ui'

const PHASES = [
  {
    n: '01',
    title: 'Verstehen',
    body: 'Zwei Wochen im Betrieb statt zwei Stunden im Meetingraum. Ich kartiere, was wirklich läuft — nicht das, was im Organigramm steht.',
  },
  {
    n: '02',
    title: 'Ordnen',
    body: 'Doppelte Wege raus, Datenhoheit rein. Ein System, das eine einzige Wahrheit kennt, bevor irgendetwas automatisiert wird.',
  },
  {
    n: '03',
    title: 'Automatisieren',
    body: 'Was sich wiederholt, übernimmt die Maschine. Was Urteilskraft braucht, bleibt bei euren Leuten.',
  },
  {
    n: '04',
    title: 'Skalieren',
    body: 'KI dort, wo sie trägt — angebunden an saubere Daten statt an Hoffnung.',
  },
]

export default function Act3Struktur() {
  return (
    <Act id="struktur">
      <div className="flex flex-col gap-8 sm:flex-row sm:justify-between">
        <Reveal delay={120}>
          <Badge>Der Weg</Badge>
        </Reveal>

        <Reveal delay={220} className="max-w-sm sm:text-right">
          <p className="text-lg leading-relaxed text-white drop-shadow-md sm:text-xl">
            Vier Phasen statt einer Big-Bang-Migration. Das Tagesgeschäft läuft
            weiter, während darunter neu gebaut wird.
          </p>
        </Reveal>
      </div>

      <div className="flex flex-1 flex-col justify-end gap-12 md:flex-row md:items-end md:justify-between md:gap-16">
        <div className="max-w-xl">
          <Reveal delay={180}>
            <h2 className="text-5xl font-normal leading-[1.05] tracking-tight text-white drop-shadow-lg sm:text-6xl lg:text-7xl">
              Struktur, die
              <br />
              mitwächst.
            </h2>
          </Reveal>
          <Reveal delay={320}>
            <p className="mt-6 max-w-md text-sm leading-relaxed text-white/80 drop-shadow-md sm:text-base">
              Jede Phase steht für sich und liefert etwas, das ihr behaltet — auch
              wenn ihr danach ohne mich weitermacht. Kein Vendor-Lock-in, keine
              Abhängigkeit von meiner Anwesenheit.
            </p>
          </Reveal>
          <Reveal delay={420}>
            <div className="mt-8 flex flex-wrap gap-3">
              <a
                href="#netz"
                className="inline-flex items-center gap-1 rounded-full bg-white px-5 py-2.5 text-xs font-medium text-black transition-colors duration-300 hover:bg-white/85 sm:text-sm"
              >
                Ergebnis ansehen
                <ChevronRight size={14} />
              </a>
              <a
                href="#kontakt"
                className="rounded-full border border-white/25 bg-white/10 px-5 py-2.5 text-xs text-white backdrop-blur-md transition-colors duration-300 hover:bg-white/20 sm:text-sm"
              >
                Erstgespräch buchen
              </a>
            </div>
          </Reveal>
        </div>

        {/* -------------------------------------------------- phase panel */}
        <div className="w-full max-w-md rounded-2xl border border-white/15 bg-white/10 px-5 backdrop-blur-md sm:px-6">
          {PHASES.map((ph, i) => (
            <Reveal key={ph.n} delay={300 + i * 110}>
              <div
                className={`group flex gap-5 py-5 ${
                  i < PHASES.length - 1 ? 'border-b border-white/15' : ''
                }`}
              >
                <span className="font-mono text-[11px] tracking-[0.15em] text-white/55">
                  {ph.n}
                </span>
                <div>
                  <h3 className="flex items-center gap-1.5 text-base font-medium text-white sm:text-lg">
                    {ph.title}
                    <ChevronRight
                      size={16}
                      className="text-white/40 transition-all duration-300 group-hover:translate-x-0.5 group-hover:text-white"
                    />
                  </h3>
                  <p className="mt-1.5 text-sm leading-relaxed text-white/70">
                    {ph.body}
                  </p>
                </div>
              </div>
            </Reveal>
          ))}
        </div>
      </div>
    </Act>
  )
}
