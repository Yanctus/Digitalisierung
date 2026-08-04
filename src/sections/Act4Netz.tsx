import { Act, Badge, Reveal } from '../components/ui'

/**
 * Deliberately qualitative. Percentages and client counts belong here only once
 * they are real numbers from real projects — see the note in README.md.
 */
const OUTCOMES = [
  {
    title: 'Eine Datenquelle',
    body: 'Statt sieben Excel-Ständen, die sich gegenseitig widersprechen.',
  },
  {
    title: 'Abläufe, die bleiben',
    body: 'Dokumentiert und wiederholbar — nicht im Kopf einer einzigen Person.',
  },
  {
    title: 'Anschlussfähig',
    body: 'Bereit für KI, wenn ihr so weit seid. Nicht früher, nicht später.',
  },
]

export default function Act4Netz() {
  return (
    <Act id="netz">
      <div className="flex flex-col gap-8 sm:flex-row sm:justify-between">
        <Reveal delay={120}>
          <Badge>Ergebnis</Badge>
        </Reveal>

        <Reveal delay={220} className="max-w-sm sm:text-right">
          <p className="text-lg leading-relaxed text-white drop-shadow-md sm:text-xl">
            Am Ende steht kein Tool. Am Ende steht ein Betrieb, der sich selbst
            lesen kann.
          </p>
        </Reveal>
      </div>

      <div className="flex flex-1 flex-col justify-end gap-12">
        <div className="max-w-xl">
          <Reveal delay={180}>
            <h2 className="text-5xl font-normal leading-[1.05] tracking-tight text-white drop-shadow-lg sm:text-6xl lg:text-7xl">
              Ein Betrieb,
              <br />
              der sich kennt.
            </h2>
          </Reveal>
          <Reveal delay={320}>
            <p className="mt-6 max-w-md text-sm leading-relaxed text-white/80 drop-shadow-md sm:text-base">
              Dieselbe Firma, dieselben Menschen, dasselbe Handwerk. Nur sichtbar
              geworden — und damit steuerbar.
            </p>
          </Reveal>
        </div>

        <div className="grid gap-px overflow-hidden rounded-2xl border border-white/15 bg-white/10 backdrop-blur-md sm:grid-cols-3">
          {OUTCOMES.map((o, i) => (
            <Reveal key={o.title} delay={340 + i * 110}>
              <div className="h-full border-white/15 p-5 sm:p-6 [&:not(:last-child)]:border-b sm:[&:not(:last-child)]:border-b-0">
                <span className="font-mono text-[11px] tracking-[0.15em] text-white/55">
                  {String(i + 1).padStart(2, '0')}
                </span>
                <h3 className="mt-3 text-base font-medium text-white sm:text-lg">
                  {o.title}
                </h3>
                <p className="mt-1.5 text-sm leading-relaxed text-white/70">
                  {o.body}
                </p>
              </div>
            </Reveal>
          ))}
        </div>
      </div>
    </Act>
  )
}
