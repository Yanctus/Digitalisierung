# scroll-world — Übergabestand

Stand: 04.08.2026 · **Previz fertig (8 Legs, 71,3 s) · Website gebaut und lauffähig**

Die Unterhaltung selbst lässt sich nicht mitnehmen — dieses Dokument ersetzt sie.
Es enthält alle Entscheidungen, die fertigen Prompts und den Pipeline-Ablauf.

---

## Was gebaut wird

Eine durchgehende Kamerafahrt für norman-nerger.de: Eine mechanische Libelle
erkennt bestehende Strukturen und aktiviert ein Netz, das bereits da ist.
Leitsatz: **Aus Gewachsenem wird Vernetztes.**

Technik: **scroll-world** ist führend — vorgerendertes KI-Video, das per Scroll
gescrubbt wird. Der GSAP/Three.js-Ansatz aus dem ChatGPT-Prompt wurde verworfen.
Das bestehende React/TS/Vite-Repo bleibt; nur die Bildquelle wechselt.

## Feste Entscheidungen

| Thema | Entscheidung |
|---|---|
| Architektur | **A** — durchgehender Vorwärtsflug, jedes Leg startet aus dem echten letzten Frame des vorherigen. Keine Connectors. |
| Video-Backend | Monid, `bytedance /v1/video/seedance-2.0` |
| Previz | 480p, `ratio 16:9`, `generate_audio: false` |
| Final | 720p empfohlen (~$8) statt 1080p (~$20) — Reserve für Re-Rolls |
| Mobile | Später. Wäre eine zweite native 9:16-Kette, verdoppelt die Videokosten. |
| Farbwelt | Violett von Anfang an. Steigerung läuft über **Leuchtkraft**, nicht über Farbwechsel: mattes Violett → glühendes Violett. |
| Orange | Nur Gegenlicht, Rimlight, Highlights. Nie dominant. |
| Libelle | Mechanisch, dunkles Chrom, facettierte Augen, transparente Flügel mit violetter Aderung und orangen Spitzen. **Führt die Kamera.** |
| Wirkmechanik | Schweif trägt die Vernetzung; Augen-Scan nur kurz beim Landen. Kein Laserstrahl. |
| Grundprinzip | Nichts wird ersetzt. Ast, Blüten, Papier, Menschen bleiben sichtbar; das Licht legt sich darüber. Ast und Blüten werden **nicht** mechanisch. |
| Branche | Neutral. Keine lesbare Schrift in den Bildern (zerfließt im Video). |
| Akt 3 | „Menschen mitnehmen" — Akzeptanz schaffen, nicht Systemarchitektur. Menschen nur als Rücken, Silhouetten, Bokeh. |
| Akt 6 | Klammer: Libelle setzt sich wieder auf einen blühenden Ast, darunter die vernetzte Region. |
| Texte | Als HTML über dem Video (Engine liefert eyebrow/title/body/tags), **nie** ins Video rendern. |
| Scroll-Tempo | Hauptakte viel Scrollweg + `linger`; Durchflüge 2.5/4.5 kurzer Scrollweg. |

## Die zwei unverrückbaren Regeln

1. **Jedes Leg endet mit der Libelle im Bild, von hinten, im ruhigen Vorwärtsdrift.**
   Der Schlussframe ist der Startframe des nächsten Legs. Verlässt sie das Bild,
   ist die Kette tot. (Genau das ist am 03.08. einmal passiert.)
2. **Innerhalb eines Legs ist die Kamera frei** — Orbit, seitliches Vorbeiziehen,
   Frontalsicht. Es gibt keine Naht innerhalb eines Clips. Nur die letzte Sekunde
   muss zurück in die Verfolgungsposition.

## Aktstruktur

