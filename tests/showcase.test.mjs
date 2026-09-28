import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

const root = resolve(fileURLToPath(new URL('..', import.meta.url)));

test('project showcase stays unnumbered and media-first', () => {
  const template = readFileSync(resolve(root, 'src/templates/cards/project.html'), 'utf8');
  const css = readFileSync(resolve(root, 'public/css/project-showcase.css'), 'utf8');
  const layoutFix = readFileSync(resolve(root, 'public/css/portfolio-layout-fix.css'), 'utf8');

  assert.ok(template.includes('project-card-media'));
  assert.ok(template.includes('project-card-content'));
  assert.ok(template.includes('data-open-project-gallery'));
  assert.ok(!template.includes('data-project-case'));
  assert.ok(!/project-(?:number|index)|\{\{(?:number|index)\}\}/i.test(template));
  assert.ok(css.includes('grid-template-columns: minmax(0, 1.35fr) minmax(280px, .65fr)'));
  assert.ok(css.includes('@media (max-width: 860px)'));
  assert.ok(layoutFix.includes('padding: clamp(.65rem, 1.4vw, 1.15rem) clamp(2rem, 3.6vw, 3.5rem)'));
});

test('android project preview uses multiple screenshots instead of a tiny isolated phone', () => {
  const script = readFileSync(resolve(root, 'public/js/modules/project-showcase.js'), 'utf8');
  const css = readFileSync(resolve(root, 'public/css/project-showcase.css'), 'utf8');

  assert.ok(script.includes("card.dataset.projectCategory !== 'android'"));
  assert.ok(script.includes('project-phone-strip'));
  assert.ok(css.includes('.project-phone-strip'));
  assert.ok(css.includes('.project-phone-shot'));
});

test('credential wall keeps compact cards while restoring prominent artwork', () => {
  const template = readFileSync(resolve(root, 'src/templates/cards/certification.html'), 'utf8');
  const css = readFileSync(resolve(root, 'public/css/credential-wall.css'), 'utf8');
  const layoutFix = readFileSync(resolve(root, 'public/css/portfolio-layout-fix.css'), 'utf8');
  assert.ok(template.includes('class="certification-card"'));
  assert.ok(template.includes('credential-card-link'));
  assert.ok(css.includes('.certification-card:nth-child(-n+3)'));
  assert.ok(css.includes('@media (max-width: 640px)'));
  assert.ok(layoutFix.includes('width: 108px'));
  assert.ok(layoutFix.includes('width: 88px'));
});

test('all Skillsoft credentials use the official Skillsoft embed endpoint', () => {
  const script = readFileSync(resolve(root, 'public/js/modules/credential-badges.js'), 'utf8');
  const main = readFileSync(resolve(root, 'public/js/main.js'), 'utf8');
  const headers = readFileSync(resolve(root, 'public/_headers'), 'utf8');
  const layout = readFileSync(resolve(root, 'src/templates/layout.html'), 'utf8');
  const site = JSON.parse(readFileSync(resolve(root, 'content/site.json'), 'utf8'));

  assert.equal(site.certifications.filter(item => item.credentialUrl.includes('skillsoft.digitalbadges.skillsoft.com')).length, 7);
  assert.ok(script.includes('https://skillsoft.digitalbadges.skillsoft.com/embed/${credentialId}'));
  assert.ok(script.includes("hostname !== 'skillsoft.digitalbadges.skillsoft.com'"));
  assert.ok(script.includes('skillsoft-badge-embed'));
  assert.ok(main.includes('initCredentialBadges'));
  assert.ok(headers.includes('frame-src https://skillsoft.digitalbadges.skillsoft.com'));
  assert.ok(!headers.includes('https://api.accredible.com'));
  assert.ok(layout.includes('/css/skillsoft-badges.css'));
});

test('project gallery provides a counter and clickable thumbnail rail', () => {
  const script = readFileSync(resolve(root, 'public/js/project-gallery.js'), 'utf8');
  const css = readFileSync(resolve(root, 'public/css/gallery-premium.css'), 'utf8');
  const layout = readFileSync(resolve(root, 'src/templates/layout.html'), 'utf8');

  assert.ok(script.includes('project-gallery-chrome'));
  assert.ok(script.includes('project-gallery-counter'));
  assert.ok(script.includes('project-gallery-thumb'));
  assert.ok(script.includes('gallery.goToSlide(index)'));
  assert.ok(css.includes('.project-gallery-thumbs'));
  assert.ok(css.includes('.project-gallery-thumb.is-active'));
  assert.ok(layout.includes('/css/gallery-premium.css'));
});
