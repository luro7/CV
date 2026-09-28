export function progressToStage(progress, count = 5) {
  const safeCount = Math.max(1, Number(count) || 1);
  const normalized = Math.max(0, Math.min(1, Number(progress) || 0));
  return Math.min(safeCount - 1, Math.floor(normalized * safeCount));
}

export function skillMatchesExperience(skill, toolData, experienceId, skillRoleIds = {}) {
  const normalized = String(skill).toLowerCase();
  const tools = String(toolData || '').toLowerCase().split('|').map(value => value.trim()).filter(Boolean);
  const linked = new Set(skillRoleIds?.[skill] || []);
  return tools.includes(normalized) || linked.has(experienceId);
}

export function nextPinnedSkill(currentSkill, clickedSkill) {
  return currentSkill === clickedSkill ? null : clickedSkill;
}

export function relaxCapabilityLayout(items, width, height, obstacles = [], iterations = 96) {
  const clamp = (value, min, max) => Math.max(min, Math.min(max, value));
  const nodes = items.map(item => ({ ...item }));
  const safeObstacles = obstacles.map(item => ({ padding: 12, ...item }));

  const separateFromObstacle = (node, obstacle) => {
    const dx = node.x - obstacle.x || 0.01;
    const dy = node.y - obstacle.y || 0.01;
    const minX = (node.width + obstacle.width) / 2 + obstacle.padding;
    const minY = (node.height + obstacle.height) / 2 + obstacle.padding;
    const overlapX = minX - Math.abs(dx);
    const overlapY = minY - Math.abs(dy);
    if (overlapX <= 0 || overlapY <= 0) return;

    if (overlapX < overlapY) node.x += overlapX * Math.sign(dx);
    else node.y += overlapY * Math.sign(dy);
  };

  for (let iteration = 0; iteration < iterations; iteration += 1) {
    for (const node of nodes) {
      node.x += (node.targetX - node.x) * 0.028;
      node.y += (node.targetY - node.y) * 0.028;
    }

    for (let i = 0; i < nodes.length; i += 1) {
      for (let j = i + 1; j < nodes.length; j += 1) {
        const a = nodes[i];
        const b = nodes[j];
        const minX = (a.width + b.width) / 2 + 12;
        const minY = (a.height + b.height) / 2 + 10;
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
      for (const obstacle of safeObstacles) separateFromObstacle(node, obstacle);
      node.x = clamp(node.x, node.width / 2 + 14, width - node.width / 2 - 14);
      node.y = clamp(node.y, node.height / 2 + 18, height - node.height / 2 - 18);
    }
  }

  for (let pass = 0; pass < 4; pass += 1) {
    for (const node of nodes) {
      for (const obstacle of safeObstacles) separateFromObstacle(node, obstacle);
      node.x = clamp(node.x, node.width / 2 + 14, width - node.width / 2 - 14);
      node.y = clamp(node.y, node.height / 2 + 18, height - node.height / 2 - 18);
    }
  }

  return nodes;
}

export function buildCapabilityModel(expertise = [], experience = [], skillTypes = {}, skillRoleIds = {}) {
  const roleIdsFor = skill => {
    const normalized = String(skill).toLowerCase();
    const explicit = new Set(skillRoleIds?.[skill] || []);
    return experience
      .filter(item => explicit.has(item.id) || (item.tools || []).some(tool => String(tool).toLowerCase() === normalized))
      .map(item => item.id);
  };

  const groups = expertise.map((group, groupIndex) => ({
    id: 'capability-group-' + groupIndex,
    number: group.number || String(groupIndex + 1).padStart(2, '0'),
    title: group.title,
    groupIndex
  }));

  const nodes = expertise.flatMap((group, groupIndex) =>
    (group.tools || []).map((skill, order) => {
      const roleIds = roleIdsFor(skill);
      return {
        skill,
        groupIndex,
        order,
        type: skillTypes?.[skill] || 'Skill',
        roleIds,
        importance: Math.min(3, Math.max(1, roleIds.length + 1))
      };
    })
  );

  const relatedBySkill = Object.fromEntries(nodes.map(node => {
    const nodeRoles = new Set(node.roleIds);
    const ranked = nodes
      .filter(candidate => candidate.skill !== node.skill && candidate.groupIndex === node.groupIndex)
      .map(candidate => {
        const sharedRoles = candidate.roleIds.filter(roleId => nodeRoles.has(roleId)).length;
        const sameType = candidate.type === node.type ? 1 : 0;
        return {
          skill: candidate.skill,
          score: sharedRoles * 10 + sameType * 2 + candidate.importance * 0.1
        };
      })
      .filter(candidate => candidate.score >= 2)
      .sort((a, b) => b.score - a.score || a.skill.localeCompare(b.skill))
      .slice(0, 4)
      .map(candidate => candidate.skill);

    return [node.skill, ranked];
  }));

  return { groups, nodes, relatedBySkill };
}

export function rankCommandItems(source, query, translate = value => value) {
  const normalizedQuery = String(query || '').trim().toLowerCase();

  const score = item => {
    if (!normalizedQuery) return item.group === 'Navigate' ? 30 : item.group === 'System' ? 20 : 10;

    const label = String(item.label || '').toLowerCase();
    const translated = String(translate(item.label) || '').toLowerCase();
    const rawGroup = String(item.group || '').toLowerCase();
    const translatedGroup = String(translate(item.group) || '').toLowerCase();
    const keywords = String(item.keywords || '').toLowerCase();
    const haystack = [label, translated, rawGroup, translatedGroup, keywords].join(' ');
    const parts = normalizedQuery.split(/\s+/).filter(Boolean);

    if (!parts.every(part => haystack.includes(part))) return -1;
    if (label === normalizedQuery || translated === normalizedQuery) return 100;
    if (label.startsWith(normalizedQuery) || translated.startsWith(normalizedQuery)) return 80;
    if (label.includes(normalizedQuery) || translated.includes(normalizedQuery)) return 60;
    if (rawGroup.includes(normalizedQuery) || translatedGroup.includes(normalizedQuery)) return 40;
    return 20;
  };

  return source
    .map((item, index) => ({ item, index, score: score(item) }))
    .filter(entry => entry.score >= 0)
    .sort((a, b) => b.score - a.score || a.index - b.index)
    .map(entry => entry.item);
}
