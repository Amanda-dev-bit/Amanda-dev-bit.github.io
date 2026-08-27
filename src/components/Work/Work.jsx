/* ============================================================
   WORK: the projects section.
   Two ways to look at the same set: an asymmetric editorial
   grid of preview cards, and an index list whose rows summon a
   floating preview that follows the pointer. Either opens the
   full case study in a modal with its own gallery.
   ============================================================ */

import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import { createPortal } from 'react-dom'

import {
  useEscapeKey,
  useFinePointer,
  useFocusTrap,
  useLockBodyScroll,
  usePrefersReducedMotion,
  useReveal,
} from '../../hooks'
import { asset, clamp, cx, lerp } from '../../lib/utils'
import { ActionLink, Badge, Figure, MaskText, Reveal } from '../ui/index.jsx'
import { filters, projects, statusMeta } from '../../data/projects.js'
import './Work.css'

const GITHUB = 'https://github.com/Amanda-dev-bit'

const LINK_LABELS = {
  live: 'Visit site',
  repo: 'View code',
  figma: 'Open in Figma',
}

export default function Work() {
  const [view, setView] = useState('grid')
  const [filter, setFilter] = useState('all')
  const [openIndex, setOpenIndex] = useState(-1)

  /* Only offer a filter that actually matches something. */
  const usableFilters = useMemo(
    () =>
      filters.filter(
        (f) => f.id === 'all' || projects.some((p) => p.category === f.id),
      ),
    [],
  )

  const visible = useMemo(
    () => (filter === 'all' ? projects : projects.filter((p) => p.category === filter)),
    [filter],
  )

  /* Changing the filter must never leave a stale project open. */
  const changeFilter = useCallback((id) => {
    setFilter(id)
    setOpenIndex(-1)
  }, [])

  const open = useCallback((index) => setOpenIndex(index), [])
  const close = useCallback(() => setOpenIndex(-1), [])

  const step = useCallback(
    (delta) => {
      setOpenIndex((current) => {
        if (current < 0 || visible.length === 0) return current
        return (current + delta + visible.length) % visible.length
      })
    },
    [visible.length],
  )

  const active = openIndex >= 0 && openIndex < visible.length ? visible[openIndex] : null

  return (
    <section id="work" className="section section--inset on-dark work" aria-labelledby="work-title">
      <div className="container">
        <div className="work__head">
          <div className="work__head-text">
            <Reveal as="p" className="eyebrow" variant="fade">
              Selected work
            </Reveal>
            <MaskText
              as="h2"
              id="work-title"
              className="display h2 work__title"
              lines={[
                'Recent',
                <em key="projects">projects</em>,
              ]}
              delay={90}
            />
            <Reveal as="p" className="lead work__lead" delay={260}>
              Build studies and design concepts I set myself. No client brief and no
              deadline, just the parts I wanted to get right.
            </Reveal>
          </div>

          <Reveal className="work__views" delay={340} variant="fade">
            <div className="work__view-toggle" role="group" aria-label="Change how projects are shown">
              <button
                type="button"
                className={cx('work__view-btn', view === 'grid' && 'work__view-btn--on')}
                aria-pressed={view === 'grid'}
                onClick={() => setView('grid')}
                data-cursor="hover"
              >
                <GridIcon />
                <span>Grid</span>
              </button>
              <button
                type="button"
                className={cx('work__view-btn', view === 'index' && 'work__view-btn--on')}
                aria-pressed={view === 'index'}
                onClick={() => setView('index')}
                data-cursor="hover"
              >
                <ListIcon />
                <span>Index</span>
              </button>
            </div>
          </Reveal>
        </div>

        <Reveal className="work__filters-wrap" delay={180} variant="fade">
          <div className="work__filters" role="group" aria-label="Filter projects by discipline">
            {usableFilters.map((f) => (
              <button
                key={f.id}
                type="button"
                className={cx('work__filter', filter === f.id && 'work__filter--on')}
                aria-pressed={filter === f.id}
                onClick={() => changeFilter(f.id)}
                data-cursor="hover"
              >
                {f.label}
              </button>
            ))}
          </div>
          <p className="work__count mono" aria-live="polite">
            {visible.length} {visible.length === 1 ? 'project' : 'projects'}
          </p>
        </Reveal>

        {view === 'grid' ? (
          <GridView items={visible} onOpen={open} />
        ) : (
          <IndexView items={visible} onOpen={open} />
        )}

        <Reveal className="work__outro" delay={120}>
          <span className="work__outro-text">More work in progress</span>
          <ActionLink href={GITHUB} target="_blank" rel="noopener noreferrer" variant="ghost" icon="↗">
            See it on GitHub
          </ActionLink>
        </Reveal>
      </div>

      {active &&
        createPortal(
          <ProjectModal
            project={active}
            onClose={close}
            onStep={step}
            hasSiblings={visible.length > 1}
            prev={visible[(openIndex - 1 + visible.length) % visible.length]}
            next={visible[(openIndex + 1) % visible.length]}
          />,
          document.body,
        )}
    </section>
  )
}

