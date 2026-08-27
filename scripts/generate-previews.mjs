/* ============================================================
   PROJECT PREVIEW GENERATOR
   ------------------------------------------------------------
   Renders the placeholder project imagery as crisp, on-brand
   SVG interface mockups into public/projects/.

   Run with:  npm run assets

   These exist so the portfolio looks finished today. Replace any
   of them by dropping a real screenshot into public/projects/
   and updating the matching path in src/data/projects.js.
   ============================================================ */

import { mkdirSync, writeFileSync } from 'node:fs'
import { dirname, resolve } from 'node:path'
import { fileURLToPath } from 'node:url'

const __dirname = dirname(fileURLToPath(import.meta.url))
const OUT = resolve(__dirname, '..', 'public', 'projects')
const PUBLIC = resolve(__dirname, '..', 'public')

const W = 1600
const H = 1000

/* ---- palette ------------------------------------------------ */
const P = {
  paper: '#fbf8f4',
  shell: '#f4ece5',
  blush: '#ead9d2',
  ink: '#1c1615',
  inkDeep: '#120e0d',
  mocha: '#6b4c4c',
  white: '#ffffff',
}

/* ---- tiny helpers ------------------------------------------- */
let uid = 0
const nid = (p) => `${p}${++uid}`

const esc = (s) =>
  String(s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;')

function mulberry32(seed) {
  let a = seed >>> 0
  return () => {
    a |= 0
    a = (a + 0x6d2b79f5) | 0
    let t = Math.imul(a ^ (a >>> 15), 1 | a)
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296
  }
}

/* Blend a hex colour toward another by t (0..1). */
function mix(a, b, t) {
  const pa = [1, 3, 5].map((i) => parseInt(a.slice(i, i + 2), 16))
  const pb = [1, 3, 5].map((i) => parseInt(b.slice(i, i + 2), 16))
  const out = pa.map((v, i) => Math.round(v + (pb[i] - v) * t))
  return '#' + out.map((v) => v.toString(16).padStart(2, '0')).join('')
}

const alpha = (hex, a) => {
  const [r, g, b] = [1, 3, 5].map((i) => parseInt(hex.slice(i, i + 2), 16))
  return `rgba(${r},${g},${b},${a})`
}

/* ---- primitives --------------------------------------------- */
const rect = (x, y, w, h, fill, r = 0, extra = '') =>
  `<rect x="${+x.toFixed(1)}" y="${+y.toFixed(1)}" width="${Math.max(0, +w.toFixed(1))}" height="${Math.max(0, +h.toFixed(1))}" rx="${r}" fill="${fill}"${extra}/>`

const circle = (cx, cy, r, fill, extra = '') =>
  `<circle cx="${+cx.toFixed(1)}" cy="${+cy.toFixed(1)}" r="${+r.toFixed(1)}" fill="${fill}"${extra}/>`

const line = (x1, y1, x2, y2, stroke, w = 1) =>
  `<line x1="${+x1.toFixed(1)}" y1="${+y1.toFixed(1)}" x2="${+x2.toFixed(1)}" y2="${+y2.toFixed(1)}" stroke="${stroke}" stroke-width="${w}"/>`

function text(x, y, str, o = {}) {
  const {
    size = 18,
    fill = P.ink,
    family = 'Jost, Inter, Helvetica, Arial, sans-serif',
    weight = 400,
    anchor = 'start',
    ls = 0,
    italic = false,
    op = 1,
  } = o
  return `<text x="${+x.toFixed(1)}" y="${+y.toFixed(1)}" font-family="${family}" font-size="${size}" font-weight="${weight}" fill="${fill}" text-anchor="${anchor}" letter-spacing="${ls}"${italic ? ' font-style="italic"' : ''}${op !== 1 ? ` opacity="${op}"` : ''}>${esc(str)}</text>`
}

/* NOTE: font-family values are interpolated into a double-quoted XML
   attribute, so any family name that needs quoting must use SINGLE
   quotes: nested double quotes produce invalid SVG. */
const serif = (x, y, str, o = {}) =>
  text(x, y, str, {
    family: "'Cormorant Garamond', Georgia, 'Times New Roman', serif",
    weight: 300,
    ...o,
  })

/* A run of rounded bars standing in for a paragraph of copy. */
function copy(x, y, w, o = {}) {
  const { lines = 3, gap = 14, h = 9, fill = P.ink, op = 0.16, r = 5, last = 0.6 } = o
  let s = ''
  for (let i = 0; i < lines; i++) {
    const width = i === lines - 1 ? w * last : w * (0.9 + (i % 3) * 0.035)
    s += rect(x, y + i * (h + gap), Math.min(width, w), h, alpha(fill, op), r)
  }
  return s
}

/* An abstract stand-in for a photograph. */
function photo(x, y, w, h, o = {}) {
  const { r = 10, tint = '#b96c5b', seed = 1, dark = false } = o
  const rnd = mulberry32(seed * 7919)
  const gid = nid('g')
  const cid = nid('c')
  const base = dark ? mix(tint, P.inkDeep, 0.55) : mix(tint, P.paper, 0.62)
  const top = dark ? mix(tint, P.inkDeep, 0.3) : mix(tint, P.paper, 0.34)
  let blobs = ''
  for (let i = 0; i < 3; i++) {
    const bx = x + w * (0.18 + rnd() * 0.7)
    const by = y + h * (0.18 + rnd() * 0.7)
    const br = Math.min(w, h) * (0.24 + rnd() * 0.34)
    blobs += `<ellipse cx="${bx.toFixed(1)}" cy="${by.toFixed(1)}" rx="${br.toFixed(1)}" ry="${(br * (0.62 + rnd() * 0.5)).toFixed(1)}" fill="${i % 2 ? alpha(P.white, dark ? 0.07 : 0.4) : alpha(tint, dark ? 0.34 : 0.3)}"/>`
  }
  return `<defs>
    <linearGradient id="${gid}" x1="0" y1="0" x2="0.6" y2="1">
      <stop offset="0" stop-color="${top}"/>
      <stop offset="1" stop-color="${base}"/>
    </linearGradient>
    <clipPath id="${cid}"><rect x="${x}" y="${y}" width="${w}" height="${h}" rx="${r}"/></clipPath>
  </defs>
  <g clip-path="url(#${cid})">
    ${rect(x, y, w, h, `url(#${gid})`, r)}
    ${blobs}
    ${rect(x, y + h * 0.62, w, h * 0.38, alpha(dark ? P.inkDeep : P.ink, dark ? 0.3 : 0.05))}
  </g>`
}

/* Browser chrome wrapper. Returns { frame, area }. */
function browser(o = {}) {
  const { bg = P.white, label = '', m = 58, dark = false } = o
  const x = m
  const y = m
  const w = W - m * 2
  const h = H - m * 2
  const barH = 54
  const stroke = dark ? alpha(P.paper, 0.12) : alpha(P.ink, 0.1)
  const barBg = dark ? mix(bg, P.paper, 0.06) : mix(bg, P.ink, 0.035)
  const fid = nid('sh')

  const frame = `<defs>
      <filter id="${fid}" x="-20%" y="-20%" width="140%" height="150%">
        <feDropShadow dx="0" dy="18" stdDeviation="26" flood-color="${alpha(P.ink, 0.16)}"/>
      </filter>
    </defs>
    <g filter="url(#${fid})">
      ${rect(x, y, w, h, bg, 16)}
    </g>
    ${rect(x, y, w, barH, barBg, 16)}
    ${rect(x, y + barH - 16, w, 16, barBg)}
    ${line(x, y + barH, x + w, y + barH, stroke, 1)}
    ${circle(x + 30, y + barH / 2, 6.5, alpha(dark ? P.paper : P.ink, 0.18))}
    ${circle(x + 52, y + barH / 2, 6.5, alpha(dark ? P.paper : P.ink, 0.14))}
    ${circle(x + 74, y + barH / 2, 6.5, alpha(dark ? P.paper : P.ink, 0.1))}
    ${rect(x + w / 2 - 170, y + 14, 340, 26, alpha(dark ? P.paper : P.ink, 0.06), 13)}
    ${label ? text(x + w / 2, y + barH / 2 + 5, label, { size: 14, anchor: 'middle', fill: alpha(dark ? P.paper : P.ink, 0.45), ls: 1.4 }) : ''}
    <rect x="${x}" y="${y}" width="${w}" height="${h}" rx="16" fill="none" stroke="${stroke}"/>`

  return {
    frame,
    area: { x, y: y + barH, w, h: h - barH },
  }
}

/* Phone device frame. Returns { frame, area }. */
function phone(x, y, w, o = {}) {
  const { bg = P.white, ratio = 2.06, dark = false } = o
  const h = w * ratio
  const r = w * 0.115
  const fid = nid('ph')
  const stroke = dark ? alpha(P.paper, 0.16) : alpha(P.ink, 0.14)
  const frame = `<defs>
      <filter id="${fid}" x="-30%" y="-20%" width="160%" height="150%">
        <feDropShadow dx="0" dy="16" stdDeviation="22" flood-color="${alpha(P.ink, 0.2)}"/>
      </filter>
    </defs>
    <g filter="url(#${fid})">
      ${rect(x, y, w, h, dark ? '#0f0c0c' : P.ink, r)}
    </g>
    ${rect(x + 7, y + 7, w - 14, h - 14, bg, r - 5)}
    ${rect(x + w / 2 - w * 0.14, y + 16, w * 0.28, 10, alpha(P.ink, dark ? 0.5 : 0.16), 5)}
    <rect x="${x}" y="${y}" width="${w}" height="${h}" rx="${r}" fill="none" stroke="${stroke}"/>`
  return { frame, area: { x: x + 7, y: y + 34, w: w - 14, h: h - 48 } }
}

/* Charts ------------------------------------------------------ */
function lineChart(x, y, w, h, o = {}) {
  const { accent = '#b96c5b', seed = 3, points = 14, grid = true, fillArea = true } = o
  const rnd = mulberry32(seed * 104729)
  const gid = nid('lc')
  const pts = []
  let v = 0.45
  for (let i = 0; i < points; i++) {
    v = Math.min(0.94, Math.max(0.12, v + (rnd() - 0.42) * 0.28))
    pts.push([x + (w * i) / (points - 1), y + h - h * v])
  }
  // Catmull-Rom -> cubic bezier for a smooth curve.
  let d = `M ${pts[0][0].toFixed(1)} ${pts[0][1].toFixed(1)}`
  for (let i = 0; i < pts.length - 1; i++) {
    const p0 = pts[i - 1] || pts[i]
    const p1 = pts[i]
    const p2 = pts[i + 1]
    const p3 = pts[i + 2] || p2
    const c1 = [p1[0] + (p2[0] - p0[0]) / 6, p1[1] + (p2[1] - p0[1]) / 6]
    const c2 = [p2[0] - (p3[0] - p1[0]) / 6, p2[1] - (p3[1] - p1[1]) / 6]
    d += ` C ${c1[0].toFixed(1)} ${c1[1].toFixed(1)}, ${c2[0].toFixed(1)} ${c2[1].toFixed(1)}, ${p2[0].toFixed(1)} ${p2[1].toFixed(1)}`
  }
  let g = ''
  if (grid) {
    for (let i = 0; i <= 4; i++) {
      g += line(x, y + (h * i) / 4, x + w, y + (h * i) / 4, alpha(P.ink, 0.06), 1)
    }
  }
  const area = fillArea
    ? `<defs><linearGradient id="${gid}" x1="0" y1="0" x2="0" y2="1">
         <stop offset="0" stop-color="${alpha(accent, 0.28)}"/>
         <stop offset="1" stop-color="${alpha(accent, 0)}"/>
       </linearGradient></defs>
       <path d="${d} L ${(x + w).toFixed(1)} ${(y + h).toFixed(1)} L ${x.toFixed(1)} ${(y + h).toFixed(1)} Z" fill="url(#${gid})"/>`
    : ''
  const last = pts[pts.length - 1]
  return `${g}${area}<path d="${d}" fill="none" stroke="${accent}" stroke-width="3" stroke-linecap="round" stroke-linejoin="round"/>
    ${circle(last[0], last[1], 7, P.white)}${circle(last[0], last[1], 4.5, accent)}`
}

function barChart(x, y, w, h, o = {}) {
  const { accent = '#b96c5b', seed = 5, n = 9 } = o
  const rnd = mulberry32(seed * 15485863)
  const gap = w / n / 3.4
  const bw = (w - gap * (n - 1)) / n
  let s = ''
  for (let i = 0; i < n; i++) {
    const v = 0.22 + rnd() * 0.78
    const bh = h * v
    const bx = x + i * (bw + gap)
    s += rect(bx, y + h - bh, bw, bh, i === n - 2 ? accent : alpha(accent, 0.24), Math.min(6, bw / 2))
  }
  return s + line(x, y + h + 1, x + w, y + h + 1, alpha(P.ink, 0.1), 1)
}

function donut(cx, cy, r, o = {}) {
  const { accent = '#b96c5b', pct = 0.68, width = 16 } = o
  const c = 2 * Math.PI * r
  return `${circle(cx, cy, r, 'none', ` stroke="${alpha(P.ink, 0.08)}" stroke-width="${width}"`)}
    <circle cx="${cx}" cy="${cy}" r="${r}" fill="none" stroke="${accent}" stroke-width="${width}" stroke-linecap="round"
      stroke-dasharray="${(c * pct).toFixed(1)} ${(c * (1 - pct)).toFixed(1)}" transform="rotate(-90 ${cx} ${cy})"/>`
}

/* A generic card with an image top and copy beneath. */
function mediaCard(x, y, w, h, o = {}) {
  const { tint = '#b96c5b', seed = 1, imgH = h * 0.58, r = 12, badge = false, dark = false } = o
  const bg = dark ? alpha(P.paper, 0.05) : P.white
  const stroke = dark ? alpha(P.paper, 0.1) : alpha(P.ink, 0.08)
  return `${rect(x, y, w, h, bg, r)}
    <rect x="${x}" y="${y}" width="${w}" height="${h}" rx="${r}" fill="none" stroke="${stroke}"/>
    ${photo(x + 8, y + 8, w - 16, imgH - 8, { r: r - 4, tint, seed, dark })}
    ${badge ? rect(x + 20, y + 20, 74, 26, alpha(P.white, 0.92), 13) + text(x + 57, y + 37, '4.8 ★', { size: 13, anchor: 'middle', fill: P.ink, weight: 500 }) : ''}
    ${rect(x + 18, y + imgH + 16, w * 0.55, 12, alpha(dark ? P.paper : P.ink, dark ? 0.4 : 0.5), 6)}
    ${rect(x + 18, y + imgH + 40, w * 0.78, 8, alpha(dark ? P.paper : P.ink, 0.16), 4)}
    ${h - imgH > 90 ? rect(x + 18, y + imgH + 58, w * 0.42, 8, alpha(dark ? P.paper : P.ink, 0.12), 4) : ''}`
}

function chipRow(x, y, o = {}) {
  const { widths = [90, 120, 76, 108, 94], h = 34, gap = 12, accent = '#b96c5b', activeIndex = 0, dark = false } = o
  let s = ''
  let cx = x
  widths.forEach((w, i) => {
    const on = i === activeIndex
    s += rect(cx, y, w, h, on ? accent : alpha(dark ? P.paper : P.ink, 0.06), h / 2)
    s += rect(cx + 16, y + h / 2 - 4, w - 32, 8, on ? alpha(P.white, 0.85) : alpha(dark ? P.paper : P.ink, 0.24), 4)
    cx += w + gap
  })
  return s
}

function sidebar(x, y, w, h, o = {}) {
  const { accent = '#b96c5b', items = 7, activeIndex = 1, dark = false } = o
  const fg = dark ? P.paper : P.ink
  let s = rect(x, y, w, h, dark ? alpha(P.paper, 0.03) : mix(P.paper, P.ink, 0.03))
  s += line(x + w, y, x + w, y + h, alpha(fg, 0.08), 1)
  s += circle(x + 34, y + 44, 13, accent)
  s += rect(x + 56, y + 37, w * 0.42, 12, alpha(fg, 0.4), 6)
  for (let i = 0; i < items; i++) {
    const iy = y + 100 + i * 46
    if (i === activeIndex) s += rect(x + 14, iy - 12, w - 28, 38, alpha(accent, 0.14), 9)
    s += rect(x + 30, iy - 2, 14, 14, alpha(i === activeIndex ? accent : fg, i === activeIndex ? 0.9 : 0.22), 4)
    s += rect(x + 56, iy + 1, w * (0.3 + ((i * 7) % 5) * 0.08), 9, alpha(i === activeIndex ? accent : fg, i === activeIndex ? 0.7 : 0.18), 4)
  }
  return s
}

function statTile(x, y, w, h, o = {}) {
  const { accent = '#b96c5b', value = '24.8k', label = 'Sessions', delta = '+12.4%', dark = false } = o
  const fg = dark ? P.paper : P.ink
  return `${rect(x, y, w, h, dark ? alpha(P.paper, 0.05) : P.white, 12)}
    <rect x="${x}" y="${y}" width="${w}" height="${h}" rx="12" fill="none" stroke="${alpha(fg, 0.09)}"/>
    ${rect(x + 22, y + 22, 68, 8, alpha(fg, 0.2), 4)}
    ${text(x + 22, y + 74, value, { size: 34, weight: 400, fill: dark ? P.paper : P.ink })}
    ${text(x + 22, y + 102, label, { size: 13, fill: alpha(fg, 0.45), ls: 0.6 })}
    ${rect(x + w - 92, y + 20, 72, 24, alpha(accent, 0.14), 12)}
    ${text(x + w - 56, y + 36, delta, { size: 12, anchor: 'middle', fill: accent, weight: 500 })}`
}

function dataTable(x, y, w, h, o = {}) {
  const { rows = 6, accent = '#b96c5b', dark = false } = o
  const fg = dark ? P.paper : P.ink
  const rh = (h - 46) / rows
  let s = rect(x, y, w, h, dark ? alpha(P.paper, 0.04) : P.white, 12)
  s += `<rect x="${x}" y="${y}" width="${w}" height="${h}" rx="12" fill="none" stroke="${alpha(fg, 0.09)}"/>`
  const cols = [0.06, 0.42, 0.62, 0.8]
  cols.forEach((c) => {
    s += rect(x + w * c, y + 20, w * 0.11, 8, alpha(fg, 0.22), 4)
  })
  s += line(x + 14, y + 44, x + w - 14, y + 44, alpha(fg, 0.09), 1)
  for (let i = 0; i < rows; i++) {
    const ry = y + 46 + i * rh
    if (i) s += line(x + 14, ry, x + w - 14, ry, alpha(fg, 0.055), 1)
    s += circle(x + w * 0.06 + 8, ry + rh / 2, 9, alpha(accent, 0.2 + (i % 3) * 0.16))
    s += rect(x + w * 0.42, ry + rh / 2 - 4, w * 0.13, 8, alpha(fg, 0.3), 4)
    s += rect(x + w * 0.62, ry + rh / 2 - 4, w * 0.08, 8, alpha(fg, 0.16), 4)
    s += rect(x + w * 0.8, ry + rh / 2 - 8, 58, 16, alpha(accent, 0.12), 8)
  }
  return s
}

/* ============================================================
   SCENES: one per project, four views each (0 = cover).
   ============================================================ */

const scenes = {
  /* ---------- GLOVO: food delivery ---------- */
  glovo(v, a) {
    const { frame, area } = browser({ label: 'glovo · order in minutes' })
    const { x, y, w, h } = area

    if (v === 2) {
      // Order detail + live cart
      let s = rect(x, y, w, h, P.paper)
      s += photo(x, y, w * 0.62, 300, { r: 0, tint: a, seed: 12 })
      s += rect(x + 40, y + 240, 210, 44, alpha(P.white, 0.94), 22)
      s += text(x + 145, y + 268, '25–35 min · Free', { size: 15, anchor: 'middle', fill: P.ink })
      s += serif(x + 40, y + 360, 'Mama Nkechi Kitchen', { size: 40 })
      s += chipRow(x + 40, y + 392, { widths: [86, 104, 92, 78], accent: a, activeIndex: 1 })
      for (let i = 0; i < 3; i++) {
        const iy = y + 460 + i * 118
        s += rect(x + 40, iy, w * 0.62 - 80, 100, P.white, 12)
        s += `<rect x="${x + 40}" y="${iy}" width="${w * 0.62 - 80}" height="100" rx="12" fill="none" stroke="${alpha(P.ink, 0.08)}"/>`
        s += photo(x + 52, iy + 12, 76, 76, { r: 8, tint: a, seed: 30 + i })
        s += rect(x + 146, iy + 26, 200, 11, alpha(P.ink, 0.45), 5)
        s += rect(x + 146, iy + 50, 300, 8, alpha(P.ink, 0.15), 4)
        s += text(x + w * 0.62 - 96, iy + 58, '₦4,500', { size: 17, fill: P.ink, weight: 500 })
      }
      // cart rail
      const cx0 = x + w * 0.64
      const cw = w - (w * 0.64) - 40
      s += rect(cx0, y + 40, cw, h - 90, P.white, 14)
      s += `<rect x="${cx0}" y="${y + 40}" width="${cw}" height="${h - 90}" rx="14" fill="none" stroke="${alpha(P.ink, 0.1)}"/>`
      s += text(cx0 + 28, y + 84, 'Your order', { size: 20, fill: P.ink, weight: 500 })
      s += line(cx0 + 20, y + 108, cx0 + cw - 20, y + 108, alpha(P.ink, 0.08), 1)
      for (let i = 0; i < 4; i++) {
        const iy = y + 132 + i * 74
        s += rect(cx0 + 28, iy + 8, 34, 34, alpha(a, 0.16), 8)
        s += text(cx0 + 45, iy + 30, String(i + 1), { size: 15, anchor: 'middle', fill: mix(a, P.ink, 0.35), weight: 500 })
        s += rect(cx0 + 76, iy + 12, cw * 0.44, 9, alpha(P.ink, 0.35), 5)
        s += rect(cx0 + 76, iy + 32, cw * 0.28, 8, alpha(P.ink, 0.14), 4)
        s += text(cx0 + cw - 28, iy + 30, '₦4,500', { size: 14, anchor: 'end', fill: alpha(P.ink, 0.6) })
      }
      s += line(cx0 + 20, y + h - 190, cx0 + cw - 20, y + h - 190, alpha(P.ink, 0.08), 1)
      s += text(cx0 + 28, y + h - 150, 'Total', { size: 15, fill: alpha(P.ink, 0.5) })
      s += text(cx0 + cw - 28, y + h - 148, '₦18,000', { size: 26, anchor: 'end', fill: P.ink })
      s += rect(cx0 + 24, y + h - 118, cw - 48, 54, a, 27)
      s += text(cx0 + cw / 2, y + h - 84, 'Checkout', { size: 17, anchor: 'middle', fill: '#3a2a06', weight: 500 })
      return frame + s
    }

    if (v === 3) {
      // Mobile breakpoint
      let s = rect(x, y, w, h, mix(a, P.paper, 0.86))
      const pw = 272
      const gap = 74
      const startX = x + (w - (pw * 2 + gap)) / 2
      for (let i = 0; i < 2; i++) {
        const px = startX + i * (pw + gap)
        const py = y + 42
        const d = phone(px, py, pw, { ratio: 1.98 })
        s += d.frame
        const { x: ax, y: ay, w: aw } = d.area
        s += rect(ax, ay, aw, 46, P.white)
        s += rect(ax + 16, ay + 14, aw - 32, 26, alpha(P.ink, 0.06), 13)
        if (i === 0) {
          s += chipRow(ax + 16, ay + 60, { widths: [58, 74, 62], h: 26, gap: 8, accent: a, activeIndex: 0 })
          for (let k = 0; k < 3; k++) {
            s += mediaCard(ax + 16, ay + 104 + k * 148, aw - 32, 134, { tint: a, seed: 40 + k, imgH: 84, r: 10 })
          }
        } else {
          s += photo(ax, ay + 46, aw, 168, { r: 0, tint: a, seed: 55 })
          s += serif(ax + 18, ay + 252, 'Mama Nkechi', { size: 24 })
          for (let k = 0; k < 4; k++) {
            s += rect(ax + 18, ay + 280 + k * 62, aw - 36, 50, alpha(P.ink, 0.04), 8)
            s += rect(ax + 30, ay + 296 + k * 62, aw * 0.42, 8, alpha(P.ink, 0.3), 4)
            s += rect(ax + 30, ay + 312 + k * 62, aw * 0.3, 7, alpha(P.ink, 0.13), 4)
          }
          s += rect(ax + 18, ay + 546, aw - 36, 44, a, 22)
        }
      }
      s += text(x + w / 2, y + h - 34, '375 × 812', { size: 14, anchor: 'middle', fill: alpha(P.ink, 0.4), ls: 3 })
      return frame + s
    }

    // v0 cover / v1 browse
    let s = rect(x, y, w, h, P.paper)
    s += rect(x, y, w, 92, P.white)
    s += line(x, y + 92, x + w, y + 92, alpha(P.ink, 0.08), 1)
    s += circle(x + 56, y + 46, 15, a)
    s += serif(x + 82, y + 54, 'glovo', { size: 26, fill: P.ink })
    s += rect(x + 190, y + 26, w * 0.4, 40, alpha(P.ink, 0.05), 20)
    s += rect(x + 214, y + 42, 160, 9, alpha(P.ink, 0.18), 5)
    s += rect(x + w - 210, y + 26, 74, 40, alpha(P.ink, 0.05), 20)
    s += rect(x + w - 122, y + 26, 82, 40, a, 20)
    const pad = 44
    s += chipRow(x + pad, y + 124, { widths: [96, 126, 82, 112, 98, 88], accent: a, activeIndex: v === 1 ? 2 : 0 })
    s += serif(x + pad, y + 226, v === 1 ? 'Fast delivery near you' : 'What are you craving?', { size: 42 })
    const cols = 3
    const cardW = (w - pad * 2 - 28 * (cols - 1)) / cols
    for (let i = 0; i < 6; i++) {
      const cxp = x + pad + (i % cols) * (cardW + 28)
      const cyp = y + 264 + Math.floor(i / cols) * 268
      s += mediaCard(cxp, cyp, cardW, 244, { tint: a, seed: 10 + i + v * 5, imgH: 152, badge: true })
    }
    return frame + s
  },

  /* ---------- AURELIA: editorial e-commerce ---------- */
  aurelia(v, a) {
    const { frame, area } = browser({ label: 'aurelia · botanical skincare', bg: P.paper })
    const { x, y, w, h } = area

    if (v === 2) {
      // Product detail
      let s = rect(x, y, w, h, P.paper)
      s += photo(x, y, w * 0.5, h, { r: 0, tint: a, seed: 21 })
      const rx = x + w * 0.5 + 64
      const rw = w * 0.5 - 128
      s += text(rx, y + 84, 'SERUM · 30ML', { size: 12, ls: 4, fill: a })
      s += serif(rx, y + 152, 'Rosa Damascena', { size: 52 })
      s += serif(rx, y + 208, 'Renewal Oil', { size: 52, italic: true, fill: a })
      s += line(rx, y + 244, rx + 90, y + 244, alpha(P.ink, 0.25), 1)
      s += copy(rx, y + 276, rw, { lines: 4, op: 0.2 })
      s += text(rx, y + 428, '₦42,000', { size: 30, fill: P.ink })
      s += rect(rx, y + 466, rw * 0.52, 56, P.ink, 28)
      s += text(rx + rw * 0.26, y + 501, 'Add to bag', { size: 15, anchor: 'middle', fill: P.paper, ls: 1.6 })
      s += rect(rx + rw * 0.56, y + 466, rw * 0.2, 56, 'none', 28, ` stroke="${alpha(P.ink, 0.25)}"`)
      s += text(rx, y + 578, 'KEY INGREDIENTS', { size: 11, ls: 3.4, fill: alpha(P.ink, 0.45) })
      for (let i = 0; i < 3; i++) {
        const iy = y + 606 + i * 62
        s += circle(rx + 16, iy + 18, 15, alpha(a, 0.18))
        s += circle(rx + 16, iy + 18, 6, a)
        s += rect(rx + 46, iy + 8, rw * 0.34, 10, alpha(P.ink, 0.4), 5)
        s += rect(rx + 46, iy + 28, rw * 0.6, 8, alpha(P.ink, 0.14), 4)
      }
      return frame + s
    }

    if (v === 3) {
      // Checkout
      let s = rect(x, y, w, h, mix(a, P.paper, 0.93))
      s += serif(x + 64, y + 92, 'Checkout', { size: 44 })
      const steps = ['Details', 'Delivery', 'Payment']
      steps.forEach((label, i) => {
        const sx = x + 64 + i * 190
        const on = i <= 1
        s += circle(sx + 16, y + 148, 16, on ? a : alpha(P.ink, 0.1))
        s += text(sx + 16, y + 154, String(i + 1), { size: 14, anchor: 'middle', fill: on ? P.white : alpha(P.ink, 0.4), weight: 500 })
        s += text(sx + 42, y + 154, label, { size: 14, fill: on ? P.ink : alpha(P.ink, 0.4) })
        if (i < 2) s += line(sx + 150, y + 148, sx + 178, y + 148, alpha(P.ink, 0.14), 1)
      })
      const fw = w * 0.55
      for (let i = 0; i < 4; i++) {
        const iy = y + 208 + i * 92
        s += text(x + 64, iy, ['FULL NAME', 'EMAIL ADDRESS', 'DELIVERY ADDRESS', 'CITY / STATE'][i], { size: 10, ls: 2.6, fill: alpha(P.ink, 0.42) })
        s += rect(x + 64, iy + 14, fw - 64, 52, P.white, 8)
        s += `<rect x="${x + 64}" y="${iy + 14}" width="${fw - 64}" height="52" rx="8" fill="none" stroke="${alpha(P.ink, i === 1 ? 0.4 : 0.12)}"/>`
        s += rect(x + 84, iy + 34, (fw - 64) * (0.3 + (i % 3) * 0.12), 9, alpha(P.ink, 0.2), 5)
      }
      s += rect(x + 64, y + 590, 220, 56, P.ink, 28)
      s += text(x + 174, y + 625, 'Continue', { size: 15, anchor: 'middle', fill: P.paper, ls: 1.6 })
      // summary
      const sx0 = x + fw + 40
      const sw = w - fw - 104
      s += rect(sx0, y + 208, sw, 400, P.white, 14)
      s += `<rect x="${sx0}" y="${y + 208}" width="${sw}" height="400" rx="14" fill="none" stroke="${alpha(P.ink, 0.1)}"/>`
      s += serif(sx0 + 28, y + 254, 'Order summary', { size: 24 })
      for (let i = 0; i < 3; i++) {
        const iy = y + 282 + i * 84
        s += photo(sx0 + 28, iy, 62, 62, { r: 8, tint: a, seed: 60 + i })
        s += rect(sx0 + 104, iy + 14, sw * 0.4, 9, alpha(P.ink, 0.35), 5)
        s += rect(sx0 + 104, iy + 34, sw * 0.26, 8, alpha(P.ink, 0.14), 4)
        s += text(sx0 + sw - 28, iy + 34, '₦42,000', { size: 13, anchor: 'end', fill: alpha(P.ink, 0.55) })
      }
      s += line(sx0 + 20, y + 544, sx0 + sw - 20, y + 544, alpha(P.ink, 0.1), 1)
      s += text(sx0 + 28, y + 582, 'Total', { size: 14, fill: alpha(P.ink, 0.5) })
      s += text(sx0 + sw - 28, y + 584, '₦126,000', { size: 24, anchor: 'end', fill: P.ink })
      return frame + s
    }

    // v0 cover / v1 landing
    let s = rect(x, y, w, h, P.paper)
    s += rect(x, y, w, 84, 'none')
    s += serif(x + 56, y + 54, 'AURELIA', { size: 24, ls: 6 })
    ;['Shop', 'Ritual', 'Journal', 'About'].forEach((t, i) => {
      s += text(x + w - 400 + i * 100, y + 52, t, { size: 13, fill: alpha(P.ink, 0.55), ls: 1.4 })
    })
    s += line(x + 56, y + 84, x + w - 56, y + 84, alpha(P.ink, 0.1), 1)
    // editorial hero
    s += photo(x + w * 0.52, y + 116, w * 0.42, 420, { r: 4, tint: a, seed: 8 })
    s += text(x + 56, y + 168, 'BOTANICAL SKINCARE · EST. 2026', { size: 11, ls: 4, fill: a })
    s += serif(x + 56, y + 268, 'Skin, quietly', { size: 84 })
    s += serif(x + 56, y + 356, 'considered', { size: 84, italic: true, fill: a })
    s += copy(x + 56, y + 400, w * 0.34, { lines: 2, op: 0.22 })
    s += rect(x + 56, y + 464, 216, 56, P.ink, 28)
    s += text(x + 164, y + 499, 'Shop the ritual', { size: 14, anchor: 'middle', fill: P.paper, ls: 1.6 })
    // collection strip
    const cw2 = (w - 112 - 3 * 26) / 4
    for (let i = 0; i < 4; i++) {
      const cxp = x + 56 + i * (cw2 + 26)
      s += photo(cxp, y + 576, cw2, 190, { r: 6, tint: a, seed: 70 + i + v })
      s += rect(cxp, y + 786, cw2 * 0.66, 10, alpha(P.ink, 0.35), 5)
      s += rect(cxp, y + 808, cw2 * 0.4, 8, alpha(P.ink, 0.14), 4)
    }
    return frame + s
  },

  /* ---------- LUMEN: analytics dashboard ---------- */
  lumen(v, a) {
    const { frame, area } = browser({ label: 'lumen · analytics', bg: mix(P.paper, P.ink, 0.02) })
    const { x, y, w, h } = area
    const sbW = 232

    if (v === 3) {
      // Component states
      let s = rect(x, y, w, h, mix(P.paper, P.ink, 0.03))
      s += serif(x + 64, y + 88, 'Component states', { size: 40 })
      s += text(x + 64, y + 122, 'EVERY PIECE SHIPS WITH ALL THREE', { size: 11, ls: 3.4, fill: alpha(P.ink, 0.42) })
      const cw3 = (w - 128 - 56) / 3
      const labels = ['Loading', 'Empty', 'Error']
      for (let i = 0; i < 3; i++) {
        const cx0 = x + 64 + i * (cw3 + 28)
        const cy0 = y + 172
        const ch = 460
        s += rect(cx0, cy0, cw3, ch, P.white, 14)
        s += `<rect x="${cx0}" y="${cy0}" width="${cw3}" height="${ch}" rx="14" fill="none" stroke="${alpha(P.ink, 0.1)}"/>`
        s += text(cx0 + 24, cy0 + 44, labels[i].toUpperCase(), { size: 11, ls: 3, fill: i === 2 ? '#b4483c' : alpha(P.ink, 0.4) })
        s += line(cx0 + 16, cy0 + 64, cx0 + cw3 - 16, cy0 + 64, alpha(P.ink, 0.08), 1)
        if (i === 0) {
          for (let k = 0; k < 5; k++) {
            const gid = nid('sk')
            s += `<defs><linearGradient id="${gid}" x1="0" y1="0" x2="1" y2="0">
              <stop offset="0" stop-color="${alpha(P.ink, 0.06)}"/><stop offset="0.5" stop-color="${alpha(P.ink, 0.13)}"/><stop offset="1" stop-color="${alpha(P.ink, 0.06)}"/>
            </linearGradient></defs>`
            s += rect(cx0 + 24, cy0 + 96 + k * 40, cw3 - 48 - (k % 2) * 40, 16, `url(#${gid})`, 8)
          }
          s += rect(cx0 + 24, cy0 + 316, cw3 - 48, 110, alpha(P.ink, 0.05), 10)
        } else if (i === 1) {
          s += circle(cx0 + cw3 / 2, cy0 + 210, 46, alpha(a, 0.12))
          s += circle(cx0 + cw3 / 2, cy0 + 210, 20, 'none', ` stroke="${alpha(a, 0.6)}" stroke-width="3"`)
          s += text(cx0 + cw3 / 2, cy0 + 300, 'No data in range', { size: 16, anchor: 'middle', fill: alpha(P.ink, 0.55) })
          s += rect(cx0 + cw3 / 2 - 90, cy0 + 324, 180, 8, alpha(P.ink, 0.11), 4)
          s += rect(cx0 + cw3 / 2 - 68, cy0 + 366, 136, 44, alpha(a, 0.14), 22)
          s += text(cx0 + cw3 / 2, cy0 + 394, 'Reset filters', { size: 13, anchor: 'middle', fill: mix(a, P.ink, 0.4) })
        } else {
          s += circle(cx0 + cw3 / 2, cy0 + 210, 46, alpha('#b4483c', 0.1))
          s += text(cx0 + cw3 / 2, cy0 + 224, '!', { size: 46, anchor: 'middle', fill: '#b4483c', weight: 300 })
          s += text(cx0 + cw3 / 2, cy0 + 300, 'Could not load', { size: 16, anchor: 'middle', fill: alpha(P.ink, 0.6) })
          s += rect(cx0 + cw3 / 2 - 96, cy0 + 324, 192, 8, alpha(P.ink, 0.11), 4)
          s += rect(cx0 + cw3 / 2 - 60, cy0 + 366, 120, 44, P.ink, 22)
          s += text(cx0 + cw3 / 2, cy0 + 394, 'Retry', { size: 13, anchor: 'middle', fill: P.paper })
        }
      }
      return frame + s
    }

    let s = rect(x, y, w, h, mix(P.paper, P.ink, 0.03))
    s += sidebar(x, y, sbW, h, { accent: a, activeIndex: v === 2 ? 3 : 1 })
    const cx0 = x + sbW + 40
    const cw4 = w - sbW - 80

    s += serif(cx0, y + 66, v === 2 ? 'Segments' : 'Overview', { size: 38 })
    s += text(cx0, y + 96, v === 2 ? 'COMPARED TO PREVIOUS 30 DAYS' : 'LAST 30 DAYS · ALL CHANNELS', { size: 11, ls: 3, fill: alpha(P.ink, 0.4) })
    s += rect(cx0 + cw4 - 168, y + 44, 168, 42, P.white, 21)
    s += `<rect x="${cx0 + cw4 - 168}" y="${y + 44}" width="168" height="42" rx="21" fill="none" stroke="${alpha(P.ink, 0.12)}"/>`
    s += rect(cx0 + cw4 - 144, y + 61, 100, 8, alpha(P.ink, 0.2), 4)

    if (v === 2) {
      s += rect(cx0, y + 128, cw4 * 0.56, 300, P.white, 14)
      s += `<rect x="${cx0}" y="${y + 128}" width="${cw4 * 0.56}" height="300" rx="14" fill="none" stroke="${alpha(P.ink, 0.09)}"/>`
      s += text(cx0 + 26, y + 168, 'Sessions by segment', { size: 16, fill: alpha(P.ink, 0.65) })
      s += barChart(cx0 + 26, y + 196, cw4 * 0.56 - 52, 196, { accent: a, seed: 9, n: 8 })
      s += rect(cx0 + cw4 * 0.58, y + 128, cw4 * 0.42, 300, P.white, 14)
      s += `<rect x="${cx0 + cw4 * 0.58}" y="${y + 128}" width="${cw4 * 0.42}" height="300" rx="14" fill="none" stroke="${alpha(P.ink, 0.09)}"/>`
      s += donut(cx0 + cw4 * 0.58 + cw4 * 0.21, y + 268, 82, { accent: a, pct: 0.64 })
      s += text(cx0 + cw4 * 0.58 + cw4 * 0.21, y + 278, '64%', { size: 30, anchor: 'middle', fill: P.ink })
      for (let i = 0; i < 3; i++) {
        s += circle(cx0 + cw4 * 0.58 + 36, y + 372 + i * 22, 5, alpha(a, 1 - i * 0.3))
        s += rect(cx0 + cw4 * 0.58 + 50, y + 368 + i * 22, 100 - i * 18, 7, alpha(P.ink, 0.16), 4)
      }
      s += dataTable(cx0, y + 452, cw4, h - 512, { rows: 6, accent: a })
      return frame + s
    }

    // overview
    const tw = (cw4 - 2 * 24) / 3
    const tiles = [
      { value: '24,812', label: 'Sessions', delta: '+12.4%' },
      { value: '3m 42s', label: 'Avg. duration', delta: '+4.1%' },
      { value: '2.9%', label: 'Conversion', delta: '+0.6%' },
    ]
    tiles.forEach((t, i) => {
      s += statTile(cx0 + i * (tw + 24), y + 128, tw, 130, { accent: a, ...t })
    })
    s += rect(cx0, y + 282, cw4 * 0.64, 300, P.white, 14)
    s += `<rect x="${cx0}" y="${y + 282}" width="${cw4 * 0.64}" height="300" rx="14" fill="none" stroke="${alpha(P.ink, 0.09)}"/>`
    s += text(cx0 + 26, y + 322, 'Sessions over time', { size: 16, fill: alpha(P.ink, 0.65) })
    s += lineChart(cx0 + 26, y + 346, cw4 * 0.64 - 52, 206, { accent: a, seed: 4 + v, points: 16 })
    s += rect(cx0 + cw4 * 0.66, y + 282, cw4 * 0.34, 300, P.white, 14)
    s += `<rect x="${cx0 + cw4 * 0.66}" y="${y + 282}" width="${cw4 * 0.34}" height="300" rx="14" fill="none" stroke="${alpha(P.ink, 0.09)}"/>`
    s += text(cx0 + cw4 * 0.66 + 26, y + 322, 'Top pages', { size: 16, fill: alpha(P.ink, 0.65) })
    for (let i = 0; i < 5; i++) {
      const iy = y + 352 + i * 44
      s += rect(cx0 + cw4 * 0.66 + 26, iy, cw4 * 0.34 - 52, 30, alpha(a, 0.07), 6)
      s += rect(cx0 + cw4 * 0.66 + 26, iy, (cw4 * 0.34 - 52) * (0.86 - i * 0.16), 30, alpha(a, 0.18), 6)
      s += rect(cx0 + cw4 * 0.66 + 38, iy + 11, 84 - i * 8, 8, alpha(P.ink, 0.26), 4)
    }
    s += dataTable(cx0, y + 606, cw4, h - 666, { rows: 4, accent: a })
    return frame + s
  },

  /* ---------- NKIRU: fashion atelier (dark) ---------- */
  nkiru(v, a) {
    const { frame, area } = browser({ label: 'nkiru atelier', bg: P.inkDeep, dark: true })
    const { x, y, w, h } = area

    if (v === 2) {
      // Lookbook grid
      let s = rect(x, y, w, h, P.inkDeep)
      s += serif(x + 56, y + 82, 'The Collection', { size: 44, fill: P.paper })
      s += text(x + 56, y + 116, 'HARMATTAN · SIXTEEN LOOKS', { size: 11, ls: 4, fill: alpha(a, 0.85) })
      const cols = 4
      const gw = (w - 112 - 20 * (cols - 1)) / cols
      for (let i = 0; i < 8; i++) {
        const gx = x + 56 + (i % cols) * (gw + 20)
        const gy = y + 156 + Math.floor(i / cols) * 336
        s += photo(gx, gy, gw, 288, { r: 3, tint: a, seed: 90 + i, dark: true })
        s += text(gx, gy + 314, `LOOK ${String(i + 1).padStart(2, '0')}`, { size: 11, ls: 3, fill: alpha(P.paper, 0.5) })
      }
      return frame + s
    }

    if (v === 3) {
      // Craft detail
      let s = rect(x, y, w, h, P.inkDeep)
      s += photo(x, y, w * 0.54, h, { r: 0, tint: a, seed: 33, dark: true })
      const rx = x + w * 0.54 + 72
      const rw = w - w * 0.54 - 144
      s += text(rx, y + 104, 'THE CRAFT', { size: 11, ls: 4.6, fill: a })
      s += serif(rx, y + 190, 'Hand-finished', { size: 58, fill: P.paper })
      s += serif(rx, y + 254, 'in Lagos', { size: 58, italic: true, fill: a })
      s += line(rx, y + 296, rx + 80, y + 296, alpha(P.paper, 0.3), 1)
      s += copy(rx, y + 330, rw, { lines: 4, fill: P.paper, op: 0.28 })
      const details = ['FABRIC', 'ATELIER', 'EDITION']
      details.forEach((d, i) => {
        const iy = y + 490 + i * 74
        s += text(rx, iy, d, { size: 10, ls: 3, fill: alpha(P.paper, 0.4) })
        s += rect(rx, iy + 16, rw * (0.5 - i * 0.08), 10, alpha(P.paper, 0.32), 5)
        s += line(rx, iy + 48, rx + rw, iy + 48, alpha(P.paper, 0.1), 1)
      })
      return frame + s
    }

    // v0 cover / v1 opening look: full bleed
    let s = photo(x, y, w, h, { r: 0, tint: a, seed: 5 + v, dark: true })
    s += rect(x, y, w, h, alpha(P.inkDeep, 0.28))
    s += serif(x + 56, y + 62, 'NKIRU', { size: 26, ls: 8, fill: P.paper })
    ;['Collections', 'Atelier', 'Stockists', 'Contact'].forEach((t, i) => {
      s += text(x + w - 460 + i * 118, y + 58, t, { size: 13, fill: alpha(P.paper, 0.72), ls: 1.4 })
    })
    s += serif(x + 56, y + h * 0.62, 'Harmattan', { size: 132, fill: P.paper })
    s += serif(x + 56, y + h * 0.62 + 120, 'Twenty Twenty-Six', { size: 62, italic: true, fill: alpha(a, 0.95) })
    s += line(x + 56, y + h * 0.62 + 158, x + 200, y + h * 0.62 + 158, alpha(P.paper, 0.5), 1)
    s += text(x + 56, y + h - 44, 'SCROLL TO EXPLORE', { size: 11, ls: 4, fill: alpha(P.paper, 0.6) })
    s += rect(x + w - 118, y + h - 106, 62, 62, 'none', 31, ` stroke="${alpha(P.paper, 0.4)}"`)
    s += text(x + w - 87, y + h - 68, '→', { size: 22, anchor: 'middle', fill: P.paper })
    return frame + s
  },

  /* ---------- PULSE: mobile fitness ---------- */
  pulse(v, a) {
    const bg = mix(a, P.paper, 0.84)
    let s = rect(0, 0, W, H, bg)
    // soft backdrop
    s += circle(W * 0.16, H * 0.2, 250, alpha(a, 0.12))
    s += circle(W * 0.86, H * 0.82, 300, alpha(a, 0.1))

    const drawWorkout = (ax, ay, aw, ah) => {
      let p = rect(ax, ay, aw, ah, mix(a, P.ink, 0.72))
      p += text(ax + 22, ay + 40, 'SET 3 OF 5', { size: 11, ls: 3, fill: alpha(P.paper, 0.55) })
      p += serif(ax + 22, ay + 96, 'Back Squat', { size: 36, fill: P.paper })
      p += text(ax + 22, ay + 132, '80 kg × 8 reps', { size: 15, fill: alpha(P.paper, 0.6) })
      p += circle(ax + aw / 2, ay + 268, 92, 'none', ` stroke="${alpha(P.paper, 0.14)}" stroke-width="12"`)
      const c = 2 * Math.PI * 92
      p += `<circle cx="${ax + aw / 2}" cy="${ay + 268}" r="92" fill="none" stroke="${a}" stroke-width="12" stroke-linecap="round" stroke-dasharray="${(c * 0.62).toFixed(1)} ${(c * 0.38).toFixed(1)}" transform="rotate(-90 ${ax + aw / 2} ${ay + 268})"/>`
      p += text(ax + aw / 2, ay + 280, '01:24', { size: 40, anchor: 'middle', fill: P.paper })
      p += text(ax + aw / 2, ay + 308, 'REST', { size: 11, anchor: 'middle', fill: alpha(P.paper, 0.45), ls: 3 })
      // thumb-zone controls
      p += rect(ax + 20, ay + ah - 148, aw - 40, 68, a, 34)
      p += text(ax + aw / 2, ay + ah - 105, 'Complete set', { size: 17, anchor: 'middle', fill: '#101820', weight: 500 })
      p += rect(ax + 20, ay + ah - 66, (aw - 52) / 2, 52, alpha(P.paper, 0.12), 26)
      p += rect(ax + aw / 2 + 6, ay + ah - 66, (aw - 52) / 2, 52, alpha(P.paper, 0.12), 26)
      return p
    }

    const drawReview = (ax, ay, aw, ah) => {
      let p = rect(ax, ay, aw, ah, P.white)
      p += text(ax + 22, ay + 42, 'THIS WEEK', { size: 11, ls: 3, fill: alpha(P.ink, 0.42) })
      p += serif(ax + 22, ay + 90, 'Progress', { size: 34 })
      p += rect(ax + 20, ay + 116, aw - 40, 150, mix(a, P.paper, 0.9), 14)
      p += lineChart(ax + 38, ay + 140, aw - 76, 104, { accent: a, seed: 11, points: 10, grid: false })
      for (let i = 0; i < 4; i++) {
        const iy = ay + 290 + i * 76
        p += rect(ax + 20, iy, aw - 40, 62, alpha(P.ink, 0.035), 12)
        p += circle(ax + 52, iy + 31, 17, alpha(a, 0.2))
        p += rect(ax + 82, iy + 18, aw * 0.4, 9, alpha(P.ink, 0.34), 5)
        p += rect(ax + 82, iy + 36, aw * 0.26, 8, alpha(P.ink, 0.13), 4)
        p += text(ax + aw - 34, iy + 38, `${40 + i * 6}m`, { size: 13, anchor: 'end', fill: alpha(P.ink, 0.4) })
      }
      return p
    }

    const drawBuilder = (ax, ay, aw, ah) => {
      let p = rect(ax, ay, aw, ah, P.white)
      p += text(ax + 22, ay + 42, 'NEW SESSION', { size: 11, ls: 3, fill: alpha(P.ink, 0.42) })
      p += serif(ax + 22, ay + 90, 'Leg day', { size: 34 })
      p += chipRow(ax + 20, ay + 112, { widths: [62, 78, 66], h: 28, gap: 8, accent: a, activeIndex: 1 })
      for (let i = 0; i < 5; i++) {
        const iy = ay + 168 + i * 78
        p += rect(ax + 20, iy, aw - 40, 64, P.white, 12)
        p += `<rect x="${ax + 20}" y="${iy}" width="${aw - 40}" height="64" rx="12" fill="none" stroke="${alpha(P.ink, 0.09)}"/>`
        p += rect(ax + 36, iy + 18, 28, 28, alpha(a, 0.16), 8)
        p += rect(ax + 78, iy + 18, aw * 0.42, 9, alpha(P.ink, 0.34), 5)
        p += rect(ax + 78, iy + 36, aw * 0.3, 8, alpha(P.ink, 0.13), 4)
      }
      p += rect(ax + 20, ay + ah - 84, aw - 40, 60, P.ink, 30)
      p += text(ax + aw / 2, ay + ah - 46, 'Start session', { size: 16, anchor: 'middle', fill: P.paper })
      return p
    }

    if (v === 1) {
      const pw = 340
      const d = phone(W / 2 - pw / 2, 40, pw, { ratio: 2.6 })
      s += d.frame
      s += drawWorkout(d.area.x, d.area.y, d.area.w, d.area.h)
      return s
    }

    if (v === 2 || v === 3) {
      const pw = 328
      const gap = 96
      const sx = W / 2 - pw - gap / 2
      const d1 = phone(sx, 78, pw, { ratio: 2.4 })
      const d2 = phone(sx + pw + gap, 78, pw, { ratio: 2.4 })
      s += d1.frame + d2.frame
      if (v === 2) {
        s += drawReview(d1.area.x, d1.area.y, d1.area.w, d1.area.h)
        s += drawWorkout(d2.area.x, d2.area.y, d2.area.w, d2.area.h)
      } else {
        s += drawBuilder(d1.area.x, d1.area.y, d1.area.w, d1.area.h)
        s += drawReview(d2.area.x, d2.area.y, d2.area.w, d2.area.h)
      }
      return s
    }

    // cover: three phones, centre raised
    const pw = 286
    const gap = 54
    const total = pw * 3 + gap * 2
    const sx = (W - total) / 2
    const specs = [
      { x: sx, y: 150, draw: drawReview },
      { x: sx + pw + gap, y: 78, draw: drawWorkout },
      { x: sx + (pw + gap) * 2, y: 150, draw: drawBuilder },
    ]
    specs.forEach((sp) => {
      const d = phone(sp.x, sp.y, pw, { ratio: 2.28 })
      s += d.frame
      s += sp.draw(d.area.x, d.area.y, d.area.w, d.area.h)
    })
    return s
  },

  /* ---------- VERDANT: plant care ---------- */
  verdant(v, a) {
    const { frame, area } = browser({ label: 'verdant · plant care', bg: mix(a, P.paper, 0.94) })
    const { x, y, w, h } = area
    const sbW = 226

    if (v === 2) {
      // Species library
      let s = rect(x, y, w, h, mix(a, P.paper, 0.94))
      s += sidebar(x, y, sbW, h, { accent: a, activeIndex: 2 })
      const cx0 = x + sbW + 44
      const cw5 = w - sbW - 88
      s += serif(cx0, y + 70, 'Species library', { size: 38 })
      s += rect(cx0 + cw5 - 300, y + 40, 300, 44, P.white, 22)
      s += `<rect x="${cx0 + cw5 - 300}" y="${y + 40}" width="300" height="44" rx="22" fill="none" stroke="${alpha(P.ink, 0.12)}"/>`
      s += circle(cx0 + cw5 - 274, y + 62, 7, 'none', ` stroke="${alpha(P.ink, 0.3)}" stroke-width="2"`)
      s += rect(cx0 + cw5 - 254, y + 58, 140, 8, alpha(P.ink, 0.16), 4)
      s += chipRow(cx0, y + 104, { widths: [82, 104, 92, 78], accent: a, activeIndex: 0 })
      const cols = 4
      const gw = (cw5 - 22 * (cols - 1)) / cols
      for (let i = 0; i < 8; i++) {
        const gx = cx0 + (i % cols) * (gw + 22)
        const gy = y + 168 + Math.floor(i / cols) * 250
        s += mediaCard(gx, gy, gw, 226, { tint: a, seed: 120 + i, imgH: 138, r: 12 })
      }
      return frame + s
    }

    if (v === 3) {
      // Care history
      let s = rect(x, y, w, h, mix(a, P.paper, 0.94))
      s += sidebar(x, y, sbW, h, { accent: a, activeIndex: 4 })
      const cx0 = x + sbW + 44
      const cw6 = w - sbW - 88
      s += serif(cx0, y + 70, 'Care history', { size: 38 })
      s += text(cx0, y + 100, 'MONSTERA DELICIOSA · 18 MONTHS', { size: 11, ls: 3, fill: alpha(P.ink, 0.42) })
      s += rect(cx0, y + 132, cw6, 220, P.white, 14)
      s += `<rect x="${cx0}" y="${y + 132}" width="${cw6}" height="220" rx="14" fill="none" stroke="${alpha(P.ink, 0.09)}"/>`
      s += barChart(cx0 + 30, y + 168, cw6 - 60, 150, { accent: a, seed: 14, n: 18 })
      // diary entries
      for (let i = 0; i < 4; i++) {
        const iy = y + 384 + i * 106
        s += line(cx0 + 34, iy, cx0 + 34, iy + 106, alpha(P.ink, 0.1), 1)
        s += circle(cx0 + 34, iy + 26, 9, a)
        s += circle(cx0 + 34, iy + 26, 15, 'none', ` stroke="${alpha(a, 0.25)}" stroke-width="2"`)
        s += text(cx0 + 66, iy + 20, ['Watered, 240ml', 'Repotted into 18cm', 'New leaf unfurled', 'Fed, half strength'][i], { size: 17, fill: P.ink })
        s += rect(cx0 + 66, iy + 38, cw6 * 0.5, 8, alpha(P.ink, 0.13), 4)
        s += text(cx0 + cw6 - 20, iy + 22, ['2 days ago', '3 weeks ago', 'Last month', '6 weeks ago'][i], { size: 13, anchor: 'end', fill: alpha(P.ink, 0.4) })
      }
      return frame + s
    }

    // v0 cover / v1 today
    let s = rect(x, y, w, h, mix(a, P.paper, 0.94))
    s += sidebar(x, y, sbW, h, { accent: a, activeIndex: 0 })
    const cx0 = x + sbW + 44
    const cw7 = w - sbW - 88
    s += text(cx0, y + 56, 'GOOD MORNING, AMANDA', { size: 11, ls: 3.4, fill: a })
    s += serif(cx0, y + 108, 'Three plants need you today', { size: 42 })
    // task cards
    const tw = (cw7 - 2 * 22) / 3
    const tasks = ['Water', 'Rotate', 'Feed']
    for (let i = 0; i < 3; i++) {
      const tx = cx0 + i * (tw + 22)
      s += rect(tx, y + 152, tw, 260, P.white, 14)
      s += `<rect x="${tx}" y="${y + 152}" width="${tw}" height="260" rx="14" fill="none" stroke="${alpha(P.ink, 0.09)}"/>`
      s += photo(tx + 10, y + 162, tw - 20, 120, { r: 10, tint: a, seed: 140 + i })
      s += rect(tx + 22, y + 302, 66, 24, alpha(a, 0.16), 12)
      s += text(tx + 55, y + 318, tasks[i], { size: 12, anchor: 'middle', fill: mix(a, P.ink, 0.4) })
      s += rect(tx + 22, y + 340, tw * 0.55, 11, alpha(P.ink, 0.4), 5)
      s += rect(tx + 22, y + 362, tw * 0.36, 8, alpha(P.ink, 0.14), 4)
      s += rect(tx + tw - 62, y + 336, 40, 40, a, 20)
      s += text(tx + tw - 42, y + 361, '✓', { size: 18, anchor: 'middle', fill: P.white })
    }
    // upcoming list
    s += text(cx0, y + 470, 'COMING UP THIS WEEK', { size: 11, ls: 3, fill: alpha(P.ink, 0.42) })
    for (let i = 0; i < 4; i++) {
      const iy = y + 494 + i * 74
      s += rect(cx0, iy, cw7, 62, P.white, 12)
      s += `<rect x="${cx0}" y="${iy}" width="${cw7}" height="62" rx="12" fill="none" stroke="${alpha(P.ink, 0.08)}"/>`
      s += photo(cx0 + 12, iy + 11, 40, 40, { r: 8, tint: a, seed: 160 + i })
      s += rect(cx0 + 68, iy + 18, cw7 * 0.2, 10, alpha(P.ink, 0.36), 5)
      s += rect(cx0 + 68, iy + 36, cw7 * 0.13, 8, alpha(P.ink, 0.13), 4)
      s += rect(cx0 + cw7 * 0.5, iy + 22, cw7 * 0.24, 14, alpha(a, 0.1), 7)
      s += rect(cx0 + cw7 * 0.5, iy + 22, cw7 * 0.24 * (0.8 - i * 0.15), 14, alpha(a, 0.4), 7)
      s += text(cx0 + cw7 - 20, iy + 37, `in ${i + 2} days`, { size: 13, anchor: 'end', fill: alpha(P.ink, 0.4) })
    }
    return frame + s
  },
}

