# AGENTS.md

## Purpose

This repository is Lucas Rosat's public professional CV and technical portfolio. Treat it as a production website and as part of the portfolio itself: changes should improve clarity, polish, maintainability and credibility without adding unnecessary complexity.

## Project architecture

The site is intentionally lightweight and statically generated.

- `content/`: public CV data, expertise taxonomy, translations and site metadata.
- `src/`: static renderer and semantic templates.
- `public/`: deployable CSS, JavaScript and local assets.
- `scripts/`: build, localization, validation and local preview tooling.
- `tests/`: structural and interaction-model tests.
- `dist/`: generated output. Never hand-edit it and do not commit generated output unless explicitly requested.

Preserve the current static/progressive-enhancement architecture unless a requested feature clearly benefits from a larger architectural change.

## Before editing

1. Read the files directly related to the request before changing anything.
2. Reuse existing patterns and components before creating new abstractions.
3. Keep the diff focused on the requested outcome. Avoid unrelated refactors or cosmetic cleanup.
4. If the task is broad or ambiguous, first inspect the relevant implementation and choose the smallest coherent solution.

## Core product rules

- Preserve both English and Spanish static routes and keep equivalent content aligned where applicable.
- Preserve responsive behavior across desktop and narrow/mobile layouts.
- Preserve light/dark theme support and reduced-motion behavior.
- Keep semantic HTML, keyboard navigation, focus behavior and accessibility intact.
- Preserve print/PDF behavior when changing layout, typography, sections or content.
- Do not weaken CSP, security headers, canonical URLs, hreflang, structured data, sitemap generation or other SEO behavior without an explicit requirement.
- Do not add runtime dependencies, frameworks or third-party client libraries unless they provide a clear benefit for the requested feature.
- Prefer local assets where practical.
- Never add private documents, secrets, account identifiers or non-public personal information to the repository.

## Design direction

The site should feel professional, modern and technically polished rather than decorative for its own sake.

- Prioritize readability, hierarchy and restrained interaction over visual noise.
- Keep animations purposeful and compatible with `prefers-reduced-motion`.
- Avoid redesigning unrelated sections when changing one component.
- Credentials/certifications should be presented with equal visual importance unless the content explicitly defines a hierarchy.
- Maintain visual consistency between projects, experience, expertise, credentials and navigation.

## Content rules

- Treat `content/` as the source of truth for CV data whenever possible instead of duplicating copy inside templates or scripts.
- Keep English and Spanish copy synchronized in meaning, not necessarily word-for-word.
- Preserve factual accuracy. Do not invent experience, skills, achievements, credentials or metrics.
- Prefer concise professional copy over marketing-heavy language.

## CSS and frontend rules

- Respect the existing stylesheet/module ownership documented in `README.md`.
- Keep CSS changes in the stylesheet responsible for that feature whenever possible.
- Do not create patch/override files just to avoid understanding the existing cascade.
- Preserve the explicit stylesheet load order in `src/templates/layout.html` unless a deliberate reorganization is part of the task.
- Keep JavaScript modular and progressively enhanced; core content must remain usable without optional interaction code.
- Prefer native browser APIs over dependencies when they solve the problem cleanly.

## Validation

Use Node.js 20 or newer.

For normal code changes, run:

```bash
npm run check
npm test
```

For UI/layout changes, also inspect the result locally when practical with:

```bash
npm start
```

Check the affected area at desktop and narrow/mobile widths. Consider both locales, both themes and print/PDF output when the change can affect them.

If a validation step cannot be run, state that clearly in the final handoff instead of assuming it passed.

## Definition of done

A change is complete when:

- the requested behavior/content is implemented;
- no unrelated behavior was intentionally changed;
- English/Spanish parity is preserved where relevant;
- responsive, accessibility, theme and print implications were considered;
- relevant build/check/tests pass;
- the final response briefly explains what changed, which files were touched and any remaining caveats.

## Git workflow

Work in the branch currently selected by the user.

Do **not** create or switch branches, open pull requests, commit, push, merge or rewrite Git history unless the user explicitly asks for that Git action. Editing files and running local validation are allowed as part of the requested work.

## Working style for Codex

Do not simulate a team of agents by default. Use one focused implementation path unless the user explicitly asks to split work. For large changes, reason in stages (inspect, implement, validate, review) while keeping one coherent final result.

Be proactive about finding regressions that are directly caused by the requested change, but do not expand the scope into a general repo cleanup unless asked.
## Repository harness
This compact static site stays with one main agent. Do not create frontend/content/build subagents by default; those concerns share one render/content pipeline here. Reusable workflows live in .agents/skills: local-validation, responsive-review and accessibility-seo-review. Consult only the relevant workflow.

Source pipeline: content/site.json + content/locales/es.json + src/render.mjs and src/templates/ -> scripts/build.mjs -> dist (EN root, ES /es/, generated js/site-data.js and js/translations.js, robots.txt, sitemap.xml), with deployable public assets copied in. npm run check and npm start already regenerate output; do not repeat npm run build first unless checking the build command itself. Preview defaults to http://127.0.0.1:5081/; inspect /es/index.html directly as the local server is not a hosting directory router.
Cloudflare Git integration publishes main using npm run build, output dist. Local validation does not deploy. Contact is the public LinkedIn data/rendered link; do not add business WhatsApp flows from another project.
Model policy: normal root work uses GPT-6 Luna Medium. Use Sol Low/Medium only after a focused investigation leaves a reasoning blocker, Astra Low only if Sol remains uncertain; return routine work to Luna. No stronger-model agents are installed.

## Context and validation budget
Start with the affected source and its tests; project architecture documents are references to read when that boundary matters, not a mandatory reading list. Use targeted `rg` searches and reuse unchanged findings. Read only the relevant `.agents/skills/<name>/SKILL.md`; paths and commands in those skills resolve from this repository root. Run the smallest meaningful check first, expand for affected boundaries, and reuse successful checks until a later edit invalidates them. Documentation or agent/skill-only edits need syntax, reference and diff validation, not application builds or live integration. After a failed attempt, change the hypothesis using the new evidence; escalate for a demonstrated reasoning blocker, never for missing tools or simple command errors. Stop when requested behavior and necessary validation are complete.
