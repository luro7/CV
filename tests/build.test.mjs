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

  // Current Accenture role is the real job title; BI/SQL/AI remain specialties.
  assert.match(en, /<p class="hero-role"><strong>Data Engineering Analyst<\/strong>/);
  assert.match(es, /Analista de Ingeniería de Datos<\/strong>/);
  assert.match(en, /Design and build end-to-end ETL processes from scratch/);
  assert.match(en, /Design SQL Server database structures and data models/);
  assert.match(en, /Develop, troubleshoot and optimize complex T-SQL queries/);
  assert.match(en, /Power BI Paginated Reports \(RDL\)/);
  assert.match(en, /Design and develop AI agents with Microsoft Copilot/);
  assert.match(es, /Diseño y desarrollo de procesos ETL de punta a punta desde cero/);
  assert.match(es, /Diseño de estructuras de bases de datos SQL Server y modelos de datos/);
  assert.match(es, /Desarrollo y mantenimiento de soluciones de inteligencia de negocios/);
  const printSummary = en.match(/<h2>Professional summary<\/h2>\s*<div class="print-cv-content">([\s\S]*?)<\/div>/)?.[1] || '';
  assert.match(printSummary, /end-to-end ETL processes/);
  const profileSchema = JSON.parse(en.match(/<script type="application\/ld\+json">([\s\S]*?)<\/script>/)[1]);
  assert.equal(profileSchema.mainEntity.jobTitle, 'Data Engineering Analyst');

});