/* ============================================================
   PORTRAIT PLACEHOLDERS (hero + about)
   ============================================================ */
function portrait(w, h, o = {}) {
  const { seed = 1, label = 'CA' } = o
  const a = '#b96c5b'
  uid = 0
  const bgId = nid('pg')
  const scrimId = nid('ps')
  const clipId = nid('pc')

  // Composition is deliberate rather than random: a halo behind an
  // off-centre figure, two thin arcs for movement, then a scrim and
  // the monogram. It should read as an intentional illustration, not
  // as noise: it is standing in for a real photograph.
  const cxp = w * (seed % 2 === 0 ? 0.46 : 0.52)
  const headR = w * 0.108
  const headY = h * 0.415
  const haloR = w * 0.34
  const haloY = h * 0.36

  const shoulderW = headR * 2.35
  const figure = `
    <path d="M ${(cxp - shoulderW).toFixed(1)} ${h.toFixed(1)}
             C ${(cxp - shoulderW).toFixed(1)} ${(headY + headR * 2.4).toFixed(1)},
               ${(cxp - headR * 1.25).toFixed(1)} ${(headY + headR * 1.05).toFixed(1)},
               ${cxp.toFixed(1)} ${(headY + headR * 1.02).toFixed(1)}
             C ${(cxp + headR * 1.25).toFixed(1)} ${(headY + headR * 1.05).toFixed(1)},
               ${(cxp + shoulderW).toFixed(1)} ${(headY + headR * 2.4).toFixed(1)},
               ${(cxp + shoulderW).toFixed(1)} ${h.toFixed(1)} Z"
          fill="${alpha(a, 0.42)}"/>
    ${circle(cxp, headY, headR, alpha(a, 0.46))}`

  // Two hairline arcs sweeping past the figure.
  const arcs = `
    <path d="M ${(w * 0.06).toFixed(1)} ${(h * 0.74).toFixed(1)}
             Q ${(w * 0.5).toFixed(1)} ${(h * 0.42).toFixed(1)}
               ${(w * 0.97).toFixed(1)} ${(h * 0.66).toFixed(1)}"
          fill="none" stroke="${alpha(a, 0.28)}" stroke-width="${(w * 0.0022).toFixed(2)}"/>
    <path d="M ${(w * 0.1).toFixed(1)} ${(h * 0.2).toFixed(1)}
             Q ${(w * 0.62).toFixed(1)} ${(h * 0.08).toFixed(1)}
               ${(w * 0.93).toFixed(1)} ${(h * 0.3).toFixed(1)}"
          fill="none" stroke="${alpha(P.mocha, 0.16)}" stroke-width="${(w * 0.0018).toFixed(2)}"/>`

  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${w} ${h}" width="${w}" height="${h}" role="img" aria-label="Portrait placeholder">
  <defs>
    <linearGradient id="${bgId}" x1="0.1" y1="0" x2="0.75" y2="1">
      <stop offset="0" stop-color="${P.shell}"/>
      <stop offset="0.55" stop-color="${mix(P.blush, P.shell, 0.35)}"/>
      <stop offset="1" stop-color="${P.blush}"/>
    </linearGradient>
    <linearGradient id="${scrimId}" x1="0" y1="0" x2="0" y2="1">
      <stop offset="0" stop-color="${alpha(P.ink, 0)}"/>
      <stop offset="1" stop-color="${alpha(P.ink, 0.09)}"/>
    </linearGradient>
    <clipPath id="${clipId}"><rect x="0" y="0" width="${w}" height="${h}"/></clipPath>
  </defs>
  <g clip-path="url(#${clipId})">
    ${rect(0, 0, w, h, `url(#${bgId})`)}
    ${circle(cxp, haloY, haloR, alpha(P.white, 0.5))}
    ${circle(cxp, haloY, haloR, 'none', ` stroke="${alpha(a, 0.22)}" stroke-width="${(w * 0.0022).toFixed(2)}"`)}
    ${arcs}
    ${figure}
    ${rect(0, h * 0.46, w, h * 0.54, `url(#${scrimId})`)}
    ${serif(w / 2, h * 0.735, label, { size: w * 0.15, anchor: 'middle', fill: alpha(a, 0.6), italic: true })}
    ${text(w / 2, h * 0.782, 'REPLACE WITH YOUR PHOTO', { size: w * 0.026, anchor: 'middle', fill: alpha(P.mocha, 0.52), ls: w * 0.0055 })}
    <rect x="${(w * 0.03).toFixed(1)}" y="${(h * 0.022).toFixed(1)}" width="${(w * 0.94).toFixed(1)}" height="${(h * 0.956).toFixed(1)}" fill="none" stroke="${alpha(P.white, 0.45)}" stroke-width="${(w * 0.0022).toFixed(2)}"/>
  </g>
</svg>`
}

function favicon() {
  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 64 64" width="64" height="64">
  <rect width="64" height="64" rx="14" fill="#1c1615"/>
  <text x="32" y="45" font-family="Georgia, 'Times New Roman', serif" font-size="38" font-style="italic" font-weight="300" fill="#b96c5b" text-anchor="middle">A</text>
</svg>`
}

