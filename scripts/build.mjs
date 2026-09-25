import { readFileSync, mkdirSync, cpSync, writeFileSync, rmSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { resolve } from 'node:path';
import { render, renderProjectGallery, renderProjectDetail } from '../src/render.mjs';

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
  mkdirSync(resolve(output, 'es'), { recursive: true });
  mkdirSync(resolve(output, 'projects'), { recursive: true });
  mkdirSync(resolve(output, 'es/projects'), { recursive: true });
  for (const project of site.projects) {
    if (!/^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(project.slug || '')) throw new Error('Invalid project slug: ' + project.name);
    mkdirSync(resolve(output, 'projects', project.slug), { recursive: true });
    mkdirSync(resolve(output, 'es/projects', project.slug), { recursive: true });
  }
  cpSync(resolve(root, 'public'), output, { recursive: true });

  writeFileSync(resolve(output, 'js/translations.js'), 'export default ' + JSON.stringify(translations) + ';\n');
  writeFileSync(resolve(output, 'js/site-data.js'), 'export default ' + JSON.stringify({
    expertise: site.expertise,
    skillTypes: site.skillTypes,
    skillRoleIds: site.skillRoleIds,
    engineeringSections: site.engineeringSections,
    experience: site.experience,
    engineering: site.engineering,
    linkedin: site.linkedin
  }) + ';\n');

  writeFileSync(resolve(output, 'index.html'), render(site, { language: 'en', translations }));
  writeFileSync(resolve(output, 'es/index.html'), render(site, { language: 'es', translations }));
  writeFileSync(resolve(output, 'projects/index.html'), renderProjectGallery(site, { language: 'en', translations }));
  writeFileSync(resolve(output, 'es/projects/index.html'), renderProjectGallery(site, { language: 'es', translations }));
  for (const project of site.projects) {
    writeFileSync(resolve(output, 'projects', project.slug, 'index.html'), renderProjectDetail(site, project, { language: 'en', translations }));
    writeFileSync(resolve(output, 'es/projects', project.slug, 'index.html'), renderProjectDetail(site, project, { language: 'es', translations }));
  }

  writeFileSync(resolve(output, 'robots.txt'), 'User-agent: *\nAllow: /\n\nSitemap: ' + siteUrl.origin + '/sitemap.xml\n');
  writeFileSync(resolve(output, 'sitemap.xml'),
    '<?xml version="1.0" encoding="UTF-8"?>\n' +
    '<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9" xmlns:xhtml="http://www.w3.org/1999/xhtml">\n' +
    '  <url><loc>' + xml(siteUrl.origin + '/') + '</loc><xhtml:link rel="alternate" hreflang="en" href="' + xml(siteUrl.origin + '/') + '"/><xhtml:link rel="alternate" hreflang="es" href="' + xml(siteUrl.origin + '/es/') + '"/></url>\n' +
    '  <url><loc>' + xml(siteUrl.origin + '/es/') + '</loc><xhtml:link rel="alternate" hreflang="en" href="' + xml(siteUrl.origin + '/') + '"/><xhtml:link rel="alternate" hreflang="es" href="' + xml(siteUrl.origin + '/es/') + '"/></url>\n' +
    '  <url><loc>' + xml(siteUrl.origin + '/projects/') + '</loc><xhtml:link rel="alternate" hreflang="en" href="' + xml(siteUrl.origin + '/projects/') + '"/><xhtml:link rel="alternate" hreflang="es" href="' + xml(siteUrl.origin + '/es/projects/') + '"/></url>\n' +
    '  <url><loc>' + xml(siteUrl.origin + '/es/projects/') + '</loc><xhtml:link rel="alternate" hreflang="en" href="' + xml(siteUrl.origin + '/projects/') + '"/><xhtml:link rel="alternate" hreflang="es" href="' + xml(siteUrl.origin + '/es/projects/') + '"/></url>\n' +
    site.projects.map(project =>
      '  <url><loc>' + xml(siteUrl.origin + '/projects/' + project.slug + '/') + '</loc><xhtml:link rel="alternate" hreflang="en" href="' + xml(siteUrl.origin + '/projects/' + project.slug + '/') + '"/><xhtml:link rel="alternate" hreflang="es" href="' + xml(siteUrl.origin + '/es/projects/' + project.slug + '/') + '"/></url>\n' +
      '  <url><loc>' + xml(siteUrl.origin + '/es/projects/' + project.slug + '/') + '</loc><xhtml:link rel="alternate" hreflang="en" href="' + xml(siteUrl.origin + '/projects/' + project.slug + '/') + '"/><xhtml:link rel="alternate" hreflang="es" href="' + xml(siteUrl.origin + '/es/projects/' + project.slug + '/') + '"/></url>'
    ).join('\n') + '\n' +
    '</urlset>\n'
  );

  console.log('Web generated: dist/ (EN + ES)');
}

if (process.argv[1] && resolve(process.argv[1]) === fileURLToPath(import.meta.url)) build();
