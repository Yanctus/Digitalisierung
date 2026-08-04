/**
 * Die Landeseite: was nach dem Film kommt.
 *
 * ============================================================================
 *  ACHTUNG — PLATZHALTER
 *  Projekte, Kennzahlen und Kontaktdaten unten sind erfunden. Sie zeigen die
 *  Form, nicht den Inhalt. Vor dem Livegang durch echte Projekte ersetzen —
 *  anonymisiert bleiben darf der Kunde, die Zahl darunter darf es nicht.
 * ============================================================================
 *
 * Die Bildwelt der Karten stammt bewusst aus den Standbildern des Films
 * (`/world/still/legN.jpg`): Die Seite bricht beim Landen nicht in eine andere
 * Ästhetik, sie bleibt in derselben Welt.
 */

export type ProjectFacet = { label: string; body: string }

export type Project = {
  id: string
  /** Anonymisierter Auftraggeber — Branche, Größe, so konkret wie erlaubt. */
  client: string
  year: string
  title: string
  /** Ein Satz, der das Ergebnis benennt. Steht in der zugeklappten Zeile. */
  lead: string
  /** Die harte Zahl. Wert und Bezeichnung getrennt, damit die Zahl groß stehen kann. */
  metric: { value: string; label: string }
  tags: string[]
  still: string
  /** Aufgeklappt: Ausgangslage → Vorgehen → Ergebnis. */
  facets: ProjectFacet[]
}

