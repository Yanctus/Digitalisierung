import { makeRng } from '../lib/rng'

/**
 * Die Welt liegt in echten 3D-Weltkoordinaten (y nach unten, Boden bei y=0).
 * Alles ist geseedet, damit die Strecke bei jedem Reload identisch ist.
 */

export const TILE_Z = 24 // Tiefe einer Grasparzelle
export const TILE_VARIANTS = 4 // gegen sichtbare Wiederholung
export const GRASS_HALF_WIDTH = 110

export type Blade = {
  x: number
  z: number // 0..TILE_Z, relativ zur Parzelle
  h: number // Halmhöhe in Welteinheiten
  lean: number
  phase: number
}

export type Pylon = {
  x: number
  z: number
  h: number
  bars: number
  phase: number
}

export type WorldNode = {
  x: number
  y: number
  z: number
  r: number
  phase: number
}

export type Edge = { a: number; b: number; phase: number }

export type Mote = {
  x: number
  y: number
  z: number // 0..MOTE_TILE, relativ zur Kamera gekachelt
  r: number
  phase: number
}

export const MOTE_TILE = 30

export type SceneModel = {
  grassTiles: Blade[][]
  pylons: Pylon[]
  nodes: WorldNode[]
  edges: Edge[]
  motes: Mote[]
}

export function buildSceneModel(seed = 20260803): SceneModel {
  const rng = makeRng(seed)

  // --- Gras: vier Parzellen-Varianten, die entlang z gekachelt werden. So ist
  // das Feld unendlich lang, ohne unendlich viele Halme zu speichern.
  const grassTiles: Blade[][] = []
  for (let v = 0; v < TILE_VARIANTS; v++) {
    const blades: Blade[] = []
    for (let i = 0; i < 120; i++) {
      blades.push({
        x: (rng() * 2 - 1) * GRASS_HALF_WIDTH,
        z: rng() * TILE_Z,
        h: 0.9 + rng() * 1.9,
        lean: (rng() - 0.5) * 1.4,
        phase: rng() * Math.PI * 2,
      })
    }
    blades.sort((a, b) => b.z - a.z) // hinten zuerst
    grassTiles.push(blades)
  }

  // --- Gerüste links und rechts der Flugbahn. Der Mindestabstand zur Mitte
  // sorgt dafür, dass die Kamera zwischen ihnen hindurchfliegt statt hinein.
  const pylons: Pylon[] = []
  for (let i = 0; i < 48; i++) {
    const side = i % 2 === 0 ? -1 : 1
    pylons.push({
      x: side * (17 + rng() * 48),
      z: 110 + (i / 48) * 330 + rng() * 12,
      h: 9 + rng() * 40,
      bars: 2 + Math.floor(rng() * 5),
      phase: rng() * Math.PI * 2,
    })
  }
  pylons.sort((a, b) => b.z - a.z)

  // --- Das Netz: eine Röhre aus Knoten, durch die die Kamera am Ende fliegt.
  const nodes: WorldNode[] = []
  for (let i = 0; i < 210; i++) {
    const ang = rng() * Math.PI * 2
    const rad = 12 + rng() * 62
    // Reicht bis z=760: die Kamera hält bei 540 und blickt 300 weit, das Netz
    // muss also bis dorthin tragen — sonst endet die Fahrt im Nichts.
    nodes.push({
      x: Math.cos(ang) * rad,
      y: -8 - rng() * 88,
      z: 250 + rng() * 510,
      r: 0.28 + rng() * 0.5,
      phase: rng() * Math.PI * 2,
    })
  }

  // Kanten zum jeweils nächsten Nachbarn — genug für ein Mesh, wenig genug,
  // dass es nicht zu Rauschen wird.
  const seen = new Set<string>()
  const edges: Edge[] = []
  for (let i = 0; i < nodes.length; i++) {
    let best = -1
    let bestD = Infinity
    for (let j = 0; j < nodes.length; j++) {
      if (j === i) continue
      const d =
        (nodes[i].x - nodes[j].x) ** 2 +
        (nodes[i].y - nodes[j].y) ** 2 +
        (nodes[i].z - nodes[j].z) ** 2
      if (d < bestD) {
        bestD = d
        best = j
      }
    }
    if (best < 0) continue
    const key = i < best ? `${i}-${best}` : `${best}-${i}`
    if (seen.has(key)) continue
    seen.add(key)
    edges.push({ a: i, b: best, phase: rng() })
  }

  // --- Staub/Datenpartikel, um die Kamera herum gekachelt. Der stärkste
  // Geschwindigkeitseindruck der ganzen Szene.
  const motes: Mote[] = []
  for (let i = 0; i < 150; i++) {
    motes.push({
      x: (rng() * 2 - 1) * 55,
      y: -rng() * 60,
      z: rng() * MOTE_TILE,
      r: 0.05 + rng() * 0.16,
      phase: rng() * Math.PI * 2,
    })
  }

  return { grassTiles, pylons, nodes, edges, motes }
}
