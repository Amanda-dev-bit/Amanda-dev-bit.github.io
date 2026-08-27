/* ============================================================
   HERO: the opening screen.
   An asymmetric editorial split: display type on the left,
   a parallaxed portrait on the right. Every entrance is gated
   on `ready` so nothing plays behind the preloader curtain.
   ============================================================ */

import { useParallax } from '../../hooks'
import { asset, cssPx, scrollToId } from '../../lib/utils'
import { ActionLink } from '../ui/index.jsx'
import { profile } from '../../data/site.js'
import './Hero.css'

export default function Hero({ ready }) {
  const portraitRef = useParallax(52)

  const toWork = (event) => {
    event.preventDefault()
    scrollToId('work', { offset: cssPx('--header-h', 84) - 8 })
  }

  return (
    <section
      id="top"
      className="hero"
      aria-labelledby="hero-title"
      data-ready={ready ? 'true' : 'false'}
    >
      <div className="hero__inner">
        {/* ---------------- text column ---------------- */}
        <div className="hero__text">
          <div className="hero__top hero__anim" style={{ '--d': '80ms' }}>
            <p className="eyebrow hero__eyebrow">Portfolio {profile.year}</p>
            <p className="hero__status">
              <span className="hero__status-dot" aria-hidden="true" />
              {profile.availability}
            </p>
          </div>

          <h1 className="display h1 hero__name" id="hero-title">
            <span className="line-mask hero__line">
              <span style={{ '--d': '180ms' }}>{profile.firstName}</span>
            </span>
            <span className="line-mask hero__line">
              <span style={{ '--d': '300ms' }}>
                <em>{profile.lastName}</em>
              </span>
            </span>
          </h1>

          <p className="hero__role hero__anim" style={{ '--d': '520ms' }}>
            <span className="hero__role-rule" aria-hidden="true" />
            {profile.role}
          </p>

          <p className="lead hero__tagline hero__anim" style={{ '--d': '620ms' }}>
            {profile.tagline}
          </p>

          <div className="hero__ctas hero__anim" style={{ '--d': '740ms' }}>
            <ActionLink href="#work" onClick={toWork} variant="solid">
              See my work
            </ActionLink>
            <ActionLink href={`mailto:${profile.email}`} variant="ghost" icon="↗">
              Get in touch
            </ActionLink>
          </div>

          <dl className="hero__meta hero__anim" style={{ '--d': '860ms' }}>
            <div className="hero__meta-item">
              <dt>Based in</dt>
              <dd>{profile.location}</dd>
            </div>
            <div className="hero__meta-item">
              <dt>Timezone</dt>
              <dd>{profile.timezone}</dd>
            </div>
            <div className="hero__meta-item">
              <dt>Status</dt>
              <dd className="hero__meta-open">Available for work</dd>
            </div>
          </dl>
        </div>

        {/* ---------------- image column ---------------- */}
        <div className="hero__visual" aria-hidden={false}>
          <span className="hero__blob" aria-hidden="true" />
          <span className="hero__outline" aria-hidden="true" />

          <div className="hero__frame">
            <div className="hero__parallax" ref={portraitRef}>
              <img
                className="hero__photo"
                src={asset('amanda.jpeg')}
                alt={`${profile.fullName}, ${profile.role}`}
                width="720"
                height="1080"
                fetchPriority="high"
                decoding="async"
              />
            </div>
          </div>

          <figure className="hero__card">
            <span className="hero__card-initials" aria-hidden="true">
              {profile.initials}
            </span>
            <figcaption className="hero__card-caption">
              <span className="mono">Lagos, NG</span>
              <span className="hero__card-role">{profile.roleLines[1]}</span>
            </figcaption>
          </figure>
        </div>
      </div>
    </section>
  )
}
