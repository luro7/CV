const root = document.documentElement;

export function initCareerTimeline() {
  const rail = document.querySelector('[data-career-rail]');
  const items = [...document.querySelectorAll('.experience-item[data-company][data-role][data-date]')];
  if (!rail || !items.length) return;

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
    document.querySelectorAll('.career-company-group').forEach(group => {
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
  addEventListener('cv:language', schedule);
  schedule();

  root.classList.add('career-trace-ready');
}