/* ============================================================
   GRID VIEW
   ============================================================ */

function GridView({ items, onOpen }) {
  if (!items.length) return <EmptyState />
  return (
    <ul className="work__grid">
      {items.map((project, i) => (
        <ProjectCard key={project.id} project={project} index={i} onOpen={() => onOpen(i)} />
      ))}
    </ul>
  )
}

function ProjectCard({ project, index, onOpen }) {
  const [ref, inView] = useReveal({ threshold: 0.12 })
  const meta = statusMeta[project.status] ?? statusMeta.concept

  return (
    <li
      ref={ref}
      data-inview={inView ? 'true' : 'false'}
      className={cx('work__card', project.featured && 'work__card--wide')}
      style={{ '--tone': project.accent, '--reveal-delay': `${(index % 2) * 90 + 60}ms` }}
    >
      <button
        type="button"
        className="work__card-btn"
        onClick={onOpen}
        data-cursor="view"
        data-cursor-label="View"
      >
        <span className={cx('work__shot', project.featured ? 'work__shot--wide' : 'work__shot--tall')}>
          <img
            className="work__img"
            src={asset(project.cover)}
            alt=""
            loading="lazy"
            decoding="async"
          />
          <span className="work__veil" aria-hidden="true" />
          <span className="work__shot-top">
            <Badge tone={meta.tone}>{meta.label}</Badge>
          </span>
          <span className="work__peek" aria-hidden="true">
            <span className="work__peek-ring">
              <ArrowIcon />
            </span>
          </span>
        </span>

        <span className="work__card-meta">
          <span className="work__num" aria-hidden="true">
            {project.index}
          </span>
          <span className="work__cat">{project.category}</span>
          <span className="mono work__year">{project.year}</span>
        </span>

        <span className="work__card-body">
          <span className="display h3 work__card-title">{project.title}</span>
          <span className="work__card-sub">{project.subtitle}</span>
          <span className="work__card-summary">{project.summary}</span>
        </span>

        <span className="work__stack">
          {project.stack.map((tool) => (
            <span className="chip work__chip" key={tool}>
              {tool}
            </span>
          ))}
        </span>

        <span className="work__cta">
          <span>View case study</span>
          <span className="work__cta-arrow" aria-hidden="true">
            →
          </span>
        </span>
      </button>
    </li>
  )
}

/* ============================================================
   INDEX VIEW: rows plus the pointer-following preview
   ============================================================ */

