/* ============================================================
   PRELOADER: the intro curtain.
   Counts 00 → 100 on an eased rAF ramp, unmasks the name, then
   lifts away. `onDone` fires exactly once, as the wipe starts.
   ============================================================ */

import { useCallback, useEffect, useRef, useState } from 'react'

import { useLockBodyScroll, usePrefersReducedMotion } from '../../hooks'
import { clamp } from '../../lib/utils'
import { profile } from '../../data/site.js'
import './Preloader.css'

const COUNT_MS = 1500 // time for the counter to reach 100
const HOLD_MS = 180 // beat at 100 before the curtain moves
const WIPE_MS = 1000 // a touch longer than the CSS wipe (--d-slower)
const SAFETY_MS = 3500 // never leave the site stuck behind the curtain

export default function Preloader({ onDone }) {
  const reduced = usePrefersReducedMotion()
  const [progress, setProgress] = useState(0) // 0 → 1, updated per frame
  const [phase, setPhase] = useState('intro') // 'intro' | 'exit' | 'gone'

  // StrictMode runs effects twice, these refs keep onDone idempotent.
  const doneRef = useRef(false)
  const onDoneRef = useRef(onDone)

  useEffect(() => {
    onDoneRef.current = onDone
  }, [onDone])

  const release = useCallback(() => {
    if (doneRef.current) return
    doneRef.current = true
    if (typeof onDoneRef.current === 'function') onDoneRef.current()
  }, [])

  /* Reduced motion: skip the whole performance. */
  useEffect(() => {
    if (!reduced) return
    release()
    setPhase('gone')
  }, [reduced, release])

  /* The counter: an ease-out rAF ramp, then a short hold at 100. */
  useEffect(() => {
    if (reduced || phase !== 'intro') return

    let frame = 0
    let hold = 0
    let start = 0

    const step = (now) => {
      if (!start) start = now
      const t = clamp((now - start) / COUNT_MS, 0, 1)
      setProgress(1 - (1 - t) * (1 - t)) // easeOutQuad
      if (t < 1) frame = requestAnimationFrame(step)
      else hold = window.setTimeout(() => setPhase('exit'), HOLD_MS)
    }

    frame = requestAnimationFrame(step)
    return () => {
      cancelAnimationFrame(frame)
      window.clearTimeout(hold)
    }
  }, [reduced, phase])

  /* Failsafe: force the hand-over if anything above ever stalls. */
  useEffect(() => {
    if (reduced || phase !== 'intro') return
    const t = window.setTimeout(() => setPhase('exit'), SAFETY_MS)
    return () => window.clearTimeout(t)
  }, [reduced, phase])

  /* Hand the page over as the wipe begins, unmount once it lands. */
  useEffect(() => {
    if (phase !== 'exit') return
    setProgress(1)
    release()
    const t = window.setTimeout(() => setPhase('gone'), WIPE_MS)
    return () => window.clearTimeout(t)
  }, [phase, release])

  useLockBodyScroll(!reduced && phase !== 'gone')

  if (reduced || phase === 'gone') return null

  const readout = String(Math.round(progress * 100)).padStart(2, '0')

  return (
    <div
      className="preloader on-dark"
      data-phase={phase}
      role="status"
      style={{ '--p': progress.toFixed(4) }}
    >
      <p className="sr-only">Loading the portfolio of {profile.fullName}.</p>

      <div className="preloader__inner" aria-hidden="true">
        <span className="preloader__grid" />

        <div className="preloader__top">
          <span className="mono preloader__meta">Portfolio {profile.year}</span>
          <span className="mono preloader__meta preloader__meta--end">{profile.location}</span>
        </div>

        <p className="display preloader__name">
          <span className="line-mask preloader__line">
            <span style={{ '--delay': '200ms' }}>{profile.firstName}</span>
          </span>
          <span className="line-mask preloader__line">
            <span style={{ '--delay': '320ms' }}>
              <em>{profile.lastName}</em>
            </span>
          </span>
        </p>

        <div className="preloader__foot">
          <span className="preloader__role">{profile.role}</span>
          <span className="preloader__count">
            <span className="preloader__digits">{readout}</span>
            <span className="preloader__pct">%</span>
          </span>
        </div>
      </div>

      <div className="preloader__track" aria-hidden="true">
        <span className="preloader__bar" />
      </div>
    </div>
  )
}
