import siteData from '../site-data.js';
import translations from '../translations.js';

const root = document.documentElement;
const read = key => { try { return localStorage.getItem(key); } catch { return null; } };
const store = (key, value) => { try { localStorage.setItem(key, value); } catch {} };
const tr = text => root.lang === 'es' ? (translations[text] || text) : text;

function createSkillMap(container) {
  const experienceItems = [...document.querySelectorAll('.experience-item')];
  const allSkills = new Set();

  const clear = () => {
    delete root.dataset.activeSkill;
    experienceItems.forEach(item => item.classList.remove('skill-match', 'skill-muted'));
    container.querySelectorAll('[data-skill]').forEach(node => node.classList.remove('is-active'));
  };

  const highlight = skill => {
    clear();
    root.dataset.activeSkill = skill;
    const normalized = skill.toLowerCase();
    experienceItems.forEach(item => {
      const tools = (item.dataset.tools || '').toLowerCase().split('|');
      const matched = tools.includes(normalized);
      item.classList.toggle('skill-match', matched);
      item.classList.toggle('skill-muted', !matched);
    });
    container.querySelectorAll('[data-skill]').forEach(node => {
      node.classList.toggle('is-active', node.dataset.skill === skill);
    });
  };

  for (const group of siteData.expertise) {
    const cluster = document.createElement('section');
    cluster.className = 'skill-cluster';

    const hub = document.createElement('div');
    hub.className = 'skill-hub';
    hub.textContent = tr(group.title);
    cluster.append(hub);

    const nodes = document.createElement('div');
    nodes.className = 'skill-nodes';

    for (const skill of group.tools.slice(0, 7)) {
      allSkills.add(skill);
      const button = document.createElement('button');
      button.type = 'button';
      button.className = 'skill-node';
      button.dataset.skill = skill;
      button.textContent = tr(skill);
      button.addEventListener('mouseenter', () => highlight(skill));
      button.addEventListener('focus', () => highlight(skill));
      button.addEventListener('click', () => {
        const active = root.dataset.activeSkill === skill;
        if (active) clear();
        else highlight(skill);
      });
      nodes.append(button);
    }

    cluster.append(nodes);
    container.append(cluster);
  }

  container.addEventListener('mouseleave', () => clear());
  addEventListener('keydown', event => {
    if (event.key === 'Escape' && root.dataset.activeSkill) clear();
  });

  return { highlight, clear, skills: [...allSkills] };
}

function initEngineering() {
  const toggle = document.querySelector('.engineering-toggle');
  const panel = document.querySelector('.engineering-panel');
  const close = document.querySelector('[data-engineering-close]');
  if (!toggle || !panel) return () => {};

  const set = enabled => {
    root.classList.toggle('engineering-mode', enabled);
    toggle.setAttribute('aria-pressed', String(enabled));
    panel.setAttribute('aria-hidden', String(!enabled));
    store('cv-engineering', enabled ? '1' : '0');
  };

  toggle.addEventListener('click', () => set(!root.classList.contains('engineering-mode')));
  if (close) close.addEventListener('click', () => set(false));
  if (read('cv-engineering') === '1') set(true);

  return () => set(!root.classList.contains('engineering-mode'));
}

