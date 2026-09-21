import { readFileSync } from 'node:fs';
const templates = new URL('./templates/', import.meta.url);
export const escapeHtml = value => String(value).replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
function template(name, values) {
  return readFileSync(new URL(name + '.html', templates), 'utf8').replace(/\{\{(\w+)\}\}/g, (_, key) => {
    if (!(key in values)) throw new Error(`Falta ${key} en ${name}`);
    return values[key];
  });
}
const escaped = object => Object.fromEntries(Object.entries(object).filter(([, v]) => typeof v === 'string').map(([key, value]) => [key, escapeHtml(value)]));
const tags = values => values.map(value => `<li>${escapeHtml(value)}</li>`).join('');
export function render(site) {
  const linked = new URL(site.linkedin);
  if (linked.protocol !== 'https:' || linked.hostname !== 'www.linkedin.com') throw new Error('URL de LinkedIn inválida');
  const split = site.intro.indexOf('. ');
  const base = { ...escaped(site), introLead: escapeHtml(site.intro.slice(0, split + 1)), introDetail: escapeHtml(site.intro.slice(split + 2)), year: new Date().getFullYear() };
  const expertiseCards = site.expertise.map(item => template('cards/expertise', { ...escaped(item), tools: tags(item.tools) })).join('\n');
  const experienceCards = site.experience.map(item => template('cards/experience', { ...escaped(item), open: item.current ? 'open' : '', tools: tags(item.tools), points: tags(item.points), currentBadge: item.current ? '<span class="current-badge">Current</span>' : '' })).join('\n');
  const educationCards = site.education.map(item => template('cards/education', escaped(item))).join('\n');
  const certificationCards = site.certifications.map(item => {
    const url = new URL(item.credentialUrl);
    if (url.protocol !== 'https:' || !['www.credly.com', 'skillsoft.digitalbadges.skillsoft.com'].includes(url.hostname)) throw new Error('Credencial inválida');
    if (!/^\/assets\/credentials\/[a-z0-9-]+\.png$/.test(item.image)) throw new Error('Insignia inválida');
    return template('cards/certification', escaped(item));
  }).join('\n');
  const structuredData = JSON.stringify({
    '@context': 'https://schema.org', '@type': 'ProfilePage',
    '@id': 'https://lucasrosat.pages.dev/#profile',
    url: 'https://lucasrosat.pages.dev/', name: site.name + ' — Professional CV',
    inLanguage: 'en', mainEntity: {
      '@type': 'Person', '@id': 'https://lucasrosat.pages.dev/#person',
      name: site.name, url: 'https://lucasrosat.pages.dev/', sameAs: [site.linkedin],
      jobTitle: site.title.split(' | '), description: site.intro,
      worksFor: { '@type': 'Organization', name: site.experience.find(item => item.current).company },
      knowsAbout: [...new Set(site.expertise.flatMap(item => [item.title, ...item.tools]))]
    }
  }).replace(/</g, '\\u003c');
  const paragraphs=items=>items.map(text=>'<p>'+escapeHtml(text)+'</p>').join('');
  const aboutContent=paragraphs(site.about);
  const sections = Object.fromEntries(['hero', 'profile', 'experience', 'education'].map(name => [name, template('sections/' + name, { ...base, aboutContent, expertiseCards, experienceCards, educationCards, certificationCards })]));
  return template('layout', { ...base, ...sections, structuredData, header: template('shared/header', base), footer: template('shared/footer', base) });
}
