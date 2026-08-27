/* ============================================================
   CONTACT FORM: the enquiry form, posted to Formspree.

   The endpoint id lives in data/site.js. If it has not been
   filled in yet the form does not pretend to work: it hands the
   message to the visitor's own mail app, already written out, so
   an enquiry is never silently dropped.

   Validation here is for the visitor's benefit only. Formspree
   validates again on its side, which is the check that counts.

   Two things are deliberate and easy to "tidy" into bugs:

   1. The live region is mounted for the whole life of the
      component, never inside a branch. A region inserted into
      the DOM with its text already in it is not reliably read by
      NVDA or JAWS, so swapping it in with the success panel
      would announce nothing.

   2. Focus after a failed submit moves in an effect, not in the
      submit handler. aria-describedby and the error text only
      exist after React commits, so focusing any earlier lands on
      a field whose error has not been written yet.
   ============================================================ */

import { useCallback, useEffect, useId, useRef, useState } from 'react'

import { cx } from '../../lib/utils'
import { formspreeId, profile } from '../../data/site.js'

const ENDPOINT = formspreeId ? `https://formspree.io/f/${formspreeId}` : ''

const PROJECT_TYPES = [
  'A new website',
  'A redesign or rebuild',
  'UI/UX design only',
  'A web app frontend',
  'Something else',
]

/* Deliberately loose. Anything stricter starts rejecting real
   addresses, and the server checks properly anyway. */
const EMAIL = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/

/* Also enforced in validate(), not just as maxLength. The mailto
   fallback turns the message into a URL, and Windows gives up on
   a mailto past roughly 2000 characters. */
const LIMITS = { name: 80, email: 120, message: 1600 }

const REQUEST_TIMEOUT = 15000

const EMPTY = { name: '', email: '', projectType: PROJECT_TYPES[0], message: '' }

/* Anything heading for an email header loses its line breaks. */
const oneLine = (value, max) => value.replace(/[\r\n]+/g, ' ').trim().slice(0, max)

function validate({ name, email, message }) {
  const errors = {}
  const n = name.trim()
  const e = email.trim()
  const m = message.trim()

  if (!n) errors.name = 'Please tell me your name.'
  else if (n.length > LIMITS.name) errors.name = `Please keep this under ${LIMITS.name} characters.`

  if (!e) errors.email = 'I need an email address to reply to.'
  else if (e.length > LIMITS.email) errors.email = `Please keep this under ${LIMITS.email} characters.`
  else if (!EMAIL.test(e)) errors.email = 'That address does not look quite right.'

  if (!m) errors.message = 'Let me know what you have in mind.'
  else if (m.length < 10) errors.message = 'A little more detail would help.'
  else if (m.length > LIMITS.message) errors.message = `Please keep this under ${LIMITS.message} characters.`

  return errors
}

