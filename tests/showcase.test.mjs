import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

const root = resolve(fileURLToPath(new URL('..', import.meta.url)));

test('project showcase stays unnumbered and media-first', () => {
  const template = readFileSync(resolve(root, 'src/templates/cards/project.html'), 'utf8');
  const css = readFileSync(resolve(root, 'public/css/project-showcase.css'), 'utf8');

  assert.ok(template.includes('project-card-media'));
  assert.ok(template.includes('project-card-content'));
  assert.ok(template.includes('data-open-project-gallery'));
  assert.ok(!template.includes('data-project-case'));
  assert.ok(!/project-(?:number|index)|\{\{(?:number|index)\}\}/i.test(template));
  assert.ok(css.includes('grid-template-columns: minmax(0, 1.35fr) minmax(280px, .65fr)'));
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

test('credential wall preserves certification cards and featured hierarchy styles', () => {
  const template = readFileSync(resolve(root, 'src/templates/cards/certification.html'), 'utf8');
  const css = readFileSync(resolve(root, 'public/css/credential-wall.css'), 'utf8');
  assert.ok(template.includes('class="certification-card"'));
  assert.ok(template.includes('credential-card-link'));
  assert.ok(css.includes('.certification-card:nth-child(-n+3)'));
  assert.ok(css.includes('@media (max-width: 640px)'));
});
