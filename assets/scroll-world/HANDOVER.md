# scroll-world — Übergabestand

Stand: 04.08.2026 · Previz-Phase, Akt 1 gerendert

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
| 1 | Der Ast — Landung in der Kuhle, Netz aktiviert | 10 s ✅ gerendert |
| 1.5 | Sinkflug am Baum entlang, Wiesenflug, Grashalme digitalisieren, Schwenk hinter sie, Bürogebäude voraus | 10 s (geplant) |
| 2 | Strukturen — Fassaden-Scan, Anflug aufs offene Fenster | 8 s |
| 2.5 | Durchflug durchs Fenster, kurze Dunkelheit | 5 s |
| 3 | Menschen — Flug durchs Großraumbüro, Verbindungen zwischen Personen | 10 s |
| 4 | Prozesse — Landung auf Dokument, Prozessnetz über dem Tisch, kein Pull-back | 10 s |
| 4.5 | Ausflug durchs Lüftungsgitter, Dunkelheit, Durchbruch über die Stadt | 5 s |
| 5 | Netzwerk — Flug über die Stadt, Netz breitet sich selbst aus | 8 s |
| 6 | Horizont — Crane-up, Libelle setzt sich auf blühenden Ast. Pull-back hier erlaubt. | 10 s |

## Prompt-Bausteine (in JEDEM Prompt wortgleich)

**STIL**
> Stylised high-end 3D illustration, cinematic but deliberately not photorealistic. Deep violet and midnight-blue base, structures and light in royal and electric violet. Warm orange sunset light used only as backlight, rim light and highlights, never dominant. Soft bloom, volumetric haze, shallow depth of field, subtle film grain, calm slightly surreal atmosphere. Organic surfaces meet digital light structures. No comic look, no neon cyberpunk city, no text, no letters, no logos, no signage.

**LIBELLE** (ersetzt das Referenzbild — Seedance verbietet `reference_image` zusammen mit `first_frame`)
> a precision-engineered machine with a dark chrome and anodised violet segmented body, fine articulated legs, large faceted eyes, and two pairs of long transparent wings whose veining is a lattice of glowing violet nodes and lines, edges catching warm orange rim light - elegant, calm, constructed, never cute and never cartoonish. It draws a fine luminous violet trail behind it as it flies.

**KAMERAVERTRAG** (ans Ende jedes Prompts außer Akt 6)
> Single continuous camera move, no cuts. The camera follows the dragonfly, which leads the shot and stays visible throughout. The camera never pulls back and never loses the dragonfly. The shot ends with the dragonfly clearly in frame ahead of the camera, seen from behind, both settling into a slow steady forward drift.

Der vollständige Akt-1-Prompt liegt in `akt1-prompt.json`.

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
- `sfs /put` liefert `uploadUrl` auf der **obersten** Ebene der JSON, nicht unter `output`.
- PowerShell 5.1: `Get-Content`-Strings tragen unsichtbare Metadaten, die `ConvertTo-Json` als Objekt serialisiert → `[System.IO.File]::ReadAllLines` benutzen.
- JSON-Dateien **ohne BOM** schreiben (`UTF8Encoding($false)`), sonst lehnt die CLI sie ab.
- `monid runs get` kennt kein `-o`.
- `ratio` immer explizit setzen, sonst folgt das Video dem Seitenverhältnis des Eingangsbilds.

## Kosten

- 480p ≈ $0,067/s · 720p ≈ $0,151/s · 1080p ≈ $0,374/s
- Ausgegeben bisher: **~$1,92** · Guthaben: **~$24,08**
- Restlicher Previz: ~$4 · Final in 720p: ~$9

## Offen

- [ ] Akt 1.5 rendern (Wiesenflug), dann 2 + 2.5
- [ ] Texte pro Akt neu schreiben — seit „branchenneutral" und der Änderung von Akt 3 passt die alte Copy nicht mehr. Blockiert nichts, weil HTML.
- [ ] Engine einbauen: `references/scrub-engine.js` aus dem scroll-world-Plugin, Anbindung in `JourneyCanvas.tsx`
- [ ] Impressum + Datenschutzerklärung (siehe README)
