import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import { projectCaseStudies, getProjectCaseStudy } from '../public/js/modules/project-showcase-model.js';

const root = resolve(fileURLToPath(new URL('..', import.meta.url)));

test('project showcase has bilingual case study copy for every project', () => {
  const expected = ['manos-a-la-obra', 'my-flight', 'display-conductor', 'sound-mixer'];
  assert.deepEqual(Object.keys(projectCaseStudies), expected);

  for (const slug of expected) {
    for (const language of ['en', 'es']) {
      const study = getProjectCaseStudy(slug, language);
      assert.ok(study?.problem?.trim(), `${slug} ${language} problem is missing`);
      assert.ok(study?.solution?.trim(), `${slug} ${language} solution is missing`);
    }
  }
});

test('project showcase stays unnumbered and keeps the gallery trigger', () => {
  const projectTemplate = readFileSync(resolve(root, 'src/templates/cards/project.html'), 'utf8');
  assert.ok(projectTemplate.includes('project-lightbox') || projectTemplate.includes('{{cardTriggerOpen}}'));
  assert.ok(projectTemplate.includes('data-project-case'));
  assert.ok(!/project-(?:number|index)|\{\{(?:number|index)\}\}/i.test(projectTemplate));
});

test('credential wall preserves certification cards and featured hierarchy styles', () => {
  const template = readFileSync(resolve(root, 'src/templates/cards/certification.html'), 'utf8');
  const css = readFileSync(resolve(root, 'public/css/credential-wall.css'), 'utf8');
  assert.ok(template.includes('class="certification-card"'));
  assert.ok(template.includes('credential-card-link'));
  assert.ok(css.includes('.certification-card:nth-child(-n+3)'));
  assert.ok(css.includes('@media (max-width: 640px)'));
});
