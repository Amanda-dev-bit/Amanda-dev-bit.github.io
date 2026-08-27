/* ============================================================
   CRAFT / SKILLS: grouped by discipline.
   `level` (0-100) drives the animated proficiency meters.
   ============================================================ */

export const disciplines = [
  {
    id: 'design',
    index: '01',
    title: 'Product & UI/UX Design',
    blurb:
      'Taking a vague brief and turning it into something clear. Wireframes, prototypes, and a design system so the twentieth screen still matches the first.',
    icon: 'palette',
    accent: 'var(--accent)',
    skills: [
      { name: 'Figma', level: 90 },
      { name: 'Wireframing', level: 88 },
      { name: 'Prototyping', level: 85 },
      { name: 'Design Systems', level: 78 },
    ],
    tags: ['Figma', 'Wireframing', 'Prototyping', 'Design Systems', 'User Flows'],
  },
  {
    id: 'frontend',
    index: '02',
    title: 'Frontend Engineering',
    blurb:
      'Turning a design into working code. I reuse components rather than rewriting them, and I keep animation light, because it is usually the first thing that makes a page feel slow.',
    icon: 'code',
    accent: 'var(--gold)',
    skills: [
      { name: 'HTML & CSS', level: 94 },
      { name: 'JavaScript', level: 86 },
      { name: 'React.js', level: 82 },
      { name: 'Responsive Design', level: 92 },
    ],
    tags: ['HTML & CSS', 'JavaScript', 'React.js', 'Responsive Design', 'Accessibility'],
  },
  {
    id: 'backend',
    index: '03',
    title: 'Backend & Fundamentals',
    blurb:
      'The part nobody sees. APIs, database design, and enough computer science to understand why things break when they break.',
    icon: 'server',
    accent: 'var(--sage)',
    skills: [
      { name: 'Node.js', level: 74 },
      { name: 'Databases', level: 70 },
      { name: 'Java', level: 68 },
      { name: 'C Programming', level: 65 },
    ],
    tags: ['Node.js', 'Databases', 'Java', 'C Programming', 'REST APIs'],
  },
  {
    id: 'workflow',
    index: '04',
    title: 'Workflow & Delivery',
    blurb:
      'Git, code review, and getting things live. Then keeping the codebase something you can still work in six months later.',
    icon: 'git',
    accent: 'var(--accent-soft)',
    skills: [
      { name: 'Git & GitHub', level: 84 },
      { name: 'VS Code', level: 92 },
      { name: 'Vercel / Netlify', level: 80 },
      { name: 'Render', level: 72 },
    ],
    tags: ['Git & GitHub', 'VS Code', 'Vercel', 'Netlify', 'Render'],
  },
]

/* Flat list used by the toolbelt ticker. */
export const toolbelt = [
  'HTML & CSS',
  'JavaScript',
  'React.js',
  'Node.js',
  'Java',
  'C Programming',
  'Figma',
  'Git & GitHub',
  'VS Code',
  'Responsive Design',
  'Wireframing & Prototyping',
  'Vercel / Netlify',
  'Render',
]
