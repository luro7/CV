const root = document.documentElement;
const reducedMotion = matchMedia('(prefers-reduced-motion: reduce)');
const store = (key, value) => { try { localStorage.setItem(key, value); } catch {} };

export function initPreferences() {
  const languageButton = document.querySelector('.language-toggle');
  const themeButton = document.querySelector('.theme-toggle');
  const preferences = document.querySelector('.preferences');
  const language = root.lang === 'es' ? 'es' : 'en';
  let themeTimer;

  function updateControls() {
    const dark = root.dataset.theme === 'dark';
    themeButton.setAttribute('aria-checked', String(dark));
    themeButton.setAttribute('aria-label', language === 'es' ? 'Modo oscuro' : 'Dark mode');
    themeButton.title = language === 'es'
      ? (dark ? 'Cambiar a modo claro' : 'Cambiar a modo oscuro')
      : (dark ? 'Switch to light mode' : 'Switch to dark mode');
    preferences.setAttribute('aria-label', language === 'es' ? 'Preferencias de visualización' : 'Display preferences');
  }

  languageButton.addEventListener('click', () => {
    const target = languageButton.dataset.languageTarget || (language === 'es' ? '/' : '/es/');
    const hash = location.hash || '';
    location.assign(target + hash);
  });

  themeButton.addEventListener('click', () => {
    const next = root.dataset.theme === 'dark' ? 'light' : 'dark';
    clearTimeout(themeTimer);
    root.classList.remove('sunset', 'sunrise');
    if (!reducedMotion.matches) {
      void root.offsetWidth;
      root.classList.add(next === 'dark' ? 'sunset' : 'sunrise');
      themeTimer = setTimeout(() => root.classList.remove('sunset','sunrise'), 900);
    }
    root.dataset.theme = next;
    document.querySelector('meta[name="theme-color"]').content = next === 'dark' ? '#101916' : '#153b31';
    store('cv-theme', next);
    updateControls();
  });

  updateControls();
  preferences.hidden = false;
}
