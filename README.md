# norman nerger — „Aus gewachsen wird vernetzt"

Eine Scroll-Journey-Site: ein durchgehender Weg von einem Grasfeld im Morgengrauen
zu einem leuchtenden Netzwerk bei Nacht. Die Sonne sinkt, während die Lichter, die
gebaut werden, sie ablösen — das ist die Digitalisierungs-Story als Bild.

```bash
npm run dev
```

→ http://localhost:5199 · `npm run build` erzeugt `dist/`

---

## Wie die Kamerafahrt funktioniert

Kein Video, keine 3D-Bibliothek. Die Welt liegt in echten 3D-Weltkoordinaten;
der Scrollstand bewegt eine **Kamera** auf einer festen Bahn hindurch. Jedes
Objekt wird pro Frame perspektivisch projiziert — Halme, Gerüste und Knoten
rauschen vorbei, weil man an ihnen vorbeifliegt, nicht weil sie animiert sind.

```
Scroll → progress (0..1) → lerp-Glättung (0.12) → cameraAt(p) → project() → Frame
```

| Datei | Rolle |
|---|---|
| `src/scene/camera.ts` | Flugbahn + Perspektivprojektion + Tiefendunst |
| `src/scene/sceneModel.ts` | Die Welt in 3D-Koordinaten (geseedet, immer identisch) |
| `src/scene/renderJourney.ts` | Zeichnet einen Frame. Der einzige Ort, der Pixel kennt |
| `src/scene/JourneyCanvas.tsx` | Fixed-Layer, rAF-Loop, Scroll→Progress, Glättung |
| `src/lib/palette.ts` | Der Farbbogen — die Erzählung als Daten |
| `src/lib/journeyProgress.ts` | Progress-Store außerhalb von React (60fps ≠ 60 Re-Renders) |

**Die Strecke** (Kamera-z, `z = -25 + p * 565`):

| Kamera-z | Progress | Akt | Was passiert |
|---|---|---|---|
| −25 … 110 | 0.00 – 0.24 | Das Feld | tief im Gras, warme Sonne voraus |
| 110 … 250 | 0.24 – 0.49 | Struktur | Gerüste rauschen links und rechts vorbei |
| 250 … 440 | 0.49 – 0.82 | Das Netz | Flug mitten durch das Knotenmesh |
| 440 … 540 | 0.82 – 1.00 | Horizont | das Feld ist zurückgeblieben |

Die Kamera bleibt die ersten 30 % tief im Gras (y ≈ −5.5) und steigt dann auf
y ≈ −81. Die Bahn ist zwei überlagerte Sinus in x — eine Kurve, keine Schiene.
Genau das macht den Unterschied zwischen Fahrt und Zoom.

**Zum Justieren:**

- **Flugbahn, Höhe, Kurve, Blickwinkel** → `cameraAt()` in `camera.ts`
- **Tempo/Streckenlänge** → `Z_START` / `Z_END` in `camera.ts`
- **Sichtweite und Dunst** → `FAR` und `fog()` in `camera.ts`
- **Wo was in der Welt steht** → `buildSceneModel()` in `sceneModel.ts`
- **Farben** → die `STOPS` in `palette.ts`, sonst nichts anfassen
- **Scrollweg pro Akt** → die `<Spacer />` (80vh) in `App.tsx`. Sie sind
  tragend, nicht dekorativ: mehr Spacer = langsamerer Flug.

Gemessen: 0.9 ms Median-Frametime (Budget für 60 fps sind 16.7 ms).

`prefers-reduced-motion` friert die Eigenbewegung ein (Wind, Drift, Puls), das
Scroll-Scrubbing bleibt.

---

## Noch zu erledigen

**Inhaltlich**

- [ ] **Porträtfoto** statt der `NN`-Monogramm-Kachel → `src/sections/Act1Feld.tsx`
- [ ] **Kalender-Link** statt `mailto:` → `src/sections/Act5Horizont.tsx`
- [ ] **E-Mail-Adresse** prüfen: aktuell steht die private Gmail-Adresse auf der
      Seite. Eine Domain-Adresse ist unauffälliger und sammelt weniger Spam.
- [ ] Zahlen/Referenzen: In `Act4Netz.tsx` stehen bewusst **keine** Prozentwerte
      oder Projektzahlen — dort gehören nur echte Werte aus echten Projekten hin.

**Rechtlich (Pflicht in Deutschland)**

- [ ] **Impressum** (§ 5 DDG) — Footer verlinkt bereits auf `/impressum`
- [ ] **Datenschutzerklärung** (DSGVO) — Footer verlinkt auf `/datenschutz`

Beide Seiten existieren noch nicht. Die Google-Fonts werden aktuell vom
Google-CDN geladen, was in der Datenschutzerklärung erwähnt werden muss — oder
man hostet Inter selbst und umgeht das Thema.

---

## Später: echte Video-Frames (scroll-world)

Die Engine ist bewusst quellen-agnostisch. Wenn scroll-world eines Tages Clips
erzeugt, ist der Umbau eine Zeile: In `JourneyCanvas.tsx` den `renderJourney(...)`-
Aufruf durch einen Blit des gecachten Frames bei `smoothed` ersetzen. Scroll-
Mapping, Glättung, DPR-Handling und Resize bleiben unverändert.
