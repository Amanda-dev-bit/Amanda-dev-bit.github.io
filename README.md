# Chukwujekwu Amanda | Portfolio

**Live site: _add the URL here after the first deploy_** (Actions prints it, and it is
shown under Settings → Pages). Put the same URL in the repo's About → Website field
so it appears in the sidebar.

![The portfolio, Chukwujekwu Amanda, Web Developer and UI/UX Designer](public/og.png)

A portfolio site for **Chukwujekwu Amanda Chimdiuso**, Web Developer & UI/UX Designer,
Lagos, Nigeria.

Built with **React 19 + Vite** and **pure CSS**, no Tailwind, no CSS-in-JS, no animation
library. Every transition is hand-written.

---

## Quick start

```bash
npm install       # once
npm run dev       # http://localhost:5173
npm run build     # production build into dist/
npm run preview   # serve the production build locally
npm run assets    # regenerate the placeholder project imagery
```

---

## Editing your content

Everything you will want to change lives in `src/data/`. You should not need to
open a component to update the site.

| File | What it holds |
| --- | --- |
| `src/data/site.js` | Your name, role, email, phone, location, bio, facts, languages, nav, social links, stats |
| `src/data/projects.js` | Every project, title, description, images, stack, links |
| `src/data/skills.js` | The four craft disciplines and their proficiency levels |
| `src/data/experience.js` | Work history, education, and the services list |

### The contact form (Formspree)