export default function ContactForm() {
  const uid = useId()
  const [values, setValues] = useState(EMPTY)
  const [errors, setErrors] = useState({})
  const [status, setStatus] = useState('idle') // idle | sending | sent | posted | error
  const [failure, setFailure] = useState('')
  const [attempt, setAttempt] = useState(0)
  const [focusKey, setFocusKey] = useState(null)
  const formRef = useRef(null)
  const doneRef = useRef(null)

  const field = useCallback((key) => `${uid}-${key}`, [uid])

  /* See note 2 at the top of the file. */
  useEffect(() => {
    if (!focusKey) return
    document.getElementById(field(focusKey))?.focus()
    setFocusKey(null)
  }, [focusKey, field])

  /* The success panel replaces the form, so the element that had
     focus is gone. Put focus on the heading instead of letting it
     fall back to <body>. */
  useEffect(() => {
    if (status === 'sent') doneRef.current?.focus()
  }, [status])

  const onChange = useCallback((key) => (event) => {
    const { value } = event.target
    setValues((v) => ({ ...v, [key]: value }))
    /* Clear a field's error as soon as the visitor starts fixing it,
       rather than nagging until they submit again. */
    setErrors((e) => (e[key] ? { ...e, [key]: undefined } : e))
  }, [])

  const openMailClient = useCallback((v) => {
    const body =
      `${v.message.trim()}\n\n` +
      `Project type: ${v.projectType}\n` +
      `From: ${v.name.trim()} <${v.email.trim()}>`
    const subject = `Project enquiry from ${oneLine(v.name, LIMITS.name)}`
    window.location.href =
      `mailto:${encodeURIComponent(profile.email)}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`
  }, [])

  const onSubmit = useCallback(
    async (event) => {
      event.preventDefault()
      if (status === 'sending') return

      /* Clear anything left over from a previous attempt first, so a
         stale red banner never sits beside fresh field errors. */
      setFailure('')
      if (status === 'error' || status === 'posted') setStatus('idle')

      const found = validate(values)
      if (Object.keys(found).length) {
        setErrors(found)
        setFocusKey(['name', 'email', 'message'].find((key) => found[key]) || null)
        return
      }
      setErrors({})

      /* The endpoint has not been configured, so hand the message to
         the visitor's mail app. window.location may do nothing at all
         if no mail client is registered, so say what just happened
         rather than leaving the form looking frozen. */
      if (!ENDPOINT) {
        openMailClient(values)
        setStatus('posted')
        return
      }

      setAttempt((a) => a + 1)
      setStatus('sending')

      const controller = new AbortController()
      const timer = window.setTimeout(() => controller.abort(), REQUEST_TIMEOUT)

      try {
        const response = await fetch(ENDPOINT, {
          method: 'POST',
          signal: controller.signal,
          headers: { 'Content-Type': 'application/json', Accept: 'application/json' },
          body: JSON.stringify({
            name: values.name.trim().slice(0, LIMITS.name),
            email: values.email.trim().slice(0, LIMITS.email),
            /* Never trust the select blindly: fall back to the first
               option if the DOM was tampered with. */
            projectType: PROJECT_TYPES.includes(values.projectType)
              ? values.projectType
              : PROJECT_TYPES[0],
            message: values.message.trim().slice(0, LIMITS.message),
            _subject: `Portfolio enquiry from ${oneLine(values.name, LIMITS.name)}`,
            /* Passed through so Formspree's own spam filter sees it. */
            _gotcha: formRef.current?.elements?._gotcha?.value || '',
          }),
        })

        if (response.ok) {
          setStatus('sent')
          setValues(EMPTY)
          return
        }

        /* Formspree answers with {errors:[{message}]} for validation,
           but a plain {error:"..."} string when a form is disabled or
           over quota. Assuming the array shape throws on the string. */
        const data = await response.json().catch(() => null)
        const listed = Array.isArray(data?.errors)
          ? data.errors.map((e) => e?.message).filter(Boolean)
          : []
        setFailure(
          listed.join(' ') ||
            (typeof data?.error === 'string' ? data.error : '') ||
            'That did not go through. Please try again, or email me directly at',
        )
        setStatus('error')
      } catch (err) {
        setFailure(
          err?.name === 'AbortError'
            ? 'That took too long and timed out. Try again, or email me directly at'
            : 'That did not go through, which may just be the connection. Email me directly at',
        )
        setStatus('error')
      } finally {
        window.clearTimeout(timer)
      }
    },
    [status, values, openMailClient],
  )

  const live =
    status === 'sending'
      ? 'Sending your message.'
      : status === 'sent'
        ? 'Thank you, your message was sent.'
        : status === 'posted'
          ? 'Your email app should now be open with the message ready to send.'
          : ''

  return (
    <div className="cform-shell">
      {/* Mounted for the whole life of the component. See note 1. */}
      <p className="cform__status" role="status" aria-live="polite">
        {live}
      </p>

      {status === 'sent' ? (
        <div className="cform cform--done">
          <p className="cform__done-mark" aria-hidden="true">
            <CheckIcon />
          </p>
          <h3 className="cform__done-title" ref={doneRef} tabIndex={-1}>
            Thank you, that reached me.
          </h3>
          <p className="cform__done-text">
            I read everything myself and usually reply within a day or two. If it is
            urgent, {profile.phone} is the faster route.
          </p>
          <button type="button" className="cform__again" onClick={() => setStatus('idle')}>
            Send another message
          </button>
        </div>
      ) : (
        <form ref={formRef} className="cform" onSubmit={onSubmit} noValidate>
          <div className="cform__row">
            <Field
              id={field('name')}
              label="Your name"
              error={errors.name}
              value={values.name}
              onChange={onChange('name')}
              autoComplete="name"
              maxLength={LIMITS.name}
              required
            />
            <Field
              id={field('email')}
              label="Email"
              type="email"
              inputMode="email"
              error={errors.email}
              value={values.email}
              onChange={onChange('email')}
              autoComplete="email"
              maxLength={LIMITS.email}
              required
            />
          </div>

          <div className="cform__field">
            <label className="cform__label" htmlFor={field('type')}>
              What do you need?
            </label>
            <div className="cform__select-wrap">
              <select
                id={field('type')}
                className="cform__input cform__select"
                value={values.projectType}
                onChange={onChange('projectType')}
              >
                {PROJECT_TYPES.map((type) => (
                  <option key={type} value={type}>
                    {type}
                  </option>
                ))}
              </select>
              <span className="cform__chevron" aria-hidden="true">
                <ChevronIcon />
              </span>
            </div>
          </div>

          <div className="cform__field">
            <label className="cform__label" htmlFor={field('message')}>
              Your message{' '}
              <span className="cform__req" aria-hidden="true">
                *
              </span>
            </label>
            <textarea
              id={field('message')}
              className={cx('cform__input', 'cform__textarea', errors.message && 'cform__input--bad')}
              rows={5}
              value={values.message}
              onChange={onChange('message')}
              maxLength={LIMITS.message}
              aria-required="true"
              aria-invalid={errors.message ? 'true' : undefined}
              aria-describedby={errors.message ? `${field('message')}-err` : undefined}
              placeholder="What are you building, and roughly when do you need it?"
            />
            {errors.message && (
              <p className="cform__error" id={`${field('message')}-err`}>
                {errors.message}
              </p>
            )}
          </div>

          {/* Bot trap. Hidden from people and from assistive tech and
              never focusable, so only a script should ever fill it.
              Its value is forwarded to Formspree rather than judged
              here: a password manager that fills it anyway would
              otherwise destroy a real enquiry behind a success screen. */}
          <div className="cform__trap" aria-hidden="true">
            <label htmlFor={field('gotcha')}>Leave this field empty</label>
            <input
              id={field('gotcha')}
              type="text"
              name="_gotcha"
              tabIndex={-1}
              autoComplete="off"
              data-lpignore="true"
              data-1p-ignore=""
            />
          </div>

          <div className="cform__foot">
            <button type="submit" className="cform__submit" disabled={status === 'sending'}>
              <span className="cform__submit-label">
                {status === 'sending' ? 'Sending' : 'Send enquiry'}
              </span>
              <span className="cform__submit-icon" aria-hidden="true">
                {status === 'sending' ? <SpinnerIcon /> : '→'}
              </span>
            </button>

            <p className="cform__note">
              {ENDPOINT
                ? 'Straight to my inbox. No list, no forwarding.'
                : 'This opens your own mail app with the message ready to send.'}
            </p>
          </div>

          {status === 'posted' && (
            <p className="cform__notice">
              Your mail app should be open with everything filled in. If nothing
              happened, email me at <a href={`mailto:${profile.email}`}>{profile.email}</a>.
            </p>
          )}

          {/* Keyed on the attempt so an identical repeat failure is a
              new node, and therefore announced again. */}
          {status === 'error' && (
            <p key={attempt} className="cform__error cform__error--form" role="alert">
              {failure} <a href={`mailto:${profile.email}`}>{profile.email}</a>
            </p>
          )}
        </form>
      )}
    </div>
  )
}

