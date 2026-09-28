const root = document.documentElement;

const textOnly = element => [...(element?.childNodes || [])]
  .filter(node => node.nodeType === Node.TEXT_NODE)
  .map(node => node.textContent.trim())
  .filter(Boolean)
  .join(' ');

const rangeFor = items => {
  if (items.length === 1) return items[0].dataset.date || '';
  const newest = (items[0].dataset.date || '').split(' — ');
  const oldest = (items.at(-1).dataset.date || '').split(' — ');
  return [oldest[0], newest[1] || newest[0]].filter(Boolean).join(' — ');
};

export function initCareerTimeline() {
  const timeline = document.querySelector('#experience .timeline');
  const items = [...(timeline?.querySelectorAll('.experience-item') || [])];
  if (!timeline || !items.length || timeline.dataset.careerEnhanced === 'true') return;

  const spanish = root.lang === 'es';
  const labels = {
    progression: spanish ? 'Progresión profesional' : 'Career progression',
    stack: spanish ? 'Stack tecnológico' : 'Technology stack',
    role: spanish ? 'rol' : 'role',
    roles: spanish ? 'roles' : 'roles',
    company: spanish ? 'empresa' : 'company',
    companies: spanish ? 'empresas' : 'companies'
  };

  items.forEach(item => {
    const companyNode = item.querySelector('.company');
    const dateNode = item.querySelector('.date');
    const roleNode = item.querySelector('.experience-role');
    const meta = item.querySelector('.experience-meta');
    const body = item.querySelector('.experience-body');
    const tags = body?.querySelector(':scope > .tags');

    const company = companyNode?.textContent.trim() || '';
    const role = textOnly(roleNode) || roleNode?.textContent.trim() || '';
    const date = dateNode?.textContent.trim() || '';

    item.dataset.company = company;
    item.dataset.role = role;
    item.dataset.date = date;

    companyNode?.classList.add('sr-only');
    dateNode?.classList.add('experience-date');
    if (meta && roleNode && roleNode.parentElement !== meta) meta.prepend(roleNode);

    if (body && tags && !body.querySelector('.experience-stack')) {
      const stack = document.createElement('div');
      stack.className = 'experience-stack';
      const stackLabel = document.createElement('span');
      stackLabel.className = 'experience-stack-label';
      stackLabel.textContent = labels.stack;
      stack.append(stackLabel, tags);
      body.append(stack);
    }
  });

  const groups = [];
  for (const item of items) {
    const company = item.dataset.company || '';
    const previous = groups.at(-1);
    if (previous?.company === company) previous.items.push(item);
    else groups.push({ company, items: [item] });
  }

  const layout = document.createElement('div');
  layout.className = 'career-layout';

  const rail = document.createElement('aside');
  rail.className = 'career-rail';
  rail.dataset.careerRail = '';
  rail.setAttribute('aria-hidden', 'true');

  const railKicker = document.createElement('span');
  railKicker.className = 'career-rail-kicker';
  railKicker.textContent = labels.progression;
  const railCompany = document.createElement('strong');
  railCompany.className = 'career-rail-company';
  railCompany.dataset.careerCompany = '';
  const railRole = document.createElement('span');
  railRole.className = 'career-rail-role';
  railRole.dataset.careerRole = '';
  const railDate = document.createElement('span');
  railDate.className = 'career-rail-date';
  railDate.dataset.careerDate = '';
  const railMeta = document.createElement('span');
  railMeta.className = 'career-rail-meta';
  railMeta.textContent = items.length + ' ' + (items.length === 1 ? labels.role : labels.roles) + ' · ' + groups.length + ' ' + (groups.length === 1 ? labels.company : labels.companies);
  rail.append(railKicker, railCompany, railRole, railDate, railMeta);

  const groupContainer = document.createElement('div');
  groupContainer.className = 'career-groups';

  groups.forEach((group, groupIndex) => {
    const section = document.createElement('section');
    section.className = 'career-company-group';
    section.dataset.company = group.company;

    const header = document.createElement('header');
    header.className = 'career-company-header';
    const index = document.createElement('span');
    index.className = 'career-company-index';
    index.textContent = String(groupIndex + 1).padStart(2, '0');
    const heading = document.createElement('div');
    const companyTitle = document.createElement('h3');
    companyTitle.textContent = group.company;
    const span = document.createElement('p');
    span.textContent = rangeFor(group.items);
    heading.append(companyTitle, span);
    const count = document.createElement('span');
    count.className = 'career-role-count';
    count.textContent = group.items.length + ' ' + (group.items.length === 1 ? labels.role : labels.roles);
    header.append(index, heading, count);

    const stack = document.createElement('div');
    stack.className = 'career-role-stack';
    group.items.forEach(item => stack.append(item));
    section.append(header, stack);
    groupContainer.append(section);
  });

  layout.append(rail, groupContainer);
  timeline.replaceChildren(layout);
  timeline.classList.remove('timeline');
  timeline.classList.add('career-timeline');
  timeline.dataset.careerEnhanced = 'true';

  const company = rail.querySelector('[data-career-company]');
  const role = rail.querySelector('[data-career-role]');
  const date = rail.querySelector('[data-career-date]');
  let activeIndex = -1;

  const setActive = index => {
    const safeIndex = Math.max(0, Math.min(items.length - 1, index));
    if (safeIndex === activeIndex) return;
    activeIndex = safeIndex;

    const active = items[safeIndex];
    if (company) company.textContent = active.dataset.company || '';
    if (role) role.textContent = active.dataset.role || '';
    if (date) date.textContent = active.dataset.date || '';
    rail.style.setProperty('--career-progress', String(items.length <= 1 ? 1 : safeIndex / (items.length - 1)));

    items.forEach((item, itemIndex) => item.classList.toggle('is-career-active', itemIndex === safeIndex));
    groupContainer.querySelectorAll('.career-company-group').forEach(group => {
      group.classList.toggle('is-career-active', group.contains(active));
    });
  };

  const pickClosest = () => {
    const targetY = innerHeight * 0.42;
    let bestIndex = 0;
    let bestDistance = Number.POSITIVE_INFINITY;

    items.forEach((item, index) => {
      const rect = item.getBoundingClientRect();
      const center = rect.top + Math.min(rect.height * 0.35, 150);
      const distance = Math.abs(center - targetY);
      if (distance < bestDistance) {
        bestDistance = distance;
        bestIndex = index;
      }
    });

    setActive(bestIndex);
  };

  let frame = 0;
  const schedule = () => {
    cancelAnimationFrame(frame);
    frame = requestAnimationFrame(pickClosest);
  };

  addEventListener('scroll', schedule, { passive: true });
  addEventListener('resize', schedule, { passive: true });
  schedule();
  root.classList.add('career-trace-ready');
}
