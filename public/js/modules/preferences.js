import translations from '../translations.js';

const root = document.documentElement;
const reducedMotion = matchMedia('(prefers-reduced-motion: reduce)');
const store = (key, value) => { try { localStorage.setItem(key, value); } catch {} };
const languageScrollKey = 'cv-language-scroll';
const reverseTranslations = Object.fromEntries(
  Object.entries(translations).map(([english, spanish]) => [spanish, english])
);

export function initPreferences() {
  const languageButton = document.querySelector('.language-toggle');
  const themeButton = document.querySelector('.theme-toggle');
  const preferences = document.querySelector('.preferences');
  const main = document.querySelector('main');
  const language = root.lang === 'es' ? 'es' : 'en';
  let themeTimer;
  let changingLanguage = false;

  function saveLanguageScroll(target) {
    try {
      sessionStorage.setItem(languageScrollKey, JSON.stringify({
        path: new URL(target, location.href).pathname,
        y: window.scrollY,
        savedAt: Date.now()
      }));
      return true;
    } catch {
      return false;
    }
  }

  function updateControls() {
    const dark = root.dataset.theme === 'dark';
    themeButton.setAttribute('aria-checked', String(dark));
    themeButton.setAttribute('aria-label', language === 'es' ? 'Modo oscuro' : 'Dark mode');
    themeButton.title = language === 'es'
      ? (dark ? 'Cambiar a modo claro' : 'Cambiar a modo oscuro')
      : (dark ? 'Switch to light mode' : 'Switch to dark mode');
    preferences.setAttribute('aria-label', language === 'es' ? 'Preferencias de visualización' : 'Display preferences');
  }

  function getTransitionEntries() {
    const lookup = language === 'en' ? translations : reverseTranslations;
    const walker = document.createTreeWalker(document.body, NodeFilter.SHOW_TEXT, {
      acceptNode(node) {
        const parent = node.parentElement;
        if (!parent || !node.textContent.trim()) return NodeFilter.FILTER_REJECT;
        if (parent.closest('script,style,svg,.preferences,#preference-status,.command-palette,.engineering-panel')) {
          return NodeFilter.FILTER_REJECT;
        }
        return NodeFilter.FILTER_ACCEPT;
      }
    });

    const entries = [];
    while (walker.nextNode()) {
      const node = walker.currentNode;
      const original = node.textContent;
      const key = original.trim();
      const translated = lookup[key];
      if (!translated || translated === key) continue;

      const leading = original.match(/^\s*/)?.[0] || '';
      const trailing = original.match(/\s*$/)?.[0] || '';
      entries.push({
        node,
        from: key,
        to: translated,
        leading,
        trailing
      });
    }
    return entries;
  }

  function lockTextBlocks() {
    const blocks = [...document.querySelectorAll(
      'h1,h2,h3,h4,p,li,a,button,summary,dt,dd,.document-meta,.footer,.column-title,.skill-trace-status'
    )];
    return blocks.map(element => {
      const previous = element.style.minHeight;
      element.style.minHeight = element.getBoundingClientRect().height + 'px';
      return { element, previous };
    });
  }

  function restoreTextBlocks(locks) {
    for (const { element, previous } of locks) element.style.minHeight = previous;
  }

  function sliceText(value, amount) {
    const characters = Array.from(value);
    return characters.slice(0, Math.max(0, Math.floor(characters.length * amount))).join('');
  }

  async function animateLanguageChange() {
    if (changingLanguage) return;

    const target = languageButton.dataset.languageTarget || (language === 'es' ? '/' : '/es/');
    const activeSection = document.querySelector('.sidebar nav a[aria-current="location"]')?.hash || '';
    const hash = location.hash || activeSection;
    saveLanguageScroll(target);

    if (reducedMotion.matches) {
      location.assign(target + hash);
      return;
    }

    changingLanguage = true;
    languageButton.setAttribute('aria-disabled', 'true');
    main?.setAttribute('aria-busy', 'true');
    root.classList.add('translating');

    const entries = getTransitionEntries();
    const locks = lockTextBlocks();
    const eraseDuration = 180;
    const typeDuration = 430;
    const totalDuration = eraseDuration + typeDuration;
    const start = performance.now();

    await new Promise(resolve => {
      const frame = now => {
        const elapsed = now - start;

        for (const entry of entries) {
          let visible;
          if (elapsed < eraseDuration) {
            visible = sliceText(entry.from, 1 - elapsed / eraseDuration);
          } else {
            visible = sliceText(entry.to, Math.min(1, (elapsed - eraseDuration) / typeDuration));
          }
          entry.node.textContent = entry.leading + visible + entry.trailing;
        }

        if (elapsed < totalDuration) requestAnimationFrame(frame);
        else resolve();
      };

      requestAnimationFrame(frame);
    });

    for (const entry of entries) {
      entry.node.textContent = entry.leading + entry.to + entry.trailing;
    }

    restoreTextBlocks(locks);
    root.classList.remove('translating');
    main?.removeAttribute('aria-busy');
    languageButton.removeAttribute('aria-disabled');

    location.assign(target + hash);
  }

  languageButton.addEventListener('click', animateLanguageChange);

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
