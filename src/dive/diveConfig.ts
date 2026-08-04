/**
 * Die Unterwasserwelt — isometrische Nabe mit Tauchgängen.
 *
 * ============================================================================
 *  PROTOTYP. Ein Ort ist echt (die Kuppelhalle), die anderen drei sind als
 *  Punkte angelegt, aber noch ohne Clip — sie zeigen, wie die Welt aussieht,
 *  wenn sie fertig ist, und kosten nichts.
 * ============================================================================
 *
 * Warum diese Form:
 *
 *  - **Nichts ist versteckt.** Die ganze Welt liegt von der ersten Sekunde an
 *    sichtbar da. Man sieht alle Orte auf einmal und klickt den an, der einen
 *    interessiert. Genau das hat dem Baum gefehlt: Dort war die Nabe ein
 *    Tunnel, durch den man scrollte, und die Räume lagen dahinter im Dunkeln.
 *  - **Das Tempo liegt im Tauchgang.** Die Welt ruht, der Raum ruht — dazwischen
 *    liegt eine schnelle Kamerafahrt mit Bewegungsunschärfe. Der Kontrast macht
 *    die Geschwindigkeit erst spürbar.
 *  - **Unter Wasser gibt es keine Schwerkraftrichtung.** Alles schwebt und
 *    treibt. Genau die Bewegung, bei der eine Schleife nicht auffällt — anders
 *    als fallendes Papier oder Regen, die rückwärts sofort unsinnig aussehen.
 *
 * Die Schleifen sind **Kreuzblenden**, nicht Ping-Pong: Der Schwanz wird auf
 * den Kopf geblendet, dadurch behält jede Bewegung ihre Richtung.
 */

export type DiveHotspot = {
  id: string
  x: number
  y: number
  label: string
  title: string
  body: string
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
  /** Der Text, der unter der Schleife liegt, wenn man im Raum weiterscrollt. */
  page?: { lead: string; blocks: { title: string; body: string }[] }
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
      lead: 'Die häufigste Fehlannahme in gewachsenen Betrieben ist, dass ein Ablauf gut sein muss, weil er seit Jahren läuft. Läuft heißt nur: Es ist noch niemandem zu teuer geworden.',
      blocks: [
        {
          title: 'Woran man einen Ablauf erkennt, der nur noch läuft',
          body: 'Es gibt eine Person, ohne die er stehenbleibt. Es gibt mindestens einen Schritt, den niemand erklären kann. Und es gibt eine Liste, die jemand täglich pflegt, damit ein System mit einem anderen übereinstimmt. Jedes dieser drei Zeichen kostet Geld, das in keiner Auswertung auftaucht.',
        },
        {
          title: 'Was zuerst passiert',
          body: 'Sechs bis acht Wochen mitlaufen und aufschreiben, was tatsächlich geschieht — nicht, was im Organigramm steht. Erst danach wird entschieden, und zwar gemeinsam. Vorher fällt keine Entscheidung über Software.',
        },
        {
          title: 'Was am Ende bleibt',
          body: 'Ein Ablauf, den mehrere Menschen vollständig gehen können, dokumentiert von denen, die ihn gehen. Kein Handbuch, das niemand liest, sondern ein Weg, der auch dann funktioniert, wenn jemand ausfällt.',
        },
      ],
    },
  },
  // Noch nicht gerendert — die Punkte stehen, damit sichtbar ist, wie die
  // fertige Welt aussieht. Je Ort fehlen ein Tauchgang (~$0,35) und ein
  // Raum (~$0,71).
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
