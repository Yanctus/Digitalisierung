/**
 * Scroll-gescrubbte Kamerafahrt, zugeschnitten auf Architektur A.
 *
 * Die Legs sind lückenlos aneinandergehängt — jedes beginnt auf dem echten
 * Schlussframe des vorigen. Es gibt deshalb keine Connectors und keine
 * Seitwärtsbewegung; die Kette IST die Reise.
 *
 * Die Technik stammt aus scroll-world/references/scrub-engine.js. Vier Dinge
 * daran sind teuer erkauft und dürfen nicht "vereinfacht" werden:
 *
 *  1. Clips werden als Blob geladen. Viele Hoster liefern keine HTTP-Byte-Ranges,
 *     dann steht `video.seekable` auf [0,0] und jeder Seek klemmt auf Frame 0 —
 *     das Video wirkt eingefroren. Blobs sind immer voll seekbar.
 *  2. Nie einen Seek absetzen, solange der Decoder noch am vorigen arbeitet.
 *     Auf dem Handy stapeln sich sonst bei schnellem Wischen die Seeks und der
 *     Clip friert ein.
 *  3. Das Standbild bleibt sichtbar, bis der Clip wirklich einen Frame gemalt
 *     hat. iOS malt ein stummes, nie abgespieltes Video nach einem Seek nicht —
 *     ohne diesen Umweg sieht man eine leere Szene.
 *  4. Auf iOS braucht es eine Nutzergeste, bevor ein stummes Video zuverlässig
 *     dekodiert. Beim ersten Touch werden alle geladenen Clips angestoßen.
 */

export type Leg = {
  clip: string
  still: string
  scroll: number
  linger?: number
}

export type WorldState = {
  /** 0..1 über die gesamte Fahrt. */
  progress: number
  /** Index des aktiven Legs. */
  active: number
  /** 0..1 innerhalb des aktiven Legs. */
  localProgress: number
  /** Geglättete Scrollgeschwindigkeit, 0..1 — treibt die Glut. */
  velocity: number
}

type Seg = Leg & {
  start: number
  end: number
  el: HTMLDivElement
  img: HTMLImageElement
  video?: HTMLVideoElement
  loading?: boolean
  ready?: boolean
  hasClip?: boolean
  visible?: boolean
  cur: number
  target: number
}

/** NaN-fest: Math.max/min reichen NaN durch, was als CSS-Wert zum Fehler führt. */
const clamp = (v: number, a = 0, b = 1) => (Number.isFinite(v) ? Math.max(a, Math.min(b, v)) : a)
const smooth = (t: number) => {
  const x = clamp(t)
  return x * x * (3 - 2 * x)
}

/**
 * Verlangsamt die Mitte des Legs und beschleunigt zu den Rändern hin.
 * f(0)=0 und f(1)=1 bleiben exakt erhalten, damit die Nahtframes stimmen.
 */
function lingerEase(t: number, amount: number) {
  const a = clamp(amount, 0, 0.85)
  if (!a) return t
  const centred = t - 0.5
  const eased = centred * (1 - a) + Math.pow(Math.abs(centred) * 2, 1.6) * Math.sign(centred) * 0.5 * a
  return clamp(eased + 0.5)
}

