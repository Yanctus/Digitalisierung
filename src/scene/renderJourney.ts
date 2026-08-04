import { clamp, lerp, makeRng, norm } from '../lib/rng'
import { paletteAt, rgba, tint } from '../lib/palette'
import { cameraAt, fog, project, FAR, NEAR } from './camera'
import { MOTE_TILE, TILE_VARIANTS, TILE_Z, type SceneModel } from './sceneModel'

/**
 * Eine echte Kamerafahrt: die Kamera bewegt sich durch die Welt, alles wird pro
 * Frame perspektivisch projiziert. Nichts hier ist gemalte Kulisse — Halme,
 * Gerüste und Knoten stehen an festen Weltkoordinaten und rauschen vorbei,
 * weil die Kamera an ihnen vorbeifliegt.
 *
 * Strecke (Kamera-z):
 *   -25 …  110   Das Feld     tief im Gras, Sonne voraus
 *   110 …  250   Struktur     erste Gerüste, Kamera beginnt zu steigen
 *   250 …  440   Das Netz     Flug mitten durch das Knotenmesh
 *   440 …  540   Horizont     das Feld ist zurückgeblieben
 */

const GRASS_FAR = 150
const MOTE_FAR = 120
const GRID_STEP_Z = 12
const GRID_HALF_X = 120

const stars = (() => {
  const rng = makeRng(7717)
  return Array.from({ length: 150 }, () => ({
    x: rng(),
    y: rng() * 0.75,
    r: 0.3 + rng() * 1.0,
    phase: rng() * Math.PI * 2,
  }))
})()

let grainTile: HTMLCanvasElement | null = null
function getGrainTile() {
  if (grainTile) return grainTile
  const size = 128
  const c = document.createElement('canvas')
  c.width = c.height = size
  const g = c.getContext('2d')!
  const img = g.createImageData(size, size)
  const rng = makeRng(4242)
  for (let i = 0; i < img.data.length; i += 4) {
    const v = 128 + (rng() - 0.5) * 255
    img.data[i] = img.data[i + 1] = img.data[i + 2] = v
    img.data[i + 3] = 255
  }
  g.putImageData(img, 0, 0)
  grainTile = c
  return c
}

