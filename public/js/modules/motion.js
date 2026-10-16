export function initMotion() {
  const reducedMotion = matchMedia('(prefers-reduced-motion: reduce)');
  const hero = document.querySelector('.hero');
  if (!hero || reducedMotion.matches) return;

  const resetPointer = () => {
    hero.style.setProperty('--pointer-x', '72%');
    hero.style.setProperty('--pointer-y', '18%');
  };

  hero.addEventListener('pointermove', event => {
    const box = hero.getBoundingClientRect();
    if (!box.width || !box.height) return;
    hero.style.setProperty('--pointer-x', (((event.clientX - box.left) / box.width) * 100).toFixed(2) + '%');
    hero.style.setProperty('--pointer-y', (((event.clientY - box.top) / box.height) * 100).toFixed(2) + '%');
  }, { passive: true });
  hero.addEventListener('pointerleave', resetPointer);
  reducedMotion.addEventListener?.('change', event => {
    if (event.matches) resetPointer();
  });
}
