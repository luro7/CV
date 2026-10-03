---
name: accessibility-seo-review
description: "Review factual bilingual CV copy, metadata, semantic/keyboard access and generated search files."
---

Resolve paths and run commands from the repository root. Inspect only the affected flow; reuse current validation evidence before rerunning checks.

Read content/site.json, content/locales/es.json, src/render.mjs, src/templates/layout.html and public/_headers. Do not invent credentials, metrics, employment or skill/role relationships. Align translations in meaning and flag missing/inconsistent facts.
Run local-validation; inspect both generated locales for lang/title/description, canonical/hreflang/x-default, social metadata, JSON-LD, sitemap/robots and links. siteUrl is the single URL source. Preserve CSP and allowed hosts; do not expose private personal documents.
Check heading hierarchy/one h1, landmarks/skip link, labels, meaningful alt/link text, dialog keyboard focus, command palette accessible state, visible focus and reduced-motion considerations. Structural tests do not establish full accessibility conformance; inspect actual browser behavior when possible. Contact remains the existing public LinkedIn link. Use responsive-review when copy or structural changes can alter layout/print.
