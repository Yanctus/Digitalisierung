import { useEffect, useRef, useState, type ReactNode } from 'react'

/**
 * Fade-up on enter. Every text block on the page uses this with a staggered
 * delay so sections assemble themselves rather than appearing all at once.
 */
export function Reveal({
  children,
  delay = 0,
  className = '',
}: {
  children: ReactNode
  delay?: number
  className?: string
}) {
  const ref = useRef<HTMLDivElement>(null)
  const [shown, setShown] = useState(false)

  useEffect(() => {
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
      setShown(true)
      return
    }
    const el = ref.current
    if (!el) return
    const io = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setShown(true)
          io.disconnect()
        }
      },
      { threshold: 0.15 },
    )
    io.observe(el)
    return () => io.disconnect()
  }, [])

  return (
    <div
      ref={ref}
      className={`will-change-transform ${
        shown ? 'translate-y-0 opacity-100' : 'translate-y-8 opacity-0'
      } ${className}`}
      style={{ transition: 'all 700ms ease-out', transitionDelay: `${delay}ms` }}
    >
      {children}
    </div>
  )
}

/** Left-accent glass chip used to label every act. */
export function Badge({ children }: { children: ReactNode }) {
  return (
    <span className="inline-block border-l-2 border-white bg-white/15 px-3 py-1.5 font-mono text-[11px] uppercase tracking-[0.15em] text-white backdrop-blur-md">
      {children}
    </span>
  )
}

/**
 * Wordmark: a hub with three spokes — a seed that has become a network. The
 * whole site in 24 pixels.
 */
export function Mark({ className = '' }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 24 24"
      width={24}
      height={24}
      fill="none"
      stroke="currentColor"
      strokeWidth={1.5}
      strokeLinecap="round"
      className={className}
      aria-hidden="true"
    >
      <circle cx="12" cy="12" r="2.7" />
      <path d="M12 9.3V4.6" />
      <path d="M14.4 13.5l4 2.3" />
      <path d="M9.6 13.5l-4 2.3" />
      <circle cx="12" cy="3.4" r="1.15" fill="currentColor" stroke="none" />
      <circle cx="19.4" cy="16.5" r="1.15" fill="currentColor" stroke="none" />
      <circle cx="4.6" cy="16.5" r="1.15" fill="currentColor" stroke="none" />
    </svg>
  )
}

/** Shared shell so every act sits on the same vertical and horizontal rhythm. */
export function Act({
  id,
  children,
}: {
  id: string
  children: ReactNode
}) {
  return (
    <section
      id={id}
      className="relative flex min-h-screen flex-col justify-between px-5 pb-12 pt-24 supports-[height:100svh]:min-h-[100svh] sm:px-8 sm:pt-28 md:px-12 md:pb-16"
    >
      {children}
    </section>
  )
}

/** Breathing room between acts so the scene has scroll distance to animate. */
export function Spacer() {
  return <div className="h-[80vh]" aria-hidden="true" />
}
