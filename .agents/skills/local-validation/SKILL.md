---
name: local-validation
description: "Build/check the bilingual CV static output and inspect source-to-generated artifacts locally."
---

Use Node20+. Read scripts/build.mjs/check.mjs and the affected tests. For ordinary changes run npm run check (it rebuilds), then focused `node --test tests/<affected>.test.mjs`; run npm test once for cross-feature work. npm run build is useful for validating the standalone production build, not required before every check.
Source is content/site.json/locales/es.json plus src/render.mjs/templates and public assets. Build clears and recreates dist, generates EN index.html, es/index.html, robots/sitemap and js/site-data.js/translations.js. Never hand-edit/commit dist unless explicitly asked. Check both locale outputs, links/assets and preserved metadata/CSP.
npm start rebuilds and serves at 127.0.0.1:5081 by default. Use /es/index.html for Spanish local preview: serve.mjs does not resolve directory indexes for /es/. Both routes on Cloudflare must still remain / and /es/. For UI changes also use responsive-review. GitHub Actions runs check/tests; Cloudflare main deploys with npm run build -> dist. Do not commit/push to run validation.
