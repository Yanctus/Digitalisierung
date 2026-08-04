import { Reveal, Mark } from './ui'

const LINKS = [
  { label: 'Ausgangspunkt', href: '#keim', n: '01' },
  { label: 'Der Weg', href: '#struktur', n: '02' },
  { label: 'Ergebnis', href: '#netz', n: '03' },
  { label: 'Kontakt', href: '#kontakt', n: '04' },
]

export default function Navbar() {
  return (
    <header className="fixed inset-x-0 top-0 z-50 border-b border-white/15">
      <nav className="flex items-center justify-between px-5 py-4 sm:px-8 md:px-12">
        <Reveal delay={0}>
          <a
            href="#feld"
            className="flex items-center gap-2.5 text-lg font-medium tracking-tight text-white drop-shadow-md transition-opacity duration-300 hover:opacity-80 sm:text-xl"
          >
            <Mark />
            <span>norman nerger</span>
          </a>
        </Reveal>

        <div className="hidden items-center gap-8 md:flex lg:gap-10">
          {LINKS.map((l, i) => (
            <Reveal key={l.href} delay={100 + i * 100}>
              <a
                href={l.href}
                className="text-sm text-white/85 drop-shadow-md transition-colors duration-300 hover:text-white"
              >
                {l.label}
                <sup className="ml-1 font-mono text-[10px] text-white/60">{l.n}</sup>
              </a>
            </Reveal>
          ))}
        </div>

        <Reveal delay={500}>
          <a
            href="#kontakt"
            className="rounded-md border border-white/20 bg-white/15 px-4 py-2 text-xs text-white backdrop-blur-md transition-colors duration-300 hover:bg-white/25 sm:px-5 sm:text-sm"
          >
            Erstgespräch buchen
          </a>
        </Reveal>
      </nav>
    </header>
  )
}
