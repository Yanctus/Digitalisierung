import { easeInOutCubic, lerp, norm } from '../lib/rng'

/**
 * Die Kamera ist das eigentliche Erzählmittel: Scroll bewegt sie auf einer
 * festen Bahn durch die Welt. Sie startet tief im Gras und steigt über dem Netz
 * auf — die Reise vom Boden in die Übersicht.
 *
 * Konvention: y zeigt nach unten. Boden liegt bei y = 0, die Kamera also im
 * negativen y-Bereich.
 */

export const NEAR = 2
export const FAR = 300

/** Streckenlänge in Welt-Einheiten. z = Z_START bei p=0, Z_END bei p=1. */
export const Z_START = -25
export const Z_END = 540

export type Camera = {
  x: number
  y: number
  z: number
  pitch: number
  focal: number
}

export function cameraAt(p: number, w: number, h: number): Camera {
  const z = lerp(Z_START, Z_END, p)

  // Abheben: die ersten 30 % bleibt die Kamera im Gras, danach steigt sie.
  const lift = easeInOutCubic(norm(p, 0.3, 1))
  const y = -(5.5 + 76 * lift)

  // Zwei überlagerte Sinus — die Bahn ist eine Kurve, keine Schiene. Genau das
  // macht den Unterschied zwischen "Fahrt" und "Zoom".
  const x = Math.sin(z * 0.0075) * 15 + Math.sin(z * 0.0031 + 1.2) * 9

  // Der Horizont wandert nach oben, während wir steigen — mehr Himmel fürs Netz.
  const pitch = h * (0.1 - p * 0.18)

  return { x, y, z, pitch, focal: w * 0.85 }
}

export type Projected = { sx: number; sy: number; s: number; dz: number }

/** Perspektivprojektion. Gibt null zurück, wenn der Punkt hinter der Kamera liegt. */
export function project(
  cam: Camera,
  wx: number,
  wy: number,
  wz: number,
  w: number,
  h: number,
): Projected | null {
  const dz = wz - cam.z
  if (dz < NEAR) return null
  const s = cam.focal / dz
  return {
    sx: w * 0.5 + (wx - cam.x) * s,
    sy: h * 0.5 + cam.pitch + (wy - cam.y) * s,
    s,
    dz,
  }
}

/** Sichtbarkeit über Entfernung — alles taucht aus dem Dunst auf. */
export function fog(dz: number, far = FAR) {
  const t = 1 - dz / far
  return t <= 0 ? 0 : Math.pow(t, 1.5)
}
