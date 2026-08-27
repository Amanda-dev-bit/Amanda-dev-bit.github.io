/* ============================================================
   CRAFT: the skills section.

   Four disciplines set as an editorial list rather than a row of
   cards: hairline-separated full-width rows that break into
   [ index + glyph ] [ title + blurb + tags ] [ meters ] at 900px.

   Each row owns its own IntersectionObserver. The single
   data-inview flag it produces drives three things at once: the
   row's rise, the staggered scaleX of the proficiency bars, and
   the count-up of the numbers beside them, so the figure and the
   bar always land together.
   ============================================================ */

import { useEffect, useState } from 'react'

import { useCountUp, usePrefersReducedMotion, useReveal } from '../../hooks'
import { Reveal, SectionHead } from '../ui/index.jsx'
import { disciplines, toolbelt } from '../../data/skills.js'
import './Craft.css'

/* Kept in step with --meter-step / --meter-lead in Craft.css so the
   number and the bar it belongs to move on the same beat. */
const METER_STEP = 110
const METER_LEAD = 200
const COUNT_MS = 1100

export default function Craft() {
  return (
    <section id="craft" className="section craft" aria-labelledby="craft-title">
      <div className="container">
        <div className="craft__head">
          <SectionHead
            id="craft-title"
            className="craft__head-main"
            eyebrow="What I do"
            title={[
              <span key="craft-title-line">
                My <em>craft</em>
              </span>,
            ]}
            lead="I work end to end, so the wireframe, the design system, the components and the deploy all stay part of the same conversation."
          />

          <Reveal as="p" className="craft__note" variant="fade" delay={380}>
            The levels below are my own read on where my confidence sits today.
            They are not a certificate.
          </Reveal>
        </div>

        <ol className="craft__list">
          {disciplines.map((discipline) => (
            <Discipline key={discipline.id} discipline={discipline} />
          ))}
        </ol>

        <Toolbelt />
      </div>
    </section>
  )
}

/* ------------------------------------------------------------
   One discipline: a single row of the list.
   `--tone` carries the discipline's own accent down to the edge
   bar, the glyph and the meter fills.
   ------------------------------------------------------------ */
function Discipline({ discipline }) {
  const [ref, inView] = useReveal({ threshold: 0.2 })
  const Glyph = GLYPHS[discipline.icon] ?? GLYPHS.palette

  return (
    <li
      ref={ref}
      className="craft__row"
      data-reveal="up"
      data-inview={inView ? 'true' : 'false'}
      style={{ '--tone': discipline.accent }}
    >
      <span className="craft__edge" aria-hidden="true" />

      <div className="craft__mark">
        <span className="craft__index" aria-hidden="true">
          {discipline.index}
        </span>
        <span className="craft__glyph" aria-hidden="true">
          <Glyph />
        </span>
      </div>

      <div className="craft__body">
        <h3 className="display h3 craft__title">{discipline.title}</h3>
        <p className="body-text craft__blurb">{discipline.blurb}</p>
        <ul className="craft__tags">
          {discipline.tags.map((tag) => (
            <li key={tag} className="chip">
              {tag}
            </li>
          ))}
        </ul>
      </div>

      <div className="craft__meters">
        {discipline.skills.map((skill, i) => (
          <Meter key={skill.name} skill={skill} index={i} active={inView} />
        ))}
      </div>
    </li>
  )
}

/* ------------------------------------------------------------
   Meter: name, figure, and a 2px track whose fill scales out.
   The visible head is decorative (the number is mid-animation);
   the track itself carries the real value to assistive tech.
   ------------------------------------------------------------ */
