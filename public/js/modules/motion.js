export function setRevealVisibility(element, visible, direction = 'down') {
  if (visible && !element.classList.contains('is-visible')) {
    const fromTop = direction === 'up';
    if (element.classList.contains('reveal-from-top') !== fromTop) {
      // Commit the new starting position while hidden, without animating the
      // direction change itself. The existing entrance transition stays intact.
      element.classList.add('reveal-preparing');
      element.classList.toggle('reveal-from-top', fromTop);
      element.getBoundingClientRect();
      element.classList.remove('reveal-preparing');
    }
  }
  element.classList.toggle('is-visible', Boolean(visible));
}

export function initMotion() {
  const reducedMotion = matchMedia('(prefers-reduced-motion: reduce)');
  const hero = document.querySelector('.hero');

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

  let lastScrollY = Math.max(0, window.scrollY || 0);
  let direction = 'down';
  function updateDirection() {
    const scrollY = Math.max(0, window.scrollY || 0);
    if (scrollY !== lastScrollY) direction = scrollY < lastScrollY ? 'up' : 'down';
    lastScrollY = scrollY;
  }
  window.addEventListener('scroll', updateDirection, { passive: true });

  const observer = new IntersectionObserver(entries => {
    updateDirection();
    for (const entry of entries) {
      if (reducedMotion.matches || entry.isIntersecting) setRevealVisibility(entry.target, true, reducedMotion.matches ? 'down' : direction);
    }
  }, { threshold: 0.08, rootMargin: '0px 0px -32px 0px' });

  // A separate exit boundary exceeds the 14px reveal translation. This keeps
  // partially visible cards from toggling themselves across the entrance edge.
  const exitObserver = new IntersectionObserver(entries => {
    for (const entry of entries) {
      if (!entry.isIntersecting && !reducedMotion.matches) setRevealVisibility(entry.target, false);
    }
  }, { threshold: 0, rootMargin: '48px' });

  document.querySelectorAll('.section-heading,.skill-map-panel,.expertise-card,.timeline .experience-item,.career-detail-panel,.education-item,.certification-card,.languages')
    .forEach((element, index) => {
      element.classList.add('reveal');
      element.style.setProperty('--reveal-delay', String(Math.min(index % 4, 3) * 55) + 'ms');
      observer.observe(element);
      exitObserver.observe(element);
    });

  reducedMotion.addEventListener('change', () => {
    document.querySelectorAll('.reveal').forEach(element => {
      if (reducedMotion.matches) {
        setRevealVisibility(element, true);
        return;
      }

      const rect = element.getBoundingClientRect();
      const visible = rect.bottom > 32 && rect.top < innerHeight - 32;
      setRevealVisibility(element, visible, direction);
    });
  });
}
