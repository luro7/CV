import translations from '../translations.js';

const root = document.documentElement;
const reducedMotion = matchMedia('(prefers-reduced-motion: reduce)');
const store = (key, value) => { try { localStorage.setItem(key, value); } catch {} };
const read = key => { try { return localStorage.getItem(key); } catch { return null; } };

export function initPreferences() {
  const languageButton = document.querySelector('.language-toggle');
  const themeButton = document.querySelector('.theme-toggle');
  const status = document.querySelector('#preference-status');
  let language = 'en';
  let changingLanguage = false;
  let themeTimer;
  const originalDescription = document.querySelector('meta[name="description"]').content;
  const walker = document.createTreeWalker(document.body, NodeFilter.SHOW_TEXT, {
    acceptNode(node) {
      return node.textContent.trim() && !node.parentElement.closest('script, style, svg, .preferences, #preference-status')
        ? NodeFilter.FILTER_ACCEPT : NodeFilter.FILTER_REJECT;
    }
  });
  const nodes = [];
  while (walker.nextNode()) {
    const node = walker.currentNode;
    const en = node.textContent;
    const key = en.trim();
    nodes.push({ node, en, es: translations[key] ? en.replace(key, translations[key]) : en });
  }
  const attributes = [...document.querySelectorAll('[aria-label]')]
    .filter(element => !element.closest('.preferences'))
    .map(element => ({ element, en: element.getAttribute('aria-label') }));

  function updateControls() {
    const dark = root.dataset.theme === 'dark';
    themeButton.setAttribute('aria-checked', String(dark));
    const themeLabel = language === 'es' ? 'Modo oscuro' : 'Dark mode';
    themeButton.setAttribute('aria-label', themeLabel);
    themeButton.title = language === 'es' ? (dark ? 'Cambiar a modo claro' : 'Cambiar a modo oscuro') : (dark ? 'Switch to light mode' : 'Switch to dark mode');
    languageButton.setAttribute('aria-label', language === 'en' ? 'Cambiar a español' : 'Switch to English');
    languageButton.title = languageButton.getAttribute('aria-label');
    languageButton.children[0].textContent = language.toUpperCase();
    languageButton.children[1].textContent = language === 'en' ? 'ES' : 'EN';
    document.querySelector('.preferences').setAttribute('aria-label', language === 'es' ? 'Preferencias de visualización' : 'Display preferences');
  }

  function finishLanguage(next) {
    for (const entry of nodes) entry.node.textContent = entry[next];
    language = next;
    root.lang = next;
    for (const {element, en} of attributes) element.setAttribute('aria-label', next === 'es' ? translations[en] || en : en);
    document.title = next === 'es' ? 'Lucas Rosat — Ingeniería de Datos y Automatización con IA' : 'Lucas Rosat — Data Engineering & AI Automation';
    const description = next === 'es' ? 'Lucas Rosat — Analista de Ingeniería de Datos, Ingeniero de Automatización con IA y Desarrollador SQL. Experiencia, aptitudes técnicas y formación.' : originalDescription;
    document.querySelector('meta[name="description"]').content = description;
    document.querySelector('meta[property="og:description"]').content = description;
    document.querySelector('meta[property="og:title"]').content = document.title;
    document.querySelector('meta[property="og:locale"]').content = next === 'es' ? 'es_AR' : 'en_US';
    updateControls();
    store('cv-language', next);
    dispatchEvent(new Event('resize'));
  }

  async function switchLanguage() {
    if (changingLanguage) return;
    const next = language === 'en' ? 'es' : 'en';
    if (reducedMotion.matches) { finishLanguage(next); return; }
    changingLanguage = true;
    languageButton.setAttribute('aria-disabled', 'true');
    document.querySelector('main').setAttribute('aria-busy', 'true');
    // Lock block heights while characters change, so deleting text does not collapse the page.
    const blocks = [...document.querySelectorAll('h1,h2,h3,h4,p,summary,.tags,.sidebar nav a,.document-meta,.footer,.column-title')];
    const heights = blocks.map(element => ({element, value:element.style.minHeight}));
    blocks.forEach(element => { element.style.minHeight = `${element.getBoundingClientRect().height}px`; });
    const start = performance.now();
    const current = language;
    root.classList.add('translating');
    await new Promise(resolve => {
      function frame(now) {
        const elapsed = now - start;
        for (const entry of nodes) {
          const text = elapsed < 190 ? entry[current] : entry[next];
          const amount = elapsed < 190 ? 1 - elapsed / 190 : Math.min(1, (elapsed - 190) / 430);
          entry.node.textContent = Array.from(text).slice(0, Math.floor(Array.from(text).length * amount)).join('');
        }
        if (elapsed < 620 && !reducedMotion.matches) requestAnimationFrame(frame); else resolve();
      }
      requestAnimationFrame(frame);
    });
    finishLanguage(next);
    heights.forEach(({element,value}) => { element.style.minHeight = value; });
    root.classList.remove('translating');
    document.querySelector('main').removeAttribute('aria-busy');
    languageButton.removeAttribute('aria-disabled');
    changingLanguage = false;
    status.textContent = next === 'es' ? 'Idioma cambiado a español.' : 'Language changed to English.';
  }

  languageButton.addEventListener('click', switchLanguage);
  themeButton.addEventListener('click', () => {
    const next = root.dataset.theme === 'dark' ? 'light' : 'dark';
    clearTimeout(themeTimer);
    root.classList.remove('sunset', 'sunrise');
    if (!reducedMotion.matches) {
      // Restart the dusk/dawn transition even on rapid repeated clicks.
      void root.offsetWidth;
      root.classList.add(next === 'dark' ? 'sunset' : 'sunrise');
      themeTimer = setTimeout(() => root.classList.remove('sunset','sunrise'), 900);
    }
    root.dataset.theme = next;
    document.querySelector('meta[name="theme-color"]').content = next === 'dark' ? '#101916' : '#153b31';
    store('cv-theme', next);
    updateControls();
  });
  finishLanguage(read('cv-language') === 'es' ? 'es' : 'en');
  document.querySelector('.preferences').hidden = false;
}
