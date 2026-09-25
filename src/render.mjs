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
const projectPath = (item, language) => {
  if (!/^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(item.slug || '')) throw new Error('Invalid project slug: ' + item.name);
  return (language === 'es' ? '/es/projects/' : '/projects/') + item.slug + '/';
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
    const shot = screenshotsFor(item)[0];
    const screenshot = shot
      ? '<span class="project-card-cover"><img src="' + escapeHtml(shot.image) + '" alt="' + escapeHtml(t(shot.alt || item.name)) + '" loading="lazy" decoding="async"></span>'
      : '<span class="project-card-cover project-preview-pending" role="img" aria-label="' + escapeHtml(t('Screenshot capture pending')) + '"><span>' + escapeHtml(t('Screenshot capture pending')) + '</span></span>';
    return template('cards/project', {
      category,
      slug: escapeHtml(item.slug),
      screenshot,
      projectUrl: escapeHtml(projectPath(item, language)),
      openProjectLabel: escapeHtml(t('Open project gallery')),
      name: escapeHtml(t(item.name)),
      description: escapeHtml(t(item.description)),
      technologies: escapeHtml(item.technologies)
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
    projectsIntro: escapeHtml(t(site.projectsIntro)),
    projectsUrl: spanish ? '/es/projects/' : '/projects/',
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

export function renderProjectGallery(site, { language = 'en', translations = {} } = {}) {
  const spanish = language === 'es';
  const t = value => spanish ? (translations[value] || value) : value;
  const siteUrl = new URL(site.siteUrl);
  const homeUrl = spanish ? '/es/' : '/';
  const galleryUrl = spanish ? '/es/projects/' : '/projects/';
  const otherGalleryUrl = spanish ? '/projects/' : '/es/projects/';
  const cards = site.projects.map(item => {
    const category = item.category || 'web';
    if (!['web', 'android', 'windows'].includes(category)) throw new Error('Invalid project category: ' + item.name);
    const shot = screenshotsFor(item)[0];
    const screenshot = shot
      ? '<span class="project-card-cover"><img src="' + escapeHtml(shot.image) + '" alt="' + escapeHtml(t(shot.alt || item.name)) + '" loading="lazy" decoding="async"></span>'
      : '<span class="project-card-cover project-preview-pending" role="img" aria-label="' + escapeHtml(t('Screenshot capture pending')) + '"><span>' + escapeHtml(t('Screenshot capture pending')) + '</span></span>';
    return template('cards/project', {
      category,
      slug: escapeHtml(item.slug),
      screenshot,
      projectUrl: escapeHtml(projectPath(item, language)),
      openProjectLabel: escapeHtml(t('Open project gallery')),
      name: escapeHtml(t(item.name)),
      description: escapeHtml(t(item.description)),
      technologies: escapeHtml(item.technologies)
    });
  }).join('\n');
  const title = spanish ? 'Proyectos con IA · Lucas Rosat' : 'AI-assisted projects · Lucas Rosat';
  const description = t(site.projectsIntro);
  const page = template('pages/projects', {
    htmlLang: language,
    title: escapeHtml(title),
    description: escapeHtml(description),
    canonicalUrl: escapeHtml(siteUrl.origin + galleryUrl),
    homeUrl,
    otherGalleryUrl,
    otherLanguage: spanish ? 'EN' : 'ES',
    pageHeading: escapeHtml(t('Projects in practice')),
    introLabel: escapeHtml(t('AI-assisted development')),
    projectsIntro: escapeHtml(description),
    backLabel: escapeHtml(t('Back to CV')),
    openProjectLabel: escapeHtml(t('Open project gallery')),
    allLabel: escapeHtml(t('All')),
    webLabel: escapeHtml(t('Web')),
    androidLabel: escapeHtml(t('Android')),
    windowsLabel: escapeHtml(t('Windows')),
    filtersLabel: escapeHtml(t('Filter projects')),
    lightboxClose: escapeHtml(t('Close image')),
    lightboxCaption: escapeHtml(t('Project screenshot')),
    footerLabel: escapeHtml(t('Independent projects with AI assistance')),
    projectCards: cards
  });
  return spanish ? localizeHtml(page, translations) : page;
}

export function renderProjectDetail(site, item, { language = 'en', translations = {} } = {}) {
  const spanish = language === 'es';
  const t = value => spanish ? (translations[value] || value) : value;
  const siteUrl = new URL(site.siteUrl);
  const galleryUrl = spanish ? '/es/projects/' : '/projects/';
  const currentPath = projectPath(item, language);
  const screenshots = screenshotsFor(item).map((shot, index) => {
    const image = escapeHtml(shot.image);
    const alt = escapeHtml(t(shot.alt || item.name));
    const caption = escapeHtml(t(shot.caption || item.name));
    return '<figure class="project-detail-shot' + (shot.orientation === 'portrait' ? ' is-portrait' : '') + '"><button class="project-detail-image" type="button" data-gallery-image data-image-src="' + image + '" data-image-alt="' + alt + '" data-image-caption="' + caption + '" aria-label="' + escapeHtml(t('Enlarge project screenshot')) + '"><img src="' + image + '" alt="' + alt + '" loading="' + (index < 2 ? 'eager' : 'lazy') + '" decoding="async"><span class="preview-hint" aria-hidden="true">↗</span></button><figcaption>' + caption + '</figcaption></figure>';
  }).join('\n') || '<p class="project-gallery-empty">' + escapeHtml(t('Screenshots for this project are being prepared.')) + '</p>';
  let externalLink = '';
  if (item.url) {
    const url = new URL(item.url);
    if (url.protocol !== 'https:' || url.hostname !== 'manosalaobra.pages.dev') throw new Error('Invalid project URL');
    externalLink = '<a class="project-detail-live-link" href="' + escapeHtml(url.href) + '" target="_blank" rel="noopener noreferrer">' + escapeHtml(t(item.urlLabel || 'Live website')) + ' ↗</a>';
  }
  const screenshotsNote = item.screenshotsNote
    ? '<p class="project-detail-note">' + escapeHtml(t(item.screenshotsNote)) + '</p>'
    : '';
  const title = t(item.name) + ' · ' + (spanish ? 'Proyectos' : 'Projects') + ' · Lucas Rosat';
  const page = template('pages/project', {
    htmlLang: language,
    title: escapeHtml(title),
    description: escapeHtml(t(item.description)),
    canonicalUrl: escapeHtml(siteUrl.origin + currentPath),
    englishUrl: escapeHtml(siteUrl.origin + projectPath(item, 'en')),
    spanishUrl: escapeHtml(siteUrl.origin + projectPath(item, 'es')),
    homeUrl: spanish ? '/es/' : '/',
    galleryUrl,
    otherLanguageUrl: projectPath(item, spanish ? 'en' : 'es'),
    otherLanguage: spanish ? 'EN' : 'ES',
    pageNavigationLabel: escapeHtml(t('Project navigation')),
    allProjectsLabel: escapeHtml(t('All projects')),
    categoryLabel: escapeHtml(t(item.category === 'windows' ? 'Windows application' : item.category === 'android' ? 'Android application' : 'Web application')),
    projectName: escapeHtml(t(item.name)),
    projectDescription: escapeHtml(t(item.description)),
    technologiesLabel: escapeHtml(t('Technologies')),
    technologies: escapeHtml(item.technologies),
    screenshotsNote,
    externalLink,
    galleryEyebrow: escapeHtml(t('Application screens')),
    galleryTitle: escapeHtml(t('Explore the interface')),
    screenshots,
    footerLabel: escapeHtml(t('Independent projects with AI assistance')),
    lightboxClose: escapeHtml(t('Close image')),
    lightboxCaption: escapeHtml(t('Project screenshot'))
  });
  return spanish ? localizeHtml(page, translations) : page;
}