| Akt | Inhalt | Dauer |
|---|---|---|
| 1 | Der Ast — Landung in der Kuhle, Netz aktiviert | 5 s ✅ **auf 5 s gekürzt** |
| 1.5 | Abflug vom Ast, Abstieg am Stamm mit fortlaufender Digitalisierung, Rasen, Enthüllung des Bürogebäudes | 10 s ✅ gerendert |
| 2 | Scan aus der Distanz, Wiese vernetzen, Fassadennetz — Gebäude bleibt **dunkel** — Glas wird zu Licht und öffnet ein Tor | 10 s ✅ gerendert |
| 2.5 | Durch das Lichttor, kurz dunkel, dann **erwacht das Haus** (Lichtwelle), Menschen in Bewegung, Netz beginnt | 8 s ✅ gerendert |
| 3 | Anhalten, 360°-Umfahrt, Netz flutet den ganzen Raum und verbindet die Menschen | 10 s ✅ gerendert |
| 3.5 | Vorbeiflug, jemand wischt beiläufig nach ihr, sie weicht aus, landet auf Papierstapel | 8 s ✅ gerendert |
| 4 | **Finale I** — sie klappt auf, gibt das Netz frei, das Bild füllt sich mit Licht | 10 s ✅ gerendert |
| 5 | **Finale II** — Weißabgang, dann aus den Wolken über die vollständig vernetzte Stadt | 10 s ✅ gerendert |

**✅ PREVIZ-KETTE VOLLSTÄNDIG (04.08.2026).** Alle acht Legs gerendert und
aneinandergesetzt: `previz/GESAMT-previz.mp4`, **71,3 s**, 480p, 16:9.

**Struktur ab 04.08.2026 geändert.** Die ursprünglichen Akte 4 (Prozesse), 4.5
(Lüftungsgitter) und 6 (Rückkehr zum blühenden Ast) sind **entfallen**. Der Film
endet jetzt mit dem Aufklappen der Libelle und dem Flug über die vernetzte Stadt.
Die Klammer schließt sich damit nicht am selben Ast, sondern im Maßstab: von
**einem** Ast zur **ganzen** Region.

Gesamtlänge: 5 + 10 + 10 + 8 + 10 + 8 + 10 + 10 = **71 s**

## Prompt-Bausteine (in JEDEM Prompt wortgleich)

**STIL** (überarbeitet 04.08.2026 — die alte Fassung erzeugte zu fotorealistische Bilder)
> Stylised painterly 3D illustration with the graphic language of a hand-painted game world - bold silhouettes, simplified sculpted forms, soft painterly surfaces without fine photoreal texture detail, and strong contrast between deep shadow and glowing accent light. Never photorealistic and never live-action, but equally never comic or cartoon. Deep violet and midnight-blue base throughout, structures and light in royal and electric violet. Warm orange reserved for sunset light, backlight, rim light, highlights and the blossoms - present but never dominant. This violet-and-orange palette is present in every single frame including the very last one; the image never desaturates into grey, neutral blue or realistic daylight colour. Soft bloom, volumetric haze, shallow depth of field, subtle film grain, calm slightly surreal atmosphere. Organic surfaces meet digital light structures. No neon cyberpunk city, no text, no letters, no logos, no signage.

Referenz für die Bildsprache: **Hollow Knight, aber in 3D**. Formen lesen sich als
Silhouette, nicht als Textur.

**Positiv formulieren, nie verneinen.** Das ist die wichtigste Lehre der Session:
„not photorealistic" blieb wirkungslos, „simplified sculpted forms, soft painterly
surfaces" wirkte sofort. Dasselbe beim Flügelschlag — „never static" brachte nichts,
„beating in fast soft-blurred strokes" brachte den Schlag. Wenn ein Merkmal nicht
kommt: beschreiben, wie es aussehen *soll*, statt zu verbieten, was nicht sein darf.

**~~INNENRÄUME GEDÄMPFT~~ — VERWORFEN, war falsch**

Diese Regel stand kurzzeitig hier und hat vier Fehlversuche gekostet. Sie verlangte
dunkle Innenräume, um den Stil zu retten — aber Akt 2 zeigte von außen erleuchtete
Etagen, und ein dunkler Innenraum widerspricht dem sichtbar. **Kontinuität schlägt
Stilregel.**

