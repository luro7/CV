import assert from 'node:assert/strict';
import { existsSync, readFileSync } from 'node:fs';
import { resolve } from 'node:path';
import { build, output, root } from './build.mjs';

build();

const site = JSON.parse(readFileSync(resolve(root, 'content/site.json'), 'utf8'));
const translations = JSON.parse(readFileSync(resolve(root, 'content/locales/es.json'), 'utf8'));
const html = readFileSync(resolve(output, 'index.html'), 'utf8');
const spanishHtml = readFileSync(resolve(output, 'es/index.html'), 'utf8');
const siteUrl = new URL(site.siteUrl);
assert(existsSync(resolve(root, 'public', '.' + site.cvPortrait)), 'CV portrait asset is missing');
const allowedHosts = new Set([
  siteUrl.hostname,
  new URL(site.linkedin).hostname,
  ...site.certifications.map(item => new URL(item.credentialUrl).hostname)
  , ...site.projects.filter(item => item.url).map(item => new URL(item.url).hostname)
]);

const expertiseItems = site.expertise.flatMap(group => group.tools);
assert(site.expertise.length > 0, 'At least one expertise group is required');
assert.equal(new Set(expertiseItems).size, expertiseItems.length, 'Expertise items must be unique');
const allowedSkillTypes = new Set(['Skill', 'Technology', 'Language', 'Process', 'Domain']);
assert(site.skillTypes && typeof site.skillTypes === 'object', 'skillTypes taxonomy is required');
for (const item of expertiseItems) {
  assert(site.skillTypes[item], 'Missing skill type for: ' + item);
  assert(allowedSkillTypes.has(site.skillTypes[item]), 'Invalid skill type for: ' + item);
}
for (const skill of Object.keys(site.skillTypes)) {
  assert(expertiseItems.includes(skill), 'Unused skill type: ' + skill);
}

const nonTranslatedTerms = new Set([
  'Lucas Rosat', 'SQL Server', 'T-SQL', 'ETL', 'SSIS', 'Azure Data Factory',
  'Microsoft Copilot', 'ChatGPT', 'OpenAI Codex', 'PowerShell', 'Power BI', 'SSRS',
  'BMC Control-M', 'Accenture', 'Microsoft Copilot Enterprise', 'Visual Studio',
  'Grupo Aoniken', 'Iddea Devs',
  'SQL', 'HTML', 'CSS', 'PHP', 'Git', 'Skillsoft', 'Universidad Nacional del Sur',
  'Cloudflare Pages', 'CI/CD', 'GitHub Actions', '2017',
  'Astro, React, TypeScript, Hono, Cloudflare Pages, D1, KV',
  'Kotlin, Jetpack Compose, MapLibre',
  'C# 14, .NET 10, WinUI 3',
  'C# 14, .NET 10, WinUI 3, WASAPI, Chromium extension'
]);
const publicCopy = [
  site.description, site.intro, ...site.about,
  ...site.title.split(' | '),
  ...site.expertise.flatMap(group => [group.title, ...group.tools]),
  ...site.experience.flatMap(item => [item.company, item.role, item.date, ...item.points, ...item.tools]),
  site.projectsIntro, ...site.projects.flatMap(item => [item.name, item.description, item.technologies, item.urlLabel].filter(Boolean)),
  ...site.education.flatMap(item => [item.title, item.institution, item.detail]),
  ...site.languages.flatMap(item => [item.name, item.level]),
  ...site.certifications.flatMap(item => [item.title, item.institution, item.date]),
  ...site.engineering.flatMap(item => [item.label, item.value]),
  ...Object.values(site.engineeringSections).flatMap(item => [item.label, item.render, item.interaction])
];
for (const phrase of new Set(publicCopy)) {
  assert(translations[phrase] || nonTranslatedTerms.has(phrase), 'Missing Spanish translation or explicit exception: ' + phrase);
}
const requiredUiTranslations = [
  'Select a skill or technology to trace experience.', 'Skill', 'Technology', 'Language', 'Process', 'Domain',
  'Data', 'Transform', 'Automate', 'AI', 'Report', 'Type a skill, technology or action', 'Search the CV',
  'Go to introduction', 'Go to expertise', 'Go to experience', 'Go to education', 'Toggle dark mode', 'Projects',
  'Toggle engineering mode', 'Switch language', 'Save PDF', 'Open LinkedIn', 'Navigate', 'System', 'Current'
];
for (const phrase of requiredUiTranslations) {
  assert(translations[phrase], 'Missing Spanish UI translation: ' + phrase);
}