export function renderJourney(
  ctx: CanvasRenderingContext2D,
  w: number,
  h: number,
  p: number,
  time: number,
  model: SceneModel,
) {
  const pal = paletteAt(p)
  const cam = cameraAt(p, w, h)
  const horizonY = h * 0.5 + cam.pitch

  ctx.clearRect(0, 0, w, h)
  ctx.lineCap = 'round'

  // ------------------------------------------------------------------ Himmel
  const sky = ctx.createLinearGradient(0, 0, 0, Math.max(horizonY, 1))
  sky.addColorStop(0, rgba(pal.skyTop))
  sky.addColorStop(1, rgba(pal.skyBot))
  ctx.fillStyle = sky
  ctx.fillRect(0, 0, w, Math.max(horizonY, 0) + 1)

  // ------------------------------------------------------------------ Sterne
  const starA = norm(p, 0.45, 0.92)
  if (starA > 0.001) {
    ctx.fillStyle = '#ffffff'
    for (const s of stars) {
      const tw = 0.55 + 0.45 * Math.sin(time * 0.8 + s.phase)
      ctx.globalAlpha = starA * tw * 0.8
      ctx.beginPath()
      ctx.arc(s.x * w, s.y * horizonY, s.r, 0, Math.PI * 2)
      ctx.fill()
    }
    ctx.globalAlpha = 1
  }

  // ------------------------------------------------------------------ Sonne
  // Steht als echtes Weltobjekt sehr weit voraus: sie wandert korrekt mit der
  // Kurve der Flugbahn und sinkt, während die Kamera steigt.
  const sunA = 1 - norm(p, 0.05, 0.72)
  if (sunA > 0.001) {
    const sun = project(cam, 80, -55, 1400, w, h)
    if (sun) {
      const rad = Math.max(w, h) * 0.36
      const glow = ctx.createRadialGradient(sun.sx, sun.sy, 0, sun.sx, sun.sy, rad)
      glow.addColorStop(0, rgba(pal.sun, 0.5 * sunA))
      glow.addColorStop(0.3, rgba(pal.sun, 0.13 * sunA))
      glow.addColorStop(1, rgba(pal.sun, 0))
      ctx.fillStyle = glow
      ctx.fillRect(0, 0, w, h)

      ctx.globalAlpha = sunA
      ctx.fillStyle = rgba(tint(pal.sun, 0.35), 0.9)
      ctx.beginPath()
      ctx.arc(sun.sx, sun.sy, h * 0.022, 0, Math.PI * 2)
      ctx.fill()
      ctx.globalAlpha = 1
    }
  }

  // ------------------------------------------------------------------ Boden
  if (horizonY < h) {
    const ground = ctx.createLinearGradient(0, horizonY, 0, h)
    ground.addColorStop(0, rgba(pal.ground, 1))
    ground.addColorStop(1, rgba(pal.groundDeep, 1))
    ctx.fillStyle = ground
    ctx.fillRect(0, horizonY, w, h - horizonY)
  }

  // ------------------------------------------------------------------ Raster
  // Der wichtigste Geschwindigkeitshinweis: Querlinien rauschen auf die Kamera zu.
  const gridA = norm(p, 0.12, 0.42)
  if (gridA > 0.001) {
    ctx.lineWidth = 1
    const z0 = Math.ceil((cam.z + NEAR) / GRID_STEP_Z) * GRID_STEP_Z
    for (let z = z0; z < cam.z + FAR; z += GRID_STEP_Z) {
      const a = project(cam, -GRID_HALF_X, 0, z, w, h)
      const b = project(cam, GRID_HALF_X, 0, z, w, h)
      if (!a || !b) continue
      ctx.strokeStyle = rgba(pal.accent, 0.3 * gridA * fog(a.dz))
      ctx.beginPath()
      ctx.moveTo(a.sx, a.sy)
      ctx.lineTo(b.sx, b.sy)
      ctx.stroke()
    }
    // Längslinien fluchten in den Horizont — Alpha als Verlauf entlang der Linie.
    for (let x = -GRID_HALF_X; x <= GRID_HALF_X; x += 16) {
      const a = project(cam, x, 0, cam.z + NEAR + 1, w, h)
      const b = project(cam, x, 0, cam.z + FAR, w, h)
      if (!a || !b) continue
      const g = ctx.createLinearGradient(a.sx, a.sy, b.sx, b.sy)
      g.addColorStop(0, rgba(pal.accent, 0.26 * gridA))
      g.addColorStop(1, rgba(pal.accent, 0))
      ctx.strokeStyle = g
      ctx.beginPath()
      ctx.moveTo(a.sx, a.sy)
      ctx.lineTo(b.sx, b.sy)
      ctx.stroke()
    }
  }

  // ------------------------------------------------------------------ Gras
  const grassPresence = 1 - norm(p, 0.3, 0.58)
  if (grassPresence > 0.001) {
    const tiFar = Math.floor((cam.z + GRASS_FAR) / TILE_Z)
    const tiNear = Math.floor((cam.z + NEAR) / TILE_Z)
    for (let ti = tiFar; ti >= tiNear; ti--) {
      const variant = ((ti % TILE_VARIANTS) + TILE_VARIANTS) % TILE_VARIANTS
      const blades = model.grassTiles[variant]
      const tileZ = ti * TILE_Z
      const tileDz = tileZ + TILE_Z * 0.5 - cam.z
      const tileFog = fog(tileDz, GRASS_FAR)
      if (tileFog <= 0.002) continue

      // Ein Pfad pro Parzelle statt pro Halm: 120 Kurven, ein Stroke.
      const path = new Path2D()
      let drawn = 0
      for (const bl of blades) {
        const wz = tileZ + bl.z
        const base = project(cam, bl.x, 0, wz, w, h)
        if (!base) continue
        const sway = Math.sin(time * 1.1 + bl.phase + wz * 0.09) * 0.4
        const tip = project(cam, bl.x + bl.lean + sway, -bl.h, wz, w, h)
        if (!tip) continue
        // Nur zeichnen, was auch im Bild liegt.
        if (base.sx < -60 || base.sx > w + 60) continue
        path.moveTo(base.sx, base.sy)
        path.quadraticCurveTo(
          base.sx + (tip.sx - base.sx) * 0.4,
          base.sy + (tip.sy - base.sy) * 0.55,
          tip.sx,
          tip.sy,
        )
        drawn++
      }
      if (!drawn) continue

      const nearness = clamp(1 - tileDz / GRASS_FAR)
      ctx.strokeStyle = rgba(
        tint(pal.ground, 0.08 + nearness * 0.22),
        grassPresence * tileFog * 0.85,
      )
      ctx.lineWidth = clamp(0.5 + nearness * 3.2, 0.5, 4)
      ctx.stroke(path)
    }
  }

  // ------------------------------------------------------------------ Gerüste
  const pylonA = 1 - norm(p, 0.9, 1) * 0.4
  for (const py of model.pylons) {
    const dz = py.z - cam.z
    if (dz < NEAR || dz > FAR) continue
    const f = fog(dz)
    if (f <= 0.003) continue

    const base = project(cam, py.x, 0, py.z, w, h)
    const top = project(cam, py.x, -py.h, py.z, w, h)
    if (!base || !top) continue
    if (base.sx < -w || base.sx > w * 2) continue

    const a = f * pylonA
    ctx.strokeStyle = rgba(tint(pal.accent, 0.12), a * 0.8)
    ctx.lineWidth = clamp(base.s * 0.28, 0.8, 16)
    ctx.beginPath()
    ctx.moveTo(base.sx, base.sy)
    ctx.lineTo(top.sx, top.sy)
    ctx.stroke()

    // Querstreben — sie geben dem Gerüst beim Vorbeiflug seine Tiefe.
    ctx.lineWidth = clamp(base.s * 0.1, 0.5, 5)
    ctx.strokeStyle = rgba(pal.accent, a * 0.45)
    ctx.beginPath()
    const barHalf = 1.4 + py.h * 0.045
    for (let i = 1; i <= py.bars; i++) {
      const wy = (-py.h * i) / (py.bars + 1)
      const l = project(cam, py.x - barHalf, wy, py.z, w, h)
      const r = project(cam, py.x + barHalf, wy, py.z, w, h)
      if (!l || !r) continue
      ctx.moveTo(l.sx, l.sy)
      ctx.lineTo(r.sx, r.sy)
    }
    ctx.stroke()

    const pulse = 0.7 + 0.3 * Math.sin(time * 1.6 + py.phase)
    ctx.fillStyle = rgba(tint(pal.accent, 0.5), a * pulse)
    ctx.beginPath()
    ctx.arc(top.sx, top.sy, clamp(base.s * 0.13, 0.8, 7), 0, Math.PI * 2)
    ctx.fill()
  }

  // ------------------------------------------------------------------ Netz
  // Kanten zuerst, damit die Knoten obenauf leuchten.
  ctx.lineWidth = 1
  for (const e of model.edges) {
    const na = model.nodes[e.a]
    const nb = model.nodes[e.b]
    const a = project(cam, na.x, na.y, na.z, w, h)
    const b = project(cam, nb.x, nb.y, nb.z, w, h)
    if (!a || !b) continue
    const f = fog(Math.min(a.dz, b.dz))
    if (f <= 0.004) continue

    ctx.strokeStyle = rgba(pal.accent, f * 0.34)
    ctx.beginPath()
    ctx.moveTo(a.sx, a.sy)
    ctx.lineTo(b.sx, b.sy)
    ctx.stroke()

    // Datenpaket unterwegs auf der Kante.
    const t = (time * 0.16 + e.phase) % 1
    ctx.fillStyle = rgba(tint(pal.accent, 0.6), f * 0.9)
    ctx.beginPath()
    ctx.arc(lerp(a.sx, b.sx, t), lerp(a.sy, b.sy, t), clamp(a.s * 0.1, 0.7, 4), 0, Math.PI * 2)
    ctx.fill()
  }

  for (const n of model.nodes) {
    const q = project(cam, n.x, n.y, n.z, w, h)
    if (!q) continue
    const f = fog(q.dz)
    if (f <= 0.004) continue
    if (q.sx < -200 || q.sx > w + 200) continue

    const rad = clamp(n.r * q.s, 0.6, 26)
    const pulse = 0.75 + 0.25 * Math.sin(time * 1.4 + n.phase)

    const halo = ctx.createRadialGradient(q.sx, q.sy, 0, q.sx, q.sy, rad * 7)
    halo.addColorStop(0, rgba(pal.accent, 0.3 * f * pulse))
    halo.addColorStop(1, rgba(pal.accent, 0))
    ctx.fillStyle = halo
    ctx.beginPath()
    ctx.arc(q.sx, q.sy, rad * 7, 0, Math.PI * 2)
    ctx.fill()

    ctx.fillStyle = rgba(tint(pal.accent, 0.65), f * 0.95)
    ctx.beginPath()
    ctx.arc(q.sx, q.sy, rad, 0, Math.PI * 2)
    ctx.fill()
  }

  // ------------------------------------------------------------------ Partikel
  // Um die Kamera gekachelt, deshalb nie ausgehend — und der deutlichste
  // Hinweis darauf, wie schnell man gerade fliegt.
  const tiFar = Math.floor((cam.z + MOTE_FAR) / MOTE_TILE)
  const tiNear = Math.floor((cam.z + NEAR) / MOTE_TILE)
  for (let ti = tiFar; ti >= tiNear; ti--) {
    for (const m of model.motes) {
      const wz = ti * MOTE_TILE + m.z
      const wy = m.y + Math.sin(time * 0.4 + m.phase) * 2
      const q = project(cam, m.x, wy, wz, w, h)
      if (!q) continue
      if (q.sx < -20 || q.sx > w + 20 || q.sy < -20 || q.sy > h + 20) continue
      const f = fog(q.dz, MOTE_FAR)
      if (f <= 0.01) continue
      ctx.fillStyle = rgba(tint(pal.accent, 0.5), f * 0.5)
      ctx.beginPath()
      ctx.arc(q.sx, q.sy, clamp(m.r * q.s, 0.4, 5), 0, Math.PI * 2)
      ctx.fill()
    }
  }

  // ------------------------------------------------------------------ Finish
  const vig = ctx.createRadialGradient(
    w * 0.5,
    h * 0.45,
    Math.min(w, h) * 0.24,
    w * 0.5,
    h * 0.5,
    Math.max(w, h) * 0.78,
  )
  vig.addColorStop(0, 'rgba(0,0,0,0)')
  vig.addColorStop(1, `rgba(0,0,0,${0.42 + p * 0.12})`)
  ctx.fillStyle = vig
  ctx.fillRect(0, 0, w, h)

  const pattern = ctx.createPattern(getGrainTile(), 'repeat')
  if (pattern) {
    ctx.globalAlpha = 0.035
    ctx.fillStyle = pattern
    ctx.fillRect(0, 0, w, h)
    ctx.globalAlpha = 1
  }
}
