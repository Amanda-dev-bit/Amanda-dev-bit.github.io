/* ============================================================
   FOOTER: the colophon.

   Three editorial columns (mark + intro / navigate / elsewhere),
   an oversized name band that reads as texture rather than text,
   and a hairline bottom bar. Rendered outside <main>, so it owns
   the contentinfo landmark and carries its own dark ground via
   `.on-dark`, which flips the semantic text tokens for us.
   ============================================================ */

import { useCallback } from 'react'

import { usePrefersReducedMotion } from '../../hooks'
import { cssPx, scrollToId } from '../../lib/utils'
import { Magnetic, Reveal } from '../ui/index.jsx'
import { nav, profile, socials } from '../../data/site.js'
import './Footer.css'

/* The email lives in `socials` too, but it is given its own row in
   the direct block below: filtering it here avoids a duplicate. */
const elsewhere = socials.filter((s) => s.href && s.id !== 'email')

const direct = [
  { id: 'phone', kicker: 'Phone', label: profile.phone, href: `tel:${profile.phoneHref}` },
  { id: 'email', kicker: 'Email', label: profile.email, href: `mailto:${profile.email}` },
]

export default function Footer() {
  const reduced = usePrefersReducedMotion()

  /* Keep the real href so the link is copyable and works without JS,
     but scroll it ourselves to clear the fixed header. */
  const handleNav = useCallback((event, id) => {
    event.preventDefault()
    scrollToId(id, { offset: cssPx('--header-h') })
  }, [])

  const handleTop = useCallback(() => {
    window.scrollTo({ top: 0, behavior: reduced ? 'auto' : 'smooth' })
  }, [reduced])

  return (
    <footer id="colophon" className="footer on-dark" aria-labelledby="footer-title">
      <h2 id="footer-title" className="sr-only">
        {profile.fullName}, site footer
      </h2>

      <div className="container">
        <div className="footer__top">
          {/* ---- 1. the mark ------------------------------------ */}
          <Reveal as="div" className="footer__col footer__col--mark">
            <p className="footer__mark">
              {profile.lastName}
              <span className="footer__mark-dot" aria-hidden="true" />
            </p>
            <p className="footer__intro">{profile.intro}</p>
            <p className="mono footer__place">
              {profile.location} · {profile.timezone}
            </p>
          </Reveal>

          {/* ---- 2. navigate ------------------------------------ */}
          <Reveal as="div" className="footer__col footer__col--nav" delay={90}>
            <h3 id="footer-nav-title" className="eyebrow footer__label">
              Navigate
            </h3>
            <nav aria-labelledby="footer-nav-title">
              <ul className="footer__nav-list">
                {nav.map((item) => (
                  <li key={item.id}>
                    <a
                      className="footer__nav-link"
                      href={`#${item.id}`}
                      onClick={(event) => handleNav(event, item.id)}
                    >
                      <span className="mono footer__nav-index" aria-hidden="true">
                        {item.index}
                      </span>
                      <span className="footer__nav-label">{item.label}</span>
                    </a>
                  </li>
                ))}
              </ul>
            </nav>
          </Reveal>

          {/* ---- 3. elsewhere ----------------------------------- */}
          <Reveal as="div" className="footer__col footer__col--links" delay={180}>
            <h3 id="footer-links-title" className="eyebrow footer__label">
              Elsewhere
            </h3>
            <ul className="footer__links" aria-labelledby="footer-links-title">
              {elsewhere.map((item) => (
                <li key={item.id}>
                  <a
                    className="footer__link"
                    href={item.href}
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    <span className="footer__link-text">
                      <span className="footer__link-label">{item.label}</span>
                    </span>
                    <Go />
                    <span className="sr-only">(opens in a new tab)</span>
                  </a>
                </li>
              ))}

              {direct.map((item, i) => (
                <li key={item.id} className={i === 0 ? 'footer__links-item--split' : undefined}>
                  <a className="footer__link" href={item.href}>
                    <span className="footer__link-text">
                      <span className="mono footer__link-kicker">{item.kicker}</span>
                      <span className="footer__link-label footer__link-label--value">
                        {item.label}
                      </span>
                    </span>
                    <Go />
                  </a>
                </li>
              ))}
            </ul>
          </Reveal>
        </div>
      </div>

      {/* ---- the name, as texture ------------------------------- */}
      <div className="footer__band" aria-hidden="true">
        <div className="container">
          <Reveal
            as="p"
            variant="clip"
            delay={120}
            className="display footer__wordmark"
            aria-hidden="true"
          >
            {profile.fullName}
          </Reveal>
        </div>
      </div>

      {/* ---- bottom bar ----------------------------------------- */}
      <div className="container">
        <Reveal as="div" className="footer__bar" delay={240}>
          <p className="footer__legal">
            © {profile.year} {profile.firstName} {profile.lastName}. All rights reserved.
          </p>

          <p className="footer__made">
            <span className="footer__spark" aria-hidden="true">
              ✦
            </span>
            Designed & built in Lagos
          </p>

          <div className="footer__top-wrap">
            <Magnetic strength={0.24} radius={70}>
              <button type="button" className="footer__to-top" onClick={handleTop}>
                <span className="footer__to-top-label">Back to top</span>
                <span className="footer__to-top-icon" aria-hidden="true">
                  <ArrowUp />
                  <ArrowUp />
                </span>
              </button>
            </Magnetic>
          </div>
        </Reveal>
      </div>
    </footer>
  )
}

/* ------------------------------------------------------------
   Icons: two copies inside a clipped box: the first leaves,
   the second arrives from the opposite corner.
   ------------------------------------------------------------ */

function Go() {
  return (
    <span className="footer__go" aria-hidden="true">
      <ArrowUpRight />
      <ArrowUpRight />
    </span>
  )
}

function ArrowUpRight() {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.5"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
      focusable="false"
    >
      <path d="M7 17 17 7" />
      <path d="M8 7h9v9" />
    </svg>
  )
}

function ArrowUp() {
  return (
    <svg
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
