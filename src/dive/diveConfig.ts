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
  /**
   * Mitschwingen mit dem Bild.
   *
   * Sitzt ein Punkt auf etwas Bewegtem — einem Tanghalm, einer Kette —, dann
   * klebt er ohne das daneben. Es gibt keine Trackingdaten in einem fertigen
   * Video, aber die Schleife ist **periodisch**: Sie beginnt und endet auf
   * demselben Bild. Deshalb genügt eine Sinusbewegung, die an die Laufzeit der
   * Schleife gekoppelt ist. Eine Periode je Durchlauf, Amplitude in
   * Prozentpunkten, `phase` in Umdrehungen (0..1) zum Ausrichten.
   */
  sway?: { x?: number; y?: number; phase?: number; periods?: number }
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
    // NICHT auf der Kuppel: Der Einflug fliegt durch sie hindurch, der Punkt
    // gehoert dahinter — in die Luecke zwischen den beiden Felsen.
    x: 48,
    y: 24,
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
    x: 15,
    y: 30,
    name: 'Der Tangwald',
    claim: 'Informationen sind vorhanden. Aber nicht dort, wo sie gebraucht werden.',
    dive: '/dive/vid/tang-in.mp4',
    rise: '/dive/vid/tang-out.mp4',
    room: '/dive/vid/tangwald.mp4',
    poster: '/dive/still/tangwald.jpg',
    hotspots: [
      {
        id: 'kiste',
        x: 63,
        y: 84,
        label: 'Die Kiste',
        title: 'Jede Kiste hat mal jemand sinnvoll hingestellt.',
        body: 'Was heute im Weg liegt, war einmal die Lösung für ein echtes Problem. Deshalb wird hier nichts weggeräumt, bevor nicht klar ist, wofür es einmal da war — und ob dieser Grund noch gilt.',
      },
      {
        id: 'laterne',
        x: 50,
        y: 88,
        label: 'Die Laterne',
        title: 'Man findet nur, wovon man weiß, dass es existiert.',
        body: 'Die häufigste Antwort auf „wo liegt das?" ist nicht „weiß ich nicht", sondern „das haben wir doch gar nicht". Der erste Schritt ist deshalb kein Suchsystem, sondern eine Liste dessen, was überhaupt da ist.',
      },
      {
        id: 'gasse',
        x: 47,
        y: 40,
        // Sitzt zwischen den wiegenden Halmen und schwingt deshalb mit.
        sway: { x: 1.4, y: 0.6, phase: 0.1 },
        label: 'Die Gasse',
        title: 'Wege entstehen dort, wo jemand oft geht.',
        body: 'Diese Gasse hat niemand geplant, sie ist entstanden. Genauso funktionieren gewachsene Abläufe — und genau deshalb verrät die tatsächlich benutzte Route mehr über ein Unternehmen als jedes Prozessdiagramm.',
      },
    ],
    page: {
      lead: 'In gewachsenen Betrieben ist Wissen selten verloren. Es ist verstreut: im Ordner, im Postfach, im Kopf von drei Leuten — und in der einen Excel-Liste, die jemand seit Jahren nebenbei pflegt.',
      blocks: [
        {
          title: 'Warum Suchen so teuer ist',
          body: 'Nicht die Minuten am Bildschirm kosten. Teuer wird die Rückfrage, die jemand anderen aus seiner Arbeit reißt, und die Entscheidung, die auf einem Stand von vorgestern getroffen wird, weil der aktuelle nicht auffindbar war.',
        },
        {
          title: 'Was zuerst passiert',
          body: 'Eine Bestandsaufnahme dessen, was tatsächlich existiert und wer es führt. Ohne Werkzeugentscheidung. In den meisten Häusern ist allein diese Liste schon die halbe Wirkung — weil zum ersten Mal alle dasselbe sehen.',
        },
        {
          title: 'Was am Ende bleibt',
          body: 'Ein Ort je Sache, und eine Person, die dafür geradesteht. Kein neues System, das neben die alten tritt, sondern eine Entscheidung darüber, was wo hingehört — und die Disziplin, sie einzuhalten.',
        },
      ],
    },
  },
  {
    id: 'wrack',
    // Auf die erleuchtete Luke im Rumpf — da geht man hinein.
    x: 84,
    y: 27,
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
