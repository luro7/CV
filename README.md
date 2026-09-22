# Lucas Rosat — Professional CV

Source code for the professional CV and technical portfolio published at **https://lucasrosat.pages.dev**.

The project is intentionally lightweight: static generation, progressive enhancement, no runtime framework and no external client-side dependencies. The interface itself is part of the portfolio, demonstrating accessibility, responsive design, browser APIs, secure deployment and interaction design without sacrificing readability.

## Highlights

- Data Engineering, SQL, automation and AI-focused professional profile
- English / Spanish UI with persisted preference
- Light / dark theme with reduced-motion support
- Interactive technology map that traces skills into professional experience
- Scroll-driven data pipeline and experience timeline
- Ctrl + K command palette for keyboard-first navigation
- Optional Engineering Mode exposing implementation details
- Structured data, Open Graph metadata, sitemap and Search Console verification
- Strict Content Security Policy and security headers
- Automated checks and tests through GitHub Actions
- Automatic deployment to Cloudflare Pages from main

## Architecture

content/ stores public CV data and translations. src/ contains the static renderer and semantic templates. public/ contains local assets plus the CSS and JavaScript enhancement layer. scripts/ owns build, validation and local preview. tests/ covers build cleanliness and preference behavior.

The browser layer is split by responsibility:

- navigation.js: active-section navigation
- preferences.js: language and theme state
- motion.js: reveal, pointer and reading-progress effects
- lab.js: command palette, skill map, scroll pipeline and Engineering Mode

## Development

Requires Node.js 20 or newer.

    npm run build
    npm run check
    npm test
    npm start

The generated website is written to dist/. The build always recreates that directory from scratch so removed source assets cannot survive as stale deployment files.

## Engineering principles

The site uses native browser capabilities where they are the best fit: semantic HTML, CSS custom properties, IntersectionObserver, ResizeObserver, the dialog element and ES modules.

React or another framework can be introduced if a future feature genuinely benefits from component state or hydration, but the current interactions deliberately avoid adding a framework only for visual effects. This keeps the shipped JavaScript small and makes the implementation itself a demonstration of progressive enhancement.

## Deployment

Cloudflare Pages builds the repository from main with:

- Build command: npm run build
- Output directory: dist
- Node.js: 20+

Canonical, sitemap and robots URLs are generated from the single siteUrl value in content/site.json.

## Repository scope

Only information intended for the public CV belongs in this repository. Personal source documents, local-machine configuration, private contact information, deployment account identifiers, generated output and PDFs are excluded from version control.