The enquiry form in the Contact section posts to [Formspree](https://formspree.io).
It needs exactly one value to go live.

1. Sign up at formspree.io and create a new form. Point it at the same address as
   `profile.email` so replies land in one inbox.
2. Formspree gives you an endpoint that looks like `https://formspree.io/f/abcdwxyz`.
3. Open `src/data/site.js` and paste **only the id**, the part after `/f/`:

```js
export const formspreeId = 'abcdwxyz'
```

That is the only edit. A Formspree form id is meant to be public, so it is safe to
commit.

Until it is filled in the form still works: it opens the visitor's own mail app with
the message already written out, so an enquiry is never quietly lost. Formspree's free
tier allows 50 submissions a month, and the very first submission has to be confirmed
from the email they send you.

The form fields map to what arrives in your inbox: name, email, what they need, and
the message. A hidden honeypot field silently drops bot submissions.


### Adding a project

1. Put your screenshots in `public/projects/`.
2. Add an entry to the `projects` array in `src/data/projects.js`:

```js
{
  id: 'my-project',
  slug: 'my-project',
  index: '07',
  title: 'Project Name',
  subtitle: 'What it is',
  category: 'Frontend Development',
  status: 'live',              // 'live' | 'concept' | 'study'
  year: '2026',
  role: 'Design & Frontend',
  duration: '3 weeks',
  accent: '#b96c5b',           // tints the hover state
  featured: true,              // featured cards are wider in the grid
  summary: 'One sentence for the card.',
  description: ['A paragraph.', 'Another paragraph.'],
  highlights: ['What you actually did', '…'],
  stack: ['React', 'CSS'],
  cover: 'projects/my-shot.png',              // no leading slash
  gallery: [{ src: 'projects/my-shot-2.png', caption: 'The detail view' }],
  links: { live: 'https://…', repo: 'https://…' },
}
```

3. If the category is new, add it to the `filters` array in the same file.

**A note on `status`.** `live` shows a green *Live* badge. Only use it for projects
that are genuinely deployed and reachable, it is the first thing a recruiter checks.
`concept` and `study` are honest labels for self-directed work, and there is no shame
in them; a well-presented concept beats an overclaimed one.

### Replacing the placeholder imagery

The site ships with generated SVG interface mockups so it looks finished on day one.
They are **placeholders**, swap them for real screenshots as you build things out:

- Project previews: `public/projects/*.svg` (still generated placeholders)
- Hero photo: `public/amanda.jpeg`, referenced in `src/components/Hero/Hero.jsx`
- About photo: `public/amanda2.jpeg`, referenced in `src/components/About/About.jsx`

The two photographs are real, the project previews are not. To swap a project preview,
drop a `.png` or `.jpg` into `public/projects/` and point `src/data/projects.js` at it;
the layout does not care about the file type.

To swap a portrait, replace the file in `public/` and update the `width` and `height`
attributes on the `<img>` to the new pixel dimensions. Both plates are `aspect-ratio:
4 / 5` with `object-fit: cover`, so any shape works, it just crops.

`npm run assets` regenerates the project placeholders only; it no longer touches the
portraits. The generator is `scripts/generate-previews.mjs`.

---

## Architecture

```
.github/workflows/
  deploy.yml               builds and publishes to GitHub Pages on push to main
  ci.yml                   builds pull requests, checks the output is complete
src/
  main.jsx                 entry
  App.jsx                  page composition
  App.css
  styles/
    tokens.css             every colour, space, type, motion token, start here
    base.css               reset + element defaults
    animations.css         keyframes + the scroll-reveal system
    utilities.css          .container .section .eyebrow .display .lead .chip …
    index.css              imports the four above
  hooks/index.js           reveal, parallax, magnetic, tilt, count-up, theme,
                           focus trap, scroll lock, active section, …
  lib/utils.js             cx() asset() splitChars() scrollToId() …
  components/
    ui/                    shared primitives: Reveal, MaskText, SplitText,
                           SectionHead, Magnetic, ActionLink, Badge,
                           Ornament, Figure
    Preloader/ Cursor/ ScrollProgress/ Header/ Hero/
    About/ Craft/ Work/ Journey/ Contact/ Footer/
    Contact/ContactForm.jsx  the Formspree enquiry form
data/                      all editable content
public/                    static assets served as-is
scripts/                   generates the placeholder project artwork
legacy/                    the original single-file site, kept for reference
vite.config.js             base path + the social-tag injection
.nvmrc                     Node version, kept in step with the workflows
```

Each component owns exactly two files, `Name.jsx` and `Name.css`, and prefixes its
class names (`.hero__title`, `.work__card`). No component hard-codes a colour or a
duration; everything references a token, which is why dark mode works for free.

### Theming

Light is the default. `:root[data-theme="dark"]` in `tokens.css` redefines only the
semantic tokens. The theme is stored in `localStorage` and applied by a small inline
script in `index.html` before first paint, so there is no flash of the wrong theme.

### Motion

All animation is CSS transform/opacity driven by an `IntersectionObserver`
(`useReveal`) that sets `data-inview="true"`. Everything is neutralised under
`prefers-reduced-motion: reduce`, with reduced motion on, the intro curtain is
skipped entirely, the custom cursor never activates and the ticker stops.

### Two accents, on purpose

`tokens.css` defines three related clays, and the distinction matters if you
ever change them:

| Token | Value (light) | Used for |
| --- | --- | --- |
| `--accent` | `#9b5b4c` | Small text, labels, rules, UI, dark enough for 4.5:1 |
| `--accent-display` | `#b96c5b` | Large italic display words only, where 3:1 applies |
| `--accent-inset` | `#b96c5b` | What `--accent` becomes inside `.on-dark` sections |

Darkening a colour buys contrast on a light background and loses it on a dark
one, which is why the dark Work section takes its own value. Every text/background
pair on the site was measured; the lowest passing ratio is 4.50:1.

Contrast, keyboard operation, focus management and reduced motion were all
verified against the built site. If you change a colour, re-check it, the
palette is doing real work, not just decoration.

---

## Deploying to GitHub Pages

The repository ships with a workflow that builds the site and publishes it, so a
push to `main` is the whole deploy. `dist/` is never committed.

### First time, once

1. **Create the repository on GitHub** and push this folder to it (see below).
2. **Turn Pages on**: repo → **Settings** → **Pages** → under *Build and deployment*
   set **Source** to **GitHub Actions**.

   This is the step people miss. If Source is left on *Deploy from a branch* the
   workflow runs, goes green, and nothing is ever published.
3. Push to `main`. Watch it under the **Actions** tab. The finished URL is printed
   on the deploy job and shown under Settings → Pages.

That is all. No `gh-pages` branch, no `dist/` in git.

### Pushing this folder the first time

```bash
git init
git add .
git commit -m "Portfolio site"
git branch -M main
git remote add origin https://github.com/<your-username>/<your-repo>.git
git push -u origin main
```

### What the workflows do

| File | When | What |
| --- | --- | --- |
| `.github/workflows/deploy.yml` | push to `main`, or run by hand | installs, builds, publishes to Pages |
| `.github/workflows/ci.yml` | pull requests and other branches | builds and checks the output is complete |

`ci.yml` exists so a broken build is caught on a branch rather than discovered as a
failed deploy on `main`.

### Why nothing needs your domain hard-coded

`vite.config.js` sets `base: './'`, so the same build works at a domain root, inside
a `/repository-name/` sub-path, or opened straight off disk.

Social crawlers are the one exception: they ignore relative URLs, so link previews
stay blank without absolute ones. The deploy workflow resolves the real published
address (including a custom domain) through `actions/configure-pages` and passes it
to the build as `VITE_SITE_URL`. The `socialUrls()` plugin in `vite.config.js` turns
that into the `canonical`, `og:url`, `og:image` and `twitter:image` tags.

Nothing to edit. A local `npm run build` simply leaves those four tags out.

`public/og.png` is the 1200x630 card that link unfurls will show.

### Using a custom domain

Add the domain under Settings → Pages, then commit a `CNAME` file into `public/` with
the bare domain in it, for example:

```
amandachimdiuso.com
```

`configure-pages` will pick the custom domain up automatically, so the social tags
follow it with no further changes.

### Other hosts

The build output is a plain static `dist/` folder and will run anywhere.

- **Vercel**: import the repo, it detects Vite automatically.
- **Netlify**: build command `npm run build`, publish directory `dist`.

On either one, set `VITE_SITE_URL` to your final URL in the project's environment
variables so the social tags are still emitted.

---

## The old site

The original `index.html`, `styles.css` and `script.js` are preserved untouched in
`legacy/`. Nothing in the new build depends on them.

---

## Reuse

Copyright 2026 Chukwujekwu Amanda Chimdiuso.

The code is here to be read and learned from. The writing, the photographs and the CV
are not licensed for reuse. If you want to build on the code itself, please ask.
