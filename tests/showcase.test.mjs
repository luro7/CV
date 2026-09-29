import test from 'node:test';
import assert from 'node:assert/strict';
import { existsSync, readFileSync } from 'node:fs';
import { resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

const root = resolve(fileURLToPath(new URL('..', import.meta.url)));

test('project showcase stays unnumbered and owns its layout', () => {
  const template = readFileSync(resolve(root, 'src/templates/cards/project.html'), 'utf8');
  const css = readFileSync(resolve(root, 'public/css/project-showcase.css'), 'utf8');

  assert.ok(template.includes('project-card-media'));
  assert.ok(template.includes('project-card-content'));
  assert.ok(template.includes('data-open-project-gallery'));
  assert.ok(!template.includes('data-project-case'));
  assert.ok(!/project-(?:number|index)|\{\{(?:number|index)\}\}/i.test(template));
  assert.ok(css.includes('grid-template-columns: minmax(0, 1.55fr) minmax(300px, .65fr)'));
  assert.ok(css.includes('padding: clamp(.65rem, 1.4vw, 1.15rem) clamp(2rem, 3.6vw, 3.5rem)'));
  assert.ok(css.includes('@media (max-width: 860px)'));
});

test('android project preview uses multiple screenshots instead of a tiny isolated phone', () => {
  const script = readFileSync(resolve(root, 'public/js/modules/project-showcase.js'), 'utf8');
  const css = readFileSync(resolve(root, 'public/css/project-showcase.css'), 'utf8');

  assert.ok(script.includes("card.dataset.projectCategory !== 'android'"));
  assert.ok(script.includes('project-phone-strip'));
  assert.ok(css.includes('.project-phone-strip'));
  assert.ok(css.includes('.project-phone-shot'));
});

test('credential cards use a badge-first vertical layout', () => {
  const template = readFileSync(resolve(root, 'src/templates/cards/certification.html'), 'utf8');
  const css = readFileSync(resolve(root, 'public/css/credential-wall.css'), 'utf8');

  assert.ok(template.includes('class="credential-preview"'));
  assert.ok(template.includes('class="credential-info"'));
  assert.ok(template.includes('class="credential-actions"'));
  assert.ok(!template.includes('credential-card-link'));
  assert.ok(css.includes('flex-direction: column'));
  assert.ok(css.includes('.skillsoft-card-preview'));
  assert.ok(css.includes('min-height: clamp(205px, 18vw, 250px)'));
});

test('all Skillsoft credentials use the official Skillsoft embed endpoint and details viewer', () => {
  const script = readFileSync(resolve(root, 'public/js/modules/credentials.js'), 'utf8');
  const main = readFileSync(resolve(root, 'public/js/main.js'), 'utf8');
  const headers = readFileSync(resolve(root, 'public/_headers'), 'utf8');
  const layout = readFileSync(resolve(root, 'src/templates/layout.html'), 'utf8');
  const styles = readFileSync(resolve(root, 'public/css/credential-wall.css'), 'utf8');
  const site = JSON.parse(readFileSync(resolve(root, 'content/site.json'), 'utf8'));

  assert.equal(site.certifications.filter(item => item.credentialUrl.includes('skillsoft.digitalbadges.skillsoft.com')).length, 7);
  assert.ok(script.includes('skillsoftEmbedUrl'));
  assert.ok(script.includes('/embed/${encodeURIComponent(credentialId)}'));
  assert.ok(script.includes('skillsoft-card-preview'));
  assert.ok(script.includes('dialog.showModal()'));
  assert.ok(main.includes('initCredentials'));
  assert.ok(headers.includes('frame-src https://skillsoft.digitalbadges.skillsoft.com'));
  assert.ok(!headers.includes('https://api.accredible.com'));
  assert.ok(layout.includes('id="credential-dialog"'));
  assert.ok(layout.includes('data-credential-dialog-frame'));
  assert.ok(styles.includes('.credential-dialog-frame-wrap iframe'));
});

test('gallery thumbnail navigation cannot bubble into the outside-click closer', () => {
  const script = readFileSync(resolve(root, 'public/js/project-gallery.js'), 'utf8');
  const css = readFileSync(resolve(root, 'public/css/project-gallery.css'), 'utf8');
  const layout = readFileSync(resolve(root, 'src/templates/layout.html'), 'utf8');

  assert.ok(script.includes("chrome.addEventListener('click', event => event.stopPropagation())"));
  assert.ok(script.includes('event.preventDefault();\n          event.stopPropagation();'));
  assert.ok(script.includes('gallery.goToSlide(index)'));
  assert.ok(css.includes('.project-gallery-thumbs'));
  assert.ok(css.includes('.project-gallery-thumb.is-active'));
  assert.ok(layout.includes('/css/project-gallery.css'));
  assert.ok(!layout.includes('/css/gallery-premium.css'));
});

test('portfolio feature styles are owned by their modules instead of patch stylesheets', () => {
  const layout = readFileSync(resolve(root, 'src/templates/layout.html'), 'utf8');

  assert.equal(existsSync(resolve(root, 'public/css/portfolio-layout-fix.css')), false);
  assert.equal(existsSync(resolve(root, 'public/css/gallery-premium.css')), false);
  assert.equal(existsSync(resolve(root, 'public/css/skillsoft-badges.css')), false);
  assert.equal(existsSync(resolve(root, 'public/js/modules/credential-badges.js')), false);
  assert.ok(layout.includes('/css/project-showcase.css'));
  assert.ok(layout.includes('/css/credential-wall.css'));
});
