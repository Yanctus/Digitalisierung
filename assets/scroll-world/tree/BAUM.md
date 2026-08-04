# Der Baum — begehbare Welt (Prototyp)

Stand: 04.08.2026 · Mechanik steht, vier echte Kammern gerendert, Stamm noch Platzhalter.
Erreichbar unter `/#baum`. Die Reise unter `/` ist unangetastet.

## Das Prinzip

**Scrollen und Klicken machen zwei verschiedene Dinge.**

- **Scrollen** = hoch durch den Stamm. Eine Achse, Wurzeln → Krone. Läuft auf
  derselben Scrub-Engine wie die Kamerafahrt (`src/world/engine.ts`), sie nimmt
  beliebige Legs.
- **Klicken** = seitwärts in eine Kammer. Stehende Kamera, Endlosschleife,
  anklickbare Stellen.

Wer nur scrollt, bekommt trotzdem den ganzen Pitch: An jeder Kammermündung hält
die Kamera an (`linger`) und der `claim` sagt den einen Satz. **Nichts Wichtiges
liegt hinter einem Klick.** Die Kammern sind Tiefe, keine Bedingung.

Erster Durchgang ist eine Geschichte, jeder danach ist eine Karte — die Schiene
links springt direkt in jede Station.

## Dateien

| Datei | Aufgabe |
|---|---|
| `src/tree/treeConfig.ts` | Stationen, Kammern, Klickpunkte, Texte |
| `src/tree/TreeWorld.tsx` | Stamm, Karte, Mündungen, Zustand |
| `src/tree/Chamber.tsx` | Die Kammer: Schleife, Klickpunkte, Panel |
| `src/tree/tree.css` | Layout |
| `src/App.tsx` | `/#baum` → Baum, sonst Reise |
| `assets/scroll-world/tree/*.json` | Die vier Kammer-Prompts |
| `assets/scroll-world/tree/raw/` | Die Renders im Original (10 s, nicht geschleift) |
| `public/tree/vid/kammer1–4.mp4` | Ping-Pong-Schleifen (20 s), fertig fürs Web |

## Die vier Kammern

Gerendert 04.08.2026, Seedance 2.0 über Monid, **480p · 16:9 · 10 s ·
$0,706 je Clip · $2,824 gesamt**. Alle vier saßen im **ersten Anlauf** — kein
einziger verworfener Render.

| Kammer | Seed | Aussage |
|---|---|---|
| 01 Papierregen | 87390 | Informationen sind da. Nur nicht dort, wo sie gebraucht werden. |
| 02 Analoges Uhrwerk | 5845 | Ein funktionierender Prozess ist nicht automatisch ein guter. |
| 03 Raum der Stimmen | 93402 | Digitalisierung scheitert an den Menschen, die man nicht mitgenommen hat. |
| 04 Datenregen | 60596 | Manche Probleme werden nicht gelöst, nur täglich neu aufgefangen. |

## Die Prompt-Regeln für Kammern

Sie sind das **Gegenteil** der Regeln für die Kamerafahrt. Der STIL-Block bleibt
wortgleich, alles danach kehrt sich um:

**KAMERAVERTRAG (steht am Ende jedes Kammer-Prompts)**
> COMPOSITION: a wide interior stage seen straight on. The important objects sit
> in the central and lower middle band of the frame; the upper left quarter and
> the right third stay calm and uncluttered. CAMERA: the camera is locked on a
> tripod for the entire shot - no pan, no tilt, no dolly, no zoom, no orbit, no
> handheld drift. The framing of the last frame is identical to the framing of
> the first frame. Only the contents of the scene move, and they drift, float,
> turn and pulse continuously without any clear direction of travel.

Drei Dinge stecken darin, jedes aus einem konkreten Grund:

1. **„locked on a tripod"** — ohne das wandern die Klickpunkte, denn sie liegen
   in Prozent des Bildes. Nachgemessen: erster gegen letzten Frame 25,7–33,0 dB,
   die Abweichung ist ausschließlich der bewegte Inhalt. Hat auf Anhieb gesessen.
2. **„central and lower middle band"** — der Kopftext liegt oben links, das
   Panel deckt das rechte Drittel. Die Bühne ist das mittlere untere Band.
   Diese Erkenntnis stammt aus dem Prototyp, nicht aus der Theorie.
3. **„without any clear direction of travel"** — nur dann ist das Ping-Pong
   unsichtbar. Bei gerichteter Bewegung (jemand geht, ein Rad dreht in eine
   Richtung) sieht man das Zurücklaufen sofort.

