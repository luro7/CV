import { getProjectCaseStudy } from './project-showcase-model.js';

export function initProjectShowcase() {
  const language = document.documentElement.lang === 'es' ? 'es' : 'en';
  const labels = language === 'es'
    ? { problem: 'Problema', solution: 'Solución' }
    : { problem: 'Problem', solution: 'Solution' };

  document.querySelectorAll('.project-card[data-project-slug]').forEach(card => {
    const target = card.querySelector('[data-project-case]');
    if (!target) return;

    const study = getProjectCaseStudy(card.dataset.projectSlug, language);
    if (!study) {
      target.hidden = true;
      return;
    }

    target.replaceChildren();
    for (const [key, label] of Object.entries(labels)) {
      const block = document.createElement('div');
      block.className = 'project-case-block';

      const heading = document.createElement('span');
      heading.className = 'project-case-label';
      heading.textContent = label;

      const copy = document.createElement('p');
      copy.textContent = study[key];

      block.append(heading, copy);
      target.append(block);
    }
  });
}
