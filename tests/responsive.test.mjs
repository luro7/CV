import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

const root = resolve(fileURLToPath(new URL('..', import.meta.url)));
const read = path => readFileSync(resolve(root, path), 'utf8');

test('responsive modules own their mobile layout without conflicting theme overrides', () => {
  const theme = read('public/css/theme.css');
  const skills = read('public/css/capability-map.css');
  const experience = read('public/css/experience-timeline.css');

  assert.doesNotMatch(theme, /capability-stage\.has-pinned-skill\s*\+\s*\.capability-inspector/);
  assert.match(skills, /@media\(max-width:1000px\)/);
  assert.match(skills, /grid-template-columns:minmax\(0,1fr\)/);
  assert.match(skills, /@media\(max-width:480px\)/);
  assert.match(skills, /\.capability-node\{flex:1 1 100%;width:100%;min-width:0\}/);

  assert.match(experience, /\.career-roles \.career-role-details\{display:block;min-width:0\}/);
  assert.match(experience, /\.career-company-heading>div\{min-width:0\}/);
  assert.match(experience, /overflow-wrap:anywhere/);
});

test('phone layouts stack narrow cards and actions instead of squeezing text', () => {
  const credentials = read('public/css/credential-wall.css');
  const projects = read('public/css/project-showcase.css');
  const gallery = read('public/css/project-gallery.css');
  const interactive = read('public/css/interactive.css');

  assert.match(credentials, /@media\(max-width:520px\)/);
  assert.match(credentials, /\.certification-card\{grid-template-columns:1fr;min-height:0\}/);
  assert.match(credentials, /credential-dialog\{width:calc\(100vw - 1rem\)/);

  assert.match(projects, /@media \(max-width: 480px\)/);
  assert.match(projects, /\.project-actions \{ display: grid; grid-template-columns: 1fr; \}/);
  assert.match(projects, /overflow-wrap: anywhere/);

  assert.match(gallery, /grid-template-columns:minmax\(0,1fr\) auto minmax\(0,1fr\)/);
  assert.match(interactive, /@media screen and \(max-width:380px\)/);
  assert.match(interactive, /\.command-result\{display:grid;grid-template-columns:minmax\(0,1fr\)/);
});

test('decorative certification count is not rendered', () => {
  const education = read('src/templates/sections/education.html');
  assert.doesNotMatch(education, /credential-count/);
  assert.doesNotMatch(education, /\{\{certificationCount\}\}/);
});
