# Multi-agent Codex workflow

This workflow is intended for the Codex app using the same GitHub repository with isolated worktrees/threads. It does not require the OpenAI API.

## Core rule

Do not ask several agents to make broad changes to the same files at the same time. Split work by concern, let each agent produce a focused diff, and use an integrator/reviewer thread to combine the accepted work.

## Recommended team

### 1. UI/UX

Use for visual hierarchy, layout, responsive behavior, interactions, credential presentation, project presentation and portfolio polish.

Starter prompt:

> Act as the UI/UX implementation agent for this repository. Read AGENTS.md. Review the requested feature from a portfolio-design perspective, implement only the UI/UX scope, preserve accessibility and responsive behavior, run relevant validation, and finish with a concise handoff listing changed files, decisions, risks and validation performed. Do not merge to main.

### 2. Content / SEO

Use for English/Spanish copy, role positioning, metadata, structured data, canonical/hreflang behavior and search discoverability.

Starter prompt:

> Act as the Content/SEO agent for this repository. Read AGENTS.md. Work only on content, localization and discoverability concerns required by the task. Keep English and Spanish aligned where applicable. Avoid unrelated visual or architectural changes. Run relevant validation and finish with a concise handoff. Do not merge to main.

### 3. Engineering

Use for CSS/JavaScript architecture, performance, security, build tooling and maintainability.

Starter prompt:

> Act as the frontend engineering agent for this repository. Read AGENTS.md. Analyze the task for implementation quality, performance, security and maintainability. Change only what is required, preserve the lightweight static architecture, run relevant validation and finish with a concise technical handoff. Do not merge to main.

### 4. QA / Accessibility

Use after or in parallel with implementation when the scope is sufficiently separate. Prefer finding issues and adding focused fixes/tests rather than redesigning the feature.

Starter prompt:

> Act as the QA and accessibility agent for this repository. Read AGENTS.md. Review the requested feature and current implementation for regressions, keyboard behavior, reduced motion, responsive layouts, locale behavior, print/PDF behavior and test coverage where relevant. Make only focused fixes that are clearly within scope, run the validation suite and finish with findings plus changed files. Do not merge to main.

### 5. Integrator / Reviewer

Run after candidate branches/diffs exist.

Starter prompt:

> Act as the integrator and final reviewer for this repository. Read AGENTS.md. Review the candidate agent changes for the current task. Keep the best compatible implementation, reject unnecessary or conflicting changes, resolve overlap, run `npm run build`, `npm run check` and `npm test`, and produce the final reviewable diff. Do not merge to main unless I explicitly ask.

## Suggested sequence for a feature

1. Define one concrete outcome and acceptance criteria.
2. Launch only the agents that materially help that outcome.
3. Let implementation agents work in isolated worktrees.
4. Review each diff before integration.
5. Run the Integrator/Reviewer on the selected changes.
6. Merge only after final validation passes.

## When to use fewer agents

Do not use five agents for a one-line change. Examples:

- Copy-only change: Content/SEO + Reviewer.
- Pure visual component: UI/UX + QA/Accessibility + Reviewer.
- Build/performance issue: Engineering + QA + Reviewer.
- Cross-cutting portfolio redesign: UI/UX + Content/SEO + Engineering + QA + Integrator.

## CV-specific first experiment

A good first multi-agent experiment is the Credentials section because it has clear separable concerns:

- UI/UX: visual hierarchy and equal treatment of credentials.
- Content/SEO: credential labels/descriptions and bilingual consistency.
- Engineering: image loading, layout implementation and maintainability.
- QA/Accessibility: responsive layout, missing images, alt text, keyboard/dialog behavior and regressions.
- Integrator: combine the accepted solution and run the full suite.

Keep all credentials visually equal in importance unless the content explicitly defines a hierarchy.