export const PROJECTS: Project[] = [
  {
    id: 'angebotsdurchlauf',
    client: 'Fertigungsbetrieb, 60 Mitarbeitende',
    year: '2024',
    title: 'Vom Ordner zum Ablauf',
    lead: 'Angebote lagen in vier Postfächern und einem Aktenschrank. Jetzt liegen sie in einem Ablauf.',
    metric: { value: '9 → 2', label: 'Tage bis zum Angebot' },
    tags: ['Prozessaufnahme', 'Angebotswesen', 'Schulung'],
    still: '/world/still/leg1.jpg',
    facets: [
      {
        label: 'Ausgangslage',
        body: 'Jede Anfrage lief über den Vertriebsleiter, weil nur er wusste, wo welche Kalkulation lag. Fiel er aus, stand das Angebotswesen. Die Abläufe waren gut — sie waren nur in einem Kopf.',
      },
      {
        label: 'Vorgehen',
        body: 'Sechs Wochen mitgelaufen und aufgeschrieben, was tatsächlich passiert, nicht was im Organigramm steht. Daraus ein Ablauf, der genau die vorhandenen Wege abbildet, nur sichtbar. Keine neue Software für den Anfang.',
      },
      {
        label: 'Ergebnis',
        body: 'Vier Mitarbeitende können den Weg heute vollständig gehen. Die Durchlaufzeit fiel von neun auf zwei Tage, ohne dass jemand schneller arbeiten musste.',
      },
    ],
  },
  {
    id: 'datenstand',
    client: 'Handwerksverbund, drei Standorte',
    year: '2025',
    title: 'Zwei Systeme, ein Datenstand',
    lead: 'Warenwirtschaft und Zeiterfassung wussten nichts voneinander. Beide durften bleiben.',
    metric: { value: '0', label: 'Doppelerfassungen pro Tag' },
    tags: ['Schnittstellen', 'Datenqualität'],
    still: '/world/still/leg2.jpg',
    facets: [
      {
        label: 'Ausgangslage',
        body: 'Jeder Auftrag wurde zweimal erfasst, einmal je System. Die Abweichungen zwischen beiden Ständen waren zur Normalität geworden — bis die Nachkalkulation nicht mehr stimmte.',
      },
      {
        label: 'Vorgehen',
        body: 'Statt einer Ablösung eine Verbindung: eine Schnittstelle zwischen den bestehenden Systemen, mit klar festgelegter führender Seite je Feld. Der Vorschlag, eines der beiden abzulösen, wurde bewusst verworfen — beide waren eingespielt.',
      },
      {
        label: 'Ergebnis',
        body: 'Die doppelte Erfassung ist entfallen, die Nachkalkulation stimmt wieder. Die Systeme sind dieselben geblieben.',
      },
    ],
  },
  {
    id: 'uebergabe',
    client: 'Familiengeführter Großhandel',
    year: '2023 – 2024',
    title: 'Die Übergabe, die gehalten hat',
    lead: 'Nach elf Monaten Begleitung übernahm das Team allein. Ein Jahr später läuft es unverändert.',
    metric: { value: '11', label: 'Monate Begleitung, dann Schluss' },
    tags: ['Change', 'Wissenstransfer', 'Betriebsübergabe'],
    still: '/world/still/leg6.jpg',
    facets: [
      {
        label: 'Ausgangslage',
        body: 'Die zweite Generation übernahm ein Haus, das über dreißig Jahre gewachsen war — mit Abläufen, die niemand erklären konnte, weil sie nie jemand erklären musste.',
      },
      {
        label: 'Vorgehen',
        body: 'Vom ersten Tag an auf das Ende hin gearbeitet: Jede Entscheidung wurde dokumentiert, jedes Werkzeug an eine Person im Haus übergeben. Der letzte Monat war reine Übergabe ohne eigene Eingriffe.',
      },
      {
        label: 'Ergebnis',
        body: 'Seit dem Abschluss gab es keinen Rückruf. Das ist der Maßstab, nicht die Zahl der Folgeaufträge.',
      },
    ],
  },
  {
    id: 'dokumentation',
    client: 'Sozialer Träger, 120 Mitarbeitende',
    year: '2025',
    title: 'Papier bleibt. Es weiß nur Bescheid.',
    lead: 'Die Dokumentation blieb dort, wo sie geführt wurde — sie wurde nur auswertbar.',
    metric: { value: '−40 %', label: 'Zeit für Dokumentation' },
    tags: ['Dokumentation', 'Akzeptanz', 'Auswertung'],
    still: '/world/still/leg4.jpg',
    facets: [
      {
        label: 'Ausgangslage',
        body: 'Zwei vorherige Anläufe zur Digitalisierung der Dokumentation waren am Widerstand der Teams gescheitert. Der dritte Anlauf startete entsprechend vorbelastet.',
      },
      {
        label: 'Vorgehen',
        body: 'Zuerst die Vorbehalte aufgenommen, statt sie zu überzeugen. Ergebnis: Der Papierbogen blieb als Erfassungsweg erhalten und wurde am Ende des Dienstes einmal erfasst. Kein Bruch im Arbeitsablauf, aber ein auswertbarer Datenstand.',
      },
      {
        label: 'Ergebnis',
        body: 'Die Dokumentationszeit sank um gut 40 Prozent. Entscheidend war nicht das Werkzeug, sondern dass niemand seine Arbeitsweise aufgeben musste.',
      },
    ],
  },
  {
    id: 'wissen',
    client: 'Automobilzulieferer, Produktion',
    year: '2026',
    title: 'Wissen, das nicht mit in Rente geht',
    lead: 'Drei Schichtleiter gingen innerhalb eines Jahres. Ihr Wissen blieb im Haus.',
    metric: { value: '3', label: 'Übergaben ohne Wissensverlust' },
    tags: ['Wissenssicherung', 'Nachfolge'],
    still: '/world/still/leg7.jpg',
    facets: [
      {
        label: 'Ausgangslage',
        body: 'Das Erfahrungswissen an den Anlagen war nirgends festgehalten. Was in dreißig Jahren an Sonderfällen gelernt wurde, stand in keinem Handbuch.',
      },
      {
        label: 'Vorgehen',
        body: 'Kein Wiki, das keiner pflegt. Stattdessen Übergabe entlang der echten Störfälle: Jeder Fall wurde beim Auftreten gemeinsam bearbeitet und dabei festgehalten — vom Nachfolger geschrieben, nicht vom Vorgänger.',
      },
      {
        label: 'Ergebnis',
        body: 'Alle drei Übergaben liefen ohne Produktionsausfall. Die Sammlung wächst weiter, weil sie im Arbeitsablauf entsteht und nicht daneben.',
      },
    ],
  },
]

/** PLATZHALTER — echte Zahlen einsetzen oder den Block streichen. */
export const STATS: { value: string; label: string; note: string }[] = [
  { value: '12', label: 'Jahre', note: 'in gewachsenen Strukturen' },
  { value: '40+', label: 'Umstellungen', note: 'begleitet, nicht verordnet' },
  { value: '0', label: 'Abhängigkeiten', note: 'die ich hinterlasse' },
  { value: '3', label: 'Wochen', note: 'bis zur ersten spürbaren Entlastung' },
]

/** PLATZHALTER — echte Adresse einsetzen. */
export const CONTACT = {
  eyebrow: 'Der nächste Schritt',
  title: 'Reden wir über das, was bei Ihnen schon da ist.',
  body: 'Ein erstes Gespräch kostet nichts und dauert eine Stunde. Danach wissen Sie, ob sich der Aufwand für Sie lohnt — auch wenn die Antwort nein lautet.',
  mail: 'norman.nerger@gmail.com',
  lines: ['Norman Nerger', 'Digitalisierungsbegleitung', 'Deutschland'],
}
