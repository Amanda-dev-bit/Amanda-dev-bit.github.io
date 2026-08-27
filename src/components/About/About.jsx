/* ============================================================
   ABOUT: the portrait plate, the story, the facts, the count.

   Layout is a deliberate 42/58 split: the portrait plate sits in
   the narrow column and sticks while the story scrolls past it.
   Depth in the plate comes from three offset rectangles, a clay
   block behind, the image, an accent hairline in front, never a
   drop shadow.

   The stats strip owns a single IntersectionObserver; its inView
   flag is handed to every counter so all three numbers start on
   the same frame.
   ============================================================ */

import { useCountUp, useParallax, useReveal } from '../../hooks'
import { asset, cx } from '../../lib/utils'
import { ActionLink, MaskText, Reveal } from '../ui/index.jsx'
import { profile, stats } from '../../data/site.js'
import './About.css'

/* Built here rather than passed to SectionHead so the accent word
   can carry real <em> emphasis. MaskText renders nodes per line. */
const TITLE_LINES = [
  'I design it,',
  <>
    then I <em>build</em> it.
  </>,
]

export default function About() {
  /* The plate: one observer drives the unroll of the window and
     the two rectangles sliding out from under it. */
  const [frameRef, frameInView] = useReveal({ threshold: 0.2 })
  /* Parallax rides a wrapper, leaving the image free to scale on
     hover without the two transforms fighting each other. */
  const panRef = useParallax(40)
  /* One observer for the whole strip, see the note above. */
  const [statsRef, statsInView] = useReveal({ threshold: 0.2 })

  return (
    <section id="about" className="section section--alt about" aria-labelledby="about-title">
      <div className="container">
        <div className="about__grid">
          {/* ---- story ------------------------------------------- */}
          <div className="about__body">
            <header className="section-head about__head">
              <Reveal as="p" className="eyebrow" variant="fade">
                About me
              </Reveal>

              <MaskText
                as="h2"
                id="about-title"
                className="display h2 about__title"
                lines={TITLE_LINES}
                delay={90}
                step={120}
              />

              <Reveal as="p" className="lead about__lead" delay={320}>
                {profile.tagline}
              </Reveal>
            </header>

            <div className="about__prose">
              {profile.bio.map((paragraph, i) => (
                <Reveal
                  as="p"
                  key={i}
                  className={cx('body-text', 'about__para', i === 0 && 'about__para--open')}
                  delay={80 + i * 110}
                >
                  {paragraph}
                </Reveal>
              ))}
            </div>

            <Reveal className="about__rule" variant="fade" delay={100}>
              <span className="rule about__rule-line" aria-hidden="true" />
            </Reveal>

            <dl className="about__facts">
              {profile.facts.map((fact, i) => (
                <Reveal as="div" key={fact.label} className="about__fact" delay={i * 90}>
                  <dt className="about__fact-label">{fact.label}</dt>
                  <dd className="about__fact-value">{fact.value}</dd>
                </Reveal>
              ))}
            </dl>

            <div className="about__foot">
              <Reveal className="about__langs" delay={120}>
                <p className="mono about__mini" id="about-langs">
                  Languages
                </p>
                <ul className="about__lang-list" aria-labelledby="about-langs">
                  {profile.languages.map((language) => (
                    <li key={language.name} className="chip about__lang">
                      {language.name}
                      <span className="about__lang-level">{language.level}</span>
                    </li>
                  ))}
                </ul>
              </Reveal>

              <Reveal className="about__cv" variant="fade" delay={220}>
                <ActionLink
                  href={asset(profile.resume)}
                  variant="outline"
                  size="sm"
                  icon={<DownloadIcon />}
                  download
                  target="_blank"
                  rel="noopener"
                >
                  Download CV
                </ActionLink>
              </Reveal>
            </div>
          </div>

          {/* ---- portrait plate ---------------------------------- */}
          <div className="about__media">
            <div
              ref={frameRef}
              data-inview={frameInView ? 'true' : 'false'}
              className="about__frame"
            >
              <span className="about__block" aria-hidden="true" />

              <span className="about__window">
                <span ref={panRef} className="about__pan">
                  <img
                    className="about__img"
                    src={asset('amanda2.jpeg')}
                    alt={profile.fullName}
                    width="502"
                    height="1080"
                    loading="lazy"
                    decoding="async"
                  />
                </span>
              </span>

              <span className="about__outline" aria-hidden="true" />
            </div>

            {/* Runs up the reserved gutter beside the plate; the
                same information lives in the facts list, so it is
                hidden from assistive tech and below 768px. */}
            <span className="mono about__caption" aria-hidden="true">
              {profile.location.split(', ').join(' · ')}
            </span>
          </div>
        </div>

        {/* ---- counted strip -------------------------------------- */}
        <ul
          ref={statsRef}
          data-inview={statsInView ? 'true' : 'false'}
          className="about__stats"
        >
          {stats.map((stat, i) => (
            <Stat key={stat.label} stat={stat} index={i} start={statsInView} />
          ))}
        </ul>
      </div>
    </section>
  )
}

/* ------------------------------------------------------------
   One counted figure. Kept as a component so useCountUp is
   called at a stable position no matter how long `stats` grows.
   The ramping number is hidden; the true figure is announced.
   ------------------------------------------------------------ */
function Stat({ stat, index, start }) {
  const value = useCountUp(stat.value, { start, duration: 1800 })

  return (
    <li className="about__stat" style={{ '--i': index }}>
      <p className="about__stat-figure">
        <span className="about__stat-value" aria-hidden="true">
          {value}
        </span>
        {stat.suffix && (
          <span className="about__stat-suffix" aria-hidden="true">
            {stat.suffix}
          </span>
        )}
        <span className="sr-only">{`${stat.value}${stat.suffix}`}</span>
      </p>
      <p className="about__stat-label">{stat.label}</p>
      <p className="about__stat-note">{stat.note}</p>
    </li>
  )
}

/* ------------------------------------------------------------
   Icons
   ------------------------------------------------------------ */
function DownloadIcon() {
  return (
    <svg
      className="about__icon"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.5"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
      focusable="false"
    >
      <path d="M12 3v12" />
      <path d="m7 10 5 5 5-5" />
      <path d="M4 20h16" />
    </svg>
  )
}
