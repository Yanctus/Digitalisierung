# Produktion — Riff (Hub and Spoke)

**Keine lineare Scroll-World-Kette.** Eine feste isometrische Hauptwelt, fünf
unabhängig wählbare Orte. Jeder Weg beginnt in derselben Hauptwelt und endet in
exakt derselben Hauptwelt. Es gibt **keine** Connector-Clips zwischen Orten.

## Generierungsstopp

Vor jeder kostenpflichtigen Generierung wird vorgelegt:
geplante Dateien · Modell · Auflösung und Länge · geschätzte Kosten ·
Prüfung des Bestands. **Erst nach Freigabe wird generiert.**
Maximal ein technisch begründeter Retry. Danach: Job stoppen, dokumentieren.

## Struktur

| Pfad | Inhalt |
|---|---|
| `global-style.md` | Unveränderlicher Stilblock. Wird nicht umgeschrieben. |
| `scenes/*.md` | Kurzer Szenenblock je Clip. Sonst nichts. |
| `monid-config.json` | Geprüftes Schema, gewählte Variante, Regeln. |
| `ledger.json` | Ein Eintrag je Generierung. Vorher hier suchen. |
| `masters/` | Masterbilder (Frame-Lock-Referenzen). |
| `out/` | Rohausgaben der Generierungen. |

## Frame-Lock

Jeder Ort hat ein verbindliches Innenraum-Masterbild. Dasselbe Bild ist:
Endframe des IN-Videos · Poster des Kapitels · Startframe des CHAPTER-Videos.

Nach jeder Generierung: erstes und letztes Frame mit ffmpeg ziehen, mit den
Masterframes vergleichen, Übergang lokal testen. **Erst dann** weiter.
Kleine Abweichung → Crossfade. Nur sichtbare Geometrieänderung rechtfertigt
eine Neugenerierung.

## Kein Rochen im Video

Der Splitterrochen steht in den Negativvorgaben. Er ist eine Webebene (GSAP
MotionPath) über dem Video. Nur so funktioniert der Rückwärtsflug beim
Auftauchen, ohne dass ein Charakter rückwärts schwimmt.

## Keine OUT-Videos

Auftauchen = das IN-Video rückwärts. Fertig umgekehrte Datei via ffmpeg,
nicht rückwärts abgespielt im Browser.

## Jeder Ort braucht sein eigenes Leitmotiv

Real passiert: Kuppelhalle und Tangwald bekamen beide „a single warm orange
lantern" in die Mitte, weil die Szenenbeschreibung kopiert wurde. Nebeneinander
wirkt das repetitiv — es sieht aus wie derselbe Raum in anderer Farbe.

**Vergeben:**

| Ort | Leitmotiv in der Bildmitte |
|---|---|
| Kuppelhalle | Laterne auf dem Boden |
| Tangwald | Laterne auf dem Boden ⚠ Dublette |

**Frei zu vergeben** (Vorschläge): eine glühende Spalte im Rumpf, ein
Lichtschacht von oben, ein einzelnes großes Zahnrad, ein Schwarm stehender
Lichtpunkte, eine offene Truhe, eine aufsteigende Blasensäule.

**Regel:** Vor jedem neuen Szenenblock in diese Tabelle schauen. Das Motiv in
der Bildmitte darf sich nicht wiederholen — es ist das, was der Besucher als
„der Raum" erinnert.

## Klickpunkte auf Bewegtem: messen, nicht schätzen

Sitzt ein Punkt auf etwas, das sich bewegt, taugt der Masterframe nicht als
Vorlage — das Video verschiebt die Komposition, und das Objekt wandert
zusätzlich. Real passiert: Die Ankerkette im Wrack wurde auf Amplitude 1,8
geschätzt, gemessen waren es 4,1.

**Verfahren** (kostet nichts, dauert eine Minute):

```bash
# Vier Zeitpunkte, jeweils das Band um die Punkthöhe, untereinander gestapelt
for i in 0 1 2 3; do
  T=$(python -c "print(f'{DAUER*$i/4:.3f}')")
  ffmpeg -y -ss $T -i loop.mp4 -frames:v 1 \
    -vf "crop=iw:ih*0.10:0:ih*0.30,scale=1100:-1" band$i.png
done
ffmpeg -y -i band0.png -i band1.png -i band2.png -i band3.png \
  -filter_complex "[0][1][2][3]vstack=inputs=4,drawgrid=w=iw/20:h=ih:c=yellow" kette.png
```

Aus den vier Positionen ergeben sich Mitte, Amplitude und Phase. Die Engine
rechnet `links = x + sin(2π·t/T·k + φ·2π)·ax` — für einen Kosinusverlauf ist
`φ = 0,25 + Versatz`.
