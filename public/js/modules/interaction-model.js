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
