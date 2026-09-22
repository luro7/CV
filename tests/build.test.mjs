import test from 'node:test';
import assert from 'node:assert/strict';
import { existsSync, mkdirSync, writeFileSync, readFileSync } from 'node:fs';
import { resolve } from 'node:path';
import { build, output } from '../scripts/build.mjs';

test('build starts clean and generates English and Spanish indexable pages', () => {
  mkdirSync(output, { recursive: true });
  writeFileSync(resolve(output, 'stale-file.txt'), 'stale');
  build();

  assert.equal(existsSync(resolve(output, 'stale-file.txt')), false);
  assert.equal(existsSync(resolve(output, 'index.html')), true);
  assert.equal(existsSync(resolve(output, 'es/index.html')), true);

  const en = readFileSync(resolve(output, 'index.html'), 'utf8');
  const es = readFileSync(resolve(output, 'es/index.html'), 'utf8');
  const sitemap = readFileSync(resolve(output, 'sitemap.xml'), 'utf8');

  assert.match(en, /<html lang="en">/);
  assert.match(es, /<html lang="es">/);
  assert.match(es, /Ingeniería de Datos/);
  assert.match(en, /hreflang="es"/);
  assert.match(es, /rel="canonical" href="https:\/\/lucasrosat\.pages\.dev\/es\/"/);
  assert.match(sitemap, /lucasrosat\.pages\.dev\/es\//);
});
