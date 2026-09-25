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
  assert.match(es, /href="https:\/\/manosalaobra\.pages\.dev"[^>]*>Sitio web/);
  assert.doesNotMatch(es, /View completed work|Ver trabajos realizados/);
  assert.match(es, /class="project-card-link project-lightbox-link"/);
  assert.match(es, /data-gallery="manos-a-la-obra"/);
  assert.match(es, /id="project-gallery-manos-a-la-obra"/);
  assert.match(es, /manos-edit-work-desktop\.png/);
  assert.match(es, /manos-landing-desktop\.png/);
  assert.match(es, /manos-publish-confirmation-desktop\.png/);
  assert.match(es, /class="project-card-live-link"[^>]*>Sitio web/);
  assert.doesNotMatch(es, /project-dialog-live-link|project-gallery-main swiper|project-gallery-thumbs swiper/);
  assert.match(en, /hreflang="es"/);
  assert.match(es, /rel="canonical" href="https:\/\/lucasrosat\.pages\.dev\/es\/"/);
  assert.match(sitemap, /lucasrosat\.pages\.dev\/es\//);
});
