// Progressive enhancement: every anchor and disclosure also works without JS.
export function trackSections() {
  const sidebar = document.querySelector('.sidebar');
  const menu = sidebar?.querySelector('.mobile-menu-toggle');
  if (menu) {
    sidebar.querySelector('.sidebar-top').append(menu);
    menu.hidden = false;
    sidebar.classList.add('has-mobile-menu');
    const setOpen = open => {
      sidebar.classList.toggle('is-menu-open', open);
      menu.setAttribute('aria-expanded', String(open));
      menu.textContent = open ? '×' : '☰';
    };
    menu.addEventListener('click', () => setOpen(menu.getAttribute('aria-expanded') !== 'true'));
    sidebar.querySelectorAll('nav a').forEach(link => link.addEventListener('click', () => setOpen(false)));
    sidebar.addEventListener('keydown', event => { if (event.key === 'Escape') { setOpen(false); menu.focus(); } });
  }
  const links = [...document.querySelectorAll('.sidebar nav a')];
  const sections = links.map(link => document.querySelector(link.hash)).filter(Boolean);
  let scheduled = false;
  function update() {
    const threshold = Math.min(window.innerHeight * 0.32, 220);
    let current = sections[0];
    for (const section of sections) {
      if (section.getBoundingClientRect().top <= threshold) current = section;
    }
    if (window.scrollY + window.innerHeight >= document.documentElement.scrollHeight - 4) current = sections.at(-1);
    for (const link of links) {
      if (link.hash === `#${current.id}`) link.setAttribute('aria-current', 'location');
      else link.removeAttribute('aria-current');
    }
    scheduled = false;
  }
  function schedule() {
    if (!scheduled) { scheduled = true; requestAnimationFrame(update); }
  }
  if (!sections.length) return;
  addEventListener('scroll', schedule, { passive: true });
  addEventListener('resize', schedule);
  document.addEventListener('toggle', schedule, true);
  update();
}
