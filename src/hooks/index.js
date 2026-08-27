/* ============================================================
   HOOKS
   Shared behaviour for every component. All motion hooks bail
   out cleanly when the user prefers reduced motion.
   ============================================================ */

import { useCallback, useEffect, useMemo, useRef, useState } from 'react'

/* ---- media queries ----------------------------------------- */

export function useMediaQuery(query) {
  const [matches, setMatches] = useState(() => {
    if (typeof window === 'undefined') return false
    return window.matchMedia(query).matches
  })

  useEffect(() => {
    const mql = window.matchMedia(query)
    const onChange = (e) => setMatches(e.matches)
    setMatches(mql.matches)
    mql.addEventListener('change', onChange)
    return () => mql.removeEventListener('change', onChange)
  }, [query])

  return matches
}

export const usePrefersReducedMotion = () =>
  useMediaQuery('(prefers-reduced-motion: reduce)')

export const useFinePointer = () =>
  useMediaQuery('(hover: hover) and (pointer: fine)')

/* ---- scroll reveal ------------------------------------------
   Attach the returned ref to any element. Once it enters the
   viewport it gets data-inview="true", the CSS in
   styles/animations.css does the rest.
   ------------------------------------------------------------ */

export function useReveal({ threshold = 0.16, rootMargin = '0px 0px -12% 0px', once = true } = {}) {
  const ref = useRef(null)
  const [inView, setInView] = useState(false)

  useEffect(() => {
    const el = ref.current
    if (!el) return

    if (!('IntersectionObserver' in window)) {
      setInView(true)
      return
    }

    const io = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setInView(true)
          if (once) io.unobserve(el)
        } else if (!once) {
          setInView(false)
        }
      },
      { threshold, rootMargin },
    )

    io.observe(el)

    /* The negative bottom rootMargin holds a reveal back until the
       element is properly inside the viewport. Nothing in the last
       screenful of the document can ever clear it, the page runs
       out of scroll before the element clears the margin, so it
       would sit hidden forever. The footer's bottom bar sat at
       opacity 0 for exactly that reason. Once the page bottom is
       reached, anything still hidden but genuinely on screen is
       revealed directly. */
    let frame = 0

    const stop = () => {
      window.removeEventListener('scroll', onScroll)
      window.removeEventListener('resize', onScroll)
    }

    const reveal = () => {
      frame = 0
      const atEnd =
        window.innerHeight + window.scrollY >=
        document.documentElement.scrollHeight - 2
      if (!atEnd) return
      const rect = el.getBoundingClientRect()
      if (rect.top >= window.innerHeight || rect.bottom <= 0) return
      setInView(true)
      io.unobserve(el)
      stop()
    }

    function onScroll() {
      if (!frame) frame = requestAnimationFrame(reveal)
    }

    /* Only meaningful for a one-shot reveal; a repeating one is meant
       to track the viewport, and forcing it true would fight that. */
    if (once) {
      window.addEventListener('scroll', onScroll, { passive: true })
      window.addEventListener('resize', onScroll, { passive: true })
      reveal()
    }

    return () => {
      if (frame) cancelAnimationFrame(frame)
      stop()
      io.disconnect()
    }
  }, [threshold, rootMargin, once])

  return [ref, inView]
}

/* Reveals a list of children in sequence via a --reveal-delay var. */
export function useStaggerDelay(index, step = 90, base = 0) {
  return useMemo(
    () => ({ '--reveal-delay': `${base + index * step}ms` }),
    [index, step, base],
  )
}

/* ---- page scroll -------------------------------------------- */

export function useScrollProgress() {
  const [progress, setProgress] = useState(0)

  useEffect(() => {
    let frame = 0
    const update = () => {
      frame = 0
      const doc = document.documentElement
      const max = doc.scrollHeight - window.innerHeight
      setProgress(max > 0 ? Math.min(1, Math.max(0, window.scrollY / max)) : 0)
    }
    const onScroll = () => {
      if (!frame) frame = requestAnimationFrame(update)
    }
    update()
    window.addEventListener('scroll', onScroll, { passive: true })
    window.addEventListener('resize', onScroll, { passive: true })
    return () => {
      if (frame) cancelAnimationFrame(frame)
      window.removeEventListener('scroll', onScroll)
      window.removeEventListener('resize', onScroll)
    }
  }, [])

  return progress
}

