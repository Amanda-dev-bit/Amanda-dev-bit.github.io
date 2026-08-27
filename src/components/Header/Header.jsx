/* ============================================================
   HEADER: the fixed bar plus the full-screen mobile menu.
   Transparent over the hero; condenses once scrolled; hides on
   the way down and returns on the way up.
   ============================================================ */

import { useCallback, useEffect, useRef, useState } from 'react'

import {
  useEscapeKey,
  useFocusTrap,
  useLockBodyScroll,
  useMediaQuery,
  useActiveSection,
  useScrolled,
} from '../../hooks'
import { asset, cssPx, cx, scrollToId } from '../../lib/utils'
import { nav, profile, socials } from '../../data/site.js'
import './Header.css'

const SECTION_IDS = nav.map((item) => item.id)

export default function Header({ theme, onToggleTheme }) {
  const scrolled = useScrolled(40)
  const active = useActiveSection(SECTION_IDS)
  const isDesktop = useMediaQuery('(min-width: 900px)')
  const [menuOpen, setMenuOpen] = useState(false)
  const [hidden, setHidden] = useState(false)

  const closeMenu = useCallback(() => setMenuOpen(false), [])

  /* The menu is a mobile affordance, never leave it open on resize. */
  useEffect(() => {
    if (isDesktop) setMenuOpen(false)
  }, [isDesktop])

  useLockBodyScroll(menuOpen)
  useEscapeKey(closeMenu, menuOpen)
  const panelRef = useFocusTrap(menuOpen)

  /* Hide going down, reveal coming up. */
  useEffect(() => {
    if (menuOpen) {
      setHidden(false)
      return
    }
    let frame = 0
    let last = window.scrollY

    const update = () => {
      frame = 0
      const y = window.scrollY
      const delta = y - last
      // Ignore sub-pixel jitter and rubber-banding at either end.
      if (Math.abs(delta) > 6) {
        setHidden(y > 200 && delta > 0)
        last = y
      }
      if (y <= 200) setHidden(false)
    }

    const onScroll = () => {
      if (!frame) frame = requestAnimationFrame(update)
    }

    window.addEventListener('scroll', onScroll, { passive: true })
    return () => {
      if (frame) cancelAnimationFrame(frame)
      window.removeEventListener('scroll', onScroll)
    }
  }, [menuOpen])

  const goTo = useCallback((event, id) => {
    event.preventDefault()
    setMenuOpen(false)
    // Let the lock release before measuring, so the offset is right.
    requestAnimationFrame(() => {
      scrollToId(id, { offset: cssPx('--header-h', 84) - 8 })
      // Scrolling alone moves the viewport but leaves the keyboard and the
      // screen-reader cursor behind. Send focus to the section too, without
      // adding it to the tab order permanently.
      const target = document.getElementById(id)
      if (!target) return
      target.setAttribute('tabindex', '-1')
      target.focus({ preventScroll: true })
      target.addEventListener('blur', () => target.removeAttribute('tabindex'), { once: true })
    })
  }, [])

  const goTop = useCallback((event) => {
    event.preventDefault()
    setMenuOpen(false)
    const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches
    window.scrollTo({ top: 0, behavior: reduced ? 'auto' : 'smooth' })
  }, [])

  const liveSocials = socials.filter((item) => item.href)

  return (
    <>
      <header
        className={cx('header', scrolled && 'header--condensed', hidden && 'header--hidden')}
        data-menu={menuOpen ? 'open' : 'closed'}
      >
        <div className="header__inner">
          <a className="header__mark" href="#top" onClick={goTop} aria-label={`${profile.fullName}, back to top`}>
            <span className="header__mark-name">Amanda</span>
            <span className="header__mark-dot" aria-hidden="true" />
          </a>

          <nav className="header__nav" aria-label="Sections">
            <ul className="header__list">
              {nav.map((item) => {
                const isActive = active === item.id
                return (
                  <li key={item.id} className="header__item">
                    <a
                      className={cx('header__link', isActive && 'header__link--active')}
                      href={`#${item.id}`}
                      onClick={(event) => goTo(event, item.id)}
                      aria-current={isActive ? 'true' : undefined}
                    >
                      <span className="mono header__index" aria-hidden="true">
                        {item.index}
                      </span>
                      <span className="header__label">{item.label}</span>
                    </a>
                  </li>
                )
              })}
            </ul>
          </nav>

          <div className="header__actions">
            <ThemeToggle theme={theme} onToggle={onToggleTheme} />

            <a
              className="header__resume"
              href={asset(profile.resume)}
              target="_blank"
              rel="noopener noreferrer"
              download
            >
              <span>Résumé</span>
              <DownloadIcon />
            </a>

            <button
              type="button"
              className={cx('header__burger', menuOpen && 'header__burger--open')}
              aria-expanded={menuOpen}
              aria-controls="site-menu"
              aria-label={menuOpen ? 'Close menu' : 'Open menu'}
              onClick={() => setMenuOpen((open) => !open)}
            >
              <span className="header__burger-line" aria-hidden="true" />
              <span className="header__burger-line" aria-hidden="true" />
            </button>
          </div>
        </div>
      </header>

      <div
        id="site-menu"
        className={cx('menu', menuOpen && 'menu--open')}
        role="dialog"
        aria-modal="true"
        aria-label="Site menu"
        aria-hidden={menuOpen ? undefined : 'true'}
        inert={!menuOpen}
      >
        <div className="menu__panel on-dark" ref={panelRef} tabIndex={-1}>
          <nav className="menu__nav" aria-label="Sections">
            <ul className="menu__list">
              {nav.map((item, i) => (
                <li className="menu__item" key={item.id} style={{ '--i': i }}>
                  <a
                    className="menu__link"
                    href={`#${item.id}`}
                    onClick={(event) => goTo(event, item.id)}
                    tabIndex={menuOpen ? 0 : -1}
                  >
                    <span className="mono menu__index" aria-hidden="true">
                      {item.index}
                    </span>
                    <span className="menu__label">{item.label}</span>
                    <span className="menu__arrow" aria-hidden="true">
                      →
                    </span>
                  </a>
                </li>
              ))}
            </ul>
          </nav>

          <div className="menu__foot" aria-label="Contact details">
            <a className="menu__email link-underline" href={`mailto:${profile.email}`}>
              {profile.email}
            </a>
            <ul className="menu__socials">
              {liveSocials.map((item) => (
                <li key={item.id}>
                  <a
                    className="menu__social"
                    href={item.href}
                    target={item.href.startsWith('mailto:') ? undefined : '_blank'}
                    rel="noopener noreferrer"
                    tabIndex={menuOpen ? 0 : -1}
                  >
                    {item.label}
                  </a>
                </li>
              ))}
            </ul>
            <p className="menu__note">
              {profile.location} · {profile.timezone}
            </p>
          </div>
        </div>
      </div>
    </>
  )
}