function IndexView({ items, onOpen }) {
  const fine = useFinePointer()
  const reduced = usePrefersReducedMotion()
  const floating = fine && !reduced

  const listRef = useRef(null)
  const previewRef = useRef(null)
  const [hovered, setHovered] = useState(-1)

  useEffect(() => {
    if (!floating) return
    const list = listRef.current
    const preview = previewRef.current
    if (!list || !preview) return

    let frame = 0
    const state = { x: 0, y: 0, tx: 0, ty: 0, primed: false }

    /* The loop parks itself once the preview has caught up, so nothing
       spins while the pointer rests or sits outside the list. */
    const paint = () => {
      frame = 0
      state.x = lerp(state.x, state.tx, 0.15)
      state.y = lerp(state.y, state.ty, 0.15)
      preview.style.transform = `translate3d(${state.x.toFixed(1)}px, ${state.y.toFixed(1)}px, 0)`
      const settled =
        Math.abs(state.tx - state.x) < 0.1 && Math.abs(state.ty - state.y) < 0.1
      if (!settled) frame = requestAnimationFrame(paint)
    }

    const kick = () => {
      if (!frame) frame = requestAnimationFrame(paint)
    }

    const onMove = (event) => {
      const rect = list.getBoundingClientRect()
      const pw = preview.offsetWidth
      const ph = preview.offsetHeight
      const maxX = Math.max(0, rect.width - pw)
      const maxY = Math.max(0, rect.height - ph)
      state.tx = clamp(event.clientX - rect.left - pw / 2, 0, maxX)
      state.ty = clamp(event.clientY - rect.top - ph / 2, 0, maxY)
      // Snap into place on the first move so it never flies in from 0,0.
      if (!state.primed) {
        state.primed = true
        state.x = state.tx
        state.y = state.ty
      }
      kick()
    }

    const onLeave = () => {
      state.primed = false
      setHovered(-1)
    }

    list.addEventListener('pointermove', onMove)
    list.addEventListener('pointerleave', onLeave)

    return () => {
      if (frame) cancelAnimationFrame(frame)
      list.removeEventListener('pointermove', onMove)
      list.removeEventListener('pointerleave', onLeave)
    }
  }, [floating])

  /* A filter change can strip the row the pointer was over. */
  useEffect(() => {
    setHovered((h) => (h < items.length ? h : -1))
  }, [items.length])

  if (!items.length) return <EmptyState />

  return (
    <div className="work__index" ref={listRef}>
      <ol className="work__rows">
        {items.map((project, i) => (
          <IndexRow
            key={project.id}
            project={project}
            index={i}
            showThumb={!floating}
            onOpen={() => onOpen(i)}
            onEnter={() => floating && setHovered(i)}
          />
        ))}
      </ol>

      {floating && (
        <div
          className={cx('work__preview', hovered >= 0 && 'work__preview--on')}
          ref={previewRef}
          aria-hidden="true"
        >
          {items.map((project, i) => (
            <img
              key={project.id}
              className={cx('work__preview-img', hovered === i && 'work__preview-img--on')}
              src={asset(project.cover)}
              alt=""
              loading="lazy"
              decoding="async"
            />
          ))}
        </div>
      )}
    </div>
  )
}

function IndexRow({ project, index, showThumb, onOpen, onEnter }) {
  const [ref, inView] = useReveal({ threshold: 0.2 })
  const meta = statusMeta[project.status] ?? statusMeta.concept

  return (
    <li
      ref={ref}
      data-inview={inView ? 'true' : 'false'}
      className="work__row"
      style={{ '--tone': project.accent, '--reveal-delay': `${index * 70}ms` }}
      onPointerEnter={onEnter}
    >
      <button
        type="button"
        className="work__row-btn"
        onClick={onOpen}
        onFocus={onEnter}
        data-cursor="view"
        data-cursor-label="View"
      >
        <span className="mono work__row-num" aria-hidden="true">
          {project.index}
        </span>

        {showThumb && (
          <span className="work__row-thumb">
            <img src={asset(project.cover)} alt="" loading="lazy" decoding="async" />
          </span>
        )}

        <span className="work__row-title">
          <span className="display work__row-name">{project.title}</span>
          <span className="work__row-sub">{project.subtitle}</span>
        </span>

        <span className="work__row-cat">{project.category}</span>
        <span className="work__row-badge">
          <Badge tone={meta.tone}>{meta.label}</Badge>
        </span>
        <span className="mono work__row-year">{project.year}</span>
        <span className="work__row-arrow" aria-hidden="true">
          →
        </span>
      </button>
    </li>
  )
}

function EmptyState() {
  return (
    <p className="work__empty">
      Nothing here yet. Try another filter.
    </p>
  )
}

/* ============================================================
   MODAL: the full case study
   ============================================================ */

