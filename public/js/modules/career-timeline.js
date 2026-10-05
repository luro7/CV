export function initCareerTimeline() {
  const timeline = document.querySelector('#experience .timeline');
  if (!timeline) return;
  const section = timeline.closest('.experience-section');
  const wrapper = section.querySelector(':scope > .wrap');
  const companies = new Map();
  for (const item of timeline.querySelectorAll('.experience-item')) {
    const name = item.querySelector('.company').textContent.trim();
    if (!companies.has(name)) {
      const company = document.createElement('article');
      company.className = 'career-company';
      const heading = document.createElement('h3'); heading.textContent = name;
      company.append(heading); companies.set(name, company);
    }
    const company = companies.get(name);
    const role = document.createElement('section'); role.className = 'career-company-role';
    const heading = item.querySelector('.experience-role');
    const date = item.querySelector('.date');
    const body = item.querySelector('.experience-body');
    role.append(heading, date, body); company.append(role);
  }
  const track = document.createElement('div'); track.className = 'career-company-track';
  track.tabIndex = 0;
  track.setAttribute('aria-label', document.documentElement.lang === 'es' ? 'Trayectoria por empresa' : 'Career by company');
  track.append(...companies.values()); timeline.replaceChildren(track);
  const motion = matchMedia('(prefers-reduced-motion: reduce)');
  let distance = 0, start = 0, frame = 0;
  const update = () => {
    frame = 0;
    if (section.classList.contains('is-company-journey')) track.scrollLeft = Math.round(Math.max(0, Math.min(distance, (scrollY - start) * 4)) / track.clientWidth) * track.clientWidth;
  };
  const measure = () => {
    section.classList.add('is-company-journey');
    section.style.removeProperty('height');
    const usable = innerWidth > 800 && !motion.matches && wrapper.offsetHeight < innerHeight - 24;
    if (!usable) section.classList.remove('is-company-journey');
    if (usable) {
      distance = track.scrollWidth - track.clientWidth;
      start = section.getBoundingClientRect().top + scrollY;
      section.style.height = wrapper.offsetHeight + distance / 4 + 'px';
      section.classList.add('is-company-journey');
    }
    update();
  };
  addEventListener('scroll', () => { if (!frame) frame = requestAnimationFrame(update); }, {passive:true});
  addEventListener('resize', measure);
  motion.addEventListener('change', measure);
  document.fonts.ready.then(measure);
  track.addEventListener('keydown', event => {
    if (!section.classList.contains('is-company-journey') || !['ArrowLeft','ArrowRight'].includes(event.key)) return;
    event.preventDefault();
    window.scrollTo({top:start + Math.max(0,Math.min(distance,track.scrollLeft + (event.key === 'ArrowRight' ? track.clientWidth : -track.clientWidth))) / 4,behavior:motion.matches?'instant':'smooth'});
  });
  measure();
}
