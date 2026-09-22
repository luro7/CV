const reducedMotion = matchMedia('(prefers-reduced-motion: reduce)');

export function initMotion() {
  const root = document.documentElement;
  const progress = document.querySelector('.reading-progress');
  const hero = document.querySelector('.hero');
  let frame = 0;

  const update = () => {
    frame = 0;
    const range = root.scrollHeight - innerHeight;
    const value = Math.max(0, Math.min(1, range > 0 ? scrollY / range : 0));
    root.style.setProperty('--page-progress', value);
    if (progress) progress.style.transform = 'scaleX(' + value + ')';
  };

  const schedule = () => {
    if (!frame) frame = requestAnimationFrame(update);
  };

  addEventListener('scroll', schedule, { passive: true });
  addEventListener('resize', schedule);
  new ResizeObserver(schedule).observe(document.body);
  update();

  if (hero && !reducedMotion.matches) {
    hero.addEventListener('pointermove', event => {
      const box = hero.getBoundingClientRect();
      hero.style.setProperty('--pointer-x', (((event.clientX - box.left) / box.width) * 100).toFixed(2) + '%');
      hero.style.setProperty('--pointer-y', (((event.clientY - box.top) / box.height) * 100).toFixed(2) + '%');
    }, { passive: true });
    hero.addEventListener('pointerleave', () => {
      hero.style.setProperty('--pointer-x', '72%');
      hero.style.setProperty('--pointer-y', '18%');
    });
  }

  if (!('IntersectionObserver' in window)) return;

  const observer = new IntersectionObserver(entries => {
    for (const entry of entries) {
      if (!entry.isIntersecting) continue;
      observer.unobserve(entry.target);
      entry.target.classList.add('is-visible');
    }
  }, { threshold: 0.08, rootMargin: '0px 0px -32px 0px' });

  document.querySelectorAll('.section-heading,.skill-map-panel,.expertise-card,.experience-item,.education-item,.certification-card,.languages')
    .forEach((element, index) => {
      element.classList.add('reveal');
      element.style.setProperty('--reveal-delay', String(Math.min(index % 4, 3) * 55) + 'ms');
      observer.observe(element);
    });

  reducedMotion.addEventListener('change', () => {
    if (reducedMotion.matches) {
      document.querySelectorAll('.reveal').forEach(element => element.classList.add('is-visible'));
    }
  });
}