/* ------------------------------------------------------------------ */

function ThemeToggle({ theme, onToggle }) {
  const isDark = theme === 'dark'
  return (
    <button
      type="button"
      className="header__theme"
      onClick={onToggle}
      /* Action-phrased name, so no aria-pressed: a button announced as
         "Switch to dark theme, pressed" tells a user the opposite of what
         it does. The name alone carries the state. */
      aria-label={isDark ? 'Switch to light theme' : 'Switch to dark theme'}
      data-cursor="hover"
    >
      <span className="header__theme-icons" aria-hidden="true">
        <SunIcon />
        <MoonIcon />
      </span>
    </button>
  )
}

const iconProps = {
  viewBox: '0 0 24 24',
  fill: 'none',
  stroke: 'currentColor',
  strokeWidth: 1.5,
  strokeLinecap: 'round',
  strokeLinejoin: 'round',
  'aria-hidden': 'true',
}

function SunIcon() {
  return (
    <svg {...iconProps} className="header__icon header__icon--sun">
      <circle cx="12" cy="12" r="4" />
      <path d="M12 2v2M12 20v2M4.9 4.9l1.4 1.4M17.7 17.7l1.4 1.4M2 12h2M20 12h2M4.9 19.1l1.4-1.4M17.7 6.3l1.4-1.4" />
    </svg>
  )
}

function MoonIcon() {
  return (
    <svg {...iconProps} className="header__icon header__icon--moon">
      <path d="M21 12.8A9 9 0 1 1 11.2 3a7 7 0 0 0 9.8 9.8Z" />
    </svg>
  )
}

function DownloadIcon() {
  return (
    <svg {...iconProps} className="header__icon header__icon--dl">
      <path d="M12 3v12M7.5 10.5 12 15l4.5-4.5M4 20h16" />
    </svg>
  )
}