/* ============================================================
   RENDER
   ============================================================ */
function wrap(inner, bg = P.shell) {
  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${W} ${H}" width="${W}" height="${H}" role="img" aria-label="Interface preview">
  ${rect(0, 0, W, H, bg)}
  ${inner}
</svg>`
}

const backdrops = {
  glovo: mix('#e0a53a', P.paper, 0.82),
  aurelia: mix('#b96c5b', P.paper, 0.86),
  lumen: mix('#879c89', P.paper, 0.86),
  nkiru: mix('#c4a177', P.ink, 0.84),
  pulse: mix('#7c8fb9', P.paper, 0.84),
  verdant: mix('#6f9b74', P.paper, 0.86),
}

const accents = {
  glovo: '#e0a53a',
  aurelia: '#b96c5b',
  lumen: '#879c89',
  nkiru: '#c4a177',
  pulse: '#7c8fb9',
  verdant: '#6f9b74',
}

function main() {
  mkdirSync(OUT, { recursive: true })
  const names = ['cover', '1', '2', '3']
  let count = 0

  for (const [id, scene] of Object.entries(scenes)) {
    for (let v = 0; v < 4; v++) {
      uid = 0
      const inner = scene(v, accents[id])
      const svgStr = wrap(inner, backdrops[id])
      const file = resolve(OUT, `${id}-${names[v]}.svg`)
      writeFileSync(file, svgStr, 'utf8')
      count++
    }
  }

  /* The two portraits are real photographs now (public/amanda.jpeg and
     public/amanda2.jpeg), so nothing is generated for them here. */
  writeFileSync(resolve(PUBLIC, 'favicon.svg'), favicon(), 'utf8')

  console.log(`Generated ${count} project previews + favicon into public/`)
}

main()
