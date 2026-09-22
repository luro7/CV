import { readFileSync, mkdirSync, cpSync, writeFileSync, rmSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { resolve } from 'node:path';
import { render } from '../src/render.mjs';

export const root = fileURLToPath(new URL('../', import.meta.url));
export const output = resolve(root, 'dist');

const xml = value => String(value).replace(/[<>&'"]/g, char => ({
  '<': '&lt;',
  '>': '&gt;',
  '&': '&amp;',
  "'": '&apos;',
  '"': '&quot;'
}[char]));

export function build() {
  const site = JSON.parse(readFileSync(resolve(root, 'content/site.json'), 'utf8'));
  const translations = JSON.parse(readFileSync(resolve(root, 'content/locales/es.json'), 'utf8'));
  const siteUrl = new URL(site.siteUrl);

  rmSync(output, { recursive: true, force: true });
  mkdirSync(output, { recursive: true });
  cpSync(resolve(root, 'public'), output, { recursive: true });

  writeFileSync(resolve(output, 'js/translations.js'), 'export default ' + JSON.stringify(translations) + ';\n');
  writeFileSync(resolve(output, 'js/site-data.js'), 'export default ' + JSON.stringify({
    expertise: site.expertise,
    skillTypes: site.skillTypes,
    skillRoleIds: site.skillRoleIds,
    experience: site.experience,
    engineering: site.engineering,
    linkedin: site.linkedin
  }) + ';\n');
  writeFileSync(resolve(output, 'index.html'), render(site));
  writeFileSync(resolve(output, 'robots.txt'), 'User-agent: *\nAllow: /\n\nSitemap: ' + siteUrl.origin + '/sitemap.xml\n');
  writeFileSync(resolve(output, 'sitemap.xml'), '<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n  <url><loc>' + xml(siteUrl.origin + '/') + '</loc></url>\n</urlset>\n');

  console.log('Web generated: dist/');
}

if (process.argv[1] && resolve(process.argv[1]) === fileURLToPath(import.meta.url)) build();
