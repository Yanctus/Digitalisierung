/**
 * Die Unterwasserwelt — isometrische Nabe mit Tauchgängen.
 *
 * Ein Ort ist vollständig gerendert. Die übrigen Punkte zeigen bereits die
 * spätere Geografie, bleiben aber bis zu ihren eigenen Clips deaktiviert.
 */

export type DiveHotspot = {
  id: string
  x: number
  y: number
  label: string
  title: string
  body: string
}

export type DivePageContent = {
  eyebrow: string
  title: string
  intro: string
  signals: { value: string; label: string; body: string }[]
  principles: { label: string; title: string; body: string }[]
  steps: { title: string; body: string; result: string }[]
  metrics: { value: string; unit: string; label: string }[]
  closing: { eyebrow: string; title: string; body: string }
}

export type Place = {
  id: string
  /** Lage auf der Weltansicht, in Prozent des Videobilds. */
  x: number
  y: number
  name: string
  claim: string
  /** Fehlt beides, ist der Ort angelegt, aber noch nicht gerendert. */
  dive?: string
  /** Derselbe Tauchgang als fertig umgekehrte Datei — der Rückweg. */
  rise?: string
  room?: string
  poster?: string
  hotspots?: DiveHotspot[]
  /** Die redaktionelle Tiefenreise unterhalb des lebenden Raum-Heros. */
  page?: DivePageContent
}

export const WORLD = {
  clip: '/dive/vid/welt.mp4',
  poster: '/dive/still/welt.jpg',
  eyebrow: 'Aus Gewachsenem wird Neues',
  title: 'Alles, was Sie brauchen, liegt längst da unten.',
  body: 'Es liegt nur im Dunkeln. Ein gewachsenes Unternehmen ist wie dieses Riff: über Jahre entstanden, voller Struktur, und niemand hat je die ganze Karte gesehen. Suchen Sie sich einen Ort aus.',
}

export const PLACES: Place[] = [
  {
    id: 'halle',
    x: 47,
    y: 47,
    name: 'Die Kuppelhalle',
    claim: 'Ein funktionierender Prozess ist nicht automatisch ein guter Prozess.',
    dive: '/dive/vid/tauchgang.mp4',
    rise: '/dive/vid/auftauchen.mp4',
    room: '/dive/vid/halle.mp4',
    poster: '/dive/still/halle.jpg',
    hotspots: [
      {
        id: 'laterne',
        x: 50,
        y: 82,
        label: 'Die Laterne',
        title: 'Sichtbar reicht oft schon.',
        body: 'Ein großer Teil der Wirkung entsteht, bevor irgendetwas automatisiert wird — nämlich in dem Moment, in dem alle dasselbe sehen. Das ist fast immer der billigste Schritt und fast immer der erste.',
      },
      {
        id: 'saeulen',
        x: 20,
        y: 55,
        label: 'Die Säulen',
        title: 'Gewachsen heißt nicht zufällig.',
        body: 'Was hier steht, steht aus einem Grund. Bevor etwas verändert wird, muss klar sein, welche Last es trägt — sonst reißt man tragende Teile heraus und merkt es erst im nächsten Quartal.',
      },
      {
        id: 'licht',
        x: 62,
        y: 22,
        label: 'Das Licht von oben',
        title: 'Von außen kommt nur ein Teil.',
        body: 'Beratung, die von oben Licht hereinlässt und wieder geht, ändert nichts. Das Licht muss von innen kommen — deshalb ist die Übergabe kein Anhang des Projekts, sondern sein Ziel.',
      },
    ],
    page: {
      eyebrow: 'Prozess-Tomografie / 01',
      title: 'Nicht digitalisieren. Erst durchleuchten.',
      intro:
        'Die häufigste Fehlannahme in gewachsenen Betrieben: Ein Ablauf muss gut sein, weil er seit Jahren läuft. Läuft heißt nur, dass seine unsichtbaren Kosten noch niemand gemeinsam gesehen hat.',
      signals: [
        {
          value: '1 Kopf',
          label: 'Abhängigkeit',
          body: 'Der Ablauf steht, sobald eine bestimmte Person fehlt. Wissen ist vorhanden — aber nicht im System.',
        },
        {
          value: '2×',
          label: 'Reibung',
          body: 'Dieselbe Information wird an mehreren Stellen gepflegt, damit getrennte Systeme dieselbe Wahrheit kennen.',
        },
        {
          value: '?',
          label: 'Blindflug',
          body: 'Niemand kann den ganzen Weg zeigen. Jeder kennt seinen Ausschnitt — die Kosten entstehen dazwischen.',
        },
      ],
      principles: [
        {
          label: 'Die Laterne',
          title: 'Sichtbarkeit vor Automatisierung.',
          body: 'Oft entsteht der größte Hebel in dem Moment, in dem alle Beteiligten erstmals denselben Ablauf sehen.',
        },
        {
          label: 'Die Säulen',
          title: 'Erst verstehen, was die Last trägt.',
          body: 'Gewachsene Schritte sind nicht zufällig. Wer ihren Grund nicht kennt, optimiert womöglich genau das Falsche.',
        },
        {
          label: 'Das Licht',
          title: 'Die Lösung muss innen leuchten.',
          body: 'Ein Projekt ist erst fertig, wenn Methode, Wissen und Verantwortung im Unternehmen bleiben — ohne Berater daneben.',
        },
      ],
      steps: [
        {
          title: 'Mitlaufen',
          body: 'Wir beobachten, was wirklich geschieht — nicht, was im Organigramm stehen sollte.',
          result: 'Der echte Weg',
        },
        {
          title: 'Kartieren',
          body: 'Menschen, Entscheidungen, Daten und Umwege werden zu einem gemeinsamen Bild verbunden.',
          result: 'Eine Wahrheit',
        },
        {
          title: 'Entlasten',
          body: 'Wir lösen zuerst den Engpass mit dem größten Effekt und dem kleinsten Eingriff.',
          result: 'Spürbare Wirkung',
        },
        {
          title: 'Übergeben',
          body: 'Der neue Weg wird von denen dokumentiert und getragen, die ihn jeden Tag gehen.',
          result: 'Keine Abhängigkeit',
        },
      ],
      metrics: [
        { value: '6–8', unit: 'Wochen', label: 'bis das echte System sichtbar ist' },
        { value: '0', unit: 'Tools', label: 'bevor der Prozess verstanden ist' },
        { value: '100', unit: '% Übergabe', label: 'Wissen bleibt im Unternehmen' },
      ],
      closing: {
        eyebrow: 'Zurück an die Oberfläche',
        title: 'Wer das Ganze sieht, entscheidet anders.',
        body: 'Der Tauchgang endet. Der Überblick bleibt. Kehren Sie ins Riff zurück — oder starten Sie mit Ihrem eigenen Prozess.',
      },
    },
  },
  {
    id: 'tangwald',
    x: 13,
    y: 34,
    name: 'Der Tangwald',
    claim: 'Informationen sind vorhanden. Aber nicht dort, wo sie gebraucht werden.',
  },
  {
    id: 'wrack',
    x: 78,
    y: 30,
    name: 'Das Wrack',
    claim: 'Manche Systeme laufen nur noch, weil niemand sie abschalten will.',
  },
  {
    id: 'schlot',
    x: 45,
    y: 82,
    name: 'Der Schlot',
    claim: 'Digitalisierung scheitert an den Menschen, die man nicht mitgenommen hat.',
  },
]