export function useScrolled(offset = 24) {
  const [scrolled, setScrolled] = useState(false)
  useEffect(() => {
    let frame = 0
    const update = () => {
      frame = 0
      setScrolled(window.scrollY > offset)
    }
    const onScroll = () => {
      if (!frame) frame = requestAnimationFrame(update)
    }
    update()
    window.addEventListener('scroll', onScroll, { passive: true })
    return () => {
      if (frame) cancelAnimationFrame(frame)
      window.removeEventListener('scroll', onScroll)
    }
  }, [offset])
  return scrolled
}

/* Which section id is currently in view, drives nav highlighting. */
export function useActiveSection(ids, { offset = 0.35 } = {}) {
  // Starts as null: while the hero fills the screen no nav item is
  // current, and marking the first one active would be a lie.
  const [active, setActive] = useState(null)
  const key = ids.join('|')

  useEffect(() => {
    const sections = key
      .split('|')
      .map((id) => document.getElementById(id))
      .filter(Boolean)
    if (!sections.length) return

    let frame = 0
    const update = () => {
      frame = 0
      const line = window.innerHeight * offset
      let current = null
      for (const el of sections) {
        if (el.getBoundingClientRect().top <= line) current = el.id
      }
      // Pin the last section once the page bottom is reached.
      if (window.innerHeight + window.scrollY >= document.documentElement.scrollHeight - 4) {
        current = sections[sections.length - 1].id
      }
      setActive(current)
    }
    const onScroll = () => {
      if (!frame) frame = requestAnimationFrame(update)
    }
    update()
    window.addEventListener('scroll', onScroll, { passive: true })
    window.addEventListener('resize', onScroll, { passive: true })
    return () => {
      if (frame) cancelAnimationFrame(frame)
      window.removeEventListener('scroll', onScroll)
      window.removeEventListener('resize', onScroll)
    }
  }, [key, offset])

  return active
}

/* ---- parallax ----------------------------------------------
   Returns a ref; the element gets a --parallax custom property
   in pixels that CSS can use inside a transform.
   ------------------------------------------------------------ */

export function useParallax(strength = 60) {
  const ref = useRef(null)
  const reduced = usePrefersReducedMotion()

  useEffect(() => {
    const el = ref.current
    if (!el || reduced || strength === 0) return

    let frame = 0
    const update = () => {
      frame = 0
      const rect = el.getBoundingClientRect()
      const vh = window.innerHeight
      if (rect.bottom < -vh * 0.5 || rect.top > vh * 1.5) return
      // -1 (below the fold) .. 1 (above it)
      const centre = rect.top + rect.height / 2
      const t = (centre - vh / 2) / (vh / 2 + rect.height / 2)
      el.style.setProperty('--parallax', `${(-t * strength).toFixed(2)}px`)
    }
    const onScroll = () => {
      if (!frame) frame = requestAnimationFrame(update)
    }
    update()
    window.addEventListener('scroll', onScroll, { passive: true })
    window.addEventListener('resize', onScroll, { passive: true })
    return () => {
      if (frame) cancelAnimationFrame(frame)
      window.removeEventListener('scroll', onScroll)
      window.removeEventListener('resize', onScroll)
      el.style.removeProperty('--parallax')
    }
  }, [strength, reduced])

  return ref
}

/* ---- magnetic hover ----------------------------------------
   Pulls the element gently toward the pointer. Sets --mx/--my.
   ------------------------------------------------------------ */

