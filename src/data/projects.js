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
    id: "glovo",
    slug: "glovo-food-delivery",
    index: "01",
    title: "Glovo Frontend Clone",
    subtitle: "Food Delivery Interface",
    category: "Frontend Development",
    status: "study",
    year: "2025",
    role: "Design & Frontend",
    duration: "1 week",
    accent: "#e0a53a",
    featured: true,
    summary:
      "A close rebuild of the Glovo ordering flow, done from scratch to find out how much work the layout is really doing.",
    description: [
      "I rebuilt the browsing and ordering flow in plain HTML, CSS and JavaScript, with no framework and no component library, to find out where a layout that dense starts to get difficult.",
      "Most of the real work went into the layout. A category rail that stays usable at every width, cards that still look right whether there are three or thirty, and a cart that updates without shifting the page under your thumb.",
    ],
    highlights: [
      "Rebuilt the full browse-to-cart flow in vanilla HTML, CSS and JavaScript",
      "Fluid grid that reflows cleanly from 320px through to ultrawide",
      "Cart state handled without layout shift on update",
      "Wrote the CSS transitions by hand, no animation library",
    ],
    stack: ["HTML", "CSS", "JavaScript", "Responsive Design"],
    cover: "projects/glovo-cover.jpeg",
    gallery: [
      {
        src: "projects/glovo-meals.jpeg",
        caption: "Restaurant browse, category rail and result grid",
      },
      {
        src: "projects/glovo-partnership.jpeg",
        caption: "The rider, partner and careers signup section",
      },
      // {
      //   src: "projects/glovo-2.svg",
      //   caption: "",
      // },
      // {
      //   src: "projects/glovo-3.svg",
      //   caption: "Mobile layout at the 375px breakpoint",
      // },
    ],
    // Left empty on purpose: this pointed at the GitHub profile, which
    // reads as "here is the code" and then is not. Put the real repo URL
    // here when it is pushed.
    links: { live: "", repo: "" },
  },
];

export const statusMeta = {
  live: { label: "Live", tone: "live" },
  concept: { label: "Concept", tone: "concept" },
  study: { label: "Build Study", tone: "study" },
};

export const filters = [
  { id: "all", label: "All Work" },
  { id: "Frontend Development", label: "Frontend" },
  { id: "UI/UX · E-commerce", label: "E-commerce" },
  { id: "Product Design · React", label: "Product" },
  { id: "Art Direction · Web", label: "Art Direction" },
  { id: "Mobile UI/UX", label: "Mobile" },
  { id: "Full-stack Concept", label: "Full-stack" },
];
