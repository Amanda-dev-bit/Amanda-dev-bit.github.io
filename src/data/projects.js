/* ============================================================
   WORK / PROJECTS
   ------------------------------------------------------------
   HOW TO ADD OR EDIT A PROJECT
   1. Drop your screenshots into  public/projects/
   2. Point `cover` and `gallery[].src` at them, e.g.
        cover: 'projects/my-shot.png'
      (paths are relative, with no leading slash, so the site works
       from a sub-folder as well as from a domain root).
   3. Set `status`:
        'live'    -> a real, shipped project (shows a Live badge)
        'concept' -> a self-directed design concept
        'study'   -> a build/clone done to learn a technique
      Only mark something 'live' if it really is. That badge is
      the one thing a recruiter will check.
   ============================================================ */

export const projects = [
  {
    id: 'glovo',
    slug: 'glovo-food-delivery',
    index: '01',
    title: 'Glovo',
    subtitle: 'Food Delivery Interface',
    category: 'Frontend Development',
    status: 'study',
    year: '2025',
    role: 'Design & Frontend',
    duration: '2 weeks',
    accent: '#e0a53a',
    featured: true,
    summary:
      'A close rebuild of the Glovo ordering flow, done from scratch to find out how much work the layout is really doing.',
    description: [
      'I rebuilt the browsing and ordering flow in plain HTML, CSS and JavaScript, with no framework and no component library, to find out where a layout that dense starts to get difficult.',
      'Most of the real work went into the layout. A category rail that stays usable at every width, cards that still look right whether there are three or thirty, and a cart that updates without shifting the page under your thumb.',
    ],
    highlights: [
      'Rebuilt the full browse-to-cart flow in vanilla HTML, CSS and JavaScript',
      'Fluid grid that reflows cleanly from 320px through to ultrawide',
      'Cart state handled without layout shift on update',
      'Wrote the CSS transitions by hand, no animation library',
    ],
    stack: ['HTML', 'CSS', 'JavaScript', 'Responsive Design'],
    cover: 'projects/glovo-cover.svg',
    gallery: [
      { src: 'projects/glovo-1.svg', caption: 'Restaurant browse, category rail and result grid' },
      { src: 'projects/glovo-2.svg', caption: 'Order detail with a live-updating cart' },
      { src: 'projects/glovo-3.svg', caption: 'Mobile layout at the 375px breakpoint' },
    ],
    // Left empty on purpose: this pointed at the GitHub profile, which
    // reads as "here is the code" and then is not. Put the real repo URL
    // here when it is pushed.
    links: { live: '', repo: '' },
  },
  {
    id: 'aurelia',
    slug: 'aurelia-skincare',
    index: '02',
    title: 'Aurelia',
    subtitle: 'Skincare E-commerce',
    category: 'UI/UX · E-commerce',
    status: 'concept',
    year: '2026',
    role: 'End-to-end Design',
    duration: '3 weeks',
    accent: '#b96c5b',
    featured: true,
    summary:
      'A quiet storefront for a botanical skincare label, built on the idea that a product page should read more like a magazine than a spreadsheet.',
    description: [
      'The palette came straight off the packaging and everything else got out of its way. Plenty of white space, and the type doing the persuading instead of badges and banners.',
      'It runs on a four-column grid that folds down to one, with the ingredient story sitting next to the buy button rather than hidden in a tab nobody ever opens.',
    ],
    highlights: [
      'Editorial product page that puts the ingredient story beside the buy action',
      'Built the type scale, spacing and components as one small system rather than page by page',
      'Checkout reduced to three steps with a persistent order summary',
      'Full light and dark treatment of the same palette',
    ],
    stack: ['Figma', 'Design System', 'Prototyping', 'React'],
    cover: 'projects/aurelia-cover.svg',
    gallery: [
      { src: 'projects/aurelia-1.svg', caption: 'Landing page, hero and collection grid' },
      { src: 'projects/aurelia-2.svg', caption: 'Product detail with ingredient breakdown' },
      { src: 'projects/aurelia-3.svg', caption: 'Three-step checkout flow' },
    ],
    links: { live: '', figma: '' },
  },
  {
    id: 'lumen',
    slug: 'lumen-analytics',
    index: '03',
    title: 'Lumen',
    subtitle: 'Analytics Dashboard',
    category: 'Product Design · React',
    status: 'concept',
    year: '2026',
    role: 'Design & Frontend',
    duration: '4 weeks',
    accent: '#879c89',
    featured: true,
    summary:
      'A dense analytics workspace that still manages to feel calm. A data-heavy product does not have to look like one.',
    description: [
      'Dashboards tend to fail the same way. Everything is emphasised, so nothing is. Lumen starts from a strict hierarchy instead: one main number per view, everything supporting it kept deliberately quieter, and colour used only where it means something.',
      'I built it as a React component library first and a product second, so every chart, table and filter is a reusable piece. The loading, empty and error states were designed properly instead of bolted on at the end.',
    ],
    highlights: [
      'Colour used only where it carries meaning, never for decoration',
      'Every component ships with loading, empty and error states',
      'Keyboard-navigable filters and fully labelled data tables',
      'Charts designed to stay readable at 200% browser zoom',
    ],
    stack: ['React', 'JavaScript', 'CSS', 'Figma'],
    cover: 'projects/lumen-cover.svg',
    gallery: [
      { src: 'projects/lumen-1.svg', caption: 'Overview, main metric with its supporting trend' },
      { src: 'projects/lumen-2.svg', caption: 'Segment breakdown and comparison view' },
      { src: 'projects/lumen-3.svg', caption: 'Component states: loading, empty, error' },
    ],
    links: { live: '', repo: '' },
  },
  {
    id: 'nkiru',
    slug: 'nkiru-atelier',
    index: '04',
    title: 'Nkiru',
    subtitle: 'Fashion Atelier',
    category: 'Art Direction · Web',
    status: 'concept',
    year: '2026',
    role: 'Art Direction & Build',
    duration: '2 weeks',
    accent: '#c4a177',
    featured: false,
    summary:
      'A home online for a Lagos atelier. Full-bleed imagery, and a lookbook that behaves like a printed one.',
    description: [
      'Each look gets the whole screen, and scrolling brings up the detail underneath it: the fabric, the stitching, where it came from. The way a good lookbook makes you turn the page.',
      'The type pairing carries almost the whole brand. A high-contrast serif doing the talking, and a quiet grotesque handling everything functional.',
    ],
    highlights: [
      'Full-bleed lookbook with scroll-linked reveals',
      'Identity carried by type alone: two families, no ornament',
      'Imagery specified responsively at four sizes',
      'Motion budgeted for mid-range mobile hardware',
    ],
    stack: ['HTML', 'CSS', 'JavaScript', 'Figma'],
    cover: 'projects/nkiru-cover.svg',
    gallery: [
      { src: 'projects/nkiru-1.svg', caption: 'Full-bleed opening look' },
      { src: 'projects/nkiru-2.svg', caption: 'Lookbook grid and collection index' },
      { src: 'projects/nkiru-3.svg', caption: 'Craft detail, fabric and provenance' },
    ],
    links: { live: '', figma: '' },
  },
  {
    id: 'pulse',
    slug: 'pulse-fitness',
    index: '05',
    title: 'Pulse',
    subtitle: 'Fitness Companion App',
    category: 'Mobile UI/UX',
    status: 'concept',
    year: '2025',
    role: 'UI/UX Design',
    duration: '3 weeks',
    accent: '#7c8fb9',
    featured: false,
    summary:
      'A training app built around the moment that matters: mid-set, one hand free, arm shaking.',
    description: [
      'Pulse assumes you are standing up with one hand free. During a workout every control sits inside thumb reach, the tap targets are oversized, and the next set is still readable at arm’s length.',
      'Away from the gym it relaxes into a calmer mode for progress and history. One product, two different postures.',
    ],
    highlights: [
      'Every in-workout control within thumb reach on a 6.1" screen',
      'Oversized targets and high-contrast type for mid-set glances',
      'Two modes, active workout and calm review, from one system',
      'Interactive prototype covering the full session flow',
    ],
    stack: ['Figma', 'Prototyping', 'Wireframing', 'Mobile UI'],
    cover: 'projects/pulse-cover.svg',
    gallery: [
      { src: 'projects/pulse-1.svg', caption: 'Active workout, thumb-zone controls' },
      { src: 'projects/pulse-2.svg', caption: 'Progress and history in review mode' },
      { src: 'projects/pulse-3.svg', caption: 'Session builder and exercise library' },
    ],
    links: { figma: '' },
  },
  {
    id: 'verdant',
    slug: 'verdant-plant-care',
    index: '06',
    title: 'Verdant',
    subtitle: 'Plant Care Platform',
    category: 'Full-stack Concept',
    status: 'concept',
    year: '2025',
    role: 'Design & Full-stack',
    duration: '3 weeks',
    accent: '#6f9b74',
    featured: false,
    summary:
      'A plant care app with a Node.js backend. Watering schedules, a species library, and reminders that turn up when they are useful.',
    description: [
      'This was the project where the backend stopped being abstract for me. The Node service works out watering intervals from the species, the pot size and the season, instead of just pinging you every Sunday.',
      'The interface stays light on purpose. Today’s tasks first, everything else one tap away, and a history that reads like a diary rather than a log file.',
    ],
    highlights: [
      'Node.js API serving the species library and schedule logic',
      'Watering intervals derived from species, pot size and season',
      'Today’s tasks first, everything else one tap away',
      'Care history presented as a readable diary',
    ],
    stack: ['Node.js', 'JavaScript', 'CSS', 'Figma'],
    cover: 'projects/verdant-cover.svg',
    gallery: [
      { src: 'projects/verdant-1.svg', caption: 'Today, the tasks that need doing' },
      { src: 'projects/verdant-2.svg', caption: 'Species library and plant profile' },
      { src: 'projects/verdant-3.svg', caption: 'Care history over time' },
    ],
    links: { live: '', repo: '' },
  },
]

export const statusMeta = {
  live: { label: 'Live', tone: 'live' },
  concept: { label: 'Concept', tone: 'concept' },
  study: { label: 'Build Study', tone: 'study' },
}

export const filters = [
  { id: 'all', label: 'All Work' },
  { id: 'Frontend Development', label: 'Frontend' },
  { id: 'UI/UX · E-commerce', label: 'E-commerce' },
  { id: 'Product Design · React', label: 'Product' },
  { id: 'Art Direction · Web', label: 'Art Direction' },
  { id: 'Mobile UI/UX', label: 'Mobile' },
  { id: 'Full-stack Concept', label: 'Full-stack' },
]