export function mountWorld(
  stage: HTMLElement,
  legs: Leg[],
  onState: (s: WorldState) => void,
) {
  const reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches
  const coarse = window.matchMedia('(hover: none) and (pointer: coarse)').matches
  const smallMQ = window.matchMedia('(max-width: 860px)')
  const isMobile = () => coarse || smallMQ.matches

  const CROSSFADE = 0.1 // Nahtüberblendung in Viewport-Höhen
  const segs: Seg[] = []

  // Der Browser stellt beim Neuladen die alte Scrollposition wieder her — bei
  // einer Kamerafahrt landet man dann mitten im Film. Die Reise hat aber einen
  // Anfang, also übernehmen wir das selbst.
  if ('scrollRestoration' in history) history.scrollRestoration = 'manual'

  legs.forEach((leg) => {
    const el = document.createElement('div')
    el.className = 'w-scene'
    const img = document.createElement('img')
    img.className = 'w-scene__still'
    img.src = leg.still
    img.alt = ''
    img.decoding = 'async'
    el.appendChild(img)
    stage.appendChild(el)
    segs.push({ ...leg, start: 0, end: 0, el, img, cur: 0, target: 0 })
  })

  let vh = window.innerHeight
  let totalW = 0
  let laidOutW = window.innerWidth
  let ticking = false
  let userReady = false
  let lastY = window.scrollY
  let lastT = performance.now()
  let vel = 0

  const track = document.createElement('div')
  track.className = 'w-track'
  stage.parentElement!.appendChild(track)

  function layout() {
    vh = window.innerHeight
    laidOutW = window.innerWidth
    let off = 0
    segs.forEach((s) => {
      s.start = off * vh
      off += s.scroll
      s.end = off * vh
    })
    totalW = off
    // +1vh, damit das letzte Leg vollständig durchläuft, bevor die Seite endet.
    track.style.height = totalW * vh + vh + 'px'
    read()
  }

  function loadClip(s: Seg) {
    // Bei prefers-reduced-motion werden die Clips nie geladen — die Standbilder
    // bleiben stehen und blenden ineinander. Kein Dekodieraufwand, keine Bewegung.
    if (reduce || s.loading || !s.clip) return
    s.loading = true
    fetch(s.clip)
      .then((r) => (r.ok ? r.blob() : Promise.reject(new Error('404'))))
      .then((blob) => {
        const v = document.createElement('video')
        v.className = 'w-scene__video'
        v.muted = true
        v.playsInline = true
        v.preload = 'auto'
        v.setAttribute('muted', '')
        v.setAttribute('playsinline', '')
        v.src = URL.createObjectURL(blob)
        v.addEventListener('loadedmetadata', () => {
          s.ready = true
          read()
        })
        // Erst wenn wirklich ein Frame gemalt wurde, das Standbild ausblenden.
        v.addEventListener('seeked', () => s.el.classList.add('has-clip'), { once: true })
        v.addEventListener('loadeddata', () => {
          try {
            v.pause()
          } catch {
            /* egal */
          }
          if (userReady) prime(v)
        })
        s.el.appendChild(v)
        s.video = v
        s.hasClip = true
      })
      .catch(() => {
        s.loading = false
      })
  }

  function prime(v: HTMLVideoElement) {
    if (!isMobile() || !v) return
    try {
      const p = v.play()
      if (p && p.then) p.then(() => { try { v.pause() } catch { /* egal */ } }).catch(() => {})
    } catch {
      /* egal */
    }
  }

  function read() {
    const y = window.scrollY || window.pageYOffset
    const fade = CROSSFADE * vh
    let ci = 0
    for (let i = 0; i < segs.length; i++) if (y >= segs[i].start) ci = i

    for (let i = 0; i < segs.length; i++) {
      const s = segs[i]
      // Nachbarn im Umkreis von 1,6 Viewports vorladen.
      if (y > s.start - 1.6 * vh && y < s.end + 1.6 * vh) loadClip(s)
      const span = s.end - s.start || 1
      const local = clamp((y - s.start) / span)
      s.target = s.linger ? lingerEase(local, s.linger) : local
      let outside = 0
      if (y < s.start) outside = s.start - y
      else if (y > s.end) outside = y - s.end
      const op = smooth(1 - outside / fade)
      s.el.style.opacity = String(op)
      s.visible = op > 0.001
      s.el.style.zIndex = i === ci ? '20' : String(10 + Math.round(op * 8))
      if (!s.hasClip || !s.ready) {
        const sc = reduce ? 1 : 1.02 + local * 0.1
        s.img.style.transform = `scale(${sc.toFixed(3)})`
      }
    }

    const cur = segs[ci]
    const localProgress = clamp((y - cur.start) / (cur.end - cur.start || 1))

    // Scrollgeschwindigkeit, geglättet — treibt die Glut im Hintergrund.
    const now = performance.now()
    const dt = Math.max(16, now - lastT)
    const raw = Math.abs(y - lastY) / dt
    vel += (clamp(raw / 2.2) - vel) * 0.12
    lastY = y
    lastT = now

    onState({
      progress: clamp(y / (totalW * vh || 1)),
      active: ci,
      localProgress,
      velocity: vel,
    })
    ticking = false
  }

  function raf() {
    const eps = isMobile() ? 0.02 : 0.008
    for (let i = 0; i < segs.length; i++) {
      const s = segs[i]
      if (!s.hasClip || !s.ready || !s.video) continue
      if (s.video.seeking) continue
      if (!s.visible && Math.abs(s.cur - s.target) < 0.002) continue
      s.cur += (s.target - s.cur) * (reduce ? 1 : 0.18)
      const dur = s.video.duration || 1
      const t = clamp(s.cur, 0, 0.999) * dur
      if (Math.abs(s.video.currentTime - t) > eps) {
        try {
          s.video.currentTime = t
        } catch {
          /* egal */
        }
      }
    }
    rafId = requestAnimationFrame(raf)
  }

  function onScroll() {
    if (ticking) return
    ticking = true
    requestAnimationFrame(read)
  }

  function onResize() {
    // Auf dem Handy löst das Ein- und Ausfahren der URL-Leiste ein resize aus.
    // Nur auf Breitenänderungen reagieren, sonst springt die Seite beim Scrollen.
    if (isMobile() && window.innerWidth === laidOutW) return
    layout()
  }

  function onFirstTouch() {
    userReady = true
    segs.forEach((s) => s.video && prime(s.video))
  }

  let rafId = requestAnimationFrame(raf)
  window.addEventListener('scroll', onScroll, { passive: true })
  window.addEventListener('resize', onResize)
  window.addEventListener('orientationchange', layout)
  window.addEventListener('touchstart', onFirstTouch, { once: true, passive: true })
  layout()

  /** Springt in die Mitte eines Legs. */
  function jumpTo(i: number) {
    const s = segs[i]
    if (!s) return
    window.scrollTo({
      top: s.start + (s.end - s.start) * 0.5,
      behavior: reduce ? 'auto' : 'smooth',
    })
  }

  function destroy() {
    cancelAnimationFrame(rafId)
    window.removeEventListener('scroll', onScroll)
    window.removeEventListener('resize', onResize)
    window.removeEventListener('orientationchange', layout)
    window.removeEventListener('touchstart', onFirstTouch)
    segs.forEach((s) => {
      if (s.video) URL.revokeObjectURL(s.video.src)
      s.el.remove()
    })
    track.remove()
  }

  return { jumpTo, destroy, reduce }
}