Der eigentliche Denkfehler: Helligkeit und Stil wurden gleichgesetzt. Nicht die
Helligkeit zerstört den gemalten Look, sondern die **Flachheit**. Ein hell
beleuchteter Raum kann sehr wohl gemalt aussehen. Der Stilschutz gehört deshalb an
die **Form**, nicht an die Dunkelheit — im STIL-Block steht dafür jetzt
„light modelled in clear shapes rather than flat even illumination".

**HELLIGKEIT IMMER AUS DEM STARTFRAME ABLEITEN**
> Wie hell eine Szene sein muss, ergibt sich aus dem vorigen Leg, nicht aus dem
> Stilempfinden. Im Prompt ausdrücklich verankern, z. B. „exactly as bright as it
> looked through the glass from outside; the brightness never drops".

**STIL AM MOTIV VERANKERN, NICHT NUR OBEN IM BLOCK**
> Je stärker ein Motiv fotorealistische Vorbilder hat, desto näher muss der
> Stilsatz daran stehen. Ein Ast im Abendlicht ist formbar; ein Großraumbüro und
> erst recht **Menschen** haben überwältigend viele Stock-Vorbilder — dagegen
> kommt ein Stilsatz 1000 Zeichen weiter oben nicht an.
> Bei Menschen wirkte: „simplified graphic figures, sculpted in broad flat shapes
> and rim light, with no fine clothing detail, no hair detail and no facial
> features at all". Dazu hilft, den Raum **klein** zu halten — ein weiter Bürosaal
> ist von sich aus generisch.

**BEWEGUNG ALS HANDLUNG BENENNEN**
> „sitting at their desks", „standing in conversation" sind Zustände — die Figuren
> stehen dann wie ein Standbild. Es braucht konkrete Verben: „hands typing and
> sliding across keyboards, a head turning to look up, someone gesturing with both
> hands while speaking, one person walking slowly between the desks, a chair
> turning."

**GRÖSSEN AN DER LIBELLE MESSEN**
> „large", „wide enough", „with room to spare" ergaben dreimal eine Öffnung, die
> schmaler war als ihre Spannweite. Erst der Vergleich mit einem sichtbaren Objekt
> wirkte: „far wider and taller than her wingspan, several times as wide as the
> dragonfly, with a generous margin on both sides of her wings."

