const root = document.documentElement;

const styleHref = '/css/experience-timeline.css?v=career-horizontal-20261004';
if (!document.querySelector('link[data-career-timeline-style]')) {
  const link = document.createElement('link');
  link.rel = 'stylesheet';
  link.href = styleHref;
  link.dataset.careerTimelineStyle = '';
  document.head.append(link);
}

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
    roles: 'roles',
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

  const layout = document.createElement('div');
  layout.className = 'career-layout';
  const track = document.createElement('div');
  track.className = 'career-track'; track.id = 'career-track'; track.tabIndex = 0;
  track.setAttribute('role', 'region'); track.setAttribute('aria-label', labels.progression);
  const rolePoints = new Map();
  const roleStacks = new Map();
  items.forEach(item => {
    const heading = document.createElement('div'); heading.className = 'career-stop';
    const date = document.createElement('span'); date.textContent = item.dataset.date;
    const company = document.createElement('h3'); company.textContent = item.dataset.company;
    heading.append(date, company); item.prepend(heading);
    const body = item.querySelector('.experience-body');
    const list = body.querySelector('.responsibilities');
    const points = [...list.children];
    const stack = body.querySelector('.experience-stack');
    body.replaceChildren();
    rolePoints.set(item, points);
    roleStacks.set(item, stack);
    const pointsPerPanel = 1;
    for (let index = 0; index < points.length; index += pointsPerPanel) {
      const panel = document.createElement('div');
      panel.className = 'career-detail-panel';
      const panelList = document.createElement('ul');
      panelList.className = 'responsibilities';
      panelList.append(...points.slice(index, index + pointsPerPanel));
      panel.append(panelList); body.append(panel);
    }
    if (stack) {
      const panel = document.createElement('div'); panel.className = 'career-detail-panel';
      const emptyList = document.createElement('ul'); emptyList.className = 'responsibilities';
      panel.append(emptyList, stack); body.append(panel);
    }
    track.append(item);
  });
  const context = document.createElement('header');
  context.className = 'career-context';
  const companyLabel = document.createElement('h3');
  const dateLabel = document.createElement('span');
  const roleLabel = document.createElement('div');
  roleLabel.className = 'career-context-role';
  context.append(companyLabel, dateLabel, roleLabel);
  layout.append(context, track); timeline.replaceChildren(layout);
  timeline.classList.replace('timeline', 'career-timeline'); timeline.dataset.careerEnhanced = 'true';
  const motion = matchMedia('(prefers-reduced-motion: reduce)');
  let current = 0;
  const update = () => {
    current = 0;
    items.forEach((item, index) => {
      if (item.offsetLeft - track.offsetLeft <= track.scrollLeft + track.clientWidth * .5) current = index;
    });
    const active = items[current];
    if (companyLabel.textContent !== active.dataset.company) companyLabel.textContent = active.dataset.company;
    dateLabel.textContent = active.dataset.date;
    roleLabel.replaceChildren(active.querySelector('.experience-role').cloneNode(true));
    items.forEach((item, index) => item.classList.toggle('is-career-active', index === current));
  };
  const section = timeline.closest('.experience-section');
  const wrapper = section.querySelector(':scope > .wrap');
  let travel = 0;
  let pinTop = 0;
  let frame = 0;
  const sync = () => {
    frame = 0;
    const start = section.getBoundingClientRect().top + scrollY + parseFloat(getComputedStyle(section).paddingTop) - pinTop;
    track.scrollLeft = Math.max(0, Math.min(travel, (scrollY - start) * 2.5));
    update();
  };
  const schedule = () => { if (!frame) frame = requestAnimationFrame(sync); };
  const measure = () => {
    const panelWidth = Math.floor(track.clientWidth);
    track.style.setProperty('--career-panel-width', panelWidth + 'px');
    track.style.setProperty('--career-body-height', '180px');
    const fixedHeight = wrapper.offsetHeight - 180;
    const bodyHeight = Math.max(160, innerHeight - fixedHeight - (innerWidth <= 800 ? 100 : 32));
    track.style.setProperty('--career-body-height', bodyHeight + 'px');
    const readableSize = Math.max(16, Math.min(19, panelWidth * .018, bodyHeight / 22));
    track.style.setProperty('--career-copy-size', readableSize + 'px');
    items.forEach(item => {
      const points = rolePoints.get(item);
      const stack = roleStacks.get(item);
      const panels = [...item.querySelectorAll('.career-detail-panel')];
      panels.forEach(panel => { panel.hidden = true; panel.querySelector('.responsibilities').replaceChildren(); panel.querySelector('.responsibilities').style.height = 'auto'; });
      stack?.remove();
      let cursor = 0;
      let panelIndex = 0;
      while (cursor < points.length) {
        const panel = panels[panelIndex++];
        panel.hidden = false;
        const list = panel.querySelector('.responsibilities');
        let count = Math.min(6, points.length - cursor);
        // Measure actual localized copy at its unchanged font size.
        do {
          list.replaceChildren(...points.slice(cursor, cursor + count));
          if (list.offsetHeight <= bodyHeight - 24 || count === 1) break;
          count--;
        } while (count > 0);
        cursor += count;
        if (cursor === points.length && stack) {
          panel.append(stack);
          if (list.offsetHeight + stack.offsetHeight + 32 > bodyHeight) {
            stack.remove();
            const stackPanel = panels[panelIndex++];
            stackPanel.hidden = false; stackPanel.append(stack);
          }
        }
      }
      panels.filter(panel => !panel.hidden).forEach(panel => {
        const list = panel.querySelector('.responsibilities');
        const tools = panel.querySelector('.experience-stack');
        if (list.children.length) list.style.height = Math.max(list.offsetHeight, bodyHeight - (tools ? tools.offsetHeight + 32 : 16)) + 'px';
      });
      const body = item.querySelector('.experience-body');
      item.style.flexBasis = body.scrollWidth + 'px';
    });
    travel = Math.max(0, track.scrollWidth - track.clientWidth);
    pinTop = innerWidth <= 800 ? 68 : 0;
    section.style.setProperty('--career-pin-top', pinTop + 'px');
    section.style.setProperty('--career-journey-height', wrapper.offsetHeight + travel / 2.5 + 'px');
    section.classList.add('is-scroll-journey');
    schedule();
  };
  track.addEventListener('keydown', event => {
    if (event.target !== track || !['ArrowLeft','ArrowRight','Home','End'].includes(event.key)) return;
    event.preventDefault();
    const index = event.key === 'Home' ? 0 : event.key === 'End' ? items.length - 1 : Math.max(0, Math.min(items.length - 1, current + (event.key === 'ArrowLeft' ? -1 : 1)));
    const start = section.getBoundingClientRect().top + scrollY + parseFloat(getComputedStyle(section).paddingTop) - pinTop;
    window.scrollTo({top: start + Math.min(travel, items[index].offsetLeft - track.offsetLeft) / 2.5, behavior: motion.matches ? 'instant' : 'smooth'});
  });
  addEventListener('scroll', schedule, {passive:true});
  addEventListener('resize', measure, {passive:true});
  new ResizeObserver(measure).observe(track);
  document.fonts.ready.then(measure);
  measure();
  root.classList.add('career-trace-ready');
}
