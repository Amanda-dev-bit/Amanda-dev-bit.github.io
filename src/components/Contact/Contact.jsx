/* ============================================================
   CONTACT: the closing call to action.
   The last page of the book: a pull quote, the email set as
   display type, the ways to reach her, and a live Lagos clock.
   ============================================================ */

import { useCallback, useEffect, useRef, useState } from 'react'

import { asset } from '../../lib/utils'
import { ActionLink, Magnetic, Ornament, Reveal, MaskText } from '../ui/index.jsx'
import ContactForm from './ContactForm.jsx'
import { profile, socials } from '../../data/site.js'
import './Contact.css'

const COPIED_MS = 1800

export default function Contact() {
  const [copied, setCopied] = useState(false)
  const timerRef = useRef(0)

  useEffect(() => () => window.clearTimeout(timerRef.current), [])

  const copyEmail = useCallback(async () => {
    try {
      await navigator.clipboard.writeText(profile.email)
      setCopied(true)
      window.clearTimeout(timerRef.current)
      timerRef.current = window.setTimeout(() => setCopied(false), COPIED_MS)
    } catch {
      /* No clipboard permission, or an insecure context. The mailto:
         link beside this button still does the job, so stay quiet. */
    }
  }, [])

  const liveSocials = socials.filter((item) => item.href)
  const whatsapp = socials.find((item) => item.id === 'whatsapp' && item.href)

  return (
    <section id="contact" className="section contact" aria-labelledby="contact-title">
      <div className="container container--narrow contact__inner">
        <Reveal as="p" className="eyebrow contact__eyebrow" variant="fade">
          Say hello
        </Reveal>

        <MaskText
          as="h2"
          id="contact-title"
          className="display h2 contact__title"
          lines={['Let’s work', <em key="together">together</em>]}
          delay={90}
        />

        <Reveal as="p" className="contact__quote" delay={240}>
          Tell me what you are building and roughly when you need it. I will say
          honestly whether I am the right person for it.
        </Reveal>

        <Reveal className="contact__email-row" delay={340}>
          <Magnetic strength={0.14} radius={140}>
            <a className="contact__email" href={`mailto:${profile.email}`} data-cursor="hover">
              {profile.email}
            </a>
          </Magnetic>

          <button
            type="button"
            className="contact__copy"
            onClick={copyEmail}
            aria-label={`Copy ${profile.email} to the clipboard`}
            data-cursor="hover"
          >
            <span className="contact__copy-icons" aria-hidden="true">
              <CopyIcon />
              <CheckIcon />
            </span>
          </button>

          <span className="sr-only" role="status" aria-live="polite">
            {copied ? 'Email copied to the clipboard' : ''}
          </span>
          <span className={`contact__copied ${copied ? 'contact__copied--on' : ''}`} aria-hidden="true">
            Copied
          </span>
        </Reveal>

        <Reveal className="contact__actions" delay={420}>
          <ActionLink
            href={`mailto:${profile.email}?subject=${encodeURIComponent('Project enquiry')}`}
            variant="solid"
          >
            Start a project
          </ActionLink>
          {whatsapp && (
            <ActionLink
              href={whatsapp.href}
              target="_blank"
              rel="noopener noreferrer"
              variant="outline"
              icon="↗"
            >
              WhatsApp
            </ActionLink>
          )}
          <ActionLink
            href={asset(profile.resume)}
            target="_blank"
            rel="noopener noreferrer"
            download
            variant="ghost"
            icon="↓"
          >
            Download CV
          </ActionLink>
        </Reveal>

        <Reveal className="contact__form-wrap" delay={200}>
          <ContactForm />
        </Reveal>

        <Reveal className="contact__availability" delay={200}>
          <p className="contact__available">
            <span className="contact__dot" aria-hidden="true" />
            {profile.availability}
          </p>
          <dl className="contact__where">
            <div>
              <dt>Location</dt>
              {/* The short form, the long one is in the availability
                  line beside it and would wrap to four lines here. */}
              <dd>{profile.location}</dd>
            </div>
            <div>
              <dt>Local time</dt>
              <dd>
                <LagosClock />
              </dd>
            </div>
          </dl>
        </Reveal>

        <ul className="contact__socials">
          {liveSocials.map((item, i) => {
            const external = !item.href.startsWith('mailto:')
            return (
              <Reveal as="li" key={item.id} className="contact__social" delay={i * 80}>
                <a
                  className="contact__social-link"
                  href={item.href}
                  target={external ? '_blank' : undefined}
                  rel={external ? 'noopener noreferrer' : undefined}
                  data-cursor="hover"
                >
                  <span className="contact__social-label">{item.label}</span>
                  <span className="contact__social-handle">{item.handle}</span>
                  <span className="contact__social-arrow" aria-hidden="true">
                    ↗
                  </span>
                </a>
              </Reveal>
            )
          })}
        </ul>

        <Ornament />
      </div>
    </section>
  )
}

/* ------------------------------------------------------------------
   A live clock in Lagos. If the runtime cannot resolve the zone we
   simply render nothing rather than showing a wrong time.
   ------------------------------------------------------------------ */
function LagosClock() {
  const [time, setTime] = useState(null)

  useEffect(() => {
    let formatter
    try {
      formatter = new Intl.DateTimeFormat('en-GB', {
        timeZone: 'Africa/Lagos',
        hour: '2-digit',
        minute: '2-digit',
        second: '2-digit',
        hour12: false,
      })
    } catch {
      return undefined
    }

    const tick = () => {
      try {
        setTime(formatter.format(new Date()))
      } catch {
        setTime(null)
      }
    }

    tick()
    const id = window.setInterval(tick, 1000)
    return () => window.clearInterval(id)
  }, [])

  if (!time) return <span>{profile.timezone}</span>

  return (
    <span className="contact__clock">
      <span className="mono contact__clock-time">{time}</span>
      <span className="contact__clock-zone">{profile.timezone}</span>
    </span>
  )
}

/* ------------------------------------------------------------------ */

const iconProps = {
  viewBox: '0 0 24 24',
  fill: 'none',
  stroke: 'currentColor',
  strokeWidth: 1.5,
  strokeLinecap: 'round',
  strokeLinejoin: 'round',
  'aria-hidden': 'true',
}

function CopyIcon() {
  return (
    <svg {...iconProps} className="contact__icon contact__icon--copy">
      <rect x="9" y="9" width="11" height="11" rx="2" />
      <path d="M5 15V6a1 1 0 0 1 1-1h9" />
    </svg>
  )
}

function CheckIcon() {
  return (
    <svg {...iconProps} className="contact__icon contact__icon--check">
      <path d="m5 13 4.5 4.5L19 7" />
    </svg>
  )
}
