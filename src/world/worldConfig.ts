/**
 * Die acht Legs der Kamerafahrt, in Reihenfolge.
 *
 * `scroll` ist Scrollweg in Viewport-Höhen — je mehr, desto länger verweilt die
 * Kamera in dieser Szene. `linger` (0..1) verlangsamt die Mitte des Legs, damit
 * die Kamera genau dann ruhig steht, wenn die Copy ihren Höhepunkt hat; die
 * Nahtframes bleiben unangetastet.
 *
 * Die Reihenfolge und die Dauern stammen aus assets/scroll-world/HANDOVER.md.
 */

export type WorldSection = {
  id: string
  label: string
  clip: string
  still: string
  /** Sekunden — nur für die Anzeige im Rail, nicht für das Scrubbing. */
  seconds: number
  scroll: number
  linger?: number
  eyebrow: string
  title: string
  body: string
  tags?: string[]
  cta?: { primary: { label: string; href: string }; secondary?: { label: string; href: string } }
}

export const SECTIONS: WorldSection[] = [
  {
    id: 'ast',
    label: 'Der Ast',
    clip: '/world/vid/leg0.mp4',
    still: '/world/still/leg0.jpg',
    seconds: 5,
    scroll: 1.5,
    linger: 0.45,
    eyebrow: 'Aus gewachsen wird vernetzt',
    title: 'Das Netz ist längst da.',
    body:
      'In jedem gewachsenen Unternehmen liegt bereits eine Struktur: Wege, die sich eingespielt haben, Wissen, das jemand trägt, Abläufe, die funktionieren. Sie ist nur nicht sichtbar — und deshalb nicht nutzbar.',
    tags: ['Bestandsaufnahme', 'Struktur erkennen'],
  },
  {
    id: 'abstieg',
    label: 'Der Abstieg',
    clip: '/world/vid/leg1.mp4',
    still: '/world/still/leg1.jpg',
    seconds: 10,
    scroll: 1.9,
    linger: 0.35,
    eyebrow: 'Vorgehen',
    title: 'Wir gehen mit. Nicht darüber.',
    body:
      'Digitalisierung fängt nicht bei der Software an, sondern bei dem, was schon trägt. Wir folgen Ihren Wegen, statt neue daneben zu bauen — und machen sichtbar, was Sie ohnehin schon können.',
    tags: ['Prozessaufnahme', 'Ist-Analyse'],
  },
  {
    id: 'fassade',
    label: 'Die Struktur',
    clip: '/world/vid/leg2.mp4',
    still: '/world/still/leg2.jpg',
    seconds: 10,
    scroll: 2.0,
    linger: 0.4,
    eyebrow: 'Zugang',
    title: 'Wege öffnen, die vorher nicht da waren.',
    body:
      'Wo bisher eine Wand war, entsteht ein Durchgang. Nichts wird eingerissen, nichts ersetzt — es wird nur zugänglich, was vorher nebeneinander lag. Schnittstellen statt Neubau.',
    tags: ['Schnittstellen', 'Systeme verbinden'],
  },
  {
    id: 'erwachen',
    label: 'Das Erwachen',
    clip: '/world/vid/leg3.mp4',
    still: '/world/still/leg3.jpg',
    seconds: 8,
    scroll: 1.7,
    eyebrow: 'Wirkung',
    title: 'Und plötzlich brennt Licht.',
    body:
      'Der Moment, in dem aus Daten Übersicht wird. Nicht weil etwas Neues gebaut wurde, sondern weil das Vorhandene endlich zusammenhängt und antwortet.',
    tags: ['Transparenz', 'Auswertbarkeit'],
  },
  {
    id: 'menschen',
    label: 'Die Menschen',
    clip: '/world/vid/leg4.mp4',
    still: '/world/still/leg4.jpg',
    seconds: 10,
    scroll: 2.1,
    linger: 0.5,
    eyebrow: 'Der eigentliche Teil',
    title: 'Systeme sind einfach. Menschen sind die Arbeit.',
    body:
      'Jede Einführung scheitert oder gelingt an den Menschen, die damit arbeiten sollen. Deshalb liegt hier der Schwerpunkt: verstehen, erklären, begleiten — bis es niemand mehr erklärt bekommen muss.',
    tags: ['Schulung', 'Change', 'Akzeptanz'],
  },
  {
    id: 'abwehr',
    label: 'Der Widerstand',
    clip: '/world/vid/leg5.mp4',
    still: '/world/still/leg5.jpg',
    seconds: 8,
    scroll: 1.8,
    eyebrow: 'Ehrlich gesagt',
    title: 'Der erste Reflex ist Abwehr. Das ist in Ordnung.',
    body:
      'Wer seit zwanzig Jahren weiß, wie es geht, wehrt Neues erst einmal ab. Das ist kein Widerstand gegen Fortschritt, sondern gesunder Selbstschutz. Man muss ihn aushalten, nicht überrennen.',
    tags: ['Vorbehalte ernst nehmen', 'Tempo anpassen'],
  },
  {
    id: 'uebergabe',
    label: 'Die Übergabe',
    clip: '/world/vid/leg6.mp4',
    still: '/world/still/leg6.jpg',
    seconds: 10,
    scroll: 2.0,
    linger: 0.45,
    eyebrow: 'Das Ziel',
    title: 'Am Ende gebe ich alles ab.',
    body:
      'Eine Begleitung ist dann gelungen, wenn sie nicht mehr gebraucht wird. Alles, was ich mitbringe — Methode, Struktur, Werkzeug — bleibt bei Ihnen, wenn ich wieder gehe.',
    tags: ['Wissenstransfer', 'Keine Abhängigkeit'],
  },
  {
    id: 'horizont',
    label: 'Der Horizont',
    clip: '/world/vid/leg7.mp4',
    still: '/world/still/leg7.jpg',
    seconds: 10,
    scroll: 2.2,
    linger: 0.3,
    eyebrow: 'Norman Nerger',
    title: 'Aus gewachsen wird vernetzt.',
    body:
      'Digitalisierungsbegleitung für Unternehmen, die etwas aufgebaut haben und es behalten wollen. Reden wir darüber, was bei Ihnen schon da ist.',
    // Die Ziele existieren jetzt wirklich: beide Abschnitte liegen auf der
    // Landeseite unter dem Film.
    cta: {
      primary: { label: 'Gespräch vereinbaren', href: '#kontakt' },
      secondary: { label: 'Projekte ansehen', href: '#projekte' },
    },
  },
]

/** Violett/Orange aus dem Film — die Palette der Seite stammt aus den Clips selbst. */
export const PALETTE = {
  bg: '#07040f',
  ink: '#f4f0ff',
  inkSoft: '#a99fc4',
  violet: '#a970ff',
  violetBright: '#d9c2ff',
  orange: '#ff9a4d',
}