function ProjectModal({ project, onClose, onStep, hasSiblings, prev, next }) {
  const [lightbox, setLightbox] = useState(-1)
  const panelRef = useFocusTrap(true)
  const scrollerRef = useRef(null)
  const lightboxRef = useRef(null)
  // Remembers which gallery button opened the lightbox, so focus goes back
  // to it rather than to the top of the dialog.
  const galleryTriggerRef = useRef(null)

  const openLightbox = useCallback((index, event) => {
    galleryTriggerRef.current = event?.currentTarget ?? null
    setLightbox(index)
  }, [])

  const closeLightbox = useCallback(() => {
    setLightbox(-1)
    const trigger = galleryTriggerRef.current
    galleryTriggerRef.current = null
    if (trigger instanceof HTMLElement && document.contains(trigger)) trigger.focus()
  }, [])

  // Move focus into the enlarged view when it opens; without this the
  // dialog is announced but the keyboard stays behind it.
  useEffect(() => {
    if (lightbox < 0) return
    lightboxRef.current?.focus()
  }, [lightbox])

  useLockBodyScroll(true)

  /* Escape peels one layer at a time. */
  const onEscape = useCallback(() => {
    if (lightbox >= 0) {
      closeLightbox()
      return
    }
    onClose()
  }, [lightbox, closeLightbox, onClose])
  useEscapeKey(onEscape, true)

  /* A new project means a fresh scroll position and no stale lightbox. */
  useEffect(() => {
    setLightbox(-1)
    if (scrollerRef.current) scrollerRef.current.scrollTop = 0
  }, [project.id])

  const meta = statusMeta[project.status] ?? statusMeta.concept
  const links = Object.entries(project.links ?? {}).filter(([, href]) => href)
  const titleId = `project-${project.id}-title`

  return (
    <div className="work__modal" role="dialog" aria-modal="true" aria-labelledby={titleId}>
      <button
        type="button"
        className="work__scrim"
        aria-label="Close project details"
        tabIndex={-1}
        onClick={onClose}
      />

      <div className="work__panel" ref={panelRef} tabIndex={-1} style={{ '--tone': project.accent }}>
        <button type="button" className="work__close" onClick={onClose} aria-label="Close project details">
          <CloseIcon />
        </button>

        <div className="work__panel-scroll" ref={scrollerRef}>
          <div className="work__hero">
            <img
              className="work__hero-img"
              src={asset(project.cover)}
              alt={`${project.title}, ${project.subtitle}`}
              decoding="async"
            />
            <div className="work__hero-shade" aria-hidden="true" />
            <div className="work__hero-caption">
              <span className="mono work__hero-num">{project.index}</span>
              <Badge tone={meta.tone}>{meta.label}</Badge>
            </div>
          </div>

          <div className="work__panel-body">
            <header className="work__panel-head">
              <h2 className="display h2 work__panel-title" id={titleId}>
                {project.title}
              </h2>
              <p className="work__panel-sub">{project.subtitle}</p>
            </header>

            <dl className="work__facts">
              {[
                ['Role', project.role],
                ['Year', project.year],
                ['Duration', project.duration],
                ['Discipline', project.category],
              ].map(([label, value]) => (
                <div className="work__fact" key={label}>
                  <dt>{label}</dt>
                  <dd>{value}</dd>
                </div>
              ))}
            </dl>

            {/* Prose runs at a readable measure on the left; the scannable
                blocks fill the column beside it instead of leaving the
                panel half empty. */}
            <div className="work__split">
              <div className="work__prose">
                {project.description.map((para, i) => (
                  <p className="body-text" key={i}>
                    {para}
                  </p>
                ))}
              </div>

              <div className="work__aside">
                {project.highlights?.length > 0 && (
                  <section className="work__block" aria-labelledby={`${project.id}-highlights`}>
                    <h3 className="work__block-title" id={`${project.id}-highlights`}>
                      Highlights
                    </h3>
                    <ul className="work__highlights">
                      {project.highlights.map((item, i) => (
                        <li className="work__highlight" key={i} style={{ '--i': i }}>
                          <span className="work__highlight-mark" aria-hidden="true">
                            ✦
                          </span>
                          {item}
                        </li>
                      ))}
                    </ul>
                  </section>
                )}

                <section className="work__block" aria-labelledby={`${project.id}-stack`}>
                  <h3 className="work__block-title" id={`${project.id}-stack`}>
                    Built with
                  </h3>
                  <div className="work__stack work__stack--modal">
                    {project.stack.map((tool) => (
                      <span className="chip work__chip" key={tool}>
                        {tool}
                      </span>
                    ))}
                  </div>
                </section>
              </div>
            </div>

            {project.gallery?.length > 0 && (
              <section className="work__block" aria-labelledby={`${project.id}-gallery`}>
                <h3 className="work__block-title" id={`${project.id}-gallery`}>
                  Screens
                </h3>
                <ul className="work__gallery">
                  {project.gallery.map((shot, i) => (
                    <li key={shot.src}>
                      <button
                        type="button"
                        className="work__gallery-btn"
                        onClick={(event) => openLightbox(i, event)}
                        aria-label={`Enlarge: ${shot.caption}`}
                        data-cursor="view"
                        data-cursor-label="Zoom"
                      >
                        <Figure
                          src={asset(shot.src)}
                          alt={shot.caption}
                          caption={shot.caption}
                          ratio="16 / 10"
                          delay={i * 90}
                        />
                      </button>
                    </li>
                  ))}
                </ul>
              </section>
            )}

            {links.length > 0 && (
              <div className="work__links">
                {links.map(([key, href]) => (
                  <ActionLink
                    key={key}
                    href={href}
                    target="_blank"
                    rel="noopener noreferrer"
                    variant={key === 'live' ? 'solid' : 'outline'}
                    size="sm"
                    icon="↗"
                  >
                    {LINK_LABELS[key] ?? key}
                  </ActionLink>
                ))}
              </div>
            )}

            {hasSiblings && (
              <nav className="work__nav" aria-label="Other projects">
                <button type="button" className="work__nav-btn" onClick={() => onStep(-1)}>
                  <span className="work__nav-thumb">
                    <img src={asset(prev.cover)} alt="" loading="lazy" decoding="async" />
                  </span>
                  <span className="work__nav-text">
                    <span className="work__nav-dir">← Previous</span>
                    <span className="work__nav-name">{prev.title}</span>
                  </span>
                </button>
                <button
                  type="button"
                  className="work__nav-btn work__nav-btn--next"
                  onClick={() => onStep(1)}
                >
                  <span className="work__nav-text">
                    <span className="work__nav-dir">Next →</span>
                    <span className="work__nav-name">{next.title}</span>
                  </span>
                  <span className="work__nav-thumb">
                    <img src={asset(next.cover)} alt="" loading="lazy" decoding="async" />
                  </span>
                </button>
              </nav>
            )}
          </div>
        </div>

        {lightbox >= 0 && project.gallery[lightbox] && (
          <div
            className="work__lightbox"
            role="dialog"
            aria-modal="true"
            aria-label={`Enlarged screen: ${project.gallery[lightbox].caption}`}
            ref={lightboxRef}
            tabIndex={-1}
          >
            <button
              type="button"
              className="work__lightbox-scrim"
              aria-label="Close enlarged view"
              onClick={closeLightbox}
            />
            <figure className="work__lightbox-figure">
              <img src={asset(project.gallery[lightbox].src)} alt={project.gallery[lightbox].caption} />
              <figcaption>{project.gallery[lightbox].caption}</figcaption>
            </figure>
            <button
              type="button"
              className="work__lightbox-close"
              onClick={closeLightbox}
              aria-label="Close enlarged view"
            >
              <CloseIcon />
            </button>
          </div>
        )}
      </div>
    </div>
  )
}

