import { ChevronRight } from 'lucide-react'
import { Act, Badge, Mark, Reveal } from '../components/ui'

export default function Act5Horizont() {
  return (
    <Act id="kontakt">
      <div className="flex flex-col gap-8 sm:flex-row sm:justify-between">
        <Reveal delay={120}>
          <Badge>Nächster Schritt</Badge>
        </Reveal>

        <Reveal delay={220} className="max-w-sm sm:text-right">
          <p className="text-lg leading-relaxed text-white drop-shadow-md sm:text-xl">
            Fünfzehn Minuten. Kein Pitch, keine Folien — ich höre zu und sage
            ehrlich, ob ich der Richtige bin.
          </p>
        </Reveal>
      </div>

      <div className="flex flex-1 flex-col justify-end">
        <div className="max-w-2xl">
          <Reveal delay={180}>
            <h2 className="text-5xl font-normal leading-[1.05] tracking-tight text-white drop-shadow-lg sm:text-6xl lg:text-7xl">
              Reden wir über
              <br />
              euer Feld.
            </h2>
          </Reveal>
          <Reveal delay={340}>
            <div className="mt-8 flex flex-wrap items-center gap-3">
              {/* TODO(norman): auf echten Kalender-Link umstellen (Cal.com o. Ä.). */}
              <a
                href="mailto:norman.nerger@gmail.com?subject=Erstgespr%C3%A4ch"
                className="inline-flex items-center gap-1 rounded-full bg-white px-5 py-2.5 text-xs font-medium text-black transition-colors duration-300 hover:bg-white/85 sm:text-sm"
              >
                Erstgespräch buchen
                <ChevronRight size={14} />
              </a>
              <a
                href="mailto:norman.nerger@gmail.com"
                className="font-mono text-xs uppercase tracking-[0.15em] text-white/70 transition-colors duration-300 hover:text-white"
              >
                norman.nerger@gmail.com
              </a>
            </div>
          </Reveal>
        </div>

        {/* -------------------------------------------------- footer */}
        <Reveal delay={460}>
          <footer className="mt-20 flex flex-col gap-4 border-t border-white/15 pt-6 sm:flex-row sm:items-center sm:justify-between">
            <div className="flex items-center gap-2.5 text-sm text-white/70">
              <Mark className="h-4 w-4" />
              <span>norman nerger — Digitalisierungsbegleitung</span>
            </div>
            <div className="flex gap-6 font-mono text-[10px] uppercase tracking-[0.15em] text-white/50">
              {/* Impressum und Datenschutzerklärung sind in DE Pflicht — Seiten anlegen. */}
              <a
                href="/impressum"
                className="transition-colors duration-300 hover:text-white"
              >
                Impressum
              </a>
              <a
                href="/datenschutz"
                className="transition-colors duration-300 hover:text-white"
              >
                Datenschutz
              </a>
            </div>
          </footer>
        </Reveal>
      </div>
    </Act>
  )
}