function Meter({ skill, index, active }) {
  const reduced = usePrefersReducedMotion()
  const [armed, setArmed] = useState(false)

  /* Hold the count back by the same beat the CSS holds the bar. */
  useEffect(() => {
    if (!active || armed) return
    if (reduced) {
      setArmed(true)
      return
    }
    const t = window.setTimeout(() => setArmed(true), METER_LEAD + index * METER_STEP)
    return () => window.clearTimeout(t)
  }, [active, armed, index, reduced])

  const shown = useCountUp(skill.level, { duration: COUNT_MS, start: armed })

  return (
    <div className="craft__meter" style={{ '--level': skill.level / 100, '--i': index }}>
      <p className="craft__meter-head" aria-hidden="true">
        <span className="craft__meter-name">{skill.name}</span>
        <span className="mono craft__meter-value">
          {shown}
          <span className="craft__meter-pct">%</span>
        </span>
      </p>

      <span
        className="craft__track"
        role="meter"
        aria-label={`${skill.name} proficiency`}
        aria-valuenow={skill.level}
        aria-valuemin={0}
        aria-valuemax={100}
      >
        <span className="craft__fill" />
      </span>
    </div>
  )
}

/* ------------------------------------------------------------
   Toolbelt: one wrapping row of chips under a tracked label.
   A single observer on the wrapper staggers every chip through
   an inline --i, so thirteen items cost one observer.
   ------------------------------------------------------------ */
function Toolbelt() {
  const [ref, inView] = useReveal({ threshold: 0.15 })

  return (
    <div
      ref={ref}
      className="craft__toolbelt"
      data-inview={inView ? 'true' : 'false'}
    >
      <div className="craft__toolbelt-head">
        <h3 className="mono craft__toolbelt-label" id="craft-toolbelt">
          Toolbelt
        </h3>
        <span className="craft__toolbelt-rule" aria-hidden="true" />
      </div>

      <ul className="craft__tools" aria-labelledby="craft-toolbelt">
        {toolbelt.map((tool, i) => (
          <li key={tool} className="chip craft__tool" style={{ '--i': i }}>
            {tool}
          </li>
        ))}
      </ul>
    </div>
  )
}

/* ------------------------------------------------------------
   GLYPHS: one hairline mark per discipline.
   ------------------------------------------------------------ */

const glyphProps = {
  viewBox: '0 0 24 24',
  fill: 'none',
  stroke: 'currentColor',
  strokeWidth: 1.5,
  strokeLinecap: 'round',
  strokeLinejoin: 'round',
  'aria-hidden': 'true',
  focusable: 'false',
}

function PaletteGlyph() {
  return (
    <svg {...glyphProps}>
      <path d="M12 2.75a9.25 9.25 0 0 0 0 18.5h1.6a1.85 1.85 0 0 0 1.4-3.06 1.85 1.85 0 0 1 1.4-3.06h1.3a3.55 3.55 0 0 0 3.55-3.55c0-4.6-4.1-8.83-9.25-8.83Z" />
      <path d="M8.4 7.6h.01" />
      <path d="M6.6 12.4h.01" />
      <path d="M13.3 6.4h.01" />
      <path d="M17 10.3h.01" />
    </svg>
  )
}

function CodeGlyph() {
  return (
    <svg {...glyphProps}>
      <path d="M8.75 16.75 4 12l4.75-4.75" />
      <path d="M15.25 7.25 20 12l-4.75 4.75" />
      <path d="M13.4 4.5 10.6 19.5" />
    </svg>
  )
}

function ServerGlyph() {
  return (
    <svg {...glyphProps}>
      <rect x="2.75" y="3.75" width="18.5" height="6.25" rx="1.75" />
      <rect x="2.75" y="14" width="18.5" height="6.25" rx="1.75" />
      <path d="M6.25 6.9h.01" />
      <path d="M6.25 17.15h.01" />
      <path d="M15.5 6.9h3" />
      <path d="M15.5 17.15h3" />
    </svg>
  )
}

function GitGlyph() {
  return (
    <svg {...glyphProps}>
      <circle cx="17.5" cy="6.25" r="2.75" />
      <circle cx="6.5" cy="17.75" r="2.75" />
      <path d="M6.5 3.25V15" />
      <path d="M17.5 9a8.5 8.5 0 0 1-8.25 8.75" />
    </svg>
  )
}

const GLYPHS = {
  palette: PaletteGlyph,
  code: CodeGlyph,
  server: ServerGlyph,
  git: GitGlyph,
}
