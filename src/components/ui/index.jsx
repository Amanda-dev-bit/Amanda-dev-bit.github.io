/* ============================================================
   SHARED UI PRIMITIVES
   The vocabulary every section is built from. Keeping these in
   one place is what makes the whole site feel like one object.
   ============================================================ */

import { forwardRef } from 'react'
import { useMagnetic, useReveal } from '../../hooks'
import { cx, splitChars } from '../../lib/utils'
import './ui.css'

/* ------------------------------------------------------------
   Reveal: fades/slides its children in when scrolled into view.
   `variant` maps to the [data-reveal] styles in animations.css.
   ------------------------------------------------------------ */
export function Reveal({
  as: Tag = 'div',
  variant = 'up',
  delay = 0,
  threshold,
  className,
  style,
  children,
  ...rest
}) {
  const [ref, inView] = useReveal(threshold ? { threshold } : undefined)
  return (
    <Tag
      ref={ref}
      data-reveal={variant}
      data-inview={inView ? 'true' : 'false'}
      className={className}
      style={{ '--reveal-delay': `${delay}ms`, ...style }}
      {...rest}
    >
      {/* The clip variant wipes an inner span rather than the element
          itself: a clip-path on the observed node collapses its own
          intersection rect to nothing, so the observer never saw it
          arrive and it stayed clipped for good. */}
      {variant === 'clip' ? <span className="reveal-clip">{children}</span> : children}
    </Tag>
  )
}

/* ------------------------------------------------------------
   MaskText: each line rises out of its own clipped row.
   Pass a string, or an array of strings for multiple lines.
   ------------------------------------------------------------ */
export function MaskText({
  as: Tag = 'span',
  lines,
  children,
  delay = 0,
  step = 110,
  className,
  style,
  ...rest
}) {
  const rows = lines ?? (Array.isArray(children) ? children : [children])
  const [ref, inView] = useReveal({ threshold: 0.2 })
  return (
    <Tag
      ref={ref}
      data-inview={inView ? 'true' : 'false'}
      className={cx('mask-text', className)}
      style={style}
      {...rest}
    >
      {rows.map((row, i) => (
        <span className="line-mask" key={i}>
          <span style={{ '--reveal-delay': `${delay + i * step}ms` }}>{row}</span>
        </span>
      ))}
    </Tag>
  )
}

/* ------------------------------------------------------------
   SplitText: per-character stagger. Use sparingly, on short
   display strings only.
   ------------------------------------------------------------ */
export function SplitText({ as: Tag = 'span', text, delay = 0, className, ...rest }) {
  const [ref, inView] = useReveal({ threshold: 0.3 })
  const chars = splitChars(text)
  return (
    <Tag
      ref={ref}
      data-inview={inView ? 'true' : 'false'}
      className={cx('split-text', className)}
      style={{ '--reveal-delay': `${delay}ms` }}
      aria-label={text}
      {...rest}
    >
      {chars.map(({ char, index, isSpace, key }) => (
        <span key={key} className="char" style={{ '--i': index }} aria-hidden="true">
          {isSpace ? ' ' : char}
        </span>
      ))}
    </Tag>
  )
}

/* ------------------------------------------------------------
   SectionHead: the editorial header used by every section.
   ------------------------------------------------------------ */
export function SectionHead({ eyebrow, title, lead, align = 'start', id, className, children }) {
  return (
    <header className={cx('section-head', align === 'center' && 'section-head--center', className)}>
      {eyebrow && (
        <Reveal as="p" className="eyebrow" variant="fade">
          {eyebrow}
        </Reveal>
      )}
      {title && (
        <MaskText
          as="h2"
          id={id}
          className="display h2 section-head__title"
          lines={Array.isArray(title) ? title : [title]}
          delay={90}
        />
      )}
      {lead && (
        <Reveal as="p" className="lead section-head__lead" delay={280}>
          {lead}
        </Reveal>
      )}
      {children}
    </header>
  )
}

/* ------------------------------------------------------------
   Magnetic: wraps a link/button so it leans toward the cursor.
   ------------------------------------------------------------ */
export const Magnetic = forwardRef(function Magnetic(
  { as: Tag = 'span', strength = 0.3, radius = 90, className, children, ...rest },
  _ref,
) {
  const ref = useMagnetic(strength, radius)
  return (
    <Tag ref={ref} className={cx('magnetic', className)} {...rest}>
      {children}
    </Tag>
  )
})

/* ------------------------------------------------------------
   ActionLink: the primary call-to-action treatment.
   `variant`: 'solid' | 'outline' | 'ghost'
   ------------------------------------------------------------ */
export function ActionLink({
  href,
  onClick,
  variant = 'solid',
  size = 'md',
  icon = '→',
  className,
  children,
  magnetic = true,
  ...rest
}) {
  const Tag = href ? 'a' : 'button'
  const inner = (
    <Tag
      href={href}
      onClick={onClick}
      type={href ? undefined : 'button'}
      className={cx('action', `action--${variant}`, `action--${size}`, className)}
      data-cursor="hover"
      {...rest}
    >
      <span className="action__label">{children}</span>
      {icon && (
        <span className="action__icon" aria-hidden="true">
          <span className="action__icon-inner">{icon}</span>
          <span className="action__icon-inner action__icon-inner--ghost">{icon}</span>
        </span>
      )}
    </Tag>
  )
  return magnetic ? <Magnetic className="action-wrap">{inner}</Magnetic> : inner
}

/* ------------------------------------------------------------
   Badge: small status pill (Live / Concept / Build Study).
   ------------------------------------------------------------ */
export function Badge({ tone = 'neutral', children, className, ...rest }) {
  return (
    <span className={cx('badge', `badge--${tone}`, className)} {...rest}>
      <span className="badge__dot" aria-hidden="true" />
      {children}
    </span>
  )
}

/* ------------------------------------------------------------
   Ornament: the small typographic divider used between blocks.
   ------------------------------------------------------------ */
export function Ornament({ mark = '✦', className }) {
  return (
    <Reveal as="div" className={cx('ornament', className)} variant="fade" aria-hidden="true">
      <span className="ornament__rule" />
      <span className="ornament__mark">{mark}</span>
      <span className="ornament__rule" />
    </Reveal>
  )
}

/* ------------------------------------------------------------
   Figure: an image with a built-in reveal + subtle zoom-out.
   Every project preview on the site goes through this.
   ------------------------------------------------------------ */
export function Figure({
  src,
  alt,
  caption,
  ratio = '16 / 10',
  className,
  imgClassName,
  loading = 'lazy',
  sizes,
  delay = 0,
  ...rest
}) {
  const [ref, inView] = useReveal({ threshold: 0.15 })
  return (
    <figure
      ref={ref}
      data-inview={inView ? 'true' : 'false'}
      className={cx('figure', className)}
      style={{ '--ratio': ratio, '--reveal-delay': `${delay}ms` }}
      {...rest}
    >
      <span className="figure__frame">
        <img
          src={src}
          alt={alt}
          loading={loading}
          decoding="async"
          sizes={sizes}
          className={cx('figure__img', imgClassName)}
        />
        <span className="figure__veil" aria-hidden="true" />
      </span>
      {caption && <figcaption className="figure__caption">{caption}</figcaption>}
    </figure>
  )
}
