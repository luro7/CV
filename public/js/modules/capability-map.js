import siteData from '../site-data.js';
import translations from '../translations.js';
import { buildCapabilityModel, skillMatchesExperience } from './interaction-model.js';

const root = document.documentElement;
const tr = text => root.lang === 'es' ? (translations[text] || text) : text;
const mobileQuery = matchMedia('(max-width: 820px)');
const svgNs = 'http://www.w3.org/2000/svg';

const clamp = (value, min, max) => Math.max(min, Math.min(max, value));
const centerOf = (element, containerRect) => {
  const rect = element.getBoundingClientRect();
  return {
    x: rect.left - containerRect.left + rect.width / 2,
    y: rect.top - containerRect.top + rect.height / 2
  };
};

function layoutGroupNodes(nodes, anchor, width, height, groupIndex) {
  const ordered = [...nodes].sort((a, b) => b.importance - a.importance || a.order - b.order);
  const innerCount = Math.min(5, ordered.length);
  const innerRx = Math.min(118, width * 0.095);
  const innerRy = 108;
  const outerRx = Math.min(168, width * 0.132);
  const outerRy = 176;
  const rotation = [-0.26, 0.12, -0.1][groupIndex] || 0;

  return ordered.map((node, index) => {
    const outer = index >= innerCount;
    const ringIndex = outer ? index - innerCount : index;
    const ringCount = outer ? ordered.length - innerCount : innerCount;
    const angle = rotation + (Math.PI * 2 * ringIndex) / Math.max(1, ringCount) - Math.PI / 2;
    const rx = outer ? outerRx : innerRx;
    const ry = outer ? outerRy : innerRy;
    const targetX = anchor.x + Math.cos(angle) * rx;
    const targetY = anchor.y + Math.sin(angle) * ry;
    const estimatedWidth = clamp(74 + node.skill.length * 4.3, 92, node.importance === 3 ? 172 : 154);
    const estimatedHeight = node.skill.length > 24 ? 52 : 38;
    return {
      ...node,
      x: targetX,
      y: targetY,
      targetX,
      targetY,
      width: estimatedWidth,
      height: estimatedHeight
    };
  });
}

function relaxLayout(items, width, height) {
  const nodes = items.map(item => ({ ...item }));
  for (let iteration = 0; iteration < 72; iteration += 1) {
    for (const node of nodes) {
      node.x += (node.targetX - node.x) * 0.035;
      node.y += (node.targetY - node.y) * 0.035;
    }

    for (let i = 0; i < nodes.length; i += 1) {
      for (let j = i + 1; j < nodes.length; j += 1) {
        const a = nodes[i];
        const b = nodes[j];
        const minX = (a.width + b.width) / 2 + 10;
        const minY = (a.height + b.height) / 2 + 8;
        const dx = b.x - a.x || 0.01;
        const dy = b.y - a.y || 0.01;
        const overlapX = minX - Math.abs(dx);
        const overlapY = minY - Math.abs(dy);
        if (overlapX <= 0 || overlapY <= 0) continue;

        if (overlapX < overlapY) {
          const push = overlapX * 0.52 * Math.sign(dx);
          a.x -= push;
          b.x += push;
        } else {
          const push = overlapY * 0.52 * Math.sign(dy);
          a.y -= push;
          b.y += push;
        }
      }
    }

    for (const node of nodes) {
      node.x = clamp(node.x, node.width / 2 + 14, width - node.width / 2 - 14);
      node.y = clamp(node.y, node.height / 2 + 18, height - node.height / 2 - 18);
    }
  }
  return nodes;
}

