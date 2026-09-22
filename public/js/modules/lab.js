import siteData from '../site-data.js';
import translations from '../translations.js';

const root = document.documentElement;
const read = key => { try { return localStorage.getItem(key); } catch { return null; } };
const store = (key, value) => { try { localStorage.setItem(key, value); } catch {} };
const tr = text => root.lang === 'es' ? (translations[text] || text) : text;
const stageLabels = ['Data', 'Transform', 'Automate', 'AI', 'Report'];

function createSkillMap(container) {
  const experienceItems = [...document.querySelectorAll('.experience-item')];
  const status = document.querySelector('[data-skill-status]');
  const allSkills = new Set();
  let pinnedSkill = null;
  let activeSkill = null;

  const defaultStatus = () => {
    if (status) status.textContent = tr('Select a skill or technology to trace experience.');
  };

  const clearVisual = () => {
    delete root.dataset.activeSkill;
    activeSkill = null;
    experienceItems.forEach(item => item.classList.remove('skill-match', 'skill-muted'));
    container.querySelectorAll('[data-skill]').forEach(node => {
      node.classList.remove('is-active');
      node.setAttribute('aria-pressed', 'false');
    });
  };

  const clear = () => {
    pinnedSkill = null;
    clearVisual();
    defaultStatus();
  };

  const describeMatches = (skill, matches) => {
    if (!status) return;
    if (!matches.length) {
      status.textContent = root.lang === 'es'
        ? skill + ': sin roles vinculados en la experiencia publicada.'
        : skill + ': no linked roles in the published experience.';
      return;
    }

    const roles = matches.map(item => {
      const company = item.querySelector('.company')?.textContent.trim() || '';
      const role = item.querySelector('.experience-role')?.childNodes[0]?.textContent?.trim()
        || item.querySelector('.experience-role')?.textContent.trim()
        || '';
      return company + ' · ' + role;
    });

    const count = matches.length;
    const prefix = root.lang === 'es'
      ? skill + ' · ' + count + (count === 1 ? ' rol relacionado: ' : ' roles relacionados: ')
      : skill + ' · ' + count + (count === 1 ? ' related role: ' : ' related roles: ');

    status.textContent = prefix + roles.join(' · ');
  };

  const highlight = skill => {
    clearVisual();
    activeSkill = skill;
    root.dataset.activeSkill = skill;
    const normalized = skill.toLowerCase();
    const matches = [];

    experienceItems.forEach(item => {
      const tools = (item.dataset.tools || '').toLowerCase().split('|');
      const matched = tools.includes(normalized);
      item.classList.toggle('skill-match', matched);
      item.classList.toggle('skill-muted', !matched);
      if (matched) matches.push(item);
    });

    container.querySelectorAll('[data-skill]').forEach(node => {
      const active = node.dataset.skill === skill;
      node.classList.toggle('is-active', active);
      node.setAttribute('aria-pressed', String(active && pinnedSkill === skill));
    });

    describeMatches(skill, matches);
  };

  for (const group of siteData.expertise) {
    const cluster = document.createElement('section');
    cluster.className = 'skill-cluster';
    cluster.dataset.group = group.title;

    const hub = document.createElement('div');
    hub.className = 'skill-hub';
    hub.dataset.groupLabel = group.title;
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
      button.setAttribute('aria-pressed', 'false');
      button.textContent = tr(skill);

      button.addEventListener('mouseenter', () => {
        if (!pinnedSkill) highlight(skill);
      });
      button.addEventListener('focus', () => {
        if (!pinnedSkill) highlight(skill);
      });
      button.addEventListener('click', () => {
        if (pinnedSkill === skill) {
          clear();
          return;
        }
        pinnedSkill = skill;
        highlight(skill);
      });

      nodes.append(button);
    }

    cluster.append(nodes);
    container.append(cluster);
  }

  container.addEventListener('mouseleave', () => {
    if (pinnedSkill) highlight(pinnedSkill);
    else {
      clearVisual();
      defaultStatus();
    }
  });

  container.addEventListener('focusout', () => {
    requestAnimationFrame(() => {
      if (container.contains(document.activeElement)) return;
      if (pinnedSkill) highlight(pinnedSkill);
      else {
        clearVisual();
        defaultStatus();
      }
    });
  });

  addEventListener('keydown', event => {
    if (event.key === 'Escape' && activeSkill) clear();
  });

  const refreshLabels = () => {
    container.querySelectorAll('[data-group-label]').forEach(node => {
      node.textContent = tr(node.dataset.groupLabel);
    });
    container.querySelectorAll('[data-skill]').forEach(node => {
      node.textContent = tr(node.dataset.skill);
    });
    if (activeSkill) highlight(activeSkill);
    else defaultStatus();
  };

  defaultStatus();
  return { highlight, clear, refreshLabels, skills: [...allSkills] };
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
    if (target) {
      target.scrollIntoView({
        behavior: matchMedia('(prefers-reduced-motion: reduce)').matches ? 'auto' : 'smooth'
      });
    }
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
    group: siteData.skillTypes?.[skill] || 'Skill',
    keywords: skill + ' ' + (siteData.skillTypes?.[skill] || 'Skill'),
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

    const score = item => {
      if (!query) return item.group === 'Navigate' ? 30 : item.group === 'System' ? 20 : 10;
      const label = item.label.toLowerCase();
      const translated = tr(item.label).toLowerCase();
      const category = tr(item.group).toLowerCase();
      const haystack = [label, translated, item.group.toLowerCase(), category, item.keywords.toLowerCase()].join(' ');
      const parts = query.split(/\s+/).filter(Boolean);
      if (!parts.every(part => haystack.includes(part))) return -1;
      if (label === query || translated === query) return 100;
      if (label.startsWith(query) || translated.startsWith(query)) return 80;
      if (label.includes(query) || translated.includes(query)) return 60;
      if (category.includes(query)) return 40;
      return 20;
    };

    visible = source
      .map((item, index) => ({ item, index, score: score(item) }))
      .filter(entry => entry.score >= 0)
      .sort((a, b) => b.score - a.score || a.index - b.index)
      .slice(0, 9)
      .map(entry => entry.item);

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
    input.placeholder = tr('Type a skill, technology or action');
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
  const dock = document.querySelector('.pipeline-dock');
  const dockStages = [...document.querySelectorAll('.pipeline-dock-stage')];
  const dockFill = document.querySelector('.pipeline-dock-fill');
  const dockState = document.querySelector('[data-pipeline-state]');
  const hero = document.querySelector('.hero');
  const heroStages = [...document.querySelectorAll('.hero-pipeline span')];
  const timeline = document.querySelector('.timeline');
  let frame = 0;

  const update = () => {
    frame = 0;

    const pageRange = document.documentElement.scrollHeight - innerHeight;
    const pageProgress = Math.max(0, Math.min(1, pageRange > 0 ? scrollY / pageRange : 0));
    const pageStage = Math.min(4, Math.floor(pageProgress * 5));

    if (dockFill) dockFill.style.transform = 'scaleX(' + pageProgress + ')';
    dockStages.forEach((node, index) => {
      node.classList.toggle('is-active', index <= pageStage);
      node.classList.toggle('is-current', index === pageStage);
    });
    if (dockState) dockState.textContent = tr(stageLabels[pageStage]);

    if (hero) {
      const rect = hero.getBoundingClientRect();
      const heroRange = Math.max(1, rect.height - Math.min(innerHeight * 0.2, 160));
      const heroProgress = Math.max(0, Math.min(1, -rect.top / heroRange));
      const heroStage = Math.min(4, Math.floor(heroProgress * 5));

      hero.style.setProperty('--hero-pipeline-progress', heroProgress);
      heroStages.forEach((node, index) => {
        node.classList.toggle('is-active', index <= heroStage);
        node.classList.toggle('is-current', index === heroStage);
      });

      if (dock) {
        const visible = rect.bottom < 110 && pageProgress < 0.985;
        dock.classList.toggle('is-visible', visible);
      }
    }

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

  return update;
}

export function initLab() {
  const container = document.querySelector('[data-skill-map]');
  const skillApi = container
    ? createSkillMap(container)
    : { skills: [], highlight() {}, clear() {}, refreshLabels() {} };

  const toggleEngineering = initEngineering();
  initCommandPalette(skillApi, toggleEngineering);
  const refreshScrollSystems = initScrollSystems();

  addEventListener('cv:language', () => {
    skillApi.refreshLabels();
    refreshScrollSystems();
  });
}
