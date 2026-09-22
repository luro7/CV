import assert from 'node:assert/strict';
import { existsSync, readFileSync } from 'node:fs';
import { resolve } from 'node:path';
import { build, output, root } from './build.mjs';

build();

const site = JSON.parse(readFileSync(resolve(root, 'content/site.json'), 'utf8'));
const html = readFileSync(resolve(output, 'index.html'), 'utf8');
const siteUrl = new URL(site.siteUrl);
const allowedHosts = new Set([
  siteUrl.hostname,
  new URL(site.linkedin).hostname,
  ...site.certifications.map(item => new URL(item.credentialUrl).hostname)
]);

assert.equal((html.match(/<h1\b/g) || []).length, 1, 'Exactly one h1 is required');
assert(!/\{\{\w+\}\}/.test(html), 'Unresolved template variables found');
assert(html.includes('id="command-palette"'), 'Command palette is missing');
assert(html.includes('class="engineering-toggle'), 'Engineering mode toggle is missing');
assert(html.includes('data-skill-map'), 'Interactive skill map is missing');
assert(html.includes('class="hero-pipeline"'), 'Data pipeline is missing');

const ids = [...html.matchAll(/\bid="([^"]+)"/g)].map(match => match[1]);
assert.equal(ids.length, new Set(ids).size, 'Duplicate IDs found');

for (const [, href] of html.matchAll(/\bhref="([^"]+)"/g)) {
  if (href.startsWith('#')) {
    assert(ids.includes(href.slice(1)), 'Missing anchor target: ' + href);
  } else if (href.startsWith('/')) {
    assert(existsSync(resolve(output, '.' + href)), 'Missing local file: ' + href);
  } else {
    const url = new URL(href);
    assert.equal(url.protocol, 'https:', 'External link must use HTTPS: ' + href);
    assert(allowedHosts.has(url.hostname), 'Unexpected external host: ' + url.hostname);
  }
}

for (const [, source] of html.matchAll(/\bsrc="([^"]+)"/g)) {
  assert(source.startsWith('/'), 'Asset must be local: ' + source);
  assert(existsSync(resolve(output, '.' + source)), 'Missing asset: ' + source);
}

assert(!html.includes('mailto:') && !html.includes('wa.me'), 'Only LinkedIn is exposed as contact');
assert(html.includes('<html lang="en">'), 'Default HTML language must be English');
assert(html.includes('rel="canonical" href="' + siteUrl.origin + '/"'), 'Canonical URL must come from site.json');

for (const cssFile of ['css/main.css', 'css/interactive.css']) {
  const css = readFileSync(resolve(output, cssFile), 'utf8');
  for (const [, url] of css.matchAll(/url\(["']?([^)'"\s]+)/g)) {
    assert(!url.startsWith('http'), 'Remote CSS asset found in ' + cssFile + ': ' + url);
  }
}

const schema = JSON.parse(html.match(/<script type="application\/ld\+json">([\s\S]*?)<\/script>/)[1]);
assert.equal(schema['@type'], 'ProfilePage');
assert.equal(schema.mainEntity.name, site.name);
assert.equal(schema.url, siteUrl.origin + '/');

const sitemap = readFileSync(resolve(output, 'sitemap.xml'), 'utf8');
const robots = readFileSync(resolve(output, 'robots.txt'), 'utf8');
assert(sitemap.includes('<loc>' + siteUrl.origin + '/</loc>'), 'Sitemap URL is not centralized');
assert(robots.includes('Sitemap: ' + siteUrl.origin + '/sitemap.xml'), 'Robots sitemap URL is not centralized');
assert(existsSync(resolve(output, 'js/site-data.js')), 'Generated site data module is missing');
assert(readFileSync(resolve(output, 'google6cc6f994cc0e992b.html'), 'utf8').trim() === 'google-site-verification: google6cc6f994cc0e992b.html');

const headers = readFileSync(resolve(output, '_headers'), 'utf8');
for (const header of ['Content-Security-Policy:', 'X-Content-Type-Options:', 'Permissions-Policy:']) {
  assert(headers.includes(header), 'Missing security header: ' + header);
}

console.log('OK: build, navigation, interactive UI, assets, SEO and security checks passed.');