/* ============================================================
   ICONS
   ============================================================ */

const iconProps = {
  viewBox: '0 0 24 24',
  fill: 'none',
  stroke: 'currentColor',
  strokeWidth: 1.5,
  strokeLinecap: 'round',
  strokeLinejoin: 'round',
  'aria-hidden': 'true',
}

function GridIcon() {
  return (
    <svg {...iconProps} className="work__icon">
      <rect x="3.5" y="3.5" width="7" height="7" rx="1.5" />
      <rect x="13.5" y="3.5" width="7" height="7" rx="1.5" />
      <rect x="3.5" y="13.5" width="7" height="7" rx="1.5" />
      <rect x="13.5" y="13.5" width="7" height="7" rx="1.5" />
    </svg>
  )
}

function ListIcon() {
  return (
    <svg {...iconProps} className="work__icon">
      <path d="M4 6h16M4 12h16M4 18h16" />
    </svg>
  )
}

function ArrowIcon() {
  return (
    <svg {...iconProps} className="work__icon work__icon--arrow">
      <path d="M6 18 18 6M9 6h9v9" />
    </svg>
  )
}

function CloseIcon() {
  return (
    <svg {...iconProps} className="work__icon">
      <path d="M6 6l12 12M18 6L6 18" />
    </svg>
  )
}
