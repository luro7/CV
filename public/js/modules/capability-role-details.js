import siteData from '../site-data.js';
import translations from '../translations.js';

const root = document.documentElement;
const tr = text => root.lang === 'es' ? (translations[text] || text) : text;

const roleLabel = item => {
  const company = item.querySelector('.company')?.textContent.trim() || '';
  const roleNode = item.querySelector('.experience-role');
  const role = roleNode?.childNodes[0]?.textContent?.trim() || roleNode?.textContent.trim() || '';
  return [company, role].filter(Boolean).join(' · ');
};

const matchesExperience = (skill, item) => {
  const normalized = skill.toLowerCase();
  const tools = (item.dataset.tools || '').toLowerCase().split('|').filter(Boolean);
  const linkedRoleIds = new Set(siteData.skillRoleIds?.[skill] || []);
  return tools.includes(normalized) || linkedRoleIds.has(item.dataset.experienceId);
};

export function initCapabilityRoleDetails() {
  const map = document.querySelector('[data-skill-map]');
  const status = document.querySelector('[data-skill-status]');
  const experienceItems = [...document.querySelectorAll('.experience-item')];
  if (!map || !status) return;

  let hoverSkill = null;
  let focusedSkill = null;
  let frame = 0;

  const render = skill => {
    if (!skill) return;
    const category = tr(siteData.skillTypes?.[skill] || 'Skill');
    const matches = experienceItems.filter(item => matchesExperience(skill, item));

    if (!matches.length) {
      status.textContent = tr(skill) + ' · ' + category;
      return;
    }

    const roles = matches.map(roleLabel).filter(Boolean);
    const count = matches.length;
    const prefix = root.lang === 'es'
      ? count + (count === 1 ? ' rol relacionado: ' : ' roles relacionados: ')
      : count + (count === 1 ? ' related role: ' : ' related roles: ');

    status.textContent = prefix + roles.join(' · ');
  };

  const refresh = () => {
    cancelAnimationFrame(frame);
    frame = requestAnimationFrame(() => {
      const skill = root.dataset.activeSkill || focusedSkill || hoverSkill;
      if (skill) render(skill);
    });
  };

  map.addEventListener('mouseover', event => {
    const node = event.target.closest?.('.capability-node');
    if (!node) return;
    hoverSkill = node.dataset.skill || null;
    refresh();
  });

  map.addEventListener('mouseout', event => {
    const node = event.target.closest?.('.capability-node');
    if (!node) return;
    if (event.relatedTarget && node.contains(event.relatedTarget)) return;
    hoverSkill = null;
    refresh();
  });

  map.addEventListener('focusin', event => {
    const node = event.target.closest?.('.capability-node');
    if (!node) return;
    focusedSkill = node.dataset.skill || null;
    refresh();
  });

  map.addEventListener('focusout', event => {
    const node = event.target.closest?.('.capability-node');
    if (!node) return;
    focusedSkill = null;
    refresh();
  });

  const observer = new MutationObserver(refresh);
  observer.observe(root, { attributes: true, attributeFilter: ['data-active-skill'] });
  addEventListener('cv:language', refresh);
}