function initCommandPalette(skillApi, toggleEngineering) {
  const dialog = document.querySelector('#command-palette');
  const input = document.querySelector('#command-input');
  const results = document.querySelector('#command-results');
  const triggers = [...document.querySelectorAll('[data-command-open]')];
  if (!dialog || !input || !results) return;

  const go = selector => {
    dialog.close();
    const target = document.querySelector(selector);
    if (target) target.scrollIntoView({ behavior: matchMedia('(prefers-reduced-motion: reduce)').matches ? 'auto' : 'smooth' });
  };

  const actions = [
    { label: 'Go to introduction', group: 'Navigate', keywords: 'home intro profile', run: () => go('#home') },
    { label: 'Go to expertise', group: 'Navigate', keywords: 'skills technology sql ai data', run: () => go('#expertise') },
    { label: 'Go to experience', group: 'Navigate', keywords: 'jobs work accenture', run: () => go('#experience') },
    { label: 'Go to education', group: 'Navigate', keywords: 'education certifications languages', run: () => go('#education') },
    { label: 'Toggle dark mode', group: 'System', keywords: 'theme light dark', run: () => { dialog.close(); document.querySelector('.theme-toggle')?.click(); } },
    { label: 'Toggle engineering mode', group: 'System', keywords: 'engineering technical system code', run: () => { dialog.close(); toggleEngineering(); } },
    { label: 'Open LinkedIn', group: 'System', keywords: 'linkedin contact profile', run: () => { dialog.close(); open(siteData.linkedin, '_blank', 'noopener,noreferrer'); } }
  ];

  const skillEntries = skillApi.skills.map(skill => ({
    label: skill,
    group: 'Technology',
    keywords: skill,
    run: () => {
      dialog.close();
      go('#expertise');
      setTimeout(() => skillApi.highlight(skill), 420);
    }
  }));

  let visible = [];

  const render = () => {
    const query = input.value.trim().toLowerCase();
    const source = [...actions, ...skillEntries];
    visible = source.filter(item => {
      const haystack = [item.label, tr(item.label), item.group, item.keywords].join(' ').toLowerCase();
      return !query || query.split(/\s+/).every(part => haystack.includes(part));
    }).slice(0, 9);

    results.replaceChildren();
    visible.forEach(item => {
      const button = document.createElement('button');
      button.type = 'button';
      button.className = 'command-result';
      button.setAttribute('role', 'option');

      const label = document.createElement('span');
      label.textContent = tr(item.label);
      const group = document.createElement('small');
      group.textContent = tr(item.group);

      button.append(label, group);
      button.addEventListener('click', item.run);
      results.append(button);
    });
  };

  const openPalette = () => {
    if (!dialog.open) dialog.showModal();
    input.value = '';
    input.placeholder = tr('Type a skill or action');
    dialog.querySelector('label').textContent = tr('Search the CV');
    render();
    requestAnimationFrame(() => input.focus());
  };

  triggers.forEach(trigger => trigger.addEventListener('click', openPalette));
  input.addEventListener('input', render);
  dialog.addEventListener('click', event => {
    if (event.target === dialog) dialog.close();
  });
  dialog.addEventListener('keydown', event => {
    if (event.key === 'Enter' && document.activeElement === input && visible[0]) {
      event.preventDefault();
      visible[0].run();
    }
    if (event.key === 'ArrowDown') {
      event.preventDefault();
      results.querySelector('button')?.focus();
    }
  });
  results.addEventListener('keydown', event => {
    const buttons = [...results.querySelectorAll('button')];
    const index = buttons.indexOf(document.activeElement);
    if (event.key === 'ArrowDown') {
      event.preventDefault();
      buttons[(index + 1) % buttons.length]?.focus();
    }
    if (event.key === 'ArrowUp') {
      event.preventDefault();
      if (index <= 0) input.focus();
      else buttons[index - 1]?.focus();
    }
  });

  addEventListener('keydown', event => {
    if ((event.ctrlKey || event.metaKey) && event.key.toLowerCase() === 'k') {
      event.preventDefault();
      if (dialog.open) dialog.close();
      else openPalette();
    }
  });
  addEventListener('cv:language', render);
}

function initScrollSystems() {
  const stages = [...document.querySelectorAll('.pipeline-rail-node')];
  const heroStages = [...document.querySelectorAll('.hero-pipeline span')];
  const fill = document.querySelector('.pipeline-rail-fill');
  const timeline = document.querySelector('.timeline');
  let frame = 0;

  const update = () => {
    frame = 0;
    const range = document.documentElement.scrollHeight - innerHeight;
    const page = Math.max(0, Math.min(1, range > 0 ? scrollY / range : 0));
    const stage = Math.min(4, Math.floor(page * 5));
    if (fill) fill.style.transform = 'scaleY(' + page + ')';
    stages.forEach((node, index) => node.classList.toggle('is-active', index <= stage));
    heroStages.forEach((node, index) => node.classList.toggle('is-active', index <= stage));

    if (timeline) {
      const rect = timeline.getBoundingClientRect();
      const start = innerHeight * 0.75;
      const distance = rect.height + innerHeight * 0.5;
      const progress = Math.max(0, Math.min(1, (start - rect.top) / distance));
      timeline.style.setProperty('--timeline-progress', progress);
    }
  };

  const schedule = () => {
    if (!frame) frame = requestAnimationFrame(update);
  };

  addEventListener('scroll', schedule, { passive: true });
  addEventListener('resize', schedule);
  update();
}

export function initLab() {
  const container = document.querySelector('[data-skill-map]');
  const skillApi = container ? createSkillMap(container) : { skills: [], highlight() {}, clear() {} };
  const toggleEngineering = initEngineering();
  initCommandPalette(skillApi, toggleEngineering);
  initScrollSystems();

  addEventListener('cv:language', () => {
    if (!container) return;
    container.replaceChildren();
    createSkillMap(container);
  });
}
