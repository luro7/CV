import { readFileSync } from 'node:fs';

const templates = new URL('./templates/', import.meta.url);

export const escapeHtml = value => String(value).replace(/[&<>"']/g, char => ({
  '&': '&amp;',
  '<': '&lt;',
  '>': '&gt;',
  '"': '&quot;',
  "'": '&#39;'
}[char]));

function template(name, values) {
  return readFileSync(new URL(name + '.html', templates), 'utf8').replace(/\{\{(\w+)\}\}/g, (_, key) => {
    if (!(key in values)) throw new Error('Missing ' + key + ' in ' + name);
    return values[key];
  });
}

const escaped = object => Object.fromEntries(
  Object.entries(object)
    .filter(([, value]) => typeof value === 'string')
    .map(([key, value]) => [key, escapeHtml(value)])
);

const tags = values => values.map(value => '<li>' + escapeHtml(value) + '</li>').join('');
const paragraphs = items => items.map(text => '<p>' + escapeHtml(text) + '</p>').join('');

export function render(site) {
  const linkedIn = new URL(site.linkedin);
  const siteUrl = new URL(site.siteUrl);

  if (linkedIn.protocol !== 'https:' || linkedIn.hostname !== 'www.linkedin.com') {
    throw new Error('Invalid LinkedIn URL');
  }
  if (siteUrl.protocol !== 'https:') throw new Error('siteUrl must use HTTPS');

  const base = {
    ...escaped(site),
    siteUrl: escapeHtml(siteUrl.origin),
    year: new Date().getFullYear()
  };

  const expertiseCards = site.expertise.map(item =>
    template('cards/expertise', {
      ...escaped(item),
      tools: tags(item.tools)
    })
  ).join('\n');

  const experienceCards = site.experience.map(item =>
    template('cards/experience', {
      ...escaped(item),
      tools: tags(item.tools),
      points: tags(item.points),
      toolData: escapeHtml(item.tools.join('|')),
      experienceId: escapeHtml(item.id),
      currentBadge: item.current ? '<span class="current-badge">Current</span>' : ''
    })
  ).join('\n');

  const educationCards = site.education.map(item =>
    template('cards/education', escaped(item))
  ).join('\n');

  const certificationCards = site.certifications.map(item => {
    const url = new URL(item.credentialUrl);
    if (url.protocol !== 'https:' || !['www.credly.com', 'skillsoft.digitalbadges.skillsoft.com'].includes(url.hostname)) {
      throw new Error('Invalid credential URL');
    }
    if (!/^\/assets\/credentials\/[a-z0-9-]+\.png$/.test(item.image)) {
      throw new Error('Invalid credential image');
    }
    return template('cards/certification', escaped(item));
  }).join('\n');

  const structuredData = JSON.stringify({
    '@context': 'https://schema.org',
    '@type': 'ProfilePage',
    '@id': siteUrl.origin + '/#profile',
    url: siteUrl.origin + '/',
    name: site.name + ' — Professional CV',
    inLanguage: 'en',
    mainEntity: {
      '@type': 'Person',
      '@id': siteUrl.origin + '/#person',
      name: site.name,
      url: siteUrl.origin + '/',
      sameAs: [site.linkedin],
      jobTitle: site.title.split(' | '),
      description: site.intro,
      worksFor: {
        '@type': 'Organization',
        name: site.experience.find(item => item.current)?.company || ''
      },
      knowsAbout: [...new Set(site.expertise.flatMap(item => [item.title, ...item.tools]))]
    }
  }).replace(/</g, '\\u003c');

  const engineeringItems = site.engineering.map(item =>
    '<div class="engineering-stat"><dt>' + escapeHtml(item.label) + '</dt><dd>' + escapeHtml(item.value) + '</dd></div>'
  ).join('');

  const values = {
    ...base,
    aboutContent: paragraphs(site.about),
    expertiseCards,
    experienceCards,
    educationCards,
    certificationCards,
    engineeringItems
  };

  const sections = Object.fromEntries(
    ['hero', 'profile', 'experience', 'education'].map(name => [
      name,
      template('sections/' + name, values)
    ])
  );

  return template('layout', {
    ...values,
    ...sections,
    structuredData,
    header: template('shared/header', values),
    footer: template('shared/footer', values)
  });
}
