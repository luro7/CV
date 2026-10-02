# AGENTS.md

## Repository purpose

This repository contains Lucas Rosat's public professional CV and technical portfolio. Keep all changes production-safe, lightweight, accessible, bilingual, and suitable for a public portfolio.

## Architecture

- `content/`: public CV data, expertise taxonomy, translations and site metadata.
- `src/`: static renderer and semantic templates.
- `public/`: deployable CSS, JavaScript and local assets.
- `scripts/`: build, localization, validation and local preview tooling.
- `tests/`: structural and interaction-model tests.
- `dist/`: generated output. Do not hand-edit or commit generated files unless the repository explicitly changes that policy.

Preserve the current static, progressive-enhancement architecture unless a task explicitly requires a framework and the benefit clearly justifies it.

## Required validation

Use Node.js 20 or newer. Before considering an implementation complete, run the checks relevant to the change, normally:

```bash
npm run build
npm run check
npm test
```

If a command cannot be run, state that clearly in the handoff.

## Product constraints

- Preserve both English and Spanish static routes.
- Keep semantic HTML, keyboard navigation, reduced-motion behavior and responsive layouts working.
- Preserve light/dark theme behavior.
- Do not weaken CSP, security headers, SEO metadata, canonical URLs, hreflang, structured data or sitemap behavior without an explicit requirement.
- Do not introduce runtime dependencies or third-party client libraries unless the task requires them and the tradeoff is documented.
- Keep public assets local where practical.
- Never add private source documents, credentials, personal account identifiers or non-public contact information to the repository.

## Working style

- Keep each task focused on one concern.
- Prefer small, reviewable diffs over broad rewrites.
- Inspect the files directly related to the task before changing them; do not scan unrelated parts of the repository without a reason.
- Reuse existing patterns before introducing new abstractions.
- Avoid cosmetic refactors unrelated to the requested change.
- When UI behavior changes, verify desktop and narrow/mobile layouts and consider print/PDF output when relevant.
- When content changes, keep English and Spanish versions aligned where applicable.

## Parallel-agent workflow

Multiple Codex threads may work on this repository at the same time. Use isolated worktrees/branches and avoid editing the same concern in parallel unless comparing alternative implementations.

Typical responsibilities:

- **UI/UX agent**: layout, visual hierarchy, responsive behavior, interaction polish and credential/project presentation.
- **Content/SEO agent**: CV copy, translations, metadata, structured data and discoverability.
- **Engineering agent**: JavaScript/CSS architecture, performance, security, build scripts and maintainability.
- **QA/Accessibility agent**: tests, regressions, keyboard behavior, reduced motion, responsive checks and print/PDF behavior.
- **Integrator/Reviewer**: reviews completed diffs, resolves overlap, runs the full validation suite and prepares the final merge.

Agents should not merge their own work directly to `main`. Produce a reviewable branch/PR or hand off the diff to the integrator.

## Long or cross-cutting work

For a feature or refactor spanning several areas, write a short implementation plan before making broad changes. Keep the plan proportional to the task; do not create planning overhead for small fixes.
