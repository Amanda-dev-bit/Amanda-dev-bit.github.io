/* ============================================================
   SITE / PROFILE DATA
   Everything here comes from Amanda's CV. Edit this file to
   update the site: no component needs to be touched.
   ============================================================ */

/* ============================================================
   FORMSPREE: where the contact form sends enquiries.

   >>> THIS IS THE ONLY LINE YOU NEED TO EDIT. <<<

   1. Make a free form at https://formspree.io (use the address
      in profile.email below, so replies land in the same inbox).
   2. Formspree hands you an endpoint like
        https://formspree.io/f/abcdwxyz
   3. Paste ONLY the id, the bit after /f/, between the quotes:
        export const formspreeId = 'abcdwxyz'

   Leave it empty and the form still works: it opens the visitor's
   own mail app with everything filled in, so no enquiry is ever
   quietly dropped.
   ============================================================ */

export const formspreeId = ''

export const profile = {
  firstName: 'Chukwujekwu',
  lastName: 'Amanda',
  middleName: 'Chimdiuso',
  fullName: 'Chukwujekwu Amanda Chimdiuso',
  shortName: 'Amanda C.',
  initials: 'CA',
  role: 'Web Developer & UI/UX Designer',
  roleLines: ['Web Developer', 'UI/UX Designer'],
  availability: 'Open to remote work, anywhere',
  status: 'available', // 'available' | 'booked'
  location: 'Lagos, Nigeria',
  locationDetail: 'Lagos, Nigeria. Working remotely, anywhere.',
  timezone: 'WAT (UTC+1)',
  email: 'chukwujekwuamanda09@gmail.com',
  phone: '+234 (808) 890-5585',
  phoneHref: '+2348088905585',
  resume: 'resume/Chukwujekwu-Amanda-Resume.pdf',
  year: new Date().getFullYear(),

  tagline: 'I design and build websites that look good and still work properly on a bad connection.',

  intro:
    'A developer and designer based in Lagos. I take a project from the first rough wireframe through to the code that ships.',

  // Professional summary, adapted from the CV.
  bio: [
    'I taught myself HTML, CSS and JavaScript first, because I wanted to know how websites were put together. Aptech turned that into something I can do properly, and added the parts I would never have reached on my own: Java, databases, and how to think about a program before writing it.',
    'Right now I freelance, and I usually handle the whole project myself. Working out what a client needs, sketching it, prototyping it, then building an interface that holds up on a cheap phone as well as it does on a big monitor.',
    'When I am not working I am usually in a bookshop, at a gallery, or rewatching a film I have already seen far too many times. It feeds back into the work eventually, mostly in how I think about layout and pacing.',
  ],

  facts: [
    { label: 'Based in', value: 'Lagos, Nigeria' },
    { label: 'Studying', value: 'Software Engineering (ADSE)' },
    { label: 'Focus', value: 'UI/UX · Frontend · Node.js' },
    { label: 'Availability', value: 'Remote, worldwide' },
  ],

  languages: [
    { name: 'Igbo', level: 'Native' },
    // NOTE: the CV lists English as "Basic", almost certainly a typo,
    // since every document and project is written in English. Adjust
    // this value if you would like it to read differently.
    { name: 'English', level: 'Fluent' },
  ],
}

export const nav = [
  { id: 'about', label: 'About', index: '01' },
  { id: 'craft', label: 'Craft', index: '02' },
  { id: 'work', label: 'Work', index: '03' },
  { id: 'journey', label: 'Journey', index: '04' },
  { id: 'contact', label: 'Contact', index: '05' },
]

/* Only verified links are live. Add the rest by filling in `href`;
   entries with an empty href are skipped at render time. */
export const socials = [
  { id: 'github', label: 'GitHub', handle: '@Amanda-dev-bit', href: 'https://github.com/Amanda-dev-bit' },
  { id: 'email', label: 'Email', handle: 'chukwujekwuamanda09@gmail.com', href: 'mailto:chukwujekwuamanda09@gmail.com' },
  { id: 'whatsapp', label: 'WhatsApp', handle: '+234 808 890 5585', href: 'https://wa.me/2348088905585' },
  { id: 'linkedin', label: 'LinkedIn', handle: 'Add your profile', href: '' },
  { id: 'instagram', label: 'Instagram', handle: 'Add your profile', href: '' },
]

/* Keep these tied to something on the page or on the CV. A number a
   recruiter cannot check is worse than no number at all, `value` is
   the count of projects actually listed in data/projects.js, and
   `disciplines` is the count in data/skills.js. Update them together. */
export const stats = [
  { value: 6, suffix: '', label: 'Selected projects', note: 'Concepts and build studies' },
  { value: 4, suffix: '', label: 'Core disciplines', note: 'Design through deployment' },
  { value: 13, suffix: '', label: 'Tools in regular use', note: 'Figma through to Render' },
]
