# GLOBAL STYLE — unveränderlich

**Diese Datei wird zwischen Generierungen nicht verändert.** Nicht umformuliert,
nicht „verbessert", nicht gekürzt. Jede Änderung ist eine bewusste Entscheidung
und braucht eine neue Versionsnummer sowie einen Eintrag im Ledger.

Version: `1.0` · angelegt 05.08.2026

---

## STYLE_BLOCK (wortgleich in jeden Prompt)

```
Stylised painterly 3D illustration with the graphic language of a hand-painted game world - bold silhouettes, simplified sculpted forms, soft painterly surfaces without fine photoreal texture detail, and strong contrast between deep shadow and glowing accent light. Deep violet, indigo and midnight blue as the base of every frame. Structures, coral, kelp and architecture are built from grown organic forms with fine glowing violet nodes running through them. Warm luminous orange appears only as flowing energy - light travelling along paths, seams and connections, plus lantern light, rim light and backlight. Orange is always a line or a glow, never a surface. Underwater: drifting particles, soft god rays falling from far above, volumetric haze, soft bloom, subtle film grain, calm slightly surreal atmosphere. No text, no letters, no logos, no signage, no user interface elements.
```

## IMAGE_STYLE (kompakte Fassung — nur für Masterbilder)

Minimax begrenzt den Prompt auf **1500 Zeichen**. Der volle STYLE_BLOCK plus
Szene passt dort nicht hinein. Diese Fassung ist keine Neuformulierung, sondern
eine Kürzung mit **denselben verbindlichen Begriffen** aus der Farbwelt-Tabelle:

```
Stylised painterly 3D illustration, hand-painted game world: bold silhouettes, simplified sculpted forms, soft painterly surfaces, strong contrast between deep shadow and glowing accent light. Deep violet, indigo and midnight blue base. Grown organic structures with fine glowing violet nodes. Warm luminous orange only as flowing energy along paths and seams, plus lantern and rim light - always a line or a glow, never a surface. Underwater: drifting particles, god rays from far above, volumetric haze, soft bloom. Cinematic lighting, clean readable silhouettes. No text, no letters, no logos, no signage, no creatures or fish.
```

**`prompt_optimizer` muss `false` sein.** Sonst schreibt Minimax den Stil um —
genau das, was die Regel „kein kreatives Umschreiben bestehender
Stildefinitionen" verbietet.

## NEGATIVE_CONSTRAINTS (wortgleich)

```
No text of any kind. No characters, creatures, fish or rays in the frame. No lens flares from the camera. No neon cyberpunk look. No photoreal skin or fabric detail. No visible cuts, no fades to black, no title cards.
```

Der Splitterrochen ist **niemals** im Video. Er ist eine Webebene über dem
Video. Deshalb steht er in den Negativvorgaben — sonst brennt ihn das Modell
ein und der Rückwärtsflug zeigt einen rückwärts schwimmenden Rochen.

## CAMERA_LOCK (für Masterbilder und stehende Aufnahmen)

```
The camera is locked on a tripod for the entire shot - no pan, no tilt, no dolly, no zoom, no orbit, no handheld drift. The framing of the last frame is identical to the framing of the first frame. Only the contents of the scene move.
```

## FRAME_CONSTRAINTS (für IN-Videos)

```
Single continuous camera move, no cuts. The shot begins exactly on the supplied first frame and ends exactly on the supplied last frame, matching its framing, its architecture and its light. Nothing new is built or added along the way; the camera only travels through what is already there.
```

## KOMPOSITIONSREGEL (aus dem Prototyp gelernt)

```
COMPOSITION: the important objects sit in the central and lower middle band of the frame; the upper left quarter and the right third stay calm and uncluttered.
```

Grund: Der Kopftext liegt oben links, das Textpanel deckt das rechte Drittel.
Die nutzbare Bühne ist das mittlere untere Band.

## FARBWELT (verbindliche Begriffe — nie synonym ersetzen)

| Rolle | Begriff im Prompt |
|---|---|
| Grundton | `deep violet, indigo and midnight blue` |
| Struktur | `fine glowing violet nodes` |
| Energie | `warm luminous orange travelling along paths and seams` |
| Licht von oben | `soft god rays falling from far above` |
| Luft | `drifting particles, volumetric haze` |

## QUALITÄTSSTUFE

`highly detailed painterly illustration, cinematic lighting, clean readable silhouettes`

## PROMPT-ZUSAMMENSETZUNG

Der finale Prompt wird programmatisch gebaut, nie von Hand geschrieben:

```
STYLE_BLOCK
+ SCENE_DESCRIPTION      (aus /production/scenes/<name>.md)
+ CAMERA                 (CAMERA_LOCK oder FRAME_CONSTRAINTS)
+ KOMPOSITIONSREGEL
+ NEGATIVE_CONSTRAINTS
```

**Längengrenze:** Ab etwa 4000 Zeichen verdrängen sich Anweisungen gegenseitig
(real gemessen: bei 4301 Zeichen ging die Farbpalette verloren, bei 3798 hielt
alles). Wenn ein Merkmal kippt, das vorher saß: **kürzen, nicht nachschärfen.**
