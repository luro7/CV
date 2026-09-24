import siteData from '../site-data.js';
import translations from '../translations.js';
import { progressToStage, rankCommandItems, skillMatchesExperience } from './interaction-model.js';

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
    const category = tr(siteData.skillTypes?.[skill] || 'Skill');

    if (!matches.length) {
      status.textContent = skill + ' · ' + category;
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
      ? skill + ' · ' + category + ' · ' + count + (count === 1 ? ' rol relacionado: ' : ' roles relacionados: ')
      : skill + ' · ' + category + ' · ' + count + (count === 1 ? ' related role: ' : ' related roles: ');

    status.textContent = prefix + roles.join(' · ');
  };

  const highlight = skill => {
    clearVisual();
    activeSkill = skill;
    root.dataset.activeSkill = skill;
    const matches = experienceItems.filter(item =>
      skillMatchesExperience(skill, item.dataset.tools, item.dataset.experienceId, siteData.skillRoleIds)
    );

    experienceItems.forEach(item => {
      const matched = matches.includes(item);
      item.classList.toggle('skill-match', matched);
      item.classList.toggle('skill-muted', matches.length > 0 && !matched);
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

    const hub = document.createElement('div');
    hub.className = 'skill-hub';
    hub.textContent = tr(group.title);
    cluster.append(hub);

    const nodes = document.createElement('div');
    nodes.className = 'skill-nodes';

    for (const skill of group.tools) {
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
        if (pinnedSkill === skill) clear();
        else {
          pinnedSkill = skill;
          highlight(skill);
        }
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

  defaultStatus();
  return { highlight, clear, skills: [...allSkills] };
}

function initEngineering() {
  const toggle = document.querySelector('.engineering-toggle');
  const panel = document.querySelector('.engineering-panel');
  const close = document.querySelector('[data-engineering-close]');
  const current = document.querySelector('[data-engineering-current]');
  const source = document.querySelector('[data-engineering-source]');
  const render = document.querySelector('[data-engineering-render]');
  const interaction = document.querySelector('[data-engineering-interaction]');

  if (!toggle || !panel) return () => {};

  const applySection = id => {
    const info = siteData.engineeringSections?.[id] || siteData.engineeringSections?.home;
    if (!info) return;
    if (current) current.textContent = tr(info.label);
    if (source) source.textContent = info.source;
    if (render) render.textContent = tr(info.render);
    if (interaction) interaction.textContent = tr(info.interaction);
  };

  const set = enabled => {
    root.classList.toggle('engineering-mode', enabled);
    toggle.setAttribute('aria-pressed', String(enabled));
    panel.setAttribute('aria-hidden', String(!enabled));
    panel.inert = !enabled;
    store('cv-engineering', enabled ? '1' : '0');
  };

  const togglePanel = () => {
    const enabled = !root.classList.contains('engineering-mode');
    set(enabled);
    (enabled ? close : toggle)?.focus();
  };
  toggle.addEventListener('click', togglePanel);
  close?.addEventListener('click', () => {
    set(false);
    toggle.focus();
  });
  panel.addEventListener('keydown', event => {
    if (event.key !== 'Escape') return;
    set(false);
    toggle.focus();
  });
  if (read('cv-engineering') === '1') set(true);

  if ('IntersectionObserver' in window) {
    const observer = new IntersectionObserver(entries => {
      const visible = entries
        .filter(entry => entry.isIntersecting)
        .sort((a, b) => b.intersectionRatio - a.intersectionRatio)[0];
      if (visible?.target?.id) applySection(visible.target.id);
    }, { rootMargin: '-20% 0px -55% 0px', threshold: [0.05, 0.2, 0.45] });

    document.querySelectorAll('main > section[id]').forEach(section => observer.observe(section));
  } else {
    applySection('home');
  }

  return togglePanel;
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
    target?.scrollIntoView({
      behavior: matchMedia('(prefers-reduced-motion: reduce)').matches ? 'auto' : 'smooth'
    });
  };

  const actions = [
    { label: 'Go to introduction', group: 'Navigate', keywords: 'home intro profile', run: () => go('#home') },
    { label: 'Go to expertise', group: 'Navigate', keywords: 'skills technology sql ai data', run: () => go('#expertise') },
    { label: 'Go to experience', group: 'Navigate', keywords: 'jobs work accenture', run: () => go('#experience') },
    { label: 'Go to education', group: 'Navigate', keywords: 'education certifications languages', run: () => go('#education') },
    { label: 'Toggle dark mode', group: 'System', keywords: 'theme light dark', run: () => { dialog.close(); document.querySelector('.theme-toggle')?.click(); } },
    { label: 'Toggle engineering mode', group: 'System', keywords: 'engineering technical system code', run: () => { dialog.close(); toggleEngineering(); } },
    { label: 'Switch language', group: 'System', keywords: 'english spanish español idioma language', run: () => { dialog.close(); document.querySelector('.language-toggle')?.click(); } },
    { label: 'Save PDF', group: 'System', keywords: 'pdf print download cv resume', run: () => { dialog.close(); print(); } },
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

  const renderResults = () => {
    visible = rankCommandItems([...actions, ...skillEntries], input.value, tr).slice(0, 9);
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
    renderResults();
    requestAnimationFrame(() => input.focus());
  };

  triggers.forEach(trigger => trigger.addEventListener('click', openPalette));
  input.addEventListener('input', renderResults);
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
    const pageStage = progressToStage(pageProgress);

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
      const heroStage = progressToStage(heroProgress);

      hero.style.setProperty('--hero-pipeline-progress', heroProgress);
      heroStages.forEach((node, index) => {
        node.classList.toggle('is-active', index <= heroStage);
        node.classList.toggle('is-current', index === heroStage);
      });

      if (dock) dock.classList.toggle('is-visible', rect.bottom < 110 && pageProgress < 0.985);
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
}

function initPrint() {
  const details = document.querySelector('.profile-details');
  let restoreClosed = false;
  let previousScrollY = 0;

  addEventListener('beforeprint', () => {
    previousScrollY = window.scrollY;
    window.scrollTo(0, 0);
    restoreClosed = Boolean(details && !details.open);
    if (details) details.open = true;
  });

  addEventListener('afterprint', () => {
    if (details && restoreClosed) details.open = false;
    restoreClosed = false;
    window.scrollTo(0, previousScrollY);
  });

  document.querySelectorAll('[data-print-cv]').forEach(button => {
    button.addEventListener('click', () => print());
  });
}

export function initLab() {
  const container = document.querySelector('[data-skill-map]');
  const skillApi = container ? createSkillMap(container) : { skills: [], highlight() {}, clear() {} };
  const toggleEngineering = initEngineering();
  initCommandPalette(skillApi, toggleEngineering);
  initScrollSystems();
  initPrint();
}
