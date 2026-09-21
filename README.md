# Lucas Rosat — Professional CV

Source code for my professional CV and portfolio, focused on Data Engineering, SQL development, reporting, automation, and AI-assisted engineering.

**Live site:** https://lucasrosat.pages.dev  
**LinkedIn:** https://www.linkedin.com/in/rosat-lucas/

## Project overview

This is a bilingual static website built with HTML, CSS, JavaScript, and a small Node.js build pipeline.

The project keeps content, rendering, presentation, client-side behavior, validation, and generated output clearly separated. It has no runtime framework and no production package dependencies.

## Project structure

```text
content/
  site.json                 CV content
  locales/                  Translations

src/
  render.mjs                Static rendering
  templates/
    sections/               Page sections
    cards/                  Reusable content components
    shared/                 Shared layout components

public/
  assets/                   Images, credential badges, and icons
  css/                      Styles
  js/                       Client-side behavior
  _headers                  Security headers
  robots.txt                Search engine directives
  sitemap.xml               Sitemap

scripts/
  build.mjs                 Production build
  check.mjs                 Structural and content validation
  serve.mjs                 Local development server

tests/
  preferences.test.mjs      Language and theme behavior tests

.github/workflows/
  ci.yml                    Automated validation
```

Generated production files are written to `dist/` and are intentionally excluded from source control.

## Development

Requirements:

- Node.js 20 or newer
- No package installation required

```bash
npm run build
npm run check
npm test
npm start
```

## Quality controls

Automated validation covers:

- unresolved template variables
- duplicate HTML IDs
- broken internal anchors
- missing local assets
- unexpected external links
- canonical URL and structured data
- sitemap and robots configuration
- search-engine ownership verification file
- language and theme preference behavior

GitHub Actions runs the validation and test suite on pushes and pull requests to `main`.

## Engineering principles

- semantic and accessible HTML
- progressive enhancement
- responsive layout
- light and dark themes
- English and Spanish interface
- minimal external dependencies
- content separated from presentation
- generated output separated from source
- automated checks for critical site behavior

## Deployment

The production site is deployed as a static application on Cloudflare Pages from the generated `dist/` output.

## Repository scope

This repository contains only the source and public assets required to build the portfolio. Personal source documents, local-machine configuration, deployment account identifiers, and private contact data are intentionally excluded.
