/* ============================================================
   CURSOR: a bespoke pointer for fine-pointer devices.

   Two independent trackers: a dot pinned exactly to the pointer
   and a hairline ring that trails it. Both are driven from a
   single requestAnimationFrame loop writing transforms straight
   onto the DOM nodes: no React state, so a pointermove never
   costs a render. Every visual state is a data-attribute on the
   root, which flips CSS custom properties the shapes read.
   ============================================================ */

import { useEffect, useRef } from 'react'

import { useFinePointer, usePrefersReducedMotion } from '../../hooks'
import { lerp } from '../../lib/utils'
import './Cursor.css'

/* What counts as "interactive" under the pointer. */
const HOVER_TARGETS = 'a[href], button, [role="button"], [data-cursor="hover"]'
const VIEW_TARGETS = '[data-cursor="view"]'

const DEFAULT_LABEL = 'View'
/* Follow factor for the trailing ring, lower is lazier. */
const FOLLOW = 0.17
/* Sub-pixel threshold at which the loop parks itself. */
const SETTLED = 0.08
/* Minimum gap between re-tests of what sits under a static pointer. */
const HIT_INTERVAL = 110

export default function Cursor() {
  const fine = useFinePointer()
  const reduced = usePrefersReducedMotion()
  const active = fine && !reduced

  const rootRef = useRef(null)
  const lagRef = useRef(null)
  const dotRef = useRef(null)
  const labelRef = useRef(null)

  useEffect(() => {
    if (!active) return

    const root = rootRef.current
    const lag = lagRef.current
    const dot = dotRef.current
    const label = labelRef.current
    if (!root || !lag || !dot) return

    const body = document.body
    body.dataset.customCursor = 'on'

    /* Pointer position (px, py) and the trailing ring (rx, ry). */
    let px = window.innerWidth / 2
    let py = window.innerHeight / 2
    let rx = px
    let ry = py

    let frame = 0
    let mode = 'idle'
    let lastHit = 0

    /* ---- the single animation loop -------------------------- */
    const paint = () => {
      frame = 0
      rx = lerp(rx, px, FOLLOW)
      ry = lerp(ry, py, FOLLOW)

      const settled = Math.abs(px - rx) < SETTLED && Math.abs(py - ry) < SETTLED
      if (settled) {
        rx = px
        ry = py
      }

      lag.style.transform = `translate3d(${rx.toFixed(2)}px, ${ry.toFixed(2)}px, 0)`
      dot.style.transform = `translate3d(${px.toFixed(2)}px, ${py.toFixed(2)}px, 0)`

      /* Park the loop once the ring has caught up; a pointermove
         wakes it again. Nothing spins while the pointer rests. */
      if (!settled) frame = requestAnimationFrame(paint)
    }

    const kick = () => {
      if (!frame) frame = requestAnimationFrame(paint)
    }

    /* ---- state ---------------------------------------------- */
    const setMode = (next) => {
      if (next === mode) return
      mode = next
      root.dataset.mode = next
    }

    const evaluate = (target) => {
      if (!target || typeof target.closest !== 'function') {
        setMode('idle')
        return
      }
      const view = target.closest(VIEW_TARGETS)
      if (view) {
        const text = view.getAttribute('data-cursor-label') || DEFAULT_LABEL
        if (label && label.textContent !== text) label.textContent = text
        setMode('view')
        return
      }
      setMode(target.closest(HOVER_TARGETS) ? 'hover' : 'idle')
    }

    const hide = () => {
      root.dataset.visible = 'false'
      root.dataset.down = 'false'
      setMode('idle')
    }

    /* ---- listeners ------------------------------------------ */
    const onMove = (e) => {
      if (e.pointerType === 'touch') return
      px = e.clientX
      py = e.clientY
      if (root.dataset.visible !== 'true') {
        /* Snap on first sighting so it never swoops in from 0,0. */
        rx = px
        ry = py
        root.dataset.visible = 'true'
      }
      kick()
    }

    const onOver = (e) => {
      if (e.pointerType === 'touch') return
      evaluate(e.target)
    }

    /* relatedTarget is null only when the pointer leaves the window. */
    const onOut = (e) => {
      if (!e.relatedTarget) hide()
    }

    const onDown = (e) => {
      if (e.pointerType === 'touch') return
      root.dataset.down = 'true'
    }

    const onUp = () => {
      root.dataset.down = 'false'
    }

    /* Scrolling moves the page under a resting pointer, so re-test
       what it is over: throttled, since this is a hit test. */
    const onScroll = () => {
      if (root.dataset.visible !== 'true') return
      const now = performance.now()
      if (now - lastHit < HIT_INTERVAL) return
      lastHit = now
      evaluate(document.elementFromPoint(px, py))
    }

    window.addEventListener('pointermove', onMove, { passive: true })
    document.addEventListener('pointerover', onOver, { passive: true })
    document.addEventListener('pointerout', onOut, { passive: true })
    window.addEventListener('pointerdown', onDown, { passive: true })
    window.addEventListener('pointerup', onUp, { passive: true })
    window.addEventListener('pointercancel', onUp, { passive: true })
    window.addEventListener('blur', hide)
    document.addEventListener('scroll', onScroll, { passive: true, capture: true })

    return () => {
      if (frame) cancelAnimationFrame(frame)
      window.removeEventListener('pointermove', onMove)
      document.removeEventListener('pointerover', onOver)
      document.removeEventListener('pointerout', onOut)
      window.removeEventListener('pointerdown', onDown)
      window.removeEventListener('pointerup', onUp)
      window.removeEventListener('pointercancel', onUp)
      window.removeEventListener('blur', hide)
      document.removeEventListener('scroll', onScroll, true)
      delete body.dataset.customCursor
    }
  }, [active])

  /* Touch, coarse pointers and reduced-motion users get the real
     cursor and nothing else: the body flag is never written. */
  if (!active) return null

  return (
    <div
      ref={rootRef}
      className="cursor"
      data-mode="idle"
      data-visible="false"
      data-down="false"
      aria-hidden="true"
    >
      <div ref={lagRef} className="cursor__lag">
        <div className="cursor__stack">
          <span className="cursor__ring" />
          <span className="cursor__halo" />
          <span ref={labelRef} className="cursor__label">
            {DEFAULT_LABEL}
          </span>
        </div>
      </div>

      <div ref={dotRef} className="cursor__dot">
        <span className="cursor__dot-shape" />
      </div>
    </div>
  )
}
