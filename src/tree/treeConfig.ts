/**
 * Der Baum — Aufbau der begehbaren Welt.
 *
 * ============================================================================
 *  PROTOTYP.
 *  KAMMERN: echt. Vier eigene Renders (Seedance 2.0, 480p, 16:9, 10 s,
 *  je $0,706 — zusammen $2,82). Stehende Kamera, als Ping-Pong verdoppelt
 *  (vorwärts + rückwärts), dadurch nahtlos ohne jede Logik im Browser.
 *  Seeds: 87390 / 5845 / 93402 / 60596. Prompts liegen daneben als JSON.
 *  STAMM: noch Platzhalter — läuft auf den Clips der Kamerafahrt.
 * ============================================================================
 *
 * Das Prinzip: Scrollen und Klicken machen zwei verschiedene Dinge.
 *
 *   Scrollen  = hoch durch den Stamm. Eine Achse, von den Wurzeln in die Krone.
 *   Klicken   = seitwärts in eine Kammer. Kamera steht, alles bewegt sich.
 *
 * Wer nur scrollt, bekommt trotzdem den ganzen Pitch: An jeder Kammermündung
 * hält die Kamera an (`linger`) und der `claim` sagt den einen Satz. Die
 * Kammern sind die Tiefe für die Neugierigen, nicht die Bedingung fürs
 * Verstehen.
 *
 * Die Texte stammen aus dem Konzeptblatt „Der Baum mit den Kammern".
 */

export type Hotspot = {
  id: string
  /** Lage im Videobild, in Prozent — die Kamera in der Kammer steht still. */
  x: number
  y: number
  label: string
  title: string
  body: string
}

export type TreeStation = {
  id: string
  /** Anzeige in der Karte und an der Mündung. */
  name: string
  /** Der Satz, den auch bekommt, wer vorbeiscrollt. Das ist der Pitch. */
  claim: string
  /** Der Stammabschnitt, an dessen Mitte die Kammer liegt. */
  clip: string
  still: string
  scroll: number
  linger?: number
  /** Fehlt sie, ist die Station reiner Stamm (Wurzeln, Krone). */
  chamber?: {
    loop: string
    poster: string
    eyebrow: string
    hotspots: Hotspot[]
  }
}

