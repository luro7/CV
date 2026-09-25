import { readFileSync } from 'node:fs';
import { localizeHtml } from '../scripts/localize.mjs';

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

const localizedObject = (object, t) => Object.fromEntries(
  Object.entries(object)
    .filter(([, value]) => typeof value === 'string')
    .map(([key, value]) => [key, escapeHtml(t(value))])
);

const tags = (values, t) => values.map(value => '<li>' + escapeHtml(t(value)) + '</li>').join('');
const paragraphs = (items, t) => items.map(text => '<p>' + escapeHtml(t(text)) + '</p>').join('');
const screenshotsFor = item => {
  const screenshots = item.screenshots || [];
  for (const shot of screenshots) {
    if (!/^\/assets\/projects\/[a-z0-9-]+\.png$/.test(shot.image || '')) throw new Error('Invalid project screenshot: ' + item.name);
    if (shot.orientation && shot.orientation !== 'portrait') throw new Error('Invalid project screenshot orientation: ' + item.name);
  }
  return screenshots;
};
export function render(site, { language = 'en', translations = {} } = {}) {
  const linkedIn = new URL(site.linkedin);
  const siteUrl = new URL(site.siteUrl);
  const spanish = language === 'es';
  const t = value => spanish ? (translations[value] || value) : value;

  if (linkedIn.protocol !== 'https:' || linkedIn.hostname !== 'www.linkedin.com') {
    throw new Error('Invalid LinkedIn URL');
  }
  if (siteUrl.protocol !== 'https:') throw new Error('siteUrl must use HTTPS');
  if (!/^\/assets\/[a-z0-9-]+\.png$/.test(site.cvPortrait || '')) {
    throw new Error('Invalid CV portrait path');
  }

  const pagePath = spanish ? '/es/' : '/';
  const pageUrl = siteUrl.origin + pagePath;
  const pageTitle = spanish
    ? 'Lucas Rosat - Ingeniería de Datos y Automatización con IA'
    : 'Lucas Rosat — Data Engineering & AI Automation';
  const pageDescription = spanish
    ? (translations[site.description] || site.description)
    : site.description;

  const base = {
    ...escaped(site),
    htmlLang: language,
    siteUrl: escapeHtml(siteUrl.origin),
    pageUrl: escapeHtml(pageUrl),
    canonicalUrl: escapeHtml(pageUrl),
    pageTitle: escapeHtml(pageTitle),
    pageDescription: escapeHtml(pageDescription),
    ogLocale: spanish ? 'es_AR' : 'en_US',
    currentLanguage: spanish ? 'ES' : 'EN',
    nextLanguage: spanish ? 'EN' : 'ES',
    languageTarget: spanish ? '/' : '/es/',
    languageLabel: spanish ? 'Switch to English' : 'Cambiar a español',
    year: new Date().getFullYear()
  };

  const experienceCards = site.experience.map(item =>
    template('cards/experience', {
      ...localizedObject(item, t),
      tools: tags(item.tools, t),
      points: tags(item.points, t),
      toolData: escapeHtml(item.tools.join('|')),
      experienceId: escapeHtml(item.id),
      currentBadge: item.current ? '<span class="current-badge">' + escapeHtml(t('Current')) + '</span>' : ''
    })
  ).join('\n');

  const educationCards = site.education.map(item =>
    template('cards/education', localizedObject(item, t))
  ).join('\n');

  const certificationCards = site.certifications.map(item => {
    const url = new URL(item.credentialUrl);
    if (url.protocol !== 'https:' || !['www.credly.com', 'skillsoft.digitalbadges.skillsoft.com'].includes(url.hostname)) {
      throw new Error('Invalid credential URL');
    }
    let credentialArt;
    if (item.image) {
      if (!/^\/assets\/credentials\/[a-z0-9-]+\.png$/.test(item.image)) throw new Error('Invalid credential image');
      credentialArt = '<div class="credential-art"><img src="' + escapeHtml(item.image) + '" alt="" width="400" height="400" loading="lazy" decoding="async"></div>';
    } else {
      if (!/^[A-Za-z0-9]{2,8}$/.test(item.badgeLabel || '')) throw new Error('Invalid credential badge label');
      credentialArt = '<div class="credential-art credential-art-label" aria-hidden="true"><span>' + escapeHtml(item.badgeLabel) + '</span></div>';
    }
    return template('cards/certification', {
      ...localizedObject(item, t),
      credentialArt
    });
  }).join('\n');

  const printExpertise = site.expertise.map(item => template('print/skill-group', {
    title: escapeHtml(t(item.title)),
    tools: item.tools.map(tool => escapeHtml(t(tool))).join(', ')
  })).join('\n');

  const printExperience = site.experience.map(item => template('print/experience', {
    company: escapeHtml(t(item.company)),
    role: escapeHtml(t(item.role)),
    date: escapeHtml(t(item.date)),
    points: item.points.map(point => '<li>' + escapeHtml(t(point)) + '</li>').join('')
  })).join('\n');

  const printEducation = site.education.map(item => template('print/education', localizedObject(item, t))).join('\n');
  const printCertifications = site.certifications.map(item => template('print/certification', localizedObject(item, t))).join('\n');
  const printLanguages = site.languages.map(item => template('print/language', {
    name: escapeHtml(t(item.name)),
    level: escapeHtml(t(item.level))
  })).join('\n');

  const projectCards = site.projects.map(item => {
    const category = item.category || 'web';
    if (!['web', 'android', 'windows'].includes(category)) throw new Error('Invalid project category: ' + item.name);
    if (!/^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(item.slug || '')) throw new Error('Invalid project slug: ' + item.name);
    const shot = screenshotsFor(item)[0];
    const screenshot = shot
      ? '<span class="project-card-cover"><img src="' + escapeHtml(shot.image) + '" alt="" loading="lazy" decoding="async"></span>'
      : '<span class="project-card-cover project-preview-pending" role="img" aria-label="' + escapeHtml(t('Screenshot capture pending')) + '"><span>' + escapeHtml(t('Screenshot capture pending')) + '</span></span>';
    return template('cards/project', {
      category,
      slug: escapeHtml(item.slug),
      screenshot,
      openProjectLabel: escapeHtml(t('Open project gallery')),
      name: escapeHtml(t(item.name)),
      description: escapeHtml(t(item.description)),
      technologies: escapeHtml(item.technologies)
    });
  }).join('\n');

  const projectDialogs = site.projects.map(item => {
    const category = item.category || 'web';
    if (!['web', 'android', 'windows'].includes(category)) throw new Error('Invalid project category: ' + item.name);
    const projectShots = screenshotsFor(item);
    const screenshots = projectShots.length
      ? '<section class="project-gallery" data-project-gallery data-slide-count="' + projectShots.length + '" role="region" aria-roledescription="carousel" aria-label="' + escapeHtml(t('Project image gallery')) + '">' +
        '<div class="project-gallery-main swiper" data-gallery-main tabindex="0" aria-label="' + escapeHtml(t('Drag with the left mouse button or swipe to browse images. Use the arrow keys while focused.')) + '">' +
          '<div class="swiper-wrapper">' + projectShots.map(shot =>
            '<figure class="project-gallery-slide swiper-slide"><img src="' + escapeHtml(shot.image) + '" alt="' + escapeHtml(t(shot.alt || item.name)) + '" loading="lazy" decoding="async" draggable="false"><figcaption>' + escapeHtml(t(shot.caption || item.name)) + '</figcaption></figure>'
          ).join('\n') + '</div>' +
          '<button class="project-gallery-arrow project-gallery-prev" type="button" data-gallery-prev aria-label="' + escapeHtml(t('Previous image')) + '"><span aria-hidden="true">←</span></button>' +
          '<button class="project-gallery-arrow project-gallery-next" type="button" data-gallery-next aria-label="' + escapeHtml(t('Next image')) + '"><span aria-hidden="true">→</span></button>' +
        '</div>' +
        '<div class="project-gallery-controls"><p class="project-gallery-instructions">' + escapeHtml(t('Drag with the left mouse button or swipe to browse images.')) + '</p><p class="project-gallery-count" data-gallery-count aria-live="polite">1 / ' + projectShots.length + '</p></div>' +
        '<div class="project-gallery-thumbs swiper' + (projectShots.length < 2 ? ' is-single-image' : '') + '" data-gallery-thumbs role="group" aria-label="' + escapeHtml(t('Choose an image')) + '"><div class="swiper-wrapper">' +
          projectShots.map((shot, index) => '<button class="project-gallery-thumb swiper-slide" type="button" aria-label="' + escapeHtml(t('Show image') + ' ' + (index + 1) + ': ' + t(shot.caption || item.name)) + '"><img src="' + escapeHtml(shot.image) + '" alt="" loading="lazy" decoding="async"></button>').join('') +
        '</div></div></section>'
      : '<p class="project-gallery-empty">' + escapeHtml(t('Screenshots for this project are being prepared.')) + '</p>';
    const projectLink = item.url
      ? '<a class="project-dialog-live-link" href="' + escapeHtml(item.url) + '" target="_blank" rel="noopener noreferrer">' + escapeHtml(t(item.urlLabel || 'Live website')) + '<span aria-hidden="true"> ↗</span></a>'
      : '';
    const screenshotsNote = item.screenshotsNote
      ? '<p class="project-detail-note">' + escapeHtml(t(item.screenshotsNote)) + '</p>'
      : '';
    return template('shared/project-dialog', {
      slug: escapeHtml(item.slug),
      categoryLabel: escapeHtml(t(category === 'windows' ? 'Windows application' : category === 'android' ? 'Android application' : 'Web application')),
      galleryEyebrow: escapeHtml(t('Project screenshots')),
      projectName: escapeHtml(t(item.name)),
      projectDescription: escapeHtml(t(item.description)),
      technologiesLabel: escapeHtml(t('Technologies')),
      technologies: escapeHtml(item.technologies),
      screenshotsNote,
      screenshots,
      projectLink,
      closeLabel: escapeHtml(t('Close gallery'))
    });
  }).join('\n');

  const printProjects = site.projects.map(item => template('print/project', {
    name: escapeHtml(t(item.name)),
    description: escapeHtml(t(item.description)),
    technologies: escapeHtml(item.technologies)
  })).join('\n');

  const structuredData = JSON.stringify({
    '@context': 'https://schema.org',
    '@type': 'ProfilePage',
    '@id': pageUrl + '#profile',
    url: pageUrl,
    name: pageTitle,
    inLanguage: language,
    mainEntity: {
      '@type': 'Person',
      '@id': siteUrl.origin + '/#person',
      name: site.name,
      url: siteUrl.origin + '/',
      sameAs: [site.linkedin],
      jobTitle: site.title.split(' | ').map(t),
      description: t(site.intro),
      worksFor: {
        '@type': 'Organization',
        name: site.experience.find(item => item.current)?.company || ''
      },
      knowsAbout: [...new Set(site.expertise.flatMap(item => [t(item.title), ...item.tools.map(t)]))]
    }
  }).replace(/</g, '\\u003c');

  const engineeringItems = site.engineering.map(item =>
    '<div class="engineering-stat"><dt>' + escapeHtml(t(item.label)) + '</dt><dd>' + escapeHtml(t(item.value)) + '</dd></div>'
  ).join('');

  const heroSummary = [site.intro, site.about.at(-1)];
  const heroDetails = site.about.slice(1, -1);
  const heroFocus = ['Data Engineering', 'AI Automation', 'Reporting & Operations'];

  const values = {
    ...base,
    heroSummaryContent: paragraphs(heroSummary, t),
    aboutDetailContent: paragraphs(heroDetails, t),
    heroFocus: tags(heroFocus, t),
    experienceCards,
    educationCards,
    certificationCards,
    engineeringItems,
    printCv: template('print/cv', {
      portraitUrl: escapeHtml(site.cvPortrait),
      name: escapeHtml(site.name),
      headline: escapeHtml(site.title.split(' | ').map(t).join(' | ')),
      linkedin: escapeHtml(site.linkedin.replace(/^https:\/\/(www\.)?/, '')),
      linkedinUrl: escapeHtml(site.linkedin),
      summary: paragraphs([site.intro], t),
      printExpertise,
      printExperience,
      projectsIntro: escapeHtml(t(site.projectsIntro)),
      printProjects,
      printEducation,
      printCertifications,
      printLanguages
    }),
    projectCards,
    projectDialogs,
    projectsIntro: escapeHtml(t(site.projectsIntro)),
    projectGalleryLabel: escapeHtml(t('View project gallery')),
    experienceCount: String(site.experience.length),
    expertiseCount: String(new Set(site.expertise.flatMap(item => item.tools)).size),
    certificationCount: String(site.certifications.length)
  };

  const sections = Object.fromEntries(
    ['hero', 'profile', 'experience', 'projects', 'education'].map(name => [
      name,
      template('sections/' + name, values)
    ])
  );

  let html = template('layout', {
    ...values,
    ...sections,
    structuredData,
    header: template('shared/header', values),
    footer: template('shared/footer', values)
  });

  if (spanish) html = localizeHtml(html, translations);
  return html;
}
