# Lucas Rosat — Professional CV

Personal portfolio and curriculum vitae focused on Data Engineering, SQL development, reporting, automation, and AI-assisted engineering.

**Live site:** https://lucasrosat.pages.dev  
**LinkedIn:** https://www.linkedin.com/in/rosat-lucas/

## Overview

This repository contains the source code for a bilingual professional CV website built as a lightweight static application.

The project is intentionally dependency-free at runtime and separates content, presentation, rendering, validation, and deployment assets so the site can be maintained without editing generated files directly.

## Architecture

```text
Content/
  site.json                 Primary CV content
  locales/                  Translations

src/
  render.mjs                Static rendering logic
  templates/
    sections/               Page sections
    cards/                  Reusable content components
    shared/                 Shared layout components

public/
  assets/                   Images, credentials and icons
  css/                      Styles
  js/                       Client-side behavior
  _headers                  Security headers
  robots.txt                Search engine directives
  sitemap.xml               Sitemap

scripts/
  build.mjs                 Production build
  check.mjs                 Structural and content validation
  serve.mjs                 Development server

tests/
  preferences.test.mjs      Language and theme behavior tests

docs/
  FUENTES.md                Content provenance
  MANTENIMIENTO.md          Maintenance notes
  PUBLICACION.md            Deployment process
  SEO.md                    SEO and indexing notes
  UX.md                     UX and accessibility decisions
```

Generated output is written to `dist/` and is not committed to source control.

## Development

Requirements:

- Node.js 20 or newer
- No package installation required

Available commands:

```bash
npm run build
npm run check
npm test
npm start
```

## Quality

The project includes automated checks for:

- unresolved template variables
- duplicate HTML IDs
- broken internal anchors
- missing local assets
- unexpected external links
- canonical URL and structured data
- sitemap and robots configuration
- Google Search Console verification
- language and theme preference behavior

## Deployment

The site is deployed as a static application on Cloudflare Pages.

Production output is generated in `dist/`. Deployment-specific notes are maintained in `docs/PUBLICACION.md`.

## Design principles

- semantic and accessible HTML
- progressive enhancement
- responsive layout
- light and dark themes
- English and Spanish interface
- minimal external dependencies
- source-controlled content and templates
- generated production output separated from source files

## License

This repository contains personal CV content and assets. Source code is published for portfolio purposes unless otherwise stated.
