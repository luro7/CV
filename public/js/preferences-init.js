// Runs before styles: avoid a light flash when a saved dark theme is active.
(() => {
  let theme;
  try { theme = localStorage.getItem('cv-theme'); } catch {}
  if (!['dark', 'light'].includes(theme)) theme = matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
  document.documentElement.dataset.theme = theme;
})();
