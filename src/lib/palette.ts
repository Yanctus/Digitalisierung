import { clamp, easeInOutCubic, lerp } from './rng'

export type RGB = [number, number, number]

/**
 * The narrative colour arc. The page opens on a green field before sunrise and
 * closes on a lit network at night — the warm sun fades out exactly as the cool
 * network light takes over. That handover is the whole story of the site, so it
 * lives here as data rather than being scattered through the renderer.
 */
type Stop = {
  t: number
  skyTop: RGB
  skyBot: RGB
  sun: RGB
  ground: RGB
  groundDeep: RGB
  accent: RGB
}

const STOPS: Stop[] = [
  {
    t: 0.0, // Das Feld — Morgengrauen
    skyTop: [16, 29, 36],
    skyBot: [72, 92, 74],
    sun: [255, 182, 77],
    ground: [64, 104, 52],
    groundDeep: [22, 38, 22],
    accent: [255, 182, 77],
  },
  {
    t: 0.25, // Der Keim
    skyTop: [20, 42, 52],
    skyBot: [72, 100, 84],
    sun: [255, 172, 82],
    ground: [70, 112, 56],
    groundDeep: [24, 44, 30],
    accent: [255, 196, 96],
  },
  {
    t: 0.5, // Struktur
    skyTop: [14, 38, 58],
    skyBot: [50, 82, 82],
    sun: [255, 190, 110],
    ground: [40, 70, 58],
    groundDeep: [16, 32, 34],
    accent: [255, 208, 122],
  },
  {
    t: 0.75, // Das Netz
    skyTop: [8, 20, 36],
    skyBot: [24, 50, 66],
    sun: [170, 186, 172],
    ground: [16, 34, 46],
    groundDeep: [8, 18, 26],
    accent: [140, 226, 214],
  },
  {
    t: 1.0, // Horizont
    skyTop: [3, 6, 12],
    skyBot: [8, 20, 32],
    sun: [90, 130, 150],
    ground: [6, 12, 20],
    groundDeep: [3, 6, 11],
    accent: [111, 227, 212],
  },
]

const mixRgb = (a: RGB, b: RGB, t: number): RGB => [
  Math.round(lerp(a[0], b[0], t)),
  Math.round(lerp(a[1], b[1], t)),
  Math.round(lerp(a[2], b[2], t)),
]

export type Palette = Omit<Stop, 't'>

export function paletteAt(p: number): Palette {
  const t = clamp(p)
  let i = 0
  while (i < STOPS.length - 2 && t > STOPS[i + 1].t) i++
  const a = STOPS[i]
  const b = STOPS[i + 1]
  const k = easeInOutCubic(clamp((t - a.t) / (b.t - a.t)))
  return {
    skyTop: mixRgb(a.skyTop, b.skyTop, k),
    skyBot: mixRgb(a.skyBot, b.skyBot, k),
    sun: mixRgb(a.sun, b.sun, k),
    ground: mixRgb(a.ground, b.ground, k),
    groundDeep: mixRgb(a.groundDeep, b.groundDeep, k),
    accent: mixRgb(a.accent, b.accent, k),
  }
}

export const rgba = (c: RGB, alpha = 1) => `rgba(${c[0]},${c[1]},${c[2]},${alpha})`

/** Lightens toward white — used for grass tips catching the low sun. */
export const tint = (c: RGB, amount: number): RGB =>
  mixRgb(c, [255, 255, 255], clamp(amount))