for (const item of site.expertise) {
  assert(item.number && item.title && Array.isArray(item.tools) && item.tools.length, 'Expertise groups need a number, title and tools');
}
for (const item of site.experience) {
  for (const key of ['company', 'role', 'date', 'id']) assert(typeof item[key] === 'string' && item[key].trim(), 'Experience item missing ' + key);
  assert(Array.isArray(item.points) && item.points.length, 'Experience item needs responsibility points: ' + item.id);
  assert(Array.isArray(item.tools), 'Experience tools must be an array: ' + item.id);
}
assert.equal(site.projects.length, 4, 'Four independently developed projects should be listed');
for (const item of site.projects) {
  for (const key of ['name', 'description', 'technologies']) assert(typeof item[key] === 'string' && item[key].trim(), 'Project missing ' + key);
  if (item.url) assert.equal(new URL(item.url).hostname, 'manosalaobra.pages.dev', 'Only the public project website may be linked');
}
for (const item of site.education) {
  for (const key of ['title', 'institution', 'detail']) assert(typeof item[key] === 'string' && item[key].trim(), 'Education item missing ' + key);
}
assert(Array.isArray(site.languages) && site.languages.length, 'At least one language is required');
for (const item of site.languages) {
  for (const key of ['name', 'level']) assert(typeof item[key] === 'string' && item[key].trim(), 'Language entry missing ' + key);
}
for (const item of site.certifications) {
  for (const key of ['title', 'institution', 'date', 'credentialUrl']) assert(typeof item[key] === 'string' && item[key].trim(), 'Certification item missing ' + key);
  if (item.image) assert(/^\/assets\/credentials\/[a-z0-9-]+\.png$/.test(item.image), 'Invalid credential image: ' + item.title);
  else assert(/^[A-Za-z0-9]{2,8}$/.test(item.badgeLabel || ''), 'Credential without an image needs a short label: ' + item.title);
}
assert.equal(site.certifications.length, 8, 'All public credentials should be listed');

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
  assert(documentHtml.includes('id="projects"'), name + ': projects section is missing');
  assert(documentHtml.includes('AI-assisted projects'), name + ': projects are missing from the generated CV');
  assert(!/github\.com\/luro7\/(manosalaobra|DisplayConductor|my-flight-android|sound-mixer)/i.test(documentHtml), name + ': private repository URL exposed');
  assert(documentHtml.includes('class="print-cv" hidden'), name + ': dedicated CV print content is missing');
  assert.equal((documentHtml.match(/class="certification-card"/g) || []).length, site.certifications.length, name + ': all credentials should appear on the page');
  assert(!documentHtml.includes('class="expertise-grid"'), name + ': skills should not be repeated below the interactive map');
  assert(documentHtml.includes('src="' + site.cvPortrait + '"'), name + ': CV portrait is not connected to site data');
  const visibleText = documentHtml.replace(/<(script|style)\b[\s\S]*?<\/\1>/gi, ' ').replace(/<[^>]+>/g, ' ');
  assert(!/[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}/i.test(visibleText), name + ': email address exposed');
  assert(!/(?<!\d)\+?\d[\d ()-]{7,}\d(?!\d)/.test(visibleText), name + ': phone number exposed');
  assert(!/<address\b/i.test(documentHtml), name + ': postal address exposed');
  assert(documentHtml.includes('id="engineering-panel" inert'), name + ': closed engineering panel must be inert');
  assert(documentHtml.includes('aria-controls="engineering-panel"'), name + ': engineering toggle needs its controlled panel');

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

const printCss = readFileSync(resolve(output, 'css/interactive.css'), 'utf8');
assert(printCss.includes('@page{size:A4'), 'Print output must use A4 paper');
assert(printCss.includes('.print-cv-portrait'), 'Print output must include the CV portrait');
assert(printCss.includes('body>:not(.print-cv)'), 'Print output must use the CV document instead of page styling');

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