export function useMagnetic(strength = 0.32, radius = 90) {
  const ref = useRef(null)
  const fine = useFinePointer()
  const reduced = usePrefersReducedMotion()

  useEffect(() => {
    const el = ref.current
    if (!el || !fine || reduced) return

    let frame = 0
    let target = { x: 0, y: 0 }

    // getBoundingClientRect forces a layout flush, and this runs on every
    // pointermove for every magnetic element on the page. Cache it and
    // invalidate only when something could actually have moved it.
    let rect = null
    const invalidate = () => {
      rect = null
    }

    const apply = () => {
      frame = 0
      el.style.setProperty('--mx', `${target.x.toFixed(2)}px`)
      el.style.setProperty('--my', `${target.y.toFixed(2)}px`)
    }

    const onMove = (e) => {
      if (!rect) rect = el.getBoundingClientRect()
      const cx = rect.left + rect.width / 2
      const cy = rect.top + rect.height / 2
      const dx = e.clientX - cx
      const dy = e.clientY - cy
      const dist = Math.hypot(dx, dy)
      const reach = Math.max(rect.width, rect.height) / 2 + radius
      if (dist > reach) {
        target = { x: 0, y: 0 }
      } else {
        const falloff = 1 - dist / reach
        target = { x: dx * strength * falloff, y: dy * strength * falloff }
      }
      if (!frame) frame = requestAnimationFrame(apply)
    }

    const onLeave = () => {
      target = { x: 0, y: 0 }
      if (!frame) frame = requestAnimationFrame(apply)
    }

    window.addEventListener('pointermove', onMove, { passive: true })
    window.addEventListener('scroll', invalidate, { passive: true })
    window.addEventListener('resize', invalidate, { passive: true })
    el.addEventListener('pointerleave', onLeave)
    return () => {
      if (frame) cancelAnimationFrame(frame)
      window.removeEventListener('pointermove', onMove)
      window.removeEventListener('scroll', invalidate)
      window.removeEventListener('resize', invalidate)
      el.removeEventListener('pointerleave', onLeave)
      el.style.removeProperty('--mx')
      el.style.removeProperty('--my')
    }
  }, [strength, radius, fine, reduced])

  return ref
}

/* ---- 3D tilt on hover --------------------------------------- */

export function useTilt(max = 7) {
  const ref = useRef(null)
  const fine = useFinePointer()
  const reduced = usePrefersReducedMotion()

  useEffect(() => {
    const el = ref.current
    if (!el || !fine || reduced) return

    let frame = 0
    let rx = 0
    let ry = 0
    let px = 50
    let py = 50

    const apply = () => {
      frame = 0
      el.style.setProperty('--rx', `${rx.toFixed(2)}deg`)
      el.style.setProperty('--ry', `${ry.toFixed(2)}deg`)
      el.style.setProperty('--px', `${px.toFixed(1)}%`)
      el.style.setProperty('--py', `${py.toFixed(1)}%`)
    }

    const onMove = (e) => {
      const rect = el.getBoundingClientRect()
      const x = (e.clientX - rect.left) / rect.width
      const y = (e.clientY - rect.top) / rect.height
      ry = (x - 0.5) * max * 2
      rx = -(y - 0.5) * max * 2
      px = x * 100
      py = y * 100
      if (!frame) frame = requestAnimationFrame(apply)
    }

    const onLeave = () => {
      rx = 0
      ry = 0
      px = 50
      py = 50
      if (!frame) frame = requestAnimationFrame(apply)
    }

    el.addEventListener('pointermove', onMove)
    el.addEventListener('pointerleave', onLeave)
    return () => {
      if (frame) cancelAnimationFrame(frame)
      el.removeEventListener('pointermove', onMove)
      el.removeEventListener('pointerleave', onLeave)
    }
  }, [max, fine, reduced])

  return ref
}

/* ---- count-up ----------------------------------------------- */

export function useCountUp(target, { duration = 1600, start = false } = {}) {
  const [value, setValue] = useState(0)
  const reduced = usePrefersReducedMotion()

  useEffect(() => {
    if (!start) return
    if (reduced) {
      setValue(target)
      return
    }
    let frame = 0
    let t0 = null
    const step = (ts) => {
      if (t0 === null) t0 = ts
      const p = Math.min(1, (ts - t0) / duration)
      // easeOutExpo
      const eased = p === 1 ? 1 : 1 - Math.pow(2, -10 * p)
      setValue(Math.round(target * eased))
      if (p < 1) frame = requestAnimationFrame(step)
    }
    frame = requestAnimationFrame(step)
    return () => cancelAnimationFrame(frame)
  }, [target, duration, start, reduced])

  return value
}

/* ---- body scroll lock (modal / mobile menu) ------------------ */

/* Reference-counted, because more than one thing can want the page held
   still at the same time: the intro curtain overlapping a modal, or the
   mobile menu overlapping the project dialog. Without the count, the
   first of them to unmount releases the lock for all of them and the
   page scrolls away behind whatever is still open. */
let scrollLocks = 0
let paddingBeforeLock = ''

