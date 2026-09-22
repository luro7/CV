import assert from 'node:assert/strict';
import { existsSync, readFileSync } from 'node:fs';
import { resolve } from 'node:path';
import { build, output, root } from './build.mjs';

build();

const site = JSON.parse(readFileSync(resolve(root, 'content/site.json'), 'utf8'));
const html = readFileSync(resolve(output, 'index.html'), 'utf8');
const spanishHtml = readFileSync(resolve(output, 'es/index.html'), 'utf8');
const siteUrl = new URL(site.siteUrl);
const allowedHosts = new Set([
  siteUrl.hostname,
  new URL(site.linkedin).hostname,
  ...site.certifications.map(item => new URL(item.credentialUrl).hostname)
]);

const expertiseItems = site.expertise.flatMap(group => group.tools);
const allowedSkillTypes = new Set(['Skill', 'Technology', 'Language', 'Process', 'Domain']);
assert(site.skillTypes && typeof site.skillTypes === 'object', 'skillTypes taxonomy is required');
for (const item of expertiseItems) {
  assert(site.skillTypes[item], 'Missing skill type for: ' + item);
  assert(allowedSkillTypes.has(site.skillTypes[item]), 'Invalid skill type for: ' + item);
}

const experienceIds = new Set(site.experience.map(item => item.id));
assert.equal(experienceIds.size, site.experience.length, 'Experience IDs must be unique');
assert([...experienceIds].every(Boolean), 'Every experience item needs an ID');
for (const [skill, roleIds] of Object.entries(site.skillRoleIds || {})) {
  assert(expertiseItems.includes(skill), 'Unknown skillRoleIds key: ' + skill);
  for (const roleId of roleIds) assert(experienceIds.has(roleId), 'Unknown experience ID in skillRoleIds: ' + roleId);
}

for (const [name, documentHtml] of [['en', html], ['es', spanishHtml]]) {
  assert.equal((documentHtml.match(/<h1\b/g) || []).length, 1, name + ': exactly one h1 is required');
  assert(!/\{\{\w+\}\}/.test(documentHtml), name + ': unresolved template variables found');
  assert(documentHtml.includes('id="command-palette"'), name + ': command palette is missing');
  assert(documentHtml.includes('class="engineering-toggle'), name + ': engineering mode toggle is missing');
  assert(documentHtml.includes('data-skill-map'), name + ': interactive expertise map is missing');
  assert(documentHtml.includes('class="hero-pipeline"'), name + ': data pipeline is missing');
  assert(documentHtml.includes('class="pipeline-dock"'), name + ': persistent scroll pipeline is missing');
  assert(documentHtml.includes('data-skill-status'), name + ': skill trace status is missing');
  assert(documentHtml.includes('data-print-cv'), name + ': PDF/print action is missing');

  const ids = [...documentHtml.matchAll(/\bid="([^"]+)"/g)].map(match => match[1]);
  assert.equal(ids.length, new Set(ids).size, name + ': duplicate IDs found');

  for (const [, href] of documentHtml.matchAll(/\bhref="([^"]+)"/g)) {
    if (href.startsWith('#')) {
      assert(ids.includes(href.slice(1)), name + ': missing anchor target ' + href);
    } else if (href.startsWith('/')) {
      if (href === '/es/' || href === '/') continue;
      assert(existsSync(resolve(output, '.' + href)), name + ': missing local file ' + href);
    } else {
      const url = new URL(href);
      assert.equal(url.protocol, 'https:', name + ': external link must use HTTPS ' + href);
      assert(allowedHosts.has(url.hostname), name + ': unexpected external host ' + url.hostname);
    }
  }

  for (const [, source] of documentHtml.matchAll(/\bsrc="([^"]+)"/g)) {
    assert(source.startsWith('/'), name + ': asset must be local ' + source);
    assert(existsSync(resolve(output, '.' + source)), name + ': missing asset ' + source);
  }
}

assert(html.includes('<html lang="en">'), 'English page language is incorrect');
assert(spanishHtml.includes('<html lang="es">'), 'Spanish page language is incorrect');
assert(html.includes('hreflang="es" href="' + siteUrl.origin + '/es/"'), 'English hreflang missing');
assert(spanishHtml.includes('rel="canonical" href="' + siteUrl.origin + '/es/"'), 'Spanish canonical missing');
assert(spanishHtml.includes('Ingeniería de Datos'), 'Spanish page was not localized');
assert(!html.includes('mailto:') && !html.includes('wa.me'), 'Only LinkedIn is exposed as contact');

for (const cssFile of ['css/main.css', 'css/interactive.css']) {
  const css = readFileSync(resolve(output, cssFile), 'utf8');
  for (const [, url] of css.matchAll(/url\(["']?([^)'"\s]+)/g)) {
    assert(!url.startsWith('http'), 'Remote CSS asset found in ' + cssFile + ': ' + url);
  }
}

const schema = JSON.parse(html.match(/<script type="application\/ld\+json">([\s\S]*?)<\/script>/)[1]);
const esSchema = JSON.parse(spanishHtml.match(/<script type="application\/ld\+json">([\s\S]*?)<\/script>/)[1]);
assert.equal(schema['@type'], 'ProfilePage');
assert.equal(schema.mainEntity.name, site.name);
assert.equal(schema.inLanguage, 'en');
assert.equal(esSchema.inLanguage, 'es');
assert.equal(esSchema.url, siteUrl.origin + '/es/');

const sitemap = readFileSync(resolve(output, 'sitemap.xml'), 'utf8');
const robots = readFileSync(resolve(output, 'robots.txt'), 'utf8');
assert(sitemap.includes('<loc>' + siteUrl.origin + '/</loc>'), 'English sitemap URL missing');
assert(sitemap.includes('<loc>' + siteUrl.origin + '/es/</loc>'), 'Spanish sitemap URL missing');
assert(robots.includes('Sitemap: ' + siteUrl.origin + '/sitemap.xml'), 'Robots sitemap URL is not centralized');
assert(existsSync(resolve(output, 'js/site-data.js')), 'Generated site data module is missing');
assert(readFileSync(resolve(output, 'google6cc6f994cc0e992b.html'), 'utf8').trim() === 'google-site-verification: google6cc6f994cc0e992b.html');

const headers = readFileSync(resolve(output, '_headers'), 'utf8');
for (const header of ['Content-Security-Policy:', 'X-Content-Type-Options:', 'Permissions-Policy:']) {
  assert(headers.includes(header), 'Missing security header: ' + header);
}

console.log('OK: EN/ES build, interactions, assets, SEO, accessibility and security checks passed.');