/* ------------------------------------------------------------------
   One labelled input, with its error wired up for assistive tech.
   ------------------------------------------------------------------ */
function Field({ id, label, error, required, ...rest }) {
  return (
    <div className="cform__field">
      <label className="cform__label" htmlFor={id}>
        {label}{' '}
        {required && (
          <span className="cform__req" aria-hidden="true">
            *
          </span>
        )}
      </label>
      <input
        id={id}
        className={cx('cform__input', error && 'cform__input--bad')}
        aria-required={required ? 'true' : undefined}
        aria-invalid={error ? 'true' : undefined}
        aria-describedby={error ? `${id}-err` : undefined}
        {...rest}
      />
      {error && (
        <p className="cform__error" id={`${id}-err`}>
          {error}
        </p>
      )}
    </div>
  )
}

/* ------------------------------------------------------------------ */

const stroke = {
  viewBox: '0 0 24 24',
  fill: 'none',
  stroke: 'currentColor',
  strokeWidth: 1.5,
  strokeLinecap: 'round',
  strokeLinejoin: 'round',
  'aria-hidden': 'true',
  focusable: 'false',
}

function CheckIcon() {
  return (
    <svg {...stroke}>
      <path d="m5 13 4.5 4.5L19 7" />
    </svg>
  )
}

function ChevronIcon() {
  return (
    <svg {...stroke}>
      <path d="m6 9 6 6 6-6" />
    </svg>
  )
}

function SpinnerIcon() {
  return (
    <svg {...stroke} className="cform__spinner">
      <path d="M12 3a9 9 0 1 0 9 9" />
    </svg>
  )
}
