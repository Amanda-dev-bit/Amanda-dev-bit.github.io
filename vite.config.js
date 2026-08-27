import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

/* ------------------------------------------------------------------
   Social crawlers (and only they) need absolute URLs. A relative
   og:image is ignored by every one of them, which is why no link
   preview appears until these are fully qualified.

   The deploy workflow resolves the real published address through
   actions/configure-pages and passes it in as VITE_SITE_URL, so this
   works for a project site, a user site, or a custom domain without
   anything being hard-coded here.

   With the variable unset (a local build) the tags are simply left
   out rather than emitted with a broken placeholder.
   ------------------------------------------------------------------ */
function socialUrls() {
  return {
    name: 'social-urls',
    transformIndexHtml: {
      order: 'pre',
      handler(html) {
        const site = (process.env.VITE_SITE_URL || '').trim().replace(/\/+$/, '')
        if (!site) return html.replace(/^\s*<!--SOCIAL_URLS-->\r?\n?/m, '')
        /* The whole image block lives here, not just the URL. The width,
           height, alt and twitter:card tags describe an image, so leaving
           them in the static head meant a local build advertised a large
           image card with no image attached. */
        const tags = [
          `<link rel="canonical" href="${site}/" />`,
          `<meta property="og:url" content="${site}/" />`,
          `<meta property="og:image" content="${site}/og.png" />`,
          `<meta property="og:image:width" content="1200" />`,
          `<meta property="og:image:height" content="630" />`,
          `<meta property="og:image:alt" content="Chukwujekwu Amanda, Web Developer and UI/UX Designer, Lagos, Nigeria." />`,
          `<meta name="twitter:card" content="summary_large_image" />`,
          `<meta name="twitter:image" content="${site}/og.png" />`,
        ].join('\n    ')
        return html.replace('<!--SOCIAL_URLS-->', tags)
      },
    },
  }
}

export default defineConfig({
  plugins: [react(), socialUrls()],
  /* Relative, so the same build works at a domain root, inside a
     /repository-name/ subpath, or opened straight off disk. Do not
     change this to an absolute path unless the site stops being
     served from a subdirectory. */
  base: './',
  build: {
    target: 'es2020',
    cssCodeSplit: false,
    assetsInlineLimit: 2048,
    rollupOptions: {
      output: {
        /* Match on the resolved module path, not the bare specifier.
           'react-dom' resolves to a tiny index shim, so listing it by name
           left the ~180KB renderer and the scheduler in the app chunk and
           the vendor split saved almost nothing. */
        manualChunks(id) {
          if (
            id.includes('node_modules/react/') ||
            id.includes('node_modules/react-dom/') ||
            id.includes('node_modules/scheduler/')
          ) {
            return 'react'
          }
        },
      },
    },
  },
})
