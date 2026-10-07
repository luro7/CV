// Optional reading indicator. Company links and role disclosures work without JS.
export function initCareerTimeline() {
  const section = document.querySelector('#experience');
  if (!section) return;
  const links = [...section.querySelectorAll('.career-index a')];
  const companies = links.map(link => section.querySelector(link.hash)).filter(Boolean);
  if (!companies.length) return;
  let scheduled = false;
  const update = () => {
    const threshold = Math.min(innerHeight * .3, 200);
    let current = companies[0];
    for (const company of companies) {
      if (company.getBoundingClientRect().top <= threshold) current = company;
    }
    for (const link of links) {
      if (link.hash === '#' + current.id) link.setAttribute('aria-current', 'location');
      else link.removeAttribute('aria-current');
    }
    scheduled = false;
  };
  const schedule = () => {
    if (scheduled) return;
    scheduled = true;
    requestAnimationFrame(update);
  };
  addEventListener('scroll', schedule, { passive: true });
  addEventListener('resize', schedule);
  section.addEventListener('toggle', schedule, true);
  update();
}
