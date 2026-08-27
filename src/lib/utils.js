/* ============================================================
   SMALL SHARED UTILITIES
   ============================================================ */

/* Conditional class names: cx('a', cond && 'b', { c: cond }) */
export function cx(...parts) {
  const out = []
  for (const part of parts) {
    if (!part) continue
    if (typeof part === 'string') out.push(part)
    else if (Array.isArray(part)) out.push(cx(...part))
    else if (typeof part === 'object') {
      for (const [key, value] of Object.entries(part)) if (value) out.push(key)
    }
  }
  return out.join(' ')
}

/* Resolve a public/ asset path against the configured base URL so
   the site works from a domain root or a sub-folder alike. */
export function asset(path = '') {
  const base = import.meta.env.BASE_URL || '/'
  const clean = String(path).replace(/^\/+/, '')
  return `${base}${base.endsWith('/') ? '' : '/'}${clean}`.replace(/([^:]\/)\/+/g, '$1')
}

export const clamp = (v, min, max) => Math.min(max, Math.max(min, v))

export const lerp = (a, b, t) => a + (b - a) * t

/* Split a string into per-character spans carrying a stagger index.
   Returns an array of { char, index, isSpace } for rendering. */
export function splitChars(str, startIndex = 0) {
  return Array.from(String(str)).map((char, i) => ({
    char,
    index: startIndex + i,
    isSpace: char === ' ',
    key: `${i}-${char}`,
  }))
}

/* Smoothly scroll an element into view, honouring reduced motion
   and the fixed header offset. */
export function scrollToId(id, { offset = 0 } = {}) {
  const el = document.getElementById(id)
  if (!el) return
  const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches
  const top = el.getBoundingClientRect().top + window.scrollY - offset
  window.scrollTo({ top, behavior: reduced ? 'auto' : 'smooth' })
}

/* Read a CSS length token (e.g. --header-h) in pixels. */
export function cssPx(name, fallback = 0) {
  if (typeof window === 'undefined') return fallback
  const raw = getComputedStyle(document.documentElement).getPropertyValue(name).trim()
  if (!raw) return fallback
  if (raw.endsWith('px')) return parseFloat(raw)
  if (raw.endsWith('rem')) {
    const root = parseFloat(getComputedStyle(document.documentElement).fontSize) || 16
    return parseFloat(raw) * root
  }
  const n = parseFloat(raw)
  return Number.isFinite(n) ? n : fallback
}

export const prefersReducedMotion = () =>
  typeof window !== 'undefined' &&
  window.matchMedia('(prefers-reduced-motion: reduce)').matches
