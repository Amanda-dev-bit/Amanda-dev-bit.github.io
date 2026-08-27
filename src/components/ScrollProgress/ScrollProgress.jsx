/* ============================================================
   SCROLLPROGRESS: the reading position, stated twice.

   A hairline ruled across the top of the page, and a dial in the
   bottom corner that doubles as the way back up. Both read the
   same 0..1 value from useScrollProgress() and hand it to CSS as
   a single custom property (--p); nothing here measures or
   animates anything itself, so a scroll costs one style write.
   ============================================================ */

import { useCallback, useEffect, useRef, useState } from 'react'

import { usePrefersReducedMotion, useScrollProgress } from '../../hooks'
import './ScrollProgress.css'

/* The rule stays out of sight until the page has actually moved,
   so it never sits under the header as a stub. */
const BAR_IN = 0.004

/* The dial arrives at 15% and only leaves again at 10%. The gap is
   deliberate: without it, a scroll that settles exactly on the
   threshold would flicker the control in and out. */
const RING_IN = 0.15
const RING_OUT = 0.1

export default function ScrollProgress() {
  const progress = useScrollProgress()
  const reduced = usePrefersReducedMotion()

  const buttonRef = useRef(null)
  const [ringVisible, setRingVisible] = useState(false)

  /* Hysteresis, expressed as a no-op-when-unchanged setState. */
  useEffect(() => {
    setRingVisible((visible) => (visible ? progress > RING_OUT : progress > RING_IN))
  }, [progress])

  const toTop = useCallback(() => {
    window.scrollTo({ top: 0, behavior: reduced ? 'auto' : 'smooth' })
    /* The control is about to fade out from under the pointer, so
       hand focus back to the document, the next Tab then starts
       from the top of the page rather than from a hidden button. */
    buttonRef.current?.blur()
  }, [reduced])

  /* Four decimals is well past sub-pixel on any dimension we drive. */
  const p = progress.toFixed(4)

  return (
    <>
      <div
        className="scrollprog__bar"
        data-active={progress > BAR_IN ? 'true' : 'false'}
        style={{ '--p': p }}
        aria-hidden="true"
      >
        <span className="scrollprog__fill" />
      </div>

      <button
        ref={buttonRef}
        type="button"
        className="scrollprog__ring"
        onClick={toTop}
        aria-label="Back to top"
        aria-hidden={ringVisible ? undefined : 'true'}
        tabIndex={ringVisible ? 0 : -1}
        data-visible={ringVisible ? 'true' : 'false'}
        style={{ '--p': p }}
      >
        <svg
          className="scrollprog__dial"
          viewBox="0 0 48 48"
          aria-hidden="true"
          focusable="false"
        >
          <defs>
            {/* Same clay → gold sweep the top rule uses. */}
            <linearGradient id="scrollprog-sweep" x1="0" y1="0" x2="1" y2="1">
              <stop className="scrollprog__stop-a" offset="0" />
              <stop className="scrollprog__stop-b" offset="1" />
            </linearGradient>
          </defs>

          {/* pathLength normalises the circumference to 100, so the
              dash maths below is plain percentage arithmetic. */}
          <circle className="scrollprog__track" cx="24" cy="24" r="21" pathLength="100" />
          <circle
            className="scrollprog__sweep"
            cx="24"
            cy="24"
            r="21"
            pathLength="100"
            stroke="url(#scrollprog-sweep)"
          />
        </svg>

        <span className="scrollprog__glyph" aria-hidden="true">
          <ArrowUpIcon className="scrollprog__arrow" />
          <ArrowUpIcon className="scrollprog__arrow scrollprog__arrow--ghost" />
        </span>
      </button>
    </>
  )
}

/* ---- icons --------------------------------------------------- */

function ArrowUpIcon({ className }) {
  return (
    <svg
      className={className}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.5"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
      focusable="false"
    >
      <path d="M12 19V5" />
      <path d="m5 12 7-7 7 7" />
    </svg>
  )
}
