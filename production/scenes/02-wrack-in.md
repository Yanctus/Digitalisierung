# 02_WRACK_IN — Einflug durchs Loch im Rumpf

- **Startreferenz:** Weltframe (`first_frame`)
- **Endreferenz:** ein **rein schwarzes Bild** (`last_frame`)
- **Kamerablock:** `FRAME_CONSTRAINTS`

Der Trick des Auftraggebers: Die Kamera fährt in das dunkle Loch im Rumpf, und
dabei wird das Bild von selbst schwarz. **Die Schwärze ist der Übergang** — sie
deckt die Naht zur Schleife, ganz ohne pixelgenauen Frame-Lock. Deshalb steht
als Zielframe wirklich Schwarz und nicht der Innenraum.

## SCENE_DESCRIPTION
```
The camera rushes down and forward from high above the reef towards the great sunken ship lying on the right, accelerating hard along its wooden hull. It aims at one single round dark opening in the planking and flies straight into it. As it passes through the opening the wooden edges of the hole sweep past very close on all sides and the frame darkens quickly, until at the very end the image is completely black.
```