Ergänzend gilt weiter die alte Lehre: **positiv formulieren, nie verneinen**,
und bei Menschen den Stilsatz direkt ans Motiv hängen („simplified graphic
figures, sculpted in broad flat shapes and rim light, no facial features at
all") — das hat Kammer 03 auf Anhieb getragen.

Prompt-Länge lag bei 1720–1790 Zeichen, weit unter der 4000er-Grenze, ab der
sich Anweisungen gegenseitig verdrängen.

## Die Endlosschleife

Kein JavaScript. Der Clip wird mit ffmpeg zu sich selbst rückwärts gehängt —
danach genügt `loop` am Video-Element und die Schleife ist von Natur aus nahtlos:

```
ffmpeg -i in.mp4 -filter_complex \
  "[0]split[a][b];[b]reverse,trim=start_frame=1,setpts=PTS-STARTPTS[r];[a][r]concat=n=2:v=1[out]" \
  -map "[out]" -an -c:v libx264 -preset slow -crf 24 -pix_fmt yuv420p -g 48 -movflags +faststart out.mp4
```

Aus 10 s werden 20 s, aus ~1,4 MB werden ~1,7 MB. Der Trick ersetzt einen
zweiten Render pro Kammer — **Nachbearbeitung löst die Schleife, nicht die
Einstellung.**

## Fallstricke (alle real aufgetreten)

- **`overflow: hidden` am Body hält die Scrollposition nicht.** Im Test ist sie
  trotzdem gewandert, auf iOS ist die Sperre ohnehin undicht. Da das Versprechen
  der Welt lautet „du kommst genau dort wieder raus, wo du reingegangen bist",
  wird die Position beim Eintritt gemerkt und beim Verlassen gesetzt. Die Sperre
  bleibt zusätzlich — sie verhindert das Zappeln währenddessen.
- **Der Ausgang lag unter dem Panel.** Bei offenem Text rückt er nach links.
- **Die Klickpunkte gehören ins Videobild, nicht ins Fenster.** `.t-cham__frame`
  hat das Seitenverhältnis des Clips und ist per CSS auf „cover" gerechnet; die
  Punkte sitzen in Prozent davon. Ohne das verrutschen sie bei jedem anderen
  Fensterformat, weil das Bild beschnitten wird.
- **Klickpunkte erst nach dem Render setzen.** Wo etwas Anklickbares steht, weiß
  man vorher nicht — auch die Beschriftungen wurden danach angepasst (aus „Die
  Tür" wurde „Die Runde", weil keine Tür im Bild ist).

## Werkzeug-Fallstricke auf diesem Rechner

- **`monid` läuft nur einzeln.** Drei gleichzeitige Läufe lieferten JSON ohne
  `runId` und starteten gar nicht erst — nichts wurde berechnet (am Guthaben
  geprüft), aber es kostet Zeit. Nacheinander rendern.
- **PowerShell schreibt beim Umleiten ein BOM.** `monid ... -j > run.json` und
  dann `json.load` scheitert. Mit `encoding='utf-8-sig'` lesen.
- **`/tmp` existiert in der Bash dieses Rechners nicht.** Umleitungen dorthin
  landen im Nichts. Den Scratchpad-Pfad nehmen.
- **Pythons `urllib` scheitert an der Zertifikatsprüfung** („Basic Constraints
  of CA cert not marked critical"). Zum Herunterladen `curl -sL` benutzen.
- Python aus der Git-Bash ist das **Windows**-Python — es braucht Windows-Pfade,
  keine `/c/...`-Pfade.

## Was als Nächstes ansteht

- [ ] **Der Stamm ist noch Platzhalter** — er läuft auf den Clips der
      Kamerafahrt. Fünf eigene Legs (Wurzeln → Krone) wären ~$3,50 in 480p.
- [ ] **Eintrittsclips.** Aktuell blendet die Kammer aus dem Stammbild auf. Mit
      Eintrittsclip *geht* man hinein, ohne *erscheint* man. Vier Clips ≈ $2,80.
      Erst im Prototyp anschauen, ob man sie vermisst.
- [ ] **Ton.** Ein Raum mit stehender Kamera lebt vom Geräusch mehr als vom
      Bild. Kostet kein Rendergeld (`generate_audio: false` bleibt richtig, der
      Ton kommt als eigene Schleife).
- [ ] **Die Krone als Auflösung** — bisher eine Station ohne Kammer. Dort gehört
      hin, was der Besucher angezündet hat, plus Kontakt.
- [ ] Hochkant ist noch nie jemand durchgelaufen.
