// Runs before styles: avoid a light flash when a saved dark theme is active.
(() => {
  let theme;
  try { theme = localStorage.getItem('cv-theme'); } catch {}
  if (!['dark', 'light'].includes(theme)) theme = matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
  document.documentElement.dataset.theme = theme;

  try {
    const key = 'cv-language-scroll';
    const saved = JSON.parse(sessionStorage.getItem(key) || 'null');
    if (!saved) return;
    sessionStorage.removeItem(key);
    const age = Date.now() - saved.savedAt;
    if (saved.path !== location.pathname || !Number.isFinite(saved.y) || age < 0 || age > 30000) return;

    const root = document.documentElement;
    root.classList.add('language-scroll-restoring');
    if ('scrollRestoration' in history) history.scrollRestoration = 'manual';
    addEventListener('pageshow', () => {
      window.scrollTo(0, saved.y);
      requestAnimationFrame(() => {
        window.scrollTo(0, saved.y);
        root.classList.remove('language-scroll-restoring');
        if ('scrollRestoration' in history) history.scrollRestoration = 'auto';
      });
    }, { once: true });
  } catch {}
})();
