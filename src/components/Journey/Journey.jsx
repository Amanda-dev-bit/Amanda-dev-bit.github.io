/* ============================================================
   JOURNEY: work history, education and the services offered.

   The timeline is an ordered list hung off a single hairline
   rail that draws itself once the list enters the viewport.
   Each entry is its own component so it can own a reveal
   observer and a parallax ref for its ghost numeral.
   ============================================================ */

import { useParallax, useReveal } from '../../hooks'
import { Badge, Reveal, SectionHead } from '../ui/index.jsx'
import { services, timeline } from '../../data/experience.js'
import './Journey.css'

/* Kind → the glyph and the word that sit beside every entry. */
const KINDS = {
  work: { label: 'Work', Icon: IconBriefcase },
  education: { label: 'Education', Icon: IconMortarboard },
  milestone: { label: 'Milestone', Icon: IconSpark },
}

/* Only the two live statuses earn a badge; 'past' stays quiet. */
const STATUSES = {
  current: { tone: 'live', label: 'Current' },
  'in-progress': { tone: 'concept', label: 'In progress' },
}

const ordinal = (i) => String(i + 1).padStart(2, '0')

export default function Journey() {
  /* A low threshold: the rail should start drawing as soon as the
     top of the (very tall) list appears, not a fifth of the way in. */
  const [railRef, railInView] = useReveal({ threshold: 0.04, rootMargin: '0px 0px -8% 0px' })

  return (
    <section id="journey" className="section section--alt journey" aria-labelledby="journey-title">
      <div className="container">
        <SectionHead
          id="journey-title"
          eyebrow="The path so far"
          title={
            <>
              My <em>journey</em>
            </>
          }
          lead="Self-taught to begin with, then a formal grounding, and the freelance work that came out of both."
        />

        <ol
          ref={railRef}
          className="journey__timeline"
          data-inview={railInView ? 'true' : 'false'}
          aria-label="Experience and education, most recent first"
        >
          {timeline.map((item, i) => (
            <TimelineEntry key={item.id} item={item} index={i} />
          ))}
        </ol>

        <div className="journey__services">
          <Reveal as="div" className="journey__services-head" variant="fade">
            <h3 className="mono journey__label">How I can help</h3>
            <span className="journey__label-rule" aria-hidden="true" />
          </Reveal>

          <ul className="journey__list">
            {services.map((service, i) => (
              <Reveal
                as="li"
                key={service.id}
                className="journey__service"
                variant="up"
                delay={i * 90}
              >
                <span className="mono journey__service-index" aria-hidden="true">
                  {ordinal(i)}
                </span>
                <h4 className="display h4 journey__service-title">{service.title}</h4>
                <p className="journey__service-text">{service.description}</p>
                <span className="journey__service-arrow" aria-hidden="true">
                  <IconArrow />
                </span>
              </Reveal>
            ))}
          </ul>
        </div>
      </div>
    </section>
  )
}

/* ------------------------------------------------------------
   A single timeline entry.
   ------------------------------------------------------------ */
function TimelineEntry({ item, index }) {
  const [ref, inView] = useReveal({ threshold: 0.12 })
  const ghostRef = useParallax(26)

  const kind = KINDS[item.kind] ?? KINDS.work
  const KindIcon = kind.Icon
  const status = STATUSES[item.status]

  return (
    <li
      ref={ref}
      className="journey__entry"
      data-reveal="up"
      data-inview={inView ? 'true' : 'false'}
      data-status={item.status}
      style={{ '--reveal-delay': `${index * 110}ms` }}
    >
      <span className="journey__marker" aria-hidden="true">
        <span className="journey__dot" />
        {item.status === 'current' && <span className="journey__pulse" />}
      </span>

      <div className="journey__body">
        <span ref={ghostRef} className="journey__ghost" aria-hidden="true">
          {ordinal(index)}
        </span>

        <div className="journey__aside">
          <p className="mono journey__period">{item.period}</p>

          <span className="journey__kind">
            <span className="journey__kind-icon" aria-hidden="true">
              <KindIcon />
            </span>
            <span className="chip journey__kind-chip">{kind.label}</span>
          </span>

          {status && <Badge tone={status.tone}>{status.label}</Badge>}
        </div>

        <div className="journey__main">
          <h3 className="display h3 journey__role">{item.role}</h3>

          <p className="journey__meta">
            <span className="journey__org">{item.org}</span>
            <span className="journey__meta-sep" aria-hidden="true" />
            <span className="journey__place">{item.location}</span>
          </p>

          <p className="body-text journey__summary">{item.summary}</p>

          {item.points?.length > 0 && (
            <ul className="journey__points">
              {item.points.map((point, i) => (
                <li className="journey__point" key={point} style={{ '--i': i }}>
                  {point}
                </li>
              ))}
            </ul>
          )}

          {item.tags?.length > 0 && (
            <ul className="journey__tags">
              {item.tags.map((tag) => (
                <li className="chip journey__tag" key={tag}>
                  {tag}
                </li>
              ))}
            </ul>
          )}
        </div>
      </div>
    </li>
  )
}

/* ------------------------------------------------------------
   Icons: hairline strokes, sized by their container.
   ------------------------------------------------------------ */
const ICON_PROPS = {
  viewBox: '0 0 24 24',
  fill: 'none',
  stroke: 'currentColor',
  strokeWidth: '1.5',
  strokeLinecap: 'round',
  strokeLinejoin: 'round',
  'aria-hidden': 'true',
  focusable: 'false',
}

function IconBriefcase() {
  return (
    <svg {...ICON_PROPS}>
      <path d="M4.25 7.5h15.5a1.75 1.75 0 0 1 1.75 1.75v9a1.75 1.75 0 0 1-1.75 1.75H4.25A1.75 1.75 0 0 1 2.5 18.25v-9A1.75 1.75 0 0 1 4.25 7.5Z" />
      <path d="M9 7.5V6a1.5 1.5 0 0 1 1.5-1.5h3A1.5 1.5 0 0 1 15 6v1.5" />
      <path d="M2.5 12.75h19" />
    </svg>
  )
}

function IconMortarboard() {
  return (
    <svg {...ICON_PROPS}>
      <path d="M12 4.25 2.75 8.75 12 13.25l9.25-4.5L12 4.25Z" />
      <path d="M6.75 10.75v4.6c0 1.6 2.35 2.9 5.25 2.9s5.25-1.3 5.25-2.9v-4.6" />
      <path d="M21.25 8.75v5.5" />
    </svg>
  )
}

function IconSpark() {
  return (
    <svg {...ICON_PROPS}>
      <path d="M13.25 3c.6 4.35 2.6 6.35 6.95 6.95-4.35.6-6.35 2.6-6.95 6.95-.6-4.35-2.6-6.35-6.95-6.95C10.65 9.35 12.65 7.35 13.25 3Z" />
      <path d="M6.9 15.4c.3 2.15 1.3 3.15 3.45 3.45-2.15.3-3.15 1.3-3.45 3.45-.3-2.15-1.3-3.15-3.45-3.45 2.15-.3 3.15-1.3 3.45-3.45Z" />
    </svg>
  )
}

function IconArrow() {
  return (
    <svg {...ICON_PROPS}>
      <path d="M4.5 12h14.25" />
      <path d="m12.75 6.25 6 5.75-6 5.75" />
    </svg>
  )
}