export function useLockBodyScroll(locked) {
  useEffect(() => {
    if (!locked) return

    const { body, documentElement: html } = document
    if (scrollLocks === 0) {
      const scrollBarWidth = window.innerWidth - html.clientWidth
      paddingBeforeLock = body.style.paddingRight
      if (scrollBarWidth > 0) body.style.paddingRight = `${scrollBarWidth}px`
      body.dataset.scrollLocked = 'true'
    }
    scrollLocks += 1

    return () => {
      scrollLocks = Math.max(0, scrollLocks - 1)
      if (scrollLocks === 0) {
        delete body.dataset.scrollLocked
        body.style.paddingRight = paddingBeforeLock
      }
    }
  }, [locked])
}

/* ---- escape key --------------------------------------------- */

export function useEscapeKey(handler, active = true) {
  useEffect(() => {
    if (!active) return
    const onKey = (e) => {
      if (e.key === 'Escape') handler(e)
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [handler, active])
}

/* ---- focus trap --------------------------------------------- */

const FOCUSABLE =
  'a[href], button:not([disabled]), textarea, input, select, [tabindex]:not([tabindex="-1"])'

export function useFocusTrap(active) {
  const ref = useRef(null)

  useEffect(() => {
    if (!active) return
    const node = ref.current
    if (!node) return

    const previous = document.activeElement
    const focusables = () =>
      Array.from(node.querySelectorAll(FOCUSABLE)).filter(
        (el) => el.offsetParent !== null || el === document.activeElement,
      )

    const first = focusables()[0]
    if (first) first.focus()
    else node.focus()

    const onKey = (e) => {
      if (e.key !== 'Tab') return
      const items = focusables()
      if (!items.length) {
        e.preventDefault()
        node.focus()
        return
      }
      const firstEl = items[0]
      const lastEl = items[items.length - 1]
      const current = document.activeElement

      // Focus can end up outside the trap without a Tab ever crossing the
      // boundary: removing the focused node (closing a nested lightbox,
      // swapping to another project) resets activeElement to <body>. Pull
      // it back in rather than letting Tab walk the page behind the dialog.
      if (!node.contains(current)) {
        e.preventDefault()
        ;(e.shiftKey ? lastEl : firstEl).focus()
        return
      }

      if (e.shiftKey && current === firstEl) {
        e.preventDefault()
        lastEl.focus()
      } else if (!e.shiftKey && current === lastEl) {
        e.preventDefault()
        firstEl.focus()
      }
    }

    // Bound to the document, not the node: a listener on the node only sees
    // keys that bubble out of it, which is exactly what stops working the
    // moment focus escapes.
    document.addEventListener('keydown', onKey, true)
    return () => {
      document.removeEventListener('keydown', onKey, true)
      if (previous instanceof HTMLElement && document.contains(previous)) {
        previous.focus()
      }
    }
  }, [active])

  return ref
}

/* ---- theme --------------------------------------------------- */

const THEME_KEY = 'amanda-theme'

export function useTheme() {
  const storedTheme = (() => {
    if (typeof window === 'undefined') return null
    try {
      const value = localStorage.getItem(THEME_KEY)
      return value === 'light' || value === 'dark' ? value : null
    } catch {
      return null
    }
  })()

  const [theme, setTheme] = useState(
    () =>
      storedTheme ??
      (typeof window !== 'undefined' &&
      window.matchMedia('(prefers-color-scheme: dark)').matches
        ? 'dark'
        : 'light'),
  )

  // Only a deliberate toggle is written to storage. Persisting the value we
  // derived from prefers-color-scheme on first visit would pin the choice
  // and stop the site ever following the OS again.
  const chosen = useRef(Boolean(storedTheme))

  useEffect(() => {
    document.documentElement.setAttribute('data-theme', theme)
    if (!chosen.current) return
    try {
      localStorage.setItem(THEME_KEY, theme)
    } catch {
      /* private mode: the theme still applies for this visit */
    }
  }, [theme])

  // Keep following the OS until the visitor states a preference.
  useEffect(() => {
    const mql = window.matchMedia('(prefers-color-scheme: dark)')
    const onChange = (e) => {
      if (chosen.current) return
      let stored = null
      try {
        stored = localStorage.getItem(THEME_KEY)
      } catch {
        /* ignore */
      }
      if (stored !== 'light' && stored !== 'dark') setTheme(e.matches ? 'dark' : 'light')
    }
    mql.addEventListener('change', onChange)
    return () => mql.removeEventListener('change', onChange)
  }, [])

  const toggle = useCallback(() => {
    chosen.current = true
    setTheme((t) => (t === 'dark' ? 'light' : 'dark'))
  }, [])

  return [theme, toggle]
}
