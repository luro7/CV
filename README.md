# Lucas Rosat — Professional CV

Source code for the professional CV and technical portfolio published at **https://lucasrosat.pages.dev**.

The project is intentionally lightweight: static generation, progressive enhancement, zero runtime dependencies and no external client-side libraries. The interface is part of the portfolio itself, demonstrating responsive design, accessibility, browser APIs, secure deployment, bilingual SEO and interaction design without compromising readability.

## Highlights

- Data Engineering, SQL, automation and AI-focused professional profile
- Indexable English and Spanish routes with canonical + hreflang metadata
- Light / dark theme with reduced-motion support
- Interactive expertise map with explicit skill-to-role tracing
- Scroll-driven data pipeline and experience timeline
- Ctrl + K command palette with ranked search and typed expertise categories
- Optional Engineering Mode with live section inspection and architecture metrics
- Browser print flow optimized for saving the public CV as PDF
- Structured data, Open Graph metadata, sitemap and Search Console verification
- Strict Content Security Policy and security headers
- Automated structural and interaction-model tests through GitHub Actions
- Automatic deployment to Cloudflare Pages from main

## Routes

- English: https://lucasrosat.pages.dev/
- Spanish: https://lucasrosat.pages.dev/es/

The language control navigates between real static locale routes instead of translating the page only in the browser. This keeps both versions indexable and shareable.

## Architecture

content/ stores public CV data, the expertise taxonomy and translations. src/ contains the static renderer and semantic templates. public/ contains local assets plus the CSS and JavaScript enhancement layer. scripts/ owns build, localization, validation and local preview. tests/ covers clean builds, locale generation, preference behavior and pure interaction logic.

The browser layer is split by responsibility:

- navigation.js: active-section navigation
- preferences.js: locale navigation and theme state
- motion.js: reveal, pointer and reading-progress effects
- interaction-model.js: pure ranking, pipeline-stage and skill-role matching logic
- lab.js: command palette, expertise map, scroll pipeline, print behavior and Engineering Mode

## Development

Requires Node.js 20 or newer.

    npm run build
    npm run check
    npm test
    npm start

The generated website is written to dist/. The build recreates that directory from scratch on every run so removed source assets cannot survive as stale deployment files.

## Engineering principles

The site uses native browser capabilities where they are the best fit: semantic HTML, CSS custom properties, IntersectionObserver, ResizeObserver, the dialog element, print events and ES modules.

A framework can be introduced if a future feature genuinely benefits from component state or hydration. The current interactions deliberately avoid adding a framework only for visual effects, keeping the shipped JavaScript small while making the implementation itself a demonstration of progressive enhancement.

## Deployment

Cloudflare Pages builds the repository from main with:

- Build command: npm run build
- Output directory: dist
- Node.js: 20+

Canonical, sitemap and alternate-language URLs are generated from the single siteUrl value in content/site.json.

## Repository scope

Only information intended for the public CV belongs in this repository. Personal source documents, local-machine configuration, private contact information, deployment account identifiers, generated output and private source PDFs are excluded from version control.
