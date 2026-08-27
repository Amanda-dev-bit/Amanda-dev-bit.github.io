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
        const tags = [
          `<link rel="canonical" href="${site}/" />`,
          `<meta property="og:url" content="${site}/" />`,
          `<meta property="og:image" content="${site}/og.png" />`,
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
        manualChunks: { react: ['react', 'react-dom'] },
      },
    },
  },
})
