import { Act, Badge, Reveal } from '../components/ui'

const REALITY = [
  'Excel-Listen, die niemand mehr ganz versteht',
  'Drei Abteilungen, die dieselbe Information doppelt pflegen',
  'Wissen, das an einzelnen Menschen hängt',
]

export default function Act2Keim() {
  return (
    <Act id="keim">
      <div className="flex flex-col gap-8 sm:flex-row sm:justify-between">
        <Reveal delay={120}>
          <Badge>Ausgangspunkt</Badge>
        </Reveal>

        <Reveal delay={220} className="max-w-sm sm:text-right">
          <p className="text-lg leading-relaxed text-white drop-shadow-md sm:text-xl">
            Kein Unternehmen startet auf der grünen Wiese. Es startet auf einem
            Feld, das seit Jahrzehnten bestellt wird.
          </p>
        </Reveal>
      </div>

      <div className="flex flex-1 flex-col justify-end gap-12 md:flex-row md:items-end md:justify-between md:gap-16">
        <div className="max-w-xl">
          <Reveal delay={180}>
            <h2 className="text-5xl font-normal leading-[1.05] tracking-tight text-white drop-shadow-lg sm:text-6xl lg:text-7xl">
              Es beginnt
              <br />
              im Feld.
            </h2>
          </Reveal>
          <Reveal delay={320}>
            <p className="mt-6 max-w-md text-sm leading-relaxed text-white/80 drop-shadow-md sm:text-base">
              Das ist kein Versagen — das ist gewachsene Substanz. Jahrzehnte an
              Erfahrung, die sich in Abläufen abgelagert haben. Genau die ist der
              Rohstoff. Wer sie wegdigitalisiert, verliert das Unternehmen.
            </p>
          </Reveal>
        </div>

        <div className="w-full max-w-md">
          {REALITY.map((r, i) => (
            <Reveal key={r} delay={300 + i * 110}>
              <div
                className={`flex gap-5 py-5 ${
                  i < REALITY.length - 1 ? 'border-b border-white/15' : ''
                }`}
              >
                <span className="font-mono text-[11px] tracking-[0.15em] text-white/55">
                  {String(i + 1).padStart(2, '0')}
                </span>
                <p className="text-sm leading-relaxed text-white/75">{r}</p>
              </div>
            </Reveal>
          ))}
        </div>
      </div>
    </Act>
  )
}