export function initCapabilityConstellation() {
  const mounted = document.querySelector('[data-skill-map]');
  if (!mounted) return;

  const container = mounted.cloneNode(false);
  mounted.replaceWith(container);

  const legend = document.querySelector('[data-capability-legend]');
  const status = document.querySelector('[data-skill-status]');
  const inspector = document.querySelector('[data-capability-inspector]');
  const inspectorType = inspector?.querySelector('[data-capability-type]');
  const inspectorName = inspector?.querySelector('[data-capability-name]');
  const inspectorUsage = inspector?.querySelector('[data-capability-usage]');
  const experienceItems = [...document.querySelectorAll('.experience-item')];
  const model = buildCapabilityModel(siteData.expertise, siteData.experience, siteData.skillTypes, siteData.skillRoleIds);
  const nodeBySkill = new Map(model.nodes.map(node => [node.skill, node]));
  const elementBySkill = new Map();
  const hubByGroup = new Map();
  const baseLines = [];
  let relationLines = [];
  let pinnedSkill = null;
  let previewSkill = null;
  let selfSync = false;

  const svg = document.createElementNS(svgNs, 'svg');
  svg.classList.add('capability-link-layer');
  svg.setAttribute('aria-hidden', 'true');
  const baseGroup = document.createElementNS(svgNs, 'g');
  baseGroup.classList.add('capability-base-links');
  const relationGroup = document.createElementNS(svgNs, 'g');
  relationGroup.classList.add('capability-relation-links');
  svg.append(baseGroup, relationGroup);

  const clusters = document.createElement('div');
  clusters.className = 'capability-clusters';

  if (legend) {
    legend.replaceChildren(...model.groups.map(group => {
      const item = document.createElement('span');
      item.innerHTML = '<b>' + group.number + '</b><span>' + tr(group.title) + '</span>';
      return item;
    }));
  }

  for (const group of model.groups) {
    const cluster = document.createElement('section');
    cluster.className = 'capability-cluster';
    cluster.dataset.group = String(group.groupIndex);

    const hub = document.createElement('div');
    hub.className = 'capability-hub';
    hub.dataset.capabilityHub = String(group.groupIndex);
    const number = document.createElement('span');
    number.textContent = group.number;
    const title = document.createElement('strong');
    title.textContent = tr(group.title);
    hub.append(number, title);
    hubByGroup.set(group.groupIndex, hub);

    const list = document.createElement('div');
    list.className = 'capability-node-list';

    for (const node of model.nodes.filter(item => item.groupIndex === group.groupIndex)) {
      const button = document.createElement('button');
      button.type = 'button';
      button.className = 'capability-node capability-node-size-' + node.importance;
      button.dataset.skill = node.skill;
      button.dataset.group = String(node.groupIndex);
      button.dataset.type = node.type;
      button.setAttribute('aria-pressed', 'false');
      button.style.setProperty('--cap-delay', (node.order * 34 + group.groupIndex * 70) + 'ms');
      button.textContent = tr(node.skill);
      elementBySkill.set(node.skill, button);
      list.append(button);
    }

    cluster.append(hub, list);
    clusters.append(cluster);
  }

  container.append(svg, clusters);

  const matchingExperience = skill => experienceItems.filter(item =>
    skillMatchesExperience(skill, item.dataset.tools, item.dataset.experienceId, siteData.skillRoleIds)
  );

  const clearExperience = () => {
    experienceItems.forEach(item => item.classList.remove('skill-match', 'skill-muted'));
  };

  const updateStatus = (skill, matches) => {
    if (!status) return;
    const category = tr(siteData.skillTypes?.[skill] || 'Skill');
    const count = matches.length;
    if (!count) {
      status.textContent = skill + ' · ' + category;
      return;
    }
    status.textContent = root.lang === 'es'
      ? skill + ' · ' + category + ' · ' + count + (count === 1 ? ' rol relacionado' : ' roles relacionados')
      : skill + ' · ' + category + ' · ' + count + (count === 1 ? ' related role' : ' related roles');
  };

  const renderInspector = (skill, matches) => {
    const node = nodeBySkill.get(skill);
    if (!node || !inspector) return;
    const related = model.relatedBySkill[skill] || [];
    inspector.dataset.active = 'true';
    if (inspectorType) inspectorType.textContent = tr(node.type) + ' · ' + tr(siteData.expertise[node.groupIndex]?.title || '');
    if (inspectorName) inspectorName.textContent = tr(skill);
    if (inspectorUsage) {
      const count = matches.length;
      const usage = root.lang === 'es'
        ? (count ? 'Usado en ' + count + (count === 1 ? ' rol' : ' roles') : 'Experiencia técnica complementaria')
        : (count ? 'Used across ' + count + (count === 1 ? ' role' : ' roles') : 'Supporting technical expertise');
      const relatedCopy = related.length
        ? (root.lang === 'es' ? ' · Relacionado: ' : ' · Related: ') + related.map(tr).join(' · ')
        : '';
      inspectorUsage.textContent = usage + relatedCopy;
    }
  };

  const resetInspector = () => {
    if (!inspector) return;
    delete inspector.dataset.active;
    if (inspectorType) inspectorType.textContent = tr('Interactive expertise map');
    if (inspectorName) inspectorName.textContent = tr('Explore the expertise map');
    if (inspectorUsage) inspectorUsage.textContent = tr('Hover, focus or select a skill or technology to trace where it appears in my experience.');
    if (status) status.textContent = tr('Select a skill or technology to trace experience.');
  };

  const clearRelationLines = () => {
    relationLines = [];
    relationGroup.replaceChildren();
  };

  const drawLine = (from, to, className) => {
    const rect = container.getBoundingClientRect();
    const a = centerOf(from, rect);
    const b = centerOf(to, rect);
    const line = document.createElementNS(svgNs, 'line');
    line.setAttribute('x1', a.x.toFixed(1));
    line.setAttribute('y1', a.y.toFixed(1));
    line.setAttribute('x2', b.x.toFixed(1));
    line.setAttribute('y2', b.y.toFixed(1));
    line.setAttribute('class', className);
    return line;
  };

  const updateBaseLines = () => {
    baseLines.length = 0;
    baseGroup.replaceChildren();
    if (mobileQuery.matches) return;
    for (const node of model.nodes) {
      const hub = hubByGroup.get(node.groupIndex);
      const element = elementBySkill.get(node.skill);
      if (!hub || !element) continue;
      const line = drawLine(hub, element, 'capability-link');
      line.dataset.skill = node.skill;
      line.dataset.group = String(node.groupIndex);
      baseLines.push(line);
      baseGroup.append(line);
    }
  };

  const updateRelationLines = skill => {
    clearRelationLines();
    if (!skill || mobileQuery.matches) return;
    const from = elementBySkill.get(skill);
    if (!from) return;
    for (const relatedSkill of model.relatedBySkill[skill] || []) {
      const to = elementBySkill.get(relatedSkill);
      if (!to) continue;
      const line = drawLine(from, to, 'capability-relation-link');
      relationLines.push(line);
      relationGroup.append(line);
    }
  };

  const renderSkill = skill => {
    const node = nodeBySkill.get(skill);
    if (!node) return;
    previewSkill = skill;
    const related = new Set(model.relatedBySkill[skill] || []);
    const matches = matchingExperience(skill);

    for (const [name, element] of elementBySkill) {
      const active = name === skill;
      const isRelated = related.has(name);
      element.classList.toggle('is-active', active);
      element.classList.toggle('is-related', isRelated);
      element.classList.toggle('is-dimmed', !active && !isRelated);
      element.setAttribute('aria-pressed', String(active && pinnedSkill === skill));
    }

    for (const [groupIndex, hub] of hubByGroup) hub.classList.toggle('is-active', groupIndex === node.groupIndex);
    for (const line of baseLines) {
      line.classList.toggle('is-active', line.dataset.skill === skill);
      line.classList.toggle('is-group-active', Number(line.dataset.group) === node.groupIndex);
    }

    experienceItems.forEach(item => {
      const matched = matches.includes(item);
      item.classList.toggle('skill-match', matched);
      item.classList.toggle('skill-muted', matches.length > 0 && !matched);
    });

    updateRelationLines(skill);
    renderInspector(skill, matches);
    updateStatus(skill, matches);
  };

  const clearVisual = () => {
    previewSkill = null;
    for (const element of elementBySkill.values()) {
      element.classList.remove('is-active', 'is-related', 'is-dimmed');
      element.setAttribute('aria-pressed', 'false');
    }
    for (const hub of hubByGroup.values()) hub.classList.remove('is-active');
    for (const line of baseLines) line.classList.remove('is-active', 'is-group-active');
    clearRelationLines();
    clearExperience();
    resetInspector();
  };

  const setPinned = skill => {
    if (pinnedSkill === skill) {
      pinnedSkill = null;
      selfSync = true;
      delete root.dataset.activeSkill;
      selfSync = false;
      clearVisual();
      return;
    }
    pinnedSkill = skill;
    selfSync = true;
    root.dataset.activeSkill = skill;
    selfSync = false;
    renderSkill(skill);
  };

  for (const [skill, button] of elementBySkill) {
    button.addEventListener('mouseenter', () => {
      if (!pinnedSkill) renderSkill(skill);
    });
    button.addEventListener('focus', () => {
      if (!pinnedSkill) renderSkill(skill);
    });
    button.addEventListener('click', () => setPinned(skill));
  }

  container.addEventListener('mouseleave', () => {
    if (pinnedSkill) renderSkill(pinnedSkill);
    else clearVisual();
  });

  container.addEventListener('focusout', () => {
    requestAnimationFrame(() => {
      if (container.contains(document.activeElement)) return;
      if (pinnedSkill) renderSkill(pinnedSkill);
      else clearVisual();
    });
  });

  addEventListener('keydown', event => {
    if (event.key !== 'Escape' || (!pinnedSkill && !previewSkill)) return;
    pinnedSkill = null;
    selfSync = true;
    delete root.dataset.activeSkill;
    selfSync = false;
    clearVisual();
  });

  const observer = new MutationObserver(() => {
    if (selfSync) return;
    const externalSkill = root.dataset.activeSkill;
    if (externalSkill && nodeBySkill.has(externalSkill)) {
      pinnedSkill = externalSkill;
      renderSkill(externalSkill);
    } else if (!externalSkill && pinnedSkill) {
      pinnedSkill = null;
      clearVisual();
    }
  });
  observer.observe(root, { attributes: true, attributeFilter: ['data-active-skill'] });

  const layout = () => {
    if (mobileQuery.matches) {
      svg.setAttribute('viewBox', '0 0 1 1');
      for (const element of [...hubByGroup.values(), ...elementBySkill.values()]) {
        element.style.removeProperty('--cap-x');
        element.style.removeProperty('--cap-y');
      }
      updateBaseLines();
      updateRelationLines(pinnedSkill || previewSkill);
      return;
    }

    const width = container.clientWidth;
    const height = container.clientHeight;
    if (!width || !height) return;
    svg.setAttribute('viewBox', '0 0 ' + width + ' ' + height);

    const anchors = [
      { x: width * 0.18, y: height * 0.49 },
      { x: width * 0.50, y: height * 0.43 },
      { x: width * 0.82, y: height * 0.50 }
    ];

    const candidates = [];
    for (const group of model.groups) {
      const hub = hubByGroup.get(group.groupIndex);
      const anchor = anchors[group.groupIndex];
      if (hub) {
        hub.style.setProperty('--cap-x', anchor.x + 'px');
        hub.style.setProperty('--cap-y', anchor.y + 'px');
      }
      candidates.push(...layoutGroupNodes(
        model.nodes.filter(node => node.groupIndex === group.groupIndex),
        anchor,
        width,
        height,
        group.groupIndex
      ));
    }

    const relaxed = relaxLayout(candidates, width, height);
    for (const node of relaxed) {
      const element = elementBySkill.get(node.skill);
      if (!element) continue;
      element.style.setProperty('--cap-x', node.x + 'px');
      element.style.setProperty('--cap-y', node.y + 'px');
    }

    requestAnimationFrame(() => {
      updateBaseLines();
      updateRelationLines(pinnedSkill || previewSkill);
      container.classList.add('is-ready');
    });
  };

  const resizeObserver = new ResizeObserver(layout);
  resizeObserver.observe(container);
  mobileQuery.addEventListener?.('change', layout);
  layout();
  resetInspector();
}
