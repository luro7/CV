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
  const stops = [...companies.values()];
  const stopOffset = index => stops[index].offsetLeft - stops[0].offsetLeft;
  let activeIndex = -1;
  let transition = null;
  let transitionVersion = 0;
  const showCompany = (index, animate = true) => {
    if (index === activeIndex) return;
    const previous = activeIndex;
    activeIndex = index;
    const version = ++transitionVersion;
    transition?.cancel();
    const reveal = () => {
      if (version !== transitionVersion) return;
      track.scrollTo({left:stopOffset(index), behavior:'instant'});
      if (animate && !motion.matches && previous >= 0) {
        const direction = index > previous ? 1 : -1;
        transition = stops[index].animate([
          {opacity:0, transform:'translateX(' + direction * 18 + 'px)'},
          {opacity:1, transform:'translateX(0)'}
        ], {duration:260, easing:'cubic-bezier(.2,.7,.2,1)'});
      }
    };
    if (animate && !motion.matches && previous >= 0) {
      transition = stops[previous].animate([{opacity:1},{opacity:0}], {duration:120, fill:'forwards'});
      transition.finished.then(() => { transition.cancel(); reveal(); }).catch(() => {});
    } else reveal();
  };
  const update = () => {
    frame = 0;
    if (section.classList.contains('is-company-journey')) {
      const index = Math.max(0, Math.min(stops.length - 1, Math.round((scrollY - start) * 4 / track.clientWidth)));
      showCompany(index);
    }
  };
  const measure = () => {
    section.classList.add('is-company-journey');
    section.style.removeProperty('height');
    const sectionPadding = parseFloat(getComputedStyle(section).paddingTop) + parseFloat(getComputedStyle(section).paddingBottom);
    const headingHeight = section.querySelector('.section-heading').getBoundingClientRect().height + 16;
    const available = Math.max(200, innerHeight - sectionPadding - headingHeight - (innerWidth <= 800 ? 80 : 16));
    stops.forEach(company => {
      company.style.removeProperty('min-height');
      company.style.removeProperty('height');
      company.style.alignContent = 'start';
      const roles = company.querySelectorAll('.career-company-role').length;
      const columns = Math.max(1, Math.min(roles, Math.floor(track.clientWidth / 480)));
      company.style.setProperty('--company-columns', columns);
      let low = 14, high = Math.max(14, Math.min(96, track.clientWidth / 28, available / 8));
      for (let step = 0; step < 9; step++) {
        const size = (low + high) / 2;
        company.style.setProperty('--company-copy-size', size + 'px');
        if (company.offsetHeight <= available) low = size;
        else high = size;
      }
      company.style.setProperty('--company-copy-size', low + 'px');
      if (company.offsetHeight <= available) {
        company.style.minHeight = available + 'px';
        company.style.alignContent = 'center';
      }
    });
    const usable = innerWidth > 800 && !motion.matches && wrapper.offsetHeight < innerHeight - 24;
    if (!usable) section.classList.remove('is-company-journey');
    if (usable) {
      distance = track.scrollWidth - track.clientWidth;
      start = section.getBoundingClientRect().top + scrollY;
      section.style.height = wrapper.offsetHeight + distance / 4 + 'px';
      section.classList.add('is-company-journey');
    }
    activeIndex = -1;
    transitionVersion++;
    transition?.cancel();
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
  let gestureTimer = 0;
  addEventListener('wheel', event => {
    if (!section.classList.contains('is-company-journey') || event.ctrlKey || !event.deltaY) return;
    const end = start + distance / 4;
    if (scrollY < start - 2 || scrollY > end + 2) return;
    if (gestureTimer) {
      event.preventDefault();
      clearTimeout(gestureTimer);
      gestureTimer = setTimeout(() => { gestureTimer = 0; }, 450);
      return;
    }
    const index = Math.max(0, Math.min(stops.length - 1, Math.round((scrollY - start) * 4 / track.clientWidth)));
    const next = index + Math.sign(event.deltaY);
    if (next < 0 || next >= stops.length) return;
    event.preventDefault();
    window.scrollTo({top:start + stopOffset(next) / 4, behavior:'instant'});
    showCompany(next);
    gestureTimer = setTimeout(() => { gestureTimer = 0; }, 450);
  }, {passive:false});
  measure();
}