**KEINE VOLLE 360°-UMFAHRT — Modell hat kein Raumgedächtnis**
> Drei Versuche ($2,12) scheiterten: der Raum schrumpfte, der Eingang verschwand,
> die Libelle geriet hinter eine Person. Seedance hält **keine 3D-Geometrie** vor
> und erfindet jede Blickrichtung neu, die der Startframe nicht zeigt.
> Was half: eine auffällige **Landmarke** benennen, die sichtbar bleiben muss
> („the wide glowing violet doorway stays clearly visible in the far end wall").
> Was nicht half: „the background is thrown out of focus" — die Bokeh-Anweisung
> wurde ignoriert. Für künftige Legs: höchstens halbe Umfahrt, auf Raumseiten,
> die der Startframe zeigt.

**RICHTUNGEN ALS BILD BESCHREIBEN, NICHT ALS RICHTUNG**
> „the window swings open inwards" ergab zweimal ein nach außen aufschlagendes
> Fenster. Erst die Bildbeschreibung wirkte: „its pane rotates backwards away from
> the camera and disappears into the blackness of the room behind, so that from
> outside only a clean dark rectangular hole is left; the outer surface stays
> completely flat and unbroken."

**SONNENSTAND**
> Nie absolut festlegen, sondern **aus dem tatsächlichen Startframe ableiten** und
> im Prompt ausdrücklich beschreiben („low on the horizon to the right, behind the
> building; never moves or jumps sides"). Dazu immer die Schattenseite nennen,
> sonst leuchtet Seedance beide Seiten gleich und das Bild wirkt flach.

**SCHWEIF**
> Der Leuchtschweif ist **durchgehend** sichtbar, solange sie fliegt — auch in
> freier Luft ohne Oberfläche in der Nähe. Ohne diesen Satz zündet er nur nahe an
> Objekten und sie wirkt zwischendurch „ausgeschaltet".

**WIRKMECHANIK** (in jedem Prompt sinngemäß, 04.08.2026 präzisiert)
> Blüten, Gras und Pflanzen sind **von Anfang an da**. Sie werden nie erschaffen,
> sprießen nie und blühen nie auf. Das Einzige, was je *erscheint*, ist das
> violette Netz — und es **bleibt für immer**, es verblasst nie und geht nie aus,
> auch wenn sie weiterfliegt oder die Kamera weiterzieht.

Beides musste hart formuliert werden: Seedance ließ sonst Blumen aus dem Rasen
sprießen (Akt 1.5 v2) und ließ das Netz hinter ihr wieder ausgehen (v1–v3).

**LIBELLE** (ersetzt das Referenzbild — Seedance verbietet `reference_image` zusammen mit `first_frame`)
> a precision-engineered machine with a dark chrome and anodised violet segmented body, fine articulated legs, large faceted eyes, and two pairs of long transparent wings whose veining is a lattice of glowing violet nodes and lines, edges catching warm orange rim light - elegant, calm, constructed, never cute and never cartoonish. It draws a fine luminous violet trail behind it as it flies.

**KAMERAVERTRAG** (ans Ende jedes Prompts außer Akt 6)
> Single continuous camera move, no cuts. The camera follows the dragonfly, which leads the shot and stays visible throughout. The camera never pulls back and never loses the dragonfly. The shot ends with the dragonfly clearly in frame ahead of the camera, seen from behind, both settling into a slow steady forward drift.

Die vollständigen Prompts liegen in `akt1-prompt.json` und `akt15-prompt.json`.

**Achtung Prompt-Länge — teuer gelernt:** Ab etwa **4000 Zeichen verdrängen sich
Anweisungen gegenseitig.** Bei 4301 Zeichen ging die Farbpalette verloren, obwohl
sie unverändert im Prompt stand; bei 3798 Zeichen hielten Farbe *und* Netz-
Dauerhaftigkeit gleichzeitig. Wenn ein Merkmal kippt, das vorher saß: **kürzen,
nicht nachschärfen.** Zuerst die Anweisungen streichen, die über mehrere Renders
zuverlässig funktioniert haben.

**Geografie neu ab 04.08.2026:** Akt 1 wurde auf 5 s gekürzt und endet jetzt mit
der Libelle auf dem Ast (vorher: Reiseflughöhe über Waldkronen mit ferner Skyline —
von dort war kein Anschluss an Akt 2 möglich). Akt 1.5 führt am Stamm hinunter zum
Rasen und endet direkt vor dem Bürogebäude. Der ungekürzte Akt-1-Render liegt als
`previz/akt1-480p-full.mp4`. Wer weiterplant, schaut zuerst in den echten
Schlussframe, nicht in die Aktstruktur.

## Pipeline

Voraussetzungen auf dem neuen Rechner:
- Node + `npm install -g @monid-ai/cli@latest`
- **`monid keys add -k <key> -l main`** — der Schlüssel liegt nur lokal, nicht im Repo
- ffmpeg/ffprobe auf dem PATH

Ablauf pro Leg:
1. Letzten Frame des Vorgängers ziehen:
   `ffmpeg -sseof -0.12 -i legN.mp4 -frames:v 1 -q:v 2 legN_last.jpg`
2. Frame zu Monid hochladen: `sfs /put` → `Invoke-WebRequest -Method Put -InFile` → `sfs /cat` liefert die öffentliche URL (kostenlos)
3. Rendern: `monid run -p bytedance -e /v1/video/seedance-2.0 -f leg.json -w 900 -j`
4. `video_url` aus `output.content.video_url` sofort herunterladen (Link verfällt nach ~24 h)
5. Schlussframe prüfen: Libelle im Bild, von hinten, Vorwärtsdrift? Sonst neu rollen.

### Fallstricke (alle real aufgetreten)

- **`first_frame` + `reference_image` zusammen → Fehler.** Die Libelle kommt aus dem Text und aus der Kette.
- `sfs /put` liefert `uploadUrl` unter **`output.uploadUrl`** (CLI 0.1.6, geprüft 04.08.2026).
  Die frühere Notiz „oberste Ebene" war falsch bzw. ist überholt.
- `sfs` ist **kein** CLI-Subcommand, sondern ein Provider: `monid run -p sfs -e /put`.
- Die URL aus `sfs /cat` hält nur **1 Stunde** (`/put` dagegen bis zu 30 d per `ttl`).
  Vor einem Render notfalls neu `cat`-en.
- PowerShell 5.1: `Get-Content`-Strings tragen unsichtbare Metadaten, die `ConvertTo-Json` als Objekt serialisiert → `[System.IO.File]::ReadAllLines` benutzen.
- JSON-Dateien **ohne BOM** schreiben (`UTF8Encoding($false)`), sonst lehnt die CLI sie ab.
- `monid runs get` kennt kein `-o`.
- `ratio` immer explizit setzen, sonst folgt das Video dem Seitenverhältnis des Eingangsbilds.

## Kosten

- 480p ≈ $0,067/s · 720p ≈ $0,151/s · 1080p ≈ $0,374/s
- Ausgegeben bisher: **~$18,40** · Guthaben: **$8,05** (Stand 04.08.2026, Previz komplett)
- **24 Renders, davon 13 verworfen.** Die komplette Previz-Kette hat rund $16
  gekostet. Alle Ursachen der Fehlversuche stehen oben als Regeln — die nächste
  Session sollte mit deutlich weniger Anläufen auskommen.
- Ein 720p-Final der ganzen Kette (71 s) kostet ~$13 und passt **nicht** ins
  Restguthaben.
- Akt 2 brauchte 5 Anläufe, Akt 2.5 sechs. Die Ursachen stehen alle oben als Regeln.
  Ein bekannter Fallstrick: Die CLI kann beim Empfangen abstürzen („Unexpected token
  '<'"), obwohl der Lauf serverseitig fertig und **bezahlt** ist. Dann nicht neu
  rendern, sondern `monid runs list` und `monid runs get -r <id>` — das Video ist da.
- Ein 10-s-Leg in 480p kostet konstant **$0,706** — Abrechnung über Tokens
  ($7/1 Mio, ~100.858 Token), nicht über Sekunden. Die $/s oben sind Faustwerte.
- **Akt 1.5 brauchte 6 Anläufe** ($4,24). Die verworfenen Fassungen scheiterten an:
  Blackout mitten im Leg, zu weit von der Stadt, zu fotorealistisch, Netz ging
  hinter ihr wieder aus, Blumen sprossen aus dem Rasen. Alle Ursachen stehen jetzt
  als Regeln im Abschnitt Prompt-Bausteine — beim nächsten Akt sollten weniger
  Anläufe nötig sein.
- Restlicher Previz: ~$3 · Final in 720p: ~$9

## Offen

- [x] **Alle acht Previz-Legs gerendert** — Seeds: Akt 1 (aus 03.08.), 1.5 = 12531,
      2 = 86882, 2.5 = 64085, 3 = 73757, 3.5 = 88988, 4 = 98128, 5 = 69342
- [x] Gesamtfassung zusammengesetzt: `previz/GESAMT-previz.mp4`, 71,3 s

---

## Die Website (gebaut 04.08.2026)

Der Film **ist** die Seite: Scrollen treibt die Zeit, die Kamera fliegt wirklich.
Der frühere Canvas-Ansatz (`src/scene/`, `src/sections/`) ist abgelöst — die
Dateien liegen noch da, werden aber nicht mehr eingebunden.

| Datei | Aufgabe |
|---|---|
| `src/world/engine.ts` | Scrub-Engine, auf Architektur A zugeschnitten (keine Connectors) |
| `src/world/ScrollWorld.tsx` | Setzt alles zusammen, hält den Zustand |
| `src/world/worldConfig.ts` | Die acht Akte: Scrollweg, Linger, Copy |
| `src/world/TopNav.tsx` | Kopfzeile: Fortschrittsrahmen, Akt-Anzeige, Netz-Menü, Mobilmenü |
| `src/world/Portfolio.tsx` | Die Landeseite nach dem Film: Projekte, Zahlen, Kontakt |
| `src/world/portfolioConfig.ts` | Projekte/Zahlen/Kontakt — **derzeit Platzhalter** |
| `src/world/NetworkRail.tsx` | Navigation als wachsendes Netz |
| `src/world/IgnitionText.tsx` | Zündende Typografie |
| `src/world/TrailCursor.tsx` | Schweif am Mauszeiger |
| `src/world/world.css` | Palette und Layout des Films |
| `src/world/portfolio.css` | Layout der Landeseite |
| `public/world/vid/leg0–7.mp4` | Clips, fürs Scrubbing enkodiert (crf 20, `-g 8`, faststart, `-an`) |
| `public/world/still/leg0–7.jpg` | Poster, jeweils Frame 0 des Legs |

**Vier Techniken aus dem Skill, die nicht "vereinfacht" werden dürfen** — jede
davon behebt einen konkreten Ausfall (stehen als Kommentar in `engine.ts`):
Blob-Laden statt HTTP-Byte-Ranges, kein Seek während der Decoder noch arbeitet,
Standbild bleibt bis der Clip wirklich malt, iOS-Priming beim ersten Touch.

**Drei Gestaltungsideen**, die aus dem Film abgeleitet sind: die Navigation
wächst zum Netz, Überschriften werden buchstabenweise entzündet statt
eingeblendet (dieselbe Regel wie im Film — nichts entsteht, Licht legt sich nur
darüber), der Mauszeiger zieht den Schweif der Libelle.

### Die Landung (gebaut 04.08.2026, zweiter Durchgang)

Der Film endet nicht mehr, er **übergibt**. Nach dem letzten Leg folgt eine
Viewport-Höhe Auslauf, und über genau diese Strecke schiebt sich die Landeseite
unter dem Film hervor, während Bühne, Copy und Schiene abblenden. Die Größe
dafür ist `landed` (0..1) aus der Engine; alles hängt an ihr.

Damit das geht, gehört die Scrollstrecke (`.w-track`) jetzt **React**, nicht
mehr der Engine — sie wird als Ref hineingereicht. Vorher hängte die Engine sie
selbst ans Ende von `.w-root`, dann läge jede Seite danach im DOM *darüber*.

Der obere Rand der Landeseite ist bewusst durchsichtig: Der letzte Frame (die
vernetzte Stadt) trägt noch, erst nach gut einer halben Bildschirmhöhe hat die
Seite übernommen. Die Projektbilder sind Standbilder aus dem Film — die Seite
bleibt in derselben Welt.

**Die Inhalte sind Platzhalter.** Projekte, Kennzahlen und Kontakt in
`portfolioConfig.ts` sind erfunden und zeigen nur die Form. Ersetzen, bevor
irgendetwas live geht.

### Fallstricke beim Bau (alle real aufgetreten)

- `Math.max/min` reichen **NaN durch** → `clamp` muss NaN-fest sein, sonst
  landen `NaN` in CSS-Werten.
- Zerlegt man Text in `inline-block`-Spans, **verschwinden die Wortabstände**.
  Ein CSS-`margin` repariert nur die Optik — `textContent` und damit Kopieren,
  Suchen und Screenreader bleiben kaputt. Es braucht **echte Leerzeichen im DOM**.
- Das globale `scroll-behavior: smooth` aus `src/index.css` **kollidiert mit dem
  Scrubbing**. `world.css` setzt es auf `auto` zurück; weiches Scrollen macht die
  Engine gezielt bei den Rail-Sprüngen.
- Der Browser stellt beim Neuladen die Scrollposition wieder her → man landet
  mitten im Film. Die Engine setzt `history.scrollRestoration = 'manual'`.
- Der erste Akt muss **beim Laden von selbst zünden**, sonst steht die
  Hauptüberschrift auf der Startansicht gedämpft da.
- Wird die Seite in einem Fenster **ohne Höhe** eingehängt (verstecktes Tab,
  nicht gezeichnetes Vorschaupanel), ist `innerHeight` beim ersten Layout 0 und
  die Scrollstrecke bleibt auf 0 stehen: kein Film, die Landeseite steht direkt
  oben. Ein `resize` kommt in dem Fall nicht zuverlässig — die Engine hängt
  deshalb zusätzlich einen `ResizeObserver` an `documentElement`.
- Ein aufklappbares Panel über `grid-template-rows: 0fr → 1fr` faltet sein
  **padding nicht mit**: Der zugeklappte Zustand bleibt genau um diesen Betrag
  offen stehen. Der Abstand muss als `margin` der Kinder kommen.
- Alles mit `data-reveal` startet unsichtbar. Fehlt der `IntersectionObserver`,
  bliebe die halbe Seite leer — dieser Fall setzt alles sofort sichtbar.
- Die Clips sind stellenweise sehr hell (Lichttor, Flutung) → Abdunkelungsverlauf
  und Textschatten mussten deutlich kräftiger als üblich ausfallen, hochkant noch
  stärker als am Desktop.

### Offen an der Website

- [ ] **Video liegt in 480p** (24 MB gesamt). Auf großen Displays sichtbar.
      720p-Final der Kette ≈ $13, Guthaben $8,05 — reicht nicht.
- [ ] **Keine nativen Mobilclips.** Die Skill sieht dafür eine zweite, hochkant
      gerenderte 9:16-Kette vor (`clipMobile`). Aktuell wird der Querformat-Clip
      mittig beschnitten — funktioniert, weil die Libelle zentral bleibt, ist
      aber nicht dasselbe. Verdoppelt die Videokosten.
- [x] **CTA-Ziele zeigen ins Leere** — erledigt: `#projekte` und `#kontakt`
      liegen jetzt auf der Landeseite. `#vorgehen` ist entfallen; der Film
      *ist* das Vorgehen.
- [ ] **Projekte, Zahlen und Kontakt sind Platzhalter** (`portfolioConfig.ts`).
- [ ] **Visuelle Abnahme der Landeseite steht aus.** Struktur, Aufklappen,
      Mobilmenü und die Landungsrechnung sind geprüft; wie es *aussieht*, hat
      noch niemand gesehen — beim Bau war kein sichtbarer Browser verfügbar.
- [ ] Impressum + Datenschutzerklärung. Der Fuß verlinkt bereits auf
      `/impressum` und `/datenschutz` — die Seiten fehlen noch.

### Was als Nächstes ansteht

- [ ] **Nähte im Fluss prüfen.** Jeder Schlussframe wurde einzeln kontrolliert, die
      Übergänge aber nie am Stück im Zusammenhang. Besonders anschauen: der
      Weißabgang zwischen Akt 4 und 5 — er ist der einzige Übergang, der nicht
      frame-identisch ist, sondern über die Helligkeit trägt.
- [ ] **Entscheidung Final-Qualität.** 720p für die ganze Kette kostet ~$13, das
      Guthaben liegt bei **$8,05**. Entweder nachladen oder bei 480p bleiben. Für
      eine gescrubbte Scroll-Seite ist 480p vertretbar, auf großen Displays sichtbar.
- [x] **Engine einbauen** — erledigt, siehe Abschnitt „Die Website". Nicht die
      Skill-Datei kopiert, sondern deren Techniken in `src/world/engine.ts`
      portiert: die Skill-Engine hat keine API (kein Rückgabewert, keine
      Callbacks), die Gestaltungsideen brauchen aber Zugriff auf den Fortschritt.
- [x] **Texte pro Akt neu geschrieben** — acht Akte, in `src/world/worldConfig.ts`
- [ ] Impressum + Datenschutzerklärung (siehe README)
- [ ] Texte pro Akt neu schreiben — seit „branchenneutral" und der Änderung von Akt 3 passt die alte Copy nicht mehr. Blockiert nichts, weil HTML.
- [ ] Engine einbauen: `references/scrub-engine.js` aus dem scroll-world-Plugin, Anbindung in `JourneyCanvas.tsx`
- [ ] Impressum + Datenschutzerklärung (siehe README)