export const STATIONS: TreeStation[] = [
  {
    id: 'wurzeln',
    name: 'Die Wurzeln',
    claim: 'Alles, was Sie brauchen, ist schon da. Es liegt nur nicht beieinander.',
    clip: '/world/vid/leg1.mp4',
    still: '/world/still/leg1.jpg',
    scroll: 1.4,
    linger: 0.3,
  },
  {
    id: 'papierregen',
    name: 'Papierregen',
    claim: 'Informationen sind vorhanden. Aber nicht dort, wo sie gebraucht werden.',
    clip: '/world/vid/leg2.mp4',
    still: '/world/still/leg2.jpg',
    scroll: 1.8,
    linger: 0.5,
    chamber: {
      loop: '/tree/vid/kammer1.mp4',
      poster: '/tree/still/kammer1.jpg',
      eyebrow: 'Kammer 01',
      hotspots: [
        {
          id: 'stapel',
          x: 38,
          y: 84,
          label: 'Der Stapel',
          title: 'Jeder Stapel ist eine Frage, die jemand schon beantwortet hat.',
          body: 'In gewachsenen Betrieben liegt das Wissen nicht im System, sondern im Ordner, im Postfach und im Kopf von drei Leuten. Es ist nicht verloren — es ist nur nicht abrufbar, wenn es gebraucht wird.',
        },
        {
          id: 'schrank',
          x: 19,
          y: 78,
          label: 'Der Schrank',
          title: 'Ablage ist kein Archiv.',
          body: 'Etwas abzulegen heißt nicht, es wiederzufinden. Der erste Schritt ist fast nie Software, sondern eine Entscheidung: Was muss auffindbar sein, und für wen?',
        },
        {
          id: 'lampe',
          x: 48,
          y: 88,
          label: 'Die Laterne',
          title: 'Sichtbar reicht oft schon.',
          body: 'Ein großer Teil der Wirkung entsteht, bevor irgendetwas automatisiert wird — nämlich in dem Moment, in dem alle dasselbe sehen.',
        },
      ],
    },
  },
  {
    id: 'uhrwerk',
    name: 'Analoges Uhrwerk',
    claim: 'Ein funktionierender Prozess ist nicht automatisch ein guter Prozess.',
    clip: '/world/vid/leg0.mp4',
    still: '/world/still/leg0.jpg',
    scroll: 1.6,
    linger: 0.5,
    chamber: {
      loop: '/tree/vid/kammer2.mp4',
      poster: '/tree/still/kammer2.jpg',
      eyebrow: 'Kammer 02',
      hotspots: [
        {
          id: 'zahnrad',
          x: 31,
          y: 44,
          label: 'Das große Rad',
          title: 'Es läuft. Das ist das Problem.',
          body: 'Was seit zwanzig Jahren läuft, wird nicht hinterfragt — auch dann nicht, wenn drei der acht Schritte nur noch existieren, weil sie mal nötig waren. Die teuersten Abläufe sind die, über die niemand mehr nachdenkt.',
        },
        {
          id: 'kurbel',
          x: 52,
          y: 76,
          label: 'Die kleine Welle',
          title: 'Wer dreht hier eigentlich?',
          body: 'In fast jedem Prozess gibt es eine Person, ohne die er stehenbleibt. Das ist kein Lob und kein Vorwurf — es ist ein Risiko, das man sichtbar machen muss, bevor es sich von selbst zeigt.',
        },
      ],
    },
  },
  {
    id: 'stimmen',
    name: 'Raum der Stimmen',
    claim: 'Digitalisierung scheitert selten an Funktionen. Sie scheitert an den Menschen, die man nicht mitgenommen hat.',
    clip: '/world/vid/leg7.mp4',
    still: '/world/still/leg7.jpg',
    scroll: 1.8,
    linger: 0.5,
    chamber: {
      loop: '/tree/vid/kammer3.mp4',
      poster: '/tree/still/kammer3.jpg',
      eyebrow: 'Kammer 03',
      hotspots: [
        {
          id: 'tisch',
          x: 45,
          y: 79,
          label: 'Der Tisch',
          title: '„Das haben wir immer so gemacht."',
          body: 'Der Satz ist kein Widerstand gegen Fortschritt. Er ist die kürzeste Zusammenfassung von zwanzig Jahren Erfahrung. Wer ihn wegdiskutiert, verliert die Person, die den Ablauf am besten kennt.',
        },
        {
          id: 'runde',
          x: 31,
          y: 74,
          label: 'Die Runde',
          title: 'Wer nicht gefragt wurde, macht nicht mit.',
          body: 'Beteiligung ist keine Höflichkeit, sondern die günstigste Versicherung, die es gibt. Zwei Stunden zuhören am Anfang sparen den halben Rollout am Ende.',
        },
        {
          id: 'echo',
          x: 50,
          y: 27,
          label: 'Die Lampe',
          title: 'Erklären ist kein Projektende.',
          body: 'Eine Einführung ist dann fertig, wenn niemand mehr fragt — nicht, wenn die Schulung stattgefunden hat.',
        },
      ],
    },
  },
  {
    id: 'datenregen',
    name: 'Datenregen',
    claim: 'Manche Probleme werden nicht gelöst. Sie werden nur jeden Tag neu aufgefangen.',
    clip: '/world/vid/leg5.mp4',
    still: '/world/still/leg5.jpg',
    scroll: 1.7,
    linger: 0.5,
    chamber: {
      loop: '/tree/vid/kammer4.mp4',
      poster: '/tree/still/kammer4.jpg',
      eyebrow: 'Kammer 04',
      hotspots: [
        {
          id: 'eimer',
          x: 44,
          y: 80,
          label: 'Die Schale',
          title: 'Auffangen ist keine Lösung. Es ist eine Gewohnheit.',
          body: 'Die tägliche Excel-Liste, die manuelle Übertragung, der Anruf „hast du schon" — das sind alles Eimer. Sie funktionieren. Deshalb fragt niemand, wo das Loch ist.',
        },
        {
          id: 'quelle',
          x: 36,
          y: 21,
          label: 'Die Quelle',
          title: 'Einmal an der Quelle statt jeden Tag am Boden.',
          body: 'Der Aufwand, ein Problem an seinem Ursprung zu beheben, ist fast immer kleiner als der Aufwand eines Jahres Auffangen. Er ist nur einmalig sichtbar — und deshalb schwerer zu bewilligen.',
        },
      ],
    },
  },
  {
    id: 'krone',
    name: 'Die Krone',
    claim: 'Digitalisierung heißt nicht, alles digital zu machen. Sondern das Richtige miteinander zu verbinden.',
    clip: '/world/vid/leg7.mp4',
    still: '/world/still/leg7.jpg',
    scroll: 2.0,
    linger: 0.35,
  },
]

/** Nur die Stationen, die wirklich eine Kammer haben. */
export const CHAMBERS = STATIONS.filter((s) => s.chamber)
