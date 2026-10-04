import test from 'node:test';
import assert from 'node:assert/strict';
import { existsSync, readFileSync } from 'node:fs';
import { resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import { render } from '../src/render.mjs';

const root = resolve(fileURLToPath(new URL('..', import.meta.url)));

test('project showcase stays unnumbered and owns its layout', () => {
  const template = readFileSync(resolve(root, 'src/templates/cards/project.html'), 'utf8');
  const css = readFileSync(resolve(root, 'public/css/project-showcase.css'), 'utf8');

  assert.ok(template.includes('project-card-media'));
  assert.ok(template.includes('project-card-content'));
  assert.ok(template.includes('data-open-project-gallery'));
  assert.ok(!template.includes('data-project-case'));
  assert.ok(!/project-(?:number|index)|\{\{(?:number|index)\}\}/i.test(template));
  assert.ok(css.includes('grid-template-columns: repeat(2, minmax(0, 1fr))'));
  assert.ok(css.includes('object-fit: contain'));
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
  assert.ok(css.includes('min-height: clamp(205px, 18vw, 250px)'));
  assert.ok(css.includes('width: min(64%, 200px)'));
  assert.ok(!css.includes('.skillsoft-card-preview'));
});

test('Skillsoft cards use local artwork and reserve embeds for the details dialog', () => {
  const script = readFileSync(resolve(root, 'public/js/modules/credentials.js'), 'utf8');
  const renderer = readFileSync(resolve(root, 'src/render.mjs'), 'utf8');
  const main = readFileSync(resolve(root, 'public/js/main.js'), 'utf8');
  const headers = readFileSync(resolve(root, 'public/_headers'), 'utf8');
  const layout = readFileSync(resolve(root, 'src/templates/layout.html'), 'utf8');
  const styles = readFileSync(resolve(root, 'public/css/credential-wall.css'), 'utf8');
  const site = JSON.parse(readFileSync(resolve(root, 'content/site.json'), 'utf8'));
  const assets = JSON.parse(readFileSync(resolve(root, 'content/credential-assets.json'), 'utf8'));
  const skillsoftCredentials = site.certifications.filter(item => item.credentialUrl.includes('skillsoft.digitalbadges.skillsoft.com'));

  assert.equal(skillsoftCredentials.length, 7);
  assert.equal(Object.keys(assets.skillsoft).length, 7);
  for (const item of skillsoftCredentials) {
    const id = new URL(item.credentialUrl).pathname.split('/').filter(Boolean).at(0);
    const asset = assets.skillsoft[id];
    assert.match(asset || '', /^\/assets\/credentials\/[a-z0-9-]+\.png$/);
    assert.ok(existsSync(resolve(root, 'public', '.' + asset)), 'Missing local Skillsoft badge: ' + item.title);
  }

  assert.ok(renderer.includes('credentialAssets.skillsoft?.[credentialId]'));
  assert.ok(script.includes('skillsoftEmbedUrl'));
  assert.ok(script.includes('/embed/${encodeURIComponent(credentialId)}'));
  assert.ok(script.includes('dialogFrame.src = embedUrl'));
  assert.ok(script.includes('dialog.showModal()'));
  assert.ok(!script.includes("createElement('iframe')"));
  assert.ok(!script.includes('skillsoft-card-preview'));
  assert.ok(main.includes('initCredentials'));
  assert.ok(headers.includes('frame-src https://skillsoft.digitalbadges.skillsoft.com'));
  assert.ok(!headers.includes('https://api.accredible.com'));
  assert.ok(layout.includes('id="credential-dialog"'));
  assert.ok(layout.includes('data-credential-dialog-frame'));
  assert.ok(styles.includes('.credential-dialog-frame-wrap iframe'));

  const documentHtml = render(site);
  assert.equal((documentHtml.match(/<iframe\b/g) || []).length, 2, 'Only credential details and the location map may contain iframes');
  assert.match(documentHtml, /<iframe class="location-map" data-map-src="https:\/\/www.google.com\/maps\?/);
  assert.equal((documentHtml.match(/data-credential-provider="skillsoft"/g) || []).length, 7);
  for (const asset of Object.values(assets.skillsoft)) assert.ok(documentHtml.includes('src="' + asset + '"'));
});

test('gallery thumbnail navigation cannot bubble into the outside-click closer', () => {
  const script = readFileSync(resolve(root, 'public/js/project-gallery.js'), 'utf8');
  const css = readFileSync(resolve(root, 'public/css/project-gallery.css'), 'utf8');
  const layout = readFileSync(resolve(root, 'src/templates/layout.html'), 'utf8');

  assert.ok(script.includes("chrome.addEventListener('click', event => event.stopPropagation())"));
  assert.match(script, /event\.preventDefault\(\);\r?\n\s+event\.stopPropagation\(\);/);
  assert.ok(script.includes('gallery.goToSlide(index)'));
  assert.ok(script.includes('closeOnOutsideClick: true'));
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
