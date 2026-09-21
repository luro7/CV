import assert from 'node:assert/strict';
import { existsSync, readFileSync } from 'node:fs';
import { resolve } from 'node:path';
import { build, output } from './build.mjs';
build();
const html = readFileSync(resolve(output, 'index.html'), 'utf8');
assert.equal((html.match(/<h1\b/g) || []).length, 1, 'Debe existir un único h1');
assert(!/\{\{\w+\}\}/.test(html), 'Hay variables sin resolver');
assert.equal((html.match(/<img\b/g) || []).length, 4, 'Logo de LinkedIn y tres insignias, sin fotografía');
assert(html.includes('/assets/linkedin-in-white.png'), 'Logo oficial de LinkedIn');
const ids = [...html.matchAll(/\bid="([^"]+)"/g)].map(m => m[1]);
assert.equal(ids.length, new Set(ids).size, 'Hay IDs duplicados');
for (const [, href] of html.matchAll(/\bhref="([^"]+)"/g)) {
  if (href.startsWith('#')) assert(ids.includes(href.slice(1)), `Destino inexistente: ${href}`);
  else if (href.startsWith('/')) assert(existsSync(resolve(output, '.' + href)), `Archivo faltante: ${href}`);
  else assert(['lucasrosat.pages.dev', 'www.linkedin.com', 'www.credly.com', 'skillsoft.digitalbadges.skillsoft.com'].includes(new URL(href).hostname) && href.startsWith('https://'), `Enlace inesperado: ${href}`);
}
assert(!html.includes('mailto:') && !html.includes('wa.me'), 'Solo LinkedIn como contacto');
assert(html.includes('<html lang="en">'), 'El sitio debe estar en inglés');
for (const [, source] of html.matchAll(/\bsrc="([^"]+)"/g)) {
  assert(source.startsWith('/') && existsSync(resolve(output, '.' + source)), `Recurso faltante: ${source}`);
}
assert.equal((html.match(/href="https:/g) || []).length, 5, 'Canonical, LinkedIn y tres verificaciones de credenciales');
for (const [, url] of readFileSync(resolve(output, 'css/main.css'), 'utf8').matchAll(/url\(["']?([^)'"\s]+)/g)) {
  assert(!url.startsWith('http'), 'Recurso externo inesperado');
}
console.log('OK: estructura, enlaces, anclas y recursos locales. Sin foto ni dependencias remotas.');

const schema = JSON.parse(html.match(/<script type="application\/ld\+json">([\s\S]*?)<\/script>/)[1]);
assert.equal(schema.mainEntity.name, 'Lucas Rosat');
assert.equal(schema['@type'], 'ProfilePage');
assert(html.includes('rel="canonical" href="https://lucasrosat.pages.dev/"'));
const sitemap = readFileSync(resolve(output, 'sitemap.xml'), 'utf8');
assert.equal((sitemap.match(/<loc>/g) || []).length, 1);
assert(sitemap.includes('<loc>https://lucasrosat.pages.dev/</loc>'));
assert(readFileSync(resolve(output,'robots.txt'),'utf8').includes('Sitemap: https://lucasrosat.pages.dev/sitemap.xml'));
assert(readFileSync(resolve(output,'google6cc6f994cc0e992b.html'),'utf8').trim() === 'google-site-verification: google6cc6f994cc0e992b.html');
console.log('OK: canonical, ProfilePage, sitemap, robots y verificación de Google.');
