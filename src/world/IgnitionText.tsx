import { useMemo } from 'react'

/**
 * Schrift, die entzündet wird statt einzublenden.
 *
 * Die Regel des Films: nichts entsteht, das Licht legt sich nur über das, was
 * schon da ist. Genauso verhält sich diese Überschrift — sie steht von Anfang
 * an vollständig im Bild, nur dunkel. Beim Erreichen des Akts läuft eine
 * Lichtwelle buchstabenweise hindurch, so wie das Netz über die Rinde läuft.
 *
 * Umgesetzt über eine wandernde Kante: jedes Zeichen bekommt seine Position
 * 0..1, die Welle liegt bei `progress` und ist `WIDTH` breit. Was hinter der
 * Welle liegt, bleibt hell — auch das ist Filmlogik: einmal gezündet, bleibt es.
 */

const WIDTH = 0.28 // Breite der Übergangszone, in Anteilen der Textlänge

export default function IgnitionText({
  text,
  progress,
  className = '',
  as: Tag = 'h2',
}: {
  text: string
  /** 0..1 — Position der Lichtwelle. */
  progress: number
  className?: string
  as?: 'h1' | 'h2' | 'p'
}) {
  // In Wörter zerlegen, damit der Zeilenumbruch normal funktioniert; die
  // Zeichen tragen die Animation.
  const words = useMemo(() => {
    const chars = Array.from(text)
    const total = Math.max(1, chars.length - 1)
    let i = 0
    return text.split(' ').map((word) => {
      const letters = Array.from(word).map((ch) => {
        const pos = i / total
        i += 1
        return { ch, pos }
      })
      i += 1 // das Leerzeichen mitzählen
      return letters
    })
  }, [text])

  // Die Welle läuft etwas über den Text hinaus, damit auch das letzte Zeichen
  // vollständig durchlaufen wird.
  const p = Number.isFinite(progress) ? Math.max(0, Math.min(1, progress)) : 0
  const head = p * (1 + WIDTH * 2) - WIDTH

  return (
    <Tag className={`w-ignite ${className}`} aria-label={text}>
      {words.map((letters, wi) => (
        <span key={wi}>
          {/* Echtes Leerzeichen im DOM, damit Markieren und Kopieren den Text
              korrekt liefern — ein reiner CSS-Abstand täte das nicht. */}
          {wi > 0 ? ' ' : null}
          <span className="w-ignite__word" aria-hidden="true">
          {letters.map(({ ch, pos }, li) => {
            const lit = Math.max(0, Math.min(1, (head - pos) / WIDTH + 1))
            return (
              <span
                className="w-ignite__ch"
                key={li}
                style={{
                  // Gedämpft, solange die Welle nicht da war — hell und
                  // leuchtend, sobald sie durch ist. Der Sockel liegt bewusst
                  // bei 0.38: Die Schrift soll „schon da, nur dunkel" wirken,
                  // nicht unsichtbar sein.
                  opacity: 0.38 + lit * 0.62,
                  filter: `brightness(${(0.5 + lit * 0.5).toFixed(3)})`,
                  textShadow:
                    lit > 0.02
                      ? `0 0 ${(lit * 22).toFixed(1)}px rgba(169,112,255,${(lit * 0.5).toFixed(3)})`
                      : 'none',
                }}
              >
                {ch}
              </span>
            )
          })}
          </span>
        </span>
      ))}
    </Tag>
  )
}
